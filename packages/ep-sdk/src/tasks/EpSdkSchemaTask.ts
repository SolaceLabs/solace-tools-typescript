import {
  SchemaObject,
  SchemaResponse,
  SchemasService,
} from "@solace-labs/ep-openapi-node";
import {
  EpSdkApiContentError,
  EpSdkInternalTaskError,
  EpSdkLogger,
  EEpSdkLoggerCodes,
} from "../utils";
import {
  EpSdkSchemasService,
  EEpSdkSchemaType,
} from "../services";
import { 
  EEpSdkObjectTypes 
} from "../types";
import {
  EpSdkTask,
} from "./EpSdkTask";
import {
  IEpSdkTask_Config,
  IEpSdkTask_CreateFuncReturn,
  IEpSdkTask_DeleteFuncReturn,
  IEpSdkTask_EpObjectKeys,
  IEpSdkTask_ExecuteReturn,
  IEpSdkTask_GetFuncReturn,
  IEpSdkTask_IsUpdateRequiredFuncReturn,
  IEpSdkTask_Keys,
  IEpSdkTask_UpdateFuncReturn,
} from "./EpSdkTaskTypes";

type TEpSdkSchemaTask_Settings = Partial<
  Pick<SchemaObject, "shared" | "schemaType">
>;
type TEpSdkSchemaTask_CompareObject = TEpSdkSchemaTask_Settings;

/** @category Tasks */
export interface IEpSdkSchemaTask_Config extends IEpSdkTask_Config {
  schemaName: string;
  applicationDomainId: string;
  schemaObjectSettings?: Partial<TEpSdkSchemaTask_Settings>;
}
/** @category Tasks */
export interface IEpSdkSchemaTask_Keys extends IEpSdkTask_Keys {
  schemaName: string;
  applicationDomainId: string;
}
/** @category Tasks */
export interface IEpSdkSchemaTask_GetFuncReturn
  extends Omit<IEpSdkTask_GetFuncReturn, "epObject"> {
  epObject: SchemaObject | undefined;
}
/** @category Tasks */
export interface IEpSdkSchemaTask_CreateFuncReturn
  extends Omit<IEpSdkTask_CreateFuncReturn, "epObject"> {
  epObject: SchemaObject;
}
/** @category Tasks */
export interface IEpSdkSchemaTask_UpdateFuncReturn
  extends Omit<IEpSdkTask_UpdateFuncReturn, "epObject"> {
  epObject: SchemaObject;
}
/** @category Tasks */
export interface IEpSdkSchemaTask_DeleteFuncReturn
  extends Omit<IEpSdkTask_DeleteFuncReturn, "epObject"> {
  epObject: SchemaObject;
}
/** @category Tasks */
export interface IEpSdkSchemaTask_ExecuteReturn
  extends Omit<IEpSdkTask_ExecuteReturn, "epObject"> {
  epObject: SchemaObject;
}

/** @category Tasks */
export class EpSdkSchemaTask extends EpSdkTask {
  private readonly Empty_IEpSdkSchemaTask_GetFuncReturn: IEpSdkSchemaTask_GetFuncReturn =
    {
      epObjectKeys: this.getDefaultEpObjectKeys(),
      epObject: undefined,
      epObjectExists: false,
    };
  private readonly Default_TEpSdkSchemaTask_Settings: Required<TEpSdkSchemaTask_Settings> =
    {
      shared: true,
      schemaType: EEpSdkSchemaType.JSON_SCHEMA,
    };
  private getTaskConfig(): IEpSdkSchemaTask_Config {
    return this.epSdkTask_Config as IEpSdkSchemaTask_Config;
  }
  private createObjectSettings(): Required<TEpSdkSchemaTask_Settings> {
    return {
      ...this.Default_TEpSdkSchemaTask_Settings,
      ...this.getTaskConfig().schemaObjectSettings,
    };
  }

  constructor(taskConfig: IEpSdkSchemaTask_Config) {
    super(taskConfig);
  }

  protected getDefaultEpObjectKeys(): IEpSdkTask_EpObjectKeys {
    return {
      epObjectId: "undefined",
      epObjectType: EEpSdkObjectTypes.SCHEMA_OBJECT,
    };
  }

  protected getEpObjectKeys(
    epObject: SchemaObject | undefined
  ): IEpSdkTask_EpObjectKeys {
    const funcName = "getEpObjectKeys";
    const logName = `${EpSdkSchemaTask.name}.${funcName}()`;

    if (epObject === undefined) return this.getDefaultEpObjectKeys();
    /* istanbul ignore next */
    if (epObject.id === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "epObject.id === undefined",
        {
          epObject: epObject,
        }
      );
    return {
      ...this.getDefaultEpObjectKeys(),
      epObjectId: epObject.id,
    };
  }

  protected getTaskKeys(): IEpSdkSchemaTask_Keys {
    return {
      schemaName: this.getTaskConfig().schemaName,
      applicationDomainId: this.getTaskConfig().applicationDomainId,
    };
  }

  protected async getFunc(
    epSdkSchemaTask_Keys: IEpSdkSchemaTask_Keys
  ): Promise<IEpSdkSchemaTask_GetFuncReturn> {
    const funcName = "getFunc";
    const logName = `${EpSdkSchemaTask.name}.${funcName}()`;

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_START_GET,
        module: this.constructor.name,
        details: {
          epSdkSchemaTask_Keys: epSdkSchemaTask_Keys,
        },
      })
    );

    const schemaObject: SchemaObject | undefined = await EpSdkSchemasService.getByName({
      xContextId: this.xContextId,
      schemaName: epSdkSchemaTask_Keys.schemaName,
      applicationDomainId: epSdkSchemaTask_Keys.applicationDomainId,
    });

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_API_GET,
        module: this.constructor.name,
        details: {
          epSdkSchemaTask_Keys: epSdkSchemaTask_Keys,
          schemaObject: schemaObject ? schemaObject : "undefined",
        },
      })
    );

    if (schemaObject === undefined)
      return this.Empty_IEpSdkSchemaTask_GetFuncReturn;

    const epSdkSchemaTask_GetFuncReturn: IEpSdkSchemaTask_GetFuncReturn = {
      epObjectKeys: this.getEpObjectKeys(schemaObject),
      epObject: schemaObject,
      epObjectExists: true,
    };
    return epSdkSchemaTask_GetFuncReturn;
  }

  protected async isUpdateRequiredFunc(
    epSdkSchemaTask_GetFuncReturn: IEpSdkSchemaTask_GetFuncReturn
  ): Promise<IEpSdkTask_IsUpdateRequiredFuncReturn> {
    const funcName = "isUpdateRequiredFunc";
    const logName = `${EpSdkSchemaTask.name}.${funcName}()`;

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_START_IS_UPDATE_REQUIRED,
        module: this.constructor.name,
        details: {
          epSdkSchemaTask_GetFuncReturn: epSdkSchemaTask_GetFuncReturn,
        },
      })
    );

    if (epSdkSchemaTask_GetFuncReturn.epObject === undefined)
      throw new EpSdkInternalTaskError(
        logName,
        this.constructor.name,
        "epSdkSchemaTask_GetFuncReturn.epObject === undefined"
      );

    const existingObject: SchemaObject = epSdkSchemaTask_GetFuncReturn.epObject;
    const existingCompareObject: TEpSdkSchemaTask_CompareObject = {
      shared: existingObject.shared,
      schemaType: existingObject.schemaType,
    };
    const requestedCompareObject: TEpSdkSchemaTask_CompareObject =
      this.createObjectSettings();

    const epSdkTask_IsUpdateRequiredFuncReturn: IEpSdkTask_IsUpdateRequiredFuncReturn =
      this.create_IEpSdkTask_IsUpdateRequiredFuncReturn({
        existingObject: existingCompareObject,
        requestedObject: requestedCompareObject,
      });
    // // DEBUG:
    // if(epSdkTask_IsUpdateRequiredFuncReturn.isUpdateRequired) {
    //   EpSdkLogger.debug(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_DONE_IS_UPDATE_REQUIRED, module: this.constructor.name, details: {
    //     epSdkTask_Config: this.epSdkTask_Config,
    //     epSdkTask_IsUpdateRequiredFuncReturn: epSdkTask_IsUpdateRequiredFuncReturn
    //   }}));
    //   throw new EpSdkInternalTaskError(logName, this.constructor.name,  'check updates required');
    // }
    return epSdkTask_IsUpdateRequiredFuncReturn;
  }

  protected async createFunc(): Promise<IEpSdkSchemaTask_CreateFuncReturn> {
    const funcName = "createFunc";
    const logName = `${EpSdkSchemaTask.name}.${funcName}()`;

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_START_CREATE,
        module: this.constructor.name,
      })
    );

    const create: SchemaObject = {
      ...this.createObjectSettings(),
      applicationDomainId: this.getTaskConfig().applicationDomainId,
      name: this.getTaskConfig().schemaName,
    };

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_CREATE,
        module: this.constructor.name,
        details: {
          epSdkSchemaTask_Config: this.getTaskConfig(),
          create: create,
        },
      })
    );

    // // DEBUG:
    // throw new EpSdkInternalTaskError(logName, this.constructor.name,  'check create object (settings)');

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

    const schemaResponse: SchemaResponse = await SchemasService.createSchema({
      xContextId: this.xContextId,
      requestBody: create,
    });

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_CREATE,
        module: this.constructor.name,
        details: {
          epSdkSchemaTask_Config: this.getTaskConfig(),
          create: create,
          schemaResponse: schemaResponse,
        },
      })
    );

    if (schemaResponse.data === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "schemaResponse.data === undefined",
        {
          epSdkApplicationDomainTask_Config: this.getTaskConfig(),
          create: create,
          schemaResponse: schemaResponse,
        }
      );
    return {
      epSdkTask_Action: this.getCreateFuncAction(),
      epObject: schemaResponse.data,
      epObjectKeys: this.getEpObjectKeys(schemaResponse.data),
    };
  }

  protected async updateFunc(
    epSdkSchemaTask_GetFuncReturn: IEpSdkSchemaTask_GetFuncReturn
  ): Promise<IEpSdkSchemaTask_UpdateFuncReturn> {
    const funcName = "updateFunc";
    const logName = `${EpSdkSchemaTask.name}.${funcName}()`;

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_START_UPDATE,
        module: this.constructor.name,
      })
    );

    if (epSdkSchemaTask_GetFuncReturn.epObject === undefined)
      throw new EpSdkInternalTaskError(
        logName,
        this.constructor.name,
        "epSdkSchemaTask_GetFuncReturn.epObject === undefined"
      );
    /* istanbul ignore next */
    if (epSdkSchemaTask_GetFuncReturn.epObject.id === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "epSdkSchemaTask_GetFuncReturn.epObject.id === undefined",
        {
          epObject: epSdkSchemaTask_GetFuncReturn.epObject,
        }
      );

    const update: SchemaObject = {
      ...this.createObjectSettings(),
      applicationDomainId: this.getTaskConfig().applicationDomainId,
      name: this.getTaskConfig().schemaName,
    };

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_UPDATE,
        module: this.constructor.name,
        details: {
          epSdkSchemaTask_Config: this.getTaskConfig(),
          update: update,
        },
      })
    );

    if (this.isCheckmode()) {
      const wouldBe_EpObject: SchemaObject = {
        ...epSdkSchemaTask_GetFuncReturn.epObject,
        ...update,
      };
      return {
        epSdkTask_Action: this.getUpdateFuncAction(),
        epObject: wouldBe_EpObject,
        epObjectKeys: this.getEpObjectKeys(wouldBe_EpObject),
      };
    }

    const schemaResponse: SchemaResponse = await SchemasService.updateSchema({
      xContextId: this.xContextId,
      id: epSdkSchemaTask_GetFuncReturn.epObject.id,
      requestBody: update,
    });

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_UPDATE,
        module: this.constructor.name,
        details: {
          epSdkApplicationDomainTask_Config: this.getTaskConfig(),
          update: update,
          schemaResponse: schemaResponse,
        },
      })
    );

    /* istanbul ignore next */
    if (schemaResponse.data === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "schemaResponse.data === undefined",
        {
          schemaResponse: schemaResponse,
        }
      );
    const epSdkSchemaTask_UpdateFuncReturn: IEpSdkSchemaTask_UpdateFuncReturn =
      {
        epSdkTask_Action: this.getUpdateFuncAction(),
        epObject: schemaResponse.data,
        epObjectKeys: this.getEpObjectKeys(schemaResponse.data),
      };
    return epSdkSchemaTask_UpdateFuncReturn;
  }

  protected async deleteFunc(
    epSdkSchemaTask_GetFuncReturn: IEpSdkSchemaTask_GetFuncReturn
  ): Promise<IEpSdkSchemaTask_DeleteFuncReturn> {
    const funcName = "deleteFunc";
    const logName = `${EpSdkSchemaTask.name}.${funcName}()`;

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_START_DELETE,
        module: this.constructor.name,
      })
    );

    if (epSdkSchemaTask_GetFuncReturn.epObject === undefined)
      throw new EpSdkInternalTaskError(
        logName,
        this.constructor.name,
        "epSdkSchemaTask_GetFuncReturn.epObject === undefined"
      );
    /* istanbul ignore next */
    if (epSdkSchemaTask_GetFuncReturn.epObject.id === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "epSdkSchemaTask_GetFuncReturn.epObject.id === undefined",
        {
          epObject: epSdkSchemaTask_GetFuncReturn.epObject,
        }
      );

    if (this.isCheckmode()) {
      return {
        epSdkTask_Action: this.getDeleteFuncAction(),
        epObject: epSdkSchemaTask_GetFuncReturn.epObject,
        epObjectKeys: this.getEpObjectKeys(
          epSdkSchemaTask_GetFuncReturn.epObject
        ),
      };
    }

    const schemaObject: SchemaObject = await EpSdkSchemasService.deleteById({
      xContextId: this.xContextId,
      applicationDomainId: this.getTaskConfig().applicationDomainId,
      schemaId: epSdkSchemaTask_GetFuncReturn.epObject.id,
    });

    const epSdkSchemaTask_DeleteFuncReturn: IEpSdkSchemaTask_DeleteFuncReturn =
      {
        epSdkTask_Action: this.getDeleteFuncAction(),
        epObject: schemaObject,
        epObjectKeys: this.getEpObjectKeys(schemaObject),
      };
    return epSdkSchemaTask_DeleteFuncReturn;
  }

  public async execute(xContextId?: string): Promise<IEpSdkSchemaTask_ExecuteReturn> {
    const epSdkTask_ExecuteReturn: IEpSdkSchemaTask_ExecuteReturn = await super.execute(xContextId);
    return epSdkTask_ExecuteReturn;
  }
}
