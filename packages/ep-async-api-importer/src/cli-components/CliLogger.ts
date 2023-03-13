/* istanbul ignore file */

import pino from "pino";
import PinoPretty from "pino-pretty";
import {
  EEpSdkLogLevel,
  EpSdkLogger,
  IEpSdkLogEntry,
  IEpSdkLoggerInstance,
} from "@solace-labs/ep-sdk";
import CliRunContext, { ICliRunContext } from "./CliRunContext";
import { CliInternalCodeInconsistencyError } from "./CliError";
import { ICliRunSummary_LogBase } from "./CliRunSummary";
import CliConfig from "./CliConfig";

export enum ECliStatusCodes {
  INFO = "INFO",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  INITIALIZING = "INITIALIZING",
  INITIALIZE_ERROR = "INITIALIZE_ERROR",
  INITIALIZED = "INITIALIZED",

  IMPORTING_START_TEST_MODE = "IMPORTING_START_TEST_MODE",

  IMPORTING_START_API = "IMPORTING_START_API",
  IMPORTING_DONE_API = "IMPORTING_DONE_API",
  IMPORTING_ERROR_API = "IMPORTING_ERROR_API",

  IMPORTING_START_API_ASSETS = "IMPORTING_START_API_ASSETS",
  IMPORTING_DONE_API_ASSEETS = "IMPORTING_DONE_API_ASSEETS",
  IMPORTING_ERROR_API_ASSETS = "IMPORTING_ERROR_API_ASSETS",

  IMPORTING_START_APPLICATION = "IMPORTING_START_APPLICATION",
  IMPORTING_DONE_APPLICATION = "IMPORTING_DONE_APPLICATION",
  IMPORTING_ERROR_APPLICATION = "IMPORTING_ERROR_APPLICATION",

  IMPORTING_START_VALIDATING_API = "IMPORTING_START_VALIDATING_API",
  IMPORTING_DONE_VALIDATING_API = "IMPORTING_DONE_VALIDATING_API",
  IMPORTING_ERROR_VALIDATING_API = "IMPORTING_ERROR_VALIDATING_API",

  IMPORTING_API_CHANNEL = "IMPORTING_API_CHANNEL",
  IMPORTING_API_CHANNEL_PARAMETERS = "IMPORTING_API_CHANNEL_PARAMETERS",
  IMPORTING_API_CHANNEL_PARAMETER = "IMPORTING_API_CHANNEL_PARAMETER",
  IMPORTING_API_CHANNEL_PUBLISH_OPERATION = "IMPORTING_API_CHANNEL_PUBLISH_OPERATION",
  IMPORTING_API_CHANNEL_SUBSCRIBE_OPERATION = "IMPORTING_API_CHANNEL_SUBSCRIBE_OPERATION",
  IMPORTING_API_CHANNEL_MESSAGE = "IMPORTING_CHANNEL_MESSAGE",
  IMPORTING_EP_APPLICATION_DOMAIN = "IMPORTING_EP_APPLICATION_DOMAIN",
  IMPORTING_EP_ASSET_APPLICATION_DOMAIN = "IMPORTING_EP_ASSET_APPLICATION_DOMAIN",
  IMPORTING_EP_EVENT = "IMPORTING_EP_EVENT",
  IMPORTING_EP_EVENT_VERSION = "IMPORTING_EP_EVENT_VERSION",
  IMPORTING_EP_SCHEMA = "IMPORTING_EP_SCHEMA",
  IMPORTING_EP_SCHEMA_VERSION = "IMPORTING_EP_SCHEMA_VERSION",
  IMPORTING_EP_ENUM = "IMPORTING_EP_ENUM",
  IMPORTING_EP_ENUM_VERSION = "IMPORTING_ENUM_VERSION",
  IMPORTING_EP_EVENT_API = "IMPORTING_EP_EVENT_API",
  IMPORTING_EP_EVENT_API_DELETED = "IMPORTING_EP_EVENT_API_DELETED",
  IMPORTING_EP_EVENT_API_VERSION_CHECK = "IMPORTING_EP_EVENT_API_VERSION_CHECK",
  IMPORTING_EP_EVENT_API_WITH_WARNING = "IMPORTING_EP_EVENT_API_WITH_WARNING",
  // IMPORTING_EP_EVENT_API_VERSION = 'IMPORTING_EP_EVENT_API_VERSION',
  IMPORTING_EP_APPLICATION = "IMPORTING_EP_APPLICATION",
  IMPORTING_EP_APPLICATION_VERSION_CHECK = "IMPORTING_EP_APPLICATION_VERSION_CHECK",
  IMPORTING_EP_APPLICATION_WITH_WARNING = "IMPORTING_EP_APPLICATION_WITH_WARNING",
  GENERATING_ASSETS_OUTPUT_START = "GENERATING_ASSETS_OUTPUT_START",
  GENERATING_ASSETS_OUTPUT = "GENERATING_ASSETS_OUTPUT",
  GENERATING_ASSETS_OUTPUT_ERROR = "GENERATING_ASSETS_OUTPUT_ERROR",
  GENERATING_ASSETS_OUTPUT_DONE = "GENERATING_ASSETS_OUTPUT_DONE",
  SETUP_TEST_DOMAIN_EVENT_API_VERSION_COPIED = "SETUP_TEST_DOMAIN_EVENT_API_VERSION_COPIED",
  SETUP_TEST_DOMAIN_EVENT_API_VERSION_COPY_SKIPPED = "SETUP_TEST_DOMAIN_EVENT_API_VERSION_COPY_SKIPPED",
  TRANSACTION_LOG = "TRANSACTION_LOG",
}
export enum ECliSummaryStatusCodes {
  USAGE_ERROR = "USAGE_ERROR",
  START_RUN = "START_RUN",
  RUN_ERROR = "RUN_ERROR",
  VALIDATING_API = "VALIDATING_API",
  SETUP_TEST_DOMAINS = "SETUP_TEST_DOMAINS",
  SETUP_TEST_API = "SETUP_TEST_API",
  PROCESSING_API_FILE = "PROCESSING_API_FILE",
  PROCESSING_API_FILE_APPLICATION = "PROCESSING_API_FILE_APPLICATION",
  PROCESSING_API = "PROCESSING_API",
  PROCESSING_API_CHANNEL = "PROCESSING_API_CHANNEL",
  PROCESSING_API_CHANNEL_OPERATION = "PROCESSING_API_CHANNEL_OPERATION",
  PROCESSED_APPLICATION_DOMAIN = "PROCESSED_APPLICATION_DOMAIN",
  PROCESSED_ASSET_APPLICATION_DOMAIN = "PROCESSED_ASSET_APPLICATION_DOMAIN",
  PROCESSED_ENUM = "PROCESSED_ENUM",
  PROCESSED_ENUM_VERSION = "PROCESSED_ENUM_VERSION",
  PROCESSED_SCHEMA_VERSION = "PROCESSED_SCHEMA_VERSION",
  PROCESSED_EVENT_VERSION = "PROCESSED_EVENT_VERSION",
  PROCESSING_START_EVENT_API_VERSION = "PROCESSING_START_EVENT_API_VERSION",
  PROCESSED_EVENT_API_VERSION = "PROCESSED_EVENT_API_VERSION",
  PROCESSING_START_APPLICATION_VERSION = "PROCESSING_START_APPLICATION_VERSION",
  PROCESSED_APPLICATION_VERSION = "PROCESSED_APPLICATION_VERSION",
  PROCESSED_IMPORT = "PROCESSED_IMPORT",
  GENERATING_API_OUTPUT = "GENERATING_API_OUTPUT",
  IMPORT_SUMMARY = "IMPORT_SUMMARY",
}

export enum ECliLogger_LogLevel {
  FATAL = "fatal",
  ERROR = "error",
  INFO = "info",
  DEBUG = "debug",
  TRACE = "trace",
}
export enum ECliLogger_EpSdkLogLevel {
  SILENT = "silent",
}
export type TCliLogger_EpSdkLogLevel =
  | ECliLogger_LogLevel
  | ECliLogger_EpSdkLogLevel;
export const ObjectValues_TCliLogger_EpSdkLogLevel: Array<string> = [
  ...Object.values(ECliLogger_LogLevel),
  ...Object.values(ECliLogger_EpSdkLogLevel),
];
const Map_TCliLogger_EpSdkLogLevel_to_EEpSdkLogLevel = new Map<
  TCliLogger_EpSdkLogLevel,
  EEpSdkLogLevel
>([
  [ECliLogger_EpSdkLogLevel.SILENT, EEpSdkLogLevel.Silent],
  [ECliLogger_LogLevel.FATAL, EEpSdkLogLevel.FatalError],
  [ECliLogger_LogLevel.ERROR, EEpSdkLogLevel.Error],
  [ECliLogger_LogLevel.INFO, EEpSdkLogLevel.Info],
  [ECliLogger_LogLevel.DEBUG, EEpSdkLogLevel.Debug],
  [ECliLogger_LogLevel.TRACE, EEpSdkLogLevel.Trace],
]);

export interface ICliLoggerOptions {
  appName: string;
  level: ECliLogger_LogLevel;
  logFile?: string;
  log2Stdout: boolean;
  cliLogger_EpSdkLogLevel: TCliLogger_EpSdkLogLevel;
  prettyPrint: boolean;
  logSummary2Console: boolean;
}

export interface ICliLogDetails {
  code: string;
  message?: string;
  details?: any;
}

export interface ICliLogEntry extends IEpSdkLogEntry {
  runContext: ICliRunContext;
}

class CliEpSdkPinoLogger implements IEpSdkLoggerInstance {
  appId: string;
  epSdkLogLevel: EEpSdkLogLevel;

  constructor(appId: string) {
    this.appId = appId;
  }

  public setLogLevel = (epSdkLogLevel: EEpSdkLogLevel): void => {
    this.epSdkLogLevel = epSdkLogLevel;
  };

  public createLogEntry = (
    logName: string,
    details: ICliLogDetails
  ): ICliLogEntry => {
    return CliLogger.createLogEntry(logName, details);
  };

  /* istanbul ignore next */
  public fatal = (logEntry: IEpSdkLogEntry): void => {
    if (this.epSdkLogLevel < EEpSdkLogLevel.FatalError) return;
    CliLogger.fatal(CliLogger.createLogEntry(logEntry.logName, logEntry));
  };

  /* istanbul ignore next */
  public error = (logEntry: IEpSdkLogEntry): void => {
    if (this.epSdkLogLevel < EEpSdkLogLevel.Error) return;
    CliLogger.error(CliLogger.createLogEntry(logEntry.logName, logEntry));
  };

  /* istanbul ignore next */
  public warn = (logEntry: IEpSdkLogEntry): void => {
    if (this.epSdkLogLevel < EEpSdkLogLevel.Warn) return;
    CliLogger.warn(CliLogger.createLogEntry(logEntry.logName, logEntry));
  };

  public info = (logEntry: IEpSdkLogEntry): void => {
    if (this.epSdkLogLevel < EEpSdkLogLevel.Info) return;
    CliLogger.info(CliLogger.createLogEntry(logEntry.logName, logEntry));
  };

  public debug = (logEntry: IEpSdkLogEntry): void => {
    if (this.epSdkLogLevel < EEpSdkLogLevel.Debug) return;
    CliLogger.debug(CliLogger.createLogEntry(logEntry.logName, logEntry));
  };

  public trace = (logEntry: IEpSdkLogEntry): void => {
    if (this.epSdkLogLevel < EEpSdkLogLevel.Trace) return;
    CliLogger.trace(CliLogger.createLogEntry(logEntry.logName, logEntry));
  };
}

export class CliLogger {
  private static appName: string;
  private static cliLoggerOptions: ICliLoggerOptions;

  public static L = pino({
    name: "uninitializedAppId",
    level: ECliLogger_LogLevel.TRACE,
  });

  public static initialize = ({
    cliLoggerOptions,
  }: {
    cliLoggerOptions: ICliLoggerOptions;
  }): void => {
    const funcName = "initialize";
    const logName = `${CliLogger.name}.${funcName}()`;

    CliLogger.cliLoggerOptions = cliLoggerOptions;
    CliLogger.appName = cliLoggerOptions.appName;

    // setup epSdk logger with a pino logger
    const cliEpSdkPinoLogger: CliEpSdkPinoLogger = new CliEpSdkPinoLogger(
      cliLoggerOptions.appName
    );
    const epSdkLogLevel: EEpSdkLogLevel | undefined =
      Map_TCliLogger_EpSdkLogLevel_to_EEpSdkLogLevel.get(
        cliLoggerOptions.cliLogger_EpSdkLogLevel
      );
    if (epSdkLogLevel === undefined)
      throw new CliInternalCodeInconsistencyError(logName, {
        cause: "cannot map cliLogger_EpSdkLogLevel to EEpSdkLogLevel",
        cliLogger_EpSdkLogLevel: cliLoggerOptions.cliLogger_EpSdkLogLevel,
        Map_TCliLogger_EpSdkLogLevel_to_EEpSdkLogLevel: JSON.stringify(
          Object.fromEntries(Map_TCliLogger_EpSdkLogLevel_to_EEpSdkLogLevel)
        ),
      });
    cliEpSdkPinoLogger.setLogLevel(epSdkLogLevel);
    EpSdkLogger.initialize({ epSdkLoggerInstance: cliEpSdkPinoLogger });

    const streams: Array<pino.StreamEntry> = [];
    if (cliLoggerOptions.logFile !== undefined) {
      if (cliLoggerOptions.prettyPrint) {
        streams.push({
          level: "trace",
          stream: PinoPretty({
            append: false,
            destination: pino.destination({
              append: false,
              dest: cliLoggerOptions.logFile,
              sync: true,
            }),
          }),
        });
      } else {
        streams.push({
          level: "trace",
          stream: pino.destination({
            append: false,
            dest: cliLoggerOptions.logFile,
            sync: true,
          }),
        });
      }
    }
    if (cliLoggerOptions.log2Stdout) {
      if (cliLoggerOptions.prettyPrint)
        streams.push({ level: "trace", stream: PinoPretty() });
      else streams.push({ level: "trace", stream: process.stdout });
    }

    CliLogger.L = pino(
      {
        name: cliLoggerOptions.appName,
        level: cliLoggerOptions.level,
      },
      pino.multistream(streams)
    );
  };

  public static createLogEntry = (
    logName: string,
    cliLogDetails: ICliLogDetails
  ): ICliLogEntry => {
    const d = new Date();
    return {
      logger: CliLogger.name,
      module: logName,
      appId: this.appName,
      logName: logName,
      timestamp: d.toUTCString(),
      runContext: CliRunContext.get(),
      ...cliLogDetails,
    };
  };

  public static fatal = (logEntry: ICliLogEntry): void => {
    CliLogger.L.fatal(logEntry);
  };

  public static error = (logEntry: ICliLogEntry): void => {
    CliLogger.L.error(logEntry);
  };

  public static warn = (logEntry: ICliLogEntry): void => {
    CliLogger.L.warn(logEntry);
  };

  public static info = (logEntry: ICliLogEntry): void => {
    CliLogger.L.info(logEntry);
  };

  public static debug = (logEntry: ICliLogEntry): void => {
    CliLogger.L.debug(logEntry);
  };

  public static trace = (logEntry: ICliLogEntry): void => {
    CliLogger.L.trace(logEntry);
  };

  public static summary = ({
    cliRunSummary_LogBase,
    consoleOutput,
    code,
    useCliLogger = true,
  }: {
    cliRunSummary_LogBase: ICliRunSummary_LogBase;
    consoleOutput: string;
    code: ECliSummaryStatusCodes;
    useCliLogger?: boolean;
  }): void => {
    if (CliLogger.cliLoggerOptions.logSummary2Console) {
      console.log(consoleOutput.replace(/^\n+|\n+$/g, ""));
    }

    // define custom level and route to logFile.summary.log
    // CliLogger.L.summary(CliLogger.createSummaryLogEntry(cliRunSummary));
    if (useCliLogger) {
      if (code.toLowerCase().includes("error")) {
        CliLogger.L.error(
          CliLogger.createLogEntry(CliConfig.getAppName(), {
            code: code,
            details: {
              summary: cliRunSummary_LogBase,
            },
          })
        );
      } else {
        CliLogger.L.info(
          CliLogger.createLogEntry(CliConfig.getAppName(), {
            code: code,
            details: {
              summary: cliRunSummary_LogBase,
            },
          })
        );
      }
    }
  };
}
