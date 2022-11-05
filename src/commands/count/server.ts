/** @format */

import { PermissionFlagsBits, SlashCommandSubcommandBuilder } from "discord.js";
import { CountEmbedTypes, createCountEmbed } from "../../utils/embedCreators";
import { Configs, Counts } from "../../database/database";
import { CommandTypes, SubCommand } from "../../types/interfaces";

export default class CountServer
  extends SlashCommandSubcommandBuilder
  implements SubCommand<"cached">
{
  name = "server";
  description = "Gets the server's current number count.";
  type: SubCommand<"cached">["type"] = CommandTypes.SUB_COMMAND;

  execute: SubCommand<"cached">["execute"] = async (interaction) => {
    let serverConfig = ServerConfigs.get(
      interaction.guildId
    ) as unknown as Configs | null;
    if (!serverConfig) {
      serverConfig = await Configs.findByPk(interaction.guildId);
      if (!serverConfig)
        return await interaction.editReply({
          content: `Server hasn't been configured yet! ${
            interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)
              ? `\nYou should use /config, and setup a counting channel.`
              : ``
          }`,
        });
    }
    let serverCount = ServerCounts.get(
      interaction.guildId
    ) as unknown as Counts | null;
    if (!serverCount) {
      serverCount = await Counts.findByPk(interaction.guildId);
      if (!serverCount)
        return await interaction.editReply({
          content: `Server hasn't begun counting yet!${
            interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)
              ? `\nYou should use /config, and setup a counting channel.`
              : ``
          }`,
        });
      ServerCounts.set(interaction.guildId, serverCount);
    }
    const embed = await createCountEmbed(
      interaction.member,
      interaction.guild,
      CountEmbedTypes.ServerCountEmbed
    );
    await interaction.editReply({ embeds: [embed] });
  };

  isAutocompleteSubCommand: SubCommand<"cached">["isAutocompleteSubCommand"] =
    () => {
      return false;
    };
  constructor() {
    super();
    this.setName(this.name);
    this.setDescription(this.description);
  }
}
