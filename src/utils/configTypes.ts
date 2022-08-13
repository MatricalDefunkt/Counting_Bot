/** @format */

import {
	ChannelType,
	CommandInteraction,
	GuildMember,
	PermissionFlagsBits,
} from "discord.js";

type ConfigType = {
	name: "countingChannelId" | "deleteIfWrong" | "staffRoleId" | "resetIfWrong";
	type: "channel" | "role" | "boolean";
};

export const trueFalseArrays = {
	trueArray: ["true", "yes", "y", "t"],
	falseArray: ["f", "n", "no", "false"],
};

const trueFalseArray = ["true", "yes", "y", "t", "f", "n", "no", "false"];

type CheckValidityData = {
	dataToCheck: string;
	config: ConfigType;
	interaction: CommandInteraction<"cached">;
};

export class ConfigTypes {
	/**
	 * Confessions channel
	 */
	static readonly CountingChannel: ConfigType = {
		name: "countingChannelId",
		type: "channel",
	};
	/**
	 * Confessions channel
	 */
	static readonly DeleteIfWrong: ConfigType = {
		name: "deleteIfWrong",
		type: "boolean",
	};
	/**
	 * Confessions channel
	 */
	static readonly ResetIfWrong: ConfigType = {
		name: "resetIfWrong",
		type: "boolean",
	};
	/**
	 * Staff role
	 */
	static readonly StaffRole: ConfigType = { name: "staffRoleId", type: "role" };
	/**
	 * Search for a configuration type using the configuration name.
	 * @param {ConfigType["name"]} config Name of the config.
	 * @returns	{ConfigType | undefined} The object of the config with its type
	 */
	static findConfig(config: ConfigType["name"]) {
		if (config === this.CountingChannel.name) return this.CountingChannel;
		if (config === this.StaffRole.name) return this.StaffRole;
		if (config === this.DeleteIfWrong.name) return this.DeleteIfWrong;
		if (config === this.ResetIfWrong.name) return this.ResetIfWrong;
	}
	/**
	 * Checks the validity of a given config snowflake.
	 * @param data Data to check, which includes the ID, configuration type and interaction.
	 * @returns Whether the data is valid or not.
	 */
	static async checkValidity(data: CheckValidityData): Promise<boolean> {
		if (data.config.type === "channel") {
			return data.interaction.guild.channels
				.fetch(data.dataToCheck, { cache: true, force: false })
				.then((channel) => {
					return Boolean(
						channel &&
							channel.type === ChannelType.GuildText &&
							data.interaction.guildId === channel.guildId &&
							channel
								.permissionsFor(
									data.interaction.guild.members.me as GuildMember
								)
								.has(
									PermissionFlagsBits.SendMessages &&
										PermissionFlagsBits.EmbedLinks &&
										PermissionFlagsBits.ReadMessageHistory &&
										PermissionFlagsBits.CreatePublicThreads &&
										PermissionFlagsBits.SendMessagesInThreads
								)
					);
				})
				.catch((err) => {
					console.error(err);
					return false;
				});
		} else if (data.config.type === "role") {
			return data.interaction.guild.roles
				.fetch(data.dataToCheck, { cache: true, force: false })
				.then((role) => {
					if (!role) return false;
					else return true;
				})
				.catch((err) => {
					console.error(err);
					return false;
				});
		} else {
			return trueFalseArray.includes(data.dataToCheck);
		}
	}
}
