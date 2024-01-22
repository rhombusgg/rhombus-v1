import { z } from 'zod';
import prisma from '$lib/db';
import { createTRPCRouter, protectedProcedure, publicProcedure } from './context';

export const apiRouter = createTRPCRouter({
	getChallenges: protectedProcedure
		.meta({ openapi: { method: 'GET', path: '/challenges', protect: true } })
		.input(z.object({ name: z.string() }))
		.output(z.object({ challenges: z.array(z.string()) }))
		.query(async () => {
			const challenges = await prisma.challenge.findMany();

			return { challenges: challenges.map((c) => c.name) };
		}),
	getUsers: publicProcedure
		.meta({ openapi: { method: 'GET', path: '/users' } })
		.input(z.object({}))
		.output(z.object({ users: z.array(z.string()) }))
		.query(async () => {
			const users = await prisma.user.findMany({
				select: {
					discord: {
						select: {
							username: true
						}
					},
					emails: {
						take: 1,
						select: {
							email: true
						}
					}
				}
			});

			return { users: users.map((c) => c.discord?.username || c.emails[0].email) };
		})
});
