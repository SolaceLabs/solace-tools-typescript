/* istanbul ignore file */
import { 
  EEpSdkLogLevel, 
  IEpSdkLoggerInstance, 
  IEpSdkLogDetails, 
  IEpSdkLogEntry 
} from "./EpSdkLogger";

/** @category Logging */
export class EpSdkConsoleLogger implements IEpSdkLoggerInstance {
  appId: string;
  epSdkLogLevel: EEpSdkLogLevel;

  constructor(appId: string, epSdkLogLevel: EEpSdkLogLevel) {
    this.appId = appId;
    this.epSdkLogLevel = epSdkLogLevel;
  }

  public setLogLevel(epSdkLogLevel: EEpSdkLogLevel) {
    this.epSdkLogLevel = epSdkLogLevel;
  }

  public createLogEntry = (logName: string, details: IEpSdkLogDetails): IEpSdkLogEntry => {
    const d = new Date();
    return {
      logger: EpSdkConsoleLogger.name,
      appId: this.appId,
      logName: logName,
      timestamp: d.toUTCString(),
      ...details
    };
  }

  private createOutput(logEntry: IEpSdkLogEntry, epSdkLogLevel: EEpSdkLogLevel): any {
    return JSON.stringify({
      epSdkLogLevel: epSdkLogLevel,
      ...logEntry
    }, null, 2);
  }

  public fatal = (logEntry: IEpSdkLogEntry): void => {
    console.error(this.createOutput(logEntry, EEpSdkLogLevel.FatalError));
  }

  public error = (logEntry: IEpSdkLogEntry): void => {
    console.error(this.createOutput(logEntry, EEpSdkLogLevel.Error));
  }

  public warn = (logEntry: IEpSdkLogEntry): void => {
    if(this.epSdkLogLevel >= EEpSdkLogLevel.Warn) console.warn(this.createOutput(logEntry, EEpSdkLogLevel.Warn));
  }

  public info = (logEntry: IEpSdkLogEntry): void => {
    if(this.epSdkLogLevel >= EEpSdkLogLevel.Info) console.info(this.createOutput(logEntry, EEpSdkLogLevel.Info));
  }

  public debug = (logEntry: IEpSdkLogEntry): void => {
    if(this.epSdkLogLevel >= EEpSdkLogLevel.Debug) console.debug(this.createOutput(logEntry, EEpSdkLogLevel.Debug));
  }

  public trace = (logEntry: IEpSdkLogEntry): void => {
    if(this.epSdkLogLevel >= EEpSdkLogLevel.Trace) console.log(this.createOutput(logEntry, EEpSdkLogLevel.Trace));
  }

}


