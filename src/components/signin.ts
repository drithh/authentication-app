import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";

const signInFunction = async (
  email: string,
  password: string,
  token: string,
  router: AppRouterInstance
) => {
  try {
    const data = await signIn("credentials", {
      email,
      password,
      recaptcha: token,
      redirect: false,
      callbackUrl: "/profile",
    });
    if (!data?.ok) {
      toast.error(data?.error || "An error occurred");
    } else {
      toast.success("Signed in successfully");
      // redirect to home page
      router.push("/");
    }
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "message" in error) {
      const errorMessage =
        typeof error.message === "string" ? error.message : "An error occurred";
      if (errorMessage === "Failed to construct 'URL': Invalid URL") {
        router.push("/otp");
      }
    }
  }
};

export default signInFunction;
