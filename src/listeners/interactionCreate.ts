import {
  ChatInputCommandInteraction,
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
  if (!slashCommand) {
    await interaction.reply({
      embeds: [
        {
          description: "Ocorreu um erro.",
          color: 16724787,
        },
      ],
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply();

  try {
    await slashCommand.execute(interaction);
  } catch (error) {
    await interaction.reply({
      embeds: [
        {
          description: "Ocorreu um erro.",
          color: 16724787,
        },
      ],
      ephemeral: true,
    });

    Logger.error(error);
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
  if (!botInteraction) {
    await interaction.reply({
      embeds: [
        {
          description: "Ocorreu um erro.",
          color: 16724787,
        },
      ],
      ephemeral: true,
    });
    return;
  }

  try {
    await botInteraction.execute(interaction as Interaction);
  } catch (error) {
    await interaction.followUp({
      embeds: [
        {
          description: "Ocorreu um erro.",
          color: 16724787,
        },
      ],
      ephemeral: true,
    });

    Logger.error(error);
  }
};

export default listener;
