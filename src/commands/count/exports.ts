/** @format */

import { CacheType } from "discord.js";
import { SubCommandParent } from "../../types/interfaces";
import CountMember from "./member";
import CountServer from "./server";
import CountSet from "./set";

const subCommands: SubCommandParent<any>["children"] = [
  new CountServer(),
  new CountMember(),
  new CountSet(),
];
export default subCommands;
