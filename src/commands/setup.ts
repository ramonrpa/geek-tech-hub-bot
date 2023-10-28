import {
  ActionRowBuilder,
  ApplicationCommandType,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  EmbedBuilder,
  MessageActionRowComponentBuilder,
  PermissionFlagsBits,
} from "discord.js";

import { Command } from "../types";
import { getChannel } from "../utils/channel";

const setup: Command = {
  name: "setup",
  description: "Setup",
  type: ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  dmPermission: false,
  execute: async (interaction: CommandInteraction) => {
    const curriculumUserChannel = await getChannel(
      "curriculum_analytic-user",
      interaction.guild,
    );
    const curriculumAdminChannel = await getChannel(
      "curriculum_analytic-admin",
      interaction.guild,
    );

    if (curriculumUserChannel && curriculumAdminChannel) {
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

      await curriculumUserChannel.send({
        embeds: [embed],
        components: [buttonRow],
      });
    }

    await interaction.followUp({
      content: "Setup completo.",
      ephemeral: true,
    });
  },
};

export default setup;
