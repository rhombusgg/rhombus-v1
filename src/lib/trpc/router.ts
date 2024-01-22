import { createTRPCRouter, publicProcedure } from './context';

export const router = createTRPCRouter({
	greeting: publicProcedure.query(async () => {
		return `Hello tRPC v10 @ ${new Date().toLocaleTimeString()}`;
	})
});

export type Router = typeof router;
