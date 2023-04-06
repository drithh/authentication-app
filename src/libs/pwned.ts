import crypto from "crypto";

const PREFIX_LENGTH = 5;
const API_URL = "https://api.pwnedpasswords.com/range/";

export const pwnedPassword = async (password: string) => {
  const hashedPassword = crypto
    .createHash("sha1")
    .update(password)
    .digest("hex");
  const hashedPasswordPrefix = hashedPassword.slice(0, PREFIX_LENGTH);
  const hashedPasswordSuffix = hashedPassword.slice(PREFIX_LENGTH);
  const result = await fetch(API_URL + hashedPasswordPrefix);
  if (!result.ok) {
    return 0;
  }
  const resultText = await result.text();
  const found =
    resultText
      .split("\n")
      .map((line) => line.split(":"))
      .filter((filtered) => filtered[0]?.toLowerCase() === hashedPasswordSuffix)
      .map((mapped) => Number(mapped[1]))
      .shift() || 0;
  return found;
};
