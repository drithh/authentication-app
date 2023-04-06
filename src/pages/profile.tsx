import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { GetServerSidePropsContext } from "next/types";
import { useEffect, useState } from "react";
import { getServerAuthSession } from "~/server/auth";
import { GoTriangleDown } from "react-icons/go";
import { type NextPage } from "next";
import Button from "~/components/button";
import { signOut } from "next-auth/react";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { QRCodeSVG } from "qrcode.react";

dayjs.extend(relativeTime);

const Profile: NextPage = () => {
  const [is2FA, setIs2FA] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const resendVerificationEmail =
    api.auth.resendVerificationEmail.useMutation();
  const { data: session } = useSession();
  const router = useRouter();
  const [otpURL, setOtpURL] = useState("");
  const mutateTOTP = api.auth.toggleTOTP.useMutation();
  api.auth.getTOTPUrl.useQuery(
    {
      email: session?.user.email || "",
    },
    {
      enabled: is2FA && !!session?.user.email,
      onSuccess: (data) => {
        setOtpURL(data);
      },
    }
  );

  useEffect(() => {
    if (!session) {
      router.push("/signin");
    }
    if (session) {
      setIs2FA(session.user.twoFactor || false);
    }
  }, [session, router]);
  const toggle2FA = () => {
    mutateTOTP.mutate(
      {},
      {
        onError: (error) => {
          toast.error(error.message);
        },
        onSuccess: () => {
          const message = is2FA ? "2FA disabled" : "2FA enabled";
          setIs2FA(!is2FA);
          toast.success(message);
        },
      }
    );
  };

  if (!session) {
    return null;
  }

  const resendEmail = () => {
    const email = session.user.email;
    if (!email) {
      toast.error("No email found");
      return;
    }
    resendVerificationEmail.mutate(
      {
        email,
      },
      {
        onError: (error) => {
          toast.error(error.message);
        },
        onSuccess: () => {
          toast.success("Verification email sent");
        },
      }
    );
  };

  return (
    <>
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
          <p className="text-justify text-xl text-slate-700">Verified At:</p>
          {session.user.verified ? (
            <p className="text-justify text-xl text-slate-700">
              {dayjs(session.user.verified).fromNow()}
            </p>
          ) : (
            <div className="flex flex-col place-items-end">
              <p className="text-justify text-xl  text-slate-700 ">No</p>
              <button
                className="text-justify  text-slate-700 hover:text-blue-500 hover:underline"
                onClick={resendEmail}
              >
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
              onClick={toggle2FA}
            >
              <div className="relative mr-2 inline-block w-10 select-none align-middle transition duration-200 ease-in">
                <input
                  type="checkbox"
                  name="toggle-user-address"
                  id="toggle-user-address"
                  checked={is2FA}
                  readOnly
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
                <div className="w-full border-2 border-slate-500 p-8 text-justify text-xl text-slate-700">
                  <QRCodeSVG value={otpURL} width={"100%"} height={"100%"} />
                </div>
              )}
            </div>
          )}
        </div>
        <Button type="button" onClick={() => void signOut()}>
          Sign out
        </Button>
      </div>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {
      session: await getServerAuthSession(context),
    },
  };
}

export default Profile;
