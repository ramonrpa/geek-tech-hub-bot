import {
  ActionRowBuilder,
  ApplicationCommandType,
  ChannelSelectMenuBuilder,
  ChannelType,
  CommandInteraction,
  PermissionFlagsBits,
} from "discord.js";

import { Command } from "../types";

const setup: Command = {
  name: "setup",
  description: "Configurar bot.",
  type: ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  execute: async (interaction: CommandInteraction) => {
    const channelReqSelectComponent = new ChannelSelectMenuBuilder()
      .addChannelTypes(ChannelType.GuildText)
      .setPlaceholder("Canal de requisição de análise.")
      .setCustomId("curriculum_analytic_req_channel_select");

    const channelAdminSelectComponent = new ChannelSelectMenuBuilder()
      .addChannelTypes(ChannelType.GuildText)
      .setPlaceholder("Canal da administração de análise.")
      .setCustomId("curriculum_analytic_admin_channel_select");

    const curriculumReqRow =
      new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
        channelReqSelectComponent,
      );

    const curriculumAdminRow =
      new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
        channelAdminSelectComponent,
      );

    await interaction.editReply({
      components: [curriculumReqRow, curriculumAdminRow],
      content: "> Configure os canais",
    });
  },
};

export default setup;
