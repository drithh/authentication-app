import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { toast } from "react-hot-toast";
import { useRef } from "react";
import { getSession } from "next-auth/react";

export default function Verify() {
  const router = useRouter();
  const mutated = useRef(false);
  const verify = api.auth.verify.useMutation();
  const { token } = router.query;

  if (token && !mutated.current) {
    mutated.current = true;
    console.log("mutating");
    verify.mutate(
      { token: token as string },
      {
        onError: (error) => {
          toast.error(error.message);
        },
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSuccess: async () => {
          toast.success("Account verified successfully");
          await getSession();
          await router.push("/profile");
        },
      }
    );
  }

  return (
    <div>
      <h1 className="mb-8 text-center text-5xl font-bold uppercase tracking-tight text-slate-700">
        Verifying account
      </h1>
      {!token && (
        <p className="text-center text-slate-500">
          No verification token provided
        </p>
      )}
    </div>
  );
}
