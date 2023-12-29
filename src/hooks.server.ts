import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { Cron, scheduledJobs } from 'croner';

import prisma from '$lib/db';
import { getJwt } from '$lib/serverAuth';
import { avatarFallback } from '$lib/utils';

import { runHealthchecks } from '$lib/serverHealthcheck';

// small sveltekit hack to have code run only once on server start (to
// run healthchecks every so often)
scheduledJobs.find((job) => job.name === 'healthcheck')?.stop();
Cron(
	'*/5 * * * *',
	async () => {
		await runHealthchecks();
	},
	{ name: 'healthcheck' }
);

const auth: Handle = async ({ event, resolve }) => {
	const data = await getJwt(event.cookies);
	if (!data) return resolve(event);

	const session = await prisma.session.findUnique({
		where: {
			id: data.sessionId
		},
		select: {
			user: {
				select: {
					id: true,
					teamId: true,
					isAdmin: true,
					discord: {
						select: {
							id: true,
							image: true,
							username: true,
							globalUsername: true
						}
					},
					emails: {
						select: {
							email: true
						}
					},
					team: {
						select: {
							id: true,
							ownerId: true,
							inviteToken: true,
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
										select: { email: true },
										take: 1
									}
								}
							}
						}
					}
				}
			}
		}
	});

	if (!session) return resolve(event);

	event.locals.session = {
		id: session.user.id,
		emails: session.user.emails.map((email) => email.email),
		avatarFallback: avatarFallback(session.user),
		isTeamOwner: session.user.team!.ownerId === session.user.id,
		team: session.user.team!,
		isAdmin: session.user.isAdmin
	};

	if (session.user.discord) {
		event.locals.session.discord = {
			id: session.user.discord.id,
			image: session.user.discord.image,
			username: session.user.discord.username,
			globalUsername: session.user.discord.globalUsername
		};
	}

	return resolve(event);
};

const ip: Handle = async ({ event, resolve }) => {
	const address = event.getClientAddress();
	const session = event.locals.session;

	await prisma.iP.upsert({
		where: {
			address
		},
		create: {
			address,
			users: session
				? {
						connect: {
							id: session.id
						}
					}
				: undefined
		},
		update: {
			address,
			users: session
				? {
						connect: {
							id: session.id
						}
					}
				: undefined
		}
	});

	return resolve(event);
};

export const handle = sequence(auth, ip);
