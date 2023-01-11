import { 
  // Event as EpEvent,
  // EventResponse,
  // EventsService,
} from '@solace-labs/ep-openapi-node';
import { 
  EpSdkApiContentError, 
  EpSdkInternalTaskError,
  EpSdkLogger,
  EEpSdkLoggerCodes,
  EpSdkUtils
} from "../utils";
import { 
  EpSdkEpEventsService 
} from '../services';
import { 
  EEpSdkObjectTypes,
  EpSdkBrokerTypes,
  EpSdkEvent,
  EpSdkEventResponse,
  EpSdkEventUpdate
} from '../types';
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
  IEpSdkTask_UpdateFuncReturn
} from "./EpSdkTask";

/** @category Tasks */
export type TEpSdkEpEventTask_Settings = Partial<Pick<EpSdkEvent, "shared" | "brokerType">>;
type TEpSdkEpEventTask_CompareObject = Omit<TEpSdkEpEventTask_Settings, "brokerType">;

/** @category Tasks */
export interface IEpSdkEpEventTask_Config extends IEpSdkTask_Config {
  eventName: string;
  applicationDomainId: string;
  eventObjectSettings?: Partial<TEpSdkEpEventTask_Settings>;
}
/** @category Tasks */
export interface IEpSdkEpEventTask_Keys extends IEpSdkTask_Keys {
  eventName: string;
  applicationDomainId: string;
}
/** @category Tasks */
export interface IEpSdkEpEventTask_GetFuncReturn extends Omit<IEpSdkTask_GetFuncReturn, "epObject"> {
  epObject: EpSdkEvent | undefined;
}
/** @category Tasks */
export interface IEpSdkEpEventTask_CreateFuncReturn extends Omit<IEpSdkTask_CreateFuncReturn, "epObject" > {
  epObject: EpSdkEvent;
}
/** @category Tasks */
export interface IEpSdkEpEventTask_UpdateFuncReturn extends Omit<IEpSdkTask_UpdateFuncReturn, "epObject"> {
  epObject: EpSdkEvent;
}
/** @category Tasks */
export interface IEpSdkEpEventTask_DeleteFuncReturn extends Omit<IEpSdkTask_DeleteFuncReturn, "epObject"> {
  epObject: EpSdkEvent;
}
/** @category Tasks */
export interface IEpSdkEpEventTask_ExecuteReturn extends Omit<IEpSdkTask_ExecuteReturn, "epObject"> {
  epObject: EpSdkEvent;
}

/** @category Tasks */
export class EpSdkEpEventTask extends EpSdkTask {

  private readonly Empty_IEpSdkEpEventTask_GetFuncReturn: IEpSdkEpEventTask_GetFuncReturn = {
    epObjectKeys: this.getDefaultEpObjectKeys(),
    epObject: undefined,
    epObjectExists: false  
  };
  private readonly Default_TEpSdkEpEventTask_Settings: TEpSdkEpEventTask_Settings = {
    shared: true,
    brokerType: EpSdkBrokerTypes.Solace
  }
  private getTaskConfig(): IEpSdkEpEventTask_Config { 
    return this.epSdkTask_Config as IEpSdkEpEventTask_Config; 
  }
  private createObjectSettings(): Partial<EpSdkEvent> {
    return {
      ...this.Default_TEpSdkEpEventTask_Settings,
      ...this.getTaskConfig().eventObjectSettings,
    };
  }
  private updateObjectSettings(): Partial<EpSdkEventUpdate> {
    const epSdkEventUpdate = {
      ...this.Default_TEpSdkEpEventTask_Settings,
      ...this.getTaskConfig().eventObjectSettings,
    };
    delete epSdkEventUpdate[EpSdkUtils.nameOf<TEpSdkEpEventTask_Settings>("brokerType")];
    return epSdkEventUpdate;
  }

  constructor(taskConfig: IEpSdkEpEventTask_Config) {
    super(taskConfig);
  }

  protected getDefaultEpObjectKeys(): IEpSdkTask_EpObjectKeys {
    return {
      epObjectId: 'undefined',
      epObjectType: EEpSdkObjectTypes.EVENT,
    };
  }

  protected getEpObjectKeys(epObject: EpSdkEvent | undefined): IEpSdkTask_EpObjectKeys {
    const funcName = 'getEpObjectKeys';
    const logName = `${EpSdkEpEventTask.name}.${funcName}()`;
    
    if(epObject === undefined) return this.getDefaultEpObjectKeys();
    /* istanbul ignore next */
    if(epObject.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epObject.id === undefined', {
      epObject: epObject
    });
    return {
      ...this.getDefaultEpObjectKeys(),
      epObjectId: epObject.id
    }
  }

  protected getTaskKeys(): IEpSdkEpEventTask_Keys {
    return {
      eventName: this.getTaskConfig().eventName,
      applicationDomainId: this.getTaskConfig().applicationDomainId,
    };
  }

  protected async getFunc(epSdkEpEventTask_Keys: IEpSdkEpEventTask_Keys): Promise<IEpSdkEpEventTask_GetFuncReturn> {
    const funcName = 'getFunc';
    const logName = `${EpSdkEpEventTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_GET, module: this.constructor.name, details: {
      epSdkEpEventTask_Keys: epSdkEpEventTask_Keys
    }}));

    const epSdkEvent: EpSdkEvent | undefined = await EpSdkEpEventsService.getByName({ 
      eventName: epSdkEpEventTask_Keys.eventName,
      applicationDomainId: epSdkEpEventTask_Keys.applicationDomainId
    });

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_API_GET, module: this.constructor.name, details: {
      epSdkEpEventTask_Keys: epSdkEpEventTask_Keys,
      epSdkEvent: epSdkEvent ? epSdkEvent : 'undefined'
    }}));

    if(epSdkEvent === undefined) return this.Empty_IEpSdkEpEventTask_GetFuncReturn;

    const epSdkEpEventTask_GetFuncReturn: IEpSdkEpEventTask_GetFuncReturn = {
      epObjectKeys: this.getEpObjectKeys(epSdkEvent),
      epObject: epSdkEvent,
      epObjectExists: true,
    }
    return epSdkEpEventTask_GetFuncReturn;
  }

  protected async isUpdateRequiredFunc(epSdkEpEventTask_GetFuncReturn: IEpSdkEpEventTask_GetFuncReturn ): Promise<IEpSdkTask_IsUpdateRequiredFuncReturn> {
    const funcName = 'isUpdateRequiredFunc';
    const logName = `${EpSdkEpEventTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_IS_UPDATE_REQUIRED, module: this.constructor.name, details: {
      epSdkEpEventTask_GetFuncReturn: epSdkEpEventTask_GetFuncReturn
    }}));

    if(epSdkEpEventTask_GetFuncReturn.epObject === undefined) throw new EpSdkInternalTaskError(logName, this.constructor.name, 'epSdkEpEventTask_GetFuncReturn.epObject === undefined');

    const existingObject: EpSdkEvent = epSdkEpEventTask_GetFuncReturn.epObject;
    const existingCompareObject: TEpSdkEpEventTask_CompareObject = {
      shared: existingObject.shared,
    }
    const requestedCompareObject: TEpSdkEpEventTask_CompareObject = this.updateObjectSettings();

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
    //   throw new EpSdkInternalTaskError(logName, this.constructor.name,  'check updates required');
    // }
    return epSdkTask_IsUpdateRequiredFuncReturn;
  }

  protected async createFunc(): Promise<IEpSdkEpEventTask_CreateFuncReturn> {
    const funcName = 'createFunc';
    const logName = `${EpSdkEpEventTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_CREATE, module: this.constructor.name }));

    const create: EpSdkEvent = {
      ...this.createObjectSettings(),
      applicationDomainId: this.getTaskConfig().applicationDomainId,
      name: this.getTaskConfig().eventName,
    };

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_CREATE, module: this.constructor.name, details: {
      epSdkEpEventTask_Config: this.getTaskConfig(),
      create: create,
    }}));

    // // DEBUG:
    // throw new EpSdkInternalTaskError(logName, this.constructor.name,  'check create object (settings)');
    
    if(this.isCheckmode()) {
      return {
        epSdkTask_Action: this.getCreateFuncAction(),
        epObject: create,
        epObjectKeys: this.getEpObjectKeys({
          ...create,
          id: 'undefined'
        }),
      };
    }

    const epSdkEventResponse: EpSdkEventResponse = await EpSdkEpEventsService.createEvent({
      requestBody: create
    });

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_CREATE, module: this.constructor.name, details: {
      epSdkEpEventTask_Config: this.getTaskConfig(),
      create: create,
      epSdkEventResponse: epSdkEventResponse
    }}));

    /* istanbul ignore next */
    if(epSdkEventResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epSdkEventResponse.data === undefined', {
      epSdkApplicationDomainTask_Config: this.getTaskConfig(),
      create: create,
      epSdkEventResponse: epSdkEventResponse
    });
    return {
      epSdkTask_Action: this.getCreateFuncAction(),
      epObject: epSdkEventResponse.data,
      epObjectKeys: this.getEpObjectKeys(epSdkEventResponse.data)
    };
  }

  protected async updateFunc(epSdkEpEventTask_GetFuncReturn: IEpSdkEpEventTask_GetFuncReturn): Promise<IEpSdkEpEventTask_UpdateFuncReturn> {
    const funcName = 'updateFunc';
    const logName = `${EpSdkEpEventTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_UPDATE, module: this.constructor.name }));

    if(epSdkEpEventTask_GetFuncReturn.epObject === undefined) throw new EpSdkInternalTaskError(logName, this.constructor.name, 'epSdkEpEventTask_GetFuncReturn.epObject === undefined');
    /* istanbul ignore next */
    if(epSdkEpEventTask_GetFuncReturn.epObject.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epSdkEpEventTask_GetFuncReturn.epObject.id === undefined', {
      epObject: epSdkEpEventTask_GetFuncReturn.epObject
    });

    const update: EpSdkEventUpdate = {
      ...this.updateObjectSettings(),
      applicationDomainId: this.getTaskConfig().applicationDomainId,
      name: this.getTaskConfig().eventName,
    };

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_UPDATE, module: this.constructor.name, details: {
      epSdkEpEventTask_Config: this.getTaskConfig(),
      update: update,
    }}));

    if(this.isCheckmode()) {
      const wouldBe_EpObject: EpSdkEvent = {
        ...epSdkEpEventTask_GetFuncReturn.epObject,
        ...update
      };
      return {
        epSdkTask_Action: this.getUpdateFuncAction(),
        epObject: wouldBe_EpObject,
        epObjectKeys: this.getEpObjectKeys(wouldBe_EpObject)
      };
    }

    const epSdkEventResponse: EpSdkEventResponse = await EpSdkEpEventsService.updateEvent({
      eventId: epSdkEpEventTask_GetFuncReturn.epObject.id,
      requestBody: update
    });

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_UPDATE, module: this.constructor.name, details: {
      epSdkApplicationDomainTask_Config: this.getTaskConfig(),
      update: update,
      epSdkEventResponse: epSdkEventResponse,
    }}));

    /* istanbul ignore next */
    if(epSdkEventResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epSdkEventResponse.data === undefined', {
      epSdkEventResponse: epSdkEventResponse
    });
    const epSdkEpEventTask_UpdateFuncReturn: IEpSdkEpEventTask_UpdateFuncReturn = {
      epSdkTask_Action: this.getUpdateFuncAction(),
      epObject: epSdkEventResponse.data,
      epObjectKeys: this.getEpObjectKeys(epSdkEventResponse.data)
    };
    return epSdkEpEventTask_UpdateFuncReturn;
  }

  protected async deleteFunc(epSdkEpEventTask_GetFuncReturn: IEpSdkEpEventTask_GetFuncReturn): Promise<IEpSdkEpEventTask_DeleteFuncReturn> {
    const funcName = 'deleteFunc';
    const logName = `${EpSdkEpEventTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_DELETE, module: this.constructor.name }));

    if(epSdkEpEventTask_GetFuncReturn.epObject === undefined) throw new EpSdkInternalTaskError(logName, this.constructor.name, 'epSdkEpEventTask_GetFuncReturn.epObject === undefined');
    /* istanbul ignore next */
    if(epSdkEpEventTask_GetFuncReturn.epObject.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epSdkEpEventTask_GetFuncReturn.epObject.id === undefined', {
      epObject: epSdkEpEventTask_GetFuncReturn.epObject
    });

    if(this.isCheckmode()) {
      return {
        epSdkTask_Action: this.getDeleteFuncAction(),
        epObject: epSdkEpEventTask_GetFuncReturn.epObject,
        epObjectKeys: this.getEpObjectKeys(epSdkEpEventTask_GetFuncReturn.epObject)
      };
    }

    const epSdkEvent: EpSdkEvent = await EpSdkEpEventsService.deleteById({ 
      eventId: epSdkEpEventTask_GetFuncReturn.epObject.id,
    });

    const epSdkEpEventTask_DeleteFuncReturn: IEpSdkEpEventTask_DeleteFuncReturn = {
      epSdkTask_Action: this.getDeleteFuncAction(),
      epObject: epSdkEvent,
      epObjectKeys: this.getEpObjectKeys(epSdkEvent)
    };
    return epSdkEpEventTask_DeleteFuncReturn;
  }

  public async execute(): Promise<IEpSdkEpEventTask_ExecuteReturn> { 
    const epSdkTask_ExecuteReturn: IEpSdkEpEventTask_ExecuteReturn = await super.execute();
    return epSdkTask_ExecuteReturn;
  }

}
