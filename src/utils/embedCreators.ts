/** @format */

import { EmbedBuilder, Guild, GuildMember } from "discord.js";
import { MemberCounts } from "../database/database";

export enum CountEmbedTypes {
	MemberCountEmbed,
	ServerCountEmbed,
}

export async function createCountEmbed(
	member: GuildMember,
	guild: Guild,
	type: CountEmbedTypes
): Promise<EmbedBuilder> {
	if (type === CountEmbedTypes.ServerCountEmbed) {
		const embed = new EmbedBuilder();
		const serverCount = ServerCounts.get(guild.id)!;
		embed.setTitle(`Stats in ${guild.name}`);
		embed.addFields(
			{ name: "Current Count:", value: `${serverCount.counts}`, inline: true },
			{
				name: "Highest Count:",
				value: `${serverCount.highestCount}`,
				inline: true,
			},
			{
				name: "Last Count By:",
				value: `<@${serverCount.lastCounterId}>`,
				inline: true,
			}
		);
		return embed;
	} else if (type === CountEmbedTypes.MemberCountEmbed) {
		const embed = new EmbedBuilder();
		const userCount = await MemberCounts.findOne({
			where: { userId: member.id, guildId: guild.id },
		});
		embed.setTitle(`Stats for ${member.displayName}`);
		embed.addFields(
			{
				name: "Times Counted:",
				value: `${
					userCount?.count
						? `Counted \`${userCount.count}\` time(s)`
						: `Not counted yet.`
				}`,
				inline: true,
			},
			{
				name: "Last Counted:",
				value: `${
					userCount?.count
						? `Last counted the number \`${
								userCount.lastCount
						  }\` at <t:${Math.floor(
								userCount.lastCountTime.getTime() / 1000
						  )}:f>`
						: `Not counted yet.`
				}`,
				inline: true,
			}
		);
		return embed;
	} else return new EmbedBuilder();
}
