import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/client';
import { z } from 'zod';
import prisma from '$lib/db';
import { dynamicPoints } from '$lib/utils';

const categoryFormSchema = z.object({
	existingId: z.string().optional(),
	name: z.string().max(20),
	color: z.string().regex(/^#[0-9a-f]{6}$/)
});

export type CategoryFormSchema = typeof categoryFormSchema;

export const load = async ({ locals, depends }) => {
	depends('app:admin:challenges');

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

	const challenges = await prisma.challenge.findMany({
		select: {
			id: true,
			name: true,
			slug: true,
			description: true,
			category: true,
			difficulty: true,
			flag: true,
			ticketTemplate: true,
			points: true,
			authorId: true,
			_count: {
				select: {
					writeups: true
				}
			},
			solves: {
				distinct: ['teamId'],
				select: {
					id: true
				}
			}
		}
	});

	const categories = await prisma.category.findMany();

	return {
		challenges: challenges.map((challenge) => ({
			id: challenge.id,
			name: challenge.name,
			slug: challenge.slug,
			description: challenge.description,
			category: challenge.category,
			difficulty: challenge.difficulty,
			flag: challenge.flag,
			ticketTemplate: challenge.ticketTemplate,
			points: challenge.points || dynamicPoints(challenge.solves.length),
			isDynamicScoring: !challenge.points,
			authorId: challenge.authorId,
			writeupCount: challenge._count.writeups,
			solveCount: challenge.solves.length
		})),
		categories,
		categoryForm: await superValidate(categoryFormSchema)
	};
};

export const actions = {
	category: async ({ request, locals }) => {
		if (!locals.session?.isAdmin) {
			return fail(403, { message: 'Not authorized' });
		}

		const form = await superValidate(request, categoryFormSchema);

		if (!form.valid) {
			return fail(400, { form });
		}

		if (form.data.existingId) {
			await prisma.category.update({
				where: {
					id: form.data.existingId
				},
				data: {
					name: form.data.name,
					color: form.data.color
				}
			});
		} else {
			await prisma.category.create({
				data: {
					name: form.data.name,
					color: form.data.color
				}
			});
		}

		return { form };
	}
};
