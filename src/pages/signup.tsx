import Button from "~/components/button";
import Input from "~/components/input";
import toast from "react-hot-toast";
import {
  AiOutlineGithub,
  AiOutlineGoogle,
  AiOutlineTwitter,
} from "react-icons/ai";
import { api } from "~/utils/api";
import { useState } from "react";
import { getCsrfToken, signIn } from "next-auth/react";
import { getServerSession } from "next-auth";
import type { GetServerSidePropsContext } from "next";
import AuthButton from "~/components/auth-button";
import { authOptions } from "~/server/auth";
import { useRouter } from "next/navigation";
import signInFunction from "~/components/signin";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const signUp = api.auth.signUp.useMutation();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    signUp.mutate(
      { name, email, password, confirmPassword },
      {
        onError: (error) => {
          toast.error(error.message);
        },
        onSuccess: () =>
          void (async () => {
            toast.success("Account created successfully");
            toast.success("Check your email for a confirmation link");

            await signInFunction(email, password, router);
          })(),
      }
    );
  };

  return (
    <>
      <h1 className="mb-8 text-center text-5xl font-bold uppercase tracking-tight text-slate-700">
        Sign up for an account
      </h1>
      <form
        method="post"
        onSubmit={handleSubmit}
        className="flex w-[40rem] flex-col items-center justify-center gap-8 place-self-center border-y-2 border-slate-500 p-8"
      >
        <div className="mb-4 flex w-full flex-col gap-y-4">
          <Input
            name="name"
            label="Name"
            value={name}
            onChange={(e) => setName((e.target as HTMLInputElement).value)}
          />
          <Input
            name="email"
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
          />
          <Input
            name="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
          />
          <Input
            name="password"
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword((e.target as HTMLInputElement).value)
            }
          />
        </div>
        <Button type="submit">Sign up</Button>
        <div className="relative flex h-[2px] w-full place-content-center place-items-center bg-slate-200">
          <div className="absolute bg-white px-4">Or continue with</div>
        </div>
        <div className="oauth flex w-full flex-row gap-x-4">
          <AuthButton
            icon={<AiOutlineGoogle className="text-2xl" />}
            onClick={() => void signIn("google")}
          />
          <AuthButton
            icon={<AiOutlineGithub className="text-2xl" />}
            onClick={() => void signIn("github")}
          />
          <AuthButton
            icon={<AiOutlineTwitter className="text-2xl" />}
            onClick={() => void signIn("twitter")}
          />
        </div>
      </form>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const csrfToken = await getCsrfToken(context);
  const session = await getServerSession(context.req, context.res, authOptions);

  // If the user is already logged in, redirect.
  // Note: Make sure not to redirect to the same page
  // To avoid an infinite loop!
  if (session) {
    return { redirect: { destination: "/" } };
  }

  return {
    props: { csrfToken },
  };
}
