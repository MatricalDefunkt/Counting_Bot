/** @format */

import { SlashCommandBuilder } from "@discordjs/builders";
import { PermissionFlagsBits } from "discord.js";
import { Configs } from "../database/database";
import { SubCommandParent, CommandCancelCodes } from "../types/interfaces";
import subCommands from "./count/exports";
import CountServer from "./count/server";

export default class Count
	extends SlashCommandBuilder
	implements SubCommandParent<"cached">
{
	name = "count";
	description = "Perform actions with the server's current count!";
	children: SubCommandParent<"cached">["children"] = subCommands;

	execute: SubCommandParent<"cached">["execute"] = async (interaction) => {
		const subCommand = this.children.find(
			(subCommand) =>
				subCommand.name === interaction.options.getSubcommand(true)
		);
		if (!subCommand)
			return await interaction.editReply({
				content: `This command has not been implemented yet. Please try again later!`,
			});
		if (
			subCommand.canBeDeferred === true ||
			typeof subCommand.canBeDeferred === "undefined"
		)
			await interaction.deferReply({ ephemeral: true });
		await subCommand.execute(interaction);
		return;
	};

	onBefore: SubCommandParent<"cached">["onBefore"] = async (interaction) => {
		let serverConfig = ServerConfigs.get(interaction.guildId);
		if (!serverConfig) {
			serverConfig =
				(await Configs.findByPk(interaction.guildId)) ??
				(await Configs.create({ guildId: interaction.guildId }));
			ServerConfigs.set(interaction.guildId, serverConfig);
			return {
				processedInteraction: interaction,
				code: CommandCancelCodes.ImproperConfiguration,
			};
		} else {
			if (interaction.options.getSubcommand(true) === "set") {
				if (!serverConfig.countingChannelId) {
					return {
						processedInteraction: interaction,
						code: CommandCancelCodes.ImproperConfiguration,
					};
				} else {
					return {
						code:
							interaction.memberPermissions.has(
								PermissionFlagsBits.ManageGuild
							) ||
							(serverConfig.staffRoleId &&
								interaction.member.roles.cache.has(serverConfig.staffRoleId))
								? CommandCancelCodes.Success
								: CommandCancelCodes.MissingPermissions,
						processedInteraction: interaction,
					};
				}
			} else {
				return {
					processedInteraction: interaction,
					code: serverConfig.countingChannelId
						? CommandCancelCodes.Success
						: CommandCancelCodes.ImproperConfiguration,
				};
			}
		}
	};

	onCancel: SubCommandParent<"cached">["onCancel"] = async (
		interaction,
		code
	) => {
		if (interaction.isRepliable()) {
			if (code === CommandCancelCodes.ImproperConfiguration) {
				return await interaction.reply({
					content: `Please check the server's configuration using \`/config\`.`,
					ephemeral: true,
				});
			} else if (code === CommandCancelCodes.MissingPermissions) {
				return await interaction.reply({
					content: `You are not authorized to run this command.`,
					ephemeral: true,
				});
			}
		} else {
			if (code === CommandCancelCodes.ImproperConfiguration) {
				return await interaction.editReply({
					content: `Please check the server's configuration using \`/config\`.`,
				});
			} else if (code === CommandCancelCodes.MissingPermissions) {
				return await interaction.editReply({
					content: `You are not authorized to run this command.`,
				});
			}
		}
	};

	isGuildCommand: SubCommandParent<"cached">["isGuildCommand"] = () => {
		return !this.dm_permission;
	};

	isDMCommand: SubCommandParent<"cached">["isDMCommand"] = () => {
		return this.dm_permission;
	};

	isSubCommandParent: SubCommandParent<"cached">["isSubCommandParent"] = () => {
		return true;
	};

	isAutocompleteCommand: SubCommandParent<"cached">["isAutocompleteCommand"] =
		() => {
			return false;
		};

	isAutocompleteParent: SubCommandParent<"cached">["isAutocompleteParent"] =
		() => {
			return false;
		};

	constructor() {
		super();
		this.setName(this.name);
		this.setDescription(this.description);
		this.setDMPermission(false);
		this.children.forEach((child) => this.addSubcommand(child));
	}
}
