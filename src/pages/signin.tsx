import Button from "~/components/button";
import Input from "~/components/input";
import Layout from "~/components/layout";
import { getCsrfToken, signIn } from "next-auth/react";
import {
  AiOutlineGithub,
  AiOutlineGoogle,
  AiOutlineTwitter,
} from "react-icons/ai";
import AuthButton from "~/components/auth-button";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "~/server/auth";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import signInFunction from "~/components/signin";

export default function SignIn({
  csrfToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await signInFunction(email, password, router);
  };

  return (
    <Layout>
      <h1 className="mb-8 text-center text-5xl font-bold uppercase tracking-tight text-slate-700">
        Sign in to your account
      </h1>
      <form
        method="post"
        onSubmit={(e) => {
          void handleSubmit(e);
        }}
        className="flex w-[40rem] flex-col items-center justify-center gap-8 place-self-center border-y-2 border-slate-500 p-8"
      >
        <div className="mb-4 flex w-full flex-col gap-y-4">
          <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
          <Input
            name="email"
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
        </div>
        <Button type="submit">Sign in</Button>
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
    </Layout>
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
