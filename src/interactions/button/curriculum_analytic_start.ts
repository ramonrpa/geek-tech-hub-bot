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
  ThreadAutoArchiveDuration,
} from "discord.js";

import { Request, RequestStatus } from "../../database/models/Request";
import { BotInteraction } from "../../types";
import { getChannel } from "../../utils/channel";

const interaction: BotInteraction = {
  id: /curriculum_analytic_start_button-[\d]+/,
  execute: async (interaction: ButtonInteraction) => {
    await interaction.deferReply({
      ephemeral: true,
    });

    const curriculumUserChannel = await getChannel(
      "curriculum_analytic-user",
      interaction.guild,
    );

    if (!curriculumUserChannel)
      throw new Error("Canal `curriculum_analytic-user` não encontrado.");

    const regex = /curriculum_analytic_start_button-([\d]+)/;
    const match = regex.exec(interaction.customId);

    const id = match[1];
    const request = await Request.findByPk(id);

    const member = await interaction.guild.members.fetch(request.member);

    if (!(curriculumUserChannel instanceof TextChannel))
      throw new Error("`curriculum_analytic-user` não é um `TextChannel`");

    if (!member) throw new Error("Usuário não encontrado");

    const thread = await curriculumUserChannel.threads.create({
      name: `Análise de ${request.name}`,
      autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
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
        iconURL: member.user.displayAvatarURL({ size: 128 }),
        name: member.user.globalName || member.user.displayName,
      });

    const button = new ButtonBuilder()
      .setLabel("Finalizar análise")
      .setStyle(ButtonStyle.Success)
      .setCustomId(`curriculum_analytic_close_button-${request.id}`);

    const buttonRow =
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        button,
      );

    const message = await thread.send({
      embeds: [embed],
      components: [buttonRow],
    });

    const allMembers = await interaction.guild.members.fetch();

    await allMembers.map(async (member) => {
      if (member.permissions.has(PermissionFlagsBits.Administrator))
        await thread.members.add(member);

      return member;
    });

    await thread.members.add(member);

    await request.createMeta({
      key: "thread_id",
      value: thread.id,
    });

    await request.createMeta({
      key: "thread_message_id",
      value: message.id,
    });

    await request.update({ status: RequestStatus.IN_PROGRESS });

    const interactionEmbed = interaction.message.embeds[0].toJSON();

    interactionEmbed.description = `
    **Nome**: ${request.name}
    **Email**: ${request.email}
    **Canal**: ${thread}
    [Currículo](${request.curriculum})
    `;

    await interaction.message.edit({
      embeds: [interactionEmbed],
      components: [],
    });

    await interaction.deleteReply();
  },
};

export default interaction;
