import { env } from "~/env.mjs";

interface ReCaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  score?: number;
  action?: string;
  "error-codes"?: string[];
}

const validateRecaptcha = (token: string) =>
  fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `secret=${env.RECAPTCHA_SECRET_KEY}&response=${token}`,
  }).then((reCaptchaRes) => reCaptchaRes.json() as Promise<ReCaptchaResponse>);

export default validateRecaptcha;
