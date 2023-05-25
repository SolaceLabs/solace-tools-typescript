/* istanbul ignore file */

import pino from "pino";
import PinoPretty from "pino-pretty";
import { 
  EEpSdkLogLevel,
  EpSdkLogger,
  IEpSdkLogEntry,
  IEpSdkLoggerInstance 
} from "@solace-labs/ep-sdk";
import CliRunContext, { ICliRunContext } from "./CliRunContext";
import CliConfig from "./CliConfig";
import { ICliRunSummary_LogBase } from "./CliRunSummary";
import { CliInternalCodeInconsistencyError } from "./CliError";

export enum ECliStatusCodes {
  INFO = "INFO",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  INITIALIZING = "INITIALIZING",
  INITIALIZE_ERROR = "INITIALIZE_ERROR",
  INITIALIZED = "INITIALIZED",

  CONFIG_ERROR = "CONFIG_ERROR",
  TRANSACTION_LOG = "TRANSACTION_LOG",

  MIGRATE_PRESENT_DONE = "MIGRATE_PRESENT_DONE",
  MIGRATE_ABSENT_DONE = "MIGRATE_ABSENT_DONE",

  MIGRATE_ISSUES = "MIGRATE_ISSUES",

  MIGRATE_ENUMS_START = "MIGRATE_ENUMS_START",
  MIGRATE_ENUMS_APPLICATION_DOMAIN = "MIGRATE_ENUMS_APPLICATION_DOMAIN",
  MIGRATE_ENUMS_DONE = "MIGRATE_ENUMS_DONE",
  MIGRATE_ENUMS_ERROR = "MIGRATE_ENUMS_ERROR",
  PRESENT_EP_V2_ENUM = "PRESENT_EP_V2_ENUM",
  PRESENT_EP_V2_ENUM_VERSION = "PRESENT_EP_V2_ENUM_VERSION",

  MIGRATE_APPLICATION_DOMAINS_START = "MIGRATE_APPLICATION_DOMAINS_START",
  MIGRATE_APPLICATION_DOMAINS_DONE = "MIGRATE_APPLICATION_DOMAINS_DONE",
  MIGRATE_APPLICATION_DOMAINS_ERROR = "MIGRATE_APPLICATION_DOMAINS_ERROR",
  MIGRATE_APPLICATION_DOMAIN = "MIGRATE_APPLICATION_DOMAIN",
  PRESENT_EP_V2_APPLICATION_DOMAIN = "PRESENT_EP_V2_APPLICATION_DOMAIN",
  ABSENT_BY_ID_APPLICATION_DOMAINS_ERROR = "ABSENT_BY_ID_APPLICATION_DOMAINS_ERROR",

  MIGRATE_SCHEMAS_START = "MIGRATE_SCHEMAS_START",
  MIGRATE_SCHEMAS_DONE = "MIGRATE_SCHEMAS_DONE",
  MIGRATE_SCHEMAS_ERROR = "MIGRATE_SCHEMAS_ERROR",
  PRESENT_EP_V2_SCHEMA = "PRESENT_EP_V2_SCHEMA",
  PRESENT_EP_V2_SCHEMA_VERSION = "PRESENT_EP_V2_SCHEMA_VERSION",
  ABSENT_BY_ID_SCHEMAS_ERROR = "ABSENT_BY_ID_SCHEMAS_ERROR",

  MIGRATE_EVENTS_START = "MIGRATE_EVENTS_START",
  MIGRATE_EVENTS_DONE = "MIGRATE_EVENTS_DONE",
  MIGRATE_EVENTS_ERROR = "MIGRATE_EVENTS_ERROR",
  PRESENT_EP_V2_EVENT = "PRESENT_EP_V2_EVENT",
  PRESENT_EP_V2_EVENT_VERSION = "PRESENT_EP_V2_EVENT_VERSION",
  ABSENT_BY_ID_EVENTS_ERROR = "ABSENT_BY_ID_EVENTS_ERROR",

  MIGRATE_APPLICATIONS_START = "MIGRATE_APPLICATIONS_START",
  MIGRATE_APPLICATIONS_DONE = "MIGRATE_APPLICATIONS_DONE",
  MIGRATE_APPLICATIONS_ERROR = "MIGRATE_APPLICATIONS_ERROR",
  PRESENT_EP_V2_APPLICATION = "PRESENT_EP_V2_APPLICATION",
  PRESENT_EP_V2_APPLICATION_VERSION = "PRESENT_EP_V2_APPLICATION_VERSION",

  ABSENT_BY_ID_APPLICATIONS_START = "ABSENT_BY_ID_APPLICATIONS_START",
  ABSENT_BY_ID_APPLICATIONS_DONE = "ABSENT_BY_ID_APPLICATIONS_DONE",
  ABSENT_BY_ID_APPLICATIONS_ERROR = "ABSENT_BY_ID_APPLICATIONS_ERROR",

}
export enum ECliSummaryStatusCodes {
  USAGE_ERROR = "USAGE_ERROR",
  START_RUN = "START_RUN",
  RUN_ERROR = "RUN_ERROR",
  MIGRATE_SUMMARY_PRESENT = "MIGRATE_SUMMARY_PRESENT",
  MIGRATE_SUMMARY_ABSENT = "MIGRATE_SUMMARY_ABSENT",
  MIGRATE_SUMMARY_ISSUES = "MIGRATE_SUMMARY_ISSUES",

  PROCESSING_EP_V1_APPLICATION_DOMAINS = "PROCESSING_EP_V1_APPLICATION_DOMAINS",
  PROCESSING_EP_V1_APPLICATION_DOMAINS_DONE = "PROCESSING_EP_V1_APPLICATION_DOMAINS_DONE",
  PROCESSING_EP_V1_APPLICATION_DOMAINS_NONE_FOUND = "PROCESSING_EP_V1_APPLICATION_DOMAINS_NONE_FOUND",
  PROCESSING_EP_V1_APPLICATION_DOMAIN = "PROCESSING_EP_V1_APPLICATION_DOMAIN",
  
  PROCESSING_EP_V2_APPLICATION_DOMAINS_ABSENT = "PROCESSING_EP_V2_APPLICATION_DOMAINS_ABSENT",
  PROCESSING_EP_V2_APPLICATION_DOMAINS_ABSENT_DONE = "PROCESSING_EP_V2_APPLICATION_DOMAINS_ABSENT_DONE",
  PROCESSING_EP_V2_APPLICATION_DOMAINS_ABSENT_NONE_FOUND = "PROCESSING_EP_V2_APPLICATION_DOMAINS_ABSENT_NONE_FOUND",
  PRESENT_EP_V2_APPLICATION_DOMAIN = "PRESENT_EP_V2_APPLICATION_DOMAIN",

  PROCESSING_EP_V2_APPLICATION_DOMAINS_ABSENT_BY_ID_START = "PROCESSING_EP_V2_APPLICATION_DOMAINS_ABSENT_BY_ID_START",
  PROCESSING_EP_V2_APPLICATION_DOMAINS_ABSENT_BY_ID_DONE = "PROCESSING_EP_V2_APPLICATION_DOMAINS_ABSENT_BY_ID_DONE",
  PROCESSING_EP_V2_APPLICATION_DOMAINS_ABSENT_BY_ID_NONE_FOUND = "PROCESSING_EP_V2_APPLICATION_DOMAINS_ABSENT_BY_ID_NONE_FOUND",
  PROCESSING_ABSENT_EP_V2_APPLICATION_DOMAIN = "PROCESSING_ABSENT_EP_V2_APPLICATION_DOMAIN",
  ABSENT_EP_V2_APPLICATION_DOMAIN = "ABSENT_EP_V2_APPLICATION_DOMAIN",
  ABSENT_EP_V2_APPLICATION_DOMAIN_ISSUE = "ABSENT_EP_V2_APPLICATION_DOMAIN_ISSUE",


  PROCESSING_EP_V1_ENUMS = "PROCESSING_EP_V1_ENUMS",
  PROCESSING_EP_V1_ENUMS_DONE = "PROCESSING_EP_V1_ENUMS_DONE",
  PROCESSING_EP_V1_ENUMS_NONE_FOUND = "PROCESSING_EP_V1_ENUMS_NONE_FOUND",
  PROCESSING_EP_V1_ENUM = "PROCESSING_EP_V1_ENUM",
  PRESENT_EP_V2_ENUM_APPLICATION_DOMAIN = "PRESENT_EP_V2_ENUM_APPLICATION_DOMAIN",
  PRESENT_EP_V2_ENUM = "PRESENT_EP_V2_ENUM",
  PRESENT_EP_V2_ENUM_VERSION = "PRESENT_EP_V2_ENUM_VERSION",
  PROCESSING_EP_V2_ENUMS_ABSENT_BY_ID_START = "PROCESSING_EP_V2_ENUMS_ABSENT_BY_ID_START",
  PROCESSING_EP_V2_ENUMS_ABSENT_BY_ID_DONE = "PROCESSING_EP_V2_ENUMS_ABSENT_BY_ID_DONE",
  PROCESSING_EP_V2_ENUMS_ABSENT_BY_ID_NONE_FOUND = "PROCESSING_EP_V2_ENUMS_ABSENT_BY_ID_NONE_FOUND",
  PROCESSING_ABSENT_EP_V2_ENUM = "PROCESSING_ABSENT_EP_V2_ENUM",
  ABSENT_EP_V2_ENUM = "ABSENT_EP_V2_ENUM",
  ABSENT_EP_V2_ENUM_ISSUE = "ABSENT_EP_V2_ENUM_ISSUE",
  ABSENT_EP_V2_ENUM_VERSION = "ABSENT_EP_V2_ENUM_VERSION",

  PROCESSING_EP_V1_SCHEMAS = "PROCESSING_EP_V1_SCHEMAS",
  PROCESSING_EP_V1_SCHEMAS_DONE = "PROCESSING_EP_V1_SCHEMAS_DONE",
  PROCESSING_EP_V1_SCHEMAS_NONE_FOUND = "PROCESSING_EP_V1_SCHEMAS_NONE_FOUND",
  PROCESSING_EP_V1_SCHEMA = "PROCESSING_EP_V1_SCHEMA",
  PROCESSING_EP_V1_SCHEMA_ISSUE = "PROCESSING_EP_V1_SCHEMA_ISSUE",
  PRESENT_EP_V2_SCHEMA = "PRESENT_EP_V2_SCHEMA",
  PRESENT_EP_V2_SCHEMA_VERSION = "PRESENT_EP_V2_SCHEMA_VERSION",
  PROCESSING_EP_V2_SCHEMAS_ABSENT_BY_ID_START = "PROCESSING_EP_V2_SCHEMAS_ABSENT_BY_ID_START",
  PROCESSING_EP_V2_SCHEMAS_ABSENT_BY_ID_DONE = "PROCESSING_EP_V2_SCHEMAS_ABSENT_BY_ID_DONE",
  PROCESSING_EP_V2_SCHEMAS_ABSENT_BY_ID_NONE_FOUND = "PROCESSING_EP_V2_SCHEMAS_ABSENT_BY_ID_NONE_FOUND",
  PROCESSING_ABSENT_EP_V2_SCHEMA = "PROCESSING_ABSENT_EP_V2_SCHEMA",
  ABSENT_EP_V2_SCHEMA = "ABSENT_EP_V2_SCHEMA",
  ABSENT_EP_V2_SCHEMA_ISSUE = "ABSENT_EP_V2_SCHEMA_ISSUE",
  ABSENT_EP_V2_SCHEMA_VERSION = "ABSENT_EP_V2_SCHEMA_VERSION",

  PROCESSING_EP_V1_EVENTS = "PROCESSING_EP_V1_EVENTS",
  PROCESSING_EP_V1_EVENTS_DONE = "PROCESSING_EP_V1_EVENTS_DONE",
  PROCESSING_EP_V1_EVENTS_NONE_FOUND = "PROCESSING_EP_V1_EVENTS_NONE_FOUND",
  PROCESSING_EP_V1_EVENT = "PROCESSING_EP_V1_EVENT",
  PROCESSING_EP_V1_EVENT_ISSUE = "PROCESSING_EP_V1_EVENT_ISSUE",
  PRESENT_EP_V2_EVENT = "PRESENT_EP_V2_EVENT",
  PRESENT_EP_V2_EVENT_VERSION = "PRESENT_EP_V2_EVENT_VERSION",
  PROCESSING_EP_V2_EVENTS_ABSENT_BY_ID_START = "PROCESSING_EP_V2_EVENTS_ABSENT_BY_ID_START",
  PROCESSING_EP_V2_EVENTS_ABSENT_BY_ID_DONE = "PROCESSING_EP_V2_EVENTS_ABSENT_BY_ID_DONE",
  PROCESSING_EP_V2_EVENTS_ABSENT_BY_ID_NONE_FOUND = "PROCESSING_EP_V2_EVENTS_ABSENT_BY_ID_NONE_FOUND",
  PROCESSING_ABSENT_EP_V2_EVENT = "PROCESSING_ABSENT_EP_V2_EVENT",
  ABSENT_EP_V2_EVENT = "ABSENT_EP_V2_EVENT",
  ABSENT_EP_V2_EVENT_ISSUE = "ABSENT_EP_V2_EVENT_ISSUE",
  ABSENT_EP_V2_EVENT_VERSION = "ABSENT_EP_V2_EVENT_VERSION",
  
  PROCESSING_EP_V1_APPLICATIONS = "PROCESSING_EP_V1_APPLICATIONS",
  PROCESSING_EP_V1_APPLICATIONS_DONE = "PROCESSING_EP_V1_APPLICATIONS_DONE",
  PROCESSING_EP_V1_APPLICATIONS_NONE_FOUND = "PROCESSING_EP_V1_APPLICATIONS_NONE_FOUND",
  PROCESSING_EP_V1_APPLICATION = "PROCESSING_EP_V1_APPLICATION",
  PROCESSING_EP_V1_APPLICATION_ISSUE = "PROCESSING_EP_V1_APPLICATION_ISSUE",
  PRESENT_EP_V2_APPLICATION = "PRESENT_EP_V2_APPLICATION",
  PRESENT_EP_V2_APPLICATION_VERSION = "PRESENT_EP_V2_APPLICATION_VERSION",
  PROCESSING_EP_V2_APPLICATIONS_ABSENT_BY_ID_START = "PROCESSING_EP_V2_APPLICATIONS_ABSENT_BY_ID",
  PROCESSING_EP_V2_APPLICATIONS_ABSENT_BY_ID_DONE = "PROCESSING_EP_V2_APPLICATIONS_ABSENT_BY_ID_DONE",
  PROCESSING_EP_V2_APPLICATIONS_ABSENT_BY_ID_NONE_FOUND = "PROCESSING_EP_V2_APPLICATIONS_ABSENT_BY_ID_NONE_FOUND",
  PROCESSING_ABSENT_EP_V2_APPLICATION = "PROCESSING_ABSENT_EP_V2_APPLICATION",
  ABSENT_EP_V2_APPLICATION = "ABSENT_EP_V2_APPLICATION",
  ABSENT_EP_V2_APPLICATION_ISSUE = "ABSENT_EP_V2_APPLICATION_ISSUE",
  ABSENT_EP_V2_APPLICATION_VERSION = "ABSENT_EP_V2_APPLICATION_VERSION",

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
export type TCliLogger_EpSdkLogLevel = ECliLogger_LogLevel | ECliLogger_EpSdkLogLevel;
export const ObjectValues_TCliLogger_EpSdkLogLevel: Array<string> = [
  ...Object.values(ECliLogger_LogLevel),
  ...Object.values(ECliLogger_EpSdkLogLevel),
];

const Map_TCliLogger_EpSdkLogLevel_to_EEpSdkLogLevel = new Map<TCliLogger_EpSdkLogLevel, EEpSdkLogLevel>([
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
  prettyPrint: boolean;
  logSummary2Console: boolean;
  cliLogger_EpSdkLogLevel: TCliLogger_EpSdkLogLevel;
}

export interface ICliLogDetails {
  code: string;
  message?: string;
  details?: any;
}

export interface ICliLogEntry extends IEpSdkLogEntry {
  logger: string;
  appId: string;
  timestamp: string;
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

  public static initialize = ({ cliLoggerOptions }: {
    cliLoggerOptions: ICliLoggerOptions;
  }): void => {
    const funcName = "initialize";
    const logName = `${CliLogger.name}.${funcName}()`;

    CliLogger.cliLoggerOptions = cliLoggerOptions;
    CliLogger.appName = cliLoggerOptions.appName;

    // setup epSdk logger with a pino logger
    const cliEpSdkPinoLogger: CliEpSdkPinoLogger = new CliEpSdkPinoLogger(cliLoggerOptions.appName);
    const epSdkLogLevel: EEpSdkLogLevel | undefined = Map_TCliLogger_EpSdkLogLevel_to_EEpSdkLogLevel.get(cliLoggerOptions.cliLogger_EpSdkLogLevel);
    if (epSdkLogLevel === undefined) throw new CliInternalCodeInconsistencyError(logName, {
        cause: "cannot map cliLogger_EpSdkLogLevel to EEpSdkLogLevel",
        cliLogger_EpSdkLogLevel: cliLoggerOptions.cliLogger_EpSdkLogLevel,
        Map_TCliLogger_EpSdkLogLevel_to_EEpSdkLogLevel: JSON.stringify(Object.fromEntries(Map_TCliLogger_EpSdkLogLevel_to_EEpSdkLogLevel)),
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

    CliLogger.L = pino({
        name: cliLoggerOptions.appName,
        level: cliLoggerOptions.level,
      },
      pino.multistream(streams)
    );
  };

  public static createLogEntry = (logName: string, cliLogDetails: ICliLogDetails): ICliLogEntry => {
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

  public static summary = ({cliRunSummary_LogBase, consoleOutput, code, useCliLogger = true }: {
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
      if (code.toLowerCase().includes("error") || code.toLowerCase().includes("issue")) {
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
