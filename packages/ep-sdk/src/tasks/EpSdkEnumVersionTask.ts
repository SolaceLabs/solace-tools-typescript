import {
  $TopicAddressEnumVersion,
  TopicAddressEnumValue,
  TopicAddressEnumVersion,
} from "@solace-labs/ep-openapi-node";
import {
  EpSdkApiContentError,
  EpSdkInternalTaskError,
  EpSdkVersionTaskStrategyValidationError,
  EpSdkLogger,
  EEpSdkLoggerCodes,
} from "../utils";
import { EEpSdkObjectTypes } from "../types";
import { EpSdkEnumVersionsService } from "../services";
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
export type TEpSdkEnumVersionTask_Settings = Required<
  Pick<TopicAddressEnumVersion, "displayName" | "stateId">
> &
  Pick<TopicAddressEnumVersion, "description">;
type TEpSdkEnumVersionTask_CompareObject =
  Partial<TEpSdkEnumVersionTask_Settings> &
    Pick<TopicAddressEnumVersion, "values"> &
    Partial<Pick<TopicAddressEnumVersion, "version">>;

/** @category Tasks */
export interface IEpSdkEnumVersionTask_Config extends IEpSdkVersionTask_Config {
  applicationDomainId: string;
  enumId: string;
  enumVersionSettings: TEpSdkEnumVersionTask_Settings;
  enumValues: Array<string>;
}
/** @category Tasks */
export interface IEpSdkEnumVersionTask_Keys extends IEpSdkTask_Keys {
  applicationDomainId: string;
  enumId: string;
}
/** @category Tasks */
export interface IEpSdkEnumVersionTask_GetFuncReturn
  extends Omit<IEpSdkTask_GetFuncReturn, "epObject"> {
  epObject: TopicAddressEnumVersion | undefined;
}
/** @category Tasks */
export interface IEpSdkEnumVersionTask_CreateFuncReturn
  extends Omit<IEpSdkTask_CreateFuncReturn, "epObject"> {
  epObject: TopicAddressEnumVersion;
}
/** @category Tasks */
export interface IEpSdkEnumVersionTask_UpdateFuncReturn
  extends Omit<IEpSdkTask_UpdateFuncReturn, "epObject"> {
  epObject: TopicAddressEnumVersion;
}
/** @category Tasks */
export interface IEpSdkEnumVersionTask_ExecuteReturn
  extends Omit<IEpSdkTask_ExecuteReturn, "epObject"> {
  epObject: TopicAddressEnumVersion;
}

/** @category Tasks */
export class EpSdkEnumVersionTask extends EpSdkVersionTask {
  private readonly Empty_IEpSdkEnumVersionTask_GetFuncReturn: IEpSdkEnumVersionTask_GetFuncReturn =
    {
      epObjectKeys: this.getDefaultEpObjectKeys(),
      epObject: undefined,
      epObjectExists: false,
    };
  private readonly Default_TEpSdkEnumVersionTask_Settings: Partial<TEpSdkEnumVersionTask_Settings> =
    {
      // description: `Created by ${EpSdkConfig.getAppName()}.`,
    };
  private getTaskConfig(): IEpSdkEnumVersionTask_Config {
    return this.epSdkTask_Config as IEpSdkEnumVersionTask_Config;
  }
  private createEnumValueList(
    valueList: Array<string>
  ): Array<TopicAddressEnumValue> {
    const enumValueList: Array<TopicAddressEnumValue> = [];
    valueList.forEach((value: string) => {
      const enumValue: TopicAddressEnumValue = {
        label: value,
        value: value,
      };
      enumValueList.push(enumValue);
    });
    return enumValueList;
  }

  private createObjectSettings(): Partial<TopicAddressEnumVersion> &
    Pick<TopicAddressEnumVersion, "values"> {
    return {
      ...this.Default_TEpSdkEnumVersionTask_Settings,
      ...this.getTaskConfig().enumVersionSettings,
      values: this.createEnumValueList(this.getTaskConfig().enumValues),
    };
  }

  protected transform_EpSdkTask_Config(
    epSdkEnumVersionTask_Config: IEpSdkEnumVersionTask_Config
  ): IEpSdkEnumVersionTask_Config {
    epSdkEnumVersionTask_Config.enumVersionSettings.displayName = this.truncate(
      epSdkEnumVersionTask_Config.enumVersionSettings.displayName,
      $TopicAddressEnumVersion.properties.displayName.maxLength
    );
    return epSdkEnumVersionTask_Config;
  }

  constructor(taskConfig: IEpSdkEnumVersionTask_Config) {
    super(taskConfig);
  }

  protected getDefaultEpObjectKeys(): IEpSdkVersionTask_EpObjectKeys {
    return {
      epObjectId: "undefined",
      epObjectType: EEpSdkObjectTypes.ENUM_VERSION,
      epVersionObjectId: "undefined",
    };
  }

  protected getEpObjectKeys(
    epObject: TopicAddressEnumVersion | undefined
  ): IEpSdkVersionTask_EpObjectKeys {
    const funcName = "getEpObjectKeys";
    const logName = `${EpSdkEnumVersionTask.name}.${funcName}()`;

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
    /* istanbul ignore next */
    if (epObject.enumId === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "epObject.enumId === undefined",
        {
          epObject: epObject,
        }
      );
    return {
      ...this.getDefaultEpObjectKeys(),
      epObjectId: epObject.enumId,
      epVersionObjectId: epObject.id,
    };
  }

  protected getTaskKeys(): IEpSdkEnumVersionTask_Keys {
    return {
      enumId: this.getTaskConfig().enumId,
      applicationDomainId: this.getTaskConfig().applicationDomainId,
    };
  }

  /**
   * Get the latest EnumVersion.
   */
  protected async getFunc(
    epSdkEnumVersionTask_Keys: IEpSdkEnumVersionTask_Keys
  ): Promise<IEpSdkEnumVersionTask_GetFuncReturn> {
    const funcName = "getFunc";
    const logName = `${EpSdkEnumVersionTask.name}.${funcName}()`;

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_START_GET,
        module: this.constructor.name,
        details: {
          epSdkEnumVersionTask_Keys: epSdkEnumVersionTask_Keys,
        },
      })
    );

    const enumVersion: TopicAddressEnumVersion | undefined = await EpSdkEnumVersionsService.getLatestVersionForEnumId({
      xContextId: this.xContextId,
      applicationDomainId: epSdkEnumVersionTask_Keys.applicationDomainId,
      enumId: epSdkEnumVersionTask_Keys.enumId,
    });

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_API_GET,
        module: this.constructor.name,
        details: {
          epSdkEnumVersionTask_Keys: epSdkEnumVersionTask_Keys,
          enumVersion: enumVersion ? enumVersion : "undefined",
        },
      })
    );

    if (enumVersion === undefined)
      return this.Empty_IEpSdkEnumVersionTask_GetFuncReturn;

    const epSdkEnumVersionTask_GetFuncReturn: IEpSdkEnumVersionTask_GetFuncReturn =
      {
        epObjectKeys: this.getEpObjectKeys(enumVersion),
        epObject: enumVersion,
        epObjectExists: true,
      };
    return epSdkEnumVersionTask_GetFuncReturn;
  }

  private createCompareEnumValueList_From_EP({
    epEnumValueList,
  }: {
    epEnumValueList?: Array<TopicAddressEnumValue>;
  }): Array<TopicAddressEnumValue> {
    if (epEnumValueList === undefined) return [];
    return epEnumValueList.map((epEnumValue: TopicAddressEnumValue) => {
      return {
        label: epEnumValue.label,
        value: epEnumValue.value,
      };
    });
  }

  protected async isUpdateRequiredFunc(
    epSdkEnumVersionTask_GetFuncReturn: IEpSdkEnumVersionTask_GetFuncReturn
  ): Promise<IEpSdkTask_IsUpdateRequiredFuncReturn> {
    const funcName = "isUpdateRequired";
    const logName = `${EpSdkEnumVersionTask.name}.${funcName}()`;

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_START_IS_UPDATE_REQUIRED,
        module: this.constructor.name,
        details: {
          epSdkEnumVersionTask_GetFuncReturn:
            epSdkEnumVersionTask_GetFuncReturn,
        },
      })
    );

    if (epSdkEnumVersionTask_GetFuncReturn.epObject === undefined)
      throw new EpSdkInternalTaskError(
        logName,
        this.constructor.name,
        "epSdkEnumVersionTask_GetFuncReturn.epObject === undefined"
      );
    /* istanbul ignore next */
    if (epSdkEnumVersionTask_GetFuncReturn.epObject.version === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "epSdkEnumVersionTask_GetFuncReturn.epObject.version === undefined",
        {
          epObject: epSdkEnumVersionTask_GetFuncReturn.epObject,
        }
      );

    const existingObject: TopicAddressEnumVersion =
      epSdkEnumVersionTask_GetFuncReturn.epObject;
    const existingCompareObject: TEpSdkEnumVersionTask_CompareObject = {
      description: existingObject.description,
      displayName: existingObject.displayName,
      stateId: existingObject.stateId,
      values: this.createCompareEnumValueList_From_EP({
        epEnumValueList: existingObject.values,
      }),
    };
    const requestedCompareObject: TEpSdkEnumVersionTask_CompareObject =
      this.createObjectSettings();
    if (this.versionStrategy === EEpSdk_VersionTaskStrategy.EXACT_VERSION) {
      existingCompareObject.version =
        epSdkEnumVersionTask_GetFuncReturn.epObject.version;
      requestedCompareObject.version = this.versionString;
    }

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
    //   throw new EpSdkInternalTaskError(logName, this.constructor.name, 'check updates required');
    // }
    return epSdkTask_IsUpdateRequiredFuncReturn;
  }

  /**
   * Create a new EnumVersion
   */
  protected async createFunc(): Promise<IEpSdkEnumVersionTask_CreateFuncReturn> {
    const funcName = "createFunc";
    const logName = `${EpSdkEnumVersionTask.name}.${funcName}()`;

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_START_CREATE,
        module: this.constructor.name,
      })
    );

    const create: TopicAddressEnumVersion = {
      ...this.createObjectSettings(),
      enumId: this.getTaskConfig().enumId,
      version: this.versionString,
    };
    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_CREATE,
        module: this.constructor.name,
        details: {
          epSdkEnumVersionTask_Config: this.getTaskConfig(),
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

    const topicAddressEnumVersion: TopicAddressEnumVersion = await EpSdkEnumVersionsService.createEnumVersion({
      xContextId: this.xContextId,
      enumId: this.getTaskConfig().enumId,
      topicAddressEnumVersion: create,
      targetLifecycleStateId:
        this.getTaskConfig().enumVersionSettings.stateId,
    });

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_CREATE,
        module: this.constructor.name,
        details: {
          epSdkApplicationDomainTask_Config: this.getTaskConfig(),
          create: create,
          topicAddressEnumVersion: topicAddressEnumVersion,
        },
      })
    );

    return {
      epSdkTask_Action: this.getCreateFuncAction(),
      epObject: topicAddressEnumVersion,
      epObjectKeys: this.getEpObjectKeys(topicAddressEnumVersion),
    };
  }

  /**
   * Creates a new EnumVersion with bumped version number.
   */
  protected async updateFunc(
    epSdkEnumVersionTask_GetFuncReturn: IEpSdkEnumVersionTask_GetFuncReturn
  ): Promise<IEpSdkEnumVersionTask_UpdateFuncReturn> {
    const funcName = "updateFunc";
    const logName = `${EpSdkEnumVersionTask.name}.${funcName}()`;

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_START_UPDATE,
        module: this.constructor.name,
      })
    );

    if (epSdkEnumVersionTask_GetFuncReturn.epObject === undefined)
      throw new EpSdkInternalTaskError(
        logName,
        this.constructor.name,
        "epSdkEnumVersionTask_GetFuncReturn.epObject === undefined"
      );
    /* istanbul ignore next */
    if (epSdkEnumVersionTask_GetFuncReturn.epObject.id === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "epSdkEnumVersionTask_GetFuncReturn.epObject.id === undefined",
        {
          epObject: epSdkEnumVersionTask_GetFuncReturn.epObject,
        }
      );
    /* istanbul ignore next */
    if (epSdkEnumVersionTask_GetFuncReturn.epObject.version === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "epSdkEnumVersionTask_GetFuncReturn.epObject.version === undefined",
        {
          epObject: epSdkEnumVersionTask_GetFuncReturn.epObject,
        }
      );

    // getFuncReturn has the latest version object
    let nextVersion: string;
    try {
      nextVersion = this.createNextVersionWithStrategyValidation({
        existingObjectVersionString:
          epSdkEnumVersionTask_GetFuncReturn.epObject.version,
      });
    } catch (e) {
      if (
        this.isCheckmode() &&
        e instanceof EpSdkVersionTaskStrategyValidationError
      ) {
        const update: TopicAddressEnumVersion = {
          ...this.createObjectSettings(),
          enumId: epSdkEnumVersionTask_GetFuncReturn.epObject.id,
          version: e.details.versionString,
        };
        const wouldBe_EpObject: TopicAddressEnumVersion = {
          ...epSdkEnumVersionTask_GetFuncReturn.epObject,
          ...update,
        };
        return {
          epSdkTask_Action: this.getUpdateFuncAction(true),
          epObject: wouldBe_EpObject,
          epObjectKeys: this.getEpObjectKeys(wouldBe_EpObject),
        };
      } else throw e;
    }
    const update: TopicAddressEnumVersion = {
      ...this.createObjectSettings(),
      enumId: epSdkEnumVersionTask_GetFuncReturn.epObject.id,
      version: nextVersion,
    };
    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_UPDATE,
        module: this.constructor.name,
        details: {
          epSdkApplicationDomainTask_Config: this.getTaskConfig(),
          update: update,
        },
      })
    );

    if (this.isCheckmode()) {
      const wouldBe_EpObject: TopicAddressEnumVersion = {
        ...epSdkEnumVersionTask_GetFuncReturn.epObject,
        ...update,
      };
      return {
        epSdkTask_Action: this.getUpdateFuncAction(),
        epObject: wouldBe_EpObject,
        epObjectKeys: this.getEpObjectKeys(wouldBe_EpObject),
      };
    }

    const topicAddressEnumVersion: TopicAddressEnumVersion = await EpSdkEnumVersionsService.createEnumVersion({
      xContextId: this.xContextId,
      enumId: this.getTaskConfig().enumId,
      topicAddressEnumVersion: update,
      targetLifecycleStateId: this.getTaskConfig().enumVersionSettings.stateId,
    });

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_UPDATE,
        module: this.constructor.name,
        details: {
          epSdkApplicationDomainTask_Config: this.getTaskConfig(),
          update: update,
          topicAddressEnumVersion: topicAddressEnumVersion,
        },
      })
    );

    const epSdkEnumVersionTask_UpdateFuncReturn: IEpSdkEnumVersionTask_UpdateFuncReturn =
      {
        epSdkTask_Action: this.getUpdateFuncAction(),
        epObject: topicAddressEnumVersion,
        epObjectKeys: this.getEpObjectKeys(topicAddressEnumVersion),
      };
    return epSdkEnumVersionTask_UpdateFuncReturn;
  }

  public async execute(xContextId: string): Promise<IEpSdkEnumVersionTask_ExecuteReturn> {
    const epSdkTask_ExecuteReturn: IEpSdkEnumVersionTask_ExecuteReturn =
      await super.execute(xContextId);
    return epSdkTask_ExecuteReturn;
  }
}
