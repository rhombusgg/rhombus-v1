import nodemailer from 'nodemailer';
import { env as privateEnv } from '$env/dynamic/private';

const transporter = nodemailer.createTransport({
	host: privateEnv.SMTP_HOST,
	port: 587,
	auth: {
		user: privateEnv.SMTP_USER,
		pass: privateEnv.SMTP_PASSWORD
	}
});

export async function sendEmail({
	to,
	subject,
	text,
	html
}: {
	to: string;
	subject: string;
	text: string;
	html: string;
}) {
	await transporter.sendMail({
		from: privateEnv.SMTP_FROM,
		to,
		subject,
		html,
		text
	});
}
