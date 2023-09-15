import {
  ChatInputApplicationCommandData,
  ClientEvents,
  CommandInteraction,
  Interaction,
} from "discord.js";

import { Bot } from "../models/Bot";

export interface Listener {
  name: keyof ClientEvents;
  once?: boolean;
  execute: (client: Bot, ...args: unknown[]) => Promise<void>;
}

export interface BotInteraction {
  id: string | RegExp;
  execute: (interaction: Interaction) => Promise<void>;
}

export interface Command extends ChatInputApplicationCommandData {
  execute: (interaction: CommandInteraction) => void;
}
