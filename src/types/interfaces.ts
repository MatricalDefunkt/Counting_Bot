/** @format */

import {
  ContextMenuCommandBuilder,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from "@discordjs/builders";
import {
  AutocompleteInteraction,
  CacheType,
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
} from "discord.js";
import { CommandClient } from "../clientstart";

export enum CommandCancelCodes {
  MissingPermissions = 403,
  ImproperConfiguration = 412,
  Success = 200,
}

export interface BaseCommand<Cached extends CacheType = CacheType> {
  /**
   * The function to run if no condition is provided or the given condition is met.
   * @param interaction The application command which was recieved.
   */
  execute: (interaction: ChatInputCommandInteraction<Cached>) => Promise<any>;
  /**
   * Condition to check for before running command.
   * @param interaction The application command which was recieved.
   * @returns Whether the condition was fulfilled, and the processed interaction.
   */
  onBefore?: (interaction: ChatInputCommandInteraction<Cached>) => Promise<{
    processedInteraction: ChatInputCommandInteraction<Cached>;
    code: CommandCancelCodes;
  }>;
  /**
   * Function to run if condition fails.
   * @param interaction The application command which was recieved.
   */
  onCancel?: (
    interaction: ChatInputCommandInteraction<Cached>,
    code: CommandCancelCodes
  ) => Promise<any> | void;
  /**
   * Whether the command is reserverd for the beta bot only.
   * @default false
   */
  betaOnly?: boolean;
}

export interface ChatInputCommand<Cached extends CacheType = CacheType>
  extends SlashCommandBuilder,
    BaseCommand<Cached> {
  /**
   * Checks if the command is a guild command and can make use of cached values.
   */
  isGuildCommand: () => this is ChatInputCommand<"cached">;
  /**
   * Checks if the command is a guild/DM command and can be used without having cache values.
   */
  isDMCommand: () => this is ChatInputCommand;
  /**
   * Checks if the command is an AutocompleteCommand and must respond to autocomplete interactions.
   */
  isAutocompleteCommand: () => this is AutocompleteCommand<Cached>;
  /**
   * Checks if the command is an SubCommandParent and contains sub-commands to autocomplete interactions.
   */
  isSubCommandParent: () => this is SubCommandParent<Cached>;
  /**
   * Whether this context menu is to be registered globally, or just with the test guild.
   * @default true
   */
  global?: boolean;
  /**
   * Whether this command is supposed to be deferred or not.
   * @default true
   */
  canBeDeferred?: boolean;
}

export interface AutocompleteCommand<Cached extends CacheType = CacheType>
  extends ChatInputCommand<Cached> {
  /**
   * Respond to autocomplete interactions.
   * @param interaction The autocomplete interaction which was recieved.
   */
  respond: (interaction: AutocompleteInteraction<Cached>) => Promise<any>;
}

export interface SubCommandParent<Cached extends CacheType = CacheType>
  extends ChatInputCommand<Cached> {
  /**
   * The subcommands of this subcommand parent.
   */
  children: (
    | SubCommand<"cached">
    | SubCommand
    | AutocompleteSubCommand
    | AutocompleteSubCommand<"cached">
  )[];
  /**
   * Checks if this SubCommandParent has an AutoCompleteSubCommand as one of its `children`
   */
  isAutocompleteParent: () => this is AutocompleteParent;
}

export interface AutocompleteParent<Cached extends CacheType = CacheType>
  extends SubCommandParent<Cached> {
  respond: (interaction: AutocompleteInteraction<Cached>) => Promise<any>;
}

export interface SubCommand<Cached extends CacheType = CacheType>
  extends SlashCommandSubcommandBuilder,
    Omit<
      BaseCommand<Cached>,
      | "isGuildCommand"
      | "isDMCommand"
      | "isSubCommandParent"
      | "isAutocompleteCommand"
    > {
  /**
   * Whether this command is supposed to be deferred or not.
   * @default true
   */
  canBeDeferred?: boolean;
  /**
   * Checks if the subcommand is an AutocompleteSubCommand and must respond to autocomplete interactions.
   */
  isAutocompleteSubCommand: () => this is AutocompleteSubCommand<Cached>;
}

export interface AutocompleteSubCommand<Cached extends CacheType = CacheType>
  extends SubCommand<Cached> {
  /**
   * Respond to autocomplete interactions.
   * @param interaction The autocomplete interaction which was recieved.
   */
  respond: (interaction: AutocompleteInteraction<Cached>) => Promise<any>;
}

export interface ContextMenu extends ContextMenuCommandBuilder {
  /**
   * The function to run if no condition is provided or the given condition is met.
   * @param interaction The message context menu which was recieved.
   */
  execute: (interaction: ContextMenuCommandInteraction<"cached">) => any;
  /**
   * Condition to check for before running command.
   * @param interaction The message context menu which was recieved.
   * @returns Whether the condition was fulfilled, and the processed interaction.
   */
  onBefore?: (interaction: ContextMenuCommandInteraction<"cached">) => Promise<{
    processedInteraction: ContextMenuCommandInteraction<"cached">;
    code: CommandCancelCodes;
  }>;
  /**
   * Function to run if condition fails.
   * @param interaction The message context menu which was recieved.
   */
  onCancel?: (
    interaction: ContextMenuCommandInteraction<"cached">,
    code: CommandCancelCodes
  ) => Promise<any> | void;
  /**
   * Whether this context menu is to be registered globally, or just with the test guild.
   */
  global?: boolean;
  /**
   * Whether this command is supposed to be deferred or not.
   * @default true
   */
  canBeDeferred?: boolean;
  /**
   * Whether the command is reserverd for the beta bot only.
   * @default false
   */
  betaOnly?: boolean;
}

export interface Event {
  /**
   * Name of the event.
   */
  name: string;
  /**
   * Handler of the event.
   * @param client The client to add listeners for.
   */
  handler: (client: CommandClient<true>) => any;
}

export class PaginatorError extends Error {
  public code: PaginatorErrorCodes;
  constructor(message: string, code: PaginatorErrorCodes) {
    super(message);
    this.code = code;
  }
}

export enum ActionTypes {
  GET,
  SET,
  DELETE,
}

export enum ConfigRoleTypes {
  STAFF = "staffRoleId",
}

export enum ConfigChannelTypes {
  COUNTING = "countingChannelId",
}

export enum ConfigBoolTypes {
  ["RESET IF WRONG"] = "resetIfWrong",
  ["DELETE IF WRONG"] = "deleteIfWrong",
}

export enum PaginatorErrorCodes {
  MAX_PAGE,
  MIN_PAGE,
  INVALID_PAGE,
  NOT_INITIALIZED,
}
