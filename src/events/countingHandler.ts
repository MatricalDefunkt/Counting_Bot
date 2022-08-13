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
				const serverConfig = ServerConfigs.get(guildId);
				if (!serverConfig) {
					const serverConfig =
						(await Configs.findByPk(guildId)) ??
						(await Configs.create({ guildId }));
					ServerConfigs.set(serverConfig.guildId, serverConfig);
					console.error("Did not find server config for " + guildId);
					return;
				}
				const serverCount = ServerCounts.get(guildId);
				if (!serverCount) {
					const serverCount =
						(await Counts.findByPk(guildId)) ??
						(await Counts.create({
							guildId,
							count: 0,
							highestCount: 0,
							lastMessageId: "N/A",
							lastCounterId: "N/A",
						}));
					ServerCounts.set(serverCount.guildId, serverCount);
					console.error("Did not find server count for " + guildId);
					return;
				}
				let memberCount = await MemberCounts.findOne({
					where: { guildId, userId: message.author.id },
				});
				if (!memberCount) {
					memberCount =
						(await MemberCounts.findOne({
							where: { guildId, userId: message.author.id },
						})) ??
						(await MemberCounts.create({
							guildId,
							counts: 0,
							lastCount: 0,
							userId: message.author.id,
						}));
				}
				if (message.channelId !== serverConfig.countingChannelId) return;
				const [stringNumber] = message.content.split(" ");
				if (Number(stringNumber)) {
					const number = Number(stringNumber);
					if (number !== serverCount.count + 1 || number === 0) {
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
										.setTitle("The counting has been spoiled!")
										.setDescription(
											`${message.author} sent \`${number}\` instead of \`${expectedCount}\`! :(
											The count has been reset to \`0\`. Start again by sending \`1\`.`
										)
										.setColor(0xff00000),
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

						memberCount.counts += 1;
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
