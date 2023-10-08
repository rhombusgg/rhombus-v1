import { channel } from "diagnostics_channel";
import { ChannelType, Client, IntentsBitField, TextChannel } from "discord.js";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const DISCORD_TOKEN = z
  .string({
    required_error: "DISCORD_TOKEN environment variable must be set!",
    invalid_type_error: "DISCORD_TOKEN environment variable must be a string!",
  })
  .parse(process.env.DISCORD_TOKEN);

const client = new Client({
  intents: ["GuildMembers"],
});

client.on("debug", (info) => {
  console.log(info);
});

client.on("ready", async () => {
  if (!client.user || !client.application) {
    return;
  }

  const guild = client.guilds.cache.first();
  const channels = await guild.channels.fetch();
  const generalChannel = channels.find(
    (channel) => channel.name === "general"
  ) as TextChannel;
  await generalChannel.send("Hello world!");

  console.log(`${client.user.username} is online`);
});

client.on("guildMemberAdd", async (member) => {
  console.log(member.id);
  await member.send("Welcome!");
});

client.login(DISCORD_TOKEN);
