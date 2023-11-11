import { createHTTPServer } from "@trpc/server/adapters/standalone";
import {
  ApplicationCommandOptionType,
  AutocompleteInteraction,
  ButtonStyle,
  ChannelType,
  ChatInputApplicationCommandData,
  Client,
  CommandInteraction,
  ComponentType,
  Guild,
  Role,
  TextChannel,
} from "discord.js";
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

export let generalChannel: TextChannel;
export let guild: Guild;
export let verifiedRole: Role;

interface Command extends ChatInputApplicationCommandData {
  run: (interaction: CommandInteraction) => Promise<void>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}

const pingCommand: Command = {
  name: "ping2",
  description: "Replies with Pong!",
  options: [
    {
      name: "a",
      description: "b",
      type: ApplicationCommandOptionType.String,
      autocomplete: true,
    },
  ],
  async run(interaction) {
    await interaction.reply("Pong!");
  },
  async autocomplete(interaction) {
    await interaction.respond([{ name: "A", value: "B" }]);
  },
};

const setupCommand: Command = {
  name: "setup",
  description: "Setup Rhombus",
  defaultMemberPermissions: ["Administrator"],
  dmPermission: false,
  options: [
    {
      name: "connect",
      type: ApplicationCommandOptionType.Subcommand,
      description: "Connect this server to a Rhombus instance",
      options: [
        {
          name: "url",
          description: "The URL of the Rhombus instance",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "token",
          description: "The token to connect Rhombus instance",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
    {
      name: "support",
      type: ApplicationCommandOptionType.Subcommand,
      description: "Set up the support channel",
      options: [
        {
          name: "channel",
          description:
            "An existing channel to use for support. If not provided, a new channel will be created.",
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
      ],
    },
  ],
  async run(interaction) {
    const option = interaction.options.data[0];
    if (option.name === "connect") {
      await interaction.reply({
        content: "Connected to Rhombus!",
        ephemeral: true,
      });
    } else if (option.name === "support") {
      const supportChannel = await guild.channels.create({
        name: "support",
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: ["SendMessages"],
          },
          {
            id: "1160613453090795596",
            allow: ["SendMessages"],
          },
        ],
      });

      await supportChannel.send({
        embeds: [
          {
            color: 0x0099ff,
            title: "Support",
            description: "Your support tickets will appear here.",
          },
        ],
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                label: "Create Ticket",
                customId: "create-ticket",
                type: ComponentType.Button,
                style: ButtonStyle.Primary,
              },
            ],
          },
        ],
      });

      await interaction.reply({
        content: `Created support channel <#${supportChannel.id}>`,
        ephemeral: true,
      });
    }
  },
};

const commands = [setupCommand];

client.on("ready", async () => {
  if (!client.user || !client.application) {
    return;
  }

  const guilds = await client.guilds.fetch();
  console.log(guilds);

  guild = client.guilds.cache.first()!;
  const channels = await guild.channels.fetch();
  generalChannel = channels.find(
    (channel) => channel && channel.name === "general",
  ) as TextChannel;

  const roles = await guild.roles.fetch();
  let foundVerifiedRole = roles.find((role) => role.name === "Verified");
  if (!foundVerifiedRole)
    foundVerifiedRole = await guild.roles.create({
      name: "Verified",
      color: "Blue",
      reason: "rhombus-managed verified",
    });
  verifiedRole = foundVerifiedRole;

  await client.application.commands.set(commands);

  // await generalChannel.send(
  //   `Rhombus is online! <t:${Math.floor(Date.now() / 1000)}>`
  // );
  console.log(`${client.user.username} is online`);
});

client.on("guildMemberAdd", async (member) => {
  const user = await db.user.findFirst({
    where: { discordId: member.id },
    select: { team: { select: { discordRoleId: true } } },
  });

  if (user && user.team && user.team.discordRoleId) {
    await member.roles.add(verifiedRole);

    const teamRole = await guild.roles.fetch(user.team.discordRoleId);
    if (teamRole) await member.roles.add(teamRole);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isAutocomplete()) {
    const command = commands.find((c) => c.name === interaction.commandName);
    if (command && command.autocomplete)
      await command.autocomplete(interaction);
  }
  if (interaction.isCommand()) {
    const command = commands.find((c) => c.name === interaction.commandName);
    if (command) await command.run(interaction);
  }
});

client.login(DISCORD_TOKEN);

const server = createHTTPServer({
  router: botRouter,
});

server.listen(3001);
