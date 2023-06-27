# Authentication App

This is a simple authentication app built with the [T3 Stack](https://create.t3.gg/).

## About

Within this application, users are provided with the capability to conduct simulated penetration tests on the authentication system. The simulation is facilitated through the utilization of tools such as Hydra or SQLMap. However, it should be noted that Hydra only supports form or parameter-based testing, rendering it unsuitable for brute-forcing the API. To address this limitation, a straightforward server has been developed within the `express` folder to emulate the API functionality.

To initiate the server, simply execute the command "node express". Subsequently, an Express server will commence operation. To run the Hydra test, execute the command `hydra -L <username> -t 64 -P <password> localhost -s 3001 http-post-form "/login:email=^USER^&password=^PASS^:S=ber`. The Hydra test will then commence, and the results will be displayed upon completion.

Specifically, for SQLMap testing purposes, an endpoint has been established within the `src/server/api/routers/auth.ts` file. This particular endpoint is denoted as `unsafeSignIn` and serves as a suitable entry point for SQLMap experimentation. To initiate the SQLMap test, execute the command `sqlmap -u "http://localhost:3000/api/trpc/auth.unsafeSignIn?batch=1" --data '{"0":{"json":{"email":"test@test.com","password":"Siapa12,"}}}' --method POST -D public -a`. The SQLMap test will then commence, and the results will be displayed upon completion.

## Live Demo

https://auth.adriel.bio

## Features

- Credential Sign In
- Sign in with third-party providers (Google, GitHub)
- Email verification
- Two-factor authentication with TOTP
- Common password validation
- Google reCAPTCHA v3
- Api Rate Limiting

## Activity Diagram

### Sign In

![Sign In](signin.png)

### Sign Up

![Sign Up](signup.png)
