/** @format */

import { Client, Collection, MessageCollector } from "discord.js";
import * as globals from "global";
import { Configs, Counts, MemberCounts } from "../database/database";

declare global {
	/**
	 * To be used only inside scripts running after clientstart.ts runs.
	 */
	var BotClient: Client<true>;
	/**
	 * All server configurations for easy access.
	 */
	var ServerConfigs: Collection<string, Configs>;
	/**
	 * Number counts for every server.
	 */
	var ServerCounts: Collection<string, Counts>;
	/**
	 * Collection of active message collectors
	 * @ignore This is not implemented yet.
	 */
	var CountingCollectors: Collection<string, MessageCollector>;
	/**
	 * Global method to get the server configuration (or create if one doesn't exist) for a server.
	 * @param {string} guildId The id of the server.
	 * @returns {Promise<Configs>} The server configuration.
	 */
	function getServerConfig(guildId: string): Promise<Configs>;
	/**
	 * Global method to get the server count (or create if one doesn't exist) for a server.
	 * @param {string} guildId The id of the server.
	 * @returns {Promise<Counts>} The server count.
	 */
	function getServerCount(guildId: string): Promise<Counts>;
	/**
	 * Global method to get the count of a member in a server (or create if one doesn't exist).
	 * @param {string} memberId The id of the member.
	 * @param {string} guildId The id of the server.
	 * @returns {Promise<MemberCounts>} The member count.
	 */
	function getMemberCount(
		memberId: string,
		guildId: string
	): Promise<MemberCounts>;
}
