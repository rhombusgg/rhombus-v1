import { TRPCError, initTRPC } from '@trpc/server';
import type { RequestEvent } from '@sveltejs/kit';

async function createContext(event: RequestEvent) {
	return {
		session: event.locals.session
	};
}

const t = initTRPC.context<typeof createContext>().create();

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.session) {
		throw new TRPCError({ code: 'UNAUTHORIZED' });
	}

	return next();
});

export const adminProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.session?.isAdmin) {
		throw new TRPCError({ code: 'UNAUTHORIZED' });
	}

	return next();
});
