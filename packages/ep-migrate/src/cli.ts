#!/usr/bin/env node

/* istanbul ignore file */

import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import path from "path";
import dotenv from "dotenv";
import { Command, Option, OptionValues } from "commander";
import { OpenAPI as EpV2OpenApi} from "@solace-labs/ep-openapi-node";
import { OpenAPI as EpV2RtOpenApi} from "@solace-labs/ep-rt-openapi-node";
import { OpenAPI as EpV1OpenApi } from "@solace-labs/ep-v1-openapi-node";
import { EpSdkClient } from "@solace-labs/ep-sdk";
import { packageJson } from "./constants";
import {
  CliError,
  CliErrorFactory,
  CliConfig,
  CliLogger,
  ECliStatusCodes,
  CliConfigError,
  CliRunSummary,
  ECliRunSummary_Type,
  CliMigrateManager,
  CliEpV1Client,
  ECliMigrateManagerRunState,
  CliUtils,
  ICliConfigFile,
  CliConfigInvalidConfigFileError
} from "./cli-components";


const ComponentName: string = path.basename(__filename);
const ComponentDir: string = path.dirname(__filename);
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
  const runState = commandLineOptionValues.runState;
  CliConfig.initialize({
    cliVersion: packageJson.version,
    commandLineOptionValues,
    configFile: configFile,
    runState: runState
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

const validateRunState = (value: string, _previous: ECliMigrateManagerRunState): ECliMigrateManagerRunState => {
  if(!Object.values(ECliMigrateManagerRunState).includes(value as ECliMigrateManagerRunState)) {
    console.log(`\nError: Invalid command line option: runState='${value}'. Valid options: ${JSON.stringify(Object.values(ECliMigrateManagerRunState))}.\n`);
    process.exit(1);
  }
  return value as ECliMigrateManagerRunState;
}

function helpSampleConfigFile(): string {
  const funcName = "helpSampleConfigFile";
  const logName = `${ComponentName}.${funcName}()`;

  const sampleConfigFilePath = `${ComponentDir}/files/ep-migrate-sample-config.yaml`;
  const vaidatedSampleConfigFilePath = CliUtils.validateFilePathWithReadPermission(sampleConfigFilePath);
  if(vaidatedSampleConfigFilePath === undefined) {
    const err = new CliConfigInvalidConfigFileError(logName, sampleConfigFilePath, 'cannot read sample config file');
    console.log(err);
    process.exit(1);
  }
  const sampleConfigFileContents = CliUtils.getFileContent(vaidatedSampleConfigFilePath);
  return `

Sample Configuration File:
    
${sampleConfigFileContents}
  `;
}

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
    .option<ECliMigrateManagerRunState>(
      "-rs, --runState <value>",
      `Run state. 
                            Options: ${JSON.stringify(Object.values(ECliMigrateManagerRunState))}. 
                            ${JSON.stringify(ECliMigrateManagerRunState.PRESENT)}: migrates V1 to V2. 
                            ${JSON.stringify(ECliMigrateManagerRunState.ABSENT)}: removes previously added V2 objects. 
                              Note: Feature requires ${CliUtils.nameOf<ICliConfigFile>("migrate.epV2.applicationDomainPrefix")} to be defined. 
                                    It removes all Application Domains starting with the prefix. 
                                    Use with care!
                            `,
      validateRunState,
      ECliMigrateManagerRunState.PRESENT
    )
    .addHelpText("after", helpSampleConfigFile())
    .parse(process.argv);

  const ovs = Program.opts();

  return ovs;
}

clear();
console.log(
  chalk.red(
    figlet.textSync(packageJson.description, { horizontalLayout: "full" })
  )
);
initialize(getCommandLineOptionValues());
main();
