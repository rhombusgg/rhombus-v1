import prisma from '$lib/db';
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
		},
		include: {
			health: true
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
	ticketTemplate: z.string(),
	difficulty: z.string().min(1, 'You must select a difficulty level'),
	points: z.number().positive().optional(),
	category: z.string().min(1, 'You must select a category'),
	flag: z.string().min(1, 'You must set a flag')
});

export const actions = {
	createChallenge: async ({ locals, request }) => {
		await isAdmin(locals);

		const form = await superValidate(request, challengeSchema);

		const existingChallenge = await prisma.challenge.findFirst({
			where: {
				id: { not: form.data.existingChallengeId },
				slug: form.data.slug
			}
		});

		if (existingChallenge) {
			return setError(form, 'slug', 'Challenge with slug already exists');
		}

		if (!form.valid) {
			return fail(400, { form });
		}

		const data = {
			name: form.data.name,
			slug: form.data.slug,
			authorId: locals.session!.id,
			description: form.data.description,
			ticketTemplate: form.data.ticketTemplate,
			category: form.data.category,
			points: form.data.points || null,
			difficulty: form.data.difficulty,
			flag: form.data.flag
		};

		if (!form.data.existingChallengeId && !form.data.healthcheck) {
			await prisma.challenge.create({
				data
			});
		} else if (!form.data.existingChallengeId && form.data.healthcheck) {
			await prisma.challenge.create({
				data: {
					...data,
					health: {
						create: {
							script: form.data.healthcheck
						}
					}
				}
			});
		} else if (form.data.existingChallengeId && !form.data.healthcheck) {
			if (
				await prisma.challengeHealth.findFirst({
					where: { challengeId: form.data.existingChallengeId }
				})
			)
				await prisma.challengeHealth.delete({
					where: { challengeId: form.data.existingChallengeId }
				});
			await prisma.challenge.update({
				where: { id: form.data.existingChallengeId },
				data
			});
		} else if (form.data.existingChallengeId && form.data.healthcheck) {
			await prisma.challenge.update({
				where: { id: form.data.existingChallengeId },
				data: {
					...data,
					health: {
						upsert: {
							where: { challengeId: form.data.existingChallengeId },
							create: {
								script: form.data.healthcheck
							},
							update: {
								script: form.data.healthcheck
							}
						}
					}
				}
			});
		}

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
