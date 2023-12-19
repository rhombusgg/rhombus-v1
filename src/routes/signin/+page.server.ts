import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { formSchema } from './schema';
import { renderSignInEmail } from './email';
import nodemailer from 'nodemailer';
import { env as privateEnv } from '$env/dynamic/private';
import { z } from 'zod';
import { env as publicEnv } from '$env/dynamic/public';
import prisma from '$lib/db';
import { changeUsersRole } from '$lib/bot';

export const load = async ({ url, cookies, locals }) => {
	const inviteToken = url.searchParams.get('invite');
	if (inviteToken) {
		const team = await prisma.team.findUnique({
			where: {
				inviteToken
			},
			select: {
				id: true,
				name: true,
				discordRoleId: true
			}
		});
		if (team) {
			if (locals.session) {
				const oldTeam = await prisma.user.findFirst({
					where: {
						id: locals.session.id
					},
					select: { team: { select: { discordRoleId: true } } }
				});
				if (oldTeam) {
					await changeUsersRole(
						locals.session.discord!.id,
						oldTeam.team!.discordRoleId,
						team.discordRoleId
					);
				}

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
				form: await superValidate(formSchema)
			};
		}
	}

	return {
		team: undefined,
		form: await superValidate(formSchema)
	};
};

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
			authLink: `${publicEnv.PUBLIC_LOCATION_URL}/api/email/callback?token=${verificationToken.token}`,
			ip: event.getClientAddress()
		});

		const transporter = nodemailer.createTransport({
			host: privateEnv.SMTP_HOST,
			port: z.coerce.number().parse(privateEnv.SMTP_PORT),
			auth: {
				user: privateEnv.SMTP_USER,
				pass: privateEnv.SMTP_PASSWORD
			}
		});

		await transporter.sendMail({
			from: privateEnv.SMTP_FROM,
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
