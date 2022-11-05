/** @format */

import { REST } from "@discordjs/rest";
import { ApplicationCommandType, Routes } from "discord-api-types/v10";
import { Collection } from "discord.js";
import { BaseCommand, ContextMenu } from "../types/interfaces";
import * as dotenv from "dotenv";
import { BotCommands } from "../database/database";
dotenv.config();

if (!process.env.TOKEN)
  throw new Error("Token was not provided to register commands.");
const token = process.env.TOKEN;
if (!process.env.APPLICATIONID)
  throw new Error("Application ID was not provided to register commands.");
const applicationId = process.env.APPLICATIONID;

/**
 *
 * @param {string} applicationId The application ID to register the commands against.
 * @param {Collection<string, BaseCommand>} commands The slash commands to register.
 * @param {Collection<string, ContextMenu>} contextMenus The context menus to register.
 * @returns {boolean} Whether or not the commands were registered.
 */
export const registerCommands = async (
  applicationId: string,
  commands: Collection<string, BaseCommand>,
  contextMenus: Collection<string, ContextMenu>
): Promise<boolean> => {
  const rest = new REST();
  console.log("Registering commands...");
  const jsonData = [];
  if (token === process.env.BETATOKEN)
    commands = commands.filter((command) => !command.betaOnly);
  for (const command of commands) {
    jsonData.push(command[1].toJSON());
  }
  for (const contextMenu of contextMenus) {
    jsonData.push(contextMenu[1].toJSON());
  }
  return rest
    .setToken(token)
    .put(Routes.applicationCommands(applicationId), { body: jsonData })
    .then(async (commands) => {
      console.log("Registered commands successfully!");
      const commandArray = commands as {
        id: string;
        name: string;
        type: ApplicationCommandType;
      }[];
      for (const command of commandArray) {
        if (
          await BotCommands.findOne({
            where: { commandId: command.id },
          })
        )
          continue;
        else if (
          await BotCommands.findOne({ where: { commandName: command.name } })
        ) {
          const existingCommand = (await BotCommands.findOne({
            where: { commandName: command.name },
          })) as BotCommands;
          existingCommand.commandId = command.id;
          await existingCommand.save();
        } else {
          const newCommand = new BotCommands();
          newCommand.commandId = command.id;
          newCommand.commandName = command.name;
          newCommand.type = command.type;
          newCommand.save();
        }
      }
      return true;
    })
    .catch(async (reason) => {
      console.log(reason);
      return false;
    });
};

// This code-block will not run if you start the bot directly using [yarn start] or [npm run start]
// Only to be used for testing commands.
if (process.argv[1] === process.cwd() + "\\src\\utils\\registerCommands") {
  import("../commands/exports").then((commands) => {
    import("../contextmenus/exports").then((contextMenus) => {
      const commandCollection = new Collection<string, BaseCommand<any>>();
      for (const command of commands.default) {
        commandCollection.set(command.name, command);
      }
      const contextMenuCollection = new Collection<string, ContextMenu>();
      for (const contextMenu of contextMenus.default) {
        contextMenuCollection.set(contextMenu.name, contextMenu);
      }
      registerCommands(applicationId, commandCollection, contextMenuCollection);
    });
  });
}
