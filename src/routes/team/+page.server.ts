import prisma from '$lib/db';
import { avatarFallback } from '$lib/utils';
import { error, fail, redirect } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms/server';
import { z } from 'zod';
import { teamNameFormSchema } from './schema.js';
import { env } from '$env/dynamic/public';
import { generateInviteToken } from '$lib/team.js';
import { changeUsersRole, renameRole } from '$lib/bot.js';

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
					inviteToken: true,
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
		inviteLink: string;
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
		inviteLink: `${env.PUBLIC_LOCATION_URL}/signin?invite=${user.team!.inviteToken}`,
		users: user.team!.users.map((user) => ({
			discord: user.discord,
			email: user.discord ? undefined : user.emails[0].email,
			avatarFallback: avatarFallback(user),
			id: user.id
		}))
	};
	return {
		team,
		teamNameForm: superValidate(teamNameFormSchema)
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
			select: {
				ownerTeamId: true,
				ownerTeam: { select: { discordRoleId: true } },
				teamId: true,
				team: { select: { discordRoleId: true } }
			}
		});

		if (locals.session.discord)
			await changeUsersRole(
				locals.session.discord.id,
				user!.team!.discordRoleId,
				user!.ownerTeam!.discordRoleId
			);

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
	},
	teamName: async (event) => {
		const form = await superValidate(event, teamNameFormSchema);
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		if (event.locals.session?.isTeamOwner) {
			const existingTeam = await prisma.team.findFirst({
				where: {
					name: form.data.name
				},
				select: { id: true, discordRoleId: true }
			});
			if (existingTeam) {
				if (existingTeam.id === event.locals.session.team.id) {
					return { form };
				}
				return message(form, 'A team with that name already exists.', { status: 400 });
			}

			const team = await prisma.team.update({
				where: {
					id: event.locals.session.team.id
				},
				data: {
					name: form.data.name
				},
				select: { discordRoleId: true }
			});
			await renameRole(team.discordRoleId, form.data.name);
		} else {
			return error(401);
		}

		return {
			form
		};
	},
	refreshInviteLink: async ({ locals }) => {
		if (!locals.session) {
			throw redirect(302, '/signin');
		}

		if (locals.session.isTeamOwner) {
			const inviteToken = generateInviteToken();
			await prisma.team.update({
				where: {
					id: locals.session.team.id
				},
				data: {
					inviteToken
				}
			});
			return;
		}

		return error(401);
	}
};
