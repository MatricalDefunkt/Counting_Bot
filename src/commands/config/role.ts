/** @format */

import { ComponentType, SlashCommandSubcommandBuilder } from "discord.js";
import { getKeyFromValue } from "../../utils/getKeyFromValue";
import {
  ActionTypes,
  CommandTypes,
  ConfigRoleTypes,
  SubCommand,
} from "../../types/interfaces";
import {
  createConfirmationButtons,
  disableButtons,
} from "../../utils/buttonCreators";

export default class ConfigRole
  extends SlashCommandSubcommandBuilder
  implements SubCommand<"cached">
{
  name = "role";
  description = "Modify the staff role used to configure the bot.";
  type: SubCommand<"cached">["type"] = CommandTypes.SUB_COMMAND;

  execute: SubCommand<"cached">["execute"] = async (interaction) => {
    const action = interaction.options.getNumber("action", true) as ActionTypes;
    const roleType = interaction.options.getString(
      "role-type",
      true
    ) as ConfigRoleTypes;
    const role = interaction.options.getRole("role");
    const serverConfig = await getServerConfig(interaction.guildId);

    if (action === ActionTypes.GET) {
      const role = serverConfig[roleType];
      return await interaction.editReply({
        content: `The ${getKeyFromValue(
          ConfigRoleTypes,
          roleType
        ).toLowerCase()} role is ${role ? `<@&${role}>` : "not set"}`,
      });
    } else if (action === ActionTypes.SET) {
      if (!role)
        return await interaction.editReply({
          content: `Please provide a new role using the "role" option.`,
        });
      serverConfig[roleType] = role.id;
      await serverConfig.save();
      return await interaction.editReply({
        content: `The ${getKeyFromValue(
          ConfigRoleTypes,
          roleType
        ).toLowerCase()} role has been set to <@&${role.id}>.`,
      });
    } else if (action === ActionTypes.DELETE) {
      const buttons = createConfirmationButtons("yes", "no");
      const reply = await interaction.editReply({
        content: `Are you sure you want to delete the \`${getKeyFromValue(
          ConfigRoleTypes,
          roleType
        ).toLowerCase()}\` option?`,
        components: buttons,
      });
      const response = await reply
        .awaitMessageComponent({
          componentType: ComponentType.Button,
          time: 10000,
        })
        .catch((error) => {
          if (error.code === 50001) {
            interaction.editReply({
              content: "You took too long to respond.",
              components: disableButtons(buttons),
            });
          }
        });
      if (response) {
        await response.deferUpdate();
        if (response.customId === "yes") {
          serverConfig[roleType] = undefined;
          await serverConfig.save();
          return await response.editReply({
            content: `The \`${getKeyFromValue(
              ConfigRoleTypes,
              roleType
            ).toLowerCase()}\` option has been deleted.`,
            components: disableButtons(buttons),
          });
        } else if (response.customId === "no") {
          return await response.editReply({
            content: "The action has been cancelled.",
            components: disableButtons(buttons),
          });
        }
      }
    }
  };

  isAutocompleteSubCommand = () => false;

  constructor() {
    super();
    this.setName(this.name);
    this.setDescription(this.description);
    this.addNumberOption((o) =>
      o
        .setName("action")
        .setDescription("The action to perform.")
        .addChoices(
          { name: "Get", value: ActionTypes.GET },
          { name: "Set", value: ActionTypes.SET },
          { name: "Delete", value: ActionTypes.DELETE }
        )
        .setRequired(true)
    );
    this.addStringOption((o) =>
      o
        .setName("role-type")
        .setDescription("The role to modify.")
        .addChoices({ name: "Staff", value: ConfigRoleTypes.STAFF })
        .setRequired(true)
    );
    this.addRoleOption((o) =>
      o.setName("role").setDescription("The role to set.")
    );
  }
}
