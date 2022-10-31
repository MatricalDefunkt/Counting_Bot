/** @format */

import { SubCommand } from "../../types/interfaces";
import ConfigBoolean from "./boolean";
import ConfigChannel from "./channel";
import ConfigGet from "./get";
import ConfigRole from "./role";

const subCommands: SubCommand<"cached">[] = [
  new ConfigChannel(),
  new ConfigRole(),
  new ConfigBoolean(),
  new ConfigGet(),
];
export default subCommands;
