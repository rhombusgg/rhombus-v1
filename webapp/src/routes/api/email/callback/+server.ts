import { error, redirect } from '@sveltejs/kit';
import prisma from '$lib/db.js';
import { setJwt } from '$lib/serverAuth.js';

export async function GET({ url, cookies }) {
	const token = url.searchParams.get('token');
	if (!token) {
		throw error(403, 'Missing token url param');
	}

	const emailVerificationToken = await prisma.emailVerificationToken
		.delete({
			where: { token },
			select: { email: true }
		})
		.catch(() => null);

	if (!emailVerificationToken) {
		throw error(403, 'Invalid email verification token');
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
