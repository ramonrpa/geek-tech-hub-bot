import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  MessageActionRowComponentBuilder,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";

import { Request, RequestStatus } from "../../database/models/Request";
import { Setting } from "../../database/models/Setting";
import { BotInteraction } from "../../types";

const interaction: BotInteraction = {
  id: /curriculum_analytic_start_button-[\d]+/,
  execute: async (interaction: ButtonInteraction) => {
    const [_, id] = interaction.customId.match(
      /curriculum_analytic_start_button-([\d])+/,
    );
    let request = await Request.findByPk(id);

    request = await request.update({
      status: RequestStatus.IN_PROGRESS,
    });

    const requestChannelSetting = await Setting.findByPk(
      "req_curriculum_channel",
    );

    const channel = interaction.guild.channels.cache.get(
      requestChannelSetting.value,
    ) as TextChannel;

    const member = channel.members.get(request.member);

    const thread = await channel.threads.create({
      name: `Análise de ${request.name}`,
      autoArchiveDuration: 4320,
      type: ChannelType.PrivateThread,
    });

    const status = {
      pending: "Pendente",
      in_progress: "Em progresso",
      completed: "Finalizado",
    };

    const embed = new EmbedBuilder()
      .setColor("#cefe49")
      .setTitle("Pedido de Análise")
      .setDescription(
        `
      **Nome**: ${request.name}
      **Email**: ${request.email}
      **Status**: ${status[request.status]}
      **Informações extra**: ${request.extra}
      [Currículo](${request.curriculum})
      `,
      )
      .setAuthor({
        iconURL: member.displayAvatarURL({ size: 128 }),
        name: member.user.globalName || member.user.displayName,
      });

    const button = new ButtonBuilder()
      .setLabel("Finalizar análise")
      .setStyle(ButtonStyle.Success)
      .setCustomId(`curriculum_analytic_finish_button-${request.id}`);

    const buttonRow =
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        button,
      );

    const message = await thread.send({
      embeds: [embed],
      components: [buttonRow],
    });

    await thread.members.add(member);

    const administrators = channel.members.filter((member) =>
      member.permissions.has(PermissionFlagsBits.Administrator),
    );

    for (const member of administrators.values()) {
      await thread.members.add(member);
    }

    await request.createMeta({
      key: "thread_id",
      value: thread.id,
    });

    await request.createMeta({
      key: "thread_message_id",
      value: message.id,
    });

    const interactionEmbed = new EmbedBuilder()
      .setColor("#cefe49")
      .setTitle("Pedido de Análise")
      .setDescription(
        `
      **Nome**: ${request.name}
      **Email**: ${request.email}
      **Canal**: ${thread}
      [Currículo](${request.curriculum})
    `,
      )
      .setAuthor({
        iconURL: member.user.displayAvatarURL({ size: 128 }),
        name: member.user.globalName || member.user.displayName,
      });

    await interaction.message.edit({
      embeds: [interactionEmbed],
      components: [],
    });

    await interaction.deferUpdate();
  },
};

export default interaction;
