import {
	Client,
	Events,
	GatewayIntentBits,
	type TextChannel,
	type NonThreadGuildBasedChannel,
	ChannelType,
	ComponentType,
	ButtonStyle
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
	const discordBot = await prisma.discordBot.findFirst();
	if (!discordBot) return;

	if (discordBot.verifiedRoleId) await member.roles.add(discordBot.verifiedRoleId);
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

export async function getTextChannels(guildId: string) {
	const guild = await client.guilds.fetch(guildId);
	const channels = await guild.channels.fetch();
	return channels
		.filter(
			(channel) =>
				channel &&
				channel.type == ChannelType.GuildText &&
				channel.client.user &&
				channel.manageable
		)
		.map((channel) => channel as NonThreadGuildBasedChannel);
}

export async function getRoles(guildId: string) {
	const guild = await client.guilds.fetch(guildId);
	const roles = await guild.roles.fetch();
	const botRole = guild.roles.botRoleFor(guild.client.user!);

	return roles
		.filter((role) => role && guild.roles.everyone.id !== role.id && botRole?.id !== role.id)
		.map((role) => ({ name: role.name, id: role.id, editable: role.editable }));
}

export async function verifyUser(userId: string) {
	const discordBot = await prisma.discordBot.findFirst();
	if (!discordBot) throw new Error('No discord bot found');
	if (!discordBot.verifiedRoleId) return undefined;
	// if (!discordBot.verifiedRoleId) throw new Error('No verified role found');

	const guild = await client.guilds.fetch(discordBot.guildId);
	try {
		const member = await guild.members.fetch(userId);
		if (!member) return;
		await member.roles.add(discordBot.verifiedRoleId);
	} catch {
		// user not in guild
	}
}

export async function sendPanel(supportChannelId: string) {
	const discordBot = await prisma.discordBot.findFirst();
	if (!discordBot) return undefined;

	const guild = await client.guilds.fetch(discordBot.guildId);
	const supportChannel = (await guild.channels.fetch(supportChannelId)) as TextChannel;
	await supportChannel.send({
		embeds: [
			{
				color: 0x0099ff,
				title: 'Support',
				description:
					'Submit a ticket for a challenge from the CTF website by clicking on the :tickets: button in the header of the challenge in question.'
			}
		],
		components: [
			{
				type: ComponentType.ActionRow,
				components: [
					{
						type: ComponentType.Button,
						style: ButtonStyle.Link,
						label: 'Go to Challenges',
						url: 'http://localhost:5173/challenges'
					}
				]
			}
		]
	});
}

export async function createSupportThread({
	discordId,
	challengeId,
	content
}: {
	discordId: string;
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
			author: { select: { discord: { select: { id: true } } } },
			category: { select: { name: true } },
			slug: true
		}
	});
	if (!challenge) return undefined;

	const user = await prisma.user.findFirstOrThrow({
		where: { discord: { id: discordId } },
		select: {
			team: { select: { name: true, id: true } },
			id: true
		}
	});

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
		name: `${ticketNumber.ticketNumber}-${challenge.name}-${user.team!.name}`,
		type: ChannelType.PrivateThread
	});

	await thread.send({
		embeds: [
			{
				color: 0x0099ff,
				title: 'Ticket',
				fields: [
					{
						name: ':identification_card: Opened By',
						value: `<@${discordId}> [:link:](http://localhost:5173/user/${user.id})`,
						inline: true
					},
					{
						name: ':red_square: Team',
						value: `[${user.team!.name}](http://localhost:5173/team/${user.team!.id})`,
						inline: true
					},
					{
						name: ':watch: Opened',
						value: `<t:${Math.floor(new Date().getTime() / 1000)}:F>`,
						inline: true
					},
					{
						name: ':crossed_swords: Challenge',
						value: `[${challenge.name}](http://localhost:5173/challenges?challenge=${challenge.slug})`,
						inline: true
					},
					{
						name: ':bookmark: Author',
						value: `<@${challenge.author.discord!.id}>`,
						inline: true
					},
					{
						name: '',
						value: '',
						inline: true
					}
				]
			}
		],
		components: [
			{
				type: ComponentType.ActionRow,
				components: [
					{
						label: 'Close Ticket',
						customId: 'close-ticket',
						type: ComponentType.Button,
						style: ButtonStyle.Primary,
						emoji: '🔒'
					}
				]
			}
		]
	});

	await thread.send(content);
	await thread.members.add(discordId!);
	await thread.members.add(challenge.author.discord!.id);

	return thread;
}
