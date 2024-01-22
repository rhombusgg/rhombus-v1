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

	const userColumns = await getUserColumns(
		locals.session.id,
		locals.session.team.users.map((user) => user.id)
	);

	return {
		ticketForm: await superValidate(ticketSchema),
		flagForm: await superValidate(flagSchema),
		writeupForm: await superValidate(writeupSchema),
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

const writeupSchema = z.object({
	challengeId: z.string(),
	link: z.string().url()
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
			discordId: locals.session.discord!.id,
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

		const solve = await prisma.solve.findFirst({
			where: {
				userId: {
					in: locals.session.team.users.map((user) => user.id)
				},
				challengeId: form.data.challengeId
			}
		});
		if (solve) return fail(500, { form });

		const challenge = await prisma.challenge.findUnique({
			where: { id: form.data.challengeId },
			select: { flag: true }
		});
		if (!challenge) return fail(404);

		if (challenge.flag !== form.data.flag) return setError(form, 'flag', 'Incorrect flag');

		await prisma.solve.create({
			data: {
				challengeId: form.data.challengeId,
				userId: locals.session.id,
				teamId: locals.session.team.id
			}
		});

		return { form };
	},
	writeup: async ({ request, locals }) => {
		if (!locals.session) {
			return fail(401);
		}

		const form = await superValidate(request, writeupSchema);
		if (!form.valid) {
			return fail(400, { form });
		}

		const solve = await prisma.solve.findFirst({
			where: {
				userId: {
					in: locals.session.team.users.map((user) => user.id)
				},
				challengeId: form.data.challengeId
			}
		});
		if (!solve) return fail(500, { form });

		await prisma.writeup.create({
			data: {
				challengeId: form.data.challengeId,
				userId: locals.session.id,
				link: form.data.link
			}
		});

		return { form };
	}
};
