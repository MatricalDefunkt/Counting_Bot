/** @format */

import { ChatInputCommand, CommandTypes } from "../types/interfaces";
import {
  SlashCommandBuilder,
  InteractionCollector,
  SelectMenuInteraction,
  InteractionType,
  ComponentType,
} from "discord.js";
import { ActionRowBuilder, SelectMenuBuilder } from "@discordjs/builders";

export default class Help
  extends SlashCommandBuilder
  implements ChatInputCommand
{
  name = "help";
  description = "Get help with the bot!";
  type: ChatInputCommand["type"] = CommandTypes.CHAT_INPUT;

  execute: ChatInputCommand["execute"] = async (interaction) => {
    const row = new ActionRowBuilder<SelectMenuBuilder>();
    const selectMenu = new SelectMenuBuilder();
    selectMenu.setCustomId("helpMenu");
    selectMenu.setPlaceholder("Select a category to get help with!");
    selectMenu.addOptions([
      {
        label: "Commands",
        description: "Get help with commands!",
        value: "commands",
      },
      {
        label: "Privacy",
        description:
          "Undersand what this bot does with your data, and how it stores it.",
        value: "privacy",
      },
      {
        label: "Features",
        description: "Get help with (or find out about) features!",
        value: "features",
      },
      {
        label: "Support",
        description: "Find out about how to reach the bot support team!",
        value: "support",
      },
      {
        label: "About",
        description: "Learn a little meta about the bot!",
        value: "about",
      },
    ]);

    row.addComponents(selectMenu);

    const reply = await interaction.editReply({
      content: "Select a category to get help with!",
      components: [row],
    });

    const collector = new InteractionCollector<SelectMenuInteraction>(
      interaction.client,
      {
        interactionType: InteractionType.MessageComponent,
        time: 120000,
        idle: 30000,
        message: reply,
        componentType: ComponentType.SelectMenu,
      }
    );
    collector.on("collect", async (choice) => {
      if (choice) {
        await choice.deferUpdate();
        switch (choice.values[0]) {
          case "commands": {
            await choice.editReply({
              content: "Commands help coming soon!",
            });
            break;
          }
          case "privacy": {
            await choice.editReply({
              content: "Privacy help coming soon!",
            });
            break;
          }
          case "features": {
            await choice.editReply({
              content: "Features help coming soon!",
            });
            break;
          }
          case "support": {
            await choice.editReply({
              content: "Support help coming soon!",
            });
            break;
          }
          case "about": {
            await choice.editReply({
              content: "About help coming soon!",
            });
            break;
          }
        }
      }
    });
  };

  isGuildCommand: ChatInputCommand["isGuildCommand"] = () => false;
  isDMCommand: ChatInputCommand["isDMCommand"] = () => true;
  isAutocompleteCommand: ChatInputCommand["isAutocompleteCommand"] = () =>
    false;
  isSubCommandParent: ChatInputCommand["isSubCommandParent"] = () => false;

  constructor() {
    super();
    this.setName(this.name).setDescription(this.description);
  }
}
