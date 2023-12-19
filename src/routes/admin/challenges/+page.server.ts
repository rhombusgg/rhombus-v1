import prisma from '$lib/db.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals, depends }) => {
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

	depends('app:admin:challenges');

	return {};
};
