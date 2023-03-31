import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import GithubProvider from "next-auth/providers/github";
import TwitterProvider from "next-auth/providers/twitter";
import GoogleProvider from "next-auth/providers/google";
// import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import bcrypt from "bcryptjs";
/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      emailVerified: Date | null;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // session({ session, user }) {
    //   console.log("session callback", { session, user });
    //   if (session.user) {
    //     session.user.id = user.id;
    //     // session.user.role = user.role; <-- put other properties on the session here
    //   }
    //   return session;
    // },

    // jwt({ token, user }) {
    //   console.log("jwt callback", { token, user });
    //   return { ...token, ...user };
    // },

    jwt: ({ token, user }) => {
      if (user && user.email && user.name) {
        token.id = user.id;
        token.email = user.email;
        token.username = user.name;
      }
      // console.table(token);
      // console.table(user);
      return token;
    },
    session({ session, token }) {
      if (session?.user?.name && typeof token?.username === "string") {
        session.user.name = token.username;
      }
      // console.table(session);
      // console.table(token);
      return session;
    },
  },

  pages: {
    signIn: "/signin",
    verifyRequest: "/verify-request", // (used for check email message)
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    }),
    TwitterProvider({
      clientId: env.TWITTER_CLIENT_ID,
      clientSecret: env.TWITTER_CLIENT_SECRET,
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.password) {
          return null;
        }
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          throw new Error("Email is not registered");
        }
        // compare password with bcrypt
        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (isPasswordCorrect) {
          return user;
        } else {
          throw new Error("Invalid password, try again");
        }
      },
    }),

    // EmailProvider({
    //   server: {
    //     host: env.EMAIL_SERVER_HOST,
    //     port: env.EMAIL_SERVER_PORT,
    //     auth: {
    //       user: env.EMAIL_SERVER_USER,
    //       pass: env.EMAIL_SERVER_PASSWORD,
    //     },
    //   },
    //   from: env.EMAIL_FROM,
    // }),

    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  secret: env.NEXTAUTH_SECRET,
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
