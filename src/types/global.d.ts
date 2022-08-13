/** @format */

import { Client, Collection, MessageCollector } from "discord.js";
import * as globals from "global";
import {
	Configs,
	Counts,
	MemberCounts as MemberCountsDatabase,
} from "../database/database";

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
	 */
	var CountingCollectors: Collection<string, MessageCollector>;
}
