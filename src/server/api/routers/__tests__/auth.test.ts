import { getCsrfToken } from "next-auth/react";
import { type inferProcedureInput } from "@trpc/server";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { appRouter, type AppRouter } from "~/server/api/root";
import { describe, expect, it, test } from "vitest";
import { env } from "~/env.mjs";
import axios from "axios";
const BASE_URL = env.NEXTAUTH_URL;

describe("Register", () => {
  const ctx = createInnerTRPCContext({ session: null });
  const caller = appRouter.createCaller(ctx);
  const defaultProfile = {
    name: "Cartman",
    email: "cartman@fat.com",
    password: "HahaKewl12,",
    confirmPassword: "HahaKewl12,",
  };

  test("Register a new user", async () => {
    const resultPromise = caller.auth.signUp({
      ...defaultProfile,
    });

    expect(await resultPromise).toMatchObject({
      id: expect.any(String),
      name: defaultProfile.name,
      email: defaultProfile.email,
      password: expect.any(String),
      image: null,
      twoFactor: false,
      verified: null,
    });
  });

  test("Register a new user with a name that shorter than 2 characters", async () => {
    const resultPromise = caller.auth.signUp({
      name: "C",
      email: defaultProfile.email,
      password: defaultProfile.password,
      confirmPassword: defaultProfile.confirmPassword,
    });
    expect(resultPromise).rejects.toThrowError(
      /Name must be at least 2 characters/
    );
  });

  test("Register a new user with an email that is already registered", async () => {
    await caller.auth.signUp({
      ...defaultProfile,
    });
    const resultPromise = caller.auth.signUp({
      ...defaultProfile,
    });
    expect(resultPromise).rejects.toThrowError(/Email already registered/);
  });

  test("Register a new user with invalid email", async () => {
    const resultPromise = caller.auth.signUp({
      name: defaultProfile.name,
      email: "cartmanfat.com",
      password: defaultProfile.password,
      confirmPassword: defaultProfile.confirmPassword,
    });
    expect(resultPromise).rejects.toThrowError(/Email is not valid/);
  });

  test("Register a new user with password that does not match with the confirm password", async () => {
    const resultPromise = caller.auth.signUp({
      name: defaultProfile.name,
      email: defaultProfile.email,
      password: defaultProfile.password,
      confirmPassword: "HahaKewl13,",
    });
    expect(resultPromise).rejects.toThrowError(/Passwords do not match/);
  });

  test("Register a new user with password that does not have a number", async () => {
    const resultPromise = caller.auth.signUp({
      name: defaultProfile.name,
      email: defaultProfile.email,
      password: "HahaKewl,",
      confirmPassword: "HahaKewl,",
    });
    expect(resultPromise).rejects.toThrowError(
      /Password must contain at least one number/
    );
  });

  test("Register a new user with password that does not have a special character", async () => {
    const resultPromise = caller.auth.signUp({
      name: defaultProfile.name,
      email: defaultProfile.email,
      password: "HahaKewl12",
      confirmPassword: "HahaKewl12",
    });
    expect(resultPromise).rejects.toThrowError(
      /Password must contain at least one special character/
    );
  });

  test("Register a new user with password that does not have a lowercase letter", async () => {
    const resultPromise = caller.auth.signUp({
      name: defaultProfile.name,
      email: defaultProfile.email,
      password: "HAHAKEWL12,",
      confirmPassword: "HAHAKEWL12,",
    });
    expect(resultPromise).rejects.toThrowError(
      /Password must contain at least one lowercase letter/
    );
  });

  test("Register a new user with password that does not have a uppercase letter", async () => {
    const resultPromise = caller.auth.signUp({
      name: defaultProfile.name,
      email: defaultProfile.email,
      password: "hahakewl12,",
      confirmPassword: "hahakewl12,",
    });
    expect(resultPromise).rejects.toThrowError(
      /Password must contain at least one uppercase letter/
    );
  });

  test("Register a new user with password that is less than 8 characters", async () => {
    const resultPromise = caller.auth.signUp({
      name: defaultProfile.name,
      email: defaultProfile.email,
      password: "Haha12,",
      confirmPassword: "Haha12,",
    });
    expect(resultPromise).rejects.toThrowError(
      /Password must be at least 8 characters/
    );
  });

  test("Register a new user with password that contains spaces", async () => {
    const resultPromise = caller.auth.signUp({
      name: defaultProfile.name,
      email: defaultProfile.email,
      password: "Haha Kewl12,",
      confirmPassword: "Haha Kewl12,",
    });

    expect(resultPromise).rejects.toThrowError(
      /Password must not contain spaces/
    );
  });

  test("Register a new user with password that contains email", async () => {
    const resultPromise = caller.auth.signUp({
      name: defaultProfile.name,
      email: "coba@email.com",
      password: `${defaultProfile.password}${"coba@email.com"}`,
      confirmPassword: `${defaultProfile.password}${"coba@email.com"}`,
    });
    expect(resultPromise).rejects.toThrowError(
      /Password must not contain your email/
    );
  });

  test("Register a new user with password that contains name", async () => {
    const resultPromise = caller.auth.signUp({
      name: defaultProfile.name,
      email: defaultProfile.email,
      password: `${defaultProfile.password}${defaultProfile.name}`,
      confirmPassword: `${defaultProfile.password}${defaultProfile.name}`,
    });
    expect(resultPromise).rejects.toThrowError(
      /Password must not contain your name/
    );
  });

  test("Register a new user with weak password", async () => {
    const resultPromise = caller.auth.signUp({
      name: defaultProfile.name,
      email: defaultProfile.email,
      password: "Password123,",
      confirmPassword: "Password123,",
    });
    expect(resultPromise).rejects.toThrowError(
      /Password too weak, please try another/
    );
  });
});

describe("Login", async () => {
  const ctx = createInnerTRPCContext({ session: null });
  const caller = appRouter.createCaller(ctx);
  const defaultProfile = {
    name: "Cartman",
    email: "cartman@fat.com",
    password: "HahaKewl12,",
    confirmPassword: "HahaKewl12,",
  };
  // const token = await getCsrfToken();
  const token =
    "9df40ead9e6c664889c9bf857647e291f7c7cee2c46ff0a5ab7f2e61b02f4091";
  test("Login with correct email and password", async () => {
    await caller.auth.signUp({
      ...defaultProfile,
    });
    const response = await axios.post(
      `${BASE_URL}/api/auth/callback/credentials?`,
      {
        email: defaultProfile.email,
        password: defaultProfile.password,
        callbackUrl: "/profile",
        json: true,
        recaptchaToken: "recaptchaToken",
        csrfToken: token,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: `next-auth.csrf-token=9df40ead9e6c664889c9bf857647e291f7c7cee2c46ff0a5ab7f2e61b02f4091%7Cd6edf4cc46e01fe822445153a7988eab9f2ffe480d76fb529f40d9af346c89a0; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000%2Fprofile`,
        },
      }
    );

    expect(response.data).toEqual({
      token: token,
    });
  });
});
