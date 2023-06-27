import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
  type User,
} from "next-auth";
import GithubProvider from "next-auth/providers/github";
import TwitterProvider from "next-auth/providers/twitter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import bcrypt from "bcryptjs";
import validateRecaptcha from "../libs/validate-recaptcha";
import { verifyTOTP } from "../libs/totp";
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
      verified: string | null;
      twoFactor: boolean;
      hasPassed2FA: boolean;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    twoFactor: boolean;
    hasPassed2FA: boolean;
    // ...other properties
    // role: UserRole;
  }
}

interface UserSession extends User {
  hasPassed2FA: boolean;
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
    jwt: ({ token, user }) => {
      if (user && user.email && user.name) {
        token.id = user.id;
        token.email = user.email;
        token.username = user.name;
        token.hasPassed2FA = user.hasPassed2FA;
      }
      return token;
    },
    session: async ({ session, token }) => {
      const user = await prisma.user.findUnique({
        where: {
          email: token.email as string,
        },
      });
      if (session?.user?.name && typeof token?.username === "string") {
        const twoFactor = user?.twoFactor || false;
        const hasPassed2FA = (token?.hasPassed2FA as boolean) || !twoFactor;
        session.user.name = token.username;
        session.user.verified = user?.verified?.toString() || null;
        session.user.twoFactor = twoFactor;
        session.user.hasPassed2FA = hasPassed2FA;
      }
      return session;
    },
  },

  pages: {
    signIn: "/signin",
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
        recaptcha: { label: "Recaptcha", type: "text" },
      },
      async authorize(credentials) {
        if (
          !credentials ||
          !credentials.email ||
          !credentials.password ||
          !credentials.recaptcha
        ) {
          throw new Error("Invalid credentials");
        }
        const recaptcha = await validateRecaptcha(credentials.recaptcha);
        if (recaptcha.success === false && env.APP_ENV !== "test") {
          const error = recaptcha["error-codes"]?.at(0) || "";
          throw new Error(`Invalid recaptcha ${error}`);
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
          const sessionUser: UserSession = {
            ...user,
            hasPassed2FA: false,
          };
          return sessionUser;
        } else {
          throw new Error("Invalid password, try again");
        }
      },
    }),
    CredentialsProvider({
      id: "credentials2FA",
      name: "credentials2FA",
      credentials: {
        email: { label: "Email", type: "text" },
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.token) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.email) {
          throw new Error("Email is not registered");
        }
        const inputToken = credentials.token;

        const data = verifyTOTP(user.email, inputToken);
        if (!data) {
          throw new Error("Invalid token");
        }
        const sessionUser: UserSession = {
          ...user,
          hasPassed2FA: true,
        };
        return sessionUser;
      },
    }),

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
