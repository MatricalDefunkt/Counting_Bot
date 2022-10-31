/** @format */

import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { SubCommand } from "../../types/interfaces";

export default class ConfigGet
  extends SlashCommandSubcommandBuilder
  implements SubCommand<"cached">
{
  name = "get";
  description = "Gets the server's combined configurations.";

  execute: SubCommand<"cached">["execute"] = async (interaction) => {
    const embed = new EmbedBuilder();
    const serverConfig = await getServerConfig(interaction.guildId);
    const { countingChannelId, deleteIfWrong, resetIfWrong, staffRoleId } =
      serverConfig;
    embed.setTitle("Server Configurations");
    embed.addFields({
      name: "Counting Channel",
      value: countingChannelId
        ? (
            await interaction.guild.channels.fetch(countingChannelId)
          )?.toString() ?? "Not set"
        : "Not set",
    });
    embed.addFields({
      name: "Staff Role",
      value: staffRoleId
        ? (await interaction.guild.roles.fetch(staffRoleId))?.toString() ??
          "Not set"
        : "Not set",
    });
    embed.addFields({
      name: "Delete If Wrong",
      value: deleteIfWrong ? "Yes" : "No",
      inline: true,
    });
    embed.addFields({
      name: "Reset If Wrong",
      value: resetIfWrong ? "Yes" : "No",
      inline: true,
    });
    await interaction.editReply({
      embeds: [embed],
    });
  };

  isAutocompleteSubCommand: SubCommand<"cached">["isAutocompleteSubCommand"] =
    () => false;

  constructor() {
    super();
    this.setName(this.name);
    this.setDescription(this.description);
  }
}
