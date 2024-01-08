import prisma from '$lib/db';
import { error, redirect } from '@sveltejs/kit';

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

	const challenge = await prisma.challenge.findFirst({
		where: {
			id: params.challengeId
		},
		select: {
			name: true,
			slug: true,
			writeups: {
				select: {
					link: true,
					user: {
						select: {
							id: true,
							team: {
								select: {
									id: true,
									name: true
								}
							},
							discord: {
								select: {
									id: true,
									image: true,
									username: true,
									globalUsername: true
								}
							},
							emails: {
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

	if (!challenge) throw error(404);

	return {
		challenge
	};
};
