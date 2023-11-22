import prisma from '$lib/db';
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	if (!locals.session) {
		throw redirect(302, '/signin');
	}

	const user = await prisma.user.findUnique({
		where: {
			id: locals.session.id
		},
		select: {
			team: {
				select: {
					id: true,
					name: true,
					users: {
						select: {
							discord: { select: { username: true, globalUsername: true, image: true } },
							emails: { select: { email: true }, take: 1 }
						}
					}
				}
			}
		}
	});

	if (!user) {
		throw redirect(302, '/signin');
	}

	const team: {
		name: string;
		users: {
			discord: {
				username: string;
				globalUsername: string;
				image: string;
			} | null;
			email: string | undefined;
		}[];
	} = {
		name: user.team!.name,
		users: user.team!.users.map((user) => ({
			discord: user.discord,
			email: user.discord ? undefined : user.emails[0].email
		}))
	};
	return {
		team
	};
};
