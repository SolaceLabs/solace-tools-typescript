import {
  EnumsService,
  TopicAddressEnum,
  TopicAddressEnumResponse,
} from "@solace-labs/ep-openapi-node";
import {
  EpSdkApiContentError,
  EpSdkInternalTaskError,
  EpSdkLogger,
  EEpSdkLoggerCodes,
} from "../utils";
import { EEpSdkObjectTypes } from "../types";
import { EpSdkEnumsService } from "../services";
import {
  EpSdkTask,
  IEpSdkTask_Config,
  IEpSdkTask_CreateFuncReturn,
  IEpSdkTask_DeleteFuncReturn,
  IEpSdkTask_EpObjectKeys,
  IEpSdkTask_ExecuteReturn,
  IEpSdkTask_GetFuncReturn,
  IEpSdkTask_IsUpdateRequiredFuncReturn,
  IEpSdkTask_Keys,
  IEpSdkTask_UpdateFuncReturn,
} from "./EpSdkTask";

/** @category Tasks */
export type TEpSdkEnumTask_Settings = Partial<Pick<TopicAddressEnum, "shared">>;
type TEpSdkEnumTask_CompareObject = TEpSdkEnumTask_Settings;

/** @category Tasks */
export interface IEpSdkEnumTask_Config extends IEpSdkTask_Config {
  enumName: string;
  applicationDomainId: string;
  enumObjectSettings?: Required<TEpSdkEnumTask_Settings>;
}
/** @category Tasks */
export interface IEpSdkEnumTask_Keys extends IEpSdkTask_Keys {
  enumName: string;
  applicationDomainId: string;
}
/** @category Tasks */
export interface IEpSdkEnumTask_GetFuncReturn
  extends Omit<IEpSdkTask_GetFuncReturn, "epObject"> {
  epObject: TopicAddressEnum | undefined;
}
/** @category Tasks */
export interface IEpSdkEnumTask_CreateFuncReturn
  extends Omit<IEpSdkTask_CreateFuncReturn, "epObject"> {
  epObject: TopicAddressEnum;
}
/** @category Tasks */
export interface IEpSdkEnumTask_UpdateFuncReturn
  extends Omit<IEpSdkTask_UpdateFuncReturn, "epObject"> {
  epObject: TopicAddressEnum;
}
/** @category Tasks */
export interface IEpSdkEnumTask_DeleteFuncReturn
  extends Omit<IEpSdkTask_DeleteFuncReturn, "epObject"> {
  epObject: TopicAddressEnum;
}
/** @category Tasks */
export interface IEpSdkEnumTask_ExecuteReturn
  extends Omit<IEpSdkTask_ExecuteReturn, "epObject"> {
  epObject: TopicAddressEnum;
}

/** @category Tasks */
export class EpSdkEnumTask extends EpSdkTask {
  private readonly Empty_IEpSdkEnumTask_GetFuncReturn: IEpSdkEnumTask_GetFuncReturn =
    {
      epObjectKeys: this.getDefaultEpObjectKeys(),
      epObject: undefined,
      epObjectExists: false,
    };
  private readonly Default_TEpSdkEnumTask_Settings: TEpSdkEnumTask_Settings = {
    shared: true,
  };
  private getTaskConfig(): IEpSdkEnumTask_Config {
    return this.epSdkTask_Config as IEpSdkEnumTask_Config;
  }
  private createObjectSettings(): Partial<TopicAddressEnum> {
    return {
      ...this.Default_TEpSdkEnumTask_Settings,
      ...this.getTaskConfig().enumObjectSettings,
    };
  }

  constructor(taskConfig: IEpSdkEnumTask_Config) {
    super(taskConfig);
  }

  protected getDefaultEpObjectKeys(): IEpSdkTask_EpObjectKeys {
    return {
      epObjectId: "undefined",
      epObjectType: EEpSdkObjectTypes.ENUM,
    };
  }

  protected getEpObjectKeys(
    epObject: TopicAddressEnum | undefined
  ): IEpSdkTask_EpObjectKeys {
    const funcName = "getEpObjectKeys";
    const logName = `${EpSdkEnumTask.name}.${funcName}()`;

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

  protected getTaskKeys(): IEpSdkEnumTask_Keys {
    return {
      enumName: this.getTaskConfig().enumName,
      applicationDomainId: this.getTaskConfig().applicationDomainId,
    };
  }

  protected async getFunc(
    epSdkEnumTask_Keys: IEpSdkEnumTask_Keys
  ): Promise<IEpSdkEnumTask_GetFuncReturn> {
    const funcName = "getFunc";
    const logName = `${EpSdkEnumTask.name}.${funcName}()`;

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_START_GET,
        module: this.constructor.name,
        details: {
          epSdkEnumTask_Keys: epSdkEnumTask_Keys,
        },
      })
    );

    const enumObject: TopicAddressEnum | undefined =
      await EpSdkEnumsService.getByName({
        enumName: epSdkEnumTask_Keys.enumName,
        applicationDomainId: epSdkEnumTask_Keys.applicationDomainId,
      });

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_API_GET,
        module: this.constructor.name,
        details: {
          epSdkEnumTask_Keys: epSdkEnumTask_Keys,
          enumObject: enumObject ? enumObject : "undefined",
        },
      })
    );

    if (enumObject === undefined)
      return this.Empty_IEpSdkEnumTask_GetFuncReturn;

    const epSdkEnumTask_GetFuncReturn: IEpSdkEnumTask_GetFuncReturn = {
      epObjectKeys: this.getEpObjectKeys(enumObject),
      epObject: enumObject,
      epObjectExists: true,
    };
    return epSdkEnumTask_GetFuncReturn;
  }

  protected async isUpdateRequiredFunc(
    epSdkEnumTask_GetFuncReturn: IEpSdkEnumTask_GetFuncReturn
  ): Promise<IEpSdkTask_IsUpdateRequiredFuncReturn> {
    const funcName = "isUpdateRequiredFunc";
    const logName = `${EpSdkEnumTask.name}.${funcName}()`;

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_START_IS_UPDATE_REQUIRED,
        module: this.constructor.name,
        details: {
          epSdkEnumTask_GetFuncReturn: epSdkEnumTask_GetFuncReturn,
        },
      })
    );

    if (epSdkEnumTask_GetFuncReturn.epObject === undefined)
      throw new EpSdkInternalTaskError(
        logName,
        this.constructor.name,
        "epSdkEnumTask_GetFuncReturn.epObject === undefined"
      );

    const existingObject: TopicAddressEnum =
      epSdkEnumTask_GetFuncReturn.epObject;
    const existingCompareObject: TEpSdkEnumTask_CompareObject = {
      shared: existingObject.shared,
    };
    const requestedCompareObject: TEpSdkEnumTask_CompareObject =
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
    //   throw new Error(`${logName}: check updates required`);
    // }
    return epSdkTask_IsUpdateRequiredFuncReturn;
  }

  protected async createFunc(): Promise<IEpSdkEnumTask_CreateFuncReturn> {
    const funcName = "createFunc";
    const logName = `${EpSdkEnumTask.name}.${funcName}()`;

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_START_CREATE,
        module: this.constructor.name,
      })
    );

    const create: TopicAddressEnum = {
      ...this.createObjectSettings(),
      applicationDomainId: this.getTaskConfig().applicationDomainId,
      name: this.getTaskConfig().enumName,
    };

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_CREATE,
        module: this.constructor.name,
        details: {
          epSdkEnumTask_Config: this.getTaskConfig(),
          create: create,
        },
      })
    );

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

    const topicAddressEnumResponse: TopicAddressEnumResponse =
      await EnumsService.createEnum({
        requestBody: create,
      });

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_CREATE,
        module: this.constructor.name,
        details: {
          epSdkEnumTask_Config: this.getTaskConfig(),
          create: create,
          topicAddressEnumResponse: topicAddressEnumResponse,
        },
      })
    );

    /* istanbul ignore next */
    if (topicAddressEnumResponse.data === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "topicAddressEnumResponse.data === undefined",
        {
          epSdkApplicationDomainTask_Config: this.getTaskConfig(),
          create: create,
          topicAddressEnumResponse: topicAddressEnumResponse,
        }
      );
    return {
      epSdkTask_Action: this.getCreateFuncAction(),
      epObject: topicAddressEnumResponse.data,
      epObjectKeys: this.getEpObjectKeys(topicAddressEnumResponse.data),
    };
  }

  protected async updateFunc(
    epSdkEnumTask_GetFuncReturn: IEpSdkEnumTask_GetFuncReturn
  ): Promise<IEpSdkEnumTask_UpdateFuncReturn> {
    const funcName = "updateFunc";
    const logName = `${EpSdkEnumTask.name}.${funcName}()`;

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_START_UPDATE,
        module: this.constructor.name,
      })
    );

    if (epSdkEnumTask_GetFuncReturn.epObject === undefined)
      throw new EpSdkInternalTaskError(
        logName,
        this.constructor.name,
        "epSdkEnumTask_GetFuncReturn.epObject === undefined"
      );
    /* istanbul ignore next */
    if (epSdkEnumTask_GetFuncReturn.epObject.id === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "epSdkEnumTask_GetFuncReturn.epObject.id === undefined",
        {
          epObject: epSdkEnumTask_GetFuncReturn.epObject,
        }
      );

    const update: TopicAddressEnum = {
      ...this.createObjectSettings(),
      applicationDomainId: this.getTaskConfig().applicationDomainId,
      name: this.getTaskConfig().enumName,
    };

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_UPDATE,
        module: this.constructor.name,
        details: {
          epSdkEnumTask_Config: this.getTaskConfig(),
          update: update,
        },
      })
    );

    if (this.isCheckmode()) {
      const wouldBe_EpObject: TopicAddressEnum = {
        ...epSdkEnumTask_GetFuncReturn.epObject,
        ...update,
      };
      return {
        epSdkTask_Action: this.getUpdateFuncAction(),
        epObject: wouldBe_EpObject,
        epObjectKeys: this.getEpObjectKeys(wouldBe_EpObject),
      };
    }

    const topicAddressEnumResponse: TopicAddressEnumResponse =
      await EnumsService.updateEnum({
        id: epSdkEnumTask_GetFuncReturn.epObject.id,
        requestBody: update,
      });

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_UPDATE,
        module: this.constructor.name,
        details: {
          epSdkApplicationDomainTask_Config: this.getTaskConfig(),
          update: update,
          topicAddressEnumResponse: topicAddressEnumResponse,
        },
      })
    );

    /* istanbul ignore next */
    if (topicAddressEnumResponse.data === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "topicAddressEnumResponse.data === undefined",
        {
          topicAddressEnumResponse: topicAddressEnumResponse,
        }
      );
    const epSdkEnumTask_UpdateFuncReturn: IEpSdkEnumTask_UpdateFuncReturn = {
      epSdkTask_Action: this.getUpdateFuncAction(),
      epObject: topicAddressEnumResponse.data,
      epObjectKeys: this.getEpObjectKeys(topicAddressEnumResponse.data),
    };
    return epSdkEnumTask_UpdateFuncReturn;
  }

  protected async deleteFunc(
    epSdkEnumTask_GetFuncReturn: IEpSdkEnumTask_GetFuncReturn
  ): Promise<IEpSdkEnumTask_DeleteFuncReturn> {
    const funcName = "deleteFunc";
    const logName = `${EpSdkEnumTask.name}.${funcName}()`;

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_START_DELETE,
        module: this.constructor.name,
      })
    );

    if (epSdkEnumTask_GetFuncReturn.epObject === undefined)
      throw new EpSdkInternalTaskError(
        logName,
        this.constructor.name,
        "epSdkEnumTask_GetFuncReturn.epObject === undefined"
      );
    /* istanbul ignore next */
    if (epSdkEnumTask_GetFuncReturn.epObject.id === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "epSdkEnumTask_GetFuncReturn.epObject.id === undefined",
        {
          epObject: epSdkEnumTask_GetFuncReturn.epObject,
        }
      );

    if (this.isCheckmode()) {
      return {
        epSdkTask_Action: this.getDeleteFuncAction(),
        epObject: epSdkEnumTask_GetFuncReturn.epObject,
        epObjectKeys: this.getEpObjectKeys(
          epSdkEnumTask_GetFuncReturn.epObject
        ),
      };
    }

    const topicAddressEnumResponse: TopicAddressEnum =
      await EpSdkEnumsService.deleteById({
        applicationDomainId: this.getTaskConfig().applicationDomainId,
        enumId: epSdkEnumTask_GetFuncReturn.epObject.id,
      });

    const epSdkEnumTask_DeleteFuncReturn: IEpSdkEnumTask_DeleteFuncReturn = {
      epSdkTask_Action: this.getDeleteFuncAction(),
      epObject: topicAddressEnumResponse,
      epObjectKeys: this.getEpObjectKeys(topicAddressEnumResponse),
    };
    return epSdkEnumTask_DeleteFuncReturn;
  }

  public async execute(): Promise<IEpSdkEnumTask_ExecuteReturn> {
    const epSdkTask_ExecuteReturn: IEpSdkEnumTask_ExecuteReturn =
      await super.execute();
    return epSdkTask_ExecuteReturn;
  }
}
