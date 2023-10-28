import { ChannelSelectMenuInteraction, EmbedBuilder } from "discord.js";

import { Setting } from "../../database/models/Setting";
import { BotInteraction } from "../../types";

const interaction: BotInteraction = {
  id: /channel_([\w\d-]+)/,
  execute: async (interaction: ChannelSelectMenuInteraction) => {
    await interaction.deferReply({
      ephemeral: true,
    });

    const regex = /channel_([\w\d-]+)/;
    const match = regex.exec(interaction.customId);

    const name = match[1];

    const value = interaction.values[0];

    await Setting.upsert({
      name: `channels_${name}`,
      value: value,
    });

    const embed = new EmbedBuilder()
      .setDescription(
        `Configuração \`channels_${name}\` definida para <#${value}> com sucesso.`,
      )
      .setColor("#cefe49");

    await interaction.followUp({
      embeds: [embed],
      ephemeral: true,
    });
  },
};

export default interaction;
