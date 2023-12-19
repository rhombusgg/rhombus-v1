import prisma from '$lib/db';
import { error } from '@sveltejs/kit';
import { z } from 'zod';

export async function PUT({ locals, request }) {
	if (!locals.session) {
		throw error(403, 'Not logged in');
	}

	const columns = z
		.array(
			z.object({
				id: z.string(),
				name: z.string(),
				items: z.array(z.object({ challengeId: z.string() }))
			})
		)
		.parse(await request.json());

	await prisma.user.update({
		where: { id: locals.session.id },
		data: {
			columns: {
				updateMany: columns.map((column, i) => ({
					where: { name: column.name },
					data: {
						order: i
					}
				}))
			},
			userChallenges: {
				updateMany: columns
					.map((column) =>
						column.items.map((item, i) => ({
							where: { challengeId: item.challengeId },
							data: { order: i, columnId: column.id }
						}))
					)
					.flat()
			}
		},
		select: {
			id: true
		}
	});

	return new Response();
}
