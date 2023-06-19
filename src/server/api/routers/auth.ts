import { protectedProcedure } from "./../trpc";
import { z } from "zod";
import { pwnedPassword } from "~/libs/pwned";
import {
  createTRPCRouter,
  publicProcedure,
  // protectedProcedure,
} from "~/server/api/trpc";
import bcrypt from "bcryptjs";
import { getVerificationToken, sendEmail } from "~/libs/email";
import { env } from "~/env.mjs";
import jwt from "jsonwebtoken";
import { createTOTP, verifyTOTP } from "~/libs/totp";
import { User } from "@prisma/client";

export const authRouter = createTRPCRouter({
  signUp: publicProcedure
    .input(
      z
        .object({
          name: z.string().refine((name) => {
            if (name.length < 2) {
              throw new Error("Name must be at least 2 characters");
            }
            if (name.length > 255) {
              throw new Error("Name must be less than 255 characters");
            }
            return true;
          }),
          email: z.string().refine((email) => {
            // check if email is valid
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
              throw new Error("Email is not valid");
            }

            if (email.length < 2) {
              throw new Error("Email must be at least 2 characters");
            }
            if (email.length > 255) {
              throw new Error("Email must be less than 255 characters");
            }
            return true;
          }),
          password: z.string().refine((password) => {
            if (password.length < 8) {
              throw new Error("Password must be at least 8 characters");
            }
            if (password.length > 255) {
              throw new Error("Password must be less than 255 characters");
            }

            if (!/[a-z]/.test(password)) {
              throw new Error(
                "Password must contain at least one lowercase letter"
              );
            }
            if (!/[A-Z]/.test(password)) {
              throw new Error(
                "Password must contain at least one uppercase letter"
              );
            }
            if (!/[0-9]/.test(password)) {
              throw new Error("Password must contain at least one number");
            }
            if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
              throw new Error(
                "Password must contain at least one special character"
              );
            }
            if (password.includes(" ")) {
              throw new Error("Password must not contain spaces");
            }
            return true;
          }),
          confirmPassword: z.string().min(8).max(255),
        })
        .refine(({ password, confirmPassword }) => {
          if (password !== confirmPassword) {
            throw new Error("Passwords do not match");
          }
          return true;
        })
        .refine(({ password, name }) => {
          if (password.toLowerCase().includes(name.toLowerCase())) {
            throw new Error("Password must not contain your name");
          }
          return true;
        })
        .refine(({ password, email }) => {
          // check if password contains some part of the email
          const emailParts = email.split("@");
          const emailName = emailParts[0] || "";

          if (password.toLowerCase().includes(emailName.toLowerCase())) {
            throw new Error("Password must not contain your email");
          }
          return true;
        })
    )
    .mutation(async ({ input, ctx }) => {
      // check if the user already exists
      const registeredUser = await ctx.prisma.user.findUnique({
        where: {
          email: input.email,
        },
      });
      if (registeredUser) {
        throw new Error("Email already registered");
      }
      const pwned = await pwnedPassword(input.password);
      if (pwned > 0) {
        throw new Error("Password too weak, please try another");
      }

      // hash the password
      const hashedPassword = await bcrypt.hash(input.password, 10);

      const user = await ctx.prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
          verified: null,
        },
      });

      const verificationToken = getVerificationToken(user);

      await sendEmail(
        input.email,
        input.name,
        `${env.NEXTAUTH_URL}/verify?token=${verificationToken}`,
        "Welcome to the app"
      );

      return user;
    }),
  resendVerificationEmail: publicProcedure
    .input(
      z.object({
        email: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          email: input.email,
        },
      });
      if (!user) {
        throw new Error("User not found");
      }
      if (user.verified) {
        throw new Error("Email already verified");
      }

      const verificationToken = getVerificationToken(user);

      await sendEmail(
        input.email,
        user.name,
        `${env.NEXTAUTH_URL}/verify?token=${verificationToken}`,
        "Welcome to the app"
      );
      return "Email sent";
    }),
  verify: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { email } = jwt.verify(input.token, `${env.NEXTAUTH_SECRET}`) as {
        email: string;
      };
      const user = await ctx.prisma.user.update({
        where: {
          email,
        },
        data: {
          verified: new Date(),
        },
      });

      return user;
    }),
  getTOTPUrl: publicProcedure
    .input(
      z.object({
        email: z.string(),
      })
    )
    .query(({ input }) => {
      return createTOTP(input.email);
    }),
  toggleTOTP: protectedProcedure
    .input(z.object({}))
    .mutation(async ({ ctx }) => {
      const { email } = ctx.session.user;
      if (!email) throw new Error("Not logged in");
      const user = await ctx.prisma.user.findUnique({
        where: {
          email,
        },
      });
      const twoFactor = user?.twoFactor ?? false;
      const updatedUser = await ctx.prisma.user.update({
        where: {
          email,
        },
        data: {
          twoFactor: !twoFactor,
        },
      });

      return updatedUser;
    }),
  verifyTOTP: protectedProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      const user = ctx.session.user;
      if (!user || !user.email) {
        throw new Error("Email is not registered");
      }
      const inputToken = input.token;

      const data = verifyTOTP(user.email, inputToken);
      if (!data) {
        throw new Error("Invalid token");
      }
      return true;
    }),
  unsafeSignIn: publicProcedure
    .input(
      z.object({
        email: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const users = (await ctx.prisma.$queryRawUnsafe(
        `SELECT * FROM "User" WHERE email = '${input.email}'`
      )) as User[];
      if (users.length === 0) {
        throw new Error("Invalid credentials");
      }
      const user = users[0];
      if (!user) {
        throw new Error("Invalid credentials");
      }
      const passwordMatch = await bcrypt.compare(
        input.password,
        user.password ?? ""
      );

      if (!passwordMatch) {
        throw new Error("Invalid credentials");
      }

      return {
        message: "Logged in",
      };
    }),
});
