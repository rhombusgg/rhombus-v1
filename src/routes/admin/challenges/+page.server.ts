import prisma from '$lib/db';
import { redirect } from '@sveltejs/kit';

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
		include: {
			_count: {
				select: {
					solves: true,
					writeups: true
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
			issueTemplate: challenge.issueTemplate,
			points: challenge.points,
			authorId: challenge.authorId,
			writeupCount: challenge._count.writeups,
			solveCount: challenge._count.solves
		}))
	};
};
