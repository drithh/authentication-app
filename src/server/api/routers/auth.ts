import { z } from "zod";
import { pwnedPassword } from "~/server/libs/pwned";
import {
  createTRPCRouter,
  publicProcedure,
  // protectedProcedure,
} from "~/server/api/trpc";
import bcrypt from "bcryptjs";

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
          if (password.includes(name)) {
            throw new Error("Password must not contain your name");
          }
          return true;
        })
        .refine(({ password, email }) => {
          if (password.includes(email)) {
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
        },
      });
      return user;
    }),
});
