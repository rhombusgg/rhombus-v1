import prisma from '$lib/db';
import { avatarFallback } from '$lib/utils.js';
import { error } from '@sveltejs/kit';

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
					},
					solves: {
						select: {
							time: true,
							challenge: {
								select: {
									name: true,
									slug: true,
									points: true
								}
							}
						}
					}
				}
			}
		}
	});

	if (!team) throw error(404);

	return {
		team: { id: team.id, name: team.name },
		solves: team.users.flatMap((user) =>
			user.solves.map((solve) => ({
				...solve,
				user: {
					discord: user.discord,
					email: user.discord ? undefined : user.emails[0].email,
					avatarFallback: avatarFallback(user),
					id: user.id
				}
			}))
		),
		users: team.users.map((user) => ({
			discord: user.discord,
			email: user.discord ? undefined : user.emails[0].email,
			avatarFallback: avatarFallback(user),
			id: user.id
		}))
	};
};
