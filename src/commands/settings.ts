import {
  ActionRowBuilder,
  ApplicationCommandType,
  ChannelSelectMenuBuilder,
  ChannelType,
  CommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";

import { Command } from "../types";

const settings: Command = {
  name: "settings",
  description: "Configurar bot.",
  type: ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  execute: async (interaction: CommandInteraction) => {
    const embed = new EmbedBuilder()
      .setTitle("Configurações")
      .setDescription("Selecione as configurações que você deseja alterar")
      .setColor("#cefe49");

    const channelReqSelectComponent = new ChannelSelectMenuBuilder()
      .addChannelTypes(ChannelType.GuildText)
      .setPlaceholder("Canal de requisição de análise.")
      .setCustomId("channel_curriculum_analytic-user");

    const channelAdminSelectComponent = new ChannelSelectMenuBuilder()
      .addChannelTypes(ChannelType.GuildText)
      .setPlaceholder("Canal da administração de análise.")
      .setCustomId("channel_curriculum_analytic-admin");

    const curriculumReqRow =
      new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
        channelReqSelectComponent,
      );

    const curriculumAdminRow =
      new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
        channelAdminSelectComponent,
      );

    await interaction.editReply({
      embeds: [embed],
      components: [curriculumReqRow, curriculumAdminRow],
    });
  },
};

export default settings;
