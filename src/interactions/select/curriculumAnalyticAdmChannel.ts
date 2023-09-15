import { ChannelSelectMenuInteraction } from "discord.js";

import { Setting } from "../../database/models/Setting";
import { BotInteraction } from "../../types";
import { Logger } from "../../utils/logger";

const interaction: BotInteraction = {
  id: "curriculum_analytic_admin_channel_select",
  execute: async (interaction: ChannelSelectMenuInteraction) => {
    await interaction.deferReply({
      ephemeral: true,
    });
    const channelValue = interaction.values?.[0];

    if (!channelValue) {
      await interaction.followUp({
        embeds: [
          {
            description: "Canal invalido.",
            color: 16724787,
          },
        ],
        ephemeral: true,
      });
      return;
    }

    try {
      await Setting.upsert({
        name: "admin_curriculum_channel",
        value: channelValue,
      });

      await interaction.followUp({
        embeds: [
          {
            description: "Canal do administrador para análise configurado.",
            color: 13565513,
          },
        ],
        ephemeral: true,
      });
    } catch (error) {
      await interaction.followUp({
        embeds: [
          {
            description: "Ocorreu um error.",
            color: 16724787,
          },
        ],
        ephemeral: true,
      });

      Logger.error("curriculum_analytic_admin_channel_select", error);
    }
  },
};

export default interaction;
