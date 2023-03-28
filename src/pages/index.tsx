import { type NextPage } from "next";
import Layout from "~/components/layout";

const Home: NextPage = () => {
  return (
    <Layout>
      <div className="mt-[-5rem] flex h-full w-full flex-col place-content-center place-self-start">
        <h1 className="mb-8 w-full text-center text-5xl font-bold uppercase tracking-tight text-slate-700">
          Authentication App
        </h1>
        <div className="flex w-[80%] flex-col items-center justify-center gap-8 place-self-center border-y-2 border-slate-500 p-8">
          <p className=" text-justify text-xl leading-[3rem] text-slate-700">
            This is a simple authentication app to demonstrate advanced security
            measures that can protect your online accounts. This app uses a
            combination of two-factor authentication (2FA) with time based
            one-time passwords (TOTP) and email verification to ensure the
            security and authenticity of your account.
          </p>
          <p className=" text-justify text-xl leading-[3rem] text-slate-700">
            Try it out by signing up for an account and then signing in to your
            account.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
