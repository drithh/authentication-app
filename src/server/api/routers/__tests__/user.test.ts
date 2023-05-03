import { type inferProcedureInput } from "@trpc/server";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { appRouter, type AppRouter } from "~/server/api/root";
import { expect, test } from "vitest";

test("register", async () => {
  const ctx = await createInnerTRPCContext({ session: null });
  const caller = appRouter.createCaller(ctx);

  const result = await caller.auth.signUp({
    name: "Cartman",
    email: "cartman@fat.com",
    password: "HahaKewl12,",
    confirmPassword: "HahaKewl12,",
  });

  expect(result).toMatchObject({
    id: expect.any(String),
    name: "Cartman",
    email: "cartman@fat.com",
    password: expect.any(String),
    image: null,
    twoFactor: false,
    verified: null,
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
