import { goto } from '$app/navigation';
import { PUBLIC_DISCORD_CLIENT_ID, PUBLIC_LOCATION_URL } from '$env/static/public';

export const signInDiscordUrl = `https://discord.com/api/oauth2/authorize?client_id=${PUBLIC_DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
	`${PUBLIC_LOCATION_URL}/api/discord/callback`
)}&response_type=code&scope=identify`;

export async function signInDiscord() {
	window.location.assign(signInDiscordUrl);
}

export async function signOut() {
	goto('/api/signout');
}
