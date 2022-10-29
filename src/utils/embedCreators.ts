/** @format */

import { EmbedBuilder, Guild, GuildMember } from "discord.js";
import { MemberCounts } from "../database/database";
import { CommandInteraction } from "discord.js";

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
      { name: "Current Count:", value: `${serverCount.count}`, inline: true },
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

export async function createLeaderboardEmbed({
  pageNumber,
  interaction,
  memberCounts,
}: {
  pageNumber: number;
  interaction: CommandInteraction<"cached">;
  memberCounts: MemberCounts[];
}): Promise<EmbedBuilder> {
  const embed = new EmbedBuilder();
  embed.setTitle(`Counting Leaderboard`);
  embed.setDescription(
    `Leaderboard for ${interaction.guild.name}!\nLeaderboard is calculated by the number of times members of the server have counted.`
  );
  const leaderboard = memberCounts.map(
    (memberCount) =>
      `Last number counted: ${memberCount.lastCount}
			Total numbers counted: ${memberCount.count}
			Began counting on: <t:${Math.trunc(memberCount.createdAt.getTime() / 1000)}>
			Last counted on: <t:${Math.trunc(memberCount.lastCountTime.getTime() / 1000)}>`
  );
  for (const [index, value] of leaderboard.entries()) {
    const user = await interaction.client.users.fetch(
      memberCounts[index].userId
    );
    embed.addFields({
      name: `${pageNumber * 10 + index + 1}. ${user.username}#${
        user.discriminator
      }`,
      value: `${value}\nUser: ${user}`,
    });
  }
  return embed;
}
