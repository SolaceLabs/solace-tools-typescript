import {
  $EventApiVersion,
  EventApiVersion,
} from "@solace-labs/ep-openapi-node";
import {
  EpSdkApiContentError,
  EpSdkInternalTaskError,
  EpSdkVersionTaskStrategyValidationError,
  EpSdkLogger,
  EEpSdkLoggerCodes,
} from "../utils";
import { EpSdkEventApiVersionsService } from "../services";
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
export type TEpSdkEventApiVersionTask_Settings = Required<
  Pick<
    EventApiVersion,
    | "description"
    | "displayName"
    | "stateId"
    | "producedEventVersionIds"
    | "consumedEventVersionIds"
  >
>;
type TEpSdkEventApiVersionTask_CompareObject = Partial<TEpSdkEventApiVersionTask_Settings> & Pick<EventApiVersion, "version">;

/** @category Tasks */
export interface IEpSdkEventApiVersionTask_Config
  extends IEpSdkVersionTask_Config {
  applicationDomainId: string;
  eventApiId: string;
  eventApiVersionSettings: TEpSdkEventApiVersionTask_Settings;
}
/** @category Tasks */
export interface IEpSdkEventApiVersionTask_Keys extends IEpSdkTask_Keys {
  applicationDomainId: string;
  eventApiId: string;
}
/** @category Tasks */
export interface IEpSdkEventApiVersionTask_GetFuncReturn
  extends Omit<IEpSdkTask_GetFuncReturn, "epObject"> {
  epObject: EventApiVersion | undefined;
}
/** @category Tasks */
export interface IEpSdkEventApiVersionTask_CreateFuncReturn
  extends Omit<IEpSdkTask_CreateFuncReturn, "epObject"> {
  epObject: EventApiVersion;
}
/** @category Tasks */
export interface IEpSdkEventApiVersionTask_UpdateFuncReturn
  extends Omit<IEpSdkTask_UpdateFuncReturn, "epObject"> {
  epObject: EventApiVersion;
}
/** @category Tasks */
export interface IEpSdkEventApiVersionTask_ExecuteReturn
  extends Omit<IEpSdkTask_ExecuteReturn, "epObject"> {
  epObject: EventApiVersion;
}

/** @category Tasks */
export class EpSdkEventApiVersionTask extends EpSdkVersionTask {
  private readonly Empty_IEpSdkEventApiVersionTask_GetFuncReturn: IEpSdkEventApiVersionTask_GetFuncReturn = {
    epObjectKeys: this.getDefaultEpObjectKeys(),
    epObject: undefined,
    epObjectExists: false,
  };
  private readonly Default_TEpSdkEventApiVersionTask_Settings: Partial<TEpSdkEventApiVersionTask_Settings> = {
    // no defaults
  };
  private getTaskConfig(): IEpSdkEventApiVersionTask_Config {
    return this.epSdkTask_Config as IEpSdkEventApiVersionTask_Config;
  }
  private createObjectSettings(): Partial<EventApiVersion> {
    return {
      ...this.Default_TEpSdkEventApiVersionTask_Settings,
      ...this.getTaskConfig().eventApiVersionSettings,
      description: this.getTaskConfig().eventApiVersionSettings.description ? this.getTaskConfig().eventApiVersionSettings.description : '',
      displayName: this.getTaskConfig().eventApiVersionSettings.displayName ? this.getTaskConfig().eventApiVersionSettings.displayName : '',      
    };
  }

  protected transform_EpSdkTask_Config(epSdkEventApiVersionTask_Config: IEpSdkEventApiVersionTask_Config
  ): IEpSdkEventApiVersionTask_Config {
    epSdkEventApiVersionTask_Config.eventApiVersionSettings.displayName = this.truncate(
      epSdkEventApiVersionTask_Config.eventApiVersionSettings.displayName,
      $EventApiVersion.properties.displayName.maxLength
    );
    return epSdkEventApiVersionTask_Config;
  }

  constructor(taskConfig: IEpSdkEventApiVersionTask_Config) {
    super(taskConfig);
  }

  protected getDefaultEpObjectKeys(): IEpSdkVersionTask_EpObjectKeys {
    return {
      epObjectId: "undefined",
      epObjectType: EEpSdkObjectTypes.EVENT_API_VERSION,
      epVersionObjectId: "undefined",
    };
  }

  protected getEpObjectKeys(epObject: EventApiVersion | undefined): IEpSdkVersionTask_EpObjectKeys {
    const funcName = "getEpObjectKeys";
    const logName = `${EpSdkEventApiVersionTask.name}.${funcName}()`;

    if (epObject === undefined) return this.getDefaultEpObjectKeys();
    /* istanbul ignore next */
    if (epObject.id === undefined) throw new EpSdkApiContentError(logName,this.constructor.name,"epObject.id === undefined", {
      epObject: epObject,
    });
    /* istanbul ignore next */
    if (epObject.eventApiId === undefined) throw new EpSdkApiContentError(logName,this.constructor.name,"epObject.eventApiId === undefined",{
      epObject: epObject,
    });
    return {
      ...this.getDefaultEpObjectKeys(),
      epObjectId: epObject.eventApiId,
      epVersionObjectId: epObject.id,
    };
  }

  protected getTaskKeys(): IEpSdkEventApiVersionTask_Keys {
    return {
      eventApiId: this.getTaskConfig().eventApiId,
      applicationDomainId: this.getTaskConfig().applicationDomainId,
    };
  }

  /**
   * Get the latest EventVersion.
   */
  protected async getFunc(epSdkEventApiVersionTask_Keys: IEpSdkEventApiVersionTask_Keys): Promise<IEpSdkEventApiVersionTask_GetFuncReturn> {
    const funcName = "getFunc";
    const logName = `${EpSdkEventApiVersionTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, {code: EEpSdkLoggerCodes.TASK_EXECUTE_START_GET,module: this.constructor.name,details: {
      epSdkEventApiVersionTask_Keys: epSdkEventApiVersionTask_Keys,
    }}));

    const eventApiVersion: EventApiVersion | undefined = await EpSdkEventApiVersionsService.getLatestVersionForEventApiId({
      xContextId: this.xContextId,
      applicationDomainId: epSdkEventApiVersionTask_Keys.applicationDomainId,
      eventApiId: epSdkEventApiVersionTask_Keys.eventApiId,
    });

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, {code: EEpSdkLoggerCodes.TASK_EXECUTE_API_GET,module: this.constructor.name,details: {
      epSdkEventApiVersionTask_Keys: epSdkEventApiVersionTask_Keys,
      eventApiVersion: eventApiVersion ? eventApiVersion : "undefined",
    }}));

    if (eventApiVersion === undefined) return this.Empty_IEpSdkEventApiVersionTask_GetFuncReturn;

    const epSdkEventApiVersionTask_GetFuncReturn: IEpSdkEventApiVersionTask_GetFuncReturn = {
      epObjectKeys: this.getEpObjectKeys(eventApiVersion),
      epObject: eventApiVersion,
      epObjectExists: true,
    };
    return epSdkEventApiVersionTask_GetFuncReturn;
  }

  protected async isUpdateRequiredFunc(epSdkEventApiVersionTask_GetFuncReturn: IEpSdkEventApiVersionTask_GetFuncReturn): Promise<IEpSdkTask_IsUpdateRequiredFuncReturn> {
    const funcName = "isUpdateRequired";
    const logName = `${EpSdkEventApiVersionTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, {code: EEpSdkLoggerCodes.TASK_EXECUTE_START_IS_UPDATE_REQUIRED,module: this.constructor.name,details: {
      epSdkEventApiVersionTask_GetFuncReturn: epSdkEventApiVersionTask_GetFuncReturn,
    }}));

    if (epSdkEventApiVersionTask_GetFuncReturn.epObject === undefined) throw new EpSdkInternalTaskError(logName,this.constructor.name,"epSdkEventApiVersionTask_GetFuncReturn.epObject === undefined");
    /* istanbul ignore next */
    if (epSdkEventApiVersionTask_GetFuncReturn.epObject.version === undefined) throw new EpSdkApiContentError(logName,this.constructor.name,"epSdkEventApiVersionTask_GetFuncReturn.epObject.version === undefined",{
      epObject: epSdkEventApiVersionTask_GetFuncReturn.epObject,
    });

    const existingObject: EventApiVersion = epSdkEventApiVersionTask_GetFuncReturn.epObject;
    const existingCompareObject: TEpSdkEventApiVersionTask_CompareObject = {
      description: existingObject.description ? existingObject.description : '',
      displayName: existingObject.displayName ? existingObject.displayName : '',
      stateId: existingObject.stateId,
      producedEventVersionIds: existingObject.producedEventVersionIds,
      consumedEventVersionIds: existingObject.consumedEventVersionIds,
    };
    const requestedCompareObject: TEpSdkEventApiVersionTask_CompareObject = this.createObjectSettings();
    if (this.versionStrategy === EEpSdk_VersionTaskStrategy.EXACT_VERSION) {
      existingCompareObject.version = epSdkEventApiVersionTask_GetFuncReturn.epObject.version;
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
   * Create a new EventVersion
   */
  protected async createFunc(): Promise<IEpSdkEventApiVersionTask_CreateFuncReturn> {
    const funcName = "createFunc";
    const logName = `${EpSdkEventApiVersionTask.name}.${funcName}()`;

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_START_CREATE,
        module: this.constructor.name,
      })
    );

    const create: EventApiVersion = {
      ...this.createObjectSettings(),
      eventApiId: this.getTaskConfig().eventApiId,
      version: this.versionString,
    };
    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_CREATE,
        module: this.constructor.name,
        details: {
          epSdkEventApiVersionTask_Config: this.getTaskConfig(),
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

    const eventApiVersion: EventApiVersion = await EpSdkEventApiVersionsService.createEventApiVersion({
      xContextId: this.xContextId,
      applicationDomainId: this.getTaskConfig().applicationDomainId,
      eventApiId: this.getTaskConfig().eventApiId,
      eventApiVersion: create,
      targetLifecycleStateId: this.getTaskConfig().eventApiVersionSettings.stateId,
    });

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_CREATE,
        module: this.constructor.name,
        details: {
          epSdkApplicationDomainTask_Config: this.getTaskConfig(),
          create: create,
          eventApiVersion: eventApiVersion,
        },
      })
    );

    return {
      epSdkTask_Action: this.getCreateFuncAction(),
      epObject: eventApiVersion,
      epObjectKeys: this.getEpObjectKeys(eventApiVersion),
    };
  }

  /**
   * Creates a new EventApiVersion with bumped version number.
   */
  protected async updateFunc(
    epSdkEventApiVersionTask_GetFuncReturn: IEpSdkEventApiVersionTask_GetFuncReturn
  ): Promise<IEpSdkEventApiVersionTask_UpdateFuncReturn> {
    const funcName = "updateFunc";
    const logName = `${EpSdkEventApiVersionTask.name}.${funcName}()`;

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_START_UPDATE,
        module: this.constructor.name,
      })
    );

    if (epSdkEventApiVersionTask_GetFuncReturn.epObject === undefined)
      throw new EpSdkInternalTaskError(
        logName,
        this.constructor.name,
        "epSdkEventApiVersionTask_GetFuncReturn.epObject === undefined"
      );
    /* istanbul ignore next */
    if (epSdkEventApiVersionTask_GetFuncReturn.epObject.id === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "epSdkEventApiVersionTask_GetFuncReturn.epObject.id === undefined",
        {
          epObject: epSdkEventApiVersionTask_GetFuncReturn.epObject,
        }
      );
    /* istanbul ignore next */
    if (epSdkEventApiVersionTask_GetFuncReturn.epObject.version === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "epSdkEventApiVersionTask_GetFuncReturn.epObject.version === undefined",
        {
          epObject: epSdkEventApiVersionTask_GetFuncReturn.epObject,
        }
      );

    // getFuncReturn has the latest version object
    let nextVersion: string;
    try {
      nextVersion = this.createNextVersionWithStrategyValidation({
        existingObjectVersionString:
          epSdkEventApiVersionTask_GetFuncReturn.epObject.version,
      });
    } catch (e) {
      if (
        this.isCheckmode() &&
        e instanceof EpSdkVersionTaskStrategyValidationError
      ) {
        const update: EventApiVersion = {
          ...this.createObjectSettings(),
          eventApiId: epSdkEventApiVersionTask_GetFuncReturn.epObject.id,
          version: e.details.versionString,
        };
        const wouldBe_EpObject: EventApiVersion = {
          ...epSdkEventApiVersionTask_GetFuncReturn.epObject,
          ...update,
        };
        return {
          epSdkTask_Action: this.getUpdateFuncAction(true),
          epObject: wouldBe_EpObject,
          epObjectKeys: this.getEpObjectKeys(wouldBe_EpObject),
        };
      } else throw e;
    }
    const update: EventApiVersion = {
      ...this.createObjectSettings(),
      eventApiId: epSdkEventApiVersionTask_GetFuncReturn.epObject.id,
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
      const wouldBe_EpObject: EventApiVersion = {
        ...epSdkEventApiVersionTask_GetFuncReturn.epObject,
        ...update,
      };
      return {
        epSdkTask_Action: this.getUpdateFuncAction(),
        epObject: wouldBe_EpObject,
        epObjectKeys: this.getEpObjectKeys(wouldBe_EpObject),
      };
    }

    const eventApiVersion: EventApiVersion = await EpSdkEventApiVersionsService.createEventApiVersion({
      xContextId: this.xContextId,
      applicationDomainId: this.getTaskConfig().applicationDomainId,
      eventApiId: this.getTaskConfig().eventApiId,
      eventApiVersion: update,
      targetLifecycleStateId: this.getTaskConfig().eventApiVersionSettings.stateId,
    });

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_UPDATE,
        module: this.constructor.name,
        details: {
          epSdkApplicationDomainTask_Config: this.getTaskConfig(),
          update: update,
          eventApiVersion: eventApiVersion,
        },
      })
    );

    const epSdkEventApiVersionTask_UpdateFuncReturn: IEpSdkEventApiVersionTask_UpdateFuncReturn =
      {
        epSdkTask_Action: this.getUpdateFuncAction(),
        epObject: eventApiVersion,
        epObjectKeys: this.getEpObjectKeys(eventApiVersion),
      };
    return epSdkEventApiVersionTask_UpdateFuncReturn;
  }

  public async execute(xContextId?: string): Promise<IEpSdkEventApiVersionTask_ExecuteReturn> {
    const epSdkTask_ExecuteReturn: IEpSdkEventApiVersionTask_ExecuteReturn =
      await super.execute(xContextId);
    return epSdkTask_ExecuteReturn;
  }
}
