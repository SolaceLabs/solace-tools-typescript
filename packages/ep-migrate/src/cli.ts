#!/usr/bin/env node

import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import path from "path";
import dotenv from "dotenv";
import { Command, Option, OptionValues } from "commander";
import { OpenAPI as EpV2OpenApi} from "@solace-labs/ep-openapi-node";
import { OpenAPI as EpV2RtOpenApi} from "@solace-labs/ep-rt-openapi-node";
import { OpenAPI as EpV1OpenApi } from "@solace-labs/ep-v1-openapi-node";
import { packageJson } from "./constants";
import {
  CliError,
  CliErrorFactory,
  CliConfig,
  // TCliConfigEnvVarConfig,
  CliLogger,
  ECliStatusCodes,
  CliConfigError,
  CliRunSummary,
  ECliRunSummary_Type,
} from "./cli-components";
import { EpSdkClient } from "@solace-labs/ep-sdk";
import { CliEpV1Client } from "./cli-components/CliEpV1Client";
import { CliMigrateManager } from "./cli-components/CliMigrateManager";

const ComponentName: string = path.basename(__filename);
dotenv.config();

process.on("uncaughtException", (err: Error) => {
  const funcName = "process.on('uncaughtException')";
  const logName = `${ComponentName}.${funcName}()`;
  let cliError: CliError;
  if(err instanceof CliError) {
    cliError = err;
    if(err instanceof CliConfigError) {
      const cliLogEntry = CliLogger.createLogEntry(logName, {
        code: ECliStatusCodes.CONFIG_ERROR,
        details: err.toObject(),
      });
      CliLogger.error(cliLogEntry);
    } else {
      const cliLogEntry = CliLogger.createLogEntry(logName, {
        code: ECliStatusCodes.INTERNAL_ERROR,
        details: err.toObject(),
      });  
      CliLogger.error(cliLogEntry);
    }
} else {
    cliError = CliErrorFactory.createCliError({logName, error: err });
    const cliLogEntry = CliLogger.createLogEntry(logName, {
      code: ECliStatusCodes.INTERNAL_ERROR,
      details: cliError.toObject(),
    });
    CliLogger.fatal(cliLogEntry);
  }
  CliRunSummary.runError({ cliRunError: { type: ECliRunSummary_Type.RunError, cliError }});
  process.exit(1);
});

async function main() {
  const funcName = "main";
  const logName = `${ComponentName}.${funcName}()`;
  CliLogger.debug(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.INFO, message: "starting...",
    details: { cliConfig: CliConfig.getMaskedCliConfig()},
  }));
  const cliMigrateManager = new CliMigrateManager(CliConfig.getCliMigrateManagerOptions());
  await cliMigrateManager.run();
  CliLogger.debug(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.INFO, message: "finished.",
    details: { cliConfig: CliConfig.getMaskedCliConfig()},
  }));
}

function initialize(commandLineOptionValues: OptionValues) {
  // initialize with default values so we can log until initialized
  CliLogger.initialize({ cliLoggerOptions: CliConfig.getDefaultLoggerOptions() });
  const configFile = commandLineOptionValues.configFile;
  CliConfig.initialize({
    cliVersion: packageJson.version,
    commandLineOptionValues,
    configFile: configFile,
  });
  CliLogger.initialize({ cliLoggerOptions: CliConfig.getCliLoggerOptions() });
  CliConfig.logConfig();
  CliEpV1Client.initialize({
    token: CliConfig.getEpV1SolaceCloudToken(),
    globalEpOpenAPI: EpV1OpenApi,
    baseUrl: CliConfig.getEpV1ApiBaseUrl(),
  });
  EpSdkClient.initialize({
    globalEpOpenAPI: EpV2OpenApi,
    globalEpRtOpenAPI: EpV2RtOpenApi,
    token: CliConfig.getEpV2SolaceCloudToken(),
    baseUrl: CliConfig.getEpV2ApiBaseUrl(),
  });
}

// function getCliConfigEnvVarHelp(): string {
//   const cliConfigEnvVarConfigList: Array<TCliConfigEnvVarConfig> = CliConfig.get_CliConfigEnvVarConfigList4HelpDisplay();
//   return `
// Environment Variables:
//   Set env vars, use .env file, or a combination of both.
// ${JSON.stringify(cliConfigEnvVarConfigList, null, 2)}    
// `;
// }

function getCommandLineOptionValues(): OptionValues {
  const Program = new Command();

  const configFileOption: Option = Program.createOption(
    "-cf, --configFile <value>",
    "Configuration File."
  );

  Program.name(`npx ${packageJson.name}`)
    // .description(`${packageJson.description}`)
    .version(`${packageJson.version}`, "-v, --version")
    .usage("[Options]...")
    .addOption(configFileOption)
    // .addHelpText("after", getCliConfigEnvVarHelp())
    .parse(process.argv);

  const ovs = Program.opts();

  return ovs;
}

// CliConfig.validate_CliConfigEnvVarConfigList();
clear();
console.log(
  chalk.red(
    figlet.textSync(packageJson.description, { horizontalLayout: "full" })
  )
);
initialize(getCommandLineOptionValues());
main();
