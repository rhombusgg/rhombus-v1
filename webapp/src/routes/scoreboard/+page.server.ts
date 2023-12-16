import prisma from '$lib/db';

export const load = async () => {
	const dbTeams = await prisma.team.findMany({
		select: {
			name: true,
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
		solves: team.users.flatMap((user) =>
			user.solves.map((solve) => ({
				time: solve.time,
				points: solve.challenge.points || 0
			}))
		)
	}));

	const teamScores = teams.map((team) => ({
		name: team.name,
		solves: team.solves.map((solve, i) => ({
			time: solve.time,
			points: solve.points + (team.solves[i - 1]?.points || 0)
		}))
	}));

	const series = teamScores.map((team) => ({
		type: 'line',
		name: team.name,
		data: team.solves.map((solve) => ({
			value: [solve.time.getTime(), solve.points]
		}))
	}));

	// const series = teamScores.map((team) => ({
	// 	type: 'line',
	// 	name: team.name,
	// 	data: [
	// 		{
	// 			value: [Date.now(), 100]
	// 		},
	// 		{
	// 			value: [Date.now(), 200]
	// 		}
	// 	]
	// }));

	return {
		series
	};
};
