import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { formSchema } from './schema';
import { renderSignInEmail } from './email';
import nodemailer from 'nodemailer';
import { SMTP_FROM, SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_USER } from '$env/static/private';
import { z } from 'zod';
import { PUBLIC_LOCATION_URL } from '$env/static/public';
import prisma from '$lib/db';

export const load = async ({ url, cookies, locals }) => {
	const inviteToken = url.searchParams.get('invite');
	if (inviteToken) {
		const team = await prisma.team.findUnique({
			where: {
				inviteToken
			},
			select: {
				id: true,
				name: true
			}
		});
		if (team) {
			if (locals.session) {
				await prisma.user.update({
					where: {
						id: locals.session.id
					},
					data: {
						teamId: team.id
					}
				});
				throw redirect(302, '/team');
			}

			cookies.set('inviteToken', inviteToken);
			return {
				teamName: team.name,
				form: superValidate(formSchema)
			};
		}
	}

	return {
		team: undefined,
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

export const actions = {
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
