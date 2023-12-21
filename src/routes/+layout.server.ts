import prisma from '$lib/db.js';

export const load = async (event) => {
	const challenges = await prisma.challenge.findMany({
		select: {
			id: true,
			slug: true,
			name: true,
			description: true,
			issueTemplate: true,
			difficulty: true,
			points: true,
			category: true,
			author: {
				select: {
					discord: {
						select: {
							image: true,
							globalUsername: true
						}
					}
				}
			}
		}
	});

	return {
		session: event.locals.session,
		challenges
	};
};
