import { clearJwt } from '$lib/serverAuth.js';
import { redirect } from '@sveltejs/kit';

export async function GET({ url, cookies }) {
	clearJwt(cookies);

	const callbackUrl = url.searchParams.get('callbackUrl');
	if (!callbackUrl) {
		throw redirect(302, callbackUrl ?? `/`);
	}

	throw redirect(302, `/`);
}
