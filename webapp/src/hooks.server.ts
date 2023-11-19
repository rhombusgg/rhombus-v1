import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

import prisma from '$lib/db';
import { getJwt } from '$lib/serverAuth';

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
					}
				}
			}
		}
	});

	if (!session) return resolve(event);

	event.locals.session = {
		id: session.user.id,
		emails: session.user.emails.map((email) => email.email),
		avatarFallback: session.user.emails[0].email.match(/^([^@]{0,2})/)![0].toUpperCase()
	};

	if (session.user.discord) {
		event.locals.session.discord = {
			id: session.user.discord.id,
			image: session.user.discord.image,
			username: session.user.discord.username,
			globalUsername: session.user.discord.globalUsername
		};
		event.locals.session.avatarFallback = session.user.discord.username
			.substring(0, 2)
			.toUpperCase();
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
