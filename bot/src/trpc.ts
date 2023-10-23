import { initTRPC } from "@trpc/server";
import { z } from "zod";

import { generalChannel, guild } from "./bot";
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

      return member !== undefined;
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
});

export type BotRouter = typeof botRouter;
