import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { env as publicEnv } from '$env/dynamic/public';
import { isUserInGuild } from '$lib/bot';
import prisma from '$lib/db';
import { newEmailSchema } from './schema';
import { renderVerificationEmail } from './email';
import { sendEmail } from '$lib/email/email.server';

export const load = async ({ locals }) => {
	if (!locals.session) {
		throw redirect(302, '/signin');
	}

	let inGuild = false;
	if (locals.session.discord) {
		inGuild = await isUserInGuild(locals.session.discord.id, '1160610137703186636');
	}

	return {
		inGuild,
		newEmailForm: await superValidate(newEmailSchema)
	};
};

export const actions = {
	addEmail: async (event) => {
		if (!event.locals.session) {
			throw redirect(302, '/signin');
		}

		const form = await superValidate(event, newEmailSchema);
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		const verificationToken = await prisma.emailVerificationToken.create({
			data: {
				email: form.data.email,
				expires: new Date(Date.now() + 1000 * 60 * 10)
			},
			select: {
				token: true
			}
		});

		const email = await renderVerificationEmail({
			verifyLink: `${publicEnv.PUBLIC_LOCATION_URL}/callback/email/verify?token=${verificationToken.token}`,
			ip: event.getClientAddress(),
			username: event.locals.session.discord?.username ?? event.locals.session.emails[0],
			email: form.data.email
		});

		await sendEmail({
			...email,
			to: form.data.email,
			subject: 'Rhombus CTF Email Verification'
		});

		return {
			form
		};
	}
};
