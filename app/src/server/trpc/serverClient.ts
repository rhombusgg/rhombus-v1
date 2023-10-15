import { type Session } from "next-auth";

import { appRouter } from "~/server/procedures";
import { db } from "~/server/db";

export const serverClient = (session: Session | null) =>
  appRouter.createCaller({
    db,
    session,
  });
