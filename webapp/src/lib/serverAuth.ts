import { JWT_SECRET } from '$env/static/private';
import type { Cookies } from '@sveltejs/kit';
import * as jose from 'jose';
import { z } from 'zod';

const SESSION_TOKEN_COOKIE = 'session-token';

const jwtSecret = new TextEncoder().encode(JWT_SECRET);

const jwtSchema = z.object({
	sessionId: z.string(),
	expires: z.coerce.date()
});

export type Jwt = z.infer<typeof jwtSchema>;

export async function setJwt(jwt: Jwt, cookies: Cookies) {
	const token = await new jose.SignJWT(jwt)
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt(new Date())
		.setExpirationTime(jwt.expires)
		.sign(jwtSecret);

	cookies.set(SESSION_TOKEN_COOKIE, token, {
		expires: jwt.expires,
		path: '/'
	});
}

export function clearJwt(cookies: Cookies) {
	cookies.delete(SESSION_TOKEN_COOKIE, { path: '/' });
}

export async function getJwt(cookies: Cookies): Promise<Jwt | null> {
	const token = cookies.get(SESSION_TOKEN_COOKIE);
	if (!token) {
		return null;
	}

	try {
		const data = await jose.jwtVerify(token, jwtSecret, {
			algorithms: ['HS256']
		});
		return jwtSchema.parse(data.payload);
	} catch (e) {
		return null;
	}
}
