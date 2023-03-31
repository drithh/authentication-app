import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";

const signInFunction = async (
  email: string,
  password: string,
  token: string,
  router: AppRouterInstance
) => {
  const data = await signIn("credentials", {
    email,
    password,
    recaptcha: token,
    redirect: false,
    callbackUrl: "/",
  });
  if (!data?.ok) {
    toast.error(data?.error || "An error occurred");
  } else {
    toast.success("Signed in successfully");
    // redirect to home page
    router.push("/");
  }
};

export default signInFunction;
