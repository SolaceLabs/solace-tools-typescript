import { 
  EEpSdkObjectTypes 
} from "../types";
import {
  IEpSdkDeepCompareResult,
  TEpSdkDeepDiffFromTo,
} from "../utils";
import { IEpSdkTask_TransactionLogData } from "./EpSdkTask_TransactionLog";

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
