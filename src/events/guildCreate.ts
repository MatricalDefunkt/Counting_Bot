/** @format */

import { ChannelType, Collection, TextChannel } from "discord.js";
import { Configs } from "../database/database";
import { Event } from "../types/interfaces";
import { CommandClient } from "../clientstart";

export class GuildCreate implements Event {
  name = "guildCreate";
  handler: Event["handler"] = async (client: CommandClient<true>) => {
    client.on("guildCreate", async (guild) => {
      await Configs.create({ guildId: guild.id }).catch((e) => {
        if (e.name === "SequelizeUniqueConstraintError") return undefined;
        else return console.error(e);
      });
      const owner = await guild.fetchOwner({ force: false, cache: true });
      const dmChannel = await owner
        .createDM()
        .then(async (dmChannel) => {
          await dmChannel.send({
            content: `Thank you for inviting me to your server! To get started, please use the command ${
              (await getCommand("config")) ?? `</config:0>`
            }.`,
          });
        })
        .catch(async (err) => {
          if (err.code === 50007) {
            const textChannels = guild.channels.cache.filter(
              (channel) => channel.type === ChannelType.GuildText
            ) as Collection<string, TextChannel>;
            textChannels
              .first()
              ?.send({
                content: `Thank you for inviting me to your server! To get started, please use the command ${
                  (await getCommand("config")) ?? `</config:0>`
                }.`,
              })
              .catch(console.error);
          }
        });
    });
  };
}
