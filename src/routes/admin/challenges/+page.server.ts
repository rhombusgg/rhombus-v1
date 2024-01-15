import { redirect } from '@sveltejs/kit';
import prisma from '$lib/db';
import { dynamicPoints } from '$lib/utils';

export const load = async ({ locals, depends }) => {
	if (!locals.session) {
		throw redirect(302, '/signin');
	}

	const user = await prisma.user.findUnique({
		where: {
			id: locals.session.id
		},
		select: {
			isAdmin: true
		}
	});

	if (!user?.isAdmin) {
		throw redirect(302, '/account');
	}

	depends('app:admin:challenges');

	const challenges = await prisma.challenge.findMany({
		select: {
			id: true,
			name: true,
			slug: true,
			description: true,
			category: true,
			difficulty: true,
			flag: true,
			ticketTemplate: true,
			points: true,
			authorId: true,
			_count: {
				select: {
					writeups: true
				}
			},
			solves: {
				distinct: ['teamId'],
				select: {
					id: true
				}
			}
		}
	});

	return {
		challenges: challenges.map((challenge) => ({
			id: challenge.id,
			name: challenge.name,
			slug: challenge.slug,
			description: challenge.description,
			category: challenge.category,
			difficulty: challenge.difficulty,
			flag: challenge.flag,
			ticketTemplate: challenge.ticketTemplate,
			points: challenge.points || dynamicPoints(challenge.solves.length),
			isDynamicScoring: !challenge.points,
			authorId: challenge.authorId,
			writeupCount: challenge._count.writeups,
			solveCount: challenge.solves.length
		}))
	};
};
