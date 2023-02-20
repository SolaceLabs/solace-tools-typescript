import { ApiError } from "@solace-labs/ep-openapi-node";
import {
  EpSdkEpApiError,
  EpSdkError,
  EPSdkErrorFromError,
  EpSdkInternalTaskError,
  EpSdkLogger,
  EEpSdkLoggerCodes,
  EpSdkUtils,
  IEpSdkDeepCompareResult,
  TEpSdkDeepDiffFromTo,
} from "../utils";
import { EEpSdkObjectTypes } from "../types";
import {
  EpSdkTask_TransactionLog,
  IEpSdkTask_TransactionLogData,
} from "./EpSdkTask_TransactionLog";

/** @category Tasks */
export interface IEpSdkTask_EpObjectKeys {
  epObjectType: EEpSdkObjectTypes;
  epObjectId: string;
}
/** @category Tasks */
export enum EEpSdkTask_TargetState {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
}
/** @category Tasks */
export enum EEpSdkTask_Action {
  CREATE = "CREATE",
  WOULD_CREATE = "WOULD_CREATE",
  CREATE_FIRST_VERSION = "CREATE_FIRST_VERSION",
  WOULD_CREATE_FIRST_VERSION = "WOULD_CREATE_FIRST_VERSION",
  CREATE_NEW_VERSION = "CREATE_NEW_VERSION",
  WOULD_CREATE_NEW_VERSION = "WOULD_CREATE_NEW_VERSION",
  WOULD_FAIL_CREATE_NEW_VERSION_ON_EXACT_VERSION_REQUIREMENT = "WOULD_FAIL_CREATE_NEW_VERSION_ON_EXACT_VERSION_REQUIREMENT",
  UPDATE = "UPDATE",
  WOULD_UPDATE = "WOULD_UPDATE",
  WOULD_FAIL_TO_UPDATE = "WOULD_FAIL_TO_UPDATE",
  DELETE = "DELETE",
  WOULD_DELETE = "WOULD_DELETE",
  DELETE_VERSION = "DELETE_VERSION",
  WOULD_DELETE_VERSION = "WOULD_DELETE_VERSION",
  NO_ACTION = "NO_ACTION",
}
/** @category Tasks */
export interface IEpSdkTask_TransactionConfig {
  groupTransactionId?: string;
  parentTransactionId: string;
}
/** @category Tasks */
export interface IEpSdkTask_Config {
  epSdkTask_TargetState: EEpSdkTask_TargetState;
  checkmode?: boolean;
  epSdkTask_TransactionConfig?: IEpSdkTask_TransactionConfig;
}
/** @category Tasks */
export interface IEpSdkTask_Keys {}
/** @category Tasks */
export interface IEpSdkTask_GetFuncReturn {
  epObjectExists: boolean;
  epObject: any;
  epObjectKeys: IEpSdkTask_EpObjectKeys;
}
/** @category Tasks */
export interface IEpSdkTask_CreateFuncReturn {
  epSdkTask_Action: EEpSdkTask_Action;
  epObject: any;
  epObjectKeys: IEpSdkTask_EpObjectKeys;
}
/** @category Tasks */
export interface IEpSdkTask_IsUpdateRequiredFuncReturn {
  isUpdateRequired: boolean;
  existingCompareObject: any;
  requestedCompareObject: any;
  difference: Record<string, TEpSdkDeepDiffFromTo> | undefined;
}
/** @category Tasks */
export interface IEpSdkTask_UpdateFuncReturn {
  issue?: any;
  epSdkTask_Action: EEpSdkTask_Action;
  epObject: any;
  epObjectKeys: IEpSdkTask_EpObjectKeys;
}
/** @category Tasks */
export interface IEpSdkTask_DeleteFuncReturn {
  epSdkTask_Action: EEpSdkTask_Action;
  epObject: any;
  epObjectKeys: IEpSdkTask_EpObjectKeys;
}
/** @category Tasks */
export interface IEpSdkTask_ExecuteReturn {
  epSdkTask_TransactionLogData: IEpSdkTask_TransactionLogData;
  epObject: any;
  epObjectKeys: IEpSdkTask_EpObjectKeys;
}
/** @category Tasks */
export interface IEpSdkTaskDeepCompareResult extends IEpSdkDeepCompareResult {}

/** @category Tasks */
export abstract class EpSdkTask {
  protected xContextId?: string;
  protected epSdkTask_Config: IEpSdkTask_Config;
  private taskTransactionId: string;
  protected epSdkTask_TransactionLog: EpSdkTask_TransactionLog;

  protected isCheckmode(): boolean {
    if (this.epSdkTask_Config.checkmode === undefined) return false;
    return this.epSdkTask_Config.checkmode;
  }

  protected prepareCompareObject4Output(obj: any): any {
    return EpSdkUtils.prepareCompareObject4Output(obj);
  }

  protected deepCompareObjects({
    existingObject,
    requestedObject,
  }: {
    existingObject: any;
    requestedObject: any;
  }): IEpSdkDeepCompareResult {
    return EpSdkUtils.deepCompareObjects({
      existingObject: existingObject,
      requestedObject: requestedObject,
    });
  }

  protected create_IEpSdkTask_IsUpdateRequiredFuncReturn({
    existingObject,
    requestedObject,
  }: {
    existingObject: any;
    requestedObject: any;
  }): IEpSdkTask_IsUpdateRequiredFuncReturn {
    const epSdkTaskDeepCompareResult: IEpSdkTaskDeepCompareResult =
      this.deepCompareObjects({
        existingObject: existingObject,
        requestedObject: requestedObject,
      });
    const epSdkTask_IsUpdateRequiredFuncReturn: IEpSdkTask_IsUpdateRequiredFuncReturn =
      {
        isUpdateRequired: !epSdkTaskDeepCompareResult.isEqual,
        existingCompareObject: this.prepareCompareObject4Output(existingObject),
        requestedCompareObject:
          this.prepareCompareObject4Output(requestedObject),
        difference: epSdkTaskDeepCompareResult.difference,
      };
    return epSdkTask_IsUpdateRequiredFuncReturn;
  }

  protected transform_EpSdkTask_Config(
    epSdkTask_Config: IEpSdkTask_Config
  ): IEpSdkTask_Config {
    return epSdkTask_Config;
  }

  protected truncate(str: string, maxLength: number | undefined): string {
    if (maxLength !== undefined && str.length > maxLength)
      return str.slice(0, maxLength - 4) + "...";
    return str;
  }

  constructor(epSdkTask_Config: IEpSdkTask_Config) {
    this.epSdkTask_Config = this.transform_EpSdkTask_Config(epSdkTask_Config);
    this.epSdkTask_Config.checkmode = this.isCheckmode();
    this.taskTransactionId = EpSdkUtils.getUUID();
    this.epSdkTask_TransactionLog = new EpSdkTask_TransactionLog(
      this.taskTransactionId,
      this.epSdkTask_Config,
      this.getDefaultEpObjectKeys()
    );
  }

  protected abstract getDefaultEpObjectKeys(): IEpSdkTask_EpObjectKeys;

  protected abstract getEpObjectKeys(epObject: any): IEpSdkTask_EpObjectKeys;

  protected abstract getTaskKeys(): IEpSdkTask_Keys;

  protected abstract getFunc(
    epSdkTask_Keys: IEpSdkTask_Keys
  ): Promise<IEpSdkTask_GetFuncReturn>;

  private async getFuncCall(
    epSdkTask_Keys: IEpSdkTask_Keys
  ): Promise<IEpSdkTask_GetFuncReturn> {
    const epSdkTask_GetFuncReturn: IEpSdkTask_GetFuncReturn =
      await this.getFunc(epSdkTask_Keys);
    this.epSdkTask_TransactionLog.add_GetFuncReturn(epSdkTask_GetFuncReturn);
    return epSdkTask_GetFuncReturn;
  }

  protected abstract isUpdateRequiredFunc(
    epSdkTask_GetFuncReturn: IEpSdkTask_GetFuncReturn
  ): Promise<IEpSdkTask_IsUpdateRequiredFuncReturn>;

  private async isUpdateRequiredFuncCall({
    epSdkTask_GetFuncReturn,
  }: {
    epSdkTask_GetFuncReturn: IEpSdkTask_GetFuncReturn;
  }): Promise<IEpSdkTask_IsUpdateRequiredFuncReturn> {
    const epSdkTask_IsUpdateRequiredFuncReturn: IEpSdkTask_IsUpdateRequiredFuncReturn =
      await this.isUpdateRequiredFunc(epSdkTask_GetFuncReturn);
    this.epSdkTask_TransactionLog.add_isUpdateRequiredFuncReturn(
      epSdkTask_IsUpdateRequiredFuncReturn
    );
    return epSdkTask_IsUpdateRequiredFuncReturn;
  }

  protected abstract createFunc(): Promise<IEpSdkTask_CreateFuncReturn>;

  protected getCreateFuncAction(): EEpSdkTask_Action {
    if (this.isCheckmode()) return EEpSdkTask_Action.WOULD_CREATE;
    return EEpSdkTask_Action.CREATE;
  }
  private async createFuncCall(): Promise<IEpSdkTask_CreateFuncReturn> {
    const epSdkTask_CreateFuncReturn: IEpSdkTask_CreateFuncReturn =
      await this.createFunc();
    this.epSdkTask_TransactionLog.add_CreateFuncReturn(
      epSdkTask_CreateFuncReturn
    );
    return epSdkTask_CreateFuncReturn;
  }

  protected abstract updateFunc(epSdkTask_GetFuncReturn: IEpSdkTask_GetFuncReturn): Promise<IEpSdkTask_UpdateFuncReturn>;

  protected getUpdateFuncAction(wouldFail = false): EEpSdkTask_Action {
    if (this.isCheckmode()) {
      if(wouldFail) return EEpSdkTask_Action.WOULD_FAIL_TO_UPDATE;
      return EEpSdkTask_Action.WOULD_UPDATE;
    }
    return EEpSdkTask_Action.UPDATE;
  }
  private async updateFuncCall(epSdkTask_GetFuncReturn: IEpSdkTask_GetFuncReturn): Promise<IEpSdkTask_UpdateFuncReturn> {
    const epSdkTask_UpdateFuncReturn: IEpSdkTask_UpdateFuncReturn = await this.updateFunc(epSdkTask_GetFuncReturn);
    this.epSdkTask_TransactionLog.add_UpdateFuncReturn(epSdkTask_UpdateFuncReturn);
    return epSdkTask_UpdateFuncReturn;
  }

  protected abstract deleteFunc(epSdkTask_GetFuncReturn: IEpSdkTask_GetFuncReturn): Promise<IEpSdkTask_DeleteFuncReturn>;

  protected getDeleteFuncAction(): EEpSdkTask_Action {
    if (this.isCheckmode()) return EEpSdkTask_Action.WOULD_DELETE;
    return EEpSdkTask_Action.DELETE;
  }

  private async deleteFuncCall(epSdkTask_GetFuncReturn: IEpSdkTask_GetFuncReturn): Promise<IEpSdkTask_DeleteFuncReturn> {
    const epSdkTask_DeleteFuncReturn: IEpSdkTask_DeleteFuncReturn = await this.deleteFunc(epSdkTask_GetFuncReturn);
    this.epSdkTask_TransactionLog.add_DeleteFuncReturn(epSdkTask_DeleteFuncReturn);
    return epSdkTask_DeleteFuncReturn;
  }

  private async executePresent(epSdkTask_GetFuncReturn: IEpSdkTask_GetFuncReturn): Promise<IEpSdkTask_ExecuteReturn> {
    const funcName = "executePresent";
    const logName = `${EpSdkTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_PRESENT_START, module: this.constructor.name }));

    if (!epSdkTask_GetFuncReturn.epObjectExists) {
      const epSdkTask_CreateFuncReturn: IEpSdkTask_CreateFuncReturn = await this.createFuncCall();
      EpSdkLogger.debug(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_DONE_CREATE, module: this.constructor.name, details: {
        epSdkTask_Config: this.epSdkTask_Config,
        epSdkTask_CreateFuncReturn: epSdkTask_CreateFuncReturn,
      }}));
      return {
        epSdkTask_TransactionLogData: this.epSdkTask_TransactionLog.getData(),
        epObject: epSdkTask_CreateFuncReturn.epObject,
        epObjectKeys: epSdkTask_CreateFuncReturn.epObjectKeys,
      };
    }
    // check if update required
    const epSdkTask_IsUpdateRequiredFuncReturn: IEpSdkTask_IsUpdateRequiredFuncReturn = await this.isUpdateRequiredFuncCall({
      epSdkTask_GetFuncReturn: epSdkTask_GetFuncReturn,
    });
    EpSdkLogger.debug(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_DONE_IS_UPDATE_REQUIRED, module: this.constructor.name, details: {
      epSdkTask_Config: this.epSdkTask_Config,
      epSdkTask_IsUpdateRequiredFuncReturn: epSdkTask_IsUpdateRequiredFuncReturn,
    }}));

    if (epSdkTask_IsUpdateRequiredFuncReturn.isUpdateRequired) {
      const epSdkTask_UpdateFuncReturn: IEpSdkTask_UpdateFuncReturn = await this.updateFuncCall(epSdkTask_GetFuncReturn);
      EpSdkLogger.debug(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_DONE_UPDATE, module: this.constructor.name, details: {
        epSdkTask_Config: this.epSdkTask_Config,
        epSdkTask_IsUpdateRequiredFuncReturn: epSdkTask_IsUpdateRequiredFuncReturn,
        epSdkTask_UpdateFuncReturn: epSdkTask_UpdateFuncReturn,
      }}));
      return {
        epSdkTask_TransactionLogData: this.epSdkTask_TransactionLog.getData(),
        epObject: epSdkTask_UpdateFuncReturn.epObject,
        epObjectKeys: epSdkTask_UpdateFuncReturn.epObjectKeys,
      };
    }
    // nothing to do
    return {
      epSdkTask_TransactionLogData: this.epSdkTask_TransactionLog.getData(),
      epObject: epSdkTask_GetFuncReturn.epObject,
      epObjectKeys: epSdkTask_GetFuncReturn.epObjectKeys,
    };
  }

  private async executeAbsent(epSdkTask_GetFuncReturn: IEpSdkTask_GetFuncReturn): Promise<IEpSdkTask_ExecuteReturn> {
    const funcName = "executeAbsent";
    const logName = `${EpSdkTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_ABSENT_START, module: this.constructor.name }));

    if (epSdkTask_GetFuncReturn.epObjectExists) {
      const epSdkTask_DeleteFuncReturn: IEpSdkTask_DeleteFuncReturn = await this.deleteFuncCall(epSdkTask_GetFuncReturn);
      EpSdkLogger.debug(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_DONE_DELETE, module: this.constructor.name, details: {
        epSdkTask_Config: this.epSdkTask_Config,
        epSdkTask_GetFuncReturn: epSdkTask_GetFuncReturn,
        epSdkTask_DeleteFuncReturn: epSdkTask_DeleteFuncReturn,
      }}));
      return {
        epSdkTask_TransactionLogData: this.epSdkTask_TransactionLog.getData(),
        epObject: epSdkTask_DeleteFuncReturn.epObject,
        epObjectKeys: epSdkTask_DeleteFuncReturn.epObjectKeys,
      };
    }
    // nothing to do
    return {
      epSdkTask_TransactionLogData: this.epSdkTask_TransactionLog.getData(),
      epObject: epSdkTask_GetFuncReturn.epObject,
      epObjectKeys: epSdkTask_GetFuncReturn.epObjectKeys,
    };
  }

  /**
   * Allows for async init of task
   */
  protected async initializeTask(): Promise<void> {
    // do nothing, override in derived class
  }

  protected async validateTaskConfig(): Promise<void> {
    // do nothing, override in derived class
  }

  public async execute(xContextId?: string): Promise<IEpSdkTask_ExecuteReturn> {
    const funcName = "execute";
    const logName = `${EpSdkTask.name}.${funcName}()`;

    this.xContextId = xContextId;

    try {
      EpSdkLogger.info(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START, module: this.constructor.name, details: {
        epSdkTask_Config: this.epSdkTask_Config,
      }}));

      let xvoid: void = await this.initializeTask();

      xvoid = await this.validateTaskConfig();
      xvoid;

      const epSdkTask_GetFuncReturn: IEpSdkTask_GetFuncReturn = await this.getFuncCall(this.getTaskKeys());
      EpSdkLogger.debug(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_DONE_GET, module: this.constructor.name, details: {
        epSdkTask_Config: this.epSdkTask_Config,
        taskKeys: this.getTaskKeys(),
        epSdkTask_GetFuncReturn: epSdkTask_GetFuncReturn,
      }}));

      let epSdkTask_ExecuteReturn: IEpSdkTask_ExecuteReturn | undefined = undefined;
      switch (this.epSdkTask_Config.epSdkTask_TargetState) {
        case EEpSdkTask_TargetState.PRESENT:
          epSdkTask_ExecuteReturn = await this.executePresent(epSdkTask_GetFuncReturn);
          break;
        case EEpSdkTask_TargetState.ABSENT:
          epSdkTask_ExecuteReturn = await this.executeAbsent(epSdkTask_GetFuncReturn);
          break;
        default:
          /* istanbul ignore next */
          EpSdkUtils.assertNever(logName, this.epSdkTask_Config.epSdkTask_TargetState);
      }

      EpSdkLogger.debug(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_RESULT, module: this.constructor.name, details: {
        epSdkTask_Config: this.epSdkTask_Config,
        epSdkTask_ExecuteReturn: epSdkTask_ExecuteReturn ? epSdkTask_ExecuteReturn : "undefined",
      }}));

      /* istanbul ignore next */
      if (epSdkTask_ExecuteReturn === undefined) throw new EpSdkInternalTaskError(logName, this.constructor.name, "epSdkTask_ExecuteReturn === undefined");

      EpSdkLogger.info(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_DONE, module: this.constructor.name, details: {
        epSdkTask_Config: this.epSdkTask_Config,
        epSdkTask_TransactionLogData: this.epSdkTask_TransactionLog.getData(),
      }}));
      return epSdkTask_ExecuteReturn;
    } catch (e: any) {
      if (e instanceof ApiError) throw new EpSdkEpApiError(logName, this.constructor.name, e);
      if (e instanceof EpSdkError) throw e;
      throw new EPSdkErrorFromError(logName, this.constructor.name, e);
    }
  }
}
