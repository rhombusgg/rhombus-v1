import {
  type DefaultSession,
  type NextAuthOptions,
  getServerSession,
} from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { randomBytes } from "node:crypto";

import { env } from "~/env.mjs";
import { db } from "~/server/db";
import { PrismaClient } from "@prisma/client";
import { Adapter } from "next-auth/adapters";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      teamId: string;
      discordId?: string | null;
      discordUsername?: string | null;
    };
  }

  interface User {
    teamId?: string | null;
    discordId?: string | null;
    discordUsername?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    signIn: async (params) => {
      if (params.account?.provider === "discord") {
        const existingUser = await db.user.findFirst({
          where: { discordId: params.user.discordId },
        });

        if (existingUser?.emailVerified) {
          throw new Error(
            `This Discord account is already linked! Please sign in with your email ${existingUser.email} instead.`,
          );
        }

        const currentSession = await getServerSession(authOptions);

        // if user is already logged in (via email), and is trying to link their discord account
        if (currentSession) {
          await db.user.update({
            where: { id: currentSession?.user.id },
            data: {
              name: params.user.name,
              discordUsername: params.user.discordUsername,
              discordId: params.user.discordId,
              image: params.user.image,
              secondaryEmail: params.user.email,
            },
          });

          return "/dashboard";
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
        discordUsername: user.discordUsername,
        teamId: user.teamId,
      },
    }),
  },
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
      authorization: "https://discord.com/api/oauth2/authorize?scope=identify",
      /* eslint-disable */
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
          name: profile.global_name,
          image: profileImage,
          email: profile.email,
          discordUsername: profile.username,
          discordId: profile.id,
        };
      },
      /* eslint-enable */
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
  adapter: Adapter(db),
};

function Adapter(p: PrismaClient): Adapter {
  return {
    ...PrismaAdapter(p),
    createUser: async (data) => {
      const user = await p.user.create({ data });

      const team = await p.team.create({
        data: {
          name: `${user.name ?? user.email.match(/^([^@]{0,8})/)?.[0]}'s team`,
          ownerId: user.id,
          inviteToken: generateInviteToken(),
        },
      });

      await p.user.update({
        where: { id: user.id },
        data: {
          teamId: team.id,
          ownerTeamId: team.id,
        },
      });

      return user;
    },
  };
}

export const generateInviteToken = () => randomBytes(16).toString("hex");

export const getServerAuthSession = async () => getServerSession(authOptions);
