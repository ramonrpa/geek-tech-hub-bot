import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuInteraction,
  EmbedBuilder,
  MessageActionRowComponentBuilder,
  TextChannel,
} from "discord.js";

import { Setting } from "../../database/models/Setting";
import { BotInteraction } from "../../types";
import { Logger } from "../../utils/logger";

const interaction: BotInteraction = {
  id: "curriculum_analytic_req_channel_select",
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
        name: "req_curriculum_channel",
        value: channelValue,
      });

      const embed = new EmbedBuilder()
        .setColor("#cefe49")
        .setTitle("Solicite sua análise de currículo.")
        .setDescription(
          "Clique abaixo para informar seus dados e solicitar sua análise.",
        )
        .setFooter({
          iconURL: interaction.client.user.displayAvatarURL({ size: 128 }),
          text: interaction.client.user.username,
        });

      const button = new ButtonBuilder()
        .setLabel("Solicitar Análise")
        .setStyle(ButtonStyle.Success)
        .setCustomId("curriculum_analytic_req_button");

      const button2 = new ButtonBuilder()
        .setLabel("Status da sua Análise")
        .setStyle(ButtonStyle.Primary)
        .setCustomId("curriculum_analytic_status_button");

      const buttonRow =
        new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
          button,
          button2,
        );

      const channel = interaction.channels.get(channelValue) as TextChannel;

      await channel.send({ embeds: [embed], components: [buttonRow] });

      await interaction.followUp({
        embeds: [
          {
            description: "Canal para requisição de análise configurado.",
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

      Logger.error("curriculum_analytic_req_channel_select", error);
    }
  },
};

export default interaction;
