/** @format */
import { ChatInputCommand } from "../types/interfaces";
import Config from "./config";
import Count from "./count";
import Eval from "./eval";
import Leaderboard from "./leaderboard";
import Ping from "./ping";
import Help from "./help";

const commands: ChatInputCommand<any>[] = [
  new Ping(),
  new Config(),
  new Eval(),
  new Count(),
  new Leaderboard(),
  new Help(),
];
export default commands;
