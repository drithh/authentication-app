import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { api } from "~/utils/api";
import { ReCaptchaProvider } from "next-recaptcha-v3";
import "~/styles/globals.css";
import Layout from "~/components/layout";
import { env } from "~/env.mjs";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Toaster />
      <ReCaptchaProvider reCaptchaKey={env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ReCaptchaProvider>
    </SessionProvider>
  );
};
export { reportWebVitals } from "next-axiom";

export default api.withTRPC(MyApp);
