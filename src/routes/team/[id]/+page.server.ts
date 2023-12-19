import prisma from '$lib/db';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const team = await prisma.team.findFirst({
		where: { id: params.id },
		select: {
			name: true,
			users: {
				select: {
					solves: {
						select: {
							time: true,
							challenge: {
								select: {
									name: true,
									humanId: true
								}
							}
						}
					}
				}
			}
		}
	});

	if (!team) throw error(404);

	return {
		team
	};
};
