import NextAuth from "next-auth";
import { NextRequest } from "next/server";

import { authOptions } from "~/server/nextauth";

type RouteHandlerContext = {
  params: { nextauth: string[] };
};

const handler = (req: NextRequest, context: RouteHandlerContext) => {
  return NextAuth(req, context, authOptions);
};

export { handler as GET, handler as POST };
