import { error, redirect } from '@sveltejs/kit';
import prisma from '$lib/db';
import { setJwt } from '$lib/auth/auth.server';
import { createRole } from '$lib/bot';
import { generateInviteToken } from '$lib/utils.server';

export async function GET({ url, cookies }) {
	const token = url.searchParams.get('token');
	if (!token) {
		throw error(403, 'Missing token url param');
	}

	const emailVerificationToken = await prisma.emailVerificationToken
		.delete({
			where: { token },
			select: { email: true, expires: true }
		})
		.catch(() => null);

	if (!emailVerificationToken) {
		throw error(403, 'Invalid email verification token');
	}

	if (emailVerificationToken.expires < new Date()) {
		throw error(403, 'Expired email verification token');
	}

	const existing = await prisma.email.findUnique({
		where: { email: emailVerificationToken.email },
		select: { userId: true }
	});

	const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

	if (existing) {
		await prisma.session.deleteMany({
			where: {
				expires: {
					lte: new Date()
				}
			}
		});

		const session = await prisma.session.create({
			data: {
				userId: existing.userId,
				expires
			}
		});
		await setJwt({ sessionId: session.id, expires }, cookies);
	} else {
		const user = await prisma.user.create({
			data: {
				emails: {
					create: {
						email: emailVerificationToken.email,
						verified: new Date()
					}
				},
				sessions: {
					create: {
						expires
					}
				}
			},
			select: { id: true, sessions: { select: { id: true } } }
		});

		const teamName = emailVerificationToken.email.split('@')[0];
		const role = await createRole(teamName);
		const division = await prisma.division.findFirst({
			where: {
				isDefault: true
			}
		});
		const team = await prisma.team.create({
			data: {
				name: teamName,
				inviteToken: generateInviteToken(),
				discordRoleId: role.id,
				ownerId: user.id,
				divisions: {
					connect: {
						id: division!.id
					}
				}
			},
			select: {
				id: true
			}
		});

		await prisma.user.update({
			where: { id: user.id },
			data: {
				teamId: team.id,
				ownerTeamId: team.id
			}
		});

		const inviteToken = cookies.get('inviteToken');
		if (inviteToken) {
			cookies.delete('inviteToken', { path: '/' });
			const invitedTeam = await prisma.team.findUnique({
				where: {
					inviteToken
				},
				select: {
					id: true
				}
			});
			if (invitedTeam) {
				await prisma.user.update({
					where: {
						id: user.id
					},
					data: {
						teamId: invitedTeam.id
					}
				});
			}
		}

		await setJwt({ sessionId: user.sessions[0].id, expires }, cookies);
	}

	throw redirect(302, `/account`);
}
