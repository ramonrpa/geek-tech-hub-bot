import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  Events,
  Interaction,
  MessageComponentInteraction,
  ModalSubmitInteraction,
} from "discord.js";

import { Bot } from "../models/Bot";
import { Listener } from "../types";
import { Logger } from "../utils/logger";

const listener: Listener = {
  name: Events.InteractionCreate,
  execute: async (bot: Bot, interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      await handleSlashCommand(bot, interaction);
    } else if (
      interaction.isMessageComponent() ||
      interaction.isModalSubmit()
    ) {
      await handleInteraction(bot, interaction);
    }
  },
};

const handleSlashCommand = async (
  bot: Bot,
  interaction: ChatInputCommandInteraction,
): Promise<void> => {
  const slashCommand = bot.commands.find(
    (c) => c.name === interaction.commandName,
  );
  const embed = new EmbedBuilder()
    .setTitle("Ocorreu um erro")
    .setColor("#FF3333");

  if (!slashCommand) {
    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply();

  try {
    await slashCommand.execute(interaction);
  } catch (error) {
    embed.setDescription(error.message);
    if (interaction.replied || interaction.deferred)
      await interaction.followUp({
        embeds: [embed],
        ephemeral: true,
      });
    else
      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });

    Logger.error(
      `[${interaction.commandName}/${interaction.user.displayName}]`,
      error,
    );
  }
};

const handleInteraction = async (
  bot: Bot,
  interaction: MessageComponentInteraction | ModalSubmitInteraction,
): Promise<void> => {
  const botInteraction = bot.interactions.find((it) => {
    if (it.id instanceof RegExp) return it.id.test(interaction.customId);
    return it.id === interaction.customId;
  });
  const embed = new EmbedBuilder()
    .setTitle("Ocorreu um erro")
    .setColor("#FF3333");

  if (!botInteraction) {
    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
    return;
  }

  try {
    await botInteraction.execute(interaction as Interaction);
  } catch (error) {
    embed.setDescription(error.message);
    if (interaction.replied || interaction.deferred)
      await interaction.followUp({
        embeds: [embed],
        ephemeral: true,
      });
    else
      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });

    Logger.error(
      `[${interaction.customId}/${interaction.user.displayName}]`,
      error,
    );
  }
};

export default listener;
