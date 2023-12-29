import prisma from '$lib/db';
import { avatarFallback } from '$lib/utils';

export async function getUserColumns(userId: string) {
	const dbChallenges = await prisma.challenge.findMany({
		select: {
			id: true,
			slug: true,
			name: true,
			description: true,
			issueTemplate: true,
			difficulty: true,
			points: true,
			category: true,
			health: {
				select: {
					healthy: true,
					lastChecked: true
				}
			},
			author: {
				select: {
					discord: {
						select: {
							id: true,
							image: true,
							globalUsername: true,
							username: true
						}
					}
				}
			},
			solves: {
				where: {
					userId
				},
				select: {
					time: true,
					user: {
						select: {
							id: true,
							discord: {
								select: {
									id: true,
									image: true,
									globalUsername: true,
									username: true
								}
							},
							emails: {
								take: 1,
								select: {
									email: true
								}
							}
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
		where: { userId },
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
			userId,
			name: category,
			order: 0
		}))
	});
	const updatedColumns = await prisma.userColumns.findMany({
		where: { userId },
		select: {
			name: true,
			id: true
		}
	});

	// Manage challenges
	await prisma.user.update({
		where: { id: userId },
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
					userId
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
			userId,
			name: { in: deletedCategories.map((column) => column.name) }
		}
	});

	// Get final board
	const columns = await prisma.userColumns.findMany({
		where: { userId },
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
		challenges: column.challenges.map((c) => {
			const challenge = dbChallenges.find((chall) => chall.id === c.challengeId)!;
			return {
				id: challenge.id,
				slug: challenge.slug,
				name: challenge.name,
				description: challenge.description,
				category: challenge.category,
				difficulty: challenge.difficulty,
				issueTemplate: challenge.issueTemplate,
				points: challenge.points || 0,
				health: challenge.health,
				authorDiscord: {
					username: challenge.author.discord!.username,
					globalUsername: challenge.author.discord!.globalUsername,
					image: challenge.author.discord!.image,
					id: challenge.author.discord!.id
				},
				solve: challenge.solves.map((solve) => ({
					time: solve.time,
					user: {
						discord: solve.user!.discord,
						email: solve.user!.discord ? undefined : solve.user!.emails[0].email,
						avatarFallback: avatarFallback(solve.user!),
						id: solve.user!.id
					}
				}))[0]
			} satisfies Challenge;
		})
	}));

	return userColumns;
}
