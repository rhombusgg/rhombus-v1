import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { formSchema } from './schema';
import { renderSignInEmail } from './email';
import nodemailer from 'nodemailer';
import { SMTP_FROM, SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_USER } from '$env/static/private';
import { z } from 'zod';
import { PUBLIC_LOCATION_URL } from '$env/static/public';
import prisma from '$lib/db';

export const load: PageServerLoad = () => {
	return {
		form: superValidate(formSchema)
	};
};

const transporter = nodemailer.createTransport({
	host: SMTP_HOST,
	port: z.coerce.number().parse(SMTP_PORT),
	auth: {
		user: SMTP_USER,
		pass: SMTP_PASSWORD
	}
});

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, formSchema);
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

		const email = await renderSignInEmail({
			authLink: `${PUBLIC_LOCATION_URL}/api/email/callback?token=${verificationToken.token}`,
			ip: event.getClientAddress()
		});

		await transporter.sendMail({
			from: SMTP_FROM,
			to: form.data.email,
			subject: 'Rhombus CTF Sign In',
			html: email.html,
			text: email.text
		});

		return {
			form
		};
	}
};
