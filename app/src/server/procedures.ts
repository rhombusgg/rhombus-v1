import { publicProcedure, createTRPCRouter, protectedProcedure } from "./trpc";
import { bot } from "./bot";

export const appRouter = createTRPCRouter({
  getUsers: publicProcedure.query(() => {
    return ["a", "b"];
  }),

  botExample: protectedProcedure.mutation(async ({ ctx }) => {
    const discordId = ctx.session.user.discordId;
    if (!discordId) throw new Error("Discord not linked!");

    await bot.at.query({ discordId: discordId });
  }),

  userInServer: protectedProcedure.query(async ({ ctx }) => {
    const discordId = ctx.session.user.discordId;
    if (!discordId) return false;

    return await bot.userInServer.query({
      discordId: discordId,
    });
  }),
});

export type AppRouter = typeof appRouter;
