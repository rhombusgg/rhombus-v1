import { publicProcedure, createTRPCRouter, protectedProcedure } from "./trpc";
import { bot } from "./bot";

export const appRouter = createTRPCRouter({
  getUsers: publicProcedure.query(() => {
    return ["a", "b"];
  }),

  botExample: protectedProcedure.mutation(async ({ ctx }) => {
    await bot.at.query({ discordId: ctx.session.user.discordId });
  }),
});

export type AppRouter = typeof appRouter;
