import { redirect } from '@sveltejs/kit';
import prisma from '$lib/db';

export async function GET({ url, locals }) {
	if (!locals.session) {
		throw redirect(302, '/signin');
	}

	const token = url.searchParams.get('token');
	if (!token) {
		throw redirect(302, `/account?error=Missing token url param`);
	}

	const emailVerificationToken = await prisma.emailVerificationToken
		.delete({
			where: { token },
			select: { email: true, expires: true }
		})
		.catch(() => null);

	if (!emailVerificationToken) {
		throw redirect(302, `/account?error=Invalid email verification token`);
	}

	if (emailVerificationToken.expires < new Date()) {
		throw redirect(302, `/account?error=Expired email verification token`);
	}

	const existing = await prisma.email.findUnique({
		where: { email: emailVerificationToken.email },
		select: { userId: true }
	});

	if (existing) {
		throw redirect(302, `/account?error=A user has already verified with this email`);
	}

	await prisma.user.update({
		where: { id: locals.session.id },
		data: {
			emails: {
				create: {
					email: emailVerificationToken.email
				}
			}
		}
	});

	throw redirect(302, `/account`);
}
