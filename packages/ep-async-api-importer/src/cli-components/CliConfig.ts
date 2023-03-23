import { OptionValues } from 'commander';
import { 
  EBrokerTypes, 
  EChannelDelimiters, 
  E_EpAsyncApiExtensions 
} from '@solace-labs/ep-asyncapi';
import { EpSdkClient } from "@solace-labs/ep-sdk";
import { DefaultAppName } from "../constants";
import {
  ECliAssetImport_TargetLifecycleState,
} from "../services";
import { 
  ECliAssetImport_TargetVersionStrategy 
} from "../importers";
import {
  CliConfigInvalidEnvVarValueOptionError,
  CliConfigInvalidUrlEnvVarError,
  CliConfigMissingEnvVarError,
  CliConfigNotInitializedError,
  CliInternalCodeInconsistencyError,
} from "./CliError";
import {
  CliLogger,
  ECliLogger_LogLevel,
  ECliLogger_EpSdkLogLevel,
  ECliStatusCodes,
  ICliLoggerOptions,
  ObjectValues_TCliLogger_EpSdkLogLevel,
  TCliLogger_EpSdkLogLevel,
} from "./CliLogger";
import { 
  CliUtils 
} from "./CliUtils";
import {
  ECliImporterManagerMode,
  getCliImporterManagerModeObjectValues4Config,
  ICliImporterManagerOptions,
} from "./CliImporterManager";


enum ECliConfigBooleanOptions {
  TRUE = "true",
  FALSE = "false",
}
export enum ECliConfigRunIdGeneration {
  AUTO = "auto",
  CUSTOM = "custom-run-id",
}
export enum ECliAssetsApplicationDomainEnforcementPolicies {
  STRICT = "strict",
  LAX = "lax",
  OFF = "off"
}

export type TCliConfigEnvVarConfig = {
  envVarName: ECliConfigEnvVarNames;
  description: string;
  format?: string;
  default?: string;
  required: boolean;
  options?: Array<string>;
  hidden?: boolean; // placeholder, to hide a config option
  secret?: boolean; 
};

enum ECliConfigEnvVarNames {
  CLI_SOLACE_CLOUD_TOKEN = "CLI_SOLACE_CLOUD_TOKEN",

  CLI_APP_NAME = "CLI_APP_NAME",
  CLI_MODE = "CLI_MODE",
  CLI_RUN_ID = "CLI_RUN_ID",
  CLI_EP_API_BASE_URL = "CLI_EP_API_BASE_URL",

  CLI_LOGGER_LOG_LEVEL = "CLI_LOGGER_LOG_LEVEL",
  CLI_LOGGER_LOG_FILE = "CLI_LOGGER_LOG_FILE",
  // CLI_LOGGER_LOG_DIR = "CLI_LOGGER_LOG_DIR",
  CLI_LOGGER_LOG_TO_STDOUT = "CLI_LOGGER_LOG_TO_STDOUT",
  CLI_LOGGER_EP_SDK_LOG_LEVEL = "CLI_LOGGER_EP_SDK_LOG_LEVEL",
  CLI_LOGGER_PRETTY_PRINT = "CLI_LOGGER_PRETTY_PRINT",
  CLI_LOGGER_LOG_SUMMARY_TO_CONSOLE = "CLI_LOGGER_LOG_SUMMARY_TO_CONSOLE",

  CLI_IMPORT_ASSETS_TARGET_LIFECYLE_STATE = "CLI_IMPORT_ASSETS_TARGET_LIFECYLE_STATE",
  CLI_IMPORT_ASSETS_TARGET_VERSION_STRATEGY = "CLI_IMPORT_ASSETS_TARGET_VERSION_STRATEGY",
  CLI_IMPORT_ASSETS_OUTPUT_DIR = "CLI_IMPORT_ASSETS_OUTPUT_DIR",
  CLI_IMPORT_CREATE_API_APPLICATION = "CLI_IMPORT_CREATE_API_APPLICATION",
  CLI_IMPORT_CREATE_API_EVENT_API = "CLI_IMPORT_CREATE_API_EVENT_API",
  CLI_IMPORT_BROKER_TYPE = "CLI_IMPORT_BROKER_TYPE",
  CLI_IMPORT_CHANNEL_DELIMITER = "CLI_IMPORT_CHANNEL_DELIMITER",
  CLI_TEST_SETUP_DOMAINS_FOR_APIS = "CLI_TEST_SETUP_DOMAINS_FOR_APIS",
  CLI_VALIDATE_API_BEST_PRACTICES = "CLI_VALIDATE_API_BEST_PRACTICES",
  CLI_ASSETS_APPLICATION_DOMAIN_ENFORCEMENT_POLICY = "CLI_ASSETS_APPLICATION_DOMAIN_ENFORCEMENT_POLICY"
}

const DEFAULT_CLI_MODE = ECliImporterManagerMode.RELEASE_MODE;
const DEFAULT_CLI_RUN_ID = ECliConfigRunIdGeneration.AUTO;
const DEFAULT_CLI_EP_API_BASE_URL = EpSdkClient.DEFAULT_EP_API_BASE_URL;

const DEFAULT_CLI_LOGGER_LOG_LEVEL = ECliLogger_LogLevel.INFO;
const DEFAULT_CLI_LOGGER_LOG_FILE = `./tmp/logs/${DefaultAppName}.log`;
const create_DEFAULT_CLI_LOGGER_LOG_FILE = (appName: string) => { return `./tmp/logs/${appName}.log`; };
// const DEFAULT_CLI_LOGGER_LOG_DIR = `./tmp/logs`;
const DEFAULT_CLI_LOGGER_LOG_TO_STDOUT = false;
const DEFAULT_CLI_LOGGER_EP_SDK_LOG_LEVEL = ECliLogger_EpSdkLogLevel.SILENT;
const DEFAULT_CLI_LOGGER_PRETTY_PRINT = false;
const DEFAULT_CLI_LOGGER_LOG_SUMMARY_TO_CONSOLE = true;

const DEFAULT_CLI_IMPORT_ASSETS_TARGET_LIFECYLE_STATE = ECliAssetImport_TargetLifecycleState.RELEASED;
const DEFAULT_CLI_IMPORT_ASSETS_TARGET_VERSION_STRATEGY = ECliAssetImport_TargetVersionStrategy.BUMP_PATCH;
const DEFAULT_CLI_IMPORT_ASSET_OUTPUT_DIR = "./tmp/output";
const DEFAULT_CLI_IMPORT_CREATE_API_APPLICATION = false;
const DEFAULT_CLI_IMPORT_CREATE_API_EVENT_API = true;
const DEFAULT_CLI_TEST_SETUP_DOMAINS_FOR_APIS = true;
const DEFAULT_CLI_VALIDATE_API_BEST_PRACTICES = true;
const DEFAULT_CLI_ASSET_APPLICATION_DOMAIN_ENFORCEMENT_POLICY = ECliAssetsApplicationDomainEnforcementPolicies.STRICT;

const CliConfigEnvVarConfigList: Array<TCliConfigEnvVarConfig> = [
  {
    envVarName: ECliConfigEnvVarNames.CLI_SOLACE_CLOUD_TOKEN,
    description: "Solace Cloud API Token.",
    required: true,
    secret: true,
  },
  {
    envVarName: ECliConfigEnvVarNames.CLI_APP_NAME,
    description:
      "The application name of the importer. Used for logging and testing.",
    required: false,
    default: DefaultAppName,
  },
  {
    envVarName: ECliConfigEnvVarNames.CLI_MODE,
    description: "The operations mode for the app.",
    required: false,
    default: DEFAULT_CLI_MODE,
    options: getCliImporterManagerModeObjectValues4Config(),
  },
  {
    envVarName: ECliConfigEnvVarNames.CLI_RUN_ID,
    description:
      'Specify the run id. "auto": importer generates a run id, "{string}": importer uses the custom run id.',
    required: false,
    default: DEFAULT_CLI_RUN_ID,
    options: Object.values(ECliConfigRunIdGeneration),
    hidden: true,
  },
  {
    envVarName: ECliConfigEnvVarNames.CLI_EP_API_BASE_URL,
    description: "The base url for the Event Portal Api.",
    required: false,
    default: DEFAULT_CLI_EP_API_BASE_URL,
    format: "Url format.",
  },
  {
    envVarName: ECliConfigEnvVarNames.CLI_LOGGER_LOG_LEVEL,
    description: "The log level.",
    required: false,
    default: DEFAULT_CLI_LOGGER_LOG_LEVEL,
    options: Object.values(ECliLogger_LogLevel),
  },
  {
    envVarName: ECliConfigEnvVarNames.CLI_LOGGER_LOG_FILE,
    description: `The log file including absolute or relative path. Example: ./tmp/logs/ep-importer.log`,
    required: false,
    default: DEFAULT_CLI_LOGGER_LOG_FILE,
  },
  // {
  //   envVarName: ECliConfigEnvVarNames.CLI_LOGGER_LOG_DIR,
  //   description: `The logs directory. Log files: '{application name}.log' & '{application name}.summary.log'. Examples: './tmp/logs/${DefaultAppName}.log' and './tmp/logs/${DefaultAppName}.summary.log'.`,
  //   required: false,
  //   default: DEFAULT_CLI_LOGGER_LOG_DIR,
  // },
  {
    envVarName: ECliConfigEnvVarNames.CLI_LOGGER_LOG_TO_STDOUT,
    description: "Flag to log to stdout as well as to the log file.",
    required: false,
    default: String(DEFAULT_CLI_LOGGER_LOG_TO_STDOUT),
    options: Object.values(ECliConfigBooleanOptions),
    hidden: true,
  },
  {
    envVarName: ECliConfigEnvVarNames.CLI_LOGGER_LOG_SUMMARY_TO_CONSOLE,
    description: "Flag to log importer summary to console.",
    required: false,
    default: String(DEFAULT_CLI_LOGGER_LOG_SUMMARY_TO_CONSOLE),
    options: Object.values(ECliConfigBooleanOptions),
    hidden: false,
  },
  {
    envVarName: ECliConfigEnvVarNames.CLI_LOGGER_EP_SDK_LOG_LEVEL,
    description: "Log level for the Event Portal SDK.",
    required: false,
    default: String(DEFAULT_CLI_LOGGER_EP_SDK_LOG_LEVEL),
    options: ObjectValues_TCliLogger_EpSdkLogLevel,
  },
  {
    envVarName: ECliConfigEnvVarNames.CLI_LOGGER_PRETTY_PRINT,
    description:
      "Pretty print the log output. Convenience for visual debugging.",
    required: false,
    default: String(DEFAULT_CLI_LOGGER_PRETTY_PRINT),
    options: Object.values(ECliConfigBooleanOptions),
  },
  {
    envVarName: ECliConfigEnvVarNames.CLI_IMPORT_ASSETS_TARGET_LIFECYLE_STATE,
    description: "The target lifecycle state of the imported assets.",
    required: false,
    default: DEFAULT_CLI_IMPORT_ASSETS_TARGET_LIFECYLE_STATE,
    options: Object.values(ECliAssetImport_TargetLifecycleState),
  },
  {
    envVarName: ECliConfigEnvVarNames.CLI_IMPORT_ASSETS_TARGET_VERSION_STRATEGY,
    description: "The versioning strategy for imported assets.",
    required: false,
    default:
      DEFAULT_CLI_IMPORT_ASSETS_TARGET_VERSION_STRATEGY as unknown as string,
    options: Object.values(
      ECliAssetImport_TargetVersionStrategy
    ) as Array<string>,
  },
  {
    envVarName: ECliConfigEnvVarNames.CLI_IMPORT_ASSETS_OUTPUT_DIR,
    description:
      "The output directory for assets generated after import. Example: ./tmp/output/{output files}",
    required: false,
    default: DEFAULT_CLI_IMPORT_ASSET_OUTPUT_DIR,
  },
  {
    envVarName: ECliConfigEnvVarNames.CLI_IMPORT_CREATE_API_APPLICATION,
    description: "Flag to create an Event Portal Application representing the API Spec.",
    required: false,
    default: String(DEFAULT_CLI_IMPORT_CREATE_API_APPLICATION),
    options: Object.values(ECliConfigBooleanOptions),
  },
  {
    envVarName: ECliConfigEnvVarNames.CLI_IMPORT_CREATE_API_EVENT_API,
    description: "Flag to create an Event Portal Event API representing the API Spec.",
    required: false,
    default: String(DEFAULT_CLI_IMPORT_CREATE_API_EVENT_API),
    options: Object.values(ECliConfigBooleanOptions),
  },
  {
    envVarName: ECliConfigEnvVarNames.CLI_IMPORT_BROKER_TYPE,
    description: `The broker type setting for all imported objects. Overrides broker type specified in the spec, extension: ${E_EpAsyncApiExtensions.X_EP_BROKER_TYPE}`,
    required: false,
    default: 'none',
    options: Object.values(EBrokerTypes) as Array<string>,
  },
  {
    envVarName: ECliConfigEnvVarNames.CLI_IMPORT_CHANNEL_DELIMITER,
    description: `The channel delimiter used in the spec. Global setting for all imported objects. Overrides channel delimiter specified in the spec, extension: ${E_EpAsyncApiExtensions.X_EP_CHANNEL_DELIMITER}`,
    required: false,
    default: 'none',
    options: Object.values(EChannelDelimiters) as Array<string>,
  },
  {
    envVarName: ECliConfigEnvVarNames.CLI_TEST_SETUP_DOMAINS_FOR_APIS,
    description: "Flag to deep copy latest version of existing Event API(s) into test domain(s).",
    required: false,
    default: String(DEFAULT_CLI_TEST_SETUP_DOMAINS_FOR_APIS),
    options: Object.values(ECliConfigBooleanOptions),
  },
  {
    envVarName: ECliConfigEnvVarNames.CLI_VALIDATE_API_BEST_PRACTICES,
    description: "Flag to run 'best practices' validation on API(s).",
    required: false,
    default: String(DEFAULT_CLI_VALIDATE_API_BEST_PRACTICES),
    options: Object.values(ECliConfigBooleanOptions),
  },
  {
    envVarName: ECliConfigEnvVarNames.CLI_ASSETS_APPLICATION_DOMAIN_ENFORCEMENT_POLICY,
    description: "Assets application domain objects create/update policy. [strict]: neither create nor update allowed outside of assets application domain. [lax]: creating first versions allowed, updating versions disallowed.",
    required: false,
    default: String(DEFAULT_CLI_ASSET_APPLICATION_DOMAIN_ENFORCEMENT_POLICY),
    options: Object.values(ECliAssetsApplicationDomainEnforcementPolicies),
    hidden: true
  },
];

export type TCliLoggerConfig = ICliLoggerOptions;
export type TCliImporterConfig = ICliImporterManagerOptions;

export type TCliConfig = {
  appName: string;
  runId: string;
  epApiBaseUrl: string;
  cliLoggerConfig: TCliLoggerConfig;
  cliImporterConfig: TCliImporterConfig;
};

type TCliConfigRegisteredEnvVar = {
  envVarName: string;
  value: any;
}

class CliConfig {
  private cliVersion: string;
  private commandLineOptionValues: OptionValues;
  private envVarValues: Array<TCliConfigRegisteredEnvVar> = [];
  private config: TCliConfig;
  private solaceCloudToken: string;

  private getEnvVarConfig = (envVarName: string): TCliConfigEnvVarConfig => {
    const funcName = "getEnvVarConfig";
    const logName = `${CliConfig.name}.${funcName}()`;
    const found: TCliConfigEnvVarConfig | undefined = CliConfigEnvVarConfigList.find((cliConfigEnvVarConfig: TCliConfigEnvVarConfig) => {
      return cliConfigEnvVarConfig.envVarName === envVarName;
    });
    if (found === undefined) throw new CliInternalCodeInconsistencyError(logName, {
      error: "cannot find env var details in list",
      envVarName: envVarName,
      CliConfigEnvVarConfigList: JSON.stringify(CliConfigEnvVarConfigList, null, 2),
    });
    return found;
  }

  public validate_CliConfigEnvVarConfigList = () => {
    for (const envVarName of Object.values(ECliConfigEnvVarNames)) this.getEnvVarConfig(envVarName);
  };

  private registerEnvVarAndValue = ({ envVarName, value, defaultValue }:{
    envVarName: string;
    value: any;
    defaultValue: any;
  }): any => {
    const envVarConfig = this.getEnvVarConfig(envVarName);
    const isSecret: boolean = envVarConfig.secret !== undefined ? (envVarConfig.secret === true ? true : false) : false;
    const registerValue = value !== undefined ? (isSecret ? '***' : value) : 'undefined';
    this.envVarValues.push({
      envVarName: envVarName,
      value: registerValue,
    });
    return value !== undefined ? value : defaultValue;
  }

  private assertIsInitialized = () => {
    if (!this.config || !this.solaceCloudToken)
      throw new CliConfigNotInitializedError(CliConfig.name);
  };

  private generatedRunId = () => {
    const pad = (n: number, pad?: number): string => {
      return String(n).padStart(pad ? pad : 2, "0");
    };
    const d = new Date();
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(
      d.getUTCDate()
    )}-${pad(d.getUTCHours())}-${pad(d.getUTCMinutes())}-${pad(
      d.getUTCSeconds()
    )}-${pad(d.getUTCMilliseconds(), 3)}`;
  };

  public get_CliConfigEnvVarConfigList4HelpDisplay = (): Array<TCliConfigEnvVarConfig> => {
    this.validate_CliConfigEnvVarConfigList();
    return CliConfigEnvVarConfigList.filter((cliConfigEnvVarConfig: TCliConfigEnvVarConfig) => {
      return !cliConfigEnvVarConfig.hidden;
    });
  };

  private getOptionalEnvVarValueAsUrlWithDefault = (
    envVarName: string,
    defaultValue: string
  ): string => {
    const funcName = "getOptionalEnvVarValueAsUrlWithDefault";
    const logName = `${CliConfig.name}.${funcName}()`;
    const value: string | undefined = process.env[envVarName];
    if (!value) return this.registerEnvVarAndValue({ envVarName: envVarName, value: value, defaultValue: defaultValue });
    // check if value is a valid Url
    try {
      const valueUrl: URL = new URL(value);
      /* istanbul ignore next */
      valueUrl;
      return this.registerEnvVarAndValue({ envVarName: envVarName, value: value, defaultValue: defaultValue });
    } catch (e: any) {
      throw new CliConfigInvalidUrlEnvVarError(logName, envVarName, value, e);
    }
  };

  private getMandatoryEnvVarValueAsString = (envVarName: string): string => {
    const funcName = "getMandatoryEnvVarValueAsString";
    const logName = `${CliConfig.name}.${funcName}()`;
    const value: string | undefined = process.env[envVarName];
    if (!value) throw new CliConfigMissingEnvVarError(logName, envVarName);
    return this.registerEnvVarAndValue({ envVarName: envVarName, value: value, defaultValue: undefined });
  };

  private getOptionalEnvVarValueAsStringWithDefault = (
    envVarName: string,
    defaultValue: string
  ): string => {
    const value: string | undefined = process.env[envVarName];
    return this.registerEnvVarAndValue({ envVarName: envVarName, value: value, defaultValue: defaultValue });
  };

  private getOptionalEnvVarValueAsString_From_Options_WithDefault = (
    envVarName: string,
    options: Array<string>,
    defaultValue: string
  ): string => {
    const funcName = "getOptionalEnvVarValueAsString_From_Options_WithDefault";
    const logName = `${CliConfig.name}.${funcName}()`;
    const value: string | undefined = process.env[envVarName];
    if (value === undefined) return this.registerEnvVarAndValue({ envVarName: envVarName, value: value, defaultValue: defaultValue });
    if (!options.includes(value.toLowerCase())) throw new CliConfigInvalidEnvVarValueOptionError( logName, envVarName, value, options );
    return this.registerEnvVarAndValue({ envVarName: envVarName, value: value.toLowerCase(), defaultValue: defaultValue });
  };

  private getOptionalEnvVarValueAsString_From_Options = ( 
    envVarName: string, 
    options: Array<string>
  ): string | undefined => {
    const funcName = "getOptionalEnvVarValueAsString_From_Options";
    const logName = `${CliConfig.name}.${funcName}()`;
    const value: string | undefined = process.env[envVarName];
    if (value === undefined) return this.registerEnvVarAndValue({ envVarName: envVarName, value: value, defaultValue: undefined });
    if (!options.includes(value.toLowerCase())) throw new CliConfigInvalidEnvVarValueOptionError(logName, envVarName, value, options );
    return this.registerEnvVarAndValue({ envVarName: envVarName, value: value.toLowerCase(), defaultValue: undefined });
  };

  private getOptionalEnvVarValueAsBoolean_WithDefault = (
    envVarName: string,
    defaultValue: boolean
  ): boolean => {
    const funcName = "getOptionalEnvVarValueAsBoolean_WithDefault";
    const logName = `${CliConfig.name}.${funcName}()`;
    const value: string | undefined = process.env[envVarName];
    if (value === undefined) return this.registerEnvVarAndValue({ envVarName: envVarName, value: value, defaultValue: defaultValue });
    const options: Array<string> = Object.values(ECliConfigBooleanOptions);
    if(!options.includes(value.toLowerCase())) throw new CliConfigInvalidEnvVarValueOptionError(logName, envVarName, value, options);
    return this.registerEnvVarAndValue({ envVarName: envVarName, value: value.toLowerCase() === ECliConfigBooleanOptions.TRUE, defaultValue: defaultValue });
  };

  public initialize = ({
    cliVersion,
    defaultAppName,
    fileList,
    applicationDomainName,
    assetApplicationDomainName,
    commandLineOptionValues,
  }: {
    cliVersion: string;
    commandLineOptionValues: OptionValues;
    defaultAppName: string;
    fileList: Array<string>;
    applicationDomainName?: string;
    assetApplicationDomainName?: string;
  }): void => {
    this.cliVersion = cliVersion;
    this.commandLineOptionValues = commandLineOptionValues;
    this.solaceCloudToken = this.getMandatoryEnvVarValueAsString(ECliConfigEnvVarNames.CLI_SOLACE_CLOUD_TOKEN);
    const appName: string = this.getOptionalEnvVarValueAsStringWithDefault(
      ECliConfigEnvVarNames.CLI_APP_NAME,
      defaultAppName
    );
    const runIdGeneration: ECliConfigRunIdGeneration | string =
      this.getOptionalEnvVarValueAsStringWithDefault(
        ECliConfigEnvVarNames.CLI_RUN_ID,
        DEFAULT_CLI_RUN_ID
      );
    let runId: string;
    if (runIdGeneration === ECliConfigRunIdGeneration.AUTO)
      runId = this.generatedRunId();
    else runId = runIdGeneration;
    // const logDirEnvVarValue = this.getOptionalEnvVarValueAsStringWithDefault(ECliConfigEnvVarNames.CLI_LOGGER_LOG_DIR, DEFAULT_CLI_LOGGER_LOG_DIR);
    // const logDir = CliUtils.ensureDirExists(logDirEnvVarValue);
    // const logFile = `${logDir}/${appName}.log`;
    // const summaryLogFile = `${logDir}/${appName}.summary.log`;

    const logFileEnvVarValue = this.getOptionalEnvVarValueAsStringWithDefault(
      ECliConfigEnvVarNames.CLI_LOGGER_LOG_FILE,
      create_DEFAULT_CLI_LOGGER_LOG_FILE(appName)
    );
    const logFile = CliUtils.ensureDirOfFilePathExists(logFileEnvVarValue);

    const importAssetOutputDirEnvVarValue =
      this.getOptionalEnvVarValueAsStringWithDefault(
        ECliConfigEnvVarNames.CLI_IMPORT_ASSETS_OUTPUT_DIR,
        DEFAULT_CLI_IMPORT_ASSET_OUTPUT_DIR
      );
    // const importAssetOutputDir = this.initializeDir(importAssetOutputDirEnvVarValue, runId);
    const importAssetOutputDir = CliUtils.ensureDirExists(
      importAssetOutputDirEnvVarValue
    );

    this.config = {
      appName: appName,
      runId: runId,
      epApiBaseUrl: this.getOptionalEnvVarValueAsUrlWithDefault(
        ECliConfigEnvVarNames.CLI_EP_API_BASE_URL,
        DEFAULT_CLI_EP_API_BASE_URL
      ),
      cliLoggerConfig: {
        appName: appName,
        level: this.getOptionalEnvVarValueAsString_From_Options_WithDefault(
          ECliConfigEnvVarNames.CLI_LOGGER_LOG_LEVEL,
          Object.values(ECliLogger_LogLevel),
          DEFAULT_CLI_LOGGER_LOG_LEVEL
        ) as ECliLogger_LogLevel,
        logFile: logFile,
        log2Stdout: this.getOptionalEnvVarValueAsBoolean_WithDefault(
          ECliConfigEnvVarNames.CLI_LOGGER_LOG_TO_STDOUT,
          DEFAULT_CLI_LOGGER_LOG_TO_STDOUT
        ),
        cliLogger_EpSdkLogLevel:
          this.getOptionalEnvVarValueAsString_From_Options_WithDefault(
            ECliConfigEnvVarNames.CLI_LOGGER_EP_SDK_LOG_LEVEL,
            ObjectValues_TCliLogger_EpSdkLogLevel,
            DEFAULT_CLI_LOGGER_EP_SDK_LOG_LEVEL
          ) as TCliLogger_EpSdkLogLevel,
        prettyPrint: this.getOptionalEnvVarValueAsBoolean_WithDefault(
          ECliConfigEnvVarNames.CLI_LOGGER_PRETTY_PRINT,
          DEFAULT_CLI_LOGGER_PRETTY_PRINT
        ),
        logSummary2Console: this.getOptionalEnvVarValueAsBoolean_WithDefault(
          ECliConfigEnvVarNames.CLI_LOGGER_LOG_SUMMARY_TO_CONSOLE,
          DEFAULT_CLI_LOGGER_LOG_SUMMARY_TO_CONSOLE
        ),
      },
      cliImporterConfig: {
        appName: appName,
        runId: runId,
        asyncApiFileList: fileList,
        cliImporterManagerMode: this.getOptionalEnvVarValueAsString_From_Options_WithDefault(ECliConfigEnvVarNames.CLI_MODE, Object.values(ECliImporterManagerMode), DEFAULT_CLI_MODE) as ECliImporterManagerMode,
        applicationDomainName: applicationDomainName,
        assetApplicationDomainName: assetApplicationDomainName,
        createApiApplication: this.getOptionalEnvVarValueAsBoolean_WithDefault(ECliConfigEnvVarNames.CLI_IMPORT_CREATE_API_APPLICATION, DEFAULT_CLI_IMPORT_CREATE_API_APPLICATION),
        createApiEventApi: this.getOptionalEnvVarValueAsBoolean_WithDefault(ECliConfigEnvVarNames.CLI_IMPORT_CREATE_API_EVENT_API, DEFAULT_CLI_IMPORT_CREATE_API_EVENT_API),
        cliTestSetupDomainsForApis: this.getOptionalEnvVarValueAsBoolean_WithDefault(ECliConfigEnvVarNames.CLI_TEST_SETUP_DOMAINS_FOR_APIS, DEFAULT_CLI_TEST_SETUP_DOMAINS_FOR_APIS),
        cliImporterOptions: {
          runId: runId,
          cliAssetImport_TargetLifecycleState: this.getOptionalEnvVarValueAsString_From_Options_WithDefault(
              ECliConfigEnvVarNames.CLI_IMPORT_ASSETS_TARGET_LIFECYLE_STATE,
              Object.values(ECliAssetImport_TargetLifecycleState),
              DEFAULT_CLI_IMPORT_ASSETS_TARGET_LIFECYLE_STATE
            ) as ECliAssetImport_TargetLifecycleState,
          cliAssetImport_TargetVersionStrategy: this.getOptionalEnvVarValueAsString_From_Options_WithDefault(
            ECliConfigEnvVarNames.CLI_IMPORT_ASSETS_TARGET_VERSION_STRATEGY,
            Object.values(ECliAssetImport_TargetVersionStrategy) as Array<string>,
            DEFAULT_CLI_IMPORT_ASSETS_TARGET_VERSION_STRATEGY as unknown as string
          ) as unknown as ECliAssetImport_TargetVersionStrategy,
          cliAssetImport_BrokerType: this.getOptionalEnvVarValueAsString_From_Options(ECliConfigEnvVarNames.CLI_IMPORT_BROKER_TYPE, Object.values(EBrokerTypes) as Array<string>) as EBrokerTypes,
          cliAssetImport_ChannelDelimiter: this.getOptionalEnvVarValueAsString_From_Options(ECliConfigEnvVarNames.CLI_IMPORT_CHANNEL_DELIMITER, Object.values(EChannelDelimiters) as Array<string>) as EChannelDelimiters,
          assetOutputDir: importAssetOutputDir,
          cliValidateApiSpecBestPractices: this.getOptionalEnvVarValueAsBoolean_WithDefault(ECliConfigEnvVarNames.CLI_VALIDATE_API_BEST_PRACTICES, DEFAULT_CLI_VALIDATE_API_BEST_PRACTICES),
          cliAssetsApplicationDomainEnforcementPolicy: this.getOptionalEnvVarValueAsString_From_Options_WithDefault(ECliConfigEnvVarNames.CLI_ASSETS_APPLICATION_DOMAIN_ENFORCEMENT_POLICY, Object.values(ECliAssetsApplicationDomainEnforcementPolicies) as Array<string>, ECliAssetsApplicationDomainEnforcementPolicies.STRICT) as ECliAssetsApplicationDomainEnforcementPolicies,
        },
      },
    };
  };

  public logConfig = (): void => {
    const funcName = "logConfig";
    const logName = `${CliConfig.name}.${funcName}()`;
    this.assertIsInitialized();
    console.log(`\nLog file: ${this.config.cliLoggerConfig.logFile}\n`);
    CliLogger.info(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.INITIALIZED, message: "config", details: {
      cliVerion: this.cliVersion,
      commandLineOptionValues: this.commandLineOptionValues ? this.commandLineOptionValues : 'undefined',
      environment: this.envVarValues,
      config: this.config 
    }}));
  };

  public getAppName = (): string => {
    if (this.config) return this.config.appName;
    return DefaultAppName;
  };
  public getCliConfig = (): TCliConfig => {
    this.assertIsInitialized();
    return this.config;
  };
  public getDefaultLoggerOptions = (): ICliLoggerOptions => {
    // don't use a log file at startup - could be empty if different logfile provided in config which leads to confusion.
    // const logFile = this.initializeDirOfFilePath(DEFAULT_CLI_LOGGER_LOG_FILE);
    return {
      appName: DefaultAppName,
      level: DEFAULT_CLI_LOGGER_LOG_LEVEL,
      // logFile: logFile,
      log2Stdout: true,
      cliLogger_EpSdkLogLevel: DEFAULT_CLI_LOGGER_EP_SDK_LOG_LEVEL,
      prettyPrint: true,
      logSummary2Console: DEFAULT_CLI_LOGGER_LOG_SUMMARY_TO_CONSOLE,
    };
  };
  public getCliLoggerOptions = (): ICliLoggerOptions => {
    this.assertIsInitialized();
    return this.config.cliLoggerConfig;
  };
  public getCliImporterManagerOptions = (): ICliImporterManagerOptions => {
    this.assertIsInitialized();
    return this.config.cliImporterConfig;
  };
  public getSolaceCloudToken = (): string => {
    this.assertIsInitialized();
    return this.solaceCloudToken;
  };
  public getEpApiBaseUrl = (): string => {
    this.assertIsInitialized();
    return this.config.epApiBaseUrl;
  };
}

export default new CliConfig();
