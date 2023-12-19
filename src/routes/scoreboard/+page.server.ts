import prisma from '$lib/db';

export const load = async () => {
	const dbTeams = await prisma.team.findMany({
		select: {
			name: true,
			id: true,
			users: {
				select: {
					solves: {
						select: {
							time: true,
							challenge: { select: { points: true } }
						}
					}
				}
			}
		}
	});

	const teams = dbTeams.map((team) => ({
		name: team.name,
		id: team.id,
		solves: team.users.flatMap((user) =>
			user.solves.map((solve) => ({
				time: solve.time,
				points: solve.challenge.points || 0
			}))
		)
	}));

	const teamScores = teams.map((team) => ({
		name: team.name,
		id: team.id,
		score: team.solves.reduce((acc, solve) => acc + solve.points, 0),
		solves: team.solves.map((solve, i) => ({
			time: solve.time,
			points: solve.points + (team.solves[i - 1]?.points || 0)
		}))
	}));

	return {
		teamScores
	};
};
