import { Events, Message } from "discord.js";

import { Bot } from "../models/Bot";
import { Listener } from "../types";

const listener: Listener = {
  name: Events.MessageCreate,
  execute: async (bot: Bot, message: Message) => {
    // console.log(message);
  },
};

export default listener;
