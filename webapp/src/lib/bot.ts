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

client.login(env.DISCORD_TOKEN);

export async function isUserInGuild(userId: string, guildId: string) {
	const guild = await client.guilds.fetch(guildId);
	const member = await guild.members.fetch(userId);
	return member ? true : false;
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
		.filter((channel) => channel?.isTextBased() && channel.manageable)
		.map((channel) => channel as NonThreadGuildBasedChannel);
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
