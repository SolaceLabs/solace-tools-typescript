import {
  EEpSdkTask_Action,
  EEpSdkObjectTypes,
  IEpSdkApplicationDomainTask_ExecuteReturn,
  IEpSdkEnumTask_ExecuteReturn,
  IEpSdkEnumVersionTask_ExecuteReturn,
  IEpSdkTask_ExecuteReturn,
  IEpSdkSchemaTask_ExecuteReturn,
  IEpSdkSchemaVersionTask_ExecuteReturn,
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
import { ECliRunContext_RunMode } from "./CliRunContext";
import { CliUtils } from "./CliUtils";
import { ECliMigrateManagerMode, ECliMigrateManagerRunState, ICliMigrateManagerOptions } from "./CliMigrateManager";

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

  ProcessingEpV2ApplicationDomainsAbsent = "ProcessingEpV2ApplicationDomainsAbsent",
  ProcessingEpV2ApplicationDomainsAbsentDone = "ProcessingEpV2ApplicationDomainsAbsentDone",
  ProcessingEpV2ApplicationDomainsAbsentNoneFound = "ProcessingEpV2ApplicationDomainsAbsentNoneFound",
  EpV2ApplicationDomain = "EpV2ApplicationDomain",
  EpV2EnumApplicationDomain = "EpV2EnumApplicationDomain",
  EpV2Enum = "EpV2Enum",
  EpV2Schema = "EpV2Schema",
  EpV2Event = "EpV2Event",
  
  EpV2VersionObject = "EpV2VersionObject",
  // EpV2VersionObjectWarning = "EpV2VersionObjectWarning",
  // EpV2ApplicationVersioningError = "EpV2ApplicationVersioningError",
}

export enum ECliEpV1Object_Types {
  EpV1ApplicationDomain = "EpV1ApplicationDomain",
  EpV1Enum = "EpV1Enum",
  EpV1Schema = "EpV1Schema",
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
}
export interface ICliRunSummary_StartRunPresent extends ICliRunSummary_StartRun {
  type: ECliRunSummary_Type.StartRunPresent;
}
export interface ICliRunSummary_StartRunAbsent extends ICliRunSummary_StartRun {
  type: ECliRunSummary_Type.StartRunAbsent;
  applicationDomainPrefix: string;
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
  createdFirstEpV2SchemaVersions: number;
  createdNewEpV2SchemaVersions: number;

  // warnings: Array<ICliRunSummary_Task_VersionObject_Warning>;
  // errors: Array<ICliRunSummary_Task_VersionObject_Error>;
}
export interface ICliMigrateSummaryAbsent extends ICliRunSummary_LogBase {
  type: ECliRunSummary_Type.MigrateSummaryAbsent;
  logFile: string;
  deletedEpV2ApplicationDomains: number;
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
  type: ECliRunSummary_Type.ProcessingEpV1Schema;
  epV1ObjectType: ECliEpV1Object_Types.EpV1Schema;
  schemaName: string;
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
  Application Domain Prefix: ${cliRunSummary_StartRun.applicationDomainPrefix}
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
      Deleted V2: ${epSdkApplicationDomainTask_ExecuteReturn.epObject.type}: ${applicationDomainName} (${epSdkApplicationDomainTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action})
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

    // counters
    const processedEpV1ApplicationDomains = cliRunSummary_ProcessedEpV1ApplicationDomain_List.length;
    const createdEpV2ApplicationDomains = cliRunSummary_EpV2ApplicationDomain_List.reduce((count, item) => count + Number(item.action === EEpSdkTask_Action.CREATE), 0);
    const updatedEpV2ApplicationDomains = cliRunSummary_EpV2ApplicationDomain_List.reduce((count, item) => count + Number(item.action === EEpSdkTask_Action.UPDATE), 0);
    const createdEpV2EnumApplicationDomains = cliRunSummary_EpV2EnumApplicationDomain_List.reduce((count, item) => count + Number(item.action === EEpSdkTask_Action.CREATE), 0);
    const updatedEpV2EnumApplicationDomains = cliRunSummary_EpV2EnumApplicationDomain_List.reduce((count, item) => count + Number(item.action === EEpSdkTask_Action.UPDATE), 0);
    const processedEpV1Enums = cliRunSummary_ProcessedEpV1Enum_List.length;
    const createdFirstEpV2EnumVersions = cliRunSummary_CreatedEpV2VersionObject_List.reduce((count, item) => count + Number(item.action === EEpSdkTask_Action.CREATE_FIRST_VERSION && item.epObjectType === EEpSdkObjectTypes.ENUM_VERSION), 0);
    const createdNewEpV2EnumVersions = cliRunSummary_CreatedEpV2VersionObject_List.reduce((count, item) => count + Number(item.action === EEpSdkTask_Action.CREATE_NEW_VERSION && item.epObjectType === EEpSdkObjectTypes.ENUM_VERSION), 0);
    const processedEpV1Schemas = cliRunSummary_ProcessedEpV1Schema_List.length;
    const createdFirstEpV2SchemaVersions = cliRunSummary_CreatedEpV2VersionObject_List.reduce((count, item) => count + Number(item.action === EEpSdkTask_Action.CREATE_FIRST_VERSION && item.epObjectType === EEpSdkObjectTypes.SCHEMA_VERSION), 0);
    const createdNewEpV2SchemaVersions = cliRunSummary_CreatedEpV2VersionObject_List.reduce((count, item) => count + Number(item.action === EEpSdkTask_Action.CREATE_NEW_VERSION && item.epObjectType === EEpSdkObjectTypes.SCHEMA_VERSION), 0);

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
      createdFirstEpV2SchemaVersions,
      createdNewEpV2SchemaVersions
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
    Created First EpV2 Schema Versions: ${cliMigrateSummary.createdFirstEpV2SchemaVersions}
    Created New EpV2 Schema Versions: ${cliMigrateSummary.createdNewEpV2SchemaVersions}
  
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
  }
}

export default new CliRunSummary();
