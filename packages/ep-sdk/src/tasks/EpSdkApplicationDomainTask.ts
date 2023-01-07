/**
 * @packageDocumentation
 * 
 * Manage ApplicationDomains in an idempotent manner.
 * 
 * @example
 * [[include:applicationDomainTask.example.ts]]
 */
import { 
  ApplicationDomain, 
  ApplicationDomainResponse, 
  ApplicationDomainsService 
} from '@rjgu/ep-openapi-node';
import { 
  EpSdkApiContentError, 
  EpSdkInternalTaskError,
  EpSdkLogger,
  EEpSdkLoggerCodes
} from "../utils";
import { 
  EEpSdkObjectTypes
} from '../types';
import { 
  EpSdkApplicationDomainsService 
} from '../services';
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


type TEpSdkApplicationDomainTask_Settings = Partial<Pick<ApplicationDomain, "topicDomainEnforcementEnabled" | "uniqueTopicAddressEnforcementEnabled" | "description">>;
type TEpSdkApplicationDomainTask_CompareObject = TEpSdkApplicationDomainTask_Settings;

/** @category Tasks */
export interface IEpSdkApplicationDomainTask_Config extends IEpSdkTask_Config {
  /** Application domain name. Globally unique. */
  applicationDomainName: string;
  /**
   * settings
   */
  applicationDomainSettings?: TEpSdkApplicationDomainTask_Settings;
}
/** @category Tasks */
export interface IEpSdkApplicationDomainTask_Keys extends IEpSdkTask_Keys {
  applicationDomainName: string;
}
/** @category Tasks */
export interface IEpSdkApplicationDomainTask_GetFuncReturn extends Omit<IEpSdkTask_GetFuncReturn, "epObject"> {
  epObject: ApplicationDomain | undefined;
}
/** @category Tasks */
export interface IEpSdkApplicationDomainTask_CreateFuncReturn extends Omit<IEpSdkTask_CreateFuncReturn, "epObject" > {
  epObject: ApplicationDomain;
}
/** @category Tasks */
export interface IEpSdkApplicationDomainTask_UpdateFuncReturn extends Omit<IEpSdkTask_UpdateFuncReturn, "epObject"> {
  epObject: ApplicationDomain;
}
/** @category Tasks */
export interface IEpSdkApplicationDomainTask_DeleteFuncReturn extends Omit<IEpSdkTask_DeleteFuncReturn, "epObject"> {
  epObject: ApplicationDomain;
}
/** @category Tasks */
export interface IEpSdkApplicationDomainTask_ExecuteReturn extends Omit<IEpSdkTask_ExecuteReturn, "epObject"> {
  epObject: ApplicationDomain;
}

/** @category Tasks */
export class EpSdkApplicationDomainTask extends EpSdkTask {

  private readonly Empty_IEpSdkApplicationDomainTask_GetFuncReturn: IEpSdkApplicationDomainTask_GetFuncReturn = {
    epObjectKeys: this.getDefaultEpObjectKeys(),
    epObject: undefined,
    epObjectExists: false  
  };
  private readonly Default_TEpSdkApplicationDomainTask_Settings: TEpSdkApplicationDomainTask_Settings = {
    topicDomainEnforcementEnabled: false,
    uniqueTopicAddressEnforcementEnabled: true,
    // description: `Created by ${EpSdkConfig.getAppName()}.`,
  }
  private getTaskConfig(): IEpSdkApplicationDomainTask_Config { 
    return this.epSdkTask_Config as IEpSdkApplicationDomainTask_Config; 
  }
  private createObjectSettings(): Partial<ApplicationDomain> {
    return {
      ...this.Default_TEpSdkApplicationDomainTask_Settings,
      ...this.getTaskConfig().applicationDomainSettings,
    };
  }

  constructor(taskConfig: IEpSdkApplicationDomainTask_Config) {
    super(taskConfig);
  }

  protected getDefaultEpObjectKeys(): IEpSdkTask_EpObjectKeys {
    return {
      epObjectId: 'undefined',
      epObjectType: EEpSdkObjectTypes.APPLICATION_DOMAIN,
    };
  }

  protected getEpObjectKeys(epObject: ApplicationDomain | undefined): IEpSdkTask_EpObjectKeys {
    const funcName = 'getEpObjectKeys';
    const logName = `${EpSdkApplicationDomainTask.name}.${funcName}()`;
    
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

  protected getTaskKeys(): IEpSdkApplicationDomainTask_Keys {
    return {
      applicationDomainName: this.getTaskConfig().applicationDomainName
    }
  }

  protected async getFunc(epSdkApplicationDomainTask_Keys: IEpSdkApplicationDomainTask_Keys): Promise<IEpSdkApplicationDomainTask_GetFuncReturn> {
    const funcName = 'getFunc';
    const logName = `${EpSdkApplicationDomainTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_GET, module: this.constructor.name, details: {
      epSdkApplicationDomainTask_Keys: epSdkApplicationDomainTask_Keys
    }}));

    const applicationDomainName = epSdkApplicationDomainTask_Keys.applicationDomainName;

    const applicationDomain: ApplicationDomain | undefined = await EpSdkApplicationDomainsService.getByName({ applicationDomainName: applicationDomainName });

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_API_GET, module: this.constructor.name, details: {
      epSdkApplicationDomainTask_Keys: epSdkApplicationDomainTask_Keys,
      applicationDomain: applicationDomain ? applicationDomain : 'undefined'
    }}));

    if(applicationDomain === undefined) return this.Empty_IEpSdkApplicationDomainTask_GetFuncReturn;

    const epSdkApplicationDomainTask_GetFuncReturn: IEpSdkApplicationDomainTask_GetFuncReturn = {
      epObjectKeys: this.getEpObjectKeys(applicationDomain),
      epObject: applicationDomain,
      epObjectExists: true,
    };
    return epSdkApplicationDomainTask_GetFuncReturn;
  }

  protected async isUpdateRequiredFunc(epSdkApplicationDomainTask_GetFuncReturn: IEpSdkApplicationDomainTask_GetFuncReturn ): Promise<IEpSdkTask_IsUpdateRequiredFuncReturn> {
    const funcName = 'isUpdateRequiredFunc';
    const logName = `${EpSdkApplicationDomainTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_IS_UPDATE_REQUIRED, module: this.constructor.name, details: {
      epSdkApplicationDomainTask_GetFuncReturn: epSdkApplicationDomainTask_GetFuncReturn
    }}));

    if(epSdkApplicationDomainTask_GetFuncReturn.epObject === undefined) throw new EpSdkInternalTaskError(logName, this.constructor.name, 'epSdkApplicationDomainTask_GetFuncReturn.epObject === undefined');

    const existingObject: ApplicationDomain = epSdkApplicationDomainTask_GetFuncReturn.epObject;
    const existingCompareObject: TEpSdkApplicationDomainTask_CompareObject = {
      description: existingObject.description,
      topicDomainEnforcementEnabled: existingObject.topicDomainEnforcementEnabled,
      uniqueTopicAddressEnforcementEnabled: existingObject.uniqueTopicAddressEnforcementEnabled,
    }
    const requestedCompareObject: TEpSdkApplicationDomainTask_CompareObject = this.createObjectSettings();

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
    //   throw new Error(`${logName}: check updates required`);
    // }
    return epSdkTask_IsUpdateRequiredFuncReturn;
  }

  protected async createFunc(): Promise<IEpSdkApplicationDomainTask_CreateFuncReturn> {
    const funcName = 'createFunc';
    const logName = `${EpSdkApplicationDomainTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_CREATE, module: this.constructor.name }));

    const create: ApplicationDomain = {
      ...this.createObjectSettings(),
      name: this.getTaskConfig().applicationDomainName,
    };
    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_CREATE, module: this.constructor.name, details: {
      epSdkApplicationDomainTask_Config: this.getTaskConfig(),
      create: create,
    }}));

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

    const applicationDomainResponse: ApplicationDomainResponse = await ApplicationDomainsService.createApplicationDomain({
      requestBody: create
    });
  
    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_CREATE, module: this.constructor.name, details: {
      epSdkApplicationDomainTask_Config: this.getTaskConfig(),
      create: create,
      applicationDomainResponse: applicationDomainResponse
    }}));
    /* istanbul ignore next */
    if(applicationDomainResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'applicationDomainResponse.data === undefined', {
      epSdkApplicationDomainTask_Config: this.getTaskConfig(),
      create: create,
      applicationDomainResponse: applicationDomainResponse
    });
    return {
      epSdkTask_Action: this.getCreateFuncAction(),
      epObject: applicationDomainResponse.data,
      epObjectKeys: this.getEpObjectKeys(applicationDomainResponse.data)
    };
  }

  protected async updateFunc(epSdkApplicationDomainTask_GetFuncReturn: IEpSdkApplicationDomainTask_GetFuncReturn): Promise<IEpSdkApplicationDomainTask_UpdateFuncReturn> {
    const funcName = 'updateFunc';
    const logName = `${EpSdkApplicationDomainTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_UPDATE, module: this.constructor.name }));

    if(epSdkApplicationDomainTask_GetFuncReturn.epObject === undefined) throw new EpSdkInternalTaskError(logName, this.constructor.name, 'epSdkApplicationDomainTask_GetFuncReturn.epObject === undefined');
    /* istanbul ignore next */
    if(epSdkApplicationDomainTask_GetFuncReturn.epObject.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epSdkApplicationDomainTask_GetFuncReturn.epObject.id === undefined', {
      epObject: epSdkApplicationDomainTask_GetFuncReturn.epObject
    });
    
    const update: ApplicationDomain = {
      ...this.createObjectSettings(),
      name: this.getTaskConfig().applicationDomainName,
    };

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_UPDATE, module: this.constructor.name, details: {
      epSdkApplicationDomainTask_Config: this.getTaskConfig(),
      update: update,
    }}));

    if(this.isCheckmode()) {
      const wouldBe_EpObject: ApplicationDomain = {
        ...epSdkApplicationDomainTask_GetFuncReturn.epObject,
        ...update
      };
      return {
        epSdkTask_Action: this.getUpdateFuncAction(),
        epObject: wouldBe_EpObject,
        epObjectKeys: this.getEpObjectKeys(wouldBe_EpObject)
      };
    }

    const applicationDomainResponse: ApplicationDomainResponse = await ApplicationDomainsService.updateApplicationDomain({
      id: epSdkApplicationDomainTask_GetFuncReturn.epObject.id,
      requestBody: update
    });

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_UPDATE, module: this.constructor.name, details: {
      epSdkApplicationDomainTask_Config: this.getTaskConfig(),
      update: update,
      applicationDomainResponse: applicationDomainResponse,
    }}));
    /* istanbul ignore next */
    if(applicationDomainResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'applicationDomainResponse.data === undefined', {
      applicationDomainResponse: applicationDomainResponse
    });
    const epSdkApplicationDomainTask_UpdateFuncReturn: IEpSdkApplicationDomainTask_UpdateFuncReturn = {
      epSdkTask_Action: this.getUpdateFuncAction(),
      epObject: applicationDomainResponse.data,
      epObjectKeys: this.getEpObjectKeys(applicationDomainResponse.data)
    };
    return epSdkApplicationDomainTask_UpdateFuncReturn;
  }

  protected async deleteFunc(epSdkApplicationDomainTask_GetFuncReturn: IEpSdkApplicationDomainTask_GetFuncReturn): Promise<IEpSdkApplicationDomainTask_DeleteFuncReturn> {
    const funcName = 'deleteFunc';
    const logName = `${EpSdkApplicationDomainTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_DELETE, module: this.constructor.name }));

    if(epSdkApplicationDomainTask_GetFuncReturn.epObject === undefined) throw new EpSdkInternalTaskError(logName, this.constructor.name, 'epSdkApplicationDomainTask_GetFuncReturn.epObject === undefined');
    /* istanbul ignore next */
    if(epSdkApplicationDomainTask_GetFuncReturn.epObject.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epSdkApplicationDomainTask_GetFuncReturn.epObject.id === undefined', {
      epObject: epSdkApplicationDomainTask_GetFuncReturn.epObject
    });

    if(this.isCheckmode()) {
      return {
        epSdkTask_Action: this.getDeleteFuncAction(),
        epObject: epSdkApplicationDomainTask_GetFuncReturn.epObject,
        epObjectKeys: this.getEpObjectKeys(epSdkApplicationDomainTask_GetFuncReturn.epObject)
      };
    }

    const applicationDomain: ApplicationDomain = await EpSdkApplicationDomainsService.deleteById({
      applicationDomainId: epSdkApplicationDomainTask_GetFuncReturn.epObject.id,
    });

    const epSdkApplicationDomainTask_DeleteFuncReturn: IEpSdkApplicationDomainTask_DeleteFuncReturn = {
      epSdkTask_Action: this.getDeleteFuncAction(),
      epObject: applicationDomain,
      epObjectKeys: this.getEpObjectKeys(applicationDomain)
    };
    return epSdkApplicationDomainTask_DeleteFuncReturn;
  }

  public async execute(): Promise<IEpSdkApplicationDomainTask_ExecuteReturn> { 
    const epSdkTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await super.execute();
    return epSdkTask_ExecuteReturn;
  }

}
