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
import { Model, ModelStatic } from "sequelize";
import { CommandClient } from "../clientstart";

export interface BaseCommand<Cached extends CacheType = CacheType>
  extends SlashCommandBuilder {
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
   * Whether this command is supposed to be deferred or not.
   * @default true
   */
  readonly canBeDeferred?: boolean;
  /**
   * Whether the command is reserverd for the beta bot only.
   * @default false
   */
  readonly betaOnly?: boolean;
  /**
   * Discrimates the command type
   * @readonly
   */
  readonly type: CommandTypes;
}

export interface ChatInputCommand<Cached extends CacheType = CacheType>
  extends SlashCommandBuilder,
    BaseCommand<Cached> {
  readonly type: CommandTypes.CHAT_INPUT;
}

export interface AutocompleteCommand<Cached extends CacheType = CacheType> {
  /**
   * Respond to autocomplete interactions.
   * @param interaction The autocomplete interaction which was recieved.
   */
  respond: (interaction: AutocompleteInteraction<Cached>) => Promise<any>;

  readonly type: CommandTypes.AUTOCOMPLETE;
}

export interface SubCommandParent<Cached extends CacheType = CacheType>
  extends BaseCommand<Cached> {
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
  readonly type: CommandTypes.SUB_COMMAND_PARENT;
}

export interface AutocompleteParent<Cached extends CacheType = CacheType>
  extends BaseCommand<Cached> {
  /**
   * The subcommands of this subcommand parent.
   */
  readonly children: (
    | SubCommand<"cached">
    | SubCommand
    | AutocompleteSubCommand
    | AutocompleteSubCommand<"cached">
  )[];
  /**
   * Checks if this SubCommandParent has an AutoCompleteSubCommand as one of its `children`
   */
  isAutocompleteParent: () => this is AutocompleteParent;
  /**
   * Respond to autocomplete interactions.
   * @param interaction The autocomplete interaction which was recieved.
   */
  respond: (interaction: AutocompleteInteraction<Cached>) => Promise<any>;
  readonly type: CommandTypes.AUTOCOMPLETE_PARENT;
}

export interface SubCommand<Cached extends CacheType = CacheType>
  extends SlashCommandSubcommandBuilder {
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
   * Checks if the subcommand is an AutocompleteSubCommand and must respond to autocomplete interactions.
   */
  isAutocompleteSubCommand: () => this is AutocompleteSubCommand<Cached>;
  /**
   * Whether this command is supposed to be deferred or not.
   * @default true
   */
  readonly canBeDeferred?: boolean;
  /**
   * Whether the command is reserverd for the beta bot only.
   * @default false
   */
  readonly betaOnly?: boolean;

  readonly type: CommandTypes.SUB_COMMAND;
}

export interface AutocompleteSubCommand<Cached extends CacheType = CacheType>
  extends SlashCommandSubcommandBuilder,
    SubCommand<Cached> {
  /**
   * Checks if the subcommand is an AutocompleteSubCommand and must respond to autocomplete interactions.
   */
  isAutocompleteSubCommand: () => this is AutocompleteSubCommand<Cached>;
  /**
   * Respond to autocomplete interactions.
   * @param interaction The autocomplete interaction which was recieved.
   */
  respond: (interaction: AutocompleteInteraction<Cached>) => Promise<any>;
  readonly type: CommandTypes.SUB_COMMAND;
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
   * Whether this command is supposed to be deferred or not.
   * @default true
   */
  readonly canBeDeferred?: boolean;
  /**
   * Whether the command is reserverd for the beta bot only.
   * @default false
   */
  readonly betaOnly?: boolean;
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

export interface IPaginatorOptions<ModelType extends Model> {
  /**
   * Number of results per page
   */
  pageSize: number;
  /**
   * The model to paginate
   */
  model: ModelStatic<ModelType>;
  /**
   * The starting page number
   */
  pageIndex?: number;
  /**
   * The "where" query to use for getting rows
   */
  whereQuery?: {};
  /**
   * The "order" query to use for getting rows
   */
  orderQuery?: [string, "ASC" | "DESC"][];
}

export class PaginatorError extends Error {
  public code: PaginatorErrorCodes;
  constructor(message: string, code: PaginatorErrorCodes) {
    super(message);
    this.code = code;
  }
}

export enum CommandCancelCodes {
  MISSING_PERMISSIONS = 403,
  IMPROPER_CONFIG = 412,
  SUCCESS = 200,
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

export enum CommandTypes {
  BASE = "BASE",
  CHAT_INPUT = "CHAT_INPUT",
  AUTOCOMPLETE = "AUTOCOMPLETE",
  SUB_COMMAND = "SUB_COMMAND",
  AUTOCOMPLETE_SUB_COMMAND = "AUTOCOMPLETE_SUB_COMMAND",
  SUB_COMMAND_PARENT = "SUB_COMMAND_PARENT",
  AUTOCOMPLETE_PARENT = "AUTOCOMPLETE_PARENT",
  CONTEXT_MENU = "CONTEXT_MENU",
}
