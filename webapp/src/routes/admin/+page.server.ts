import { getGuilds, getRoles, getTextChannels } from '$lib/bot.js';
import prisma from '$lib/db.js';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';

export const load = async ({ locals }) => {
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

	const discordBot = await prisma.discordBot.findFirst();

	return {
		guilds: (await getGuilds()).map((guild) => ({ label: guild.name, value: guild.id })),
		textChannels: (await getTextChannels())?.map((channel) => ({
			label: `#${channel.name}`,
			value: channel.id
		})),
		roles: (await getRoles())?.map((role) => ({ label: `@${role.name}`, value: role.id })),
		botSettings: discordBot
	};
};

export const actions = {
	supportChannel: async ({ locals, request }) => {
		await isAdmin(locals);

		const data = z
			.object({ channelId: z.string() })
			.parse(Object.fromEntries((await request.formData()).entries()));

		const discordBot = await prisma.discordBot.findFirst();
		if (!discordBot) throw error(500, 'No bot found');

		await prisma.discordBot.update({
			where: {
				id: discordBot.id
			},
			data: {
				supportChannelId: data.channelId
			}
		});
	},

	verifiedRoleId: async ({ locals, request }) => {
		await isAdmin(locals);

		const data = z
			.object({ verifiedRoleId: z.string() })
			.parse(Object.fromEntries((await request.formData()).entries()));

		const discordBot = await prisma.discordBot.findFirst();
		if (!discordBot) throw error(500, 'No bot found');

		await prisma.discordBot.update({
			where: {
				id: discordBot.id
			},
			data: {
				verifiedRoleId: data.verifiedRoleId
			}
		});
	}
};

const isAdmin = async (locals: App.Locals) => {
	if (!locals.session) {
		throw error(401, 'Not logged in');
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
		throw error(403, 'Not an admin');
	}
};
