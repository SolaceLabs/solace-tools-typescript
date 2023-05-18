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

  ProcessingEpV1Schemas = "ProcessingEpV1Schemas",
  ProcessingEpV1SchemasDone = "ProcessingEpV1SchemasDone",
  ProcessingEpV1SchemasNoneFound = "ProcessingEpV1SchemasNoneFound",
  ProcessingEpV1Schema = "ProcessingEpV1Schema",
  ProcessingEpV1SchemaIssue = "ProcessingEpV1SchemaIssue",

  ProcessingEpV1Events = "ProcessingEpV1Events",
  ProcessingEpV1EventsDone = "ProcessingEpV1EventsDone",
  ProcessingEpV1EventsNoneFound = "ProcessingEpV1EventsNoneFound",
  ProcessingEpV1Event = "ProcessingEpV1Event",
  ProcessingEpV1EventIssue = "ProcessingEpV1EventIssue",

  ProcessingEpV1Applications = "ProcessingEpV1Applications",
  ProcessingEpV1ApplicationsDone = "ProcessingEpV1ApplicationsDone",
  ProcessingEpV1ApplicationsNoneFound = "ProcessingEpV1ApplicationsNoneFound",
  ProcessingEpV1Application = "ProcessingEpV1Application",
  ProcessingEpV1ApplicationIssue = "ProcessingEpV1ApplicationIssue",

  ProcessingEpV2ApplicationDomainsAbsent = "ProcessingEpV2ApplicationDomainsAbsent",
  ProcessingEpV2ApplicationDomainsAbsentDone = "ProcessingEpV2ApplicationDomainsAbsentDone",
  ProcessingEpV2ApplicationDomainsAbsentNoneFound = "ProcessingEpV2ApplicationDomainsAbsentNoneFound",
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
  deletedEpV2ApplicationDomains: number;
}
export interface ICliMigrateSummaryIssues extends ICliRunSummary_LogBase {
  type: ECliRunSummary_Type.MigrateSummaryIssues;
  logFile: string;
  cliRunSchemaIssues: Array<ICliRunIssueSchema>;
  cliRunEventIssues: Array<ICliRunIssueEvent>;
  cliRunApplicationIssues: Array<ICliRunIssueApplication>;
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
export interface ICliRunSummary_EpV2_ApplicatonDomainsAbsent extends ICliRunSummary_Base {
  type: ECliRunSummary_Type.ProcessingEpV2ApplicationDomainsAbsent;
  absentApplicationDomainNames: Array<string>;
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
    const displayNameOutput = cliRunSummary_Task_VersionObject.displayName || "''"; 
    const consoleOutput = `
        ${cliRunSummary_Task_VersionObject.epObjectType}: ${displayNameOutput}@${cliRunSummary_Task_VersionObject.version}, state=${cliRunSummary_Task_VersionObject.state} (${cliRunSummary_Task_VersionObject.action})
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
    const cliRunSummary_EpV2_ApplicatonDomainsAbsent: ICliRunSummary_EpV2_ApplicatonDomainsAbsent = {
      runMode: this.runMode,
      type: ECliRunSummary_Type.ProcessingEpV2ApplicationDomainsAbsent,
      absentApplicationDomainNames,
    }
    this.log(ECliSummaryStatusCodes.PROCESSING_EP_V2_APPLICATION_DOMAINS_ABSENT, cliRunSummary_EpV2_ApplicatonDomainsAbsent , consoleOutput);
  }

  public processingEpV2ApplicationDomainsAbsentNoneFound = () => {
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
      Issue migrating schema. Skipping.
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
      Issue migrating event. Skipping.
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
      Issue migrating application. Skipping.
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

  public createMigrateSummaryAbsent = (cliMigrateManagerMode: ECliMigrateManagerMode): ICliMigrateSummaryAbsent => {
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
    const cliRunSummary_EpV2ApplicationDomain_List: Array<ICliRunSummary_Task_ApplicationDomain> = cliRunSummary_LogBase_Filtered_List.filter((cliRunSummary_LogBase: ICliRunSummary_LogBase) => {
      return (cliRunSummary_LogBase.type === ECliRunSummary_Type.EpV2ApplicationDomain);
    }) as unknown as Array<ICliRunSummary_Task_ApplicationDomain>;
    
    // counters
    const deletedEpV2ApplicationDomains = cliRunSummary_EpV2ApplicationDomain_List.reduce((count, item) => count + Number(item.action === EEpSdkTask_Action.DELETE), 0);

    const logFile: string | undefined = CliConfig.getCliConfig().cliLoggerConfig.logFile;

    return {
      type: ECliRunSummary_Type.MigrateSummaryAbsent,
      timestamp: Date.now(),
      logFile: logFile ? logFile : "no log file.",
      deletedEpV2ApplicationDomains,
    };
  };

  private processedMigrationAbsent = (logName: string, cliMigrateManagerOptions: ICliMigrateManagerOptions) => {
    CliLogger.info(CliLogger.createLogEntry(logName, {code: ECliStatusCodes.MIGRATE_ABSENT_DONE, details: {
      runMode: this.runMode,
      summaryLogList: this.getSummaryLogList(), 
    }}));
    const cliMigrateSummary: ICliMigrateSummaryAbsent = this.createMigrateSummaryAbsent(cliMigrateManagerOptions.cliMigrateManagerMode);
    CliLogger.info(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.MIGRATE_ABSENT_DONE, details: {
      runMode: this.runMode,
      cliMigrateSummary,
    }}));

    const consoleOutput = `

------------------------------------------------------------------------------------------------    
Migration Summary for run: ${cliMigrateManagerOptions.cliMigrateManagerRunState}

  Log file: ${cliMigrateSummary.logFile}  

  Deleted EpV2 Application Domains: ${cliMigrateSummary.deletedEpV2ApplicationDomains}  
  
    `;
    this.log(
      ECliSummaryStatusCodes.MIGRATE_SUMMARY_ABSENT,
      cliMigrateSummary,
      consoleOutput,
      true
    );
  };

  public createMigrateSummaryIssues = (): ICliMigrateSummaryIssues => {
    // const funcName = "createMigrateSummaryIssues";
    // const logName = `${CliRunSummary.name}.${funcName}()`;

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


  private processedMigrationIssues = (logName: string, cliMigrateManagerOptions: ICliMigrateManagerOptions) => {
    CliLogger.warn(CliLogger.createLogEntry(logName, {code: ECliStatusCodes.MIGRATE_ISSUES, details: {
      runMode: this.runMode,
      issues: CliRunIssues.get({}),
    }}));
    const cliMigrateSummary: ICliMigrateSummaryIssues = this.createMigrateSummaryIssues();

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

    if(consoleOutputSchemaIssues.length > 0) {
      consoleOutput = `

    ------------------------------------------------------------------------------------------------    
    Issues for run: ${cliMigrateManagerOptions.cliMigrateManagerRunState}
    
      Log file: ${cliMigrateSummary.logFile}  
    
      EpV1 Migrate Schema Issues: 
        ${consoleOutputSchemaIssues.map(x => `
          - ${x}` ).join('')}  

      EpV1 Migrate Event Issues: 
      ${consoleOutputEventIssues.map(x => `
        - ${x}` ).join('')}  

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
        break;
      case ECliMigrateManagerRunState.ABSENT:
        this.processedMigrationAbsent(logName, cliMigrateManagerOptions);
        break;
      default:
        CliUtils.assertNever(logName, cliMigrateManagerOptions.cliMigrateManagerRunState);
    }
    this.processedMigrationIssues(logName, cliMigrateManagerOptions);
  }
}

export default new CliRunSummary();
