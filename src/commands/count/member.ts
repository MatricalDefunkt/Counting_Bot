/** @format */

import { PermissionFlagsBits, SlashCommandSubcommandBuilder } from "discord.js";
import { CountEmbedTypes, createCountEmbed } from "../../utils/embedCreators";
import { Configs, Counts } from "../../database/database";
import { SubCommand } from "../../types/interfaces";

export default class CountMember
	extends SlashCommandSubcommandBuilder
	implements SubCommand<"cached">
{
	name = "member";
	description =
		"Get the number of times you or the provided member have counted.";

	execute: SubCommand<"cached">["execute"] = async (interaction) => {
		const providedMember = interaction.options.getMember("member");
		let serverConfig = ServerConfigs.get(
			interaction.guildId
		) as unknown as Configs | null;
		if (!serverConfig) {
			serverConfig = await Configs.findByPk(interaction.guildId);
			if (!serverConfig)
				return await interaction.editReply({
					content: `Server hasn't been configured yet! ${
						interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)
							? `\nYou should use /config, and setup a counting channel.`
							: ``
					}`,
				});
		}
		let serverCount = ServerCounts.get(
			interaction.guildId
		) as unknown as Counts | null;
		if (!serverCount) {
			serverCount = await Counts.findByPk(interaction.guildId);
			if (!serverCount)
				return await interaction.editReply({
					content: `Server hasn't begun counting yet!${
						interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)
							? `\nYou should use /config, and setup a counting channel.`
							: ``
					}`,
				});
			ServerCounts.set(interaction.guildId, serverCount);
		}
		const embed = await createCountEmbed(
			providedMember ?? interaction.member,
			interaction.guild,
			CountEmbedTypes.MemberCountEmbed
		);
		await interaction.editReply({ embeds: [embed] });
	};

	isAutocompleteSubCommand: SubCommand<"cached">["isAutocompleteSubCommand"] =
		() => {
			return false;
		};
	constructor() {
		super();
		this.setName(this.name);
		this.setDescription(this.description);
		this.addUserOption((o) =>
			o
				.setName("member")
				.setDescription(
					"The member to check the statistics of. It is you by default."
				)
		);
	}
}
