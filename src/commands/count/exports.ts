/** @format */

import { SubCommandParent } from "../../types/interfaces";
import CountMember from "./member";
import CountServer from "./server";
import CountSet from "./set";

const subCommands: SubCommandParent<"cached">["children"] = [
  new CountServer(),
  new CountMember(),
  new CountSet(),
];
export default subCommands;
