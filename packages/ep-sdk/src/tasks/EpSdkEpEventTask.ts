import { 
  Event as EpEvent,
  EventResponse,
  EventsService,
} from '@solace-labs/ep-openapi-node';
import { 
  EpSdkApiContentError, 
  EpSdkInternalTaskError,
  EpSdkLogger,
  EEpSdkLoggerCodes
} from "../utils";
import { 
  EpSdkEpEventsService 
} from '../services';
import { 
  EEpSdkObjectTypes 
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
export type TEpSdkEpEventTask_Settings = Partial<Pick<EpEvent, "shared">>;
type TEpSdkEpEventTask_CompareObject = TEpSdkEpEventTask_Settings;

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
  epObject: EpEvent | undefined;
}
/** @category Tasks */
export interface IEpSdkEpEventTask_CreateFuncReturn extends Omit<IEpSdkTask_CreateFuncReturn, "epObject" > {
  epObject: EpEvent;
}
/** @category Tasks */
export interface IEpSdkEpEventTask_UpdateFuncReturn extends Omit<IEpSdkTask_UpdateFuncReturn, "epObject"> {
  epObject: EpEvent;
}
/** @category Tasks */
export interface IEpSdkEpEventTask_DeleteFuncReturn extends Omit<IEpSdkTask_DeleteFuncReturn, "epObject"> {
  epObject: EpEvent;
}
/** @category Tasks */
export interface IEpSdkEpEventTask_ExecuteReturn extends Omit<IEpSdkTask_ExecuteReturn, "epObject"> {
  epObject: EpEvent;
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
  }
  private getTaskConfig(): IEpSdkEpEventTask_Config { 
    return this.epSdkTask_Config as IEpSdkEpEventTask_Config; 
  }
  private createObjectSettings(): Partial<EpEvent> {
    return {
      ...this.Default_TEpSdkEpEventTask_Settings,
      ...this.getTaskConfig().eventObjectSettings,
    };
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

  protected getEpObjectKeys(epObject: EpEvent | undefined): IEpSdkTask_EpObjectKeys {
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

    const epEvent: EpEvent | undefined = await EpSdkEpEventsService.getByName({ 
      eventName: epSdkEpEventTask_Keys.eventName,
      applicationDomainId: epSdkEpEventTask_Keys.applicationDomainId
    });

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_API_GET, module: this.constructor.name, details: {
      epSdkEpEventTask_Keys: epSdkEpEventTask_Keys,
      epEvent: epEvent ? epEvent : 'undefined'
    }}));

    if(epEvent === undefined) return this.Empty_IEpSdkEpEventTask_GetFuncReturn;

    const epSdkEpEventTask_GetFuncReturn: IEpSdkEpEventTask_GetFuncReturn = {
      epObjectKeys: this.getEpObjectKeys(epEvent),
      epObject: epEvent,
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

    const existingObject: EpEvent = epSdkEpEventTask_GetFuncReturn.epObject;
    const existingCompareObject: TEpSdkEpEventTask_CompareObject = {
      shared: existingObject.shared,
    }
    const requestedCompareObject: TEpSdkEpEventTask_CompareObject = this.createObjectSettings();

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

    const create: EpEvent = {
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

    const eventResponse: EventResponse = await EventsService.createEvent({
      requestBody: create
    });

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_CREATE, module: this.constructor.name, details: {
      epSdkEpEventTask_Config: this.getTaskConfig(),
      create: create,
      eventResponse: eventResponse
    }}));

    /* istanbul ignore next */
    if(eventResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventResponse.data === undefined', {
      epSdkApplicationDomainTask_Config: this.getTaskConfig(),
      create: create,
      eventResponse: eventResponse
    });
    return {
      epSdkTask_Action: this.getCreateFuncAction(),
      epObject: eventResponse.data,
      epObjectKeys: this.getEpObjectKeys(eventResponse.data)
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

    const update: EpEvent = {
      ...this.createObjectSettings(),
      applicationDomainId: this.getTaskConfig().applicationDomainId,
      name: this.getTaskConfig().eventName,
    };

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_UPDATE, module: this.constructor.name, details: {
      epSdkEpEventTask_Config: this.getTaskConfig(),
      update: update,
    }}));

    if(this.isCheckmode()) {
      const wouldBe_EpObject: EpEvent = {
        ...epSdkEpEventTask_GetFuncReturn.epObject,
        ...update
      };
      return {
        epSdkTask_Action: this.getUpdateFuncAction(),
        epObject: wouldBe_EpObject,
        epObjectKeys: this.getEpObjectKeys(wouldBe_EpObject)
      };
    }

    const eventResponse: EventResponse = await EventsService.updateEvent({
      id: epSdkEpEventTask_GetFuncReturn.epObject.id,
      requestBody: update
    });

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_UPDATE, module: this.constructor.name, details: {
      epSdkApplicationDomainTask_Config: this.getTaskConfig(),
      update: update,
      eventResponse: eventResponse,
    }}));

    /* istanbul ignore next */
    if(eventResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventResponse.data === undefined', {
      eventResponse: eventResponse
    });
    const epSdkEpEventTask_UpdateFuncReturn: IEpSdkEpEventTask_UpdateFuncReturn = {
      epSdkTask_Action: this.getUpdateFuncAction(),
      epObject: eventResponse.data,
      epObjectKeys: this.getEpObjectKeys(eventResponse.data)
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

    const epEvent: EpEvent = await EpSdkEpEventsService.deleteById({ 
      eventId: epSdkEpEventTask_GetFuncReturn.epObject.id,
    });

    const epSdkEpEventTask_DeleteFuncReturn: IEpSdkEpEventTask_DeleteFuncReturn = {
      epSdkTask_Action: this.getDeleteFuncAction(),
      epObject: epEvent,
      epObjectKeys: this.getEpObjectKeys(epEvent)
    };
    return epSdkEpEventTask_DeleteFuncReturn;
  }

  public async execute(): Promise<IEpSdkEpEventTask_ExecuteReturn> { 
    const epSdkTask_ExecuteReturn: IEpSdkEpEventTask_ExecuteReturn = await super.execute();
    return epSdkTask_ExecuteReturn;
  }

}
