import { ButtonInteraction, EmbedBuilder } from "discord.js";

import { Request, RequestStatus } from "../../database/models/Request";
import { BotInteraction } from "../../types";

const interaction: BotInteraction = {
  id: "curriculum_analytic_status_button",
  execute: async (interaction: ButtonInteraction) => {
    const { user } = interaction;

    const request = await Request.findOne({
      where: { member: user.id },
      include: [Request.associations.metas],
      rejectOnEmpty: false,
    });

    const next = await Request.min<number, Request>("id", {
      where: {
        status: "pending",
      },
    });

    if (!request) throw new Error("Você não possui um pedido de análise.");

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
      **Canal**: <#${request.getMeta("thread_id")}>
      [Currículo](${request.curriculum})
      `,
      )
      .setAuthor({
        iconURL: user.displayAvatarURL({ size: 128 }),
        name: user.globalName || user.displayName,
      });

    if (request.status === RequestStatus.PENDING)
      embed.setFooter({
        text: `Sua posição na fila: ${request.id - next + 1}`,
      });

    await user.send({ embeds: [embed] });

    await interaction.deferUpdate();
  },
};

export default interaction;
