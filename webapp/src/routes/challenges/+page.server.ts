import prisma from '$lib/db';
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	if (!locals.session) {
		throw redirect(302, '/signin');
	}

	const dbChallenges = await prisma.challenge.findMany({
		select: {
			id: true,
			humanId: true,
			name: true,
			description: true,
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

	const challenges: {
		id: string;
		humanId: string;
		name: string;
		description: string;
		difficulty: string;
		points: number | null;
		category: string;
		author: {
			image: string;
			globalUsername: string;
		};
	}[] = dbChallenges.map((challenge) => ({
		id: challenge.id,
		humanId: challenge.humanId,
		name: challenge.name,
		description: challenge.description,
		difficulty: challenge.difficulty,
		points: challenge.points,
		category: challenge.category,
		author: {
			image: challenge.author.discord!.image,
			globalUsername: challenge.author.discord!.globalUsername
		}
	}));

	return {
		challenges
	};
};
