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

	const newDefaultDivision = await prisma.division.findFirst({
		where: {
			isDefault: false
		}
	});

	if (!newDefaultDivision) {
		return json({ status: 'error' }, { status: 500 });
	}

	const deletedDivision = await prisma.division.delete({
		where: {
			id: data.divisionId
		}
	});

	if (deletedDivision.isDefault) {
		await prisma.division.update({
			where: {
				id: newDefaultDivision.id
			},
			data: {
				isDefault: true
			}
		});
	}

	return json({ status: 'success' });
}
