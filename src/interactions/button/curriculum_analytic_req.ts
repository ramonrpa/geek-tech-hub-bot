import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  Collection,
  EmbedBuilder,
  Message,
  MessageActionRowComponentBuilder,
} from "discord.js";
import { once } from "events";

import { FormQueue } from "../../database/models/FormQueue";
import { Request } from "../../database/models/Request";
import { BotInteraction } from "../../types";
import { getChannel } from "../../utils/channel";

const interaction: BotInteraction = {
  id: "curriculum_analytic_req_button",
  execute: async (interaction: ButtonInteraction) => {
    await interaction.deferReply({
      ephemeral: true,
    });

    const curriculumAdminChannel = await getChannel(
      "curriculum_analytic-admin",
      interaction.guild,
    );

    if (!curriculumAdminChannel)
      throw new Error("Canal `curriculum_analytic-admin` não encontrado.");

    const { user } = interaction;

    const request = await Request.findOne({
      where: { member: user.id },
    });

    const formQueue = await FormQueue.findOne({
      where: { member: user.id },
    });

    if (request)
      throw new Error(`Você já possui um pedido de análise.
    Clique em **Status da sua análise** para visualizar seu pedido.`);

    if (formQueue)
      throw new Error(`Você já possui um pedido de análise.
    Vá ate seu privado para preencher seu formulário.`);

    await FormQueue.create({
      member: user.id,
    });

    const questions = [
      {
        label: "Qual seu nome?",
        type: "message",
        name: "name",
      },
      {
        label: "Qual seu email?",
        type: "message",
        name: "email",
      },
      {
        label:
          "Anexe seu currículo e caso deseje pode estar escrevendo mais informações que acha importante.",
        type: "file",
        name: "curriculum",
      },
    ];

    const answers: { [key: string]: string } = {};
    let error = false;

    const dmChannel = await user.createDM(true);

    try {
      (await dmChannel.send("👌")).delete();
    } catch (error) {
      await FormQueue.destroy({
        where: { member: user.id },
      });

      throw new Error(`Você já possui um pedido de análise.
      Vá ate seu privado para preencher seu formulário.`);
    }

    for (const question of questions) {
      const embed = new EmbedBuilder()
        .setColor("#cefe49")
        .setTitle(question.label)
        .setFooter({
          text: "Você tem 1 minuto para responder a esta pergunta.",
        });

      await dmChannel.send({
        embeds: [embed],
      });

      const messageFilter = (message: Message) =>
        message.author.id === interaction.user.id &&
        message.content?.length > 0;

      const fileFilter = (message: Message) =>
        message.author.id === interaction.user.id &&
        message.attachments?.size > 0;

      const collector = dmChannel.createMessageCollector({
        filter: question.type === "file" ? fileFilter : messageFilter,
        max: 1,
        time: 1 * 60000,
      });

      const [collected, reason] = (await once(collector, "end")) as [
        Collection<string, Message>,
        string,
      ];

      if (reason === "limit") {
        if (question.type === "file") {
          answers[question.name] = collected.first().attachments.first().url;

          answers["extra"] = collected.first().content;
        } else {
          answers[question.name] = collected.first().content;
        }
      } else {
        let errorMessage =
          "Ocorreu um erro durante a realização do formulário e este foi cancelado.";

        if (reason === "time")
          errorMessage =
            "O tempo para responder se esgotou e o formulário foi cancelado.";

        const embed = new EmbedBuilder()
          .setColor("#FF3333")
          .setDescription(errorMessage);

        await dmChannel.send({
          embeds: [embed],
        });

        error = true;
        break;
      }
    }

    if (!error) {
      const request = await Request.create({
        member: user.id,
        name: answers.name,
        email: answers.email,
        curriculum: answers.curriculum,
        extra: answers.extra,
        statusText: "",
      });

      const embed = new EmbedBuilder()
        .setColor("#cefe49")
        .setTitle(`Pedido de Análise - #${request.id}`)
        .setDescription(
          `
          **Nome**: ${request.name}
          **Email**: ${request.email}
          [Currículo](${request.curriculum})
        `,
        )
        .setAuthor({
          iconURL: user.displayAvatarURL({ size: 128 }),
          name: user.globalName || user.displayName,
        });

      const button = new ButtonBuilder()
        .setLabel("Iniciar análise")
        .setStyle(ButtonStyle.Success)
        .setCustomId(`curriculum_analytic_start_button-${request.id}`);

      const buttonRow =
        new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
          button,
        );

      await curriculumAdminChannel.send({
        embeds: [embed],
        components: [buttonRow],
      });

      await user.send("> Seu pedido de análise foi enviado.");
    }

    await FormQueue.destroy({
      where: { member: user.id },
    });

    await interaction.deleteReply();
  },
};

export default interaction;
