import { Client, IntentsBitField, Partials } from "discord.js";
import path from "path";

import { sequelize } from "../database";
import { BotInteraction, Command, Listener } from "../types";
import { importer } from "../utils/importer";
import { Logger } from "../utils/logger";

export class Bot {
  public client: Client;

  private _listeners: Listener[];
  private _interactions: BotInteraction[];
  private _commands: Command[];

  constructor() {
    this.client = new Client({
      intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.DirectMessages,
      ],
      partials: [Partials.Message, Partials.Channel],
    });

    this.init();
  }

  async init() {
    Logger.info("Loading listeners...");
    const listeners = await importer(
      `${path.join(__dirname, "..", "listeners", "/**/*.{ts,js}")}`,
    );
    this._listeners = listeners.map((listener) => {
      Logger.debug(`Loading "${listener.default.name}" listener`);
      return listener.default;
    });
    Logger.info(`Loaded ${this._listeners.length} listeners`);

    Logger.info("Loading interactions...");
    const interactions = await importer(
      `${path.join(__dirname, "..", "interactions", "/**/*.{ts,js}")}`,
    );
    this._interactions = interactions.map((interaction) => {
      Logger.debug(`Loading "${interaction.default.id}" interaction`);
      return interaction.default;
    });
    Logger.info(`Loaded ${this._interactions.length} interactions`);

    Logger.info("Loading commands...");
    const commands = await importer(
      `${path.join(__dirname, "..", "commands", "/**/*.{ts,js}")}`,
    );
    this._commands = commands.map((command) => {
      Logger.debug(`Loading "${command.default.name}" command`);
      return command.default;
    });
    Logger.info(`Loaded ${this._commands.length} commands`);
  }

  async run() {
    if (!process.env.BOT_TOKEN) {
      throw Error("Could not find BOT_TOKEN in your environment");
    }

    try {
      await sequelize.authenticate();
    } catch (error) {
      throw new Error(`Unable to connect to the database: ${error}`);
    }

    this.registerListeners();

    await this.client.login(process.env.BOT_TOKEN);
  }

  registerListeners() {
    this.listeners.map((listener) => {
      this.client[listener.once ? "once" : "on"](listener.name, (...args) =>
        listener.execute(this, ...args),
      );
    });
  }

  get listeners() {
    return this._listeners;
  }

  get interactions() {
    return this._interactions;
  }

  get commands() {
    return this._commands;
  }
}
