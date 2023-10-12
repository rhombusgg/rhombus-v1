import { publicProcedure, router } from "./trpc";
import { db } from "./db";
import { bot } from "./bot";

export const appRouter = router({
  getUsers: publicProcedure.query(async () => {
    return [];
  }),

  setUsers: publicProcedure.mutation(async () => {}),

  botExample: publicProcedure.mutation(async () => {
    await bot.example.query();
  }),
});

export type AppRouter = typeof appRouter;
