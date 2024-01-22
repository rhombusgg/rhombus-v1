import prisma from '$lib/db';
import { dynamicPoints } from '$lib/utils';
import { globalChallengeSolves } from '$lib/utils.server';

export const load = async ({ depends }) => {
	depends('scoreboard');

	const dbDivisions = await prisma.division.findMany({
		select: {
			name: true,
			id: true,
			teams: {
				select: {
					name: true,
					id: true,
					solves: {
						distinct: ['challengeId'],
						orderBy: {
							time: 'asc'
						},
						select: {
							time: true,
							challenge: {
								select: {
									points: true,
									id: true
								}
							}
						}
					}
				}
			}
		}
	});

	const globalSolves = await globalChallengeSolves();

	const divisions = dbDivisions.map((division) => ({
		name: division.name,
		id: division.id,
		teams: division.teams.flatMap((team) => {
			if (team.solves.length === 0) return [];
			return {
				id: team.id,
				name: team.name,
				solves: team.solves.map((solve) => ({
					time: solve.time,
					points: solve.challenge.points || dynamicPoints(globalSolves[solve.challenge.id])
				}))
			};
		})
	}));

	return {
		divisions
	};
};
