/** @format */

import {
	ButtonInteraction,
	ComponentType,
	InteractionCollector,
	SlashCommandBuilder,
	ModalBuilder,
	ActionRowBuilder,
	TextInputStyle,
} from "discord.js";
import {
	createPaginationButtons,
	disableButtons,
	enableButtons,
} from "../utils/buttonCreators";
import { createLeaderboardEmbed } from "../utils/embedCreators";
import { MemberCounts } from "../database/database";
import { ChatInputCommand } from "../types/interfaces";
import Paginator from "../utils/paginator";
import { TextInputBuilder } from "@discordjs/builders";
import { Op } from "sequelize";

export default class Leaderboard
	extends SlashCommandBuilder
	implements ChatInputCommand<"cached">
{
	name = "leaderboard";
	description = "Gets the counting leaderboard for the server.";
	execute: ChatInputCommand<"cached">["execute"] = async (interaction) => {
		const paginator = new Paginator({
			model: MemberCounts,
			pageSize: 10,
			whereQuery: {
				guildId: interaction.guildId,
				counts: { [Op.gt]: 0 },
			},
			orderQuery: [
				["counts", "DESC"],
				["createdAt", "ASC"],
			],
		});

		const firstPage = await paginator.init();

		if (firstPage.length === 0) {
			return interaction.editReply({
				content: "This server has not begun counting yet!",
			});
		}
		const embed = await createLeaderboardEmbed({
			interaction,
			memberCounts: firstPage,
			pageNumber: paginator.currentPage,
		});
		const pageButtons = createPaginationButtons();
		embed.setFooter({
			text: `Page ${paginator.currentPage + 1} of ${paginator.maxPages}`,
		});
		const reply = await interaction.editReply({
			embeds: [embed],
			components: pageButtons,
		});
		const collector = new InteractionCollector<ButtonInteraction>(
			interaction.client,
			{
				time: 180_000,
				componentType: ComponentType.Button,
				message: reply,
			}
		);
		collector.on("collect", async (button) => {
			if (button.customId !== "goTo")
				await button.update({ components: disableButtons(pageButtons) });
			switch (button.customId) {
				case "next":
					try {
						const nextPage = await paginator.nextPage();
						const embed = await createLeaderboardEmbed({
							interaction,
							memberCounts: nextPage,
							pageNumber: paginator.currentPage,
						});
						embed.setFooter({
							text: `Page ${paginator.currentPage + 1} of ${
								paginator.maxPages
							}`,
						});
						await button.editReply({
							content: "",
							embeds: [embed],
							components: enableButtons(pageButtons),
						});
					} catch (error) {
						await button.editReply({
							content: "There are no more pages!",
							components: enableButtons(pageButtons),
						});
					}
					break;
				case "previous":
					try {
						const previousPage = await paginator.previousPage();
						const embed = await createLeaderboardEmbed({
							interaction,
							memberCounts: previousPage,
							pageNumber: paginator.currentPage,
						});
						embed.setFooter({
							text: `Page ${paginator.currentPage + 1} of ${
								paginator.maxPages
							}`,
						});
						await button.editReply({
							content: "",
							embeds: [embed],
							components: enableButtons(pageButtons),
						});
					} catch (error) {
						await button.editReply({
							content: "There are no more pages!",
							components: enableButtons(pageButtons),
						});
					}
					break;
				case "first":
					{
						const firstPage = await paginator.firstPage();
						const embed = await createLeaderboardEmbed({
							interaction,
							memberCounts: firstPage,
							pageNumber: paginator.currentPage,
						});
						embed.setFooter({
							text: `Page ${paginator.currentPage + 1} of ${
								paginator.maxPages
							}`,
						});
						await button.editReply({
							content: "",
							embeds: [embed],
							components: enableButtons(pageButtons),
						});
					}
					break;
				case "last":
					{
						const lastPage = await paginator.lastPage();
						const embed = await createLeaderboardEmbed({
							interaction,
							memberCounts: lastPage,
							pageNumber: paginator.currentPage,
						});
						embed.setFooter({
							text: `Page ${paginator.currentPage + 1} of ${
								paginator.maxPages
							}`,
						});
						await button.editReply({
							content: "",
							embeds: [embed],
							components: enableButtons(pageButtons),
						});
					}
					break;
				case "goTo": {
					const gotoPageModal = new ModalBuilder()
						.setCustomId("gotoPageModal")
						.setTitle("Go to page")
						.addComponents(
							new ActionRowBuilder<TextInputBuilder>().addComponents(
								new TextInputBuilder()
									.setCustomId("goToValue")
									.setLabel("Page Number")
									.setPlaceholder("Page Number")
									.setMinLength(1)
									.setMaxLength(paginator.maxPages.toString().length)
									.setStyle(TextInputStyle.Short)
							)
						);
					await button.showModal(gotoPageModal);
					const modalSubmit = await button
						.awaitModalSubmit({
							time: 60_000,
						})
						.catch((err) => {
							console.log("here");
							if (err.code === "InteractionCollectorError") {
								button.followUp({
									content: "You took too long to submit the modal!",
								});
							} else console.log(err);
						});
					if (!modalSubmit) {
						console.log("No modal submit");
						return;
					}
					await modalSubmit.reply({
						content: "Loading...",
						ephemeral: true,
					});
					const pageNumber = parseInt(
						modalSubmit.fields.getTextInputValue("goToValue")
					);
					if (pageNumber === NaN) {
						await modalSubmit.followUp({
							content: "That is not a valid page number!",
							ephemeral: true,
						});
						return;
					}
					if (pageNumber > paginator.maxPages) {
						await modalSubmit.followUp({
							content: "That page number is too high!",
							ephemeral: true,
						});
						return;
					}
					if (pageNumber < 1) {
						await modalSubmit.followUp({
							content: "That page number is too low!",
							ephemeral: true,
						});
						return;
					}
					try {
						const page = await paginator.goToPage(pageNumber - 1);
						const embed = await createLeaderboardEmbed({
							interaction,
							memberCounts: page,
							pageNumber: paginator.currentPage,
						});
						embed.setFooter({
							text: `Page ${paginator.currentPage + 1} of ${
								paginator.maxPages
							}`,
						});
						await button.editReply({
							content: "",
							embeds: [embed],
							components: enableButtons(pageButtons),
						});
						await modalSubmit.editReply({
							content: "Done!",
						});
					} catch (error) {
						await modalSubmit.followUp({
							content: "That page number is too high!",
						});
					}
					break;
				}
			}
		});
		collector.on("end", () => {
			interaction.editReply({
				content:
					"The leaderboard has expired. Please use the command again to interact with it again.",
				components: disableButtons(pageButtons),
			});
		});
		collector.on("ignore", () => {
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
