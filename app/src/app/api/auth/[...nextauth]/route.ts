import NextAuth, { NextAuthOptions, getServerSession } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextRequest } from "next/server";

import { env } from "~/env.mjs";
import { db } from "~/server/db";

export const getNextAuthOptions = (): NextAuthOptions => {
  const extendedOptions: NextAuthOptions = {
    callbacks: {
      signIn: async (params) => {
        const currentSession = await getServerSession(extendedOptions);
        console.log(params.account?.providerAccountId);
        if (currentSession) {
          console.log("------------------");
          console.log(currentSession?.user?.email);

          return "/";
        }

        return true;
      },
    },
    providers: [
      DiscordProvider({
        clientId: env.DISCORD_CLIENT_ID,
        clientSecret: env.DISCORD_CLIENT_SECRET,
        authorization:
          "https://discord.com/api/oauth2/authorize?scope=identify",
        profile(profile) {
          return {
            id: profile.id,
            name: profile.username,
            image: profile.avatar,
            email: profile.email,
          };
        },
      }),
      EmailProvider({
        server: {
          host: "mbund.org",
          port: 465,
          auth: {
            user: "nextcloud@mbund.org",
            pass: env.EMAIL_PASSWORD,
          },
        },
        from: "Rhombus <nextcloud@mbund.org>",
      }),
    ],

    adapter: PrismaAdapter(db),
  };

  return extendedOptions;
};

type RouteHandlerContext = {
  params: { nextauth: string[] };
};

const handler = (req: NextRequest, context: RouteHandlerContext) => {
  return NextAuth(req, context, getNextAuthOptions());
};

export { handler as GET, handler as POST };
