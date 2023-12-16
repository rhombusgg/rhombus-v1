import { createSupportThread } from '$lib/bot';
import { fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms/client';
import { getUserColumns } from './challenges';
import { z } from 'zod';
import prisma from '$lib/db';

export const load = async ({ locals }) => {
	if (!locals.session) {
		throw redirect(302, '/signin');
	}

	const userColumns = await getUserColumns(locals.session.id);

	const ticketForm = await superValidate(ticketSchema);
	const flagForm = await superValidate(flagSchema);

	return {
		ticketForm,
		flagForm,
		userColumns
	};
};

const ticketSchema = z.object({
	challengeId: z.string(),
	content: z.string()
});

const flagSchema = z.object({
	challengeId: z.string(),
	flag: z.string()
});

export const actions = {
	ticket: async ({ request, locals }) => {
		if (!locals.session) {
			return fail(401);
		}

		const form = await superValidate(request, ticketSchema);
		if (!form.valid) {
			return fail(400, { form });
		}

		await createSupportThread({
			discordId: locals.session.discord?.id,
			challengeId: form.data.challengeId,
			content: form.data.content
		});

		return { form };
	},
	flag: async ({ request, locals }) => {
		if (!locals.session) {
			return fail(401);
		}

		const form = await superValidate(request, flagSchema);
		if (!form.valid) {
			return fail(400, { form });
		}

		const challenge = await prisma.challenge.findUnique({
			where: { id: form.data.challengeId },
			select: { flag: true }
		});
		if (!challenge) return fail(404);

		if (challenge.flag !== form.data.flag) return setError(form, 'flag', 'Incorrect flag');

		await prisma.solve.create({
			data: {
				challengeId: form.data.challengeId,
				userId: locals.session.id
			}
		});

		return { form };
	}
};
