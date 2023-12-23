import prisma from '$lib/db.js';
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

	const challenges = await prisma.challenge.findMany();

	return {
		challenges: challenges.map((challenge) => ({
			id: challenge.id,
			slug: challenge.slug,
			name: { name: challenge.name, slug: challenge.slug },
			description: challenge.description,
			category: challenge.category,
			difficulty: challenge.difficulty,
			flag: challenge.flag,
			healthCheckTypescript: challenge.healthCheckTypescript,
			healthCheckJavascript: challenge.healthCheckJavascript,
			issueTemplate: challenge.issueTemplate,
			points: challenge.points,
			authorId: challenge.authorId
		}))
	};
};
