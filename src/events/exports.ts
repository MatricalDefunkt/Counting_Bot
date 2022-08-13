/** @format */

import { Event } from "../types/interfaces";
import { CountingHandler } from "./countingHandler";
import { GuildCreate } from "./guildCreate";
import { GuildDelete } from "./guildDelete";
import { InteractionCreate } from "./interactionCreate";
import { MessageCreate } from "./messageCreate";
import { MessageDelete } from "./messageDelete";

const events: Event[] = [
	new InteractionCreate(),
	new GuildCreate(),
	new GuildDelete(),
	new MessageCreate(),
	new CountingHandler(),
	new MessageDelete(),
];
export default events;
