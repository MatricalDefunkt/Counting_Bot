/** @format */

import { WebhookClient } from "discord.js";
import { appendFileSync } from "fs";

type LogTypes = "primary" | "error" | "debug";

export class Logger {
	/**
	 * Logs given data in src/logs/primarylog.log
	 * @param data The data to log
	 */
	public static log(data: string | Buffer) {
		if (data instanceof Buffer) {
			console.log(data.toString().trim());
		} else console.log(String(data).trim());
		Logger._appendLog(data, "primary");
	}
	/**
	 * Logs given data in src/logs/debuglog.log
	 * @param data The data to log
	 */
	public static debug(data: string | Buffer) {
		if (data instanceof Buffer) {
			console.log(data.toString().trim());
		} else console.log(String(data).trim());
		Logger._appendLog(data, "debug");
	}
	/**
	 * Logs given errors in src/logs/errorlog.log
	 * @param error The error to log
	 */
	public static error(error: string | Buffer) {
		if (error instanceof Buffer) {
			console.error(error.toString().trim());
		} else console.log(String(error).trim());
		Logger._appendLog(error, "error");
	}
	private static _appendLog(data: string | Buffer, type: LogTypes) {
		appendFileSync(
			`${process.cwd()}/src/logs/${type}log.log`,
			`${new Date()} ||> ${data}\n`,
			{
				encoding: "utf8",
			}
		);
		if (typeof BotClient !== "undefined" && type === "error") {
			if (!process.env.ERRORWEBHOOKURL) return;
			const webhook = new WebhookClient({ url: process.env.ERRORWEBHOOKURL });
			webhook.send(`ERROR:\`\`\`ts\n${String(data).trim()}\`\`\``);
		}
	}
}
