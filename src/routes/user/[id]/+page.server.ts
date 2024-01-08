import { error } from '@sveltejs/kit';
import prisma from '$lib/db';
import { globalChallengeSolves } from '$lib/utils.server';
import { avatarFallback, dynamicPoints } from '$lib/utils';

export const load = async ({ locals, params }) => {
	const user = await prisma.user.findFirst({
		where: { id: params.id },
		select: {
			team: {
				select: {
					id: true,
					name: true
				}
			},
			discord: {
				select: {
					id: true,
					username: true,
					globalUsername: true,
					image: true
				}
			},
			emails: {
				select: {
					email: true
				}
			},
			solves: {
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
					}
				}
			},
			ips: {
				select: {
					address: true
				}
			}
		}
	});

	if (!user) throw error(404);

	const globalSolves = await globalChallengeSolves();

	return {
		user: {
			discord: user.discord,
			email: user.discord ? undefined : user.emails[0]?.email,
			avatarFallback: avatarFallback(user)
		},
		team: user.team!,
		solves: user.solves.map((solve) => ({
			time: solve.time,
			challenge: {
				name: solve.challenge.name,
				slug: solve.challenge.slug,
				points: solve.challenge.points || dynamicPoints(globalSolves[solve.challenge.id])
			}
		})),
		admin: locals.session?.isAdmin
			? {
					ips: user.ips.map((ip) => ip.address),
					emails: user.emails.map((email) => email.email)
				}
			: undefined
	};
};
