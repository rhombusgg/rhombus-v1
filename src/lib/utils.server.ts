import prisma from './db';

export const globalChallengeSolves = async (challengeIds: string[] = []) => {
	const challengeSolves = await prisma.challenge.findMany({
		where:
			challengeIds.length > 0
				? {
						id: {
							in: challengeIds
						}
					}
				: undefined,
		select: {
			id: true,
			solves: {
				distinct: ['teamId'],
				select: {
					id: true
				}
			}
		}
	});

	const solves = challengeSolves.reduce(
		(acc, challenge) => {
			acc[challenge.id] = challenge.solves.length;
			return acc;
		},
		{} as Record<string, number>
	);

	return solves;
};
