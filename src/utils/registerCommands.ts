/** @format */

import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { Collection } from "discord.js";
import { ChatInputCommand, ContextMenu } from "../types/interfaces";
import * as dotenv from "dotenv";
dotenv.config();

/**
 *
 * @param {string} applicationId The application ID to register the commands against.
 * @param {Collection<string, BaseCommand>}commands The commands to register (Can be chat input or context menus).
 * @returns {boolean} Whether or not the commands were registered.
 */
export const registerCommands = async (
	applicationId: string,
	commands: Collection<string, ChatInputCommand>,
	contextMenus: Collection<string, ContextMenu>
): Promise<boolean> => {
	const rest = new REST();
	console.log("Registering commands...");
	const jsonData = [];
	for (const command of commands) {
		jsonData.push(command[1].toJSON());
	}
	for (const contextMenu of contextMenus) {
		jsonData.push(contextMenu[1].toJSON());
	}
	if (!process.env.TOKEN)
		throw new Error("Token was not provided to register commands.");
	return rest
		.setToken(process.env.TOKEN)
		.put(Routes.applicationCommands(applicationId), { body: jsonData })
		.then(() => {
			console.log("Registered commands successfully!");
			return true;
		})
		.catch((reason) => {
			console.log(reason);
			return false;
		});
};
