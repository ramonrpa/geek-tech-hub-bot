import { Events } from "discord.js";

import { sequelize } from "../database";
import { Bot } from "../models/Bot";
import { Listener } from "../types";
import { Logger } from "../utils/logger";

const listener: Listener = {
  name: Events.ClientReady,
  once: true,
  execute: async ({ client, commands }: Bot) => {
    Logger.info(
      `Logged in as "${client.user.globalName || client.user.displayName}"`,
    );

    await sequelize.sync();

    await client.application.commands.set(commands);
  },
};

export default listener;
