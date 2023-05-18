import {
  EventApi,
  EventApiResponse,
  EventApIsService,
} from "@solace-labs/ep-openapi-node";
import {
  EpSdkApiContentError,
  EpSdkInternalTaskError,
  EpSdkLogger,
  EEpSdkLoggerCodes,
} from "../utils";
import { EpSdkEventApisService } from "../services";
import { EEpSdkObjectTypes } from "../types";
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


/** @category Tasks */
export type TEpSdkEventApiTask_Settings = Partial<Pick<EventApi, "shared" | "brokerType">>;
type TEpSdkEventApiTask_CompareObject = TEpSdkEventApiTask_Settings;

/** @category Tasks */
export interface IEpSdkEventApiTask_Config extends IEpSdkTask_Config {
  eventApiName: string;
  applicationDomainId: string;
  eventApiObjectSettings?: Partial<TEpSdkEventApiTask_Settings>;
}
/** @category Tasks */
export interface IEpSdkEventApiTask_Keys extends IEpSdkTask_Keys {
  eventApiName: string;
  applicationDomainId: string;
}
/** @category Tasks */
export interface IEpSdkEventApiTask_GetFuncReturn
  extends Omit<IEpSdkTask_GetFuncReturn, "epObject"> {
  epObject: EventApi | undefined;
}
/** @category Tasks */
export interface IEpSdkEventApiTask_CreateFuncReturn
  extends Omit<IEpSdkTask_CreateFuncReturn, "epObject"> {
  epObject: EventApi;
}
/** @category Tasks */
export interface IEpSdkEventApiTask_UpdateFuncReturn
  extends Omit<IEpSdkTask_UpdateFuncReturn, "epObject"> {
  epObject: EventApi;
}
/** @category Tasks */
export interface IEpSdkEventApiTask_DeleteFuncReturn
  extends Omit<IEpSdkTask_DeleteFuncReturn, "epObject"> {
  epObject: EventApi;
}
/** @category Tasks */
export interface IEpSdkEventApiTask_ExecuteReturn
  extends Omit<IEpSdkTask_ExecuteReturn, "epObject"> {
  epObject: EventApi;
}

/** @category Tasks */
export class EpSdkEventApiTask extends EpSdkTask {
  private readonly Empty_IEpSdkEventApiTask_GetFuncReturn: IEpSdkEventApiTask_GetFuncReturn = {
    epObjectKeys: this.getDefaultEpObjectKeys(),
    epObject: undefined,
    epObjectExists: false,
  };
  private readonly Default_TEpSdkEventApiTask_Settings: TEpSdkEventApiTask_Settings = {
    shared: true,
    brokerType: EventApi.brokerType.SOLACE,
  };
  private getTaskConfig(): IEpSdkEventApiTask_Config {
    return this.epSdkTask_Config as IEpSdkEventApiTask_Config;
  }
  private createObjectSettings(): Partial<EventApi> {
    return {
      ...this.Default_TEpSdkEventApiTask_Settings,
      ...this.getTaskConfig().eventApiObjectSettings,
    };
  }

  constructor(taskConfig: IEpSdkEventApiTask_Config) {
    super(taskConfig);
  }

  protected getDefaultEpObjectKeys(): IEpSdkTask_EpObjectKeys {
    return {
      epObjectId: "undefined",
      epObjectType: EEpSdkObjectTypes.EVENT_API,
    };
  }

  protected getEpObjectKeys(
    epObject: EventApi | undefined
  ): IEpSdkTask_EpObjectKeys {
    const funcName = "getEpObjectKeys";
    const logName = `${EpSdkEventApiTask.name}.${funcName}()`;

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

  protected getTaskKeys(): IEpSdkEventApiTask_Keys {
    return {
      eventApiName: this.getTaskConfig().eventApiName,
      applicationDomainId: this.getTaskConfig().applicationDomainId,
    };
  }

  protected async getFunc(
    epSdkEventApiTask_Keys: IEpSdkEventApiTask_Keys
  ): Promise<IEpSdkEventApiTask_GetFuncReturn> {
    const funcName = "getFunc";
    const logName = `${EpSdkEventApiTask.name}.${funcName}()`;

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_START_GET,
        module: this.constructor.name,
        details: {
          epSdkEventApiTask_Keys: epSdkEventApiTask_Keys,
        },
      })
    );

    const eventApi: EventApi | undefined = await EpSdkEventApisService.getByName({
      xContextId: this.xContextId,
      eventApiName: epSdkEventApiTask_Keys.eventApiName,
      applicationDomainId: epSdkEventApiTask_Keys.applicationDomainId,
    });

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_API_GET,
        module: this.constructor.name,
        details: {
          epSdkEventApiTask_Keys: epSdkEventApiTask_Keys,
          eventApi: eventApi ? eventApi : "undefined",
        },
      })
    );

    if (eventApi === undefined)
      return this.Empty_IEpSdkEventApiTask_GetFuncReturn;

    const epSdkEventApiTask_GetFuncReturn: IEpSdkEventApiTask_GetFuncReturn = {
      epObjectKeys: this.getEpObjectKeys(eventApi),
      epObject: eventApi,
      epObjectExists: true,
    };
    return epSdkEventApiTask_GetFuncReturn;
  }

  protected async isUpdateRequiredFunc(
    epSdkEventApiTask_GetFuncReturn: IEpSdkEventApiTask_GetFuncReturn
  ): Promise<IEpSdkTask_IsUpdateRequiredFuncReturn> {
    const funcName = "isUpdateRequiredFunc";
    const logName = `${EpSdkEventApiTask.name}.${funcName}()`;

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_START_IS_UPDATE_REQUIRED,
        module: this.constructor.name,
        details: {
          epSdkEventApiTask_GetFuncReturn: epSdkEventApiTask_GetFuncReturn,
        },
      })
    );

    if (epSdkEventApiTask_GetFuncReturn.epObject === undefined)
      throw new EpSdkInternalTaskError(
        logName,
        this.constructor.name,
        "epSdkEventApiTask_GetFuncReturn.epObject === undefined"
      );

    const existingObject: EventApi = epSdkEventApiTask_GetFuncReturn.epObject;
    const existingCompareObject: TEpSdkEventApiTask_CompareObject = {
      shared: existingObject.shared,
      brokerType: existingObject.brokerType,
    };
    const requestedCompareObject: TEpSdkEventApiTask_CompareObject =
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

  protected async createFunc(): Promise<IEpSdkEventApiTask_CreateFuncReturn> {
    const funcName = "createFunc";
    const logName = `${EpSdkEventApiTask.name}.${funcName}()`;

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_START_CREATE,
        module: this.constructor.name,
      })
    );

    const create: EventApi = {
      ...this.createObjectSettings(),
      applicationDomainId: this.getTaskConfig().applicationDomainId,
      name: this.getTaskConfig().eventApiName,
    };

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_CREATE,
        module: this.constructor.name,
        details: {
          epSdkEventApiTask_Config: this.getTaskConfig(),
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

    const eventApiResponse: EventApiResponse = await EventApIsService.createEventApi({
      xContextId: this.xContextId,
      requestBody: create,
    });

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_CREATE,
        module: this.constructor.name,
        details: {
          epSdkEventApiTask_Config: this.getTaskConfig(),
          create: create,
          eventApiResponse: eventApiResponse,
        },
      })
    );

    /* istanbul ignore next */
    if (eventApiResponse.data === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "eventApiResponse.data === undefined",
        {
          epSdkApplicationDomainTask_Config: this.getTaskConfig(),
          create: create,
          eventApiResponse: eventApiResponse,
        }
      );
    return {
      epSdkTask_Action: this.getCreateFuncAction(),
      epObject: eventApiResponse.data,
      epObjectKeys: this.getEpObjectKeys(eventApiResponse.data),
    };
  }

  protected async updateFunc(
    epSdkEventApiTask_GetFuncReturn: IEpSdkEventApiTask_GetFuncReturn
  ): Promise<IEpSdkEventApiTask_UpdateFuncReturn> {
    const funcName = "updateFunc";
    const logName = `${EpSdkEventApiTask.name}.${funcName}()`;

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_START_UPDATE,
        module: this.constructor.name,
      })
    );

    if (epSdkEventApiTask_GetFuncReturn.epObject === undefined)
      throw new EpSdkInternalTaskError(
        logName,
        this.constructor.name,
        "epSdkEventApiTask_GetFuncReturn.epObject === undefined"
      );
    /* istanbul ignore next */
    if (epSdkEventApiTask_GetFuncReturn.epObject.id === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "epSdkEventApiTask_GetFuncReturn.epObject.id === undefined",
        {
          epObject: epSdkEventApiTask_GetFuncReturn.epObject,
        }
      );

    const update: EventApi = {
      ...this.createObjectSettings(),
      applicationDomainId: this.getTaskConfig().applicationDomainId,
      name: this.getTaskConfig().eventApiName,
    };

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_UPDATE,
        module: this.constructor.name,
        details: {
          epSdkEventApiTask_Config: this.getTaskConfig(),
          update: update,
        },
      })
    );

    if (this.isCheckmode()) {
      const wouldBe_EpObject: EventApi = {
        ...epSdkEventApiTask_GetFuncReturn.epObject,
        ...update,
      };
      return {
        epSdkTask_Action: this.getUpdateFuncAction(),
        epObject: wouldBe_EpObject,
        epObjectKeys: this.getEpObjectKeys(wouldBe_EpObject),
      };
    }

    const eventApiResponse: EventApiResponse = await EventApIsService.updateEventApi({
      xContextId: this.xContextId,
      id: epSdkEventApiTask_GetFuncReturn.epObject.id,
      requestBody: update,
    });

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_UPDATE,
        module: this.constructor.name,
        details: {
          epSdkApplicationDomainTask_Config: this.getTaskConfig(),
          update: update,
          eventApiResponse: eventApiResponse,
        },
      })
    );

    /* istanbul ignore next */
    if (eventApiResponse.data === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "eventApiResponse.data === undefined",
        {
          eventApiResponse: eventApiResponse,
        }
      );
    const epSdkEventApiTask_UpdateFuncReturn: IEpSdkEventApiTask_UpdateFuncReturn =
      {
        epSdkTask_Action: this.getUpdateFuncAction(),
        epObject: eventApiResponse.data,
        epObjectKeys: this.getEpObjectKeys(eventApiResponse.data),
      };
    return epSdkEventApiTask_UpdateFuncReturn;
  }

  protected async deleteFunc(
    epSdkEventApiTask_GetFuncReturn: IEpSdkEventApiTask_GetFuncReturn
  ): Promise<IEpSdkEventApiTask_DeleteFuncReturn> {
    const funcName = "deleteFunc";
    const logName = `${EpSdkEventApiTask.name}.${funcName}()`;

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_START_DELETE,
        module: this.constructor.name,
      })
    );

    if (epSdkEventApiTask_GetFuncReturn.epObject === undefined)
      throw new EpSdkInternalTaskError(
        logName,
        this.constructor.name,
        "epSdkEventApiTask_GetFuncReturn.epObject === undefined"
      );
    /* istanbul ignore next */
    if (epSdkEventApiTask_GetFuncReturn.epObject.id === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "epSdkEventApiTask_GetFuncReturn.epObject.id === undefined",
        {
          epObject: epSdkEventApiTask_GetFuncReturn.epObject,
        }
      );

    if (this.isCheckmode()) {
      return {
        epSdkTask_Action: this.getDeleteFuncAction(),
        epObject: epSdkEventApiTask_GetFuncReturn.epObject,
        epObjectKeys: this.getEpObjectKeys(
          epSdkEventApiTask_GetFuncReturn.epObject
        ),
      };
    }

    const eventApi: EventApi = await EpSdkEventApisService.deleteById({
      xContextId: this.xContextId,
      applicationDomainId: this.getTaskConfig().applicationDomainId,
      eventApiId: epSdkEventApiTask_GetFuncReturn.epObject.id,
    });

    const epSdkEventApiTask_DeleteFuncReturn: IEpSdkEventApiTask_DeleteFuncReturn =
      {
        epSdkTask_Action: this.getDeleteFuncAction(),
        epObject: eventApi,
        epObjectKeys: this.getEpObjectKeys(eventApi),
      };
    return epSdkEventApiTask_DeleteFuncReturn;
  }

  public async execute(xContextId?: string): Promise<IEpSdkEventApiTask_ExecuteReturn> {
    const epSdkTask_ExecuteReturn: IEpSdkEventApiTask_ExecuteReturn = await super.execute(xContextId);
    return epSdkTask_ExecuteReturn;
  }
}
