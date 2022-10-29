/** @format */

import { Event } from "../types/interfaces";
import { CommandClient } from "../clientstart";
import { Configs, Counts, MemberCounts } from "../database/database";
import { EmbedBuilder } from "discord.js";

export class CountingHandler implements Event {
  name = "messageCreate";
  handler: Event["handler"] = async (client: CommandClient<true>) => {
    client.on("messageCreate", async (message) => {
      if (message.author.bot) return;
      if (message.inGuild()) {
        const guildId = message.guildId;
        const serverConfig = await getServerConfig(guildId);

        if (message.channelId !== serverConfig.countingChannelId) return;

        const serverCount = await getServerCount(guildId, {
          count: 0,
          highestCount: 0,
          lastCounterId: message.author.id,
          lastMessageId: message.id,
        });

        const memberCount = await getMemberCount(message.author.id, guildId, {
          count: 0,
          lastCount: 0,
        });

        const [stringNumber] = message.content.split(" ");
        if (Number(stringNumber) || Number(stringNumber) === 0) {
          const number = Number(stringNumber);
          if (number !== serverCount.count + 1) {
            if (!serverConfig.resetIfWrong)
              if (serverConfig.deleteIfWrong && message.deletable)
                await message.delete();
              else await message.react("❌");
            else {
              const expectedCount = serverCount.count + 1;
              await message.react("❌");
              serverCount.count = 0;
              await serverCount.save();
              await message.channel.send({
                embeds: [
                  new EmbedBuilder()
                    .setTitle("The count has been spoiled!")
                    .setDescription(
                      `${message.author} sent \`${number}\` instead of \`${expectedCount}\`! :(
											The count has been reset to \`0\`. Start again by sending \`1\`.`
                    )
                    .setColor(0xff0000),
                ],
              });
            }
          } else {
            serverCount.count = number;
            if (serverCount.highestCount < serverCount.count)
              serverCount.highestCount = serverCount.count;
            serverCount.lastMessageId = message.id;
            serverCount.lastCounterId = message.author.id;
            await serverCount.save();
            ServerCounts.delete(guildId);
            ServerCounts.set(guildId, serverCount);

            memberCount.count += 1;
            memberCount.lastCount = number;
            await memberCount.save();
          }
        } else if (serverConfig.deleteIfWrong && message.deletable)
          await message.delete();
        else await message.react("❌");
      }
    });
  };
}
