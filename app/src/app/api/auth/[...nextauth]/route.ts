import NextAuth, {
  DefaultSession,
  NextAuthOptions,
  getServerSession,
} from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextRequest } from "next/server";

import { env } from "~/env.mjs";
import { db } from "~/server/db";
import { GetServerSidePropsContext } from "next";
import { Adapter } from "next-auth/adapters";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      discordId: string;
    };
  }

  interface User {
    discordId: string;
  }
}

export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};

export const authOptions: NextAuthOptions = {
  callbacks: {
    signIn: async (params) => {
      const currentSession = await getServerSession(authOptions);

      if (params.account?.provider === "discord") {
        const existingUser = await db.user.findFirst({
          where: { discordId: params.user.discordId },
        });

        if (existingUser) {
          throw new Error(
            `This Discord account is already linked! Please sign in with your email ${existingUser.email} instead.`
          );
        }

        // if user is already logged in (via email), and is trying to link their discord account
        if (currentSession) {
          await db.user.update({
            where: { id: currentSession?.user.id },
            data: {
              name: params.user.name,
              discordId: params.user.discordId,
              image: params.user.image,
              secondaryEmail: params.user.email,
            },
          });

          return "/";
        }
      }

      return true;
    },

    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        discordId: user.discordId,
      },
    }),
  },
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
      authorization: "https://discord.com/api/oauth2/authorize?scope=identify",
      profile(profile) {
        let profileImage: string;
        if (profile.avatar === null) {
          const defaultAvatarNumber = parseInt(profile.discriminator) % 5;
          profileImage = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`;
        } else {
          const format = profile.avatar.startsWith("a_") ? "gif" : "png";
          profileImage = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`;
        }

        return {
          id: profile.id,
          name: profile.username,
          image: profileImage,
          email: profile.email,
          discordId: profile.id,
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

  adapter: PrismaAdapter(db) as Adapter,
};

type RouteHandlerContext = {
  params: { nextauth: string[] };
};

const handler = (req: NextRequest, context: RouteHandlerContext) => {
  return NextAuth(req, context, authOptions);
};

export { handler as GET, handler as POST };
