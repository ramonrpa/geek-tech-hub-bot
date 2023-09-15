import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  EmbedBuilder,
  GuildMember,
  MessageActionRowComponentBuilder,
  PermissionFlagsBits,
  ThreadChannel,
} from "discord.js";

import { Request, RequestStatus } from "../../database/models/Request";
import { BotInteraction } from "../../types";

const interaction: BotInteraction = {
  id: /curriculum_analytic_finish_button-[\d]+/,
  execute: async (interaction: ButtonInteraction) => {
    if (!(interaction.member instanceof GuildMember)) return;
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      await interaction.reply({
        embeds: [
          {
            description: "Você não possui permissão.",
            color: 16724787,
          },
        ],
        ephemeral: true,
      });

      return;
    }

    const {
      member: { user },
    } = interaction;

    const [_, id] = interaction.customId.match(
      /curriculum_analytic_finish_button-([\d])+/,
    );
    let request = await Request.findByPk(id, {
      include: [Request.associations.metas],
      rejectOnEmpty: true,
    });

    request = await request.update({
      status: RequestStatus.COMPLETED,
    });

    const channel = interaction.channel as ThreadChannel;

    const thread_message_id = request.getMeta("thread_message_id");

    const embed = new EmbedBuilder()
      .setColor("#cefe49")
      .setTitle("Pedido de Análise")
      .setDescription(
        `
      **Nome**: ${request.name}
      **Email**: ${request.email}
      **Status**: Finalizado
      **Informações extra**: ${request.extra}
      [Currículo](${request.curriculum})
    `,
      )
      .setAuthor({
        iconURL: user.displayAvatarURL({ size: 128 }),
        name: user.globalName || user.displayName,
      });

    const button = new ButtonBuilder()
      .setLabel("Reabrir análise")
      .setStyle(ButtonStyle.Primary)
      .setCustomId(`curriculum_analytic_re-open_button-${request.id}`);

    const buttonRow =
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        button,
      );

    const message = await channel.messages.fetch(thread_message_id);

    await message.edit({
      embeds: [embed],
      components: [buttonRow],
    });

    await channel.setLocked(true);
    await channel.setArchived(true);

    await interaction.deferUpdate();
  },
};

export default interaction;
