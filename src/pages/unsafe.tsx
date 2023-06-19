import Button from "~/components/button";
import Input from "~/components/input";
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
import { getServerAuthSession } from "~/server/auth";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import signInFunction from "~/components/signin";
import { useReCaptcha } from "next-recaptcha-v3";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
export default function SignIn({
  csrfToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const unsafeSignin = api.auth.unsafeSignIn.useMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { executeRecaptcha } = useReCaptcha();
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const token = await executeRecaptcha("form_submit");
      const result = unsafeSignin.mutate(
        {
          email,
          password,
        },
        {
          onError: (error) => {
            toast.error(error.message);
          },
          onSuccess: () => {
            toast.success("Signed in successfully");
          },
        }
      );
    },
    [executeRecaptcha, email, password, router]
  );

  return (
    <>
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
      </form>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const csrfToken = await getCsrfToken(context);
  const session = await getServerAuthSession(context);

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
