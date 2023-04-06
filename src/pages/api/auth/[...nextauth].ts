import type { NextApiRequest, NextApiResponse } from "next";
import NextAuth from "next-auth";
import { authOptions } from "~/server/auth";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "~/env.mjs";

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});
// Create a new ratelimiter, that allows 5 requests per 5 seconds
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

const getClientIp = (request: NextApiRequest) => {
  const xForwardedFor = request.headers["x-forwarded-for"];
  if (typeof xForwardedFor === "string") {
    return xForwardedFor.split(",")[0];
  }
  return request.connection.remoteAddress;
};

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  // const res = await ipRateLimit(req);
  // If the status is not 200 then it has been rate limited.
  // if (res.status !== 200) return res;
  const identifier = getClientIp(req) ?? "api";
  const result = await ratelimit.limit(identifier);

  res.setHeader("X-RateLimit-Limit", result.limit);
  res.setHeader("X-RateLimit-Remaining", result.remaining);

  if (!result.success) {
    res.status(429).json({
      message: "The request has been rate limited.",
      rateLimitState: result,
    });
    return res.end();
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return await NextAuth(req, res, authOptions);
}
