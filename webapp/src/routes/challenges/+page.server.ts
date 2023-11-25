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

	const board = await prisma.userColumns.findMany({
		where: { userId: locals.session.id },
		select: {
			challenges: { select: { challengeId: true } },
			name: true,
			id: true
		}
	});
	const newCategories = categories.filter(
		(category) => !board.some((column) => column.name === category)
	);
	const deletedCategories = board.filter(
		(column) => !categories.some((category) => category === column.name)
	);
	const userChallenges = board.flatMap((column) => column.challenges);
	const newChallenges = dbChallenges.filter(
		(challenge) =>
			!userChallenges.some((userChallenge) => userChallenge.challengeId === challenge.id)
	);
	const deletedChallenges = userChallenges.filter(
		(userChallenge) => !dbChallenges.some((challenge) => challenge.id === userChallenge.challengeId)
	);

	// Create new categories
	await prisma.userColumns.createMany({
		data: newCategories.map((category) => ({
			userId: locals.session!.id,
			name: category,
			order: 0
		}))
	});
	const updatedColumns = await prisma.userColumns.findMany({
		where: { userId: locals.session.id },
		select: {
			name: true,
			id: true
		}
	});

	// Manage challenges
	await prisma.user.update({
		where: { id: locals.session.id },
		data: {
			userChallenges: {
				createMany: {
					data: newChallenges.map((challenge) => ({
						challengeId: challenge.id,
						columnId: updatedColumns.find((column) => column.name === challenge.category)!.id,
						order: 0
					}))
				},
				updateMany: deletedCategories.flatMap((column) =>
					column.challenges.flatMap((challenge) => {
						const category = dbChallenges.find((chall) => chall.id === challenge.challengeId)
							?.category;
						if (!category) return [];
						return {
							where: { challengeId: challenge.challengeId },
							data: {
								columnId: updatedColumns.find((c) => c.name === category)!.id
							}
						};
					})
				),
				deleteMany: deletedChallenges.map((userChallenge) => ({
					challengeId: userChallenge.challengeId,
					userId: locals.session!.id
				}))
			}
		},
		select: {
			id: true
		}
	});

	// Delete old categories
	await prisma.userColumns.deleteMany({
		where: {
			userId: locals.session.id,
			name: { in: deletedCategories.map((column) => column.name) }
		}
	});

	// Get final board
	const columns = await prisma.userColumns.findMany({
		where: { userId: locals.session.id },
		select: {
			challenges: { select: { challengeId: true }, orderBy: { order: 'asc' } },
			name: true,
			id: true
		},
		orderBy: { order: 'asc' }
	});

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
