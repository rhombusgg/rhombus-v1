import prisma from '$lib/db';
import { redirect } from '@sveltejs/kit';
import { z } from 'zod';

export const load = async ({ locals }) => {
	if (!locals.session) {
		throw redirect(302, '/signin');
	}

	const dbChallenges = await prisma.challenge.findMany({
		select: {
			id: true,
			humanId: true,
			name: true,
			description: true,
			issueTemplate: true,
			difficulty: true,
			points: true,
			category: true,
			author: {
				select: {
					discord: {
						select: {
							image: true,
							globalUsername: true
						}
					}
				}
			}
		}
	});

	const categories = dbChallenges
		.map((challenge) => challenge.category)
		.filter((v, i, a) => a.indexOf(v) === i);

	let columns = await prisma.userColumns.findMany({
		where: { userId: locals.session.id },
		select: {
			challenges: { select: { challengeId: true }, orderBy: { order: 'asc' } },
			name: true,
			id: true
		},
		orderBy: { order: 'asc' }
	});

	if (!columns || columns.length === 0) {
		const user = await prisma.user.update({
			where: { id: locals.session.id },
			data: {
				columns: {
					create: categories.map((category, i) => ({
						name: category,
						order: i,
						challenges: {
							createMany: {
								data: dbChallenges
									.filter((challenge) => challenge.category === category)
									.map((challenge, j) => ({
										challengeId: challenge.id,
										order: j,
										userId: locals.session!.id
									}))
							}
						}
					}))
				}
			},
			select: {
				columns: { select: { challenges: { select: { challengeId: true } }, name: true, id: true } }
			}
		});

		columns = user.columns;
	}

	const userColumns = columns.map((column) => ({
		id: column.id,
		name: column.name,
		challenges: column.challenges.map((challenge) => ({
			...dbChallenges.find((chall) => chall.id === challenge.challengeId)!
		}))
	}));

	return {
		userColumns
	};
};

export const actions = {
	ticket: async ({ request, locals }) => {
		if (!locals.session) {
			throw redirect(302, '/signin');
		}

		const data = z
			.object({ challengeId: z.string(), content: z.string() })
			.parse(Object.fromEntries((await request.formData()).entries()));

		console.log(data);
	}
};
