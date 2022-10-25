/** @format */

import {
	ChannelType,
	ComponentType,
	EmbedBuilder,
	PermissionFlagsBits,
	SlashCommandSubcommandBuilder,
} from "discord.js";
import { getKeyFromValue } from "../../utils/getKeyFromValue";
import {
	ActionTypes,
	ConfigChannelTypes,
	SubCommand,
} from "../../types/interfaces";
import {
	createConfirmationButtons,
	disableButtons,
} from "../../utils/buttonCreators";

export default class ConfigChannel
	extends SlashCommandSubcommandBuilder
	implements SubCommand<"cached">
{
	name = "channel";
	description = "Modify the channel for counting.";

	execute: SubCommand<"cached">["execute"] = async (interaction) => {
		const action = interaction.options.getNumber("action", true) as ActionTypes;
		const channelType = interaction.options.getString(
			"channel-type",
			true
		) as ConfigChannelTypes;
		const channel = interaction.options.getChannel("channel");
		const serverConfig = await getServerConfig(interaction.guildId);

		if (action === ActionTypes.Get) {
			const storedChannelId = serverConfig[channelType];
			interaction.editReply({
				content: `The ${getKeyFromValue(
					ConfigChannelTypes,
					channelType
				).toLowerCase()} channel is ${
					storedChannelId ? `<#${storedChannelId}>` : "not set."
				}`,
			});
		} else if (action === ActionTypes.Set) {
			if (!channel)
				return await interaction.editReply({
					content: `Please provide a new channel using the "channel" option.`,
				});
			if (channel.type !== ChannelType.GuildText) {
				return interaction.editReply({
					content: `Please choose a text channel.`,
				});
			}
			if (
				!channel
					.permissionsFor(interaction.guild.members.me!)
					.has(PermissionFlagsBits.SendMessages)
			) {
				return await interaction.editReply({
					content: `Cannot set this channel as the ${getKeyFromValue(
						ConfigChannelTypes,
						channelType
					).toLowerCase()} channel as I do not have the permission to send messages in that channel.`,
				});
			} else {
				serverConfig[channelType] = channel.id;
				await serverConfig.save();
				ServerConfigs.set(interaction.guildId, serverConfig);
				await interaction.editReply({
					content: `The ${getKeyFromValue(
						ConfigChannelTypes,
						channelType
					).toLowerCase()} channel has been set to <#${channel.id}>.`,
				});
				if (channelType === ConfigChannelTypes.Counting) {
					const newCountEmbed = new EmbedBuilder();
					newCountEmbed
						.setTitle("And so it begins...")
						.setAuthor({
							name: BotClient.user.username,
							iconURL: BotClient.user.avatarURL() ?? undefined,
						})
						.setDescription(
							`This channel has been set as the counting channel for this server.\nStart counting now by typing \`${
								((await getServerCount(interaction.guildId)).counts ?? 0) + 1
							}\`!`
						)
						.addFields({
							name: "Rules",
							value:
								"1. You can only count by 1.\n2. You can only count in this channel.\n3. You are allowed to add text after numbers by giving a space. Example: `1 Hello`",
						});
					await channel.send({
						embeds: [newCountEmbed],
					});
				}
			}
		} else if (action === ActionTypes.Delete) {
			const buttons = createConfirmationButtons("yes", "no");
			const reply = await interaction.editReply({
				content: `Are you sure you want to delete the \`${getKeyFromValue(
					ConfigChannelTypes,
					channelType
				).toLowerCase()}\` option?`,
				components: buttons,
			});
			const response = await reply
				.awaitMessageComponent({
					componentType: ComponentType.Button,
					time: 10000,
				})
				.catch((error) => {
					if (error.code === 50001) {
						interaction.editReply({
							content: "You took too long to respond.",
							components: disableButtons(buttons),
						});
					}
				});
			if (response) {
				await response.deferUpdate();
				if (response.customId === "yes") {
					serverConfig[channelType] = undefined;
					await serverConfig.save();
					return await response.editReply({
						content: `The \`${getKeyFromValue(
							ConfigChannelTypes,
							channelType
						).toLowerCase()}\` option has been deleted.`,
						components: disableButtons(buttons),
					});
				} else if (response.customId === "no") {
					return await response.editReply({
						content: "The action has been cancelled.",
						components: disableButtons(buttons),
					});
				}
			}
		}
	};

	isAutocompleteSubCommand = () => false;

	constructor() {
		super();
		this.setName(this.name);
		this.setDescription(this.description);
		this.addNumberOption((o) =>
			o
				.setName("action")
				.setDescription(
					"Whether you want to set, get or delete this configuration."
				)
				.addChoices(
					{ name: "Get", value: ActionTypes.Get },
					{ name: "Set", value: ActionTypes.Set },
					{ name: "Delete", value: ActionTypes.Delete }
				)
				.setRequired(true)
		);
		this.addStringOption((o) =>
			o
				.setName("channel-type")
				.setDescription("The type of channel you want to configure.")
				.addChoices({ name: "Counting", value: ConfigChannelTypes.Counting })
				.setRequired(true)
		);
		this.addChannelOption((o) =>
			o
				.setName("channel")
				.setDescription(
					"The channel to set as the new confessions / logging channel."
				)
				.addChannelTypes(ChannelType.GuildText)
		);
	}
}
