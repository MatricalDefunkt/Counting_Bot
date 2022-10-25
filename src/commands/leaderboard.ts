/** @format */

import { EmbedBuilder } from "@discordjs/builders";
import { SlashCommandBuilder } from "discord.js";
import { MemberCounts } from "../database/database";
import { ChatInputCommand } from "../types/interfaces";

export default class Leaderboard
	extends SlashCommandBuilder
	implements ChatInputCommand<"cached">
{
	name = "leaderboard";
	description = "Gets the counting leaderboard for the server.";
	execute: ChatInputCommand<"cached">["execute"] = async (interaction) => {
		const memberCounts = await MemberCounts.findAll({
			where: { guildId: interaction.guildId },
			attributes: ["userId", "counts", "lastCount", "createdAt"],
		});
		if (memberCounts.length === 0) {
			return interaction.reply({
				content: "This server has not begun counting yet!",
			});
		}
		const sortedCounts = memberCounts
			.sort((a, b) => b.count - a.count)
			.slice(0, 10);
		const leaderboard = sortedCounts.map(
			(memberCount, index) =>
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
		for (const [index, memberCount] of sortedCounts.entries()) {
			const user = await interaction.client.users.fetch(memberCount.userId);
			embed.addFields({
				name: `${index + 1}. ${user.tag}`,
				value: leaderboard[index],
			});
		}
		await interaction.editReply({ embeds: [embed] });
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
