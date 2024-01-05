import prisma from '$lib/db';
import { challengeToPoints } from '$lib/utils';

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
					users: {
						select: {
							solves: {
								select: {
									time: true,
									challenge: {
										select: {
											points: true,
											_count: {
												select: {
													solves: true
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	});

	const divisions = dbDivisions.map((division) => ({
		name: division.name,
		id: division.id,
		teams: division.teams.map((team) => ({
			id: team.id,
			name: team.name,
			solves: team.users.flatMap((user) =>
				user.solves.map((solve) => ({
					time: solve.time,
					points: challengeToPoints(solve.challenge)
				}))
			)
		}))
	}));

	return {
		divisions
	};
};
