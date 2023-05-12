import {
  TopicDomain,
  TopicDomainResponse,
  TopicDomainsService,
} from "@solace-labs/ep-openapi-node";
import {
  EpSdkApiContentError,
  EpSdkInternalTaskError,
  EpSdkLogger,
  EEpSdkLoggerCodes,
  EpSdkTaskUpdateNotSupportedError,
} from "../utils";
import { 
  EEpSdkObjectTypes, 
  EpSdkBrokerTypes 
} from "../types";
import { 
  EpSdkTopicDomainsService 
} from "../services";
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
export type TEpSdkTopicDomainTask_Settings = Partial<Pick<TopicDomain, "brokerType">> & Pick<TopicDomain, "addressLevels"> ;
type TEpSdkTopicDomainTask_CompareObject = TEpSdkTopicDomainTask_Settings;

/** @category Tasks */
export interface IEpSdkTopicDomainTask_Config extends IEpSdkTask_Config {
  applicationDomainId: string;
  topicDomainSettings: TEpSdkTopicDomainTask_Settings;
}
/** @category Tasks */
export interface IEpSdkTopicDomainTask_Keys extends IEpSdkTask_Keys {
  applicationDomainId: string;
}
/** @category Tasks */
export interface IEpSdkTopicDomainTask_GetFuncReturn extends Omit<IEpSdkTask_GetFuncReturn, "epObject"> {
  epObject: TopicDomain | undefined;
}
/** @category Tasks */
export interface IEpSdkTopicDomainTask_CreateFuncReturn extends Omit<IEpSdkTask_CreateFuncReturn, "epObject"> {
  epObject: TopicDomain;
}
/** @category Tasks */
export interface IEpSdkTopicDomainTask_UpdateFuncReturn extends Omit<IEpSdkTask_UpdateFuncReturn, "epObject"> {
  epObject: TopicDomain;
}
/** @category Tasks */
export interface IEpSdkTopicDomainTask_DeleteFuncReturn extends Omit<IEpSdkTask_DeleteFuncReturn, "epObject"> {
  epObject: TopicDomain;
}
/** @category Tasks */
export interface IEpSdkTopicDomainTask_ExecuteReturn extends Omit<IEpSdkTask_ExecuteReturn, "epObject"> {
  epObject: TopicDomain;
}

/**
 * Manages presence and absence of TopicDomain objects.
 * @category Tasks
 */
export class EpSdkTopicDomainTask extends EpSdkTask {
  private readonly Empty_IEpSdkTopicDomainTask_GetFuncReturn: IEpSdkTopicDomainTask_GetFuncReturn = {
    epObjectKeys: this.getDefaultEpObjectKeys(),
    epObject: undefined,
    epObjectExists: false,
  };
  private getTaskConfig(): IEpSdkTopicDomainTask_Config { return this.epSdkTask_Config as IEpSdkTopicDomainTask_Config; }
  private createObjectSettings(): Required<TEpSdkTopicDomainTask_Settings> {
    return {
      brokerType: EpSdkBrokerTypes.Solace,
      ...this.getTaskConfig().topicDomainSettings,
    };
  }

  constructor(taskConfig: IEpSdkTopicDomainTask_Config) {
    super(taskConfig);
  }

  protected getDefaultEpObjectKeys(): IEpSdkTask_EpObjectKeys {
    return {
      epObjectId: "undefined",
      epObjectType: EEpSdkObjectTypes.TOPIC_DOMAIN,
    };
  }

  protected getEpObjectKeys(epObject: TopicDomain | undefined): IEpSdkTask_EpObjectKeys {
    const funcName = "getEpObjectKeys";
    const logName = `${EpSdkTopicDomainTask.name}.${funcName}()`;
    if (epObject === undefined) return this.getDefaultEpObjectKeys();
    /* istanbul ignore next */
    if (epObject.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "epObject.id === undefined", { epObject: epObject });
    return {
      ...this.getDefaultEpObjectKeys(),
      epObjectId: epObject.id,
    };
  }

  protected getTaskKeys(): IEpSdkTopicDomainTask_Keys {
    return { 
      applicationDomainId: this.getTaskConfig().applicationDomainId,
    };
  }

  protected async getFunc(epSdkTopicDomainTask_Keys: IEpSdkTopicDomainTask_Keys): Promise<IEpSdkTopicDomainTask_GetFuncReturn> {
    const funcName = "getFunc";
    const logName = `${EpSdkTopicDomainTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_GET, module: this.constructor.name, details: { epSdkTopicDomainTask_Keys }}));

    const topicDomain: TopicDomain | undefined = await EpSdkTopicDomainsService.getByApplicationDomainId({
      xContextId: this.xContextId,
      applicationDomainId: epSdkTopicDomainTask_Keys.applicationDomainId
    });

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_API_GET, module: this.constructor.name, details: {
      epSdkTopicDomainTask_Keys, 
      topicDomain: topicDomain ? topicDomain : "undefined"
    }}));

    if(topicDomain === undefined) return this.Empty_IEpSdkTopicDomainTask_GetFuncReturn;

    const epSdkTopicDomainTask_GetFuncReturn: IEpSdkTopicDomainTask_GetFuncReturn = {
      epObjectKeys: this.getEpObjectKeys(topicDomain),
      epObject: topicDomain,
      epObjectExists: true,
    };
    return epSdkTopicDomainTask_GetFuncReturn;
  }

  protected async isUpdateRequiredFunc(epSdkTopicDomainTask_GetFuncReturn: IEpSdkTopicDomainTask_GetFuncReturn): Promise<IEpSdkTask_IsUpdateRequiredFuncReturn> {
    const funcName = "isUpdateRequiredFunc";
    const logName = `${EpSdkTopicDomainTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_IS_UPDATE_REQUIRED, module: this.constructor.name, details: {
      epSdkTopicDomainTask_GetFuncReturn,
    }}));
    /* istanbul ignore next */
    if(epSdkTopicDomainTask_GetFuncReturn.epObject === undefined) throw new EpSdkInternalTaskError(logName, this.constructor.name, "epSdkTopicDomainTask_GetFuncReturn.epObject === undefined");

    const existingObject: TopicDomain = epSdkTopicDomainTask_GetFuncReturn.epObject;
    const existingCompareObject: TEpSdkTopicDomainTask_CompareObject = {
      addressLevels: existingObject.addressLevels ? existingObject.addressLevels : [],
      brokerType: existingObject.brokerType
    };
    const requestedCompareObject: TEpSdkTopicDomainTask_CompareObject = this.createObjectSettings();

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

  protected async createFunc(): Promise<IEpSdkTopicDomainTask_CreateFuncReturn> {
    const funcName = "createFunc";
    const logName = `${EpSdkTopicDomainTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_CREATE, module: this.constructor.name, }));

    const create: TopicDomain = {
      ...this.createObjectSettings(),
      applicationDomainId: this.getTaskConfig().applicationDomainId,
    };

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_CREATE, module: this.constructor.name, details: {
      epSdkApplicationTask_Config: this.getTaskConfig(),
      create,
    }}));

    if(this.isCheckmode()) {
      return {
        epSdkTask_Action: this.getCreateFuncAction(),
        epObject: create,
        epObjectKeys: this.getEpObjectKeys({
          ...create,
          id: "undefined",
        }),
      };
    }
    const topicDomainResponse: TopicDomainResponse = await TopicDomainsService.createTopicDomain({
      xContextId: this.xContextId,
      requestBody: create
    });
    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_CREATE, module: this.constructor.name, details: {
      epSdkApplicationTask_Config: this.getTaskConfig(),
      create,
      topicDomainResponse
    }}));

    /* istanbul ignore next */
    if (topicDomainResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "topicDomainResponse.data === undefined", {
      epSdkCustomAttributeDefinitionTask_Config: this.getTaskConfig(),
      create,
      topicDomainResponse
    });
    return {
      epSdkTask_Action: this.getCreateFuncAction(),
      epObject: topicDomainResponse.data,
      epObjectKeys: this.getEpObjectKeys(topicDomainResponse.data),
    };
  }

  protected async updateFunc(epSdkTopicDomainTask_GetFuncReturn: IEpSdkTopicDomainTask_GetFuncReturn): Promise<IEpSdkTopicDomainTask_UpdateFuncReturn> {
    const funcName = "updateFunc";
    const logName = `${EpSdkTopicDomainTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_UPDATE, module: this.constructor.name }));

    /* istanbul ignore next */
    if (epSdkTopicDomainTask_GetFuncReturn.epObject === undefined) throw new EpSdkInternalTaskError( logName, this.constructor.name, "epSdkTopicDomainTask_GetFuncReturn.epObject === undefined");
    /* istanbul ignore next */
    if (epSdkTopicDomainTask_GetFuncReturn.epObject.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "epSdkTopicDomainTask_GetFuncReturn.epObject.id === undefined", {
      epObject: epSdkTopicDomainTask_GetFuncReturn.epObject,
    });

    const update: TopicDomain = {
      ...this.createObjectSettings(),
      applicationDomainId: this.getTaskConfig().applicationDomainId,
    };

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_UPDATE, module: this.constructor.name, details: {
      epSdkTopicDomainTask_Config: this.getTaskConfig(),
      update
    }}));

    if(this.isCheckmode()) {
      const wouldBe_EpObject: TopicDomain = {
        ...epSdkTopicDomainTask_GetFuncReturn.epObject,
        ...update,
      };
      const epSdkTask_Action = this.getUpdateFuncAction(true);
      const issue = {
        message: "cannot update a TopicDomain object",
        requestedUpdate: {
          from: epSdkTopicDomainTask_GetFuncReturn.epObject,
          to: wouldBe_EpObject
        }
      };
      return {
        issue: issue,
        epSdkTask_Action: epSdkTask_Action,
        epObject: wouldBe_EpObject,
        epObjectKeys: this.getEpObjectKeys(wouldBe_EpObject),
      };
    }

    throw new EpSdkTaskUpdateNotSupportedError(logName, this.constructor.name, EEpSdkObjectTypes.TOPIC_DOMAIN, {
      requestedUpdate: {
        from: epSdkTopicDomainTask_GetFuncReturn.epObject,
        to: {
          ...epSdkTopicDomainTask_GetFuncReturn.epObject,
          ...update,  
        }
      }
    });
  }

  protected async deleteFunc(epSdkTopicDomainTask_GetFuncReturn: IEpSdkTopicDomainTask_GetFuncReturn): Promise<IEpSdkTopicDomainTask_DeleteFuncReturn> {
    const funcName = "deleteFunc";
    const logName = `${EpSdkTopicDomainTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_DELETE, module: this.constructor.name, }));

    /* istanbul ignore next */
    if (epSdkTopicDomainTask_GetFuncReturn.epObject === undefined) throw new EpSdkInternalTaskError(logName, this.constructor.name, "epSdkTopicDomainTask_GetFuncReturn.epObject === undefined");
    /* istanbul ignore next */
    if (epSdkTopicDomainTask_GetFuncReturn.epObject.id === undefined) throw new EpSdkApiContentError( logName, this.constructor.name, "epSdkTopicDomainTask_GetFuncReturn.epObject.id === undefined", {
      epObject: epSdkTopicDomainTask_GetFuncReturn.epObject,
    });

    if (this.isCheckmode()) {
      return {
        epSdkTask_Action: this.getDeleteFuncAction(),
        epObject: epSdkTopicDomainTask_GetFuncReturn.epObject,
        epObjectKeys: this.getEpObjectKeys(epSdkTopicDomainTask_GetFuncReturn.epObject),
      };
    }
    await TopicDomainsService.deleteTopicDomain({
      xContextId: this.xContextId,
      id: epSdkTopicDomainTask_GetFuncReturn.epObject.id
    });
    const epSdkTopicDomainTask_DeleteFuncReturn: IEpSdkTopicDomainTask_DeleteFuncReturn = {
      epSdkTask_Action: this.getDeleteFuncAction(),
      epObject: epSdkTopicDomainTask_GetFuncReturn.epObject,
      epObjectKeys: this.getEpObjectKeys(epSdkTopicDomainTask_GetFuncReturn.epObject),
    };
    return epSdkTopicDomainTask_DeleteFuncReturn;
  }

  public async execute(xContextId?: string): Promise<IEpSdkTopicDomainTask_ExecuteReturn> {
    const epSdkTask_ExecuteReturn: IEpSdkTopicDomainTask_ExecuteReturn = await super.execute(xContextId);
    return epSdkTask_ExecuteReturn;
  }
}
