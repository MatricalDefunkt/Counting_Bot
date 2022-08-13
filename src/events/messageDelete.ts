/** @format */

import { Event } from "../types/interfaces";
import { CommandClient } from "../clientstart";
import { Configs, Counts } from "../database/database";
import {
	EmbedBuilder,
	GuildTextBasedChannel,
	PermissionFlagsBits,
} from "discord.js";

export class MessageDelete implements Event {
	name = "messageDelete";
	handler: Event["handler"] = async (client: CommandClient<true>) => {
		client.on("messageDelete", async (message) => {
			if (!message.inGuild()) return;

			let serverConfig = ServerConfigs.get(message.guildId);
			if (!serverConfig) {
				serverConfig = (await Counts.findByPk(message.guildId)) as unknown as
					| Configs
					| undefined;
				if (!serverConfig) return;
			}

			if (!serverConfig.countingChannelId) return;

			let serverCount = ServerCounts.get(message.guildId);
			if (!serverCount) {
				serverCount = (await Counts.findByPk(message.guildId)) as unknown as
					| Counts
					| undefined;
				if (!serverCount) return;
			}

			if (message.id === serverCount.lastMessageId) {
				const countingChannel = (await message.guild.channels.fetch(
					serverConfig.countingChannelId,
					{
						cache: true,
						force: false,
					}
				)) as GuildTextBasedChannel;
				if (
					countingChannel
						.permissionsFor(message.guild.members.me!)
						.has(PermissionFlagsBits.SendMessages)
				)
					await countingChannel.send({
						embeds: [
							new EmbedBuilder()
								.setTitle("Count Deleted")
								.setDescription(
									`${message.author} (${
										message.author.tag
									}) deleted their message which was the last number for the channel.\n ℹ️➡️ The current count is still \`${
										serverCount.count
									}\`, making the next number \`${serverCount.count + 1}\``
								)
								.setColor("Red"),
						],
					});
			}
		});
	};
}
