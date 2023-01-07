/* istanbul ignore file */

import { EpSdkLoggerNotInitializedError } from "./EpSdkErrors";

/** @category Logging */
export interface IEpSdkLogDetails {
  module: string;
  code: string;
  message?: string, 
  details?: any
}

/** @category Logging */
export interface IEpSdkLogEntry extends IEpSdkLogDetails {
  logger: string;
  appId: string;
  logName: string;
  timestamp: string;
}

/** @category Logging */
export enum EEpSdkLogLevel {
  Silent = 0,
  FatalError = 1,
  Error = 2,
  Warn = 3,
  Info = 4,
  Debug = 5,
  Trace = 6,
}

/** @category Logging */
export interface IEpSdkLoggerInstance {
  appId: string;
  epSdkLogLevel: EEpSdkLogLevel;

  setLogLevel: (epSdkLogLevel: EEpSdkLogLevel) => void;

  createLogEntry: (logName: string, details: IEpSdkLogDetails) => IEpSdkLogEntry;

  fatal: (logEntry: IEpSdkLogEntry) => void;

  error: (logEntry: IEpSdkLogEntry) => void;

  warn: (logEntry: IEpSdkLogEntry) => void;
  
  info: (logEntry: IEpSdkLogEntry) => void;

  debug: (logEntry: IEpSdkLogEntry) => void;

  trace: (logEntry: IEpSdkLogEntry) => void;

}


/**
 * Logger wrapper.
 * @category Logging
*/
export class EpSdkLogger {
  private static epSdkLoggerInstance: IEpSdkLoggerInstance | undefined = undefined;

  public static initialize = ({ epSdkLoggerInstance }:{
    epSdkLoggerInstance: IEpSdkLoggerInstance;
  }): void => {
    EpSdkLogger.epSdkLoggerInstance = epSdkLoggerInstance;
  }

  public static getLoggerInstance(): IEpSdkLoggerInstance {
    if(EpSdkLogger.epSdkLoggerInstance === undefined) throw new EpSdkLoggerNotInitializedError(EpSdkLogger.name, this.constructor.name);
    return EpSdkLogger.epSdkLoggerInstance;
  }

  public static createLogEntry = (logName: string, details: IEpSdkLogDetails): IEpSdkLogEntry => {
    if(EpSdkLogger.epSdkLoggerInstance === undefined) throw new EpSdkLoggerNotInitializedError(EpSdkLogger.name, this.constructor.name);
    return EpSdkLogger.epSdkLoggerInstance.createLogEntry(logName, details);
  }

  public static fatal = (logEntry: IEpSdkLogEntry): void => {
    if(EpSdkLogger.epSdkLoggerInstance === undefined) throw new EpSdkLoggerNotInitializedError(EpSdkLogger.name, this.constructor.name);
    EpSdkLogger.epSdkLoggerInstance.fatal(logEntry);
  }

  public static error = (logEntry: IEpSdkLogEntry): void => {
    if(EpSdkLogger.epSdkLoggerInstance === undefined) throw new EpSdkLoggerNotInitializedError(EpSdkLogger.name, this.constructor.name);
    EpSdkLogger.epSdkLoggerInstance.error(logEntry);
  }

  public static warn = (logEntry: IEpSdkLogEntry): void => {
    if(EpSdkLogger.epSdkLoggerInstance === undefined) throw new EpSdkLoggerNotInitializedError(EpSdkLogger.name, this.constructor.name);
    EpSdkLogger.epSdkLoggerInstance.warn(logEntry);
  }

  public static info = (logEntry: IEpSdkLogEntry): void => {
    if(EpSdkLogger.epSdkLoggerInstance === undefined) throw new EpSdkLoggerNotInitializedError(EpSdkLogger.name, this.constructor.name);
    EpSdkLogger.epSdkLoggerInstance.info(logEntry);
  }

  public static debug = (logEntry: IEpSdkLogEntry): void => {
    if(EpSdkLogger.epSdkLoggerInstance === undefined) throw new EpSdkLoggerNotInitializedError(EpSdkLogger.name, this.constructor.name);
    EpSdkLogger.epSdkLoggerInstance.debug(logEntry);
  }

  public static trace = (logEntry: IEpSdkLogEntry): void => {
    if(EpSdkLogger.epSdkLoggerInstance === undefined) throw new EpSdkLoggerNotInitializedError(EpSdkLogger.name, this.constructor.name);
    EpSdkLogger.epSdkLoggerInstance.trace(logEntry);
  }

}


