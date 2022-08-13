/** @format */

import * as dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import {
	ActivityType,
	ChannelType,
	Client,
	Collection,
	IntentsBitField,
} from "discord.js";
import { ChatInputCommand, ContextMenu } from "./types/interfaces";
import { registerCommands } from "./utils/registerCommands";
import commands from "./commands/exports";
import contextMenus from "./contextmenus/exports";
import events from "./events/exports";
import { Configs, Counts, MemberCounts } from "./database/database";
import { Logger } from "./utils/botlog";

const registerCommandsBool = process.argv[2];

export class CommandClient<Ready extends boolean> extends Client<Ready> {
	declare commands: Collection<string, ChatInputCommand>;
	declare contextMenus: Collection<string, ContextMenu>;
	declare serverConfigs: Collection<string, Configs>;
}

export interface CommandClientInterface<Ready extends boolean>
	extends Client<Ready> {
	commands: Collection<string, ChatInputCommand>;
	contextMenus: Collection<string, ContextMenu>;
}

const token = process.env.TOKEN;
if (!token) throw new Error("No token was provided.");

const testChannelId = process.env.TESTCHANNELID;
if (!testChannelId) throw new Error("No test channel id was provided.");

const client = new CommandClient({
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildWebhooks,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.MessageContent,
	],
	shards: "auto",
});

client.commands = new Collection();
for (const command of commands) {
	client.commands.set(command.name, command);
}

client.contextMenus = new Collection();
for (const contextMenu of contextMenus) {
	client.contextMenus.set(contextMenu.name, contextMenu);
}

client.on("ready", async (loggedInClient) => {
	if (registerCommandsBool === "true") {
		registerCommands(
			loggedInClient.application.id,
			client.commands,
			client.contextMenus
		);
	}
	for (const event of events) {
		await event.handler(client);
	}
	console.log(`${loggedInClient.user.tag} has logged in.`);
	const testChannel = await client.channels.fetch(testChannelId, {
		force: false,
		cache: true,
	});
	if (testChannel?.type !== ChannelType.GuildText)
		throw new TypeError(
			`Invalid channel type. Expected "ChannelType.GuildText", got ${testChannel?.type}`
		);
	testChannel.send({
		content: `${loggedInClient.user.tag} has logged in with ${
			loggedInClient.guilds.cache.size
		} servers in cache, and ${
			loggedInClient.users.cache.size
		} members in cache, on <t:${Math.trunc(
			loggedInClient.readyTimestamp / 1000
		)}:F>`,
	});
});

(async (token: string) => {
	const localServerCounts = new Collection<string, Counts>();
	const counts = await Counts.findAll();
	for (const count of counts) {
		localServerCounts.set(count.guildId, count);
	}
	const localServerConfigs = new Collection<string, Configs>();
	const configs = await Configs.findAll();
	for (const config of configs) {
		localServerConfigs.set(config.guildId, config);
	}
	globalThis.ServerConfigs = localServerConfigs;
	globalThis.ServerCounts = localServerCounts;

	await client.login(token);
	client.once("ready", async (loggedInClient) => {
		await client.application?.fetch();
		globalThis.BotClient = loggedInClient;
		loggedInClient.user.setPresence({
			activities: [
				{
					name: "who's the highest counter?!?!?!",
					type: ActivityType.Competing,
				},
			],
		});
	});
})(token);

process.on("unhandledRejection", Logger.error);
process.on("uncaughtException", Logger.error);
