import prisma from '$lib/db';
import { error } from '@sveltejs/kit';
import { avatarFallback } from '$lib/utils';

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
							slug: true
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

	return {
		display: user.discord
			? { type: 'discord' as const, ...user.discord }
			: {
					type: 'email' as const,
					email: user.emails[0]?.email
				},
		fallback: avatarFallback(user),
		team: user.team!,
		admin: locals.session?.isAdmin
			? {
					ips: user.ips.map((ip) => ip.address)
				}
			: undefined
	};
};
