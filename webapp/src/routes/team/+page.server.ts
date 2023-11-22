import prisma from '$lib/db';
import { avatarFallback } from '$lib/utils';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';

export const load = async ({ locals }) => {
	if (!locals.session) {
		throw redirect(302, '/signin');
	}

	const user = await prisma.user.findUnique({
		where: {
			id: locals.session.id
		},
		select: {
			team: {
				select: {
					id: true,
					name: true,
					ownerId: true,
					users: {
						select: {
							id: true,
							discord: { select: { username: true, globalUsername: true, image: true } },
							emails: { select: { email: true }, take: 1 }
						}
					}
				}
			}
		}
	});

	if (!user) {
		throw redirect(302, '/signin');
	}

	const team: {
		name: string;
		ownerId: string;
		users: {
			discord: {
				username: string;
				globalUsername: string;
				image: string;
			} | null;
			email: string | undefined;
			avatarFallback: string;
			id: string;
		}[];
	} = {
		name: user.team!.name,
		ownerId: user.team!.ownerId,
		users: user.team!.users.map((user) => ({
			discord: user.discord,
			email: user.discord ? undefined : user.emails[0].email,
			avatarFallback: avatarFallback(user),
			id: user.id
		}))
	};
	return {
		team
	};
};

export const actions = {
	kick: async ({ request, locals }) => {
		if (!locals.session) {
			throw redirect(302, '/signin');
		}

		const data = z
			.object({ userId: z.string() })
			.parse(Object.fromEntries((await request.formData()).entries()));

		const user = await prisma.user.findUnique({
			where: { id: data.userId },
			select: { ownerTeamId: true, teamId: true }
		});

		if (locals.session?.id === data.userId) {
			await prisma.user.update({
				where: { id: data.userId },
				data: {
					teamId: user?.ownerTeamId
				}
			});
			return;
		}

		if (user?.teamId === locals.session.team.id && locals.session.isTeamOwner) {
			await prisma.user.update({
				where: { id: data.userId },
				data: {
					teamId: user?.ownerTeamId
				}
			});
			return;
		}

		return error(401);
	}
};
