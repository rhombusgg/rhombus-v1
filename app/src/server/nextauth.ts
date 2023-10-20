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

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      discordId?: string | null;
      discordUsername?: string | null;
    };
  }

  interface User {
    discordId?: string | null;
    discordUsername?: string | null;
    teamId?: string | null;
    ownerTeamId?: string | null;
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

    session: async ({ session, user }) => {
      if (!user.teamId) {
        const team = await db.team.create({
          data: {
            name: `${
              user.name ?? user.email.match(/.{1,8}(?=@)|[^@]*/)?.join()
            }'s team`,
            ownerId: user.id,
            inviteToken: randomBytes(16).toString("hex"),
          },
        });

        await db.user.update({
          where: { id: user.id },
          data: {
            teamId: team.id,
            ownerTeamId: team.id,
          },
        });
      }

      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          discordId: user.discordId,
          discordUsername: user.discordUsername,
        },
      };
    },
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
  // adapter: PrismaAdapter(db) as Adapter,
  adapter: PrismaAdapter(db),
};

// function PrismaAdapter(p: PrismaClient): Adapter {
//   return {
//     createUser: (data) => p.user.create({ data }),
//     getUser: (id) => p.user.findUnique({ where: { id } }),
//     getUserByEmail: (email) => p.user.findUnique({ where: { email } }),
//     async getUserByAccount(provider_providerAccountId) {
//       const account = await p.account.findUnique({
//         where: { provider_providerAccountId },
//         select: { user: true },
//       });
//       return account?.user ?? null;
//     },
//     updateUser: ({ id, ...data }) => p.user.update({ where: { id }, data }),
//     deleteUser: (id) => p.user.delete({ where: { id } }),
//     linkAccount: (data) =>
//       p.account.create({ data }) as unknown as AdapterAccount,
//     unlinkAccount: (provider_providerAccountId) =>
//       p.account.delete({
//         where: { provider_providerAccountId },
//       }) as unknown as AdapterAccount,
//     async getSessionAndUser(sessionToken) {
//       const userAndSession = await p.session.findUnique({
//         where: { sessionToken },
//         include: { user: true },
//       });
//       if (!userAndSession) return null;
//       const { user, ...session } = userAndSession;
//       return { user, session };
//     },
//     createSession: (data) => p.session.create({ data }),
//     updateSession: (data) =>
//       p.session.update({ where: { sessionToken: data.sessionToken }, data }),
//     deleteSession: (sessionToken) =>
//       p.session.delete({ where: { sessionToken } }),
//     async createVerificationToken(data) {
//       const verificationToken = await p.verificationToken.create({ data });
//       // @ts-expect-errors // MongoDB needs an ID, but we don't
//       if (verificationToken.id) delete verificationToken.id;
//       return verificationToken;
//     },
//     async useVerificationToken(identifier_token) {
//       try {
//         const verificationToken = await p.verificationToken.delete({
//           where: { identifier_token },
//         });
//         // @ts-expect-errors // MongoDB needs an ID, but we don't
//         if (verificationToken.id) delete verificationToken.id;
//         return verificationToken;
//       } catch (error) {
//         // If token already used/deleted, just return null
//         // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
//         if ((error as Prisma.PrismaClientKnownRequestError).code === "P2025")
//           return null;
//         throw error;
//       }
//     },
//   };
// }

export const getServerAuthSession = async () => getServerSession(authOptions);
