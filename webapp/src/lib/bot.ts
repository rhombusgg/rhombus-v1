import {
	Client,
	Events,
	GatewayIntentBits,
	type TextChannel,
	type NonThreadGuildBasedChannel,
	ChannelType
} from 'discord.js';
import { env } from '$env/dynamic/private';
import prisma from '$lib/db';

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers
	]
});

client.once(Events.ClientReady, async (c) => {
	console.log(`Ready! Logged in as ${c.user.tag}`);

	// set a default guild for the bot if there is no current guild
	const firstGuild = c.guilds.cache.first();
	if ((await prisma.discordBot.count()) == 0 && firstGuild) {
		await prisma.discordBot.create({
			data: {
				guildId: firstGuild.id
			}
		});
	}
});

client.on(Events.GuildCreate, async (guild) => {
	console.log(`Joined guild ${guild.name}`);

	// set a default guild for the bot if there is no current guild
	if ((await prisma.discordBot.count()) == 0) {
		await prisma.discordBot.create({
			data: {
				guildId: guild.id
			}
		});
	}
});

client.on(Events.GuildMemberAdd, async (member) => {
	const user = await prisma.discord.findUnique({
		where: { id: member.id },
		select: { user: { select: { team: { select: { discordRoleId: true } } } } }
	});
	if (!user?.user.team) return;

	const discordBot = await prisma.discordBot.findFirst();
	if (!discordBot) return;

	if (discordBot.verifiedRoleId) await member.roles.add(discordBot.verifiedRoleId);

	const guild = await client.guilds.fetch(discordBot.guildId);
	const teamRole = await guild.roles.fetch(user.user.team.discordRoleId);
	if (!teamRole) return;
	await member.roles.add(teamRole);
});

client.login(env.DISCORD_TOKEN);

export async function isUserInGuild(userId: string, guildId: string) {
	const guild = await client.guilds.fetch(guildId);
	try {
		const member = await guild.members.fetch(userId);
		return member ? true : false;
	} catch {
		return false;
	}
}

export async function getGuilds() {
	const guilds = await client.guilds.fetch();
	return guilds;
}

export async function getTextChannels() {
	const discordBot = await prisma.discordBot.findFirst();
	if (!discordBot) return undefined;

	const guild = await client.guilds.fetch(discordBot.guildId);
	const channels = await guild.channels.fetch();
	return channels
		.filter(
			(channel) => channel && channel.isTextBased() && channel.client.user && channel.manageable
		)
		.map((channel) => channel as NonThreadGuildBasedChannel);
}

export async function getRoles() {
	const discordBot = await prisma.discordBot.findFirst();
	if (!discordBot) return undefined;

	const guild = await client.guilds.fetch(discordBot.guildId);
	const roles = await guild.roles.fetch();
	return roles.filter((role) => role && role.client.user && role.editable);
}

export async function createRole(name: string) {
	const discordBot = await prisma.discordBot.findFirst();
	if (!discordBot) throw new Error('No discord bot found');

	const guild = await client.guilds.fetch(discordBot.guildId);
	const role = await guild.roles.create({
		name: name,
		color: 'Blurple',
		reason: `rhombus-managed team`
	});
	return role;
}

export async function renameRole(roleId: string, name: string) {
	const discordBot = await prisma.discordBot.findFirst();
	if (!discordBot) throw new Error('No discord bot found');

	const guild = await client.guilds.fetch(discordBot.guildId);
	const role = await guild.roles.fetch(roleId);
	if (!role) return;
	await role.edit({ name });
}

export async function changeUsersRole(userId: string, oldRoleId: string, newRoleId: string) {
	const discordBot = await prisma.discordBot.findFirst();
	if (!discordBot) throw new Error('No discord bot found');

	const guild = await client.guilds.fetch(discordBot.guildId);
	const member = await guild.members.fetch(userId);
	const oldRole = await guild.roles.fetch(oldRoleId);
	const newRole = await guild.roles.fetch(newRoleId);
	if (!oldRole || !newRole) return;
	await member.roles.remove(oldRole);
	await member.roles.add(newRole);
}

export async function joinUserToRole(userId: string, roleId: string) {
	const discordBot = await prisma.discordBot.findFirst();
	if (!discordBot) throw new Error('No discord bot found');

	const guild = await client.guilds.fetch(discordBot.guildId);
	try {
		const member = await guild.members.fetch(userId);
		const role = await guild.roles.fetch(roleId);
		if (!role) return;
		await member.roles.add(role);
	} catch {
		// user not in guild
	}
}

export async function verifyUser(userId: string) {
	const discordBot = await prisma.discordBot.findFirst();
	if (!discordBot) throw new Error('No discord bot found');
	if (!discordBot.verifiedRoleId) throw new Error('No verified role found');

	const guild = await client.guilds.fetch(discordBot.guildId);
	try {
		const member = await guild.members.fetch(userId);
		if (!member) return;
		await member.roles.add(discordBot.verifiedRoleId);
	} catch {
		// user not in guild
	}
}

export async function createSupportThread({
	discordId,
	challengeId,
	content
}: {
	discordId: string | undefined;
	challengeId: string;
	content: string;
}) {
	const discordBot = await prisma.discordBot.findFirst();
	if (!discordBot) return undefined;
	if (!discordBot.supportChannelId) return undefined;

	const challenge = await prisma.challenge.findUnique({
		where: { id: challengeId },
		select: {
			name: true,
			author: { select: { discord: { select: { id: true } } } }
		}
	});
	if (!challenge) return undefined;

	const ticketNumber = await prisma.discordBot.update({
		where: { id: discordBot.id },
		data: {
			ticketNumber: { increment: 1 }
		},
		select: { ticketNumber: true }
	});

	const guild = await client.guilds.fetch(discordBot.guildId);
	const channel = (await guild.channels.fetch(discordBot.supportChannelId)) as TextChannel;
	const thread = await channel.threads.create({
		name: `ticket-${ticketNumber.ticketNumber}`,
		type: ChannelType.PrivateThread
	});

	await thread.members.add(discordId!);
	await thread.members.add(challenge.author.discord!.id);

	await thread.send(content);

	return thread;
}
