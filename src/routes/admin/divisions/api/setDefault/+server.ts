import prisma from '$lib/db';
import { json } from '@sveltejs/kit';
import { z } from 'zod';

export async function POST({ locals, request }) {
	if (!locals.session?.isAdmin) {
		return json(
			{ status: 'error', message: 'Not authorized' },
			{
				status: 403
			}
		);
	}

	const data = z
		.object({
			divisionId: z.string()
		})
		.parse(await request.json());

	await prisma.$transaction([
		prisma.division.updateMany({
			data: {
				isDefault: false
			}
		}),
		prisma.division.update({
			where: {
				id: data.divisionId
			},
			data: {
				isDefault: true
			}
		})
	]);

	return json({ status: 'success' });
}
