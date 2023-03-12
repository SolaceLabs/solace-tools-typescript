import {
  $ApplicationVersion,
  ApplicationVersion,
} from "@solace-labs/ep-openapi-node";
import {
  EpSdkConfig,
  EpSdkApiContentError,
  EpSdkInternalTaskError,
  EpSdkVersionTaskStrategyValidationError,
  EpSdkLogger,
  EEpSdkLoggerCodes,
} from "../utils";
import { EEpSdkObjectTypes } from "../types";
import { EpSdkApplicationVersionsService } from "../services";
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
export type TEpSdkApplicationVersionTask_Settings = Required<
  Pick<
    ApplicationVersion,
    | "description"
    | "displayName"
    | "stateId"
    | "declaredProducedEventVersionIds"
    | "declaredConsumedEventVersionIds"
  >
>;
type TEpSdkApplicationVersionTask_CompareObject =
  Partial<TEpSdkApplicationVersionTask_Settings> &
    Partial<Pick<ApplicationVersion, "version">>;

/** @category Tasks */
export interface IEpSdkApplicationVersionTask_Config
  extends IEpSdkVersionTask_Config {
  applicationDomainId: string;
  applicationId: string;
  applicationVersionSettings: TEpSdkApplicationVersionTask_Settings;
}
/** @category Tasks */
export interface IEpSdkApplicationVersionTask_Keys extends IEpSdkTask_Keys {
  applicationDomainId: string;
  applicationId: string;
}
/** @category Tasks */
export interface IEpSdkApplicationVersionTask_GetFuncReturn
  extends Omit<IEpSdkTask_GetFuncReturn, "epObject"> {
  epObject: ApplicationVersion | undefined;
}
/** @category Tasks */
export interface IEpSdkApplicationVersionTask_CreateFuncReturn
  extends Omit<IEpSdkTask_CreateFuncReturn, "epObject"> {
  epObject: ApplicationVersion;
}
/** @category Tasks */
export interface IEpSdkApplicationVersionTask_UpdateFuncReturn
  extends Omit<IEpSdkTask_UpdateFuncReturn, "epObject"> {
  epObject: ApplicationVersion;
}
/** @category Tasks */
export interface IEpSdkApplicationVersionTask_ExecuteReturn
  extends Omit<IEpSdkTask_ExecuteReturn, "epObject"> {
  epObject: ApplicationVersion;
}

/** @category Tasks */
export class EpSdkApplicationVersionTask extends EpSdkVersionTask {
  private readonly Empty_IEpSdkApplicationVersionTask_GetFuncReturn: IEpSdkApplicationVersionTask_GetFuncReturn =
    {
      epObjectKeys: this.getDefaultEpObjectKeys(),
      epObject: undefined,
      epObjectExists: false,
    };
  private readonly Default_TEpSdkApplicationVersionTask_Settings: Partial<TEpSdkApplicationVersionTask_Settings> =
    {
      description: `Created by ${EpSdkConfig.getAppName()}.`,
    };
  private getTaskConfig(): IEpSdkApplicationVersionTask_Config {
    return this.epSdkTask_Config as IEpSdkApplicationVersionTask_Config;
  }
  private createObjectSettings(): Partial<ApplicationVersion> {
    return {
      ...this.Default_TEpSdkApplicationVersionTask_Settings,
      ...this.getTaskConfig().applicationVersionSettings,
    };
  }

  protected transform_EpSdkTask_Config(
    epSdkApplicationVersionTask_Config: IEpSdkApplicationVersionTask_Config
  ): IEpSdkApplicationVersionTask_Config {
    epSdkApplicationVersionTask_Config.applicationVersionSettings.displayName =
      this.truncate(
        epSdkApplicationVersionTask_Config.applicationVersionSettings
          .displayName,
        $ApplicationVersion.properties.displayName.maxLength
      );
    return epSdkApplicationVersionTask_Config;
  }

  constructor(taskConfig: IEpSdkApplicationVersionTask_Config) {
    super(taskConfig);
  }

  protected getDefaultEpObjectKeys(): IEpSdkVersionTask_EpObjectKeys {
    return {
      epObjectId: "undefined",
      epObjectType: EEpSdkObjectTypes.APPLICATION_VERSION,
      epVersionObjectId: "undefined",
    };
  }

  protected getEpObjectKeys(
    epObject: ApplicationVersion | undefined
  ): IEpSdkVersionTask_EpObjectKeys {
    const funcName = "getEpObjectKeys";
    const logName = `${EpSdkApplicationVersionTask.name}.${funcName}()`;

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
    if (epObject.applicationId === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "epObject.applicationId === undefined",
        {
          epObject: epObject,
        }
      );
    return {
      ...this.getDefaultEpObjectKeys(),
      epObjectId: epObject.applicationId,
      epVersionObjectId: epObject.id,
    };
  }

  protected getTaskKeys(): IEpSdkApplicationVersionTask_Keys {
    return {
      applicationId: this.getTaskConfig().applicationId,
      applicationDomainId: this.getTaskConfig().applicationDomainId,
    };
  }

  /**
   * Get the latest ApplicationVersion.
   */
  protected async getFunc(
    epSdkApplicationVersionTask_Keys: IEpSdkApplicationVersionTask_Keys
  ): Promise<IEpSdkApplicationVersionTask_GetFuncReturn> {
    const funcName = "getFunc";
    const logName = `${EpSdkApplicationVersionTask.name}.${funcName}()`;

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_START_GET,
        module: this.constructor.name,
        details: {
          epSdkApplicationVersionTask_Keys: epSdkApplicationVersionTask_Keys,
        },
      })
    );

    const applicationVersion: ApplicationVersion | undefined =
      await EpSdkApplicationVersionsService.getLatestVersionForApplicationId({
        xContextId: this.xContextId,
        applicationDomainId:
          epSdkApplicationVersionTask_Keys.applicationDomainId,
        applicationId: epSdkApplicationVersionTask_Keys.applicationId,
      });

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_API_GET,
        module: this.constructor.name,
        details: {
          epSdkApplicationVersionTask_Keys: epSdkApplicationVersionTask_Keys,
          applicationVersion: applicationVersion
            ? applicationVersion
            : "undefined",
        },
      })
    );

    if (applicationVersion === undefined)
      return this.Empty_IEpSdkApplicationVersionTask_GetFuncReturn;

    const epSdkApplicationVersionTask_GetFuncReturn: IEpSdkApplicationVersionTask_GetFuncReturn =
      {
        epObjectKeys: this.getEpObjectKeys(applicationVersion),
        epObject: applicationVersion,
        epObjectExists: true,
      };
    return epSdkApplicationVersionTask_GetFuncReturn;
  }

  protected async isUpdateRequiredFunc(epSdkApplicationVersionTask_GetFuncReturn: IEpSdkApplicationVersionTask_GetFuncReturn): Promise<IEpSdkTask_IsUpdateRequiredFuncReturn> {
    const funcName = "isUpdateRequired";
    const logName = `${EpSdkApplicationVersionTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, {code: EEpSdkLoggerCodes.TASK_EXECUTE_START_IS_UPDATE_REQUIRED,module: this.constructor.name,details: {
      epSdkApplicationVersionTask_GetFuncReturn: epSdkApplicationVersionTask_GetFuncReturn,
    }}));

    if (epSdkApplicationVersionTask_GetFuncReturn.epObject === undefined) throw new EpSdkInternalTaskError(logName,this.constructor.name,"epSdkApplicationVersionTask_GetFuncReturn.epObject === undefined");
    /* istanbul ignore next */
    if (epSdkApplicationVersionTask_GetFuncReturn.epObject.version === undefined) throw new EpSdkApiContentError(logName,this.constructor.name,"epSdkApplicationVersionTask_GetFuncReturn.epObject.version === undefined",{
      epObject: epSdkApplicationVersionTask_GetFuncReturn.epObject,
    });
    const existingObject: ApplicationVersion = epSdkApplicationVersionTask_GetFuncReturn.epObject;
    const existingCompareObject: TEpSdkApplicationVersionTask_CompareObject = {
      description: existingObject.description ? existingObject.description : '',
      displayName: existingObject.displayName ? existingObject.displayName : '',
      stateId: existingObject.stateId,
      declaredConsumedEventVersionIds: existingObject.declaredConsumedEventVersionIds,
      declaredProducedEventVersionIds: existingObject.declaredProducedEventVersionIds,
    };
    const requestedCompareObject: TEpSdkApplicationVersionTask_CompareObject = this.createObjectSettings();
    if (this.versionStrategy === EEpSdk_VersionTaskStrategy.EXACT_VERSION) {
      existingCompareObject.version = epSdkApplicationVersionTask_GetFuncReturn.epObject.version;
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
   * Create a new ApplicationVersion
   */
  protected async createFunc(): Promise<IEpSdkApplicationVersionTask_CreateFuncReturn> {
    const funcName = "createFunc";
    const logName = `${EpSdkApplicationVersionTask.name}.${funcName}()`;

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_START_CREATE,
        module: this.constructor.name,
      })
    );

    const create: ApplicationVersion = {
      ...this.createObjectSettings(),
      applicationId: this.getTaskConfig().applicationId,
      version: this.versionString,
    };
    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_CREATE,
        module: this.constructor.name,
        details: {
          epSdkApplicationVersionTask_Config: this.getTaskConfig(),
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

    const applicationVersion: ApplicationVersion =
      await EpSdkApplicationVersionsService.createApplicationVersion({
        xContextId: this.xContextId,
        applicationDomainId: this.getTaskConfig().applicationDomainId,
        applicationId: this.getTaskConfig().applicationId,
        applicationVersion: create,
        targetLifecycleStateId:
          this.getTaskConfig().applicationVersionSettings.stateId,
      });

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_CREATE,
        module: this.constructor.name,
        details: {
          epSdkApplicationDomainTask_Config: this.getTaskConfig(),
          create: create,
          applicationVersion: applicationVersion,
        },
      })
    );

    return {
      epSdkTask_Action: this.getCreateFuncAction(),
      epObject: applicationVersion,
      epObjectKeys: this.getEpObjectKeys(applicationVersion),
    };
  }

  /**
   * Creates a new EnumVersion with bumped version number.
   */
  protected async updateFunc(
    epSdkApplicationVersionTask_GetFuncReturn: IEpSdkApplicationVersionTask_GetFuncReturn
  ): Promise<IEpSdkApplicationVersionTask_UpdateFuncReturn> {
    const funcName = "updateFunc";
    const logName = `${EpSdkApplicationVersionTask.name}.${funcName}()`;

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_START_UPDATE,
        module: this.constructor.name,
      })
    );

    if (epSdkApplicationVersionTask_GetFuncReturn.epObject === undefined)
      throw new EpSdkInternalTaskError(
        logName,
        this.constructor.name,
        "epSdkApplicationVersionTask_GetFuncReturn.epObject === undefined"
      );
    /* istanbul ignore next */
    if (epSdkApplicationVersionTask_GetFuncReturn.epObject.id === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "epSdkApplicationVersionTask_GetFuncReturn.epObject.id === undefined",
        {
          epObject: epSdkApplicationVersionTask_GetFuncReturn.epObject,
        }
      );
    /* istanbul ignore next */
    if (
      epSdkApplicationVersionTask_GetFuncReturn.epObject.version === undefined
    )
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "epSdkApplicationVersionTask_GetFuncReturn.epObject.version === undefined",
        {
          epObject: epSdkApplicationVersionTask_GetFuncReturn.epObject,
        }
      );

    // getFuncReturn has the latest version object
    let nextVersion: string;
    try {
      nextVersion = this.createNextVersionWithStrategyValidation({
        existingObjectVersionString:
          epSdkApplicationVersionTask_GetFuncReturn.epObject.version,
      });
    } catch (e) {
      if (
        this.isCheckmode() &&
        e instanceof EpSdkVersionTaskStrategyValidationError
      ) {
        const update: ApplicationVersion = {
          ...this.createObjectSettings(),
          applicationId: epSdkApplicationVersionTask_GetFuncReturn.epObject.id,
          version: e.details.versionString,
        };
        const wouldBe_EpObject: ApplicationVersion = {
          ...epSdkApplicationVersionTask_GetFuncReturn.epObject,
          ...update,
        };
        return {
          epSdkTask_Action: this.getUpdateFuncAction(true),
          epObject: wouldBe_EpObject,
          epObjectKeys: this.getEpObjectKeys(wouldBe_EpObject),
        };
      } else throw e;
    }
    const update: ApplicationVersion = {
      ...this.createObjectSettings(),
      applicationId: epSdkApplicationVersionTask_GetFuncReturn.epObject.id,
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
      const wouldBe_EpObject: ApplicationVersion = {
        ...epSdkApplicationVersionTask_GetFuncReturn.epObject,
        ...update,
      };
      return {
        epSdkTask_Action: this.getUpdateFuncAction(),
        epObject: wouldBe_EpObject,
        epObjectKeys: this.getEpObjectKeys(wouldBe_EpObject),
      };
    }

    const applicationVersion: ApplicationVersion =
      await EpSdkApplicationVersionsService.createApplicationVersion({
        xContextId: this.xContextId,
        applicationDomainId: this.getTaskConfig().applicationDomainId,
        applicationId: this.getTaskConfig().applicationId,
        applicationVersion: update,
        targetLifecycleStateId:
          this.getTaskConfig().applicationVersionSettings.stateId,
      });

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_UPDATE,
        module: this.constructor.name,
        details: {
          epSdkApplicationDomainTask_Config: this.getTaskConfig(),
          update: update,
          applicationVersion: applicationVersion,
        },
      })
    );

    const epSdkApplicationVersionTask_UpdateFuncReturn: IEpSdkApplicationVersionTask_UpdateFuncReturn =
      {
        epSdkTask_Action: this.getUpdateFuncAction(),
        epObject: applicationVersion,
        epObjectKeys: this.getEpObjectKeys(applicationVersion),
      };
    return epSdkApplicationVersionTask_UpdateFuncReturn;
  }

  public async execute(xContextId?: string): Promise<IEpSdkApplicationVersionTask_ExecuteReturn> {
    const epSdkTask_ExecuteReturn: IEpSdkApplicationVersionTask_ExecuteReturn =
      await super.execute(xContextId);
    return epSdkTask_ExecuteReturn;
  }
}
