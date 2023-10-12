import { initTRPC } from "@trpc/server";

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

import { db } from "./db";
import { generalChannel } from "./bot";

export const botRouter = router({
  example: publicProcedure.query(async () => {
    console.log("example");

    const users = await db.user.findMany();
    console.log(users);

    generalChannel.send(users.map((user) => user.id).join("\n"));
  }),
});

export type BotRouter = typeof botRouter;
