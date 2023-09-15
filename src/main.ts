import dotenv from "dotenv";

import { Bot } from "./models/Bot";

dotenv.config();

const bot = new Bot();

bot.run();
