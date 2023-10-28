import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  GuildMember,
  MessageActionRowComponentBuilder,
  PermissionFlagsBits,
  ThreadChannel,
} from "discord.js";

import { Request, RequestStatus } from "../../database/models/Request";
import { BotInteraction } from "../../types";

const interaction: BotInteraction = {
  id: /curriculum_analytic_open_button-([\d])+/,
  execute: async (interaction: ButtonInteraction) => {
    if (!(interaction.member instanceof GuildMember)) return;

    await interaction.deferReply({
      ephemeral: true,
    });

    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      throw new Error("Você não tem permissão.");

    const regex = /curriculum_analytic_open_button-([\d]+)/;
    const match = regex.exec(interaction.customId);

    const id = match[1];

    const request = await Request.findByPk(id, {
      include: [Request.associations.metas],
      rejectOnEmpty: true,
    });

    const channel = interaction.channel as ThreadChannel;

    const [interactionEmbed] = interaction.message.embeds;
    const embed = interactionEmbed.toJSON();

    embed.description = `
    **Nome**: ${request.name}
    **Email**: ${request.email}
    **Status**: Em progresso
    **Informações extra**: ${request.extra}
    [Currículo](${request.curriculum})
    `;

    const button = new ButtonBuilder()
      .setLabel("Finalizar análise")
      .setStyle(ButtonStyle.Primary)
      .setCustomId(`curriculum_analytic_close_button-${request.id}`);

    const buttonRow =
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        button,
      );

    await interaction.message.edit({
      embeds: [embed],
      components: [buttonRow],
    });

    await channel.setLocked(false);
    await channel.setArchived(false);

    await request.update({
      status: RequestStatus.IN_PROGRESS,
    });

    await interaction.deleteReply();
  },
};

export default interaction;
