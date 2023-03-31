import { getServerSession } from "next-auth/next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { GetServerSidePropsContext } from "next/types";
import { useEffect, useState } from "react";
import Layout from "~/components/layout";
import { authOptions } from "~/server/auth";
import { GoTriangleDown } from "react-icons/go";

export default function Page() {
  const [is2FA, setIs2FA] = useState(false);
  const [show2FA, setShow2FA] = useState(false);

  const { data: session } = useSession();
  const router = useRouter();
  // if (!session) {
  // return;
  // }
  useEffect(() => {
    if (!session) {
      router.push("/signin");
    }
  }, [session, router]);

  if (!session) {
    return null;
  }

  return (
    <Layout>
      <h1 className="my-8 mb-8 text-center text-5xl font-bold uppercase tracking-tight text-slate-700">
        Welcome to your account
      </h1>
      <div className="mb-8 flex w-[80%] flex-col items-center justify-center gap-8 place-self-center border-y-2 border-slate-500 p-8">
        <div className="flex w-full place-content-between ">
          <p className="text-justify text-xl  text-slate-700">Name:</p>
          <p className="text-justify text-xl  text-slate-700">
            {session.user.name}
          </p>
        </div>
        <div className="flex w-full place-content-between ">
          <p className="text-justify text-xl text-slate-700">Email:</p>
          <p className="text-justify text-xl text-slate-700">
            {session.user.email}
          </p>
        </div>
        <div className="flex w-full place-content-between ">
          <p className="text-justify text-xl text-slate-700">isVerified:</p>
          {session.user.emailVerified ? (
            <p className="text-justify text-xl text-slate-700">Yes</p>
          ) : (
            <div className="flex flex-col place-items-end">
              <p className="text-justify text-xl  text-slate-700 ">No</p>
              <button className="text-justify  text-slate-700 hover:text-blue-500 hover:underline">
                Resend Verification Email
              </button>
            </div>
          )}
        </div>
        <div className="flex w-full flex-col ">
          <div className="flex w-full place-content-between ">
            <p className="text-justify text-xl text-slate-700">2FA:</p>
            <button
              type="button"
              className=" flex place-items-center"
              onClick={() => setIs2FA(!is2FA)}
            >
              <div className="relative mr-2 inline-block w-10 select-none align-middle transition duration-200 ease-in">
                <input
                  type="checkbox"
                  name="toggle-user-address"
                  id="toggle-user-address"
                  checked={is2FA}
                  onChange={() => setIs2FA(!is2FA)}
                  className={`${
                    is2FA ? "right-0 border-gray-500" : "border-gray-300"
                  } absolute block h-6 w-6 cursor-pointer appearance-none rounded-full border-4  bg-white`}
                />
                <label
                  htmlFor="toggle"
                  className={`${
                    is2FA ? " bg-gray-500" : "bg-gray-300"
                  }  block h-6 cursor-pointer overflow-hidden rounded-full `}
                ></label>
              </div>
            </button>
          </div>

          {is2FA && (
            <div className="my-2 flex w-full flex-col place-content-between gap-y-1 ">
              {/* dropdown qrcode */}
              <button
                className="flex w-full items-center justify-end  gap-x-2 border-b-2 border-b-slate-500 text-right  text-slate-700"
                onClick={() => setShow2FA(!show2FA)}
              >
                <p className="inline-block">Show QR Code</p>
                <GoTriangleDown className="text-xl" />
              </button>
              {show2FA && (
                <p className="h-[40rem] border-2 border-slate-500 text-justify text-xl text-slate-700">
                  {/* {session.user.twoFactorSecret} */}
                  asd
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {
      session: await getServerSession(context.req, context.res, authOptions),
    },
  };
}