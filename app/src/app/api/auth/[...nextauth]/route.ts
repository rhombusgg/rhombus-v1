import NextAuth from "next-auth";
import { type NextRequest } from "next/server";

import { authOptions } from "~/server/nextauth";

type RouteHandlerContext = {
  params: { nextauth: string[] };
};

const handler = (req: NextRequest, context: RouteHandlerContext) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return NextAuth(req, context, authOptions);
};

export { handler as GET, handler as POST };
