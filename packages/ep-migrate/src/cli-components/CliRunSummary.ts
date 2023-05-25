import { 
  Application, 
  ApplicationDomain, 
  ApplicationVersion, 
  EventVersion, 
  SchemaObject, 
  SchemaVersion, 
  TopicAddressEnum, 
  TopicAddressEnumVersion 
} from "@solace-labs/ep-openapi-node";
import {
  EEpSdkTask_Action,
  EEpSdkObjectTypes,
  IEpSdkApplicationDomainTask_ExecuteReturn,
  IEpSdkEnumTask_ExecuteReturn,
  IEpSdkEnumVersionTask_ExecuteReturn,
  IEpSdkTask_ExecuteReturn,
  IEpSdkSchemaTask_ExecuteReturn,
  IEpSdkSchemaVersionTask_ExecuteReturn,
  IEpSdkEpEventTask_ExecuteReturn,
  IEpSdkEpEventVersionTask_ExecuteReturn,
  IEpSdkApplicationTask_ExecuteReturn,
  IEpSdkApplicationVersionTask_ExecuteReturn,
  EpSdkEvent,
} from "@solace-labs/ep-sdk";
import CliConfig, { ICliOrganizationInfo } from "./CliConfig";
import { 
  CliError, 
} from "./CliError";
import {
  CliLogger,
  ECliStatusCodes,
  ECliSummaryStatusCodes,
} from "./CliLogger";
import { 
  ECliRunContext_RunMode, 
  ICliApplicationRunContext, 
  ICliEventRunContext, 
  ICliRunAbsentApplicationByRunIdContext, 
  ICliRunAbsentApplicationDomainByRunIdContext, 
  ICliRunAbsentByRunIdContext, 
  ICliRunAbsentEnumByRunIdContext, 
  ICliRunAbsentEventByRunIdContext, 
  ICliRunAbsentSchemaByRunIdContext, 
  ICliSchemaRunContext 
} from "./CliRunContext";
import { 
  CliUtils 
} from "./CliUtils";
import { 
  ECliMigrateManagerMode, 
  ECliMigrateManagerRunState, 
  ICliMigrateManagerOptions 
} from "./CliMigrateManager";
import CliRunIssues, { 
  ECliRunIssueTypes, 
  ICliRunIssueAbsentById, 
  ICliRunIssueApplication, 
  ICliRunIssueEvent, 
  ICliRunIssueSchema 
} from "./CliRunIssues";

export enum ECliChannelOperationType {
  PUBLISH = "publish",
  SUBSCRIBE = "subscribe",
}
export enum ECliRunSummary_Type {
  StartRunPresent = "StartRunPresent",
  StartRunAbsent = "StartRunAbsent",
  RunError = "RunError",
  MigrateSummaryPresent = "MigrateSummaryPresent",
  MigrateSummaryAbsent = "MigrateSummaryAbsent",
  MigrateSummaryIssues = "MigrateSummaryIssues",

  ProcessingEpV1ApplicationDomains = "ProcessingEpV1ApplicationDomains",
  ProcessingEpV1ApplicationDomainsDone = "ProcessingEpV1ApplicationDomainsDone",
  ProcessingEpV1ApplicationDomainsNoneFound = "ProcessingEpV1ApplicationDomainsNoneFound",
  ProcessingEpV1ApplicationDomain = "ProcessingEpV1ApplicationDomain",

  ProcessingEpV1Enums = "ProcessingEpV1Enums",
  ProcessingEpV1EnumsDone = "ProcessingEpV1EnumsDone",
  ProcessingEpV1EnumsNoneFound = "ProcessingEpV1EnumsNoneFound",
  ProcessingEpV1Enum = "ProcessingEpV1Enum",
  ProcessingEpV2EnumsByIdAbsentStart = "ProcessingEpV2EnumsByIdAbsentStart",
  ProcessingEpV2EnumsByIdAbsentDone = "ProcessingEpV2EnumsByIdAbsentDone",
  ProcessingEpV2EnumsByIdAbsentNoneFound = "ProcessingEpV2EnumsByIdAbsentNoneFound",
  ProcessingAbsentEpV2Enum = "ProcessingAbsentEpV2Enum",
  AbsentEpV2Enum = "AbsentEpV2Enum",
  AbsentEpV2EnumDone = "AbsentEpV2EnumDone",
  AbsentEpV2EnumIssue = "AbsentEpV2EnumIssue",
  AbsentEpV2EnumVersion = "AbsentEpV2EnumVersion",

  ProcessingEpV1Schemas = "ProcessingEpV1Schemas",
  ProcessingEpV1SchemasDone = "ProcessingEpV1SchemasDone",
  ProcessingEpV1SchemasNoneFound = "ProcessingEpV1SchemasNoneFound",
  ProcessingEpV1Schema = "ProcessingEpV1Schema",
  ProcessingEpV1SchemaIssue = "ProcessingEpV1SchemaIssue",
  ProcessingEpV2SchemasByIdAbsentStart = "ProcessingEpV2SchemasByIdAbsentStart",
  ProcessingEpV2SchemasByIdAbsentDone = "ProcessingEpV2SchemasByIdAbsentDone",
  ProcessingEpV2SchemasByIdAbsentNoneFound = "ProcessingEpV2SchemasByIdAbsentNoneFound",
  ProcessingAbsentEpV2Schema = "ProcessingAbsentEpV2Schema",
  AbsentEpV2Schema = "AbsentEpV2Schema",
  AbsentEpV2SchemaDone = "AbsentEpV2SchemaDone",
  AbsentEpV2SchemaIssue = "AbsentEpV2SchemaIssue",
  AbsentEpV2SchemaVersion = "AbsentEpV2SchemaVersion",

  ProcessingEpV1Events = "ProcessingEpV1Events",
  ProcessingEpV1EventsDone = "ProcessingEpV1EventsDone",
  ProcessingEpV1EventsNoneFound = "ProcessingEpV1EventsNoneFound",
  ProcessingEpV1Event = "ProcessingEpV1Event",
  ProcessingEpV1EventIssue = "ProcessingEpV1EventIssue",
  ProcessingEpV2EventsByIdAbsentStart = "ProcessingEpV2EventsByIdAbsentStart",
  ProcessingEpV2EventsByIdAbsentDone = "ProcessingEpV2EventsByIdAbsentDone",
  ProcessingEpV2EventsByIdAbsentNoneFound = "ProcessingEpV2EventsByIdAbsentNoneFound",
  ProcessingAbsentEpV2Event = "ProcessingAbsentEpV2Event",
  AbsentEpV2Event = "AbsentEpV2Event",
  AbsentEpV2EventDone = "AbsentEpV2EventDone",
  AbsentEpV2EventIssue = "AbsentEpV2EventIssue",
  AbsentEpV2EventVersion = "AbsentEpV2EventVersion",

  ProcessingEpV1Applications = "ProcessingEpV1Applications",
  ProcessingEpV1ApplicationsDone = "ProcessingEpV1ApplicationsDone",
  ProcessingEpV1ApplicationsNoneFound = "ProcessingEpV1ApplicationsNoneFound",
  ProcessingEpV1Application = "ProcessingEpV1Application",
  ProcessingEpV1ApplicationIssue = "ProcessingEpV1ApplicationIssue",
  ProcessingEpV2ApplicationsByIdAbsentStart = "ProcessingEpV2ApplicationsByIdAbsentStart",
  ProcessingEpV2ApplicationsByIdAbsentDone = "ProcessingEpV2ApplicationsByIdAbsentDone",
  ProcessingEpV2ApplicationsByIdAbsentNoneFound = "ProcessingEpV2ApplicationsByIdAbsentNoneFound",
  ProcessingAbsentEpV2Application = "ProcessingAbsentEpV2Application",
  AbsentEpV2Application = "AbsentEpV2Application",
  AbsentEpV2ApplicationDone = "AbsentEpV2ApplicationDone",
  AbsentEpV2ApplicationIssue = "AbsentEpV2ApplicationIssue",
  AbsentEpV2ApplicationVersion = "AbsentEpV2ApplicationVersion",
  
  ProcessingEpV2ApplicationDomainsAbsent = "ProcessingEpV2ApplicationDomainsAbsent",
  ProcessingEpV2ApplicationDomainsAbsentDone = "ProcessingEpV2ApplicationDomainsAbsentDone",
  ProcessingEpV2ApplicationDomainsAbsentNoneFound = "ProcessingEpV2ApplicationDomainsAbsentNoneFound",

  ProcessingEpV2ApplicationDomainsByIdAbsentStart = "ProcessingEpV2ApplicationDomainsByIdAbsentStart",
  ProcessingEpV2ApplicationDomainsByIdAbsentDone = "ProcessingEpV2ApplicationDomainsByIdAbsentDone",
  ProcessingEpV2ApplicationDomainsByIdAbsentNoneFound = "ProcessingEpV2ApplicationDomainsByIdAbsentNoneFound",
  ProcessingAbsentEpV2ApplicationDomain = "ProcessingAbsentEpV2ApplicationDomain",
  AbsentEpV2ApplicationDomain = "AbsentEpV2ApplicationDomain",
  AbsentEpV2ApplicationDomainDone = "AbsentEpV2ApplicationDomainDone",
  AbsentEpV2ApplicationDomainIssue = "AbsentEpV2ApplicationDomainIssue",
  
  EpV2ApplicationDomain = "EpV2ApplicationDomain",
  EpV2EnumApplicationDomain = "EpV2EnumApplicationDomain",
  EpV2Enum = "EpV2Enum",
  EpV2Schema = "EpV2Schema",
  EpV2Event = "EpV2Event",
  EpV2Application = "EpV2Application",
  
  EpV2VersionObject = "EpV2VersionObject",
  // EpV2VersionObjectWarning = "EpV2VersionObjectWarning",
  // EpV2ApplicationVersioningError = "EpV2ApplicationVersioningError",
}

export enum ECliEpV1Object_Types {
  EpV1ApplicationDomain = "EpV1ApplicationDomain",
  EpV1Enum = "EpV1Enum",
  EpV1Schema = "EpV1Schema",
  EpV1Event = "EpV1Event",
  EpV1Application = "EpV1Application"
}

// taskTransactionId: string;
export interface ICliRunError {
  type: ECliRunSummary_Type.RunError;
  runMode?: ECliRunContext_RunMode;
  cliError: CliError;
}
export interface ICliRunSummary_Base {
  type: ECliRunSummary_Type;
  runMode?: ECliRunContext_RunMode;
  runState?: ECliMigrateManagerRunState;
  // timestamp: number; // would have to create new set of interfaces: xxx_Create which omit timestamp
}
export interface ICliRunSummary_LogBase extends ICliRunSummary_Base {
  timestamp: number;
}
export interface ICliRunSummary_StartRun extends ICliRunSummary_Base {
  epV1OrganizationInfo: ICliOrganizationInfo;
  epV2OrganizationInfo: ICliOrganizationInfo;
  epV2ApplicationDomainPrefix: string;
}
export interface ICliRunSummary_StartRunPresent extends ICliRunSummary_StartRun {
  type: ECliRunSummary_Type.StartRunPresent;
}
export interface ICliRunSummary_StartRunAbsent extends ICliRunSummary_StartRun {
  type: ECliRunSummary_Type.StartRunAbsent;
}
export interface ICliMigrateSummaryPresent extends ICliRunSummary_LogBase {
  type: ECliRunSummary_Type.MigrateSummaryPresent;
  logFile: string;
  processedEpV1ApplicationDomains: number;
  createdEpV2ApplicationDomains: number;
  updatedEpV2ApplicationDomains: number;
  createdEpV2EnumApplicationDomains: number;
  updatedEpV2EnumApplicationDomains: number;
  processedEpV1Enums: number;
  createdFirstEpV2EnumVersions: number;
  createdNewEpV2EnumVersions: number;
  processedEpV1Schemas: number;
  processingIssuesEpV1Schemas: number;
  createdFirstEpV2SchemaVersions: number;
  createdNewEpV2SchemaVersions: number;
  processedEpV1Events: number;
  processingIssuesEpV1Events: number;
  createdFirstEpV2EventVersions: number;
  createdNewEpV2EventVersions: number;
  processedEpV1Applications: number;
  processingIssuesEpV1Applications: number;
  createdFirstEpV2ApplicationVersions: number;
  createdNewEpV2ApplicationVersions: number;
}
export interface ICliMigrateSummaryAbsent extends ICliRunSummary_LogBase {
  type: ECliRunSummary_Type.MigrateSummaryAbsent;
  logFile: string;

  processedEpV2ApplicationDomains: number;
  deletedEpV2ApplicationDomains: number;
  processingEpV2ApplicationDomainIssues: number;

  processedEpV2Applications: number;
  deletedEpV2Applications: number;
  deletedEpV2ApplicationVersions: number;
  processingEpV2ApplicationIssues: number;

  processedEpV2Events: number;
  deletedEpV2Events: number;
  deletedEpV2EventVersions: number;
  processingEpV2EventIssues: number;

  processedEpV2Schemas: number;
  deletedEpV2Schemas: number;
  deletedEpV2SchemaVersions: number;
  processingEpV2SchemaIssues: number;

  processedEpV2Enums: number;
  deletedEpV2Enums: number;
  deletedEpV2EnumVersions: number;
  processingEpV2EnumIssues: number;
}
export interface ICliMigrateSummaryIssuesPresent extends ICliRunSummary_LogBase {
  type: ECliRunSummary_Type.MigrateSummaryIssues;
  logFile: string;
  cliRunSchemaIssues: Array<ICliRunIssueSchema>;
  cliRunEventIssues: Array<ICliRunIssueEvent>;
  cliRunApplicationIssues: Array<ICliRunIssueApplication>;
}

export interface ICliMigrateSummaryIssuesAbsent extends ICliRunSummary_LogBase {
  type: ECliRunSummary_Type.MigrateSummaryIssues;
  logFile: string;
  cliRunEnumIssues: Array<ICliRunIssueAbsentById>;
  cliRunSchemaIssues: Array<ICliRunIssueAbsentById>;
  cliRunEventIssues: Array<ICliRunIssueAbsentById>;
  cliRunApplicationIssues: Array<ICliRunIssueAbsentById>;
  cliRunApplicationDomainIssues: Array<ICliRunIssueAbsentById>;
}

// EpV1 Objects
export interface ICliRunSummary_EpV1_Object extends ICliRunSummary_Base {
  epV1ObjectType: ECliEpV1Object_Types;
}
export interface ICliRunSummary_EpV1_ApplicatonDomain extends ICliRunSummary_EpV1_Object {
  type: ECliRunSummary_Type.ProcessingEpV1ApplicationDomain;
  epV1ObjectType: ECliEpV1Object_Types.EpV1ApplicationDomain;
  applicationDomainName: string;
}
export interface ICliRunSummary_EpV1_Enum extends ICliRunSummary_EpV1_Object {
  type: ECliRunSummary_Type.ProcessingEpV1Enum;
  epV1ObjectType: ECliEpV1Object_Types.EpV1Enum;
  enumName: string;
}
export interface ICliRunSummary_EpV1_Schema extends ICliRunSummary_EpV1_Object {
  type: ECliRunSummary_Type.ProcessingEpV1Schema | ECliRunSummary_Type.ProcessingEpV1SchemaIssue;
  epV1ObjectType: ECliEpV1Object_Types.EpV1Schema;
  schemaName: string;
}
export interface ICliRunSummary_EpV1_Event extends ICliRunSummary_EpV1_Object {
  type: ECliRunSummary_Type.ProcessingEpV1Event | ECliRunSummary_Type.ProcessingEpV1EventIssue;
  epV1ObjectType: ECliEpV1Object_Types.EpV1Event;
  eventName: string;
}
export interface ICliRunSummary_EpV1_Application extends ICliRunSummary_EpV1_Object {
  type: ECliRunSummary_Type.ProcessingEpV1Application | ECliRunSummary_Type.ProcessingEpV1ApplicationIssue;
  epV1ObjectType: ECliEpV1Object_Types.EpV1Application;
  applicationName: string;
}
// EpV2 Objects
export interface ICliRunSummary_EpV2_ApplicationDomainsAbsent extends ICliRunSummary_Base {
  type: ECliRunSummary_Type.ProcessingEpV2ApplicationDomainsAbsent;
  absentApplicationDomainNames: Array<string>;
}
export interface ICliRunSummary_EpV2_AbsentById extends ICliRunSummary_Base {
  runId: string;
  rctxt?: ICliRunAbsentByRunIdContext;
}
export interface ICliRunSummary_EpV2_AbsentByIdStart extends ICliRunSummary_EpV2_AbsentById {
  type: ECliRunSummary_Type.ProcessingEpV2ApplicationsByIdAbsentStart | 
    ECliRunSummary_Type.ProcessingEpV2EventsByIdAbsentStart | 
    ECliRunSummary_Type.ProcessingEpV2SchemasByIdAbsentStart |
    ECliRunSummary_Type.ProcessingEpV2EnumsByIdAbsentStart |
    ECliRunSummary_Type.ProcessingEpV2ApplicationDomainsByIdAbsentStart;
}
export interface ICliRunSummary_EpV2_AbsentByIdDone extends ICliRunSummary_EpV2_AbsentById {
  type: ECliRunSummary_Type.ProcessingEpV2ApplicationsByIdAbsentDone | 
    ECliRunSummary_Type.ProcessingEpV2EventsByIdAbsentDone | 
    ECliRunSummary_Type.ProcessingEpV2SchemasByIdAbsentDone |
    ECliRunSummary_Type.ProcessingEpV2EnumsByIdAbsentDone |
    ECliRunSummary_Type.ProcessingEpV2ApplicationDomainsByIdAbsentDone;
}
export interface ICliRunSummary_EpV2_AbsentByIdNoneFound extends ICliRunSummary_EpV2_AbsentById {
  type: ECliRunSummary_Type.ProcessingEpV2ApplicationsByIdAbsentNoneFound 
    | ECliRunSummary_Type.ProcessingEpV2EventsByIdAbsentNoneFound
    | ECliRunSummary_Type.ProcessingEpV2SchemasByIdAbsentNoneFound
    | ECliRunSummary_Type.ProcessingEpV2EnumsByIdAbsentNoneFound
    | ECliRunSummary_Type.ProcessingEpV2ApplicationDomainsByIdAbsentNoneFound;
}
export interface ICliRunSummary_EpV2_AbsentByIdIssue extends ICliRunSummary_EpV2_AbsentById {
  type: ECliRunSummary_Type.AbsentEpV2ApplicationIssue | 
    ECliRunSummary_Type.AbsentEpV2EventIssue | 
    ECliRunSummary_Type.AbsentEpV2SchemaIssue |
    ECliRunSummary_Type.AbsentEpV2EnumIssue |
    ECliRunSummary_Type.AbsentEpV2ApplicationDomainIssue;
  issue: ICliRunIssueAbsentById;
}

// EpV2 tasks
export interface ICliRunSummary_Task extends ICliRunSummary_Base {
  applicationDomainName?: string;
  action: EEpSdkTask_Action;
}
export interface ICliRunSummary_Task_ApplicationDomain extends ICliRunSummary_Task {
  type: ECliRunSummary_Type.EpV2ApplicationDomain;
}
export interface ICliRunSummary_Task_EnumApplicationDomain extends ICliRunSummary_Task {
  type: ECliRunSummary_Type.EpV2EnumApplicationDomain;
}
export interface ICliRunSummary_Task_Object extends ICliRunSummary_Task {
  type: ECliRunSummary_Type;
  name: string;
  shared: boolean | string;
}
export interface ICliRunSummary_Task_Enum extends ICliRunSummary_Task_Object {
  type: ECliRunSummary_Type.EpV2Enum;
}
export interface ICliRunSummary_Task_Schema extends ICliRunSummary_Task_Object {
  type: ECliRunSummary_Type.EpV2Schema;
}
export interface ICliRunSummary_Task_Event extends ICliRunSummary_Task_Object {
  type: ECliRunSummary_Type.EpV2Event;
}
export interface ICliRunSummary_Task_Application extends Omit<ICliRunSummary_Task_Object, "shared"> {
  type: ECliRunSummary_Type.EpV2Application;
}
export interface ICliRunSummary_Task_VersionObject extends ICliRunSummary_Task {
  type: ECliRunSummary_Type.EpV2VersionObject;
  epObjectType: EEpSdkObjectTypes;
  displayName?: string;
  version?: string;
  state?: string;
  brokerType?: string;
}
// interface ICliRunSummary_Task_VersionObject_WarningError_Base extends ICliRunSummary_Task, Omit<ICliRunSummary_Task_VersionObject, "type"> {
//   existingVersion: string;
//   existingVersionState: string;
//   targetVersion: string;
//   targetVersionState: string;
//   newVersion: string;
//   newVersionState: string;
//   requestedUpdates: any;
// }
// interface ICliRunSummary_Task_VersionObject_Warning extends ICliRunSummary_Task_VersionObject_WarningError_Base {
//   type: ECliRunSummary_Type.EpV2VersionObjectWarning;
// }
// interface ICliRunSummary_Task_VersionObject_Error extends ICliRunSummary_Task_VersionObject_WarningError_Base {
//   type: ECliRunSummary_Type.EpV2EventApiVersioningError | ECliRunSummary_Type.ApplicationVersioningError;
// }
class CliRunSummary {
  private summaryLogList: Array<ICliRunSummary_LogBase> = [];
  private runMode: ECliRunContext_RunMode;

  public reset() { this.summaryLogList = []; }

  public getSummaryLogList(): Array<ICliRunSummary_LogBase> { return this.summaryLogList; }

  public getSummaryLogListLastEntry(): ICliRunSummary_LogBase { return this.summaryLogList[this.summaryLogList.length - 1]; }

  private log = (code: ECliSummaryStatusCodes, cliRunSummary_Base: ICliRunSummary_Base, consoleOutput: string, consoleOutputOnly = false ) => {
    const cliRunSummary_LogBase: ICliRunSummary_LogBase = {
      ...cliRunSummary_Base,
      timestamp: Date.now(),
    };
    this.summaryLogList.push(cliRunSummary_LogBase);
    CliLogger.summary({ cliRunSummary_LogBase, consoleOutput, code, useCliLogger: !consoleOutputOnly });
  };

  private addRun = (cliRunSummary_Base: ICliRunSummary_Base): ICliRunSummary_Base => {
    return {
      ...cliRunSummary_Base,
      runMode: this.runMode,
    };
  };

  private addTaskElements = (cliRunSummary_Task: ICliRunSummary_Task): ICliRunSummary_Task => {
    return {
      ...cliRunSummary_Task,
      ...this.addRun(cliRunSummary_Task),
    };
  };

  private presentEpV2VersionObject = (code: ECliSummaryStatusCodes, applicationDomainName: string, epSdkTask_ExecuteReturn: IEpSdkTask_ExecuteReturn): void => {
    const cliRunSummary_Task_VersionObject: ICliRunSummary_Task_VersionObject = {
      type: ECliRunSummary_Type.EpV2VersionObject,
      action: epSdkTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action,
      epObjectType: epSdkTask_ExecuteReturn.epSdkTask_TransactionLogData.epObjectKeys.epObjectType,
      displayName: epSdkTask_ExecuteReturn.epObject.displayName,
      version: epSdkTask_ExecuteReturn.epObject.version,
      state: epSdkTask_ExecuteReturn.epObject.stateId,
      brokerType: epSdkTask_ExecuteReturn.epObject.brokerType,
      applicationDomainName,
    };
//     const displayNameOutput = cliRunSummary_Task_VersionObject.displayName || "''"; 
//     const consoleOutput = `
//         ${cliRunSummary_Task_VersionObject.epObjectType}: ${displayNameOutput}@${cliRunSummary_Task_VersionObject.version}, state=${cliRunSummary_Task_VersionObject.state} (${cliRunSummary_Task_VersionObject.action})
// `;
    const consoleOutput = `
        ${cliRunSummary_Task_VersionObject.epObjectType}: ${cliRunSummary_Task_VersionObject.version}, state=${cliRunSummary_Task_VersionObject.state} (${cliRunSummary_Task_VersionObject.action})
    `;
    this.log(code, this.addTaskElements(cliRunSummary_Task_VersionObject), consoleOutput);
  };

  public runError = ({ cliRunError }: { cliRunError: ICliRunError }): void => {
    const consoleOutput = `
  Run Error: ------------------------
    See log file for more details.
  
  ${cliRunError.cliError}
      `;
    this.log(ECliSummaryStatusCodes.RUN_ERROR, cliRunError, consoleOutput);
  };

  public startRunAbsent = ({ cliRunSummary_StartRun }: {
    cliRunSummary_StartRun: Required<ICliRunSummary_StartRunAbsent>;
  }): void => {
    this.runMode = cliRunSummary_StartRun.runMode;
    const consoleOutput = `
------------------------------------------------------------------------------------------------    
Start Run: ${cliRunSummary_StartRun.runState}
  Ep V1 Organization: ${cliRunSummary_StartRun.epV1OrganizationInfo.name} (${cliRunSummary_StartRun.epV1OrganizationInfo.id})
  Ep V2 Organization: ${cliRunSummary_StartRun.epV2OrganizationInfo.name} (${cliRunSummary_StartRun.epV2OrganizationInfo.id})
  Ep V2 Application Domain Prefix: ${cliRunSummary_StartRun.epV2ApplicationDomainPrefix}
    `;
    this.log(ECliSummaryStatusCodes.START_RUN, cliRunSummary_StartRun, consoleOutput );
  };

  public startRunPresent = ({ cliRunSummary_StartRun }: {
    cliRunSummary_StartRun: Required<ICliRunSummary_StartRunPresent>;
  }): void => {
    this.runMode = cliRunSummary_StartRun.runMode;
    const consoleOutput = `
------------------------------------------------------------------------------------------------    
Start Run: ${cliRunSummary_StartRun.runState}
  Ep V1 Organization: ${cliRunSummary_StartRun.epV1OrganizationInfo.name} (${cliRunSummary_StartRun.epV1OrganizationInfo.id})
  Ep V2 Organization: ${cliRunSummary_StartRun.epV2OrganizationInfo.name} (${cliRunSummary_StartRun.epV2OrganizationInfo.id})
  Ep V2 Application Domain Prefix: ${cliRunSummary_StartRun.epV2ApplicationDomainPrefix}
    `;
    this.log(ECliSummaryStatusCodes.START_RUN, cliRunSummary_StartRun, consoleOutput );
  };

  public processingEpV1ApplicationDomains = () => {
    const consoleOutput = `
  Processing V1 Application Domains ...  
`;
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V1_APPLICATION_DOMAINS, { type: ECliRunSummary_Type.ProcessingEpV1ApplicationDomains }, consoleOutput);
  }
  
  public processedEpV1ApplicationDomains = () => {
    const consoleOutput = `
  Processing V1 Application Domains done.  
    `;
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V1_APPLICATION_DOMAINS_DONE, { type: ECliRunSummary_Type.ProcessingEpV1ApplicationDomainsDone }, consoleOutput);
  }

  public processingEpV1ApplicationDomainsNoneFound = () => {
    const consoleOutput = `
        No Application Domains found.  
`;
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V1_APPLICATION_DOMAINS_NONE_FOUND, { type: ECliRunSummary_Type.ProcessingEpV1ApplicationDomainsNoneFound }, consoleOutput);
  }

  public processingEpV1ApplicationDomain = ({ applicationDomainName }:{
    applicationDomainName: string;
  }) => {
    const consoleOutput = `
    Processing V1 Application Domain '${applicationDomainName}' ...  
`;
    const cliRunSummary_EpV1_ApplicatonDomain: ICliRunSummary_EpV1_ApplicatonDomain = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.ProcessingEpV1ApplicationDomain,
      epV1ObjectType: ECliEpV1Object_Types.EpV1ApplicationDomain,
      applicationDomainName,
    }
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V1_APPLICATION_DOMAIN, cliRunSummary_EpV1_ApplicatonDomain , consoleOutput);
  }

  public processingEpV2ApplicationDomainsAbsent = ({ absentApplicationDomainNames }:{
    absentApplicationDomainNames: Array<string>;
  }) => {
    const consoleOutput = `
    Processing V2 Application Domains for deletion ...
${absentApplicationDomainNames.map(x => ` 
      - ${x}` ).join('')}
`;
    const cliRunSummary_EpV2_ApplicationDomainsAbsent: ICliRunSummary_EpV2_ApplicationDomainsAbsent = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.ProcessingEpV2ApplicationDomainsAbsent,
      absentApplicationDomainNames,
    }
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V2_APPLICATION_DOMAINS_ABSENT, cliRunSummary_EpV2_ApplicationDomainsAbsent , consoleOutput);
  }

  
  public processingEpV2ApplicationsAbsentStart = ({ runId }:{
    runId: string;
  }) => {
    const consoleOutput = `
  Processing V2 Applications for deletion (runId=${runId}) ...
`;
    const ICliRunSummary_EpV2_AbsentByIdStart: ICliRunSummary_EpV2_AbsentByIdStart = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.ProcessingEpV2ApplicationsByIdAbsentStart,
      runId,
    }
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V2_APPLICATIONS_ABSENT_BY_ID_START, ICliRunSummary_EpV2_AbsentByIdStart , consoleOutput);
  }

  public processingEpV2ApplicationDomainsAbsentStart = ({ runId }:{
    runId: string;
  }) => {
    const consoleOutput = `
  Processing V2 Application Domains for deletion (runId=${runId}) ...
`;
    const ICliRunSummary_EpV2_AbsentByIdStart: ICliRunSummary_EpV2_AbsentByIdStart = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.ProcessingEpV2ApplicationDomainsByIdAbsentStart,
      runId,
    }
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V2_APPLICATION_DOMAINS_ABSENT_BY_ID_START, ICliRunSummary_EpV2_AbsentByIdStart , consoleOutput);
  }

  public processingEpV2ApplicationsAbsentNoneFound = ({ runId }:{
    runId: string;
  }) => {
    const consoleOutput = `
    None found.
`;
    const cliRunSummary_EpV2_AbsentByIdNoneFound: ICliRunSummary_EpV2_AbsentByIdNoneFound = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.ProcessingEpV2ApplicationsByIdAbsentNoneFound,
      runId,
    }
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V2_APPLICATIONS_ABSENT_BY_ID_NONE_FOUND, cliRunSummary_EpV2_AbsentByIdNoneFound , consoleOutput);
  }

  public processingEpV2ApplicationsAbsentDone = ({ runId }:{
    runId: string;
  }) => {
    const consoleOutput = `
  Processing V2 Applications for deletion (runId=${runId}) done.

  `;
    const ICliRunSummary_EpV2_AbsentByIdDone: ICliRunSummary_EpV2_AbsentByIdDone = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.ProcessingEpV2ApplicationsByIdAbsentDone,
      runId,
    }
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V2_APPLICATIONS_ABSENT_BY_ID_DONE, ICliRunSummary_EpV2_AbsentByIdDone , consoleOutput);
  }

  public processingEpV2ApplicationDomainsAbsentDone = ({ runId }:{
    runId: string;
  }) => {
    const consoleOutput = `
  Processing V2 Application Domains for deletion (runId=${runId}) done.

  `;
    const ICliRunSummary_EpV2_AbsentByIdDone: ICliRunSummary_EpV2_AbsentByIdDone = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.ProcessingEpV2ApplicationDomainsByIdAbsentDone,
      runId,
    }
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V2_APPLICATION_DOMAINS_ABSENT_BY_ID_DONE, ICliRunSummary_EpV2_AbsentByIdDone , consoleOutput);
  }
  
  public processingEpV2ApplicationAbsentStart = ({ runId, rctxt }:{
    runId: string;
    rctxt: ICliRunAbsentApplicationByRunIdContext;
  }) => {
    const consoleOutput = `
    Processing Application '${rctxt.applicationName}' in '${rctxt.applicationDomainName}' ...
`;
    const cliRunSummary_EpV2_AbsentById: ICliRunSummary_EpV2_AbsentById = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.ProcessingAbsentEpV2Application,
      runId,
      rctxt
    }
    this.log(ECliSummaryStatusCodes.PROCESSING_ABSENT_EP_V2_APPLICATION, cliRunSummary_EpV2_AbsentById, consoleOutput);
  }

  public processingEpV2ApplicationDomainAbsentStart = ({ runId, rctxt }:{
    runId: string;
    rctxt: ICliRunAbsentApplicationDomainByRunIdContext;
  }) => {
    const consoleOutput = `
    Processing Application Domain '${rctxt.applicationDomainName}' ...
`;
    const cliRunSummary_EpV2_AbsentById: ICliRunSummary_EpV2_AbsentById = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.ProcessingAbsentEpV2ApplicationDomain,
      runId,
      rctxt
    }
    this.log(ECliSummaryStatusCodes.PROCESSING_ABSENT_EP_V2_APPLICATION, cliRunSummary_EpV2_AbsentById, consoleOutput);
  }

  public processingEpV2ApplicationAbsentDone = ({ runId, rctxt }:{
    runId: string;
    rctxt: ICliRunAbsentApplicationByRunIdContext;
  }) => {
    const consoleOutput = `
      Done.
`;
    const cliRunSummary_EpV2_AbsentById: ICliRunSummary_EpV2_AbsentById = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.AbsentEpV2ApplicationDone,
      runId,
      rctxt
    }
    this.log(ECliSummaryStatusCodes.ABSENT_EP_V2_APPLICATION, cliRunSummary_EpV2_AbsentById, consoleOutput);
  }
  
  public processingEpV2ApplicationDomainAbsentDone = ({ runId, rctxt }:{
    runId: string;
    rctxt: ICliRunAbsentApplicationDomainByRunIdContext;
  }) => {
    const consoleOutput = `
      Done.
`;
    const cliRunSummary_EpV2_AbsentById: ICliRunSummary_EpV2_AbsentById = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.AbsentEpV2ApplicationDomainDone,
      runId,
      rctxt
    }
    this.log(ECliSummaryStatusCodes.ABSENT_EP_V2_APPLICATION_DOMAIN, cliRunSummary_EpV2_AbsentById, consoleOutput);
  }

  public processingEpV2ApplicationAbsentIssue = ({ issue }:{
    issue: ICliRunIssueAbsentById;
  }) => {
    const consoleOutput = `
      Issue deleting application. See log for details.
`;
    const cliRunSummary_EpV2_AbsentByIdIssue: ICliRunSummary_EpV2_AbsentByIdIssue = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.AbsentEpV2ApplicationIssue,
      runId: issue.runId,
      issue
    }
    this.log(ECliSummaryStatusCodes.ABSENT_EP_V2_APPLICATION_ISSUE, cliRunSummary_EpV2_AbsentByIdIssue, consoleOutput);
  }

  public processingEpV2ApplicationDomainAbsentIssue = ({ issue }:{
    issue: ICliRunIssueAbsentById;
  }) => {
    const consoleOutput = `
      Issue deleting application domain. See log for details.
`;
    const cliRunSummary_EpV2_AbsentByIdIssue: ICliRunSummary_EpV2_AbsentByIdIssue = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.AbsentEpV2ApplicationDomainIssue,
      runId: issue.runId,
      issue
    }
    this.log(ECliSummaryStatusCodes.ABSENT_EP_V2_APPLICATION_DOMAIN_ISSUE, cliRunSummary_EpV2_AbsentByIdIssue, consoleOutput);
  }

  public processingEpV2EventsAbsentStart = ({ runId }:{
    runId: string;
  }) => {
    const consoleOutput = `
  Processing V2 Events for deletion (runId=${runId}) ...
`;
    const ICliRunSummary_EpV2_AbsentByIdStart: ICliRunSummary_EpV2_AbsentByIdStart = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.ProcessingEpV2EventsByIdAbsentStart,
      runId,
    }
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V2_EVENTS_ABSENT_BY_ID_START, ICliRunSummary_EpV2_AbsentByIdStart , consoleOutput);
  }

  public processingEpV2EventsAbsentNoneFound = ({ runId }:{
    runId: string;
  }) => {
    const consoleOutput = `
    None found.
`;
    const cliRunSummary_EpV2_AbsentByIdNoneFound: ICliRunSummary_EpV2_AbsentByIdNoneFound = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.ProcessingEpV2EventsByIdAbsentNoneFound,
      runId,
    }
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V2_EVENTS_ABSENT_BY_ID_NONE_FOUND, cliRunSummary_EpV2_AbsentByIdNoneFound , consoleOutput);
  }

  public processingEpV2SchemasAbsentNoneFound = ({ runId }:{
    runId: string;
  }) => {
    const consoleOutput = `
    None found.
`;
    const cliRunSummary_EpV2_AbsentByIdNoneFound: ICliRunSummary_EpV2_AbsentByIdNoneFound = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.ProcessingEpV2SchemasByIdAbsentNoneFound,
      runId,
    }
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V2_SCHEMAS_ABSENT_BY_ID_NONE_FOUND, cliRunSummary_EpV2_AbsentByIdNoneFound , consoleOutput);
  }

  public processingEpV2EnumsAbsentNoneFound = ({ runId }:{
    runId: string;
  }) => {
    const consoleOutput = `
    None found.
`;
    const cliRunSummary_EpV2_AbsentByIdNoneFound: ICliRunSummary_EpV2_AbsentByIdNoneFound = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.ProcessingEpV2EnumsByIdAbsentNoneFound,
      runId,
    }
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V2_ENUMS_ABSENT_BY_ID_NONE_FOUND, cliRunSummary_EpV2_AbsentByIdNoneFound , consoleOutput);
  }

  public processingEpV2EventsAbsentDone = ({ runId }:{
    runId: string;
  }) => {
    const consoleOutput = `
  Processing V2 Events for deletion (runId=${runId}) done.

    `;
    const ICliRunSummary_EpV2_AbsentByIdDone: ICliRunSummary_EpV2_AbsentByIdDone = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.ProcessingEpV2EventsByIdAbsentDone,
      runId,
    }
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V2_EVENTS_ABSENT_BY_ID_DONE, ICliRunSummary_EpV2_AbsentByIdDone , consoleOutput);
  }

  public processingEpV2SchemasAbsentDone = ({ runId }:{
    runId: string;
  }) => {
    const consoleOutput = `
  Processing V2 Schemas for deletion (runId=${runId}) done.

    `;
    const ICliRunSummary_EpV2_AbsentByIdDone: ICliRunSummary_EpV2_AbsentByIdDone = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.ProcessingEpV2SchemasByIdAbsentDone,
      runId,
    }
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V2_SCHEMAS_ABSENT_BY_ID_DONE, ICliRunSummary_EpV2_AbsentByIdDone , consoleOutput);
  }
  
  public processingEpV2EnumsAbsentDone = ({ runId }:{
    runId: string;
  }) => {
    const consoleOutput = `
  Processing V2 Enums for deletion (runId=${runId}) done.

    `;
    const ICliRunSummary_EpV2_AbsentByIdDone: ICliRunSummary_EpV2_AbsentByIdDone = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.ProcessingEpV2EnumsByIdAbsentDone,
      runId,
    }
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V2_ENUMS_ABSENT_BY_ID_DONE, ICliRunSummary_EpV2_AbsentByIdDone , consoleOutput);
  }

  public processingEpV2EventAbsentStart = ({ runId, rctxt }:{
    runId: string;
    rctxt: ICliRunAbsentEventByRunIdContext;
  }) => {
    const consoleOutput = `
    Processing Event '${rctxt.eventName}' in '${rctxt.applicationDomainName}' ...
`;
    const cliRunSummary_EpV2_AbsentById: ICliRunSummary_EpV2_AbsentById = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.ProcessingAbsentEpV2Event,
      runId,
      rctxt
    }
    this.log(ECliSummaryStatusCodes.PROCESSING_ABSENT_EP_V2_EVENT, cliRunSummary_EpV2_AbsentById, consoleOutput);
  }
  
  public absentEpV2EventVersion = ({ runId, rctxt, eventVersion }:{
    runId: string;
    rctxt: ICliRunAbsentEventByRunIdContext;
    eventVersion: EventVersion;
  }) => {
    const consoleOutput = `
      Deleting Event Version '${eventVersion.version}'...
`;
    const cliRunSummary_EpV2_AbsentById: ICliRunSummary_EpV2_AbsentById = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.AbsentEpV2EventVersion,
      runId,
      rctxt
    }
    this.log(ECliSummaryStatusCodes.ABSENT_EP_V2_EVENT_VERSION, cliRunSummary_EpV2_AbsentById, consoleOutput);
  }

  public absentEpV2ApplicationVersion = ({ runId, rctxt, applicationVersion }:{
    runId: string;
    rctxt: ICliRunAbsentApplicationByRunIdContext;
    applicationVersion: ApplicationVersion;
  }) => {
    const consoleOutput = `
      Deleting Application Version '${applicationVersion.version}'.
`;
    const cliRunSummary_EpV2_AbsentById: ICliRunSummary_EpV2_AbsentById = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.AbsentEpV2ApplicationVersion,
      runId,
      rctxt
    }
    this.log(ECliSummaryStatusCodes.ABSENT_EP_V2_APPLICATION_VERSION, cliRunSummary_EpV2_AbsentById, consoleOutput);
  }

  public absentEpV2Event = ({ runId, rctxt, event }:{
    runId: string;
    rctxt: ICliRunAbsentEventByRunIdContext;
    event: EpSdkEvent;
  }) => {
    const consoleOutput = `
      Deleting Event '${event.name}'...
`;
    const cliRunSummary_EpV2_AbsentById: ICliRunSummary_EpV2_AbsentById = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.AbsentEpV2Event,
      runId,
      rctxt
    }
    this.log(ECliSummaryStatusCodes.ABSENT_EP_V2_EVENT, cliRunSummary_EpV2_AbsentById, consoleOutput);
  }

  public absentEpV2Application = ({ runId, rctxt, application }:{
    runId: string;
    rctxt: ICliRunAbsentApplicationByRunIdContext;
    application: Application;
  }) => {
    const consoleOutput = `
      Deleting Application '${application.name}'...
`;
    const cliRunSummary_EpV2_AbsentById: ICliRunSummary_EpV2_AbsentById = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.AbsentEpV2Application,
      runId,
      rctxt
    }
    this.log(ECliSummaryStatusCodes.ABSENT_EP_V2_APPLICATION, cliRunSummary_EpV2_AbsentById, consoleOutput);
  }

  public processingEpV2EventAbsentDone = ({ runId, rctxt }:{
    runId: string;
    rctxt: ICliRunAbsentEventByRunIdContext;
  }) => {
    const consoleOutput = `
      Done.
`;
    const cliRunSummary_EpV2_AbsentById: ICliRunSummary_EpV2_AbsentById = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.AbsentEpV2EventDone,
      runId,
      rctxt
    }
    this.log(ECliSummaryStatusCodes.ABSENT_EP_V2_EVENT, cliRunSummary_EpV2_AbsentById, consoleOutput);
  }
  
  public processingEpV2EventAbsentIssue = ({ issue }:{
    issue: ICliRunIssueAbsentById;
  }) => {
    const consoleOutput = `
      Issue deleting event. See log for details.
`;
    const cliRunSummary_EpV2_AbsentByIdIssue: ICliRunSummary_EpV2_AbsentByIdIssue = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.AbsentEpV2EventIssue,
      runId: issue.runId,
      issue
    }
    this.log(ECliSummaryStatusCodes.ABSENT_EP_V2_EVENT_ISSUE, cliRunSummary_EpV2_AbsentByIdIssue, consoleOutput);
  }

//   public processingEpV2ApplicationDomainsAbsentNoneFound = ({ runId }:{
//     runId: string;
//   }) => {
//     const consoleOutput = `
//     None found.
// `;
//     const cliRunSummary_EpV2_AbsentByIdNoneFound: ICliRunSummary_EpV2_AbsentByIdNoneFound = {
//       runMode: this.runMode,
//       type: ECliRunSummary_Type.ProcessingEpV2ApplicationDomainsByIdAbsentNoneFound,
//       runId,
//     }
//     this.log(ECliSummaryStatusCodes.PROCESSING_EP_V2_APPLICATION_DOMAINS_ABSENT_BY_ID_NONE_FOUND, cliRunSummary_EpV2_AbsentByIdNoneFound , consoleOutput);
//   }

  public processingEpV2ApplicationDomainsByPrefixAbsentNoneFound = () => {
    const consoleOutput = `
      No Application Domains found.  
`;
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V2_APPLICATION_DOMAINS_ABSENT_NONE_FOUND, { type: ECliRunSummary_Type.ProcessingEpV2ApplicationDomainsAbsentNoneFound }, consoleOutput);
  }

  public processedEpV2ApplicationDomainsAbsent = () => {
    const consoleOutput = `
    Deleting V2 Application Domains done.  
    `;
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V2_APPLICATION_DOMAINS_ABSENT_DONE, { type: ECliRunSummary_Type.ProcessingEpV2ApplicationDomainsAbsentDone }, consoleOutput);
  }

  public absentEpV2ApplicationDomain = ({ epSdkApplicationDomainTask_ExecuteReturn }: {
    epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn;
  }): void => {
    const applicationDomainName = epSdkApplicationDomainTask_ExecuteReturn.epObject.name;
    const consoleOutput = `
      V2: ${epSdkApplicationDomainTask_ExecuteReturn.epObject.type}: ${applicationDomainName} (${epSdkApplicationDomainTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action})
`;
    const cliRunSummary_Task_ApplicationDomain: Required<Omit<ICliRunSummary_Task_ApplicationDomain, "runMode" | "runState">> = {
      type: ECliRunSummary_Type.EpV2ApplicationDomain,
      applicationDomainName,
      action: epSdkApplicationDomainTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action
    };
    this.log(ECliSummaryStatusCodes.ABSENT_EP_V2_APPLICATION_DOMAIN, this.addTaskElements(cliRunSummary_Task_ApplicationDomain), consoleOutput);
  };

  public absentEpV2ApplicationByRunId = ({ runId, rctxt, applicationDomain }:{
    runId: string;
    rctxt: ICliRunAbsentApplicationDomainByRunIdContext;
    applicationDomain: ApplicationDomain;
  }) => {
    const consoleOutput = `
      Deleting Application Domain '${applicationDomain.name}'...
`;
    const cliRunSummary_EpV2_AbsentById: ICliRunSummary_EpV2_AbsentById = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.AbsentEpV2ApplicationDomain,
      runId,
      rctxt
    }
    this.log(ECliSummaryStatusCodes.ABSENT_EP_V2_APPLICATION_DOMAIN, cliRunSummary_EpV2_AbsentById, consoleOutput);
  }

  public presentEpV2ApplicationDomain = ({ epSdkApplicationDomainTask_ExecuteReturn }: {
    epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn;
  }): void => {
    const applicationDomainName = epSdkApplicationDomainTask_ExecuteReturn.epObject.name;
    const consoleOutput = `
      V2: ${epSdkApplicationDomainTask_ExecuteReturn.epObject.type}: ${applicationDomainName} (${epSdkApplicationDomainTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action})
`;
    const cliRunSummary_Task_ApplicationDomain: Required<Omit<ICliRunSummary_Task_ApplicationDomain, "runMode" | "runState">> = {
      type: ECliRunSummary_Type.EpV2ApplicationDomain,
      applicationDomainName,
      action: epSdkApplicationDomainTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action
    };
    this.log(ECliSummaryStatusCodes.PRESENT_EP_V2_APPLICATION_DOMAIN, this.addTaskElements(cliRunSummary_Task_ApplicationDomain), consoleOutput);
  };

  public presentEpV2EnumApplicationDomain = ({ epSdkApplicationDomainTask_ExecuteReturn }: {
    epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn;
  }): void => {
    const applicationDomainName = epSdkApplicationDomainTask_ExecuteReturn.epObject.name;
    const consoleOutput = `
      V2: ${epSdkApplicationDomainTask_ExecuteReturn.epObject.type}: ${applicationDomainName} (${epSdkApplicationDomainTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action})
`;
    const cliRunSummary_Task_ApplicationDomain: Required<Omit<ICliRunSummary_Task_EnumApplicationDomain, "runMode" | "runState">> = {
      type: ECliRunSummary_Type.EpV2EnumApplicationDomain,
      applicationDomainName,
      action: epSdkApplicationDomainTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action
    };
    this.log(ECliSummaryStatusCodes.PRESENT_EP_V2_ENUM_APPLICATION_DOMAIN, this.addTaskElements(cliRunSummary_Task_ApplicationDomain), consoleOutput);
  };

  public processingEpV1Enums = () => {
    const consoleOutput = `
  Processing V1 Enums ...  
`;
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V1_ENUMS, { type: ECliRunSummary_Type.ProcessingEpV1Enums }, consoleOutput);
  }

  public processingEpV1EnumsDone = () => {
    const consoleOutput = `
  Processing V1 Enums done.  
    `;
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V1_ENUMS_DONE, { type: ECliRunSummary_Type.ProcessingEpV1EnumsDone }, consoleOutput);
  }

  public processingEpV1EnumsNoneFound = () => {
    const consoleOutput = `
        No Enums found.  
`;
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V1_ENUMS_NONE_FOUND, { type: ECliRunSummary_Type.ProcessingEpV1EnumsNoneFound }, consoleOutput);
  }

  public processingEpV1Enum = ({ enumName }:{
    enumName: string;
  }) => {
    const consoleOutput = `
    Processing V1 Enum '${enumName}' ...  
`;
    const cliRunSummary_EpV1_Enum: ICliRunSummary_EpV1_Enum = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.ProcessingEpV1Enum,
      epV1ObjectType: ECliEpV1Object_Types.EpV1Enum,
      enumName,
    }
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V1_ENUM, cliRunSummary_EpV1_Enum, consoleOutput);
  }

  public presentEpV2Enum = ({ applicationDomainName, epSdkEnumTask_ExecuteReturn }: {
    applicationDomainName: string;
    epSdkEnumTask_ExecuteReturn: IEpSdkEnumTask_ExecuteReturn;
  }): void => {
    const consoleOutput = `
      V2: ${epSdkEnumTask_ExecuteReturn.epObject.type}: ${epSdkEnumTask_ExecuteReturn.epObject.name}, shared=${epSdkEnumTask_ExecuteReturn.epObject.shared} (${epSdkEnumTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action})
`;
    const cliRunSummary_Task_Enum: ICliRunSummary_Task_Enum = { 
      type: ECliRunSummary_Type.EpV2Enum, 
      name: epSdkEnumTask_ExecuteReturn.epObject.name ? epSdkEnumTask_ExecuteReturn.epObject.name : "undefined",
      shared: epSdkEnumTask_ExecuteReturn.epObject.shared || "undefined",
      action: epSdkEnumTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action,
      applicationDomainName,
    };
    this.log(ECliSummaryStatusCodes.PRESENT_EP_V2_ENUM, this.addTaskElements(cliRunSummary_Task_Enum), consoleOutput );
  };

  public presentEpV2EnumVersion = ({ applicationDomainName, epSdkEnumVersionTask_ExecuteReturn }:{
    applicationDomainName: string;
    epSdkEnumVersionTask_ExecuteReturn: IEpSdkEnumVersionTask_ExecuteReturn;
  }) => {
    this.presentEpV2VersionObject(ECliSummaryStatusCodes.PRESENT_EP_V2_ENUM_VERSION, applicationDomainName, epSdkEnumVersionTask_ExecuteReturn);
  }

  public processingEpV1Schemas = (epV1ApplicationDomainName: string) => {
    const consoleOutput = `\n
  Processing V1 Schemas for Application Domain '${epV1ApplicationDomainName}' ...  
`;
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V1_SCHEMAS, { type: ECliRunSummary_Type.ProcessingEpV1Schemas }, consoleOutput);
  }

  public processingEpV1SchemasDone = (epV1ApplicationDomainName: string) => {
    const consoleOutput = `\n
  Processing V1 Schemas for Application Domain '${epV1ApplicationDomainName}' done.  
    `;
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V1_SCHEMAS_DONE, { type: ECliRunSummary_Type.ProcessingEpV1SchemasDone }, consoleOutput);
  }

  public processingEpV1SchemasNoneFound = () => {
    const consoleOutput = `
      No Schemas found.  
`;
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V1_SCHEMAS_NONE_FOUND, { type: ECliRunSummary_Type.ProcessingEpV1SchemasNoneFound }, consoleOutput);
  }

  public processingEpV1Schema = ({ schemaName }:{
    schemaName: string;
  }) => {
    const consoleOutput = `
    Processing V1 Schema '${schemaName}' ...  
`;
    const cliRunSummary_EpV1_Schema: ICliRunSummary_EpV1_Schema = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.ProcessingEpV1Schema,
      epV1ObjectType: ECliEpV1Object_Types.EpV1Schema,
      schemaName,
    }
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V1_SCHEMA, cliRunSummary_EpV1_Schema, consoleOutput);
  }
  public processingEpV1SchemaIssue = ({ rctxt }:{
    rctxt?: ICliSchemaRunContext;
  }) => {
    const consoleOutput = `
      Issue migrating schema. See log for details.
`;
    const cliRunSummary_EpV1_Schema: ICliRunSummary_EpV1_Schema = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.ProcessingEpV1SchemaIssue,
      epV1ObjectType: ECliEpV1Object_Types.EpV1Schema,
      schemaName: rctxt ? rctxt.epV1.epV1EventSchema.name : 'undefined'
    }
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V1_SCHEMA_ISSUE, cliRunSummary_EpV1_Schema, consoleOutput);
  }

  public presentEpV2Schema = ({ applicationDomainName, epSdkSchemaTask_ExecuteReturn }: {
    applicationDomainName: string;
    epSdkSchemaTask_ExecuteReturn: IEpSdkSchemaTask_ExecuteReturn;
  }): void => {
    const consoleOutput = `
      V2: ${epSdkSchemaTask_ExecuteReturn.epObject.type}: ${epSdkSchemaTask_ExecuteReturn.epObject.name}, shared=${epSdkSchemaTask_ExecuteReturn.epObject.shared} (${epSdkSchemaTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action})
`;
    const cliRunSummary_Task_Schema: ICliRunSummary_Task_Schema = { 
      type: ECliRunSummary_Type.EpV2Schema, 
      name: epSdkSchemaTask_ExecuteReturn.epObject.name ? epSdkSchemaTask_ExecuteReturn.epObject.name : "undefined",
      shared: epSdkSchemaTask_ExecuteReturn.epObject.shared || "undefined",
      action: epSdkSchemaTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action,
      applicationDomainName,
    };
    this.log(ECliSummaryStatusCodes.PRESENT_EP_V2_SCHEMA, this.addTaskElements(cliRunSummary_Task_Schema), consoleOutput );
  };

  public presentEpV2SchemaVersion = ({ applicationDomainName, epSdkSchemaVersionTask_ExecuteReturn }:{
    applicationDomainName: string;
    epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn;
  }) => {
    this.presentEpV2VersionObject(ECliSummaryStatusCodes.PRESENT_EP_V2_SCHEMA_VERSION, applicationDomainName, epSdkSchemaVersionTask_ExecuteReturn);
  }

  public processingEpV2SchemasAbsentStart = ({ runId }:{
    runId: string;
  }) => {
    const consoleOutput = `
  Processing V2 Schemas for deletion (runId=${runId}) ...
`;
    const ICliRunSummary_EpV2_AbsentByIdStart: ICliRunSummary_EpV2_AbsentByIdStart = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.ProcessingEpV2SchemasByIdAbsentStart,
      runId,
    }
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V2_SCHEMAS_ABSENT_BY_ID_START, ICliRunSummary_EpV2_AbsentByIdStart , consoleOutput);
  }

  public processingEpV2EnumsAbsentStart = ({ runId }:{
    runId: string;
  }) => {
    const consoleOutput = `
  Processing V2 Enums for deletion (runId=${runId}) ...
`;
    const ICliRunSummary_EpV2_AbsentByIdStart: ICliRunSummary_EpV2_AbsentByIdStart = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.ProcessingEpV2EnumsByIdAbsentStart,
      runId,
    }
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V2_ENUMS_ABSENT_BY_ID_START, ICliRunSummary_EpV2_AbsentByIdStart , consoleOutput);
  }

  public processingEpV2SchemaAbsentStart = ({ runId, rctxt }:{
    runId: string;
    rctxt: ICliRunAbsentSchemaByRunIdContext;
  }) => {
    const consoleOutput = `
    Processing Schema '${rctxt.schemaName}' in '${rctxt.applicationDomainName}' ...
`;
    const cliRunSummary_EpV2_AbsentById: ICliRunSummary_EpV2_AbsentById = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.ProcessingAbsentEpV2Schema,
      runId,
      rctxt
    }
    this.log(ECliSummaryStatusCodes.PROCESSING_ABSENT_EP_V2_SCHEMA, cliRunSummary_EpV2_AbsentById, consoleOutput);
  }
  
  public processingEpV2EnumAbsentStart = ({ runId, rctxt }:{
    runId: string;
    rctxt: ICliRunAbsentEnumByRunIdContext;
  }) => {
    const consoleOutput = `
    Processing Enum '${rctxt.enumName}' in '${rctxt.applicationDomainName}' ...
`;
    const cliRunSummary_EpV2_AbsentById: ICliRunSummary_EpV2_AbsentById = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.ProcessingAbsentEpV2Enum,
      runId,
      rctxt
    }
    this.log(ECliSummaryStatusCodes.PROCESSING_ABSENT_EP_V2_ENUM, cliRunSummary_EpV2_AbsentById, consoleOutput);
  }

  public absentEpV2SchemaVersion = ({ runId, rctxt, schemaVersion }:{
    runId: string;
    rctxt: ICliRunAbsentSchemaByRunIdContext;
    schemaVersion: SchemaVersion;
  }) => {
    const consoleOutput = `
      Deleting Schema Version '${schemaVersion.version}'.
`;
    const cliRunSummary_EpV2_AbsentById: ICliRunSummary_EpV2_AbsentById = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.AbsentEpV2SchemaVersion,
      runId,
      rctxt
    }
    this.log(ECliSummaryStatusCodes.ABSENT_EP_V2_SCHEMA_VERSION, cliRunSummary_EpV2_AbsentById, consoleOutput);
  }

  public absentEpV2EnumVersion = ({ runId, rctxt, topicAddressEnumVersion }:{
    runId: string;
    rctxt: ICliRunAbsentEnumByRunIdContext;
    topicAddressEnumVersion: TopicAddressEnumVersion;
  }) => {
    const consoleOutput = `
      Deleting Enum Version '${topicAddressEnumVersion.version}'.
`;
    const cliRunSummary_EpV2_AbsentById: ICliRunSummary_EpV2_AbsentById = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.AbsentEpV2EnumVersion,
      runId,
      rctxt
    }
    this.log(ECliSummaryStatusCodes.ABSENT_EP_V2_ENUM_VERSION, cliRunSummary_EpV2_AbsentById, consoleOutput);
  }

  public absentEpV2Schema = ({ runId, rctxt, schemaObject }:{
    runId: string;
    rctxt: ICliRunAbsentSchemaByRunIdContext;
    schemaObject: SchemaObject;
  }) => {
    const consoleOutput = `
      Deleting Schema '${schemaObject.name}'...
`;
    const cliRunSummary_EpV2_AbsentById: ICliRunSummary_EpV2_AbsentById = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.AbsentEpV2Schema,
      runId,
      rctxt
    }
    this.log(ECliSummaryStatusCodes.ABSENT_EP_V2_SCHEMA, cliRunSummary_EpV2_AbsentById, consoleOutput);
  }

  public absentEpV2Enum = ({ runId, rctxt, topicAddressEnum }:{
    runId: string;
    rctxt: ICliRunAbsentEnumByRunIdContext;
    topicAddressEnum: TopicAddressEnum;
  }) => {
    const consoleOutput = `
      Deleting Enum '${topicAddressEnum.name}'...
`;
    const cliRunSummary_EpV2_AbsentById: ICliRunSummary_EpV2_AbsentById = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.AbsentEpV2Enum,
      runId,
      rctxt
    }
    this.log(ECliSummaryStatusCodes.ABSENT_EP_V2_ENUM, cliRunSummary_EpV2_AbsentById, consoleOutput);
  }

  public processingEpV2SchemaAbsentDone = ({ runId, rctxt }:{
    runId: string;
    rctxt: ICliRunAbsentSchemaByRunIdContext;
  }) => {
    const consoleOutput = `
      Done.
`;
    const cliRunSummary_EpV2_AbsentById: ICliRunSummary_EpV2_AbsentById = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.AbsentEpV2SchemaDone,
      runId,
      rctxt
    }
    this.log(ECliSummaryStatusCodes.ABSENT_EP_V2_SCHEMA, cliRunSummary_EpV2_AbsentById, consoleOutput);
  }
  
  public processingEpV2EnumAbsentDone = ({ runId, rctxt }:{
    runId: string;
    rctxt: ICliRunAbsentEnumByRunIdContext;
  }) => {
    const consoleOutput = `
      Done.
`;
    const cliRunSummary_EpV2_AbsentById: ICliRunSummary_EpV2_AbsentById = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.AbsentEpV2EnumDone,
      runId,
      rctxt
    }
    this.log(ECliSummaryStatusCodes.ABSENT_EP_V2_ENUM, cliRunSummary_EpV2_AbsentById, consoleOutput);
  }

  public processingEpV2SchemaAbsentIssue = ({ issue }:{
    issue: ICliRunIssueAbsentById;
  }) => {
    const consoleOutput = `
      Issue deleting schema. See log for details.
`;
    const cliRunSummary_EpV2_AbsentByIdIssue: ICliRunSummary_EpV2_AbsentByIdIssue = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.AbsentEpV2SchemaIssue,
      runId: issue.runId,
      issue
    }
    this.log(ECliSummaryStatusCodes.ABSENT_EP_V2_SCHEMA_ISSUE, cliRunSummary_EpV2_AbsentByIdIssue, consoleOutput);
  }

  public processingEpV2EnumAbsentIssue = ({ issue }:{
    issue: ICliRunIssueAbsentById;
  }) => {
    const consoleOutput = `
      Issue deleting enum. See log for details.
`;
    const cliRunSummary_EpV2_AbsentByIdIssue: ICliRunSummary_EpV2_AbsentByIdIssue = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.AbsentEpV2EnumIssue,
      runId: issue.runId,
      issue
    }
    this.log(ECliSummaryStatusCodes.ABSENT_EP_V2_ENUM_ISSUE, cliRunSummary_EpV2_AbsentByIdIssue, consoleOutput);
  }

  public processingEpV1Events = (epV1ApplicationDomainName: string) => {
    const consoleOutput = `\n
  Processing V1 Events for Application Domain '${epV1ApplicationDomainName}' ...  
`;
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V1_EVENTS, { type: ECliRunSummary_Type.ProcessingEpV1Events }, consoleOutput);
  }

  public processingEpV1EventsDone = (epV1ApplicationDomainName: string) => {
    const consoleOutput = `\n
  Processing V1 Events for Application Domain '${epV1ApplicationDomainName}' done.  
    `;
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V1_EVENTS_DONE, { type: ECliRunSummary_Type.ProcessingEpV1EventsDone }, consoleOutput);
  }

  public processingEpV1EventsNoneFound = () => {
    const consoleOutput = `
      No Events found.  
`;
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V1_EVENTS_NONE_FOUND, { type: ECliRunSummary_Type.ProcessingEpV1EventsNoneFound }, consoleOutput);
  }

  public processingEpV1Event = ({ eventName }:{
    eventName: string;
  }) => {
    const consoleOutput = `
    Processing V1 Event '${eventName}' ...  
`;
    const cliRunSummary_EpV1_Event: ICliRunSummary_EpV1_Event = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.ProcessingEpV1Event,
      epV1ObjectType: ECliEpV1Object_Types.EpV1Event,
      eventName,
    }
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V1_EVENT, cliRunSummary_EpV1_Event, consoleOutput);
  }
  public processingEpV1EventIssue = ({ rctxt }:{
    rctxt?: ICliEventRunContext;
  }) => {
    const consoleOutput = `
      Issue migrating event. See log for details.
`;
    const cliRunSummary_EpV1_Event: ICliRunSummary_EpV1_Event = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.ProcessingEpV1EventIssue,
      epV1ObjectType: ECliEpV1Object_Types.EpV1Event,
      eventName: rctxt ? rctxt.epV1.epV1Event.name : 'undefined'
    }
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V1_EVENT_ISSUE, cliRunSummary_EpV1_Event, consoleOutput);
  }

  public presentEpV2Event = ({ applicationDomainName, epSdkEpEventTask_ExecuteReturn }: {
    applicationDomainName: string;
    epSdkEpEventTask_ExecuteReturn: IEpSdkEpEventTask_ExecuteReturn;
  }): void => {
    const consoleOutput = `
      V2: ${epSdkEpEventTask_ExecuteReturn.epObject.type}: ${epSdkEpEventTask_ExecuteReturn.epObject.name}, shared=${epSdkEpEventTask_ExecuteReturn.epObject.shared} (${epSdkEpEventTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action})
`;
    const cliRunSummary_Task_Event: ICliRunSummary_Task_Event = { 
      type: ECliRunSummary_Type.EpV2Event, 
      name: epSdkEpEventTask_ExecuteReturn.epObject.name ? epSdkEpEventTask_ExecuteReturn.epObject.name : "undefined",
      shared: epSdkEpEventTask_ExecuteReturn.epObject.shared || "undefined",
      action: epSdkEpEventTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action,
      applicationDomainName,
    };
    this.log(ECliSummaryStatusCodes.PRESENT_EP_V2_EVENT, this.addTaskElements(cliRunSummary_Task_Event), consoleOutput );
  };

  public presentEpV2EventVersion = ({ applicationDomainName, epSdkEpEventVersionTask_ExecuteReturn }:{
    applicationDomainName: string;
    epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn;
  }) => {
    this.presentEpV2VersionObject(ECliSummaryStatusCodes.PRESENT_EP_V2_EVENT_VERSION, applicationDomainName, epSdkEpEventVersionTask_ExecuteReturn);
  }

  public processingEpV1Applications = (epV1ApplicationDomainName: string) => {
    const consoleOutput = `\n
  Processing V1 Applications for Application Domain '${epV1ApplicationDomainName}' ...  
`;
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V1_APPLICATIONS, { type: ECliRunSummary_Type.ProcessingEpV1Applications }, consoleOutput);
  }

  public processingEpV1ApplicationsDone = (epV1ApplicationDomainName: string) => {
    const consoleOutput = `\n
  Processing V1 Applications for Application Domain '${epV1ApplicationDomainName}' done.  
    `;
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V1_APPLICATIONS_DONE, { type: ECliRunSummary_Type.ProcessingEpV1ApplicationsDone }, consoleOutput);
  }

  public processingEpV1ApplicationsNoneFound = () => {
    const consoleOutput = `
      No Applications found.  
`;
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V1_APPLICATIONS_NONE_FOUND, { type: ECliRunSummary_Type.ProcessingEpV1ApplicationsNoneFound }, consoleOutput);
  }

  public processingEpV1Application = ({ applicationName }:{
    applicationName: string;
  }) => {
    const consoleOutput = `
    Processing V1 Application '${applicationName}' ...  
`;
    const cliRunSummary_EpV1_Application: ICliRunSummary_EpV1_Application = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.ProcessingEpV1Application,
      epV1ObjectType: ECliEpV1Object_Types.EpV1Application,
      applicationName,
    }
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V1_APPLICATION, cliRunSummary_EpV1_Application, consoleOutput);
  }
  public processingEpV1ApplicationIssue = ({ rctxt }:{
    rctxt?: ICliApplicationRunContext;
  }) => {
    const consoleOutput = `
      Issue migrating application. See log for details.
`;
    const cliRunSummary_EpV1_Application: ICliRunSummary_EpV1_Application = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.ProcessingEpV1ApplicationIssue,
      epV1ObjectType: ECliEpV1Object_Types.EpV1Application,
      applicationName: rctxt ? rctxt.epV1.epV1Application.name : 'undefined'
    }
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V1_APPLICATION_ISSUE, cliRunSummary_EpV1_Application, consoleOutput);
  }

  public presentEpV2Application = ({ applicationDomainName, epSdkApplicationTask_ExecuteReturn }: {
    applicationDomainName: string;
    epSdkApplicationTask_ExecuteReturn: IEpSdkApplicationTask_ExecuteReturn;
  }): void => {
    const consoleOutput = `
      V2: ${epSdkApplicationTask_ExecuteReturn.epObject.type}: ${epSdkApplicationTask_ExecuteReturn.epObject.name} (${epSdkApplicationTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action})
`;
    const cliRunSummary_Task_Application: ICliRunSummary_Task_Application = { 
      type: ECliRunSummary_Type.EpV2Application, 
      name: epSdkApplicationTask_ExecuteReturn.epObject.name ? epSdkApplicationTask_ExecuteReturn.epObject.name : "undefined",
      action: epSdkApplicationTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action,
      applicationDomainName,
    };
    this.log(ECliSummaryStatusCodes.PRESENT_EP_V2_APPLICATION, this.addTaskElements(cliRunSummary_Task_Application), consoleOutput );
  };

  public presentEpV2ApplicationVersion = ({ applicationDomainName, epSdkApplicationVersionTask_ExecuteReturn }:{
    applicationDomainName: string;
    epSdkApplicationVersionTask_ExecuteReturn: IEpSdkApplicationVersionTask_ExecuteReturn;
  }) => {
    this.presentEpV2VersionObject(ECliSummaryStatusCodes.PRESENT_EP_V2_APPLICATION_VERSION, applicationDomainName, epSdkApplicationVersionTask_ExecuteReturn);
  }

  public createMigrateSummaryPresent = (cliMigrateManagerMode: ECliMigrateManagerMode): ICliMigrateSummaryPresent => {
    const funcName = "createMigrateSummaryPresent";
    const logName = `${CliRunSummary.name}.${funcName}()`;

    const cliRunSummary_LogBase_List: Array<ICliRunSummary_LogBase> = this.getSummaryLogList();
    let cliRunSummary_LogBase_Filtered_List: Array<ICliRunSummary_LogBase> = [];

    switch (cliMigrateManagerMode) {
      case ECliMigrateManagerMode.RELEASE_MODE:
        cliRunSummary_LogBase_Filtered_List = cliRunSummary_LogBase_List.filter((cliRunSummary_LogBase: ICliRunSummary_LogBase) => {
          return ( cliRunSummary_LogBase.runMode === ECliRunContext_RunMode.RELEASE );
        });
        break;
      default:
        CliUtils.assertNever(logName, cliMigrateManagerMode);
    }

    // application domains
    const cliRunSummary_ProcessedEpV1ApplicationDomain_List: Array<ICliRunSummary_EpV1_ApplicatonDomain> = cliRunSummary_LogBase_Filtered_List.filter((cliRunSummary_LogBase: ICliRunSummary_LogBase) => {
      return cliRunSummary_LogBase.type === ECliRunSummary_Type.ProcessingEpV1ApplicationDomain;
    }) as unknown as Array<ICliRunSummary_EpV1_ApplicatonDomain>;
    const cliRunSummary_EpV2EnumApplicationDomain_List: Array<ICliRunSummary_Task_EnumApplicationDomain> = cliRunSummary_LogBase_Filtered_List.filter((cliRunSummary_LogBase: ICliRunSummary_LogBase) => {
      return (cliRunSummary_LogBase.type === ECliRunSummary_Type.EpV2EnumApplicationDomain);
    }) as unknown as Array<ICliRunSummary_Task_EnumApplicationDomain>;
    const cliRunSummary_EpV2ApplicationDomain_List: Array<ICliRunSummary_Task_ApplicationDomain> = cliRunSummary_LogBase_Filtered_List.filter((cliRunSummary_LogBase: ICliRunSummary_LogBase) => {
      return (cliRunSummary_LogBase.type === ECliRunSummary_Type.EpV2ApplicationDomain);
    }) as unknown as Array<ICliRunSummary_Task_ApplicationDomain>;
    // all created EpV2 version objects
    const cliRunSummary_CreatedEpV2VersionObject_List: Array<ICliRunSummary_Task_VersionObject> = cliRunSummary_LogBase_Filtered_List.filter((cliRunSummary_LogBase: ICliRunSummary_LogBase) => {
      if(cliRunSummary_LogBase.type === ECliRunSummary_Type.EpV2VersionObject) {
        const cliRunSummary_Task_VersionObject: ICliRunSummary_Task_VersionObject = cliRunSummary_LogBase as unknown as ICliRunSummary_Task_VersionObject;
        if(cliRunSummary_Task_VersionObject.action === EEpSdkTask_Action.CREATE_FIRST_VERSION || cliRunSummary_Task_VersionObject.action === EEpSdkTask_Action.CREATE_NEW_VERSION) return true;
        return false;
      }
      return false;
    }) as unknown as Array<ICliRunSummary_Task_VersionObject>;
    // enums
    const cliRunSummary_ProcessedEpV1Enum_List: Array<ICliRunSummary_EpV1_Enum> = cliRunSummary_LogBase_Filtered_List.filter((cliRunSummary_LogBase: ICliRunSummary_LogBase) => {
      return cliRunSummary_LogBase.type === ECliRunSummary_Type.ProcessingEpV1Enum;
    }) as unknown as Array<ICliRunSummary_EpV1_Enum>;
    // schemas
    const cliRunSummary_ProcessedEpV1Schema_List: Array<ICliRunSummary_EpV1_Schema> = cliRunSummary_LogBase_Filtered_List.filter((cliRunSummary_LogBase: ICliRunSummary_LogBase) => {
      return cliRunSummary_LogBase.type === ECliRunSummary_Type.ProcessingEpV1Schema;
    }) as unknown as Array<ICliRunSummary_EpV1_Schema>;
    // events
    const cliRunSummary_ProcessedEpV1Event_List: Array<ICliRunSummary_EpV1_Event> = cliRunSummary_LogBase_Filtered_List.filter((cliRunSummary_LogBase: ICliRunSummary_LogBase) => {
      return cliRunSummary_LogBase.type === ECliRunSummary_Type.ProcessingEpV1Event;
    }) as unknown as Array<ICliRunSummary_EpV1_Event>;
    // applications
    const cliRunSummary_ProcessedEpV1Application_List: Array<ICliRunSummary_EpV1_Application> = cliRunSummary_LogBase_Filtered_List.filter((cliRunSummary_LogBase: ICliRunSummary_LogBase) => {
      return cliRunSummary_LogBase.type === ECliRunSummary_Type.ProcessingEpV1Application;
    }) as unknown as Array<ICliRunSummary_EpV1_Application>;

    // counters
    // application domains
    const processedEpV1ApplicationDomains = cliRunSummary_ProcessedEpV1ApplicationDomain_List.length;
    const createdEpV2ApplicationDomains = cliRunSummary_EpV2ApplicationDomain_List.reduce((count, item) => count + Number(item.action === EEpSdkTask_Action.CREATE), 0);
    const updatedEpV2ApplicationDomains = cliRunSummary_EpV2ApplicationDomain_List.reduce((count, item) => count + Number(item.action === EEpSdkTask_Action.UPDATE), 0);
    // enums
    const createdEpV2EnumApplicationDomains = cliRunSummary_EpV2EnumApplicationDomain_List.reduce((count, item) => count + Number(item.action === EEpSdkTask_Action.CREATE), 0);
    const updatedEpV2EnumApplicationDomains = cliRunSummary_EpV2EnumApplicationDomain_List.reduce((count, item) => count + Number(item.action === EEpSdkTask_Action.UPDATE), 0);
    const processedEpV1Enums = cliRunSummary_ProcessedEpV1Enum_List.length;
    const createdFirstEpV2EnumVersions = cliRunSummary_CreatedEpV2VersionObject_List.reduce((count, item) => count + Number(item.action === EEpSdkTask_Action.CREATE_FIRST_VERSION && item.epObjectType === EEpSdkObjectTypes.ENUM_VERSION), 0);
    const createdNewEpV2EnumVersions = cliRunSummary_CreatedEpV2VersionObject_List.reduce((count, item) => count + Number(item.action === EEpSdkTask_Action.CREATE_NEW_VERSION && item.epObjectType === EEpSdkObjectTypes.ENUM_VERSION), 0);
    // schemas
    const processedEpV1Schemas = cliRunSummary_ProcessedEpV1Schema_List.length;
    const processingIssuesEpV1Schemas = CliRunIssues.get({ type: ECliRunIssueTypes.SchemaIssue }).length;
    const createdFirstEpV2SchemaVersions = cliRunSummary_CreatedEpV2VersionObject_List.reduce((count, item) => count + Number(item.action === EEpSdkTask_Action.CREATE_FIRST_VERSION && item.epObjectType === EEpSdkObjectTypes.SCHEMA_VERSION), 0);
    const createdNewEpV2SchemaVersions = cliRunSummary_CreatedEpV2VersionObject_List.reduce((count, item) => count + Number(item.action === EEpSdkTask_Action.CREATE_NEW_VERSION && item.epObjectType === EEpSdkObjectTypes.SCHEMA_VERSION), 0);
    // events
    const processedEpV1Events = cliRunSummary_ProcessedEpV1Event_List.length;
    const processingIssuesEpV1Events = CliRunIssues.get({ type: ECliRunIssueTypes.EventIssue }).length;
    const createdFirstEpV2EventVersions = cliRunSummary_CreatedEpV2VersionObject_List.reduce((count, item) => count + Number(item.action === EEpSdkTask_Action.CREATE_FIRST_VERSION && item.epObjectType === EEpSdkObjectTypes.EVENT_VERSION), 0);
    const createdNewEpV2EventVersions = cliRunSummary_CreatedEpV2VersionObject_List.reduce((count, item) => count + Number(item.action === EEpSdkTask_Action.CREATE_NEW_VERSION && item.epObjectType === EEpSdkObjectTypes.EVENT_VERSION), 0);
    // applications
    const processedEpV1Applications = cliRunSummary_ProcessedEpV1Application_List.length;
    const processingIssuesEpV1Applications = CliRunIssues.get({ type: ECliRunIssueTypes.ApplicationIssue }).length;
    const createdFirstEpV2ApplicationVersions = cliRunSummary_CreatedEpV2VersionObject_List.reduce((count, item) => count + Number(item.action === EEpSdkTask_Action.CREATE_FIRST_VERSION && item.epObjectType === EEpSdkObjectTypes.APPLICATION_VERSION), 0);
    const createdNewEpV2ApplicationVersions = cliRunSummary_CreatedEpV2VersionObject_List.reduce((count, item) => count + Number(item.action === EEpSdkTask_Action.CREATE_NEW_VERSION && item.epObjectType === EEpSdkObjectTypes.APPLICATION_VERSION), 0);

    const logFile: string | undefined = CliConfig.getCliConfig().cliLoggerConfig.logFile;

    return {
      type: ECliRunSummary_Type.MigrateSummaryPresent,
      timestamp: Date.now(),
      logFile: logFile ? logFile : "no log file.",
      processedEpV1ApplicationDomains,
      createdEpV2ApplicationDomains,
      updatedEpV2ApplicationDomains,
      createdEpV2EnumApplicationDomains,
      updatedEpV2EnumApplicationDomains,
      processedEpV1Enums,
      createdFirstEpV2EnumVersions,
      createdNewEpV2EnumVersions,
      processedEpV1Schemas,
      processingIssuesEpV1Schemas,
      createdFirstEpV2SchemaVersions,
      createdNewEpV2SchemaVersions,
      processedEpV1Events,
      processingIssuesEpV1Events,
      createdFirstEpV2EventVersions,
      createdNewEpV2EventVersions,
      processedEpV1Applications,
      processingIssuesEpV1Applications,
      createdFirstEpV2ApplicationVersions,
      createdNewEpV2ApplicationVersions
      // warnings: cliRunSummary_CreatedVersionObjectWarning_List,
      // errors: cliRunSummary_CreatedVersionObjectError_List,
    };
  };

  private processedMigrationPresent = (logName: string, cliMigrateManagerOptions: ICliMigrateManagerOptions) => {
    CliLogger.info(CliLogger.createLogEntry(logName, {code: ECliStatusCodes.MIGRATE_PRESENT_DONE, details: {
      runMode: this.runMode,
      summaryLogList: this.getSummaryLogList(), 
    }}));
    const cliMigrateSummary: ICliMigrateSummaryPresent = this.createMigrateSummaryPresent(cliMigrateManagerOptions.cliMigrateManagerMode);
    CliLogger.info(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.MIGRATE_PRESENT_DONE, details: {
      runMode: this.runMode,
      cliMigrateSummary,
    }}));

    const consoleOutput = `

------------------------------------------------------------------------------------------------    
Migration Summary for run: ${cliMigrateManagerOptions.cliMigrateManagerRunState}

  Log file: ${cliMigrateSummary.logFile}
  Run Id: ${cliMigrateManagerOptions.runId}

  Processed EpV1 Enums: ${cliMigrateSummary.processedEpV1Enums}
    Created EpV2 Enum Application Domains: ${cliMigrateSummary.createdEpV2EnumApplicationDomains}
    Updated EpV2 Enum Application Domains: ${cliMigrateSummary.updatedEpV2EnumApplicationDomains}
    Created First EpV2 Enum Versions: ${cliMigrateSummary.createdFirstEpV2EnumVersions}
    Created New EpV2 Enum Versions: ${cliMigrateSummary.createdNewEpV2EnumVersions}
  Processed EpV1 Application Domains: ${cliMigrateSummary.processedEpV1ApplicationDomains}
    Created EpV2 Application Domains: ${cliMigrateSummary.createdEpV2ApplicationDomains}
    Updated EpV2 Application Domains: ${cliMigrateSummary.updatedEpV2ApplicationDomains}
  Processed EpV1 Schemas: ${cliMigrateSummary.processedEpV1Schemas}
    EpV1 Schema processing Issues: ${cliMigrateSummary.processingIssuesEpV1Schemas}
    Created First EpV2 Schema Versions: ${cliMigrateSummary.createdFirstEpV2SchemaVersions}
    Created New EpV2 Schema Versions: ${cliMigrateSummary.createdNewEpV2SchemaVersions}
  Processed EpV1 Events: ${cliMigrateSummary.processedEpV1Events}
    EpV1 Event processing Issues: ${cliMigrateSummary.processingIssuesEpV1Events}
    Created First EpV2 Event Versions: ${cliMigrateSummary.createdFirstEpV2EventVersions}
    Created New EpV2 Event Versions: ${cliMigrateSummary.createdNewEpV2EventVersions}
  Processed EpV1 Applications: ${cliMigrateSummary.processedEpV1Applications}
    EpV1 Applicatin processing Issues: ${cliMigrateSummary.processingIssuesEpV1Applications}
    Created First EpV2 Application Versions: ${cliMigrateSummary.createdFirstEpV2ApplicationVersions}
    Created New EpV2 Application Versions: ${cliMigrateSummary.createdNewEpV2ApplicationVersions}
  
    `;
    this.log(
      ECliSummaryStatusCodes.MIGRATE_SUMMARY_PRESENT,
      cliMigrateSummary,
      consoleOutput,
      true
    );
  };

  public createMigrateSummaryAbsent = (cliMigrateManagerMode: ECliMigrateManagerMode, absentRunId?: string): ICliMigrateSummaryAbsent => {
    const funcName = "createMigrateSummaryAbsent";
    const logName = `${CliRunSummary.name}.${funcName}()`;

    const cliRunSummary_LogBase_List: Array<ICliRunSummary_LogBase> = this.getSummaryLogList();
    let cliRunSummary_LogBase_Filtered_List: Array<ICliRunSummary_LogBase> = [];

    switch (cliMigrateManagerMode) {
      case ECliMigrateManagerMode.RELEASE_MODE:
        cliRunSummary_LogBase_Filtered_List = cliRunSummary_LogBase_List.filter((cliRunSummary_LogBase: ICliRunSummary_LogBase) => {
          return ( cliRunSummary_LogBase.runMode === ECliRunContext_RunMode.RELEASE );
        });
        break;
      default:
        CliUtils.assertNever(logName, cliMigrateManagerMode);
    }
    // application domains
    const cliRunSummary_EpV2ApplicationDomainsProcessed_List: Array<ICliRunSummary_EpV2_AbsentById> = cliRunSummary_LogBase_Filtered_List.filter((cliRunSummary_LogBase: ICliRunSummary_LogBase) => {
      return (cliRunSummary_LogBase.type === ECliRunSummary_Type.ProcessingAbsentEpV2ApplicationDomain);
    }) as unknown as Array<ICliRunSummary_EpV2_AbsentById>;
    const cliRunSummary_EpV2ApplicationDomainByPrefix_List: Array<ICliRunSummary_Task_ApplicationDomain> = cliRunSummary_LogBase_Filtered_List.filter((cliRunSummary_LogBase: ICliRunSummary_LogBase) => {
      return (cliRunSummary_LogBase.type === ECliRunSummary_Type.EpV2ApplicationDomain);
    }) as unknown as Array<ICliRunSummary_Task_ApplicationDomain>;
    const cliRunSummary_EpV2ApplicationDomain_List: Array<ICliRunSummary_EpV2_AbsentById> = cliRunSummary_LogBase_Filtered_List.filter((cliRunSummary_LogBase: ICliRunSummary_LogBase) => {
      return (cliRunSummary_LogBase.type === ECliRunSummary_Type.AbsentEpV2ApplicationDomain);
    }) as unknown as Array<ICliRunSummary_EpV2_AbsentById>;
    const cliRunSummary_EpV2ApplicationDomainIssue_List: Array<ICliRunSummary_EpV2_AbsentById> = cliRunSummary_LogBase_Filtered_List.filter((cliRunSummary_LogBase: ICliRunSummary_LogBase) => {
      return (cliRunSummary_LogBase.type === ECliRunSummary_Type.AbsentEpV2ApplicationDomainIssue);
    }) as unknown as Array<ICliRunSummary_EpV2_AbsentById>;
    // applications
    const cliRunSummary_EpV2ApplicationsProcessed_List: Array<ICliRunSummary_EpV2_AbsentById> = cliRunSummary_LogBase_Filtered_List.filter((cliRunSummary_LogBase: ICliRunSummary_LogBase) => {
      return (cliRunSummary_LogBase.type === ECliRunSummary_Type.ProcessingAbsentEpV2Application);
    }) as unknown as Array<ICliRunSummary_EpV2_AbsentById>;
    const cliRunSummary_EpV2Application_List: Array<ICliRunSummary_EpV2_AbsentById> = cliRunSummary_LogBase_Filtered_List.filter((cliRunSummary_LogBase: ICliRunSummary_LogBase) => {
      return (cliRunSummary_LogBase.type === ECliRunSummary_Type.AbsentEpV2Application);
    }) as unknown as Array<ICliRunSummary_EpV2_AbsentById>;
    const cliRunSummary_EpV2ApplicationVersion_List: Array<ICliRunSummary_EpV2_AbsentById> = cliRunSummary_LogBase_Filtered_List.filter((cliRunSummary_LogBase: ICliRunSummary_LogBase) => {
      return (cliRunSummary_LogBase.type === ECliRunSummary_Type.AbsentEpV2ApplicationVersion);
    }) as unknown as Array<ICliRunSummary_EpV2_AbsentById>;
    const cliRunSummary_EpV2ApplicationIssue_List: Array<ICliRunSummary_EpV2_AbsentById> = cliRunSummary_LogBase_Filtered_List.filter((cliRunSummary_LogBase: ICliRunSummary_LogBase) => {
      return (cliRunSummary_LogBase.type === ECliRunSummary_Type.AbsentEpV2ApplicationIssue);
    }) as unknown as Array<ICliRunSummary_EpV2_AbsentById>;
    // events
    const cliRunSummary_EpV2EventsProcessed_List: Array<ICliRunSummary_EpV2_AbsentById> = cliRunSummary_LogBase_Filtered_List.filter((cliRunSummary_LogBase: ICliRunSummary_LogBase) => {
      return (cliRunSummary_LogBase.type === ECliRunSummary_Type.ProcessingAbsentEpV2Event);
    }) as unknown as Array<ICliRunSummary_EpV2_AbsentById>;
    const cliRunSummary_EpV2Event_List: Array<ICliRunSummary_EpV2_AbsentById> = cliRunSummary_LogBase_Filtered_List.filter((cliRunSummary_LogBase: ICliRunSummary_LogBase) => {
      return (cliRunSummary_LogBase.type === ECliRunSummary_Type.AbsentEpV2Event);
    }) as unknown as Array<ICliRunSummary_EpV2_AbsentById>;
    const cliRunSummary_EpV2EventVersion_List: Array<ICliRunSummary_EpV2_AbsentById> = cliRunSummary_LogBase_Filtered_List.filter((cliRunSummary_LogBase: ICliRunSummary_LogBase) => {
      return (cliRunSummary_LogBase.type === ECliRunSummary_Type.AbsentEpV2EventVersion);
    }) as unknown as Array<ICliRunSummary_EpV2_AbsentById>;
    const cliRunSummary_EpV2EventIssue_List: Array<ICliRunSummary_EpV2_AbsentById> = cliRunSummary_LogBase_Filtered_List.filter((cliRunSummary_LogBase: ICliRunSummary_LogBase) => {
      return (cliRunSummary_LogBase.type === ECliRunSummary_Type.AbsentEpV2EventIssue);
    }) as unknown as Array<ICliRunSummary_EpV2_AbsentById>;
    // schemas
    const cliRunSummary_EpV2SchemasProcessed_List: Array<ICliRunSummary_EpV2_AbsentById> = cliRunSummary_LogBase_Filtered_List.filter((cliRunSummary_LogBase: ICliRunSummary_LogBase) => {
      return (cliRunSummary_LogBase.type === ECliRunSummary_Type.ProcessingAbsentEpV2Schema);
    }) as unknown as Array<ICliRunSummary_EpV2_AbsentById>;
    const cliRunSummary_EpV2Schema_List: Array<ICliRunSummary_EpV2_AbsentById> = cliRunSummary_LogBase_Filtered_List.filter((cliRunSummary_LogBase: ICliRunSummary_LogBase) => {
      return (cliRunSummary_LogBase.type === ECliRunSummary_Type.AbsentEpV2Schema);
    }) as unknown as Array<ICliRunSummary_EpV2_AbsentById>;
    const cliRunSummary_EpV2SchemaVersion_List: Array<ICliRunSummary_EpV2_AbsentById> = cliRunSummary_LogBase_Filtered_List.filter((cliRunSummary_LogBase: ICliRunSummary_LogBase) => {
      return (cliRunSummary_LogBase.type === ECliRunSummary_Type.AbsentEpV2SchemaVersion);
    }) as unknown as Array<ICliRunSummary_EpV2_AbsentById>;
    const cliRunSummary_EpV2SchemaIssue_List: Array<ICliRunSummary_EpV2_AbsentById> = cliRunSummary_LogBase_Filtered_List.filter((cliRunSummary_LogBase: ICliRunSummary_LogBase) => {
      return (cliRunSummary_LogBase.type === ECliRunSummary_Type.AbsentEpV2SchemaIssue);
    }) as unknown as Array<ICliRunSummary_EpV2_AbsentById>;
    // enums
    const cliRunSummary_EpV2EnumsProcessed_List: Array<ICliRunSummary_EpV2_AbsentById> = cliRunSummary_LogBase_Filtered_List.filter((cliRunSummary_LogBase: ICliRunSummary_LogBase) => {
      return (cliRunSummary_LogBase.type === ECliRunSummary_Type.ProcessingAbsentEpV2Enum);
    }) as unknown as Array<ICliRunSummary_EpV2_AbsentById>;
    const cliRunSummary_EpV2Enum_List: Array<ICliRunSummary_EpV2_AbsentById> = cliRunSummary_LogBase_Filtered_List.filter((cliRunSummary_LogBase: ICliRunSummary_LogBase) => {
      return (cliRunSummary_LogBase.type === ECliRunSummary_Type.AbsentEpV2Enum);
    }) as unknown as Array<ICliRunSummary_EpV2_AbsentById>;
    const cliRunSummary_EpV2EnumVersion_List: Array<ICliRunSummary_EpV2_AbsentById> = cliRunSummary_LogBase_Filtered_List.filter((cliRunSummary_LogBase: ICliRunSummary_LogBase) => {
      return (cliRunSummary_LogBase.type === ECliRunSummary_Type.AbsentEpV2EnumVersion);
    }) as unknown as Array<ICliRunSummary_EpV2_AbsentById>;
    const cliRunSummary_EpV2EnumIssue_List: Array<ICliRunSummary_EpV2_AbsentById> = cliRunSummary_LogBase_Filtered_List.filter((cliRunSummary_LogBase: ICliRunSummary_LogBase) => {
      return (cliRunSummary_LogBase.type === ECliRunSummary_Type.AbsentEpV2EnumIssue);
    }) as unknown as Array<ICliRunSummary_EpV2_AbsentById>;

    // counters
    const processedEpV2ApplicationDomains = cliRunSummary_EpV2ApplicationDomainsProcessed_List.length;
    let deletedEpV2ApplicationDomains = 0;
    if(absentRunId) {
      deletedEpV2ApplicationDomains = cliRunSummary_EpV2ApplicationDomain_List.length;
    } else {
      deletedEpV2ApplicationDomains = cliRunSummary_EpV2ApplicationDomainByPrefix_List.reduce((count, item) => count + Number(item.action === EEpSdkTask_Action.DELETE), 0);
    }
    const processingEpV2ApplicationDomainIssues = cliRunSummary_EpV2ApplicationDomainIssue_List.length;
  
    const processedEpV2Applications = cliRunSummary_EpV2ApplicationsProcessed_List.length;
    const deletedEpV2Applications = cliRunSummary_EpV2Application_List.length;
    const deletedEpV2ApplicationVersions = cliRunSummary_EpV2ApplicationVersion_List.length;
    const processingEpV2ApplicationIssues = cliRunSummary_EpV2ApplicationIssue_List.length;
    
    const processedEpV2Events = cliRunSummary_EpV2EventsProcessed_List.length;
    const deletedEpV2Events = cliRunSummary_EpV2Event_List.length;
    const deletedEpV2EventVersions = cliRunSummary_EpV2EventVersion_List.length;
    const processingEpV2EventIssues = cliRunSummary_EpV2EventIssue_List.length;
    
    const processedEpV2Schemas = cliRunSummary_EpV2SchemasProcessed_List.length;
    const deletedEpV2Schemas = cliRunSummary_EpV2Schema_List.length;
    const deletedEpV2SchemaVersions = cliRunSummary_EpV2SchemaVersion_List.length;
    const processingEpV2SchemaIssues = cliRunSummary_EpV2SchemaIssue_List.length;
    
    const processedEpV2Enums = cliRunSummary_EpV2EnumsProcessed_List.length;
    const deletedEpV2Enums = cliRunSummary_EpV2Enum_List.length;
    const deletedEpV2EnumVersions = cliRunSummary_EpV2EnumVersion_List.length;
    const processingEpV2EnumIssues = cliRunSummary_EpV2EnumIssue_List.length;

    const logFile: string | undefined = CliConfig.getCliConfig().cliLoggerConfig.logFile;

    return {
      type: ECliRunSummary_Type.MigrateSummaryAbsent,
      timestamp: Date.now(),
      logFile: logFile ? logFile : "no log file.",
      deletedEpV2ApplicationDomains,
      processedEpV2ApplicationDomains,
      processingEpV2ApplicationDomainIssues,
      processedEpV2Applications,
      deletedEpV2Applications,
      deletedEpV2ApplicationVersions,
      processingEpV2ApplicationIssues,      
      processedEpV2Events,
      deletedEpV2Events,
      deletedEpV2EventVersions,
      processingEpV2EventIssues,
      processedEpV2Schemas,
      deletedEpV2Schemas,
      deletedEpV2SchemaVersions,
      processingEpV2SchemaIssues,
      processedEpV2Enums,
      deletedEpV2Enums,
      deletedEpV2EnumVersions,
      processingEpV2EnumIssues,
    };
  };

  private processedMigrationAbsent = (logName: string, cliMigrateManagerOptions: ICliMigrateManagerOptions) => {
    CliLogger.info(CliLogger.createLogEntry(logName, {code: ECliStatusCodes.MIGRATE_ABSENT_DONE, details: {
      runMode: this.runMode,
      summaryLogList: this.getSummaryLogList(), 
    }}));
    const cliMigrateSummary: ICliMigrateSummaryAbsent = this.createMigrateSummaryAbsent(cliMigrateManagerOptions.cliMigrateManagerMode, cliMigrateManagerOptions.absentRunId);
    CliLogger.info(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.MIGRATE_ABSENT_DONE, details: {
      runMode: this.runMode,
      cliMigrateSummary,
    }}));

    let consoleOutput = '';
    if(cliMigrateManagerOptions.absentRunId) {
      consoleOutput = `
      ------------------------------------------------------------------------------------------------    
      Migration Summary for run: ${cliMigrateManagerOptions.cliMigrateManagerRunState}
      
        Log file: ${cliMigrateSummary.logFile}  
      
        Processed EpV2 Application Domains: ${cliMigrateSummary.processedEpV2ApplicationDomains}
          Processing EpV2 Application Domain Issues: ${cliMigrateSummary.processingEpV2ApplicationDomainIssues}
          Deleted EpV2 Application Domains: ${cliMigrateSummary.deletedEpV2ApplicationDomains}
        Processed EpV2 Applications: ${cliMigrateSummary.processedEpV2Applications}
          Processing EpV2 Application Issues: ${cliMigrateSummary.processingEpV2ApplicationIssues}
          Deleted EpV2 Applications: ${cliMigrateSummary.deletedEpV2Applications}
          Deleted EpV2 Application Versions: ${cliMigrateSummary.deletedEpV2ApplicationVersions}
        Processed EpV2 Events: ${cliMigrateSummary.processedEpV2Events}
          Processing EpV2 Event Issues: ${cliMigrateSummary.processingEpV2EventIssues}
          Deleted EpV2 Events: ${cliMigrateSummary.deletedEpV2Events}
          Deleted EpV2 Event Versions: ${cliMigrateSummary.deletedEpV2EventVersions}
        Processed EpV2 Schemas: ${cliMigrateSummary.processedEpV2Schemas}
          Processing EpV2 Schema Issues: ${cliMigrateSummary.processingEpV2SchemaIssues}
          Deleted EpV2 Schemas: ${cliMigrateSummary.deletedEpV2Schemas}
          Deleted EpV2 Schema Versions: ${cliMigrateSummary.deletedEpV2SchemaVersions}
        Processed EpV2 Enums: ${cliMigrateSummary.processedEpV2Enums}
          Processing EpV2 Enum Issues: ${cliMigrateSummary.processingEpV2EnumIssues}
          Deleted EpV2 Enums: ${cliMigrateSummary.deletedEpV2Enums}
          Deleted EpV2 Enum Versions: ${cliMigrateSummary.deletedEpV2EnumVersions}
        
          `;      
    } else {
      consoleOutput = `
      ------------------------------------------------------------------------------------------------    
      Migration Summary for run: ${cliMigrateManagerOptions.cliMigrateManagerRunState}
      
        Log file: ${cliMigrateSummary.logFile}  
      
        Deleted EpV2 Application Domains: ${cliMigrateSummary.deletedEpV2ApplicationDomains}
        
      `;
    }
    this.log(
      ECliSummaryStatusCodes.MIGRATE_SUMMARY_ABSENT,
      cliMigrateSummary,
      consoleOutput,
      true
    );
  };

  public createMigrateSummaryIssuesAbsent = (): ICliMigrateSummaryIssuesAbsent => {
    const logFile: string | undefined = CliConfig.getCliConfig().cliLoggerConfig.logFile;
    return {
      type: ECliRunSummary_Type.MigrateSummaryIssues,
      timestamp: Date.now(),
      logFile: logFile ? logFile : "no log file.",
      cliRunEnumIssues: CliRunIssues.get({ type: ECliRunIssueTypes.EnumIssue }) as Array<ICliRunIssueAbsentById>,
      cliRunSchemaIssues: CliRunIssues.get({ type: ECliRunIssueTypes.SchemaIssue }) as Array<ICliRunIssueAbsentById>,
      cliRunEventIssues: CliRunIssues.get({ type: ECliRunIssueTypes.EventIssue }) as Array<ICliRunIssueAbsentById>,
      cliRunApplicationIssues: CliRunIssues.get({ type: ECliRunIssueTypes.ApplicationIssue }) as Array<ICliRunIssueAbsentById>,
      cliRunApplicationDomainIssues: CliRunIssues.get({ type: ECliRunIssueTypes.ApplicationDomainIssue }) as Array<ICliRunIssueAbsentById>,
    };
  };

  private processedMigrationIssuesAbsent = (logName: string, cliMigrateManagerOptions: ICliMigrateManagerOptions) => {
    CliLogger.warn(CliLogger.createLogEntry(logName, {code: ECliStatusCodes.MIGRATE_ISSUES, details: {
      runMode: this.runMode,
      issues: CliRunIssues.get({}),
    }}));
    const cliMigrateSummary: ICliMigrateSummaryIssuesAbsent = this.createMigrateSummaryIssuesAbsent();

    const consoleOutputEnumIssues = cliMigrateSummary.cliRunEnumIssues.map((enumIssue) => {
      const cliRunAbsentEnumByRunIdContext = enumIssue.cliRunContext as ICliRunAbsentEnumByRunIdContext;
      return `EpV2: Enum: '${cliRunAbsentEnumByRunIdContext.enumName}' in '${cliRunAbsentEnumByRunIdContext.applicationDomainName}' (issueId: ${enumIssue.issueId})`
    });
    const consoleOutputSchemaIssues = cliMigrateSummary.cliRunSchemaIssues.map((schemaIssue) => {
      const cliRunAbsentSchemaByRunIdContext = schemaIssue.cliRunContext as ICliRunAbsentSchemaByRunIdContext;
      return `EpV2: Schema: '${cliRunAbsentSchemaByRunIdContext.schemaName}' in '${cliRunAbsentSchemaByRunIdContext.applicationDomainName}' (issueId: ${schemaIssue.issueId})`
    });
    const consoleOutputEventIssues = cliMigrateSummary.cliRunEventIssues.map((eventIssue) => {
      const cliRunAbsentEventByRunIdContext = eventIssue.cliRunContext as ICliRunAbsentEventByRunIdContext;
      return `EpV2: Event: '${cliRunAbsentEventByRunIdContext.eventName}' in '${cliRunAbsentEventByRunIdContext.applicationDomainName}' (issueId: ${eventIssue.issueId})`
    });
    const consoleOutputApplicationIssues = cliMigrateSummary.cliRunApplicationIssues.map((applicationIssue) => {
      const cliRunAbsentApplicationByRunIdContext = applicationIssue.cliRunContext as ICliRunAbsentApplicationByRunIdContext;
      return `EpV2: Application: '${cliRunAbsentApplicationByRunIdContext.applicationName}' in '${cliRunAbsentApplicationByRunIdContext.applicationDomainName}' (issueId: ${applicationIssue.issueId})`
    });
    const consoleOutputApplicationDomainIssues = cliMigrateSummary.cliRunApplicationDomainIssues.map((applicationDomainIssue) => {
      const cliRunAbsentApplicationDomainByRunIdContext = applicationDomainIssue.cliRunContext as ICliRunAbsentApplicationDomainByRunIdContext;
      return `EpV2: Application Domain: '${cliRunAbsentApplicationDomainByRunIdContext.applicationDomainName}' (issueId: ${applicationDomainIssue.issueId})`
    });
    
    let consoleOutput = `
------------------------------------------------------------------------------------------------    
Issues for run: ${cliMigrateManagerOptions.cliMigrateManagerRunState}
  None. 
    `;

    if(
      consoleOutputApplicationIssues.length > 0 
      || consoleOutputEnumIssues.length>0 
      || consoleOutputSchemaIssues.length>0 
      || consoleOutputEventIssues.length>0
      || consoleOutputApplicationDomainIssues.length>0
      ) {
      consoleOutput = `

    ------------------------------------------------------------------------------------------------    
    Issues for run: ${cliMigrateManagerOptions.cliMigrateManagerRunState}
    
      Log file: ${cliMigrateSummary.logFile}  
    `;
    }
    if(consoleOutputApplicationDomainIssues.length > 0) {
      consoleOutput += `
      EpV2 Delete Application Domain Issues: 
      ${consoleOutputApplicationDomainIssues.map(x => `
      - ${x}` ).join('')}  
      `;
    }
    if(consoleOutputApplicationIssues.length > 0) {
      consoleOutput += `
      EpV2 Delete Application Issues: 
      ${consoleOutputApplicationIssues.map(x => `
      - ${x}` ).join('')}  
      `;
    }
    if(consoleOutputEventIssues.length > 0) {
      consoleOutput += `
      EpV2 Delete Event Issues: 
      ${consoleOutputEventIssues.map(x => `
      - ${x}` ).join('')} 
      `;      
    }
    if(consoleOutputSchemaIssues.length > 0) {
      consoleOutput += `
      EpV2 Delete Schema Issues: 
      ${consoleOutputSchemaIssues.map(x => `
      - ${x}` ).join('')} 
      `;      
    }
    if(consoleOutputEnumIssues.length > 0) {
      consoleOutput += `
      EpV2 Delete Enum Issues: 
      ${consoleOutputEnumIssues.map(x => `
      - ${x}` ).join('')} 
      `;      
    }
    this.log(
      ECliSummaryStatusCodes.MIGRATE_SUMMARY_ISSUES,
      cliMigrateSummary,
      consoleOutput,
      true
    );
  };

  public createMigrateSummaryIssuesPresent = (): ICliMigrateSummaryIssuesPresent => {
    const logFile: string | undefined = CliConfig.getCliConfig().cliLoggerConfig.logFile;
    return {
      type: ECliRunSummary_Type.MigrateSummaryIssues,
      timestamp: Date.now(),
      logFile: logFile ? logFile : "no log file.",
      cliRunSchemaIssues: CliRunIssues.get({ type: ECliRunIssueTypes.SchemaIssue }) as Array<ICliRunIssueSchema>,
      cliRunEventIssues: CliRunIssues.get({ type: ECliRunIssueTypes.EventIssue }) as Array<ICliRunIssueEvent>,
      cliRunApplicationIssues: CliRunIssues.get({ type: ECliRunIssueTypes.ApplicationIssue }) as Array<ICliRunIssueApplication>,
    };
  };

  private processedMigrationIssuesPresent = (logName: string, cliMigrateManagerOptions: ICliMigrateManagerOptions) => {
    CliLogger.warn(CliLogger.createLogEntry(logName, {code: ECliStatusCodes.MIGRATE_ISSUES, details: {
      runMode: this.runMode,
      issues: CliRunIssues.get({}),
    }}));
    const cliMigrateSummary: ICliMigrateSummaryIssuesPresent = this.createMigrateSummaryIssuesPresent();

    const consoleOutputSchemaIssues = cliMigrateSummary.cliRunSchemaIssues.map((schemaIssue) => {
      const cliRunContextSchema = schemaIssue.cliRunContext as ICliSchemaRunContext;
      return `EpV1: Application Domain: ${cliRunContextSchema.epV1.applicationDomain.name}, Schema: ${cliRunContextSchema.epV1.epV1EventSchema.name} (issueId: ${schemaIssue.issueId})`
    });
    const consoleOutputEventIssues = cliMigrateSummary.cliRunEventIssues.map((eventIssue) => {
      const cliRunContextEvent = eventIssue.cliRunContext as ICliEventRunContext;
      return `EpV1: Application Domain: ${cliRunContextEvent.epV1.applicationDomain.name}, Event: ${cliRunContextEvent.epV1.epV1Event.name} (issueId: ${eventIssue.issueId})`
    });
    const consoleOutputApplicationIssues = cliMigrateSummary.cliRunApplicationIssues.map((applicationIssue) => {
      const cliRunContextApplication = applicationIssue.cliRunContext as ICliApplicationRunContext;
      return `EpV1: Application Domain: ${cliRunContextApplication.epV1.applicationDomain.name}, Application: ${cliRunContextApplication.epV1.epV1Application.name} (issueId: ${applicationIssue.issueId})`
    });
    
    let consoleOutput = `
------------------------------------------------------------------------------------------------    
Issues for run: ${cliMigrateManagerOptions.cliMigrateManagerRunState}
  None. 
    `;

    if(consoleOutputSchemaIssues.length > 0 || consoleOutputEventIssues.length > 0 || consoleOutputApplicationIssues.length > 0) {
      consoleOutput = `

    ------------------------------------------------------------------------------------------------    
    Issues for run: ${cliMigrateManagerOptions.cliMigrateManagerRunState}
    
      Log file: ${cliMigrateSummary.logFile}  
      `;      
    }
    if(consoleOutputSchemaIssues.length > 0) {
      consoleOutput += `
      EpV1 Migrate Schema Issues: 
        ${consoleOutputSchemaIssues.map(x => `
          - ${x}` ).join('')}  
      `;      
    }
    if(consoleOutputEventIssues.length > 0) {
      consoleOutput += `
      EpV1 Migrate Event Issues: 
      ${consoleOutputEventIssues.map(x => `
        - ${x}` ).join('')}  
      `;      
    }
    if(consoleOutputApplicationIssues.length > 0) {
      consoleOutput += `
      EpV1 Migrate Application Issues: 
      ${consoleOutputApplicationIssues.map(x => `
        - ${x}` ).join('')}    
      `;      
    }
    this.log(
      ECliSummaryStatusCodes.MIGRATE_SUMMARY_ISSUES,
      cliMigrateSummary,
      consoleOutput,
      true
    );
  };

  public processedMigration = (logName: string, cliMigrateManagerOptions: ICliMigrateManagerOptions) => {
    switch(cliMigrateManagerOptions.cliMigrateManagerRunState) {
      case ECliMigrateManagerRunState.PRESENT:
        this.processedMigrationPresent(logName, cliMigrateManagerOptions);
        this.processedMigrationIssuesPresent(logName, cliMigrateManagerOptions);
        break;
      case ECliMigrateManagerRunState.ABSENT:
        this.processedMigrationAbsent(logName, cliMigrateManagerOptions);
        this.processedMigrationIssuesAbsent(logName, cliMigrateManagerOptions);
        break;
      default:
        CliUtils.assertNever(logName, cliMigrateManagerOptions.cliMigrateManagerRunState);
    }
  }
}

export default new CliRunSummary();
