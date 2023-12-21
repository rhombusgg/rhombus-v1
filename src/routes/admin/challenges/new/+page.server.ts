import prisma from '$lib/db.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms/client';
import { z } from 'zod';

export const load = async ({ locals }) => {
	if (!locals.session) {
		throw redirect(302, '/signin');
	}

	const user = await prisma.user.findUnique({
		where: {
			id: locals.session.id
		},
		select: {
			isAdmin: true
		}
	});

	if (!user?.isAdmin) {
		throw redirect(302, '/account');
	}

	const challengeForm = await superValidate(challengeSchema);

	return {
		challengeForm
	};
};

const challengeSchema = z.object({
	name: z.string().min(1, 'You must name the challenge'),
	slug: z.string(),
	description: z.string().min(1, 'You must provide a description'),
	healthcheck: z.string().optional(),
	issueTemplate: z.string(),
	difficulty: z.string().min(1, 'You must select a difficulty level'),
	points: z.number().positive().optional(),
	category: z.string().min(1, 'You must select a category'),
	flag: z.string().min(1)
});

export const actions = {
	createChallenge: async ({ locals, request }) => {
		await isAdmin(locals);

		const form = await superValidate(request, challengeSchema);
		console.log(form.data);
		console.log(form.errors);

		if (!form.valid) {
			return fail(400, { form });
		}

		const existingChallenge = await prisma.challenge.findFirst({
			where: {
				slug: form.data.slug
			}
		});

		if (existingChallenge) {
			return setError(form, 'slug', 'Challnge with slug already exists');
		}

		await prisma.challenge.create({
			data: {
				name: form.data.name,
				slug: form.data.slug,
				authorId: locals.session!.id,
				description: form.data.description,
				issueTemplate: form.data.issueTemplate,
				healthCheckTypescript: form.data.healthcheck,
				category: form.data.category,
				difficulty: form.data.difficulty,
				flag: form.data.flag
			}
		});

		return { form };
	}
};

const isAdmin = async (locals: App.Locals) => {
	if (!locals.session) {
		throw error(401, 'Not logged in');
	}

	const user = await prisma.user.findUnique({
		where: {
			id: locals.session.id
		},
		select: {
			isAdmin: true
		}
	});

	if (!user?.isAdmin) {
		throw error(403, 'Not an admin');
	}
};
