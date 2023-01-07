import {
  $EventVersion,
  Address,
  AddressLevel,
  DeliveryDescriptor,
  EventVersion,
  TopicAddressEnumVersion,
} from "@solace-labs/ep-openapi-node";
import {
  EpSdkApiContentError,
  EpSdkInternalTaskError,
  EpSdkVersionTaskStrategyValidationError,
  EpSdkLogger,
  EEpSdkLoggerCodes,
} from "../utils";
import {
  EpSdkEnumVersionsService,
  EpSdkEpEventVersionsService,
} from "../services";
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
export type TEpSdkEpEventVersionTask_Settings_DeliveryDescriptor = Pick<
  DeliveryDescriptor,
  "brokerType"
>;
/** @category Tasks */
export type TEpSdkEpEventVersionTask_Settings = Required<
  Pick<
    EventVersion,
    "description" | "displayName" | "stateId" | "schemaVersionId"
  >
> &
  TEpSdkEpEventVersionTask_Settings_DeliveryDescriptor;
type TEpSdkEpEventVersionTask_CompareObject =
  Partial<TEpSdkEpEventVersionTask_Settings> &
    Pick<EventVersion, "deliveryDescriptor"> &
    Partial<Pick<EventVersion, "version">>;

/** @category Tasks */
export interface IEpSdkEpEventVersionTask_Config
  extends IEpSdkVersionTask_Config {
  applicationDomainId: string;
  eventId: string;
  eventVersionSettings: TEpSdkEpEventVersionTask_Settings;
  topicString: string;
}
/** @category Tasks */
export interface IEpSdkEpEventVersionTask_Keys extends IEpSdkTask_Keys {
  applicationDomainId: string;
  eventId: string;
}
/** @category Tasks */
export interface IEpSdkEpEventVersionTask_GetFuncReturn
  extends Omit<IEpSdkTask_GetFuncReturn, "epObject"> {
  epObject: EventVersion | undefined;
}
/** @category Tasks */
export interface IEpSdkEpEventVersionTask_CreateFuncReturn
  extends Omit<IEpSdkTask_CreateFuncReturn, "epObject"> {
  epObject: EventVersion;
}
/** @category Tasks */
export interface IEpSdkEpEventVersionTask_UpdateFuncReturn
  extends Omit<IEpSdkTask_UpdateFuncReturn, "epObject"> {
  epObject: EventVersion;
}
/** @category Tasks */
export interface IEpSdkEpEventVersionTask_ExecuteReturn
  extends Omit<IEpSdkTask_ExecuteReturn, "epObject"> {
  epObject: EventVersion;
}

/** @category Tasks */
export class EpSdkEpEventVersionTask extends EpSdkVersionTask {
  private topicAddressLevelList: Array<AddressLevel> = [];

  private readonly Empty_IEpSdkEpEventVersionTask_GetFuncReturn: IEpSdkEpEventVersionTask_GetFuncReturn =
    {
      epObjectKeys: this.getDefaultEpObjectKeys(),
      epObject: undefined,
      epObjectExists: false,
    };
  private readonly Default_TEpSdkEpEventVersionTask_Settings: Partial<TEpSdkEpEventVersionTask_Settings> =
    {
      // description: `Created by ${EpSdkConfig.getAppName()}.`,
      brokerType: "solace",
    };
  private getTaskConfig(): IEpSdkEpEventVersionTask_Config {
    return this.epSdkTask_Config as IEpSdkEpEventVersionTask_Config;
  }
  private initializeTopicAddressLevels = async ({
    topicString,
  }: {
    topicString: string;
  }): Promise<Array<AddressLevel>> => {
    const addressLevels: Array<AddressLevel> = [];
    const topicLevelList: Array<string> = topicString.split("/");
    for (let topicLevel of topicLevelList) {
      let type = AddressLevel.addressLevelType.LITERAL;
      let enumVersionId: string | undefined = undefined;
      if (topicLevel.includes("{")) {
        topicLevel = topicLevel.replace("}", "").replace("{", "");
        type = AddressLevel.addressLevelType.VARIABLE;
        // get the enumVersionId if it exists
        const topicAddressEnumVersion: TopicAddressEnumVersion | undefined =
          await EpSdkEnumVersionsService.getLatestVersionForEnumName({
            enumName: topicLevel,
            applicationDomainId: this.getTaskConfig().applicationDomainId,
          });
        if (topicAddressEnumVersion !== undefined)
          enumVersionId = topicAddressEnumVersion.id;
      }
      addressLevels.push({
        name: topicLevel,
        addressLevelType: type,
        enumVersionId: enumVersionId,
      });
    }
    return addressLevels;
  };
  private createObjectSettings(): Partial<EventVersion> {
    const settings: TEpSdkEpEventVersionTask_Settings = {
      ...this.Default_TEpSdkEpEventVersionTask_Settings,
      ...this.getTaskConfig().eventVersionSettings,
    };
    delete settings.brokerType;
    const brokerType = this.getTaskConfig().eventVersionSettings.brokerType
      ? this.getTaskConfig().eventVersionSettings.brokerType
      : this.Default_TEpSdkEpEventVersionTask_Settings.brokerType;
    return {
      ...settings,
      deliveryDescriptor: {
        brokerType: brokerType,
        address: {
          addressLevels: this.topicAddressLevelList,
          addressType: Address.addressType.TOPIC,
        },
      },
    };
  }

  protected async initializeTask(): Promise<void> {
    this.topicAddressLevelList = await this.initializeTopicAddressLevels({
      topicString: this.getTaskConfig().topicString,
    });
  }

  public transform_EpSdkTask_Config(
    epSdkEpEventVersionTask_Config: IEpSdkEpEventVersionTask_Config
  ): IEpSdkEpEventVersionTask_Config {
    epSdkEpEventVersionTask_Config.eventVersionSettings.displayName =
      this.truncate(
        epSdkEpEventVersionTask_Config.eventVersionSettings.displayName,
        $EventVersion.properties.displayName.maxLength
      );
    return epSdkEpEventVersionTask_Config;
  }

  constructor(taskConfig: IEpSdkEpEventVersionTask_Config) {
    super(taskConfig);
  }

  protected getDefaultEpObjectKeys(): IEpSdkVersionTask_EpObjectKeys {
    return {
      epObjectId: "undefined",
      epObjectType: EEpSdkObjectTypes.EVENT_VERSION,
      epVersionObjectId: "undefined",
    };
  }

  protected getEpObjectKeys(
    epObject: EventVersion | undefined
  ): IEpSdkVersionTask_EpObjectKeys {
    const funcName = "getEpObjectKeys";
    const logName = `${EpSdkEpEventVersionTask.name}.${funcName}()`;

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
    if (epObject.eventId === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "epObject.eventId === undefined",
        {
          epObject: epObject,
        }
      );
    return {
      ...this.getDefaultEpObjectKeys(),
      epObjectId: epObject.eventId,
      epVersionObjectId: epObject.id,
    };
  }

  protected getTaskKeys(): IEpSdkEpEventVersionTask_Keys {
    return {
      eventId: this.getTaskConfig().eventId,
      applicationDomainId: this.getTaskConfig().applicationDomainId,
    };
  }

  /**
   * Get the latest EventVersion.
   */
  protected async getFunc(
    epSdkEpEventVersionTask_Keys: IEpSdkEpEventVersionTask_Keys
  ): Promise<IEpSdkEpEventVersionTask_GetFuncReturn> {
    const funcName = "getFunc";
    const logName = `${EpSdkEpEventVersionTask.name}.${funcName}()`;

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_START_GET,
        module: this.constructor.name,
        details: {
          epSdkEpEventVersionTask_Keys: epSdkEpEventVersionTask_Keys,
        },
      })
    );

    const eventVersion: EventVersion | undefined =
      await EpSdkEpEventVersionsService.getLatestVersionForEventId({
        applicationDomainId: epSdkEpEventVersionTask_Keys.applicationDomainId,
        eventId: epSdkEpEventVersionTask_Keys.eventId,
      });

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_API_GET,
        module: this.constructor.name,
        details: {
          epSdkEpEventVersionTask_Keys: epSdkEpEventVersionTask_Keys,
          eventVersion: eventVersion ? eventVersion : "undefined",
        },
      })
    );

    if (eventVersion === undefined)
      return this.Empty_IEpSdkEpEventVersionTask_GetFuncReturn;

    const epSdkEpEventVersionTask_GetFuncReturn: IEpSdkEpEventVersionTask_GetFuncReturn =
      {
        epObjectKeys: this.getEpObjectKeys(eventVersion),
        epObject: eventVersion,
        epObjectExists: true,
      };
    return epSdkEpEventVersionTask_GetFuncReturn;
  }

  protected async isUpdateRequiredFunc(
    epSdkEpEventVersionTask_GetFuncReturn: IEpSdkEpEventVersionTask_GetFuncReturn
  ): Promise<IEpSdkTask_IsUpdateRequiredFuncReturn> {
    const funcName = "isUpdateRequired";
    const logName = `${EpSdkEpEventVersionTask.name}.${funcName}()`;

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_START_IS_UPDATE_REQUIRED,
        module: this.constructor.name,
        details: {
          epSdkEpEventVersionTask_GetFuncReturn:
            epSdkEpEventVersionTask_GetFuncReturn,
        },
      })
    );

    if (epSdkEpEventVersionTask_GetFuncReturn.epObject === undefined)
      throw new EpSdkInternalTaskError(
        logName,
        this.constructor.name,
        "epSdkEpEventVersionTask_GetFuncReturn.epObject === undefined"
      );
    /* istanbul ignore next */
    if (epSdkEpEventVersionTask_GetFuncReturn.epObject.version === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "epSdkEpEventVersionTask_GetFuncReturn.epObject.version === undefined",
        {
          epObject: epSdkEpEventVersionTask_GetFuncReturn.epObject,
        }
      );

    const existingObject: EventVersion =
      epSdkEpEventVersionTask_GetFuncReturn.epObject;
    const existingCompareObject: TEpSdkEpEventVersionTask_CompareObject = {
      description: existingObject.description,
      displayName: existingObject.displayName,
      stateId: existingObject.stateId,
      schemaVersionId: existingObject.schemaVersionId,
      deliveryDescriptor: existingObject.deliveryDescriptor,
    };
    const requestedCompareObject: TEpSdkEpEventVersionTask_CompareObject =
      this.createObjectSettings();
    if (this.versionStrategy === EEpSdk_VersionTaskStrategy.EXACT_VERSION) {
      existingCompareObject.version =
        epSdkEpEventVersionTask_GetFuncReturn.epObject.version;
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
   * Create a new EventVersion
   */
  protected async createFunc(): Promise<IEpSdkEpEventVersionTask_CreateFuncReturn> {
    const funcName = "createFunc";
    const logName = `${EpSdkEpEventVersionTask.name}.${funcName}()`;

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_START_CREATE,
        module: this.constructor.name,
      })
    );

    const create: EventVersion = {
      ...this.createObjectSettings(),
      eventId: this.getTaskConfig().eventId,
      version: this.versionString,
    };
    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_CREATE,
        module: this.constructor.name,
        details: {
          epSdkEpEventVersionTask_Config: this.getTaskConfig(),
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

    const eventVersion: EventVersion =
      await EpSdkEpEventVersionsService.createEventVersion({
        applicationDomainId: this.getTaskConfig().applicationDomainId,
        eventId: this.getTaskConfig().eventId,
        eventVersion: create,
        targetLifecycleStateId:
          this.getTaskConfig().eventVersionSettings.stateId,
      });

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_CREATE,
        module: this.constructor.name,
        details: {
          epSdkApplicationDomainTask_Config: this.getTaskConfig(),
          create: create,
          eventVersion: eventVersion,
        },
      })
    );

    return {
      epSdkTask_Action: this.getCreateFuncAction(),
      epObject: eventVersion,
      epObjectKeys: this.getEpObjectKeys(eventVersion),
    };
  }

  /**
   * Creates a new EventVersion with bumped version number.
   */
  protected async updateFunc(
    epSdkEpEventVersionTask_GetFuncReturn: IEpSdkEpEventVersionTask_GetFuncReturn
  ): Promise<IEpSdkEpEventVersionTask_UpdateFuncReturn> {
    const funcName = "updateFunc";
    const logName = `${EpSdkEpEventVersionTask.name}.${funcName}()`;

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_START_UPDATE,
        module: this.constructor.name,
      })
    );

    if (epSdkEpEventVersionTask_GetFuncReturn.epObject === undefined)
      throw new EpSdkInternalTaskError(
        logName,
        this.constructor.name,
        "epSdkEpEventVersionTask_GetFuncReturn.epObject === undefined"
      );
    /* istanbul ignore next */
    if (epSdkEpEventVersionTask_GetFuncReturn.epObject.id === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "epSdkEpEventVersionTask_GetFuncReturn.epObject.id === undefined",
        {
          epObject: epSdkEpEventVersionTask_GetFuncReturn.epObject,
        }
      );
    /* istanbul ignore next */
    if (epSdkEpEventVersionTask_GetFuncReturn.epObject.version === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "epSdkEpEventVersionTask_GetFuncReturn.epObject.version === undefined",
        {
          epObject: epSdkEpEventVersionTask_GetFuncReturn.epObject,
        }
      );

    // getFuncReturn has the latest version object
    let nextVersion: string;
    try {
      nextVersion = this.createNextVersionWithStrategyValidation({
        existingObjectVersionString:
          epSdkEpEventVersionTask_GetFuncReturn.epObject.version,
      });
    } catch (e) {
      if (
        this.isCheckmode() &&
        e instanceof EpSdkVersionTaskStrategyValidationError
      ) {
        const update: EventVersion = {
          ...this.createObjectSettings(),
          eventId: epSdkEpEventVersionTask_GetFuncReturn.epObject.id,
          version: e.details.versionString,
        };
        const wouldBe_EpObject: EventVersion = {
          ...epSdkEpEventVersionTask_GetFuncReturn.epObject,
          ...update,
        };
        return {
          epSdkTask_Action: this.getUpdateFuncAction(true),
          epObject: wouldBe_EpObject,
          epObjectKeys: this.getEpObjectKeys(wouldBe_EpObject),
        };
      } else throw e;
    }

    const update: EventVersion = {
      ...this.createObjectSettings(),
      eventId: epSdkEpEventVersionTask_GetFuncReturn.epObject.id,
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
      const wouldBe_EpObject: EventVersion = {
        ...epSdkEpEventVersionTask_GetFuncReturn.epObject,
        ...update,
      };
      return {
        epSdkTask_Action: this.getUpdateFuncAction(),
        epObject: wouldBe_EpObject,
        epObjectKeys: this.getEpObjectKeys(wouldBe_EpObject),
      };
    }

    const eventVersion: EventVersion =
      await EpSdkEpEventVersionsService.createEventVersion({
        applicationDomainId: this.getTaskConfig().applicationDomainId,
        eventId: this.getTaskConfig().eventId,
        eventVersion: update,
        targetLifecycleStateId:
          this.getTaskConfig().eventVersionSettings.stateId,
      });

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_UPDATE,
        module: this.constructor.name,
        details: {
          epSdkApplicationDomainTask_Config: this.getTaskConfig(),
          update: update,
          eventVersion: eventVersion,
        },
      })
    );

    const epSdkEpEventVersionTask_UpdateFuncReturn: IEpSdkEpEventVersionTask_UpdateFuncReturn =
      {
        epSdkTask_Action: this.getUpdateFuncAction(),
        epObject: eventVersion,
        epObjectKeys: this.getEpObjectKeys(eventVersion),
      };
    return epSdkEpEventVersionTask_UpdateFuncReturn;
  }

  public async execute(): Promise<IEpSdkEpEventVersionTask_ExecuteReturn> {
    const epSdkTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn =
      await super.execute();
    return epSdkTask_ExecuteReturn;
  }
}
