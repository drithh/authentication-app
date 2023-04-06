import { env } from "~/env.mjs";
import * as OTPAuth from "otpauth";
const getTOTP = (email: string) => {
  const secretString = env.NEXTAUTH_SECRET + email;
  const secret = OTPAuth.Secret.fromUTF8(secretString);
  const token = new OTPAuth.TOTP({
    issuer: "Cie nyoba",
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: secret,
  });
  return token;
};

export const createTOTP = (email: string) => {
  const totp = getTOTP(email);
  return totp.toString();
};

export const verifyTOTP = (email: string, token: string) => {
  const totp = getTOTP(email);
  const delta = totp.validate({ token, window: 10 });
  // if between -1 and 0, it's valid
  if (delta === null) {
    return false;
  }
  const isValid = delta >= -1 && delta <= 0;
  return isValid;
};
