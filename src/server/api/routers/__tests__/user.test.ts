import { type inferProcedureInput } from "@trpc/server";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { appRouter, type AppRouter } from "~/server/api/root";
import { describe, expect, it, test } from "vitest";

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
});

// describe("User", () => {
//   describe("register", () => {
//     it("should create a new user", async () => {
//       const user = {
//         id: "1",
//         name: "Rich",
//         email: "Rich@gmail.com",
//       };
//       const caller = appRouter.createCaller({
//         session: null,
//         prisma,
//       });

//       const result = await caller.auth.signUp({
//         name: "Cartman",
//         email: "cartman@fat.com",
//         password: "HahaKewl12,",
//         confirmPassword: "HahaKewl12,",
//       });

//       expect(result).toEqual({
//         id: expect.any(String),
//         name: "Cartman",
//         email: "cartman@fat.com",
//         password: expect.any(String),
//         image: null,
//         twoFactor: false,
//         verified: null,
//       });
//       // curl 'http://localhost:3000/api/trpc/auth.signUp?batch=1' \
//       // --data-raw '{"0":{"json":{"name":"jesicajane","email":"Kenapa@Kenapa.com","password":"Asdas0212.","confirmPassword":"Asdas0212."}}}' \

//       // await supertest(AppRouter)
//       //   .post("/api/trpc/auth.signUp")
//       //   .send({
//       //     0: {
//       //       json: {
//       //         name: "Cartman",
//       //         email: "Cartman@fat.com",
//       //         password: "HahaKewl12,",
//       //         confirmPassword: "HahaKewl12,",
//       //       },
//       //     },
//       //   });
//     });
//   });
// });
