/** @format */

import childProcesses from "node:child_process";
import { Logger } from "./utils/botlog";
import fs from "fs";
import path from "path";

childProcesses.fork("src/database/database");

const spawnBot = ({
  code,
  startup,
}: {
  code?: number | null;
  startup?: boolean;
}) => {
  if (!startup) {
    if (code)
      Logger.error(`Process had closed with code: ${code}. Restarting now.`);
    else Logger.error(`Process had closed. Restarting now.`);
  }
  return childProcesses.fork(
    "src/clientstart",
    [startup ? process.argv.slice(2).join(" ") : ``],
    {
      stdio: "inherit",
    }
  );
};

console.log("Tester started.");

const allFiles = fs.readdirSync(path.join(process.cwd(), "/src"));
const directories = allFiles.filter((file) => !file.includes("."));
for (const directory of directories) {
  const directoryContents = fs.readdirSync(
    path.join(process.cwd(), `/src/${directory}`)
  );

  if (directoryContents.includes("exports.ts")) {
    console.log(
      `Checking ${directory}: ${path.join(
        __dirname,
        `/${directory}/exports.ts`
      )}`
    );
    const exportedArray = require(path.join(
      __dirname,
      `/${directory}/exports.ts`
    ));
    const tsFiles = directoryContents.filter(
      (file) => file.endsWith(".ts") && file !== "exports.ts"
    );
    if (tsFiles.length !== exportedArray.default.length)
      throw new Error(
        `All files are not exported in exports.ts of [${directory}]\nExpected: ${tsFiles.length}\nActual: ${exportedArray.default.length}`
      );
  }
}

console.log("Passed all checks. Starting bot...");
const mainBotProcess = spawnBot({ startup: true });
mainBotProcess.stdout?.on("data", Logger.log);
mainBotProcess.stdout?.on("error", Logger.debug);
mainBotProcess.stderr?.on("data", Logger.error);
mainBotProcess.stderr?.on("error", Logger.error);
mainBotProcess.on("close", (code) => spawnBot({ code }));
