import { Guild } from "discord.js";

import { Setting } from "../database/models/Setting";

export const getChannel = async (name: string, guild: Guild) => {
  const channelSetting = await Setting.findByPk(`channels_${name}`);

  if (!channelSetting) return null;

  const channel = await guild.channels.fetch(channelSetting.value);

  if (!channel || !channel?.isTextBased()) return null;

  return channel;
};
