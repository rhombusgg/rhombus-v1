import { initTRPC } from "@trpc/server";
import { GuildMember } from "discord.js";
import { z } from "zod";

import { generalChannel, guild, verifiedRole } from "./bot";
import { db } from "./db";

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const botRouter = router({
  at: publicProcedure
    .input(
      z.object({
        discordId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const user = await db.user.findFirst({
        where: { discordId: input.discordId },
      });

      if (!user) return;

      console.log(`@${user.name}`);
      generalChannel.send(`<@${input.discordId}> [${user.name} from db]`);
    }),

  userInServer: publicProcedure
    .input(
      z.object({
        discordId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const members = await guild.members.fetch();
      const member = members.find(
        (member) => member.user.id === input.discordId,
      );

      const isInServer = member !== undefined;

      // automatically verify the user if they are in the server
      if (isInServer) {
        member.roles.add(verifiedRole);
      }

      return isInServer;
    }),

  guildPreview: publicProcedure.query(async () => {
    const preview = await guild.fetchPreview();

    return {
      name: preview.name,
      image: `https://cdn.discordapp.com/icons/${preview.id}/${preview.icon}`,
      onlineCount: preview.approximatePresenceCount,
      memberCount: preview.approximateMemberCount,
    };
  }),

  sendMessage: publicProcedure
    .input(z.object({ message: z.string() }))
    .query(async ({ input }) => {
      generalChannel.send(input.message);
    }),

  createTeam: publicProcedure
    .input(
      z.object({
        name: z.string(),
        firstDiscordID: z.string().optional().nullable(),
      }),
    )
    .query(async ({ input }) => {
      const teamRole = await guild.roles.create({
        name: input.name,
        color: "Blurple",
        reason: `rhombus-managed team`,
      });

      const members = await guild.members.fetch();
      const member = members.find(
        (member) => member.user.id === input.firstDiscordID,
      );

      if (member) await member.roles.add(teamRole);

      return teamRole.id;
    }),

  renameTeam: publicProcedure
    .input(z.object({ name: z.string(), discordRoleId: z.string() }))
    .query(async ({ input }) => {
      const teamRole = await guild.roles.fetch(input.discordRoleId);
      await teamRole.setName(input.name);
    }),

  joinTeam: publicProcedure
    .input(
      z.object({
        discordId: z.string(),
        oldDiscordRoleId: z.string(),
        newDiscordRoleId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const member = await guild.members.fetch({ user: input.discordId });
      const oldTeamRole = await guild.roles.fetch(input.oldDiscordRoleId);
      const newTeamRole = await guild.roles.fetch(input.newDiscordRoleId);

      await member.roles.remove(oldTeamRole);
      await member.roles.add(newTeamRole);
    }),
});

export type BotRouter = typeof botRouter;
