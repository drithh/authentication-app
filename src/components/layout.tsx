import Head from "next/head";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { type PropsWithChildren, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";

const Layout = (props: PropsWithChildren) => {
  const router = useRouter();
  const { data: sessionData } = useSession();
  // check if 2FA is enabled
  useEffect(() => {
    const hasPassed2FA = sessionData?.user?.hasPassed2FA;
    if (router.pathname === "/otp" || hasPassed2FA !== false) return;
    toast.error("Please verify your account");
    void router.push("/otp");
  }, [router, sessionData]);
  // if not, redirect to 2FA page

  return (
    <>
      <Head>
        <title>Authentication App</title>
        <meta
          name="description"
          content="Example of authentication with Next.js"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col bg-white pt-4 font-body">
        <header className="w-full border-y-2 border-slate-500">
          <nav className="flex place-content-between p-4 text-2xl font-bold uppercase tracking-tighter text-slate-700">
            <Link href="/" className="hover:text-blue-500 hover:underline">
              Authentication App
            </Link>
            <div className="flex gap-6">
              {sessionData ? (
                <Link
                  className="uppercase hover:text-blue-500 hover:underline"
                  href="/profile"
                >
                  Profile
                </Link>
              ) : (
                <>
                  <button
                    className="uppercase hover:text-blue-500 hover:underline"
                    onClick={() => void signIn()}
                  >
                    Sign in
                  </button>
                  <Link
                    className="uppercase hover:text-blue-500 hover:underline"
                    href="/signup"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </header>
        <main className="my-auto flex h-full flex-col items-center justify-center">
          {props.children}
        </main>
        <footer className="bottom-0 w-full border-t-2 border-slate-500">
          <div className="flex flex-col items-center justify-center gap-4 p-4 text-sm text-slate-700">
            <p>
              Made with{" "}
              <span role="img" aria-label="love">
                💀
              </span>{" "}
              by{" "}
              <Link
                className="hover:text-blue-500 hover:underline"
                href="https://github.com/drithh"
                target="_blank"
              >
                drithh
              </Link>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Layout;
