import NextAuth from "next-auth";
import { authOptions } from "~/server/auth";

export default NextAuth(authOptions);

// export default async function auth(req: NextApiRequest, res: NextApiResponse) {
//   // const res = await ipRateLimit(req);
//   // If the status is not 200 then it has been rate limited.
//   // if (res.status !== 200) return res;

//   return NextAuth(authOptions);
// }
