import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { formSchema } from './schema';
import { renderSignInEmail } from './email';
import nodemailer from 'nodemailer';
import { SMTP_FROM, SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_USER } from '$env/static/private';
import { z } from 'zod';
import { PUBLIC_LOCATION_URL } from '$env/static/public';

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

		const email = await renderSignInEmail({
			authLink: `${PUBLIC_LOCATION_URL}/afhsdf`,
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
