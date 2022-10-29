/** @format */

import {
  ActionRowBuilder,
  ButtonStyle,
  ButtonBuilder,
  Message,
  ComponentType,
  ButtonComponent,
} from "discord.js";

/**
 * Create an action row with two buttons for confirmation and cancellation of an action.
 * @param {string} confirmCustomId Custom ID for confirmation button
 * @param {string} cancelCustomId Custom ID for cancellation button
 * @returns {ActionRowBuilder<ButtonBuilder>[]}Action row with the buttons
 */
export const createConfirmationButtons = (
  confirmCustomId: string = "yes",
  cancelCustomId: string = "no"
) => {
  const row = [
    new ActionRowBuilder<ButtonBuilder>().addComponents([
      new ButtonBuilder()
        .setCustomId(confirmCustomId)
        .setEmoji("✅")
        .setLabel("Confirm")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(cancelCustomId)
        .setEmoji("❎")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Secondary),
    ]),
  ];
  return row;
};

/**
 * Use an action row to disable its buttons.
 * @param {ActionRowBuilder<ButtonBuilder>} actionRow The action row whose buttons you want to disable.
 * @returns {ActionRowBuilder<ButtonBuilder>}
 */
export function disableButtons(
  actionRow: ActionRowBuilder<ButtonBuilder>
): ActionRowBuilder<ButtonBuilder>;
/**
 * Use an action row array to disable its buttons.
 * @param {ActionRowBuilder<ButtonBuilder>[]} actionRows The action row array whose buttons you want to disable.
 * @returns {ActionRowBuilder<ButtonBuilder>[]}
 */
export function disableButtons(
  actionRows: ActionRowBuilder<ButtonBuilder>[]
): ActionRowBuilder<ButtonBuilder>[];
/**
 * Use a message to disable its buttons.
 * @param {Message} message The message whose buttons you want to disable.
 * @returns {Message}
 */
export function disableButtons(
  message: Message
): ActionRowBuilder<ButtonBuilder>[];
/**
 * Use a message or an action row to disable its buttons.
 * @param {Message | ActionRowBuilder<ButtonBuilder> | ActionRowBuilder<ButtonBuilder>[]} messageOrActionRow The message or action row whose buttons you want to disable.
 * @returns {ActionRowBuilder<ButtonBuilder>[]}
 */
export function disableButtons(
  messageOrActionRow:
    | Message
    | ActionRowBuilder<ButtonBuilder>
    | ActionRowBuilder<ButtonBuilder>[]
) {
  if (messageOrActionRow instanceof Message) {
    const actionRows = messageOrActionRow.components;
    const finalActionRows: ActionRowBuilder<ButtonBuilder>[] = [];
    actionRows.forEach((actionRow) => {
      const newButtonArray: ButtonBuilder[] = [];

      const messageButtons = actionRow.components.filter(
        (component) => component.type === ComponentType.Button
      ) as ButtonComponent[];
      messageButtons.forEach((button) => {
        const newButton = ButtonBuilder.from(button);
        newButton.setDisabled(true);
        newButtonArray.push(newButton);
      });
      const newActionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        newButtonArray
      );
      finalActionRows.push(newActionRow);
    });
    return finalActionRows;
  } else if (messageOrActionRow instanceof ActionRowBuilder<ButtonBuilder>) {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      messageOrActionRow.components.map((button) => button.setDisabled(true))
    );
  } else if (
    messageOrActionRow instanceof Array<ActionRowBuilder<ButtonBuilder>>
  ) {
    const returnArray: ActionRowBuilder<ButtonBuilder>[] = [];
    messageOrActionRow.forEach((actionRow) => {
      actionRow.components.forEach((button) => button.setDisabled(true));
      returnArray.push(actionRow);
    });
    return returnArray;
  }
}

/**
 * Use an action row to enable its buttons.
 * @param {ActionRowBuilder<ButtonBuilder>} actionRow The action row whose buttons you want to enable.
 * @returns {ActionRowBuilder<ButtonBuilder>}
 */
export function enableButtons(
  actionRow: ActionRowBuilder<ButtonBuilder>
): ActionRowBuilder<ButtonBuilder>;
/**
 * Use an action row array to enable its buttons.
 * @param {ActionRowBuilder<ButtonBuilder>[]} actionRows The action row array whose buttons you want to enable.
 * @returns {ActionRowBuilder<ButtonBuilder>[]}
 */
export function enableButtons(
  actionRows: ActionRowBuilder<ButtonBuilder>[]
): ActionRowBuilder<ButtonBuilder>[];
/**
 * Use a message to enable its buttons.
 * @param {Message} message The message whose buttons you want to enable.
 * @returns {Message}
 */
export function enableButtons(
  message: Message
): ActionRowBuilder<ButtonBuilder>[];
/**
 * Use a message or an action row to enable its buttons.
 * @param {Message | ActionRowBuilder<ButtonBuilder> | ActionRowBuilder<ButtonBuilder>[]} messageOrActionRow The message or action row whose buttons you want to enable.
 * @returns {ActionRowBuilder<ButtonBuilder>[]}
 */
export function enableButtons(
  messageOrActionRow:
    | Message
    | ActionRowBuilder<ButtonBuilder>
    | ActionRowBuilder<ButtonBuilder>[]
) {
  if (messageOrActionRow instanceof Message) {
    const actionRows = messageOrActionRow.components;
    const finalActionRows: ActionRowBuilder<ButtonBuilder>[] = [];
    actionRows.forEach((actionRow) => {
      const newButtonArray: ButtonBuilder[] = [];

      const messageButtons = actionRow.components.filter(
        (component) => component.type === ComponentType.Button
      ) as ButtonComponent[];
      messageButtons.forEach((button) => {
        const newButton = ButtonBuilder.from(button);
        newButton.setDisabled(false);
        newButtonArray.push(newButton);
      });
      const newActionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        newButtonArray
      );
      finalActionRows.push(newActionRow);
    });
    return finalActionRows;
  } else if (messageOrActionRow instanceof ActionRowBuilder<ButtonBuilder>) {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      messageOrActionRow.components.map((button) => button.setDisabled(false))
    );
  } else if (
    messageOrActionRow instanceof Array<ActionRowBuilder<ButtonBuilder>>
  ) {
    const returnArray: ActionRowBuilder<ButtonBuilder>[] = [];
    messageOrActionRow.forEach((actionRow) => {
      actionRow.components.forEach((button) => button.setDisabled(false));
      returnArray.push(actionRow);
    });
    return returnArray;
  }
}

/**
 * Build an action row with pagination buttons.
 * @param customIdNext The custom id of the "next" button.
 * @param customIdPrevious The custom id of the "previous" button.
 * @param customIdFirst The custom id of the "first" button.
 * @param customIdLast The custom id of the "last" button.
 * @param customIdGoTo The custom id of the "go to" button.
 * @returns {ActionRowBuilder<ButtonBuilder>[]} The action row array.
 */
export const createPaginationButtons = (
  customIdNext: string = "next",
  customIdPrevious: string = "previous",
  customIdFirst: string = "first",
  customIdLast: string = "last",
  customIdGoTo: string = "goTo"
) => {
  const row = [
    new ActionRowBuilder<ButtonBuilder>().addComponents([
      new ButtonBuilder()
        .setCustomId(customIdFirst)
        .setEmoji("⏮")
        .setLabel("First")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(customIdPrevious)
        .setEmoji("◀")
        .setLabel("Previous")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(customIdNext)
        .setEmoji("▶")
        .setLabel("Next")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(customIdLast)
        .setEmoji("⏭")
        .setLabel("Last")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(customIdGoTo)
        .setEmoji("🔍")
        .setLabel("Go to")
        .setStyle(ButtonStyle.Primary),
    ]),
  ];
  return row;
};
