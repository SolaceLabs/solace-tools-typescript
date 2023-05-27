/**
 * @packageDocumentation
 *
 * Manage ApplicationDomains in an idempotent manner.
 *
 * @example
 * [[include:applicationDomainTask.example.ts]]
 */
import {
  AddressLevel,
  ApplicationDomain,
  ApplicationDomainResponse,
  ApplicationDomainsService,
  TopicDomain,
  TopicDomainResponse,
  TopicDomainsResponse,
  TopicDomainsService,
} from "@solace-labs/ep-openapi-node";
import {
  EpSdkApiContentError,
  EpSdkInternalTaskError,
  EpSdkLogger,
  EEpSdkLoggerCodes,
} from "../utils";
import { 
  EEpSdkObjectTypes, 
  EpSdkBrokerTypes, 
} from "../types";
import { 
  EpSdkApplicationDomainsService, 
  EpSdkTopicAddressLevelService, 
  EpSdkTopicDomainsService 
} from "../services";
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
export type TEpSdkApplicationDomainTask_TopicDomainSettings = {
  brokerType: EpSdkBrokerTypes;
  topicDelimiter?: string[1];
  topicString: string;
  enumApplicationDomainIds?: Array<string>;
}
/** @category Tasks */
export type TEpSdkApplicationDomainTask_Settings = Partial<Pick<ApplicationDomain, "topicDomainEnforcementEnabled" | "uniqueTopicAddressEnforcementEnabled" | "description">> & {
  topicDomains?: Array<TEpSdkApplicationDomainTask_TopicDomainSettings>;
};
type TEpSdkApplicationDomainTask_CompareObject = Omit<TEpSdkApplicationDomainTask_Settings, "topicDomains"> & {
  topicDomains?: Array<TopicDomain>;
}

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
  epTopicDomains?: Array<TopicDomain>;
}
/** @category Tasks */
export interface IEpSdkApplicationDomainTask_CreateFuncReturn extends Omit<IEpSdkTask_CreateFuncReturn, "epObject"> {
  epObject: ApplicationDomain;
  epTopicDomains?: Array<TopicDomain>;
}
/** @category Tasks */
export interface IEpSdkApplicationDomainTask_UpdateFuncReturn extends Omit<IEpSdkTask_UpdateFuncReturn, "epObject"> {
  epObject: ApplicationDomain;
  epTopicDomains?: Array<TopicDomain>;
}
/** @category Tasks */
export interface IEpSdkApplicationDomainTask_DeleteFuncReturn extends Omit<IEpSdkTask_DeleteFuncReturn, "epObject"> {
  epObject: ApplicationDomain;
  epTopicDomains?: Array<TopicDomain>;
}
/** @category Tasks */
export interface IEpSdkApplicationDomainTask_ExecuteReturn extends Omit<IEpSdkTask_ExecuteReturn, "epObject"> {
  epObject: ApplicationDomain;
  epTopicDomains?: Array<TopicDomain>;
}

/** @category Tasks */
export class EpSdkApplicationDomainTask extends EpSdkTask {
  private readonly Empty_IEpSdkApplicationDomainTask_GetFuncReturn: IEpSdkApplicationDomainTask_GetFuncReturn = {
    epObjectKeys: this.getDefaultEpObjectKeys(),
    epObject: undefined,
    epObjectExists: false,
  };
  private readonly Default_TEpSdkApplicationDomainTask_Settings: TEpSdkApplicationDomainTask_Settings = {
    topicDomainEnforcementEnabled: false,
    uniqueTopicAddressEnforcementEnabled: true,
  };
  private getTaskConfig(): IEpSdkApplicationDomainTask_Config {
    return this.epSdkTask_Config as IEpSdkApplicationDomainTask_Config;
  }
  private createObjectSettings(): Partial<ApplicationDomain> {
    const settings: any = {
      ...this.Default_TEpSdkApplicationDomainTask_Settings,
      ...this.getTaskConfig().applicationDomainSettings,
    };
    delete settings.epTopicDomains;
    return settings;
  }

  constructor(taskConfig: IEpSdkApplicationDomainTask_Config) {
    super(taskConfig);
  }

  protected getDefaultEpObjectKeys(): IEpSdkTask_EpObjectKeys {
    return {
      epObjectId: "undefined",
      epObjectType: EEpSdkObjectTypes.APPLICATION_DOMAIN,
    };
  }

  protected getEpObjectKeys(epObject: ApplicationDomain | undefined): IEpSdkTask_EpObjectKeys {
    const funcName = "getEpObjectKeys";
    const logName = `${EpSdkApplicationDomainTask.name}.${funcName}()`;
    if(epObject === undefined) return this.getDefaultEpObjectKeys();
    /* istanbul ignore next */
    if(epObject.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "epObject.id === undefined", { epObject: epObject });
    return {
      ...this.getDefaultEpObjectKeys(),
      epObjectId: epObject.id,
    };
  }

  protected getTaskKeys(): IEpSdkApplicationDomainTask_Keys {
    return {
      applicationDomainName: this.getTaskConfig().applicationDomainName,
    };
  }

  protected async getFunc(epSdkApplicationDomainTask_Keys: IEpSdkApplicationDomainTask_Keys): Promise<IEpSdkApplicationDomainTask_GetFuncReturn> {
    const funcName = "getFunc";
    const logName = `${EpSdkApplicationDomainTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_GET, module: this.constructor.name, details: {
      epSdkApplicationDomainTask_Keys: epSdkApplicationDomainTask_Keys,
    }}));
    const applicationDomainName = epSdkApplicationDomainTask_Keys.applicationDomainName;
    const applicationDomain: ApplicationDomain | undefined = await EpSdkApplicationDomainsService.getByName({
      xContextId: this.xContextId,
      applicationDomainName: applicationDomainName,
    });
    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_API_GET, module: this.constructor.name, details: {
      epSdkApplicationDomainTask_Keys: epSdkApplicationDomainTask_Keys,
      applicationDomain: applicationDomain ? applicationDomain : "undefined",
    }}));
    if(applicationDomain === undefined) return this.Empty_IEpSdkApplicationDomainTask_GetFuncReturn;
    /* istanbul ignore next */
    if(applicationDomain.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "applicationDomain.id === undefined", { applicationDomain }); 
    // get the topic domains
    const topicDomainsResponse: TopicDomainsResponse = await EpSdkTopicDomainsService.listAll({ applicationDomainId: applicationDomain.id });
    const epSdkApplicationDomainTask_GetFuncReturn: IEpSdkApplicationDomainTask_GetFuncReturn = {
      epObjectKeys: this.getEpObjectKeys(applicationDomain),
      epObject: applicationDomain,
      epObjectExists: true,
      epTopicDomains: topicDomainsResponse.data
    };
    return epSdkApplicationDomainTask_GetFuncReturn;
  }

  private sortTopicDomains({ topicDomains }:{
    topicDomains: Array<TopicDomain>;
  }): Array<TopicDomain> {
    return topicDomains.sort((one: TopicDomain, two: TopicDomain) => {
      const oneTopicString = one.addressLevels.map( (x) => { return x.name; }).join('/');
      const twoTopicString = two.addressLevels.map( (x) => { return x.name; }).join('/');
      if(oneTopicString>twoTopicString) return -1;
      if(twoTopicString>oneTopicString) return 1;
      return 0;
    });
  }

  private async createEpTopicDomainsFromTopicDomainSettings({ applicationDomainId }:{
    applicationDomainId: string;
  }): Promise<Array<TopicDomain> | undefined> {
    if(this.getTaskConfig().applicationDomainSettings.topicDomains === undefined) return undefined;
    const topicDomains: Array<TopicDomain> = [];
    for(const epSdkApplicationDomainTask_TopicDomainSettings of this.getTaskConfig().applicationDomainSettings.topicDomains) {
      const addressLevels: Array<AddressLevel> = await EpSdkTopicAddressLevelService.createTopicAddressLevels({
        xContextId: this.xContextId,
        topicString: epSdkApplicationDomainTask_TopicDomainSettings.topicString,
        topicDelimiter: epSdkApplicationDomainTask_TopicDomainSettings.topicDelimiter,
        enumApplicationDomainIds: epSdkApplicationDomainTask_TopicDomainSettings.enumApplicationDomainIds
      });
      const topicDomain: TopicDomain = {
        brokerType: epSdkApplicationDomainTask_TopicDomainSettings.brokerType,
        addressLevels: addressLevels,
        applicationDomainId
      }
      topicDomains.push(topicDomain);
    }
    return topicDomains;
  }

  protected async isUpdateRequiredFunc(epSdkApplicationDomainTask_GetFuncReturn: IEpSdkApplicationDomainTask_GetFuncReturn): Promise<IEpSdkTask_IsUpdateRequiredFuncReturn> {
    const funcName = "isUpdateRequiredFunc";
    const logName = `${EpSdkApplicationDomainTask.name}.${funcName}()`;
    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_IS_UPDATE_REQUIRED, module: this.constructor.name, details: { epSdkApplicationDomainTask_GetFuncReturn }}));

    /* istanbul ignore next */
    if (epSdkApplicationDomainTask_GetFuncReturn.epObject === undefined) throw new EpSdkInternalTaskError(logName, this.constructor.name, "epSdkApplicationDomainTask_GetFuncReturn.epObject === undefined");
    /* istanbul ignore next */
    if (epSdkApplicationDomainTask_GetFuncReturn.epObject.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "epSdkApplicationDomainTask_GetFuncReturn.epObject.id", { epSdkApplicationDomainTask_GetFuncReturn });
    // application domain
    const existingObject: ApplicationDomain = epSdkApplicationDomainTask_GetFuncReturn.epObject;
    let existingTopicDomains: Array<TopicDomain> | undefined = undefined;
    if(epSdkApplicationDomainTask_GetFuncReturn.epTopicDomains) {
      existingTopicDomains = this.sortTopicDomains({ 
        topicDomains: epSdkApplicationDomainTask_GetFuncReturn.epTopicDomains.map( (x) => {
          return {
            applicationDomainId: x.applicationDomainId,
            addressLevels: x.addressLevels,
            brokerType: x.brokerType,
          };
        })});
    }
    const existingCompareObject: TEpSdkApplicationDomainTask_CompareObject = {
      description: existingObject.description,
      topicDomainEnforcementEnabled: existingObject.topicDomainEnforcementEnabled,
      uniqueTopicAddressEnforcementEnabled: existingObject.uniqueTopicAddressEnforcementEnabled,
      topicDomains: existingTopicDomains,
    }
    const requestedTopicDomains: Array<TopicDomain> | undefined = await this.createEpTopicDomainsFromTopicDomainSettings({ applicationDomainId: epSdkApplicationDomainTask_GetFuncReturn.epObject.id });
    let sortedRequestedTopicDomains: Array<TopicDomain> | undefined = undefined;
    if(requestedTopicDomains) {
      sortedRequestedTopicDomains = this.sortTopicDomains({ topicDomains: requestedTopicDomains });
    }
    const requestedCompareObject: TEpSdkApplicationDomainTask_CompareObject = {
      ...this.createObjectSettings(),
      topicDomains: sortedRequestedTopicDomains ? sortedRequestedTopicDomains : [],
    }

    const epSdkTask_IsUpdateRequiredFuncReturn: IEpSdkTask_IsUpdateRequiredFuncReturn = this.create_IEpSdkTask_IsUpdateRequiredFuncReturn({
      existingObject: existingCompareObject,
      requestedObject: requestedCompareObject,
    });
    // DEBUG:
    // if(epSdkTask_IsUpdateRequiredFuncReturn.isUpdateRequired) {
    //   console.log(`${logName}: check updates required, details=\n${JSON.stringify({
    //     epSdkTask_Config: this.epSdkTask_Config,
    //     epSdkTask_IsUpdateRequiredFuncReturn: epSdkTask_IsUpdateRequiredFuncReturn
    //   }, null, 2)}`);
    //   throw new Error(`${logName}: check updates required`);
    // }
    return epSdkTask_IsUpdateRequiredFuncReturn;
  }

  private async createWouldBeTopicDomains({ applicationDomainId }:{
    applicationDomainId: string;
  }): Promise<Array<TopicDomain>> {
    const createdTopicDomains: Array<TopicDomain> = [];
    if(this.getTaskConfig().applicationDomainSettings && this.getTaskConfig().applicationDomainSettings.topicDomains) {
      for(const topicDomainSettings of this.getTaskConfig().applicationDomainSettings.topicDomains) {
        const topicDomain: TopicDomain = {
          applicationDomainId: applicationDomainId,
          brokerType: topicDomainSettings.brokerType,
          addressLevels: await EpSdkTopicAddressLevelService.createTopicAddressLevels({
            xContextId: this.xContextId,
            topicString: topicDomainSettings.topicString,
            topicDelimiter: topicDomainSettings.topicDelimiter,
            enumApplicationDomainIds: topicDomainSettings.enumApplicationDomainIds
          })
        };
        createdTopicDomains.push(topicDomain);  
      }
      return createdTopicDomains;
    }
  }

  private async createTopicDomains({ applicationDomainId }:{
    applicationDomainId: string;
  }): Promise<Array<TopicDomain>> {
    const createdTopicDomains: Array<TopicDomain> = [];
    if(this.getTaskConfig().applicationDomainSettings && this.getTaskConfig().applicationDomainSettings.topicDomains) {
      for(const topicDomainSettings of this.getTaskConfig().applicationDomainSettings.topicDomains) {
        const topicDomainResponse: TopicDomainResponse = await TopicDomainsService.createTopicDomain({
          xContextId: this.xContextId,
          requestBody: {
            applicationDomainId,
            brokerType: topicDomainSettings.brokerType,
            addressLevels: await EpSdkTopicAddressLevelService.createTopicAddressLevels({
              xContextId: this.xContextId,
              topicString: topicDomainSettings.topicString,
              topicDelimiter: topicDomainSettings.topicDelimiter,
              enumApplicationDomainIds: topicDomainSettings.enumApplicationDomainIds
            })
          }
        });
        createdTopicDomains.push(topicDomainResponse.data);  
      }
    }
    return createdTopicDomains;
  }

  private async deleteTopicDomains({ applicationDomainId, topicDomains }:{
    applicationDomainId: string;
    topicDomains?: Array<TopicDomain>;
  }): Promise<Array<TopicDomain>> {    
    const deletedTopicDomains: Array<TopicDomain> = [];
    if(topicDomains === undefined || topicDomains.length === 0) return deletedTopicDomains;
    for(const topicDomain of topicDomains) {
      // final check
      if(topicDomain.applicationDomainId === applicationDomainId) {
        await TopicDomainsService.deleteTopicDomain({ xContextId: this.xContextId, id: topicDomain.id });
        deletedTopicDomains.push(topicDomain);
      }
    }
    return deletedTopicDomains;
  }

  // // TODO: to base class
  // protected createCustomAttributes({ epSdkCustomAttributeList, customAttributeDefinitions }:{
  //   epSdkCustomAttributeList?: TEpSdkCustomAttributeList;
  //   customAttributeDefinitions?: Array<CustomAttributeDefinition>;
  // }): Array<CustomAttribute> | undefined {
  //   const funcName = "createCustomAttributes";
  //   const logName = `${EpSdkApplicationDomainTask.name}.${funcName}()`;
  //   /* istanbul ignore next */
  //   if(epSdkCustomAttributeList === undefined || epSdkCustomAttributeList.length === 0) return undefined;
  //   /* istanbul ignore next */
  //   if(customAttributeDefinitions === undefined) throw new EpSdkInternalTaskError(logName, this.constructor.name, {
  //     message: 'customAttributeDefinitions === undefined',
  //     epSdkCustomAttributeList
  //   });
  //   /* istanbul ignore next */
  //   if(customAttributeDefinitions.length === 0) throw new EpSdkInternalTaskError(logName, this.constructor.name, {
  //     message: 'customAttributeDefinitions.length === 0',
  //     epSdkCustomAttributeList
  //   });
  //   const customAttributes: Array<CustomAttribute> = [];
  //   for(const epSdkCustomAttribute of epSdkCustomAttributeList) {
  //     const found = customAttributeDefinitions.find(x => x.name === epSdkCustomAttribute.name );
  //     /* istanbul ignore next */
  //     if(found === undefined) throw new EpSdkInternalTaskError(logName, this.constructor.name, {
  //       message: 'cound not find customAttributeDefintion for name',
  //       name: epSdkCustomAttribute.name,
  //       customAttributeDefinitions,
  //     });
  //     const customAttribute: CustomAttribute = {
  //       customAttributeDefinitionId: found.id,
  //       customAttributeDefinitionName: epSdkCustomAttribute.name,
  //       value: epSdkCustomAttribute.value,
  //     };
  //     customAttributes.push(customAttribute);
  //   }
  //   return customAttributes;
  // }

  // // TODO: to base class
  // protected createCustomAttributes4Checkmode({ epSdkCustomAttributeList }:{
  //   epSdkCustomAttributeList: TEpSdkCustomAttributeList;
  // }): Array<CustomAttribute> | undefined {
  //   if(epSdkCustomAttributeList === undefined || epSdkCustomAttributeList.length === 0) return undefined;
  //   return epSdkCustomAttributeList.map((epSdkCustomAttribute) => {
  //     return {
  //       customAttributeDefinitionId: 'undefined',
  //       customAttributeDefinitionName: epSdkCustomAttribute.name,
  //       value: epSdkCustomAttribute.value
  //     };
  //   });
  // }

  // // TODO: to base class
  // protected async presentCustomAttributeDefinitions({ applicationDomainId, epSdkCustomAttributeList }:{
  //   applicationDomainId: string;
  //   epSdkCustomAttributeList?: TEpSdkCustomAttributeList;
  // }): Promise<Array<CustomAttributeDefinition> | undefined> {
  //   // const funcName = "presentCustomAttributeDefinitions";
  //   // const logName = `${EpSdkApplicationDomainTask.name}.${funcName}()`;
  //   if(epSdkCustomAttributeList === undefined || epSdkCustomAttributeList.length === 0) return undefined;
  //   const associatedEntityType = this.getEpObjectType() as unknown as EEpSdkCustomAttributeEntityTypes;
  //   // create present list
  //   const internalPresentEpSdkCustomAttributeList: TEpSdkCustomAttributeList = epSdkCustomAttributeList.map( (epSdkCustomAttribute) => {
  //     return {
  //       ...epSdkCustomAttribute,
  //       applicationDomainId: epSdkCustomAttribute.scope === CustomAttributeDefinition.scope.APPLICATION_DOMAIN ? applicationDomainId : undefined,
  //     }
  //   });
  //   const customAttributeDefinitions = await EpSdkCustomAttributeDefinitionsService.presentCustomAttributeDefinitions({
  //     xContextId: this.xContextId,
  //     epSdkCustomAttributeList: internalPresentEpSdkCustomAttributeList,
  //     associatedEntityType,
  //   });
  //   return customAttributeDefinitions;
  // }

  // private async createApplicationDomain(): Promise<ApplicationDomain> {
  //   const funcName = "createApplicationDomain";
  //   const logName = `${EpSdkApplicationDomainTask.name}.${funcName}()`;

  //   const create: ApplicationDomain = {
  //     ...this.createObjectSettings(),
  //     name: this.getTaskConfig().applicationDomainName,
  //     customAttributes: undefined
  //   };

  //   const applicationDomainResponse: ApplicationDomainResponse = await ApplicationDomainsService.createApplicationDomain({
  //     xContextId: this.xContextId,
  //     requestBody: create,
  //   });
  //   /* istanbul ignore next */
  //   if(applicationDomainResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "applicationDomainResponse.data === undefined", { applicationDomainResponse });
  //   return applicationDomainResponse.data;
  // }

  protected async createFunc(): Promise<IEpSdkApplicationDomainTask_CreateFuncReturn> {
    const funcName = "createFunc";
    const logName = `${EpSdkApplicationDomainTask.name}.${funcName}()`;
    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_CREATE, module: this.constructor.name }));

    const create: ApplicationDomain = {
      ...this.createObjectSettings(),
      name: this.getTaskConfig().applicationDomainName,
    };
    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_CREATE, module: this.constructor.name, details: {
      epSdkApplicationDomainTask_Config: this.getTaskConfig(),
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

    const applicationDomainResponse: ApplicationDomainResponse = await ApplicationDomainsService.createApplicationDomain({
      xContextId: this.xContextId,
      requestBody: create,
    });
    /* istanbul ignore next */
    if(applicationDomainResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "applicationDomainResponse.data === undefined", { applicationDomainResponse });
    /* istanbul ignore next */
    if(applicationDomainResponse.data.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "applicationDomainResponse.data.id === undefined", { applicationDomainResponse });
    const applicationDomainId = applicationDomainResponse.data.id;
    const applicationDomain = applicationDomainResponse.data;
    // topic domains
    const createdTopicDomains: Array<TopicDomain> = await this.createTopicDomains({ applicationDomainId });
    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_CREATE, module: this.constructor.name, details: {
      epSdkApplicationDomainTask_Config: this.getTaskConfig(),
      applicationDomain,
    }}));
    return {
      epSdkTask_Action: this.getCreateFuncAction(),
      epObject: applicationDomain,
      epObjectKeys: this.getEpObjectKeys(applicationDomain),
      epTopicDomains: createdTopicDomains.length > 0 ? createdTopicDomains : undefined
    };
  }

  protected async updateFunc(epSdkApplicationDomainTask_GetFuncReturn: IEpSdkApplicationDomainTask_GetFuncReturn): Promise<IEpSdkApplicationDomainTask_UpdateFuncReturn> {
    const funcName = "updateFunc";
    const logName = `${EpSdkApplicationDomainTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_UPDATE, module: this.constructor.name }));

    /* istanbul ignore next */
    if(epSdkApplicationDomainTask_GetFuncReturn.epObject === undefined) throw new EpSdkInternalTaskError(logName, this.constructor.name, "epSdkApplicationDomainTask_GetFuncReturn.epObject === undefined");
    /* istanbul ignore next */
    if(epSdkApplicationDomainTask_GetFuncReturn.epObject.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "epSdkApplicationDomainTask_GetFuncReturn.epObject.id === undefined", {
      epObject: epSdkApplicationDomainTask_GetFuncReturn.epObject,
    });
    const applicationDomainId = epSdkApplicationDomainTask_GetFuncReturn.epObject.id;

    const update: ApplicationDomain = {
      ...this.createObjectSettings(),
      name: this.getTaskConfig().applicationDomainName,
    };

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_UPDATE, module: this.constructor.name, details: {
      epSdkApplicationDomainTask_Config: this.getTaskConfig(),
      update: update,
    }}));

    if (this.isCheckmode()) {
      const wouldBe_EpObject: ApplicationDomain = {
        ...epSdkApplicationDomainTask_GetFuncReturn.epObject,
        ...update,
      };
      let wouldBe_EpTopicDomains: Array<TopicDomain> | undefined = undefined;
      if(this.getTaskConfig().applicationDomainSettings && this.getTaskConfig().applicationDomainSettings.topicDomains) {
        wouldBe_EpTopicDomains = this.sortTopicDomains({
          topicDomains: await this.createWouldBeTopicDomains({ applicationDomainId: epSdkApplicationDomainTask_GetFuncReturn.epObject.id })
        });
      }
      return {
        epSdkTask_Action: this.getUpdateFuncAction(),
        epObject: wouldBe_EpObject,
        epObjectKeys: this.getEpObjectKeys(wouldBe_EpObject),
        epTopicDomains: wouldBe_EpTopicDomains
      };
    }
    // update
    const applicationDomainResponse: ApplicationDomainResponse = await ApplicationDomainsService.updateApplicationDomain({
      xContextId: this.xContextId,
      id: applicationDomainId,
      requestBody: update,
    });
    /* istanbul ignore next */
    if (applicationDomainResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "applicationDomainResponse.data === undefined", { applicationDomainResponse });
    // topic domains
    // brute force, remove topic domains and add the configure ones again
    // delete topic domains
    await this.deleteTopicDomains({ applicationDomainId, topicDomains: epSdkApplicationDomainTask_GetFuncReturn.epTopicDomains });
    // create topic domains
    const createdTopicDomains: Array<TopicDomain> = await this.createTopicDomains({ applicationDomainId });

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_UPDATE, module: this.constructor.name, details: {
      epSdkApplicationDomainTask_Config: this.getTaskConfig(),
      update: update,
    }}));
    const epSdkApplicationDomainTask_UpdateFuncReturn: IEpSdkApplicationDomainTask_UpdateFuncReturn = {
      epSdkTask_Action: this.getUpdateFuncAction(),
      epObject: applicationDomainResponse.data,
      epObjectKeys: this.getEpObjectKeys(applicationDomainResponse.data),
      epTopicDomains: createdTopicDomains.length > 0 ? createdTopicDomains : undefined
    };
    return epSdkApplicationDomainTask_UpdateFuncReturn;
  }

  protected async deleteFunc(epSdkApplicationDomainTask_GetFuncReturn: IEpSdkApplicationDomainTask_GetFuncReturn): Promise<IEpSdkApplicationDomainTask_DeleteFuncReturn> {
    const funcName = "deleteFunc";
    const logName = `${EpSdkApplicationDomainTask.name}.${funcName}()`;
    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_DELETE, module: this.constructor.name }));
    if (epSdkApplicationDomainTask_GetFuncReturn.epObject === undefined) throw new EpSdkInternalTaskError(logName, this.constructor.name, "epSdkApplicationDomainTask_GetFuncReturn.epObject === undefined");
    /* istanbul ignore next */
    if(epSdkApplicationDomainTask_GetFuncReturn.epObject.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "epSdkApplicationDomainTask_GetFuncReturn.epObject.id === undefined", {
      epObject: epSdkApplicationDomainTask_GetFuncReturn.epObject,
    });
    const applicationDomainId = epSdkApplicationDomainTask_GetFuncReturn.epObject.id;
    if (this.isCheckmode()) {
      return {
        epSdkTask_Action: this.getDeleteFuncAction(),
        epObject: epSdkApplicationDomainTask_GetFuncReturn.epObject,
        epObjectKeys: this.getEpObjectKeys(
          epSdkApplicationDomainTask_GetFuncReturn.epObject
        ),
      };
    }
    // delete topic domains
    await this.deleteTopicDomains({ applicationDomainId, topicDomains: epSdkApplicationDomainTask_GetFuncReturn.epTopicDomains });
    // delete the application domain
    const applicationDomain: ApplicationDomain = await EpSdkApplicationDomainsService.deleteById({
      xContextId: this.xContextId,
      applicationDomainId: epSdkApplicationDomainTask_GetFuncReturn.epObject.id,
    });

    const epSdkApplicationDomainTask_DeleteFuncReturn: IEpSdkApplicationDomainTask_DeleteFuncReturn = {
      epSdkTask_Action: this.getDeleteFuncAction(),
      epObject: applicationDomain,
      epObjectKeys: this.getEpObjectKeys(applicationDomain),
      epTopicDomains: epSdkApplicationDomainTask_GetFuncReturn.epTopicDomains
    };
    return epSdkApplicationDomainTask_DeleteFuncReturn;
  }

  protected createReturn4UpdateFunc({epSdkTask_UpdateFuncReturn}:{
    epSdkTask_UpdateFuncReturn: IEpSdkApplicationDomainTask_UpdateFuncReturn;
  }): IEpSdkApplicationDomainTask_ExecuteReturn {
    return {
      ...super.createReturn4UpdateFunc({ epSdkTask_UpdateFuncReturn }),
      epTopicDomains: epSdkTask_UpdateFuncReturn.epTopicDomains
    };
  }

  public async execute(xContextId?: string): Promise<IEpSdkApplicationDomainTask_ExecuteReturn> {
    const epSdkTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await super.execute(xContextId);    
    return epSdkTask_ExecuteReturn;
  }
}
