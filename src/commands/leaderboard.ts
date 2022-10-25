/** @format */

import { EmbedBuilder } from "@discordjs/builders";
import {
	ButtonInteraction,
	ComponentType,
	InteractionCollector,
	SlashCommandBuilder,
} from "discord.js";
import { Op } from "sequelize";
import {
	createPaginationButtons,
	disableButtons,
	enableButtons,
} from "../utils/buttonCreators";
import { createLeaderboardEmbed } from "../utils/embedCreators";
import { MemberCounts } from "../database/database";
import { ChatInputCommand } from "../types/interfaces";

export default class Leaderboard
	extends SlashCommandBuilder
	implements ChatInputCommand<"cached">
{
	name = "leaderboard";
	description = "Gets the counting leaderboard for the server.";
	execute: ChatInputCommand<"cached">["execute"] = async (interaction) => {
		let pageIndex = 0;
		const memberCounts = await MemberCounts.findAll({
			where: { guildId: interaction.guildId, counts: { [Op.gt]: 0 } },
			order: [["counts", "DESC"]],
			limit: 10,
			offset: pageIndex * 10,
		});
		const memberCountSize = await MemberCounts.count({
			where: { guildId: interaction.guildId },
		});
		const pages = Math.ceil(memberCountSize / 10);
		if (memberCounts.length === 0) {
			return interaction.editReply({
				content: "This server has not begun counting yet!",
			});
		}
		const leaderboard = memberCounts.map(
			(memberCount) =>
				`Last number counted: ${memberCount.lastCount}
				Total numbers counted: ${memberCount.count}
				Began counting on: <t:${Math.trunc(memberCount.createdAt.getTime() / 1000)}>
				Last counted on: <t:${Math.trunc(memberCount.lastCountTime.getTime() / 1000)}>`
		);
		const embed = new EmbedBuilder()
			.setTitle("Counting Leaderboard")
			.setDescription(
				"Leaderboard is created on the basis of the number of times a user has counted.\nOnly the top 10 users are shown, for now."
			);
		for (const [index, memberCount] of memberCounts.entries()) {
			const user = await interaction.client.users.fetch(memberCount.userId);
			embed.addFields({
				name: `${pageIndex + index + 1}. ${user.tag}`,
				value: leaderboard[index],
			});
		}
		const pageButtons = createPaginationButtons();
		embed.setFooter({ text: `Page ${pageIndex + 1} of ${pages}` });
		const reply = await interaction.editReply({
			embeds: [embed],
			components: pageButtons,
		});
		const collector = new InteractionCollector<ButtonInteraction>(
			interaction.client,
			{
				time: 60000,
				componentType: ComponentType.Button,
				message: reply,
			}
		);
		collector.on("collect", async (button) => {
			await button.update({ components: disableButtons(pageButtons) });

			switch (button.customId) {
				case "next":
					if (pageIndex === pages - 1) {
						await button.editReply({
							content: "You are already on the last page!",
							components: enableButtons(pageButtons),
						});
						break;
					}

					pageIndex++;

					const newMemberCounts = await MemberCounts.findAll({
						where: { guildId: interaction.guildId, counts: { [Op.gt]: 0 } },
						order: [["counts", "DESC"]],
						limit: 10,
						offset: pageIndex * 10,
					});

					const newEmbed = await createLeaderboardEmbed({
						pageNumber: pageIndex,
						memberCounts: newMemberCounts,
						interaction,
					});

					newEmbed.setFooter({ text: `Page ${pageIndex + 1} of ${pages}` });

					await button.editReply({
						content: ``,
						embeds: [newEmbed],
						components: enableButtons(pageButtons),
					});

					break;

				case "previous":
					if (pageIndex === 0) {
						await button.editReply({
							content: "You are already on the first page!",
							components: enableButtons(pageButtons),
						});
						break;
					}

					pageIndex--;

					const newMemberCounts1 = await MemberCounts.findAll({
						where: { guildId: interaction.guildId, counts: { [Op.gt]: 0 } },
						order: [["counts", "DESC"]],
						limit: 10,
						offset: pageIndex * 10,
					});

					const newEmbed1 = await createLeaderboardEmbed({
						pageNumber: pageIndex,
						interaction,
						memberCounts: newMemberCounts1,
					});

					newEmbed1.setFooter({ text: `Page ${pageIndex + 1} of ${pages}` });

					await button.editReply({
						content: ``,
						embeds: [newEmbed1],
						components: enableButtons(pageButtons),
					});

					break;
				case "first":
					if (pageIndex === 0) {
						await button.editReply({
							content: "You are already on the first page!",
							components: enableButtons(pageButtons),
						});
						break;
					}

					pageIndex = 0;

					const newMemberCounts2 = await MemberCounts.findAll({
						where: { guildId: interaction.guildId, counts: { [Op.gt]: 0 } },
						order: [["counts", "DESC"]],
						limit: 10,
						offset: pageIndex * 10,
					});

					const newEmbed2 = await createLeaderboardEmbed({
						pageNumber: pageIndex,
						interaction,
						memberCounts: newMemberCounts2,
					});

					newEmbed2.setFooter({ text: `Page ${pageIndex + 1} of ${pages}` });

					await button.editReply({
						content: ``,
						embeds: [newEmbed2],
						components: enableButtons(pageButtons),
					});

					break;
				case "last":
					if (pageIndex === pages - 1) {
						await button.editReply({
							content: "You are already on the last page!",
							components: enableButtons(pageButtons),
						});
						break;
					}

					pageIndex = pages - 1;

					const newMemberCounts3 = await MemberCounts.findAll({
						where: { guildId: interaction.guildId, counts: { [Op.gt]: 0 } },
						order: [["counts", "DESC"]],
						limit: 10,
						offset: pageIndex * 10,
					});

					const newEmbed3 = await createLeaderboardEmbed({
						pageNumber: pageIndex,
						interaction,
						memberCounts: newMemberCounts3,
					});

					newEmbed3.setFooter({ text: `Page ${pageIndex + 1} of ${pages}` });

					await button.editReply({
						content: ``,
						embeds: [newEmbed3],
						components: enableButtons(pageButtons),
					});
			}
		});
		collector.on("end", () => {
			interaction.editReply({
				content:
					"The leaderboard has expired. Please use the command again to interact with it again.",
				components: disableButtons(pageButtons),
			});
		});
	};

	isGuildCommand: ChatInputCommand<"cached">["isGuildCommand"] = () =>
		!this.dm_permission;

	isDMCommand: ChatInputCommand<"cached">["isDMCommand"] = () =>
		this.dm_permission;

	isSubCommandParent: ChatInputCommand<"cached">["isSubCommandParent"] = () =>
		false;

	isAutocompleteCommand: ChatInputCommand<"cached">["isAutocompleteCommand"] =
		() => false;

	constructor() {
		super();
		this.setName(this.name)
			.setDescription(this.description)
			.setDMPermission(false);
	}
}
