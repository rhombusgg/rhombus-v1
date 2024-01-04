import { isUserInGuild } from '$lib/bot';
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	if (!locals.session) {
		throw redirect(302, '/signin');
	}

	let inGuild = false;
	if (locals.session.discord) {
		inGuild = await isUserInGuild(locals.session.discord.id, '1160610137703186636');
	}

	return {
		inGuild
	};
};
