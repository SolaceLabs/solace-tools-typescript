import { SchemaVersion, $SchemaVersion } from "@solace-labs/ep-openapi-node";
import {
  EpSdkApiContentError,
  EpSdkInternalTaskError,
  EpSdkVersionTaskStrategyValidationError,
  EpSdkLogger,
  EEpSdkLoggerCodes,
} from "../utils";
import { EpSdkSchemaVersionsService } from "../services";
import { EEpSdkObjectTypes } from "../types";
import {
  IEpSdkTask_CreateFuncReturn,
  IEpSdkTask_ExecuteReturn,
  IEpSdkTask_GetFuncReturn,
  IEpSdkTask_IsUpdateRequiredFuncReturn,
  IEpSdkTask_Keys,
  IEpSdkTask_UpdateFuncReturn,
} from "./EpSdkTask";
import {
  EEpSdk_VersionTaskStrategy,
  EpSdkVersionTask,
  IEpSdkVersionTask_Config,
  IEpSdkVersionTask_EpObjectKeys,
} from "./EpSdkVersionTask";

/** @category Tasks */
export type TEpSdkSchemaVersionTask_Settings = Required<Pick<SchemaVersion, "content" | "stateId">> & Pick<SchemaVersion, "description" | "displayName">;
type TEpSdkSchemaVersionTask_CompareObject = Partial<TEpSdkSchemaVersionTask_Settings> & Partial<Pick<SchemaVersion, "version">>;

/** @category Tasks */
export interface IEpSdkSchemaVersionTask_Config
  extends IEpSdkVersionTask_Config {
  applicationDomainId: string;
  schemaId: string;
  schemaVersionSettings: TEpSdkSchemaVersionTask_Settings;
}
/** @category Tasks */
export interface IEpSdkSchemaVersionTask_Keys extends IEpSdkTask_Keys {
  applicationDomainId: string;
  schemaId: string;
}
/** @category Tasks */
export interface IEpSdkSchemaVersionTask_GetFuncReturn
  extends Omit<IEpSdkTask_GetFuncReturn, "epObject"> {
  epObject: SchemaVersion | undefined;
}
/** @category Tasks */
export interface IEpSdkSchemaVersionTask_CreateFuncReturn
  extends Omit<IEpSdkTask_CreateFuncReturn, "epObject"> {
  epObject: SchemaVersion;
}
/** @category Tasks */
export interface IEpSdkSchemaVersionTask_UpdateFuncReturn
  extends Omit<IEpSdkTask_UpdateFuncReturn, "epObject"> {
  epObject: SchemaVersion;
}
/** @category Tasks */
export interface IEpSdkSchemaVersionTask_ExecuteReturn
  extends Omit<IEpSdkTask_ExecuteReturn, "epObject"> {
  epObject: SchemaVersion;
}

/** @category Tasks */
export class EpSdkSchemaVersionTask extends EpSdkVersionTask {
  private readonly Empty_IEpSdkSchemaVersionTask_GetFuncReturn: IEpSdkSchemaVersionTask_GetFuncReturn = {
    epObjectKeys: this.getDefaultEpObjectKeys(),
    epObject: undefined,
    epObjectExists: false,
  };
  private readonly Default_TEpSdkSchemaVersionTask_Settings: Partial<TEpSdkSchemaVersionTask_Settings> = {
    // description: `Created by ${EpSdkConfig.getAppName()}.`,
  };
  private getTaskConfig(): IEpSdkSchemaVersionTask_Config {
    return this.epSdkTask_Config as IEpSdkSchemaVersionTask_Config;
  }
  private createObjectSettings(): Partial<SchemaVersion> {
    // // try parse the content as json
    // let content = this.getTaskConfig().schemaVersionSettings.content;
    // try {
    //   const jsonContent = JSON.parse(JSON.stringify(content));
    //   content = JSON.stringify(jsonContent);
    // } catch(e) {
    //   // nothing
    // }
    return {
      ...this.Default_TEpSdkSchemaVersionTask_Settings,      
      ...this.getTaskConfig().schemaVersionSettings,
      // content: content
    };
  }

  public transform_EpSdkTask_Config(epSdkSchemaVersionTask_Config: IEpSdkSchemaVersionTask_Config): IEpSdkSchemaVersionTask_Config {
    epSdkSchemaVersionTask_Config.schemaVersionSettings.displayName = this.truncate(
      epSdkSchemaVersionTask_Config.schemaVersionSettings.displayName,
      $SchemaVersion.properties.displayName.maxLength
    );
    return epSdkSchemaVersionTask_Config;
  }

  constructor(taskConfig: IEpSdkSchemaVersionTask_Config) {
    super(taskConfig);
  }

  protected getDefaultEpObjectKeys(): IEpSdkVersionTask_EpObjectKeys {
    return {
      epObjectId: "undefined",
      epObjectType: EEpSdkObjectTypes.SCHEMA_VERSION,
      epVersionObjectId: "undefined",
    };
  }

  protected getEpObjectKeys(epObject: SchemaVersion | undefined): IEpSdkVersionTask_EpObjectKeys {
    const funcName = "getEpObjectKeys";
    const logName = `${EpSdkSchemaVersionTask.name}.${funcName}()`;
    if (epObject === undefined) return this.getDefaultEpObjectKeys();
    /* istanbul ignore next */
    if (epObject.id === undefined) throw new EpSdkApiContentError(logName,this.constructor.name,"epObject.id === undefined",{
      epObject: epObject,
    });
    /* istanbul ignore next */
    if (epObject.schemaId === undefined) throw new EpSdkApiContentError(logName,this.constructor.name,"epObject.schemaId === undefined",{
      epObject: epObject,
    });
    return {
      ...this.getDefaultEpObjectKeys(),
      epObjectId: epObject.schemaId,
      epVersionObjectId: epObject.id,
    };
  }

  protected getTaskKeys(): IEpSdkSchemaVersionTask_Keys {
    return {
      schemaId: this.getTaskConfig().schemaId,
      applicationDomainId: this.getTaskConfig().applicationDomainId,
    };
  }

  /**
   * Get the latest SchemaVersion.
   */
  protected async getFunc(epSdkSchemaVersionTask_Keys: IEpSdkSchemaVersionTask_Keys
  ): Promise<IEpSdkSchemaVersionTask_GetFuncReturn> {
    const funcName = "getFunc";
    const logName = `${EpSdkSchemaVersionTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, {code: EEpSdkLoggerCodes.TASK_EXECUTE_START_GET,module: this.constructor.name,details: {
      epSdkSchemaVersionTask_Keys: epSdkSchemaVersionTask_Keys,
    }}));

    const schemaVersion: SchemaVersion | undefined = await EpSdkSchemaVersionsService.getLatestVersionForSchemaId({
      xContextId: this.xContextId,
      applicationDomainId: epSdkSchemaVersionTask_Keys.applicationDomainId,
      schemaId: epSdkSchemaVersionTask_Keys.schemaId,
    });

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, {code: EEpSdkLoggerCodes.TASK_EXECUTE_API_GET,module: this.constructor.name,details: {
      epSdkSchemaVersionTask_Keys: epSdkSchemaVersionTask_Keys,
      schemaVersion: schemaVersion ? schemaVersion : "undefined",
    }}));
    if (schemaVersion === undefined) return this.Empty_IEpSdkSchemaVersionTask_GetFuncReturn;
    const epSdkSchemaVersionTask_GetFuncReturn: IEpSdkSchemaVersionTask_GetFuncReturn = {
      epObjectKeys: this.getEpObjectKeys(schemaVersion),
      epObject: schemaVersion,
      epObjectExists: true,
    };
    return epSdkSchemaVersionTask_GetFuncReturn;
  }

  protected async isUpdateRequiredFunc(epSdkSchemaVersionTask_GetFuncReturn: IEpSdkSchemaVersionTask_GetFuncReturn): Promise<IEpSdkTask_IsUpdateRequiredFuncReturn> {
    const funcName = "isUpdateRequired";
    const logName = `${EpSdkSchemaVersionTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, {code: EEpSdkLoggerCodes.TASK_EXECUTE_START_IS_UPDATE_REQUIRED,module: this.constructor.name,details: {
      epSdkSchemaVersionTask_GetFuncReturn: epSdkSchemaVersionTask_GetFuncReturn,
    }}));

    if (epSdkSchemaVersionTask_GetFuncReturn.epObject === undefined) throw new EpSdkInternalTaskError(logName,this.constructor.name,"epSdkSchemaVersionTask_GetFuncReturn.epObject === undefined");
    /* istanbul ignore next */
    if (epSdkSchemaVersionTask_GetFuncReturn.epObject.version === undefined) throw new EpSdkApiContentError(logName,this.constructor.name,"epSdkSchemaVersionTask_GetFuncReturn.epObject.version === undefined",{
      epObject: epSdkSchemaVersionTask_GetFuncReturn.epObject,
    });
    const existingObject: SchemaVersion = epSdkSchemaVersionTask_GetFuncReturn.epObject;
    // // try parse the content as JSON
    // let content = existingObject.content;
    // try {
    //   const jsonContent = JSON.parse(JSON.stringify(content));
    //   content = JSON.stringify(jsonContent);
    // } catch(e) {
    //   // nothing
    // }
    const existingCompareObject: TEpSdkSchemaVersionTask_CompareObject = {
      content: existingObject.content,
      description: existingObject.description ? existingObject.description : '',
      displayName: existingObject.displayName ? existingObject.displayName : '',
      stateId: existingObject.stateId,
    };
    const requestedCompareObject: TEpSdkSchemaVersionTask_CompareObject = this.createObjectSettings();
    if (this.versionStrategy === EEpSdk_VersionTaskStrategy.EXACT_VERSION) {
      existingCompareObject.version = epSdkSchemaVersionTask_GetFuncReturn.epObject.version;
      requestedCompareObject.version = this.versionString;
    }

    const epSdkTask_IsUpdateRequiredFuncReturn: IEpSdkTask_IsUpdateRequiredFuncReturn = this.create_IEpSdkTask_IsUpdateRequiredFuncReturn({
      existingObject: existingCompareObject,
      requestedObject: requestedCompareObject,
    });
    // // DEBUG:
    // if(epSdkTask_IsUpdateRequiredFuncReturn.isUpdateRequired) {
    //   EpSdkLogger.debug(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_DONE_IS_UPDATE_REQUIRED, module: this.constructor.name, details: {
    //     epSdkTask_Config: this.epSdkTask_Config,
    //     epSdkTask_IsUpdateRequiredFuncReturn: epSdkTask_IsUpdateRequiredFuncReturn
    //   }}));
    //   throw new EpSdkInternalTaskError(logName, this.constructor.name, 'check updates required');
    // }
    return epSdkTask_IsUpdateRequiredFuncReturn;
  }

  /**
   * Create a new SchemaVersion
   */
  protected async createFunc(): Promise<IEpSdkSchemaVersionTask_CreateFuncReturn> {
    const funcName = "createFunc";
    const logName = `${EpSdkSchemaVersionTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, {code: EEpSdkLoggerCodes.TASK_EXECUTE_START_CREATE,module: this.constructor.name}));

    const create: SchemaVersion = {
      ...this.createObjectSettings(),
      schemaId: this.getTaskConfig().schemaId,
      version: this.versionString,
    };
    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, {code: EEpSdkLoggerCodes.TASK_EXECUTE_CREATE,module: this.constructor.name,details: {
      epSdkSchemaVersionTask_Config: this.getTaskConfig(),
      create: create,
    }}));

    if (this.isCheckmode()) {
      return {
        epSdkTask_Action: this.getCreateFuncAction(),
        epObject: create,
        epObjectKeys: this.getEpObjectKeys({
          ...create,
          id: "undefined",
        }),
      };
    }
    const schemaVersion: SchemaVersion = await EpSdkSchemaVersionsService.createSchemaVersion({
      xContextId: this.xContextId,
      applicationDomainId: this.getTaskConfig().applicationDomainId,
      schemaId: this.getTaskConfig().schemaId,
      schemaVersion: create,
      targetLifecycleStateId: this.getTaskConfig().schemaVersionSettings.stateId,
    });

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, {code: EEpSdkLoggerCodes.TASK_EXECUTE_CREATE,module: this.constructor.name,details: {
      epSdkApplicationDomainTask_Config: this.getTaskConfig(),
      create: create,
      schemaVersion: schemaVersion,
    }}));

    return {
      epSdkTask_Action: this.getCreateFuncAction(),
      epObject: schemaVersion,
      epObjectKeys: this.getEpObjectKeys(schemaVersion),
    };
  }

  /**
   * Creates a new SchemaVersion with bumped version number.
   */
  protected async updateFunc(epSdkSchemaVersionTask_GetFuncReturn: IEpSdkSchemaVersionTask_GetFuncReturn): Promise<IEpSdkSchemaVersionTask_UpdateFuncReturn> {
    const funcName = "updateFunc";
    const logName = `${EpSdkSchemaVersionTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, {code: EEpSdkLoggerCodes.TASK_EXECUTE_START_UPDATE,module: this.constructor.name}));

    if (epSdkSchemaVersionTask_GetFuncReturn.epObject === undefined) throw new EpSdkInternalTaskError(logName,this.constructor.name,"epSdkSchemaVersionTask_GetFuncReturn.epObject === undefined");
    /* istanbul ignore next */
    if (epSdkSchemaVersionTask_GetFuncReturn.epObject.id === undefined) throw new EpSdkApiContentError(logName,this.constructor.name,"epSdkSchemaVersionTask_GetFuncReturn.epObject.id === undefined",{
      epObject: epSdkSchemaVersionTask_GetFuncReturn.epObject,
    });
    /* istanbul ignore next */
    if (epSdkSchemaVersionTask_GetFuncReturn.epObject.version === undefined) throw new EpSdkApiContentError(logName,this.constructor.name,"epSdkSchemaVersionTask_GetFuncReturn.epObject.version === undefined",{
      epObject: epSdkSchemaVersionTask_GetFuncReturn.epObject,
    });
    // getFuncReturn has the latest version object
    let nextVersion: string;
    try {
      nextVersion = this.createNextVersionWithStrategyValidation({existingObjectVersionString: epSdkSchemaVersionTask_GetFuncReturn.epObject.version });
    } catch (e) {
      if (
        this.isCheckmode() &&
        e instanceof EpSdkVersionTaskStrategyValidationError
      ) {
        const update: SchemaVersion = {
          ...this.createObjectSettings(),
          schemaId: epSdkSchemaVersionTask_GetFuncReturn.epObject.id,
          version: e.details.versionString,
        };
        const wouldBe_EpObject: SchemaVersion = {
          ...epSdkSchemaVersionTask_GetFuncReturn.epObject,
          ...update,
        };
        return {
          epSdkTask_Action: this.getUpdateFuncAction(true),
          epObject: wouldBe_EpObject,
          epObjectKeys: this.getEpObjectKeys(wouldBe_EpObject),
        };
      } else throw e;
    }

    const update: SchemaVersion = {
      ...this.createObjectSettings(),
      schemaId: epSdkSchemaVersionTask_GetFuncReturn.epObject.id,
      version: nextVersion,
    };
    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, {code: EEpSdkLoggerCodes.TASK_EXECUTE_UPDATE,module: this.constructor.name,details: {
      epSdkApplicationDomainTask_Config: this.getTaskConfig(),
      update: update,
    }}));

    if (this.isCheckmode()) {
      const wouldBe_EpObject: SchemaVersion = {
        ...epSdkSchemaVersionTask_GetFuncReturn.epObject,
        ...update,
      };
      return {
        epSdkTask_Action: this.getUpdateFuncAction(),
        epObject: wouldBe_EpObject,
        epObjectKeys: this.getEpObjectKeys(wouldBe_EpObject),
      };
    }

    const schemaVersion: SchemaVersion = await EpSdkSchemaVersionsService.createSchemaVersion({
      xContextId: this.xContextId,
      applicationDomainId: this.getTaskConfig().applicationDomainId,
      schemaId: this.getTaskConfig().schemaId,
      schemaVersion: update,
      targetLifecycleStateId: this.getTaskConfig().schemaVersionSettings.stateId,
    });

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, {code: EEpSdkLoggerCodes.TASK_EXECUTE_UPDATE,module: this.constructor.name,details: {
      epSdkApplicationDomainTask_Config: this.getTaskConfig(),
      update: update,
      schemaVersion: schemaVersion,
    }}));

    const epSdkSchemaVersionTask_UpdateFuncReturn: IEpSdkSchemaVersionTask_UpdateFuncReturn = {
      epSdkTask_Action: this.getUpdateFuncAction(),
      epObject: schemaVersion,
      epObjectKeys: this.getEpObjectKeys(schemaVersion),
    };
    return epSdkSchemaVersionTask_UpdateFuncReturn;
  }

  public async execute(xContextId?: string): Promise<IEpSdkSchemaVersionTask_ExecuteReturn> {
    const epSdkTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn = await super.execute(xContextId);
    return epSdkTask_ExecuteReturn;
  }
}
