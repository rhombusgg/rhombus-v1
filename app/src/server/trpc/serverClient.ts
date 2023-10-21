import { type Session } from "next-auth";

import { db } from "~/server/db";
import { appRouter } from "~/server/procedures";

export const serverClient = (session: Session | null) =>
  appRouter.createCaller({
    db,
    session,
  });
