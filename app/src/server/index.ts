import { publicProcedure, createTRPCRouter } from "./trpc";
import { bot } from "./bot";

export const appRouter = createTRPCRouter({
  getUsers: publicProcedure.query(async () => {
    return ["a", "b"];
  }),

  setUsers: publicProcedure.mutation(async () => {}),

  botExample: publicProcedure.mutation(async ({ ctx }) => {
    await bot.at.query({ discordId: ctx.session?.user.discordId! });
  }),
});

export type AppRouter = typeof appRouter;
