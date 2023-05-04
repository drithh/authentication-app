import { env } from "~/env.mjs";

const BASE_URL = env.NEXTAUTH_URL;

export const getCSRFCookie = () => {
  return fetch(`${BASE_URL}/signin`, {
    method: "get",
  }).then((res) => res.headers.get("set-cookie"));
};

export const request = async (path: string, options: RequestInit) => {
  const cookieHeader = (await getCSRFCookie()) ?? "";
  const optionWithCookie = {
    ...options,
    headers: {
      ...options.headers,
      cookie: cookieHeader,
    },
  };
  const url = `${BASE_URL}/${path}`;
  return fetch(url, optionWithCookie);
};
