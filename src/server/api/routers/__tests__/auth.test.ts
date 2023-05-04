import { getCSRFCookie } from "./../../../../tests/helpers/util";
import { getCsrfToken, signIn, getSession } from "next-auth/react";
import { type inferProcedureInput } from "@trpc/server";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { appRouter, type AppRouter } from "~/server/api/root";
import { describe, expect, it, test } from "vitest";
import { env } from "~/env.mjs";
import axios from "axios";
import { getServerSession } from "next-auth";
import { getServerAuthSession } from "~/server/auth";
import { request } from "~/tests/helpers/util";
import { getTOTPValue } from "~/libs/totp";
import { getVerificationToken } from "~/libs/email";
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

  const cookie = (await getCSRFCookie()) ?? "";
  const csrf = cookie.split("next-auth.csrf-token=")[1]?.split("%7")[0];

  const defaultOptions = {
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookie,
    },
  } as RequestInit;

  const defaultBody = {
    callbackUrl: "/profile",
    json: true,
    recaptcha: "recaptchaToken",
    csrfToken: csrf,
  };

  test("Login with correct email and password", async () => {
    await caller.auth.signUp({
      ...defaultProfile,
    });

    const response = await request("api/auth/callback/credentials?", {
      ...defaultOptions,
      // @ts-expect-error
      body: new URLSearchParams({
        email: defaultProfile.email,
        password: defaultProfile.password,
        ...defaultBody,
      }),
    });

    expect(await response.json()).toEqual({
      url: `${BASE_URL}/profile`,
    });
  });

  test("Login with incorrect email", async () => {
    await caller.auth.signUp({
      ...defaultProfile,
    });

    const response = await request("api/auth/callback/credentials?", {
      ...defaultOptions,
      // @ts-expect-error
      body: new URLSearchParams({
        email: "cartman@notfat.com",
        password: defaultProfile.password,
        ...defaultBody,
      }),
    });

    expect(await response.json()).toEqual({
      url: `${BASE_URL}/api/auth/error?error=Email%20is%20not%20registered`,
    });
  });

  test("Login with incorrect password", async () => {
    await caller.auth.signUp({
      ...defaultProfile,
    });

    const response = await request("api/auth/callback/credentials?", {
      ...defaultOptions,
      // @ts-expect-error
      body: new URLSearchParams({
        email: defaultProfile.email,
        password: "HahaKewl123,",
        ...defaultBody,
      }),
    });

    expect(await response.json()).toEqual({
      url: `${BASE_URL}/api/auth/error?error=Invalid%20password%2C%20try%20again`,
    });
  });
});

describe("Two Factor Authentication", async () => {
  const defaultProfile = {
    name: "Cartman",
    email: "cartman@fat.com",
    password: "HahaKewl12,",
    confirmPassword: "HahaKewl12,",
  };
  const publicCtx = createInnerTRPCContext({
    session: null,
  });
  const publicCaller = appRouter.createCaller(publicCtx);

  const protectedCtx = createInnerTRPCContext({
    session: {
      user: {
        id: "1",
        name: defaultProfile.name,
        email: defaultProfile.email,
        image: null,
        verified: null,
        hasPassed2FA: false,
        twoFactor: true,
      },
      expires: "2021-08-12T08:00:00.000Z",
    },
  });
  const protectedCaller = appRouter.createCaller(protectedCtx);

  test("Toggle 2FA", async () => {
    await publicCaller.auth.signUp({
      ...defaultProfile,
    });
    const response = protectedCaller.auth.toggleTOTP({});

    test("Get 2FA QR Code", async () => {
      const response = protectedCaller.auth.getTOTPUrl({
        email: defaultProfile.email,
      });
      expect(await response).toMatchObject({
        url: expect.stringContaining("otpauth://totp/"),
      });
    });

    expect(await response).toMatchObject({
      id: expect.any(String),
      name: defaultProfile.name,
      email: defaultProfile.email,
      password: expect.any(String),
      image: null,
      verified: null,
      twoFactor: true,
    });
  });

  test("Toggle 2FA without session", async () => {
    const response = publicCaller.auth.toggleTOTP({});
    expect(response).rejects.toThrowError(/UNAUTHORIZED/);
  });

  test("Verify 2FA with correct code", async () => {
    const totp = getTOTPValue(defaultProfile.email);

    const response = protectedCaller.auth.verifyTOTP({
      token: totp,
    });

    expect(await response).toEqual(true);
  });

  test("Verify 2FA with incorrect code", async () => {
    const response = protectedCaller.auth.verifyTOTP({
      token: `123456`,
    });

    expect(response).rejects.toThrowError(/Invalid token/);
  });
});

describe("Account Verification", async () => {
  const defaultProfile = {
    name: "Cartman",
    email: "cartman@fat.com",
    password: "HahaKewl12,",
    confirmPassword: "HahaKewl12,",
  };

  const publicCtx = createInnerTRPCContext({
    session: null,
  });
  const publicCaller = appRouter.createCaller(publicCtx);

  const protectedCtx = createInnerTRPCContext({
    session: {
      user: {
        id: "1",
        name: defaultProfile.name,
        email: defaultProfile.email,
        image: null,
        verified: null,
        hasPassed2FA: false,
        twoFactor: true,
      },
      expires: "2021-08-12T08:00:00.000Z",
    },
  });
  const protectedCaller = appRouter.createCaller(protectedCtx);

  test("Send verification email", async () => {
    await publicCaller.auth.signUp({
      ...defaultProfile,
    });

    const response = protectedCaller.auth.resendVerificationEmail({
      email: defaultProfile.email,
    });

    expect(await response).toEqual("Email sent");
  });

  test("Verify account with correct code", async () => {
    await publicCaller.auth.signUp({
      ...defaultProfile,
    });

    const code = getVerificationToken({
      id: "1",
      email: defaultProfile.email,
    });

    const response = publicCaller.auth.verify({
      token: code,
    });

    expect(await response).toMatchObject({
      id: expect.any(String),
      name: defaultProfile.name,
      email: defaultProfile.email,
      image: null,
      password: expect.any(String),
      verified: expect.any(Date),
      emailVerified: null,
      twoFactor: false,
    });
  });

  test("Verify account with incorrect code", async () => {
    const response = publicCaller.auth.verify({
      token: "123",
    });

    expect(response).rejects.toThrowError(/jwt malformed/);
  });
});
