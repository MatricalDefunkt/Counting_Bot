/** @format */

import {
  ComponentType,
  PermissionFlagsBits,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { Configs, Counts } from "../../database/database";
import { SubCommand } from "../../types/interfaces";
import {
  createConfirmationButtons,
  disableButtons,
} from "../../utils/buttonCreators";

export default class CountSet
  extends SlashCommandSubcommandBuilder
  implements SubCommand<"cached">
{
  name = "set";
  description = "Set the server's current count.";

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

    const newCount = interaction.options.getInteger("new-count", true);

    if (newCount === serverCount.count) {
      return await interaction.editReply({
        content: `The current count of the server already is ${newCount}.`,
      });
    }

    const buttons = createConfirmationButtons("yeschange", "nocancel");
    const reply = await interaction.editReply({
      content: `You are about to change the server's count from \`${serverCount.count}\` to \`${newCount}\`. Do you want to continue?`,
      components: buttons,
    });
    const button = await reply
      .awaitMessageComponent({
        componentType: ComponentType.Button,
        time: 600_000,
      })
      .catch(async (e) => {
        if (e.code === "INTERACTION_COLLECTOR_ERROR") {
          await interaction.editReply({
            content: `Did not click buttons in time.`,
            components: disableButtons(buttons),
          });
          return;
        } else console.error(e);
        await interaction.editReply({
          content: `Something went terribly wrong. The bot creator has been notified. Please try again.`,
          components: disableButtons(buttons),
        });
        return;
      });
    if (button) {
      await button.deferUpdate();
      if (button.customId === "yeschange") {
        serverCount.count = newCount;
        if (serverCount.highestCount < serverCount.count)
          serverCount.highestCount = newCount;
        await serverCount.save();
        await button.editReply({
          content: `Done! New count has been set to \`${serverCount.count}\``,
          components: disableButtons(buttons),
        });
      } else {
        await button.editReply({
          content: `Cancelled!`,
          components: disableButtons(buttons),
        });
      }
    }
  };

  isAutocompleteSubCommand: SubCommand<"cached">["isAutocompleteSubCommand"] =
    () => {
      return false;
    };
  constructor() {
    super();
    this.setName(this.name);
    this.setDescription(this.description);
    this.addIntegerOption((o) =>
      o
        .setName("new-count")
        .setDescription("The new count you want to set for this server.")
        .setMinValue(0)
        .setRequired(true)
    );
  }
}
