import { publicProcedure, router } from "./trpc";
import { db } from "./db";

export const appRouter = router({
  getUsers: publicProcedure.query(async () => {
    return [];
  }),

  setUsers: publicProcedure.mutation(async () => {}),
});

export type AppRouter = typeof appRouter;
