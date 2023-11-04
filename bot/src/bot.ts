import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { Client, Guild, Role, TextChannel } from "discord.js";
import dotenv from "dotenv";
import { z } from "zod";

import { db } from "./db";
import { botRouter } from "./trpc";

export type BotRouter = typeof botRouter;

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

// client.on("debug", (info) => {
//   console.log(info);
// });

export let generalChannel: TextChannel;
export let guild: Guild;
export let verifiedRole: Role;

client.on("ready", async () => {
  if (!client.user || !client.application) {
    return;
  }

  guild = client.guilds.cache.first()!;
  const channels = await guild.channels.fetch();
  generalChannel = channels.find(
    (channel) => channel && channel.name === "general",
  ) as TextChannel;

  const roles = await guild.roles.fetch();
  console.log(roles.map((role) => role.name));
  verifiedRole = roles.find((role) => role.name === "Verified");
  if (!verifiedRole)
    verifiedRole = await guild.roles.create({
      name: "Verified",
      color: "Blue",
      reason: "rhombus-managed verified",
    });

  // await generalChannel.send(
  //   `Rhombus is online! <t:${Math.floor(Date.now() / 1000)}>`
  // );
  console.log(`${client.user.username} is online`);
});

client.on("guildMemberAdd", async (member) => {
  // console.log(member.id);
  // await member.send("Welcome!");

  const user = await db.user.findFirst({
    where: { discordId: member.id },
    select: { team: { select: { discordRoleId: true } } },
  });
  if (user) {
    await member.roles.add(verifiedRole);

    const teamRole = await guild.roles.fetch(user.team.discordRoleId);
    await member.roles.add(teamRole);
  }
});

client.login(DISCORD_TOKEN);

const server = createHTTPServer({
  router: botRouter,
});

server.listen(3001);
