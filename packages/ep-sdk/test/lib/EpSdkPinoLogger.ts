import pino from 'pino';
import { 
  EEpSdkLogLevel, 
  IEpSdkLoggerInstance, 
  IEpSdkLogDetails, 
  IEpSdkLogEntry 
} from "../../src";


export class EpSdkPinoLogger implements IEpSdkLoggerInstance {
  appId: string;
  epSdkLogLevel: EEpSdkLogLevel;
  static logLevelMap: Map<EEpSdkLogLevel, pino.Level> = new Map<EEpSdkLogLevel, pino.Level>([
    // [EEpSdkLogLevel.Silent, "silent"],
    [EEpSdkLogLevel.Error, "error"],
    [EEpSdkLogLevel.Warn, "warn"],
    [EEpSdkLogLevel.Info, "info"],
    [EEpSdkLogLevel.Debug, "debug"],
    [EEpSdkLogLevel.Trace, "trace"],
  ]);

  public static L = pino({
    name: "ep-sdk-test",
    level: "info",
  });

  private static getPinoLevel = (epSdkLogLevel: EEpSdkLogLevel): string => {
    let pinoLogLevel: string | undefined = EpSdkPinoLogger.logLevelMap.get(epSdkLogLevel);
    if(pinoLogLevel === undefined) throw new TypeError(`${EpSdkPinoLogger.name}: cannot find pino log level mapping for epSdkLogLevel=${epSdkLogLevel}`);
    return pinoLogLevel;
  }

  constructor(appId: string, epSdkLogLevel: EEpSdkLogLevel) {
    this.appId = appId;
    this.epSdkLogLevel = epSdkLogLevel;
    EpSdkPinoLogger.L = pino({
      name: appId,
      level: EpSdkPinoLogger.getPinoLevel(epSdkLogLevel)
    });
  }

  public setLogLevel(epSdkLogLevel: EEpSdkLogLevel) {
    EpSdkPinoLogger.L.level = EpSdkPinoLogger.getPinoLevel(epSdkLogLevel);
  }

  public createLogEntry = (logName: string, details: IEpSdkLogDetails): IEpSdkLogEntry => {
    const d = new Date();
    return {
      logger: EpSdkPinoLogger.name,
      appId: this.appId,
      logName: logName,
      timestamp: d.toUTCString(),
      ...details
    };
  }

  public fatal = (logEntry: IEpSdkLogEntry): void => {
    EpSdkPinoLogger.L.fatal(logEntry);
  }

  public error = (logEntry: IEpSdkLogEntry): void => {
    EpSdkPinoLogger.L.error(logEntry);
  }

  public warn = (logEntry: IEpSdkLogEntry): void => {
    if(this.epSdkLogLevel > EEpSdkLogLevel.Silent) EpSdkPinoLogger.L.warn(logEntry);
  }

  public info = (logEntry: IEpSdkLogEntry): void => {
    if(this.epSdkLogLevel > EEpSdkLogLevel.Silent) EpSdkPinoLogger.L.info(logEntry);
  }

  public debug = (logEntry: IEpSdkLogEntry): void => {
    if(this.epSdkLogLevel > EEpSdkLogLevel.Silent) EpSdkPinoLogger.L.debug(logEntry);
  }

  public trace = (logEntry: IEpSdkLogEntry): void => {
    if(this.epSdkLogLevel > EEpSdkLogLevel.Silent) EpSdkPinoLogger.L.trace(logEntry);
  }


}

