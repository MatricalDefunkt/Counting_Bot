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

globalThis.getServerConfig = async function (guildId) {
	const config =
		ServerConfigs.get(guildId) ?? (await Configs.findByPk(guildId));
	if (config) return config;
	const newConfig = new Configs();
	newConfig.guildId = guildId;
	await newConfig.save();
	ServerConfigs.set(guildId, newConfig);
	return newConfig;
};

globalThis.getServerCount = async function (guildId) {
	const config = ServerCounts.get(guildId) ?? (await Counts.findByPk(guildId));
	if (config) return config;
	const newCount = new Counts();
	newCount.guildId = guildId;
	await newCount.save();
	ServerCounts.set(guildId, newCount);
	return newCount;
};

globalThis.getMemberCount = async function (memberId, guildId) {
	const memberCount = await MemberCounts.findOne({
		where: { userId: memberId, guildId },
	});
	if (memberCount) return memberCount;
	const newMemberCount = new MemberCounts();
	newMemberCount.guildId = guildId;
	newMemberCount.userId = memberId;
	await newMemberCount.save();
	return newMemberCount;
};

client.on("ready", async (loggedInClient) => {
	if (registerCommandsBool === "true") {
		registerCommands(
			loggedInClient.application.id,
			client.commands,
			client.contextMenus
		);
	}
	console.log(`${loggedInClient.user.tag} has logged in.`);
	const testChannel = await client.channels.fetch(testChannelId, {
		force: false,
		cache: true,
	});
	if (!testChannel) throw new Error("No test channel was found.");
	if (testChannel.type !== ChannelType.GuildText)
		throw new TypeError(
			`Invalid channel type. Expected "ChannelType.GuildText", got ${testChannel.type}`
		);
	else
		testChannel.send({
			content: `${loggedInClient.user.tag} has logged in with ${
				loggedInClient.guilds.cache.size
			} servers in cache, and ${
				loggedInClient.users.cache.size
			} members in cache, on <t:${Math.trunc(
				loggedInClient.readyTimestamp / 1000
			)}:F>`,
		});
	await client.application?.fetch();
	globalThis.BotClient = loggedInClient;
	loggedInClient.user.setPresence({
		activities: [
			{
				name: "the race to the highest count!",
				type: ActivityType.Competing,
			}, // Shows as "Competing in {name}"
		],
	});
	for (const event of events) {
		await event.handler(client);
	}
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
})(token);

if (!process.env.ERRORWEBHOOKURL)
	process.emitWarning(
		'Webhook URL has not been specified in ".env". Errors will not be posted to Discord.'
	);

process.on("warning", Logger.error);
process.on("unhandledRejection", Logger.error);
process.on("uncaughtException", Logger.error);
client.on("debug", Logger.debug);
client.on("error", console.log);
