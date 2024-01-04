import prisma from '$lib/db';
import { clearJwt, getJwt } from '$lib/serverAuth';
import { redirect } from '@sveltejs/kit';

export async function GET({ url, cookies }) {
	const jwt = await getJwt(cookies);
	if (jwt) {
		await prisma.session.delete({
			where: {
				id: jwt.sessionId
			}
		});

		clearJwt(cookies);
	}

	const callbackUrl = url.searchParams.get('callbackUrl');
	if (!callbackUrl) {
		throw redirect(302, callbackUrl ?? `/`);
	}

	throw redirect(302, `/`);
}
