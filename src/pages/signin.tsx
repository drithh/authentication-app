import Button from "~/components/button";
import Input from "~/components/input";
import Layout from "~/components/layout";
import {
  AiOutlineGithub,
  AiOutlineGoogle,
  AiOutlineTwitter,
} from "react-icons/ai";
import type { ReactNode } from "react";
export default function AuthShowcase() {
  return (
    <Layout>
      <h1 className="mb-8 text-center text-5xl font-bold uppercase tracking-tight text-slate-700">
        Sign in to your account
      </h1>
      <div className="flex w-[40rem] flex-col items-center justify-center gap-8 place-self-center border-y-2 border-slate-500 p-8">
        <Input name="email" label="Email" />
        <Input name="password" label="Password" type="password" />
        <Button type="submit">Sign in</Button>
        <div className="relative flex h-[2px] w-full place-content-center place-items-center bg-slate-200">
          <div className="absolute bg-white px-4">Or continue with</div>
        </div>
        <div className="oauth flex w-full flex-row gap-x-4">
          <AuthButton icon={<AiOutlineGoogle className="text-2xl" />} />
          <AuthButton icon={<AiOutlineGithub className="text-2xl" />} />
          <AuthButton icon={<AiOutlineTwitter className="text-2xl" />} />
        </div>
      </div>
    </Layout>
  );
}

interface AuthButton {
  icon: ReactNode;
}

const AuthButton = ({ icon }: AuthButton) => {
  return (
    <Button>
      <div className="flex place-content-center">{icon}</div>
    </Button>
  );
};
