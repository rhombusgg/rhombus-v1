import { httpBatchLink } from "@trpc/client";
import { Session } from "next-auth";

import { appRouter } from "~/server";

import { db } from "~/server/db";

export const serverClient = (session: Session | null) =>
  appRouter.createCaller({
    db,
    session,
  });
