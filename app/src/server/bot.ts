import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { BotRouter } from "bot";

import { env } from "~/env.mjs";

export const bot = createTRPCProxyClient<BotRouter>({
  links: [
    httpBatchLink({
      url: env.DISCORD_BOT_URL,
    }),
  ],
});
