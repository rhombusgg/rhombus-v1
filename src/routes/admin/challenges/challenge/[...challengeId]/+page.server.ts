import prisma from '$lib/db.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms/client';
import { z } from 'zod';

export const load = async ({ locals, params }) => {
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

	const existingChallenge = await prisma.challenge.findFirst({
		where: {
			id: params.challengeId
		}
	});

	const challenges = await prisma.challenge.findMany({
		select: {
			difficulty: true,
			category: true
		}
	});

	const categories = challenges
		.map((challenge) => challenge.category)
		.filter((value, index, array) => array.indexOf(value) === index);

	const difficulties = challenges
		.map((challenge) => challenge.difficulty)
		.filter((value, index, array) => array.indexOf(value) === index);

	const challengeForm = await superValidate(challengeSchema);

	return {
		challengeForm,
		categories,
		difficulties,
		existingChallenge
	};
};

const challengeSchema = z.object({
	existingChallengeId: z.string().optional(),
	name: z.string().min(1, 'You must name the challenge'),
	slug: z.string(),
	description: z.string().min(1, 'You must provide a description'),
	healthcheck: z.string().optional(),
	issueTemplate: z.string(),
	difficulty: z.string().min(1, 'You must select a difficulty level'),
	points: z.number().positive().optional(),
	category: z.string().min(1, 'You must select a category'),
	flag: z.string().min(1, 'You must set a flag')
});

export const actions = {
	createChallenge: async ({ locals, request }) => {
		await isAdmin(locals);

		const form = await superValidate(request, challengeSchema);

		if (!form.data.existingChallengeId) {
			const existingChallenge = await prisma.challenge.findFirst({
				where: {
					slug: form.data.slug
				}
			});

			if (existingChallenge) {
				return setError(form, 'slug', 'Challnge with slug already exists');
			}
		}

		if (!form.valid) {
			return fail(400, { form });
		}

		const data = {
			name: form.data.name,
			slug: form.data.slug,
			authorId: locals.session!.id,
			description: form.data.description,
			issueTemplate: form.data.issueTemplate,
			healthCheckTypescript: form.data.healthcheck || null,
			category: form.data.category,
			difficulty: form.data.difficulty,
			flag: form.data.flag
		};
		console.log(data);

		await prisma.challenge.upsert({
			where: {
				id: form.data.existingChallengeId
			},
			create: data,
			update: data
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
