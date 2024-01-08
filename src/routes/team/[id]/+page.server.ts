import { error } from '@sveltejs/kit';
import prisma from '$lib/db';
import { avatarFallback, dynamicPoints } from '$lib/utils';
import { globalChallengeSolves } from '$lib/utils.server';

export const load = async ({ params }) => {
	const team = await prisma.team.findFirst({
		where: { id: params.id },
		select: {
			id: true,
			name: true,
			users: {
				select: {
					id: true,
					discord: {
						select: {
							id: true,
							username: true,
							globalUsername: true,
							image: true
						}
					},
					emails: {
						take: 1,
						select: {
							email: true
						}
					}
				}
			},
			solves: {
				distinct: ['teamId'],
				orderBy: {
					time: 'asc'
				},
				select: {
					time: true,
					challenge: {
						select: {
							id: true,
							name: true,
							slug: true,
							points: true
						}
					},
					user: {
						select: {
							id: true
						}
					}
				}
			}
		}
	});

	if (!team) throw error(404);

	const globalSolves = await globalChallengeSolves();

	return {
		team: { id: team.id, name: team.name },
		solves: team.solves.map((solve) => ({
			time: solve.time,
			userId: solve.user.id,
			challenge: {
				slug: solve.challenge.slug,
				name: solve.challenge.name,
				points: solve.challenge.points || dynamicPoints(globalSolves[solve.challenge.id])
			}
		})),
		users: team.users.map((user) => ({
			discord: user.discord,
			email: user.discord ? undefined : user.emails[0].email,
			avatarFallback: avatarFallback(user),
			id: user.id
		}))
	};
};
