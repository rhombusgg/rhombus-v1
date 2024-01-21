import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { formSchema } from './schema';
import { renderSignInEmail } from './email';
import { env as publicEnv } from '$env/dynamic/public';
import prisma from '$lib/db';
import { sendEmail } from '$lib/email/email.server';

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
						teamId: team.id,
						solves: {
							updateMany: {
								data: {
									teamId: team.id
								},
								where: {
									userId: locals.session.id
								}
							}
						}
					}
				});

				throw redirect(302, '/team');
			}

			cookies.set('inviteToken', inviteToken, { path: '/' });
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
			authLink: `${publicEnv.PUBLIC_LOCATION_URL}/api/email/signin?token=${verificationToken.token}`,
			ip: event.getClientAddress()
		});

		await sendEmail({
			...email,
			to: form.data.email,
			subject: 'Rhombus CTF Sign In'
		});

		return {
			form
		};
	}
};
