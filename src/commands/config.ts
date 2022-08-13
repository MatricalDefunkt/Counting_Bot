/** @format */

import { SlashCommandBuilder } from "@discordjs/builders";
import { Configs } from "../database/database";
import { ConfigTypes, trueFalseArrays } from "../utils/configTypes";
import { ChatInputCommand, CommandCancelCodes } from "../types/interfaces";
import {
	ChannelType,
	ComponentType,
	EmbedBuilder,
	PermissionFlagsBits,
} from "discord.js";
import {
	createConfirmationButtons,
	disableButtons,
} from "../utils/buttonCreators";

const confirmButtons = createConfirmationButtons("yeschange", "nocancel");
const disabledConfirmButtons = disableButtons(confirmButtons);

enum ActionTypes {
	Get = 0,
	Set = 1,
	Delete = -1,
}

const PrettyConfigs = {
	countingChannelId: "Counting Channel",
	staffRoleId: "Staff Role",
	deleteIfWrong: "Delete if Wrong",
	resetIfWrong: "Reset if Wrong",
};

const configArray: [
	"countingChannelId",
	"staffRoleId",
	"deleteIfWrong",
	"resetIfWrong"
] = ["countingChannelId", "staffRoleId", "deleteIfWrong", "resetIfWrong"];

export default class Config
	extends SlashCommandBuilder
	implements ChatInputCommand<"cached">
{
	name = "config";
	description = "Allows the configuration of features for a server.";

	execute: ChatInputCommand<"cached">["execute"] = async (interaction) => {
		const serverConfig = ServerConfigs.get(interaction.guildId);
		if (!serverConfig) {
			console.error("Did not find server config for " + interaction.guildId);
			const serverConfig =
				(await Configs.findByPk(interaction.guildId)) ??
				(await Configs.create({ guildId: interaction.guildId }));
			ServerConfigs.set(interaction.guildId, serverConfig);
			return await interaction.editReply({
				content: `There was an error. Please try again.`,
			});
		}
		const actionType = interaction.options.getInteger(
			"action",
			true
		) as ActionTypes;
		const newConfigValue = interaction.options.getString("new-value");
		const configType = ConfigTypes.findConfig(
			interaction.options.getString("type", true) as
				| "countingChannelId"
				| "staffRoleId"
				| "deleteIfWrong"
		);

		if (!configType) {
			console.error(
				"Could not find ConfigType " +
					interaction.options.getString("type", true)
			);
			return await interaction.editReply({
				content: `Something went terribly wrong. The bot creator has been notified. Please try again.`,
			});
		}

		if (!serverConfig) {
			console.error(
				"Could not find previous server config for " + interaction.guildId
			);
			await Configs.create({
				guildId: interaction.guildId,
			});
			return await interaction.editReply({
				content: `Something went terribly wrong. The bot creator has been notified. Please try again.`,
			});
		}
		if (actionType === ActionTypes.Get) {
			const embed = new EmbedBuilder().setTitle("Server Configuration:");
			let isComplete = true;
			for (const config of configArray) {
				embed.addFields({
					name: `${PrettyConfigs[config]}:`,
					value: String(serverConfig[config] ?? `Not setup.`),
				});
				if (isComplete) isComplete = Boolean(serverConfig[config]);
			}
			embed.setColor(isComplete ? "Green" : "Red");
			return await interaction.editReply({
				embeds: [embed],
			});
		} else if (actionType === ActionTypes.Set) {
			if (!newConfigValue)
				return await interaction.editReply({
					content: `If you are trying to set a new value, you must provide the new value in \`new-value\``,
				});
			const validated = await ConfigTypes.checkValidity({
				config: configType,
				dataToCheck: newConfigValue,
				interaction,
			});
			if (!validated)
				return await interaction.editReply({
					content: `Provided value seems incorrect for the selected option to set. Please try again.`,
				});
			if (configType.type === "boolean") {
				let finalBool: boolean;
				finalBool = trueFalseArrays.trueArray.includes(newConfigValue);
				serverConfig[configType.name] = finalBool as unknown as undefined;
			} else
				serverConfig[configType.name] = newConfigValue as unknown as undefined;
			await serverConfig.save();

			const serverCount = ServerCounts.get(interaction.guildId);

			if (configType.name === "countingChannelId") {
				const channel = await BotClient.channels.fetch(newConfigValue)!;
				if (channel?.type === ChannelType.GuildText) {
					channel.send({
						embeds: [
							new EmbedBuilder()
								.setTitle(
									"This channel has been set as the counting channel for this server!"
								)
								.setDescription(
									`You may begun counting ${
										serverCount
											? `from \`${serverCount.count + 1}\``
											: `here now`
									}`
								)
								.setColor("Green"),
						],
					});
				}
			}

			const embed = new EmbedBuilder().setTitle("Server Configuration:");
			let isComplete = true;
			for (const config of configArray) {
				embed.addFields({
					name: `${PrettyConfigs[config]}:`,
					value: String(serverConfig[config] ?? `Not setup.`),
				});
				if (isComplete) isComplete = Boolean(serverConfig[config]);
			}
			embed.setColor(isComplete ? "Green" : "Red");
			return await interaction.editReply({
				embeds: [embed],
			});
		} else if (actionType === ActionTypes.Delete) {
			const buttons = createConfirmationButtons("yesdelete", "nocancel");
			const config = configArray.find((config) => config === configType.name)!;
			const reply = await interaction.editReply({
				content: `Are you sure you want to delete \`${PrettyConfigs[config]}\`?`,
				components: buttons,
			});
			const button = await reply
				.awaitMessageComponent({
					componentType: ComponentType.Button,
					time: 600_000,
				})
				.catch(async (e) => {
					if (e.code === "INTERACTION_COLLECTOR_ERROR") return;
					else console.error(e);
					await interaction.editReply({
						content: `Something went terribly wrong. The bot creator has been notified. Please try again.`,
						components: disabledConfirmButtons,
					});
					return;
				});
			if (button) {
				await button.deferUpdate();
				if (button.customId === "yesdelete") {
					serverConfig[configType.name] = null as unknown as undefined;
					await serverConfig.save();
					await button.editReply({
						content: `The value of \`${PrettyConfigs[config]}\` has been deleted.`,
						components: disabledConfirmButtons,
					});
				} else
					await button.editReply({
						content: `Cancelled!`,
						components: disabledConfirmButtons,
					});
			}
		}
	};

	onBefore: ChatInputCommand<"cached">["onBefore"] = async (interaction) => {
		let serverConfig = await Configs.findByPk(interaction.guildId);
		if (!serverConfig) {
			serverConfig =
				(await Configs.findByPk(interaction.guildId)) ??
				(await Configs.create({ guildId: interaction.guildId }));
			ServerConfigs.set(interaction.guildId, serverConfig);
			return {
				processedInteraction: interaction,
				code: CommandCancelCodes.ImproperConfiguration,
			};
		}
		let hasPermissions: boolean;
		hasPermissions = Boolean(
			interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild) ||
				(serverConfig.staffRoleId &&
					interaction.member.roles.cache.has(serverConfig.staffRoleId))
		);
		return {
			processedInteraction: interaction,
			code: hasPermissions
				? CommandCancelCodes.Success
				: CommandCancelCodes.MissingPermissions,
		};
	};

	onCancel: ChatInputCommand<"cached">["onCancel"] = async (
		interaction,
		code
	) => {
		if (code === CommandCancelCodes.MissingPermissions)
			return await interaction.editReply({
				content: `You are not authorized to run this command.`,
			});
		else if (code === CommandCancelCodes.ImproperConfiguration)
			return await interaction.editReply({
				content: `Something went wrong with getting the server configuration. Please try again.`,
			});
	};

	isGuildCommand: ChatInputCommand<"cached">["isGuildCommand"] = () => {
		return !this.dm_permission;
	};

	isDMCommand: ChatInputCommand<"cached">["isDMCommand"] = () => {
		return this.dm_permission;
	};

	isSubCommandParent: ChatInputCommand<"cached">["isSubCommandParent"] = () => {
		return false;
	};

	isAutocompleteCommand: ChatInputCommand<"cached">["isAutocompleteCommand"] =
		() => {
			return false;
		};

	constructor() {
		super();
		this.setName(this.name);
		this.setDescription(this.description);
		this.addStringOption((o) =>
			o
				.setName("type")
				.setDescription("The type of value you would like to configure")
				.addChoices(
					{
						name: "Counting channel ID - Channel where members will count.",
						value: "countingChannelId",
					},
					{
						name: "Staff role ID - Role which can be allowed to use this command.",
						value: "staffRoleId",
					},
					{
						name: "Delete if wrong (true / false) - Delete number if it's wrong (react with cross otherwise)",
						value: "deleteIfWrong",
					},
					{
						name: "Reset if wrong (true / false) - Reset the count if the wrong number is provided",
						value: "resetIfWrong",
					}
				)
				.setRequired(true)
		);
		this.addIntegerOption((o) =>
			o
				.setName("action")
				.setDescription("Whether you want to get or set the value")
				.addChoices(
					{ name: "Get", value: 0 },
					{ name: "Set", value: 1 },
					{ name: "Delete", value: -1 }
				)
				.setRequired(true)
		);
		this.addStringOption((o) =>
			o
				.setName("new-value")
				.setDescription("The new value of the given configuration type.")
		);
		this.setDMPermission(false);
		this.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);
	}
}
