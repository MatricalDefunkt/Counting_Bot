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
							lastMessageId: message.id,
							lastCounterId: message.author.id,
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
							count: 0,
							lastCount: 0,
							userId: message.author.id,
						}));
				}

				if (message.channelId !== serverConfig.countingChannelId) return;
				const [stringNumber] = message.content.split(" ");
				if (Number(stringNumber) || Number(stringNumber) === 0) {
					const number = Number(stringNumber);
					if (number !== serverCount.counts + 1) {
						if (!serverConfig.resetIfWrong)
							if (serverConfig.deleteIfWrong && message.deletable)
								await message.delete();
							else await message.react("❌");
						else {
							const expectedCount = serverCount.counts + 1;
							await message.react("❌");
							serverCount.counts = 0;
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
						serverCount.counts = number;
						if (serverCount.highestCount < serverCount.counts)
							serverCount.highestCount = serverCount.counts;
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
