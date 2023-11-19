import { SvelteKitAuth } from '@auth/sveltekit';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import Discord from '@auth/core/providers/discord';

import { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET } from '$env/static/private';

const auth = SvelteKitAuth({
	providers: [
		Discord({
			clientId: DISCORD_CLIENT_ID,
			clientSecret: DISCORD_CLIENT_SECRET,
			authorization: 'https://discord.com/api/oauth2/authorize?scope=identify'
		})
	]
});

const ip: Handle = async ({ event, resolve }) => {
	const ip = event.getClientAddress();
	const session = await event.locals.getSession();
	console.log(ip);
	console.log(session);
	return resolve(event);
};

export const handle = sequence(auth, ip);
