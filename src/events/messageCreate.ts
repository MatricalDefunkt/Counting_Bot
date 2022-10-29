/** @format */

import { Event } from "../types/interfaces";
import { CommandClient } from "../clientstart";
import { PermissionFlagsBits } from "discord.js";

export class MessageCreate implements Event {
	name = "messageCreate";
	handler: Event["handler"] = async (client: CommandClient<true>) => {
		client.on("messageCreate", async (message) => {
			if (!(message.content && message.content === `<@${BotClient.user.id}>`))
				return;

			if (message.inGuild()) {
				if (
					message.guild.members.me?.permissions.has(
						PermissionFlagsBits.SendMessages
					) &&
					message.channel
						.permissionsFor(message.guild.members.me)
						.has(PermissionFlagsBits.SendMessages)
				)
					await message.reply({
						content: `Hey there, I reply only to /commands! ${
							message.member?.permissions.has(
								PermissionFlagsBits.Administrator &&
									PermissionFlagsBits.ManageGuild
							)
								? `To configure me, you can use the command ${
										(await getCommand("config")) ?? "</config:0>"
								  }.`
								: ``
						}`,
					});
			}
		});
	};
}
