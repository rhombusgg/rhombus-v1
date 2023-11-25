import { goto } from '$app/navigation';
import { env } from '$env/dynamic/public';

export const signInDiscordUrl = `https://discord.com/api/oauth2/authorize?client_id=${
	env.PUBLIC_DISCORD_CLIENT_ID
}&redirect_uri=${encodeURIComponent(
	`${env.PUBLIC_LOCATION_URL}/api/discord/callback`
)}&response_type=code&scope=identify`;

export async function signInDiscord() {
	window.location.assign(signInDiscordUrl);
}

export async function signOut() {
	goto('/api/signout');
}
