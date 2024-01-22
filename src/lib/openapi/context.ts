import { TRPCError, initTRPC } from '@trpc/server';
import type { OpenApiMeta } from 'trpc-openapi';
import type { Request } from 'swagger-ui';
import prisma from '$lib/db';

export const createContext = async ({ req }: { req: Request }) => {
	if (req.headers.authorization) {
		const token = req.headers.authorization.split(' ')[1];
		const apiToken = await prisma.aPIToken.findUnique({
			where: {
				token
			},
			select: {
				user: {
					select: {
						id: true,
						isAdmin: true
					}
				}
			}
		});

		return {
			isAdmin: !!apiToken?.user.isAdmin,
			userId: apiToken?.user.id
		};
	}

	return {
		isAdmin: false,
		userId: undefined
	};
};

const t = initTRPC.context<typeof createContext>().meta<OpenApiMeta>().create();

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.userId) {
		throw new TRPCError({ code: 'UNAUTHORIZED' });
	}

	return next();
});

export const adminProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.isAdmin) {
		throw new TRPCError({ code: 'UNAUTHORIZED' });
	}

	return next();
});
