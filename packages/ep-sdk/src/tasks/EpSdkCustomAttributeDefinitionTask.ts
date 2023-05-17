import {
  CustomAttributeDefinition,
  CustomAttributeDefinitionResponse,
  CustomAttributeDefinitionsService,
} from "@solace-labs/ep-openapi-node";
import {
  EpSdkApiContentError,
  EpSdkInternalTaskError,
  EpSdkLogger,
  EEpSdkLoggerCodes,
  EpSdkTaskConfigValidationError,
} from "../utils";
import { 
  EEpSdkCustomAttributeEntityTypes,
  EEpSdkObjectTypes 
} from "../types";
import { 
  EpSdkCustomAttributeDefinitionsService 
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
export type TEpSdkCustomAttributeDefinitionTask_Settings = Partial<Pick<CustomAttributeDefinition, "valueType" | "scope">> & {
  associatedEntityTypes?: Array<EEpSdkCustomAttributeEntityTypes>;
  applicationDomainId?: string;
};
type TEpSdkCustomAttributeDefinitionTask_CompareObject = TEpSdkCustomAttributeDefinitionTask_Settings;

/** @category Tasks */
export interface IEpSdkCustomAttributeDefinitionTask_Config
  extends IEpSdkTask_Config {
  attributeName: string;
  customAttributeDefinitionObjectSettings: TEpSdkCustomAttributeDefinitionTask_Settings;
}
/** @category Tasks */
export interface IEpSdkCustomAttributeDefinitionTask_Keys extends IEpSdkTask_Keys {
  attributeName: string;
}
/** @category Tasks */
export interface IEpSdkCustomAttributeDefinitionTask_GetFuncReturn extends Omit<IEpSdkTask_GetFuncReturn, "epObject"> {
  epObject: CustomAttributeDefinition | undefined;
}
/** @category Tasks */
export interface IEpSdkCustomAttributeDefinitionTask_CreateFuncReturn extends Omit<IEpSdkTask_CreateFuncReturn, "epObject"> {
  epObject: CustomAttributeDefinition;
}
/** @category Tasks */
export interface IEpSdkCustomAttributeDefinitionTask_UpdateFuncReturn extends Omit<IEpSdkTask_UpdateFuncReturn, "epObject"> {
  epObject: CustomAttributeDefinition;
}
/** @category Tasks */
export interface IEpSdkCustomAttributeDefinitionTask_DeleteFuncReturn extends Omit<IEpSdkTask_DeleteFuncReturn, "epObject"> {
  epObject: CustomAttributeDefinition;
}
/** @category Tasks */
export interface IEpSdkCustomAttributeDefinitionTask_ExecuteReturn extends Omit<IEpSdkTask_ExecuteReturn, "epObject"> {
  epObject: CustomAttributeDefinition;
}

/**
 * Manages presence and absence of custom attribute defintion.
 * For absence:
 * - pass empty list of associatedEntityTypes
 * @category Tasks
 */
export class EpSdkCustomAttributeDefinitionTask extends EpSdkTask {
  private readonly Empty_IEpSdkCustomAttributeDefinitionTask_GetFuncReturn: IEpSdkCustomAttributeDefinitionTask_GetFuncReturn = {
    epObjectKeys: this.getDefaultEpObjectKeys(),
    epObject: undefined,
    epObjectExists: false,
  };
  private readonly Default_TEpSdkCustomAttributeDefinitionTask_Settings: Required<TEpSdkCustomAttributeDefinitionTask_Settings> = {
    valueType: CustomAttributeDefinition.valueType.STRING,
    scope: CustomAttributeDefinition.scope.ORGANIZATION,
    associatedEntityTypes: [],
    applicationDomainId: undefined,
  };

  protected getEpObjectType(): EEpSdkObjectTypes { return EEpSdkObjectTypes.CUSTOM_ATTRIBUTE_DEFINITION; }

  private getTaskConfig(): IEpSdkCustomAttributeDefinitionTask_Config { return this.epSdkTask_Config as IEpSdkCustomAttributeDefinitionTask_Config; }

  private sortEpSdkCustomAttributeEntityTypes({ epSdkCustomAttributeEntityTypes }:{
    epSdkCustomAttributeEntityTypes: Array<EEpSdkCustomAttributeEntityTypes>;
  }): Array<EEpSdkCustomAttributeEntityTypes> {
    return epSdkCustomAttributeEntityTypes.sort((one, two) => {
      if(one>two) return -1;
      if(two>one) return 1;
      return 0;
    });
  }

  private createObjectSettings(): Required<TEpSdkCustomAttributeDefinitionTask_Settings> {
    return {
      ...this.Default_TEpSdkCustomAttributeDefinitionTask_Settings,
      ...this.getTaskConfig().customAttributeDefinitionObjectSettings,
      associatedEntityTypes: this.sortEpSdkCustomAttributeEntityTypes({ 
        epSdkCustomAttributeEntityTypes: this.getTaskConfig().customAttributeDefinitionObjectSettings.associatedEntityTypes ? this.getTaskConfig().customAttributeDefinitionObjectSettings.associatedEntityTypes : []
      })
    };
  }

  constructor(taskConfig: IEpSdkCustomAttributeDefinitionTask_Config) {
    super(taskConfig);
  }

  protected async validateTaskConfig(): Promise<void> {
    const funcName = "validateTaskConfig";
    const logName = `${EpSdkCustomAttributeDefinitionTask.name}.${funcName}()`;
    const taskConfig = this.getTaskConfig();

    // const log = {
    //   taskConfig
    // };
    // console.log(`\n\n\n${logName}: log = ${JSON.stringify(log, null, 2)}\n\n\n`);


    if(taskConfig.customAttributeDefinitionObjectSettings) {
      if(taskConfig.customAttributeDefinitionObjectSettings.scope === CustomAttributeDefinition.scope.APPLICATION_DOMAIN) {
        if(this.getTaskConfig().customAttributeDefinitionObjectSettings.applicationDomainId === undefined) {
          throw new EpSdkTaskConfigValidationError(logName, this.constructor.name, undefined, "applicationDomain scoped custom attribute requires an applicationDomainId", {
            config: this.getTaskConfig()
          });
        }
      }    
    }
  }

  protected getDefaultEpObjectKeys(): IEpSdkTask_EpObjectKeys {
    return {
      epObjectId: "undefined",
      epObjectType: EEpSdkObjectTypes.CUSTOM_ATTRIBUTE_DEFINITION,
    };
  }

  protected getEpObjectKeys(epObject: CustomAttributeDefinition | undefined): IEpSdkTask_EpObjectKeys {
    const funcName = "getEpObjectKeys";
    const logName = `${EpSdkCustomAttributeDefinitionTask.name}.${funcName}()`;
    if (epObject === undefined) return this.getDefaultEpObjectKeys();
    /* istanbul ignore next */
    if (epObject.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "epObject.id === undefined", { epObject: epObject });
    return {
      ...this.getDefaultEpObjectKeys(),
      epObjectId: epObject.id,
    };
  }

  protected getTaskKeys(): IEpSdkCustomAttributeDefinitionTask_Keys {
    return { 
      attributeName: this.getTaskConfig().attributeName, 
    };
  }

  protected async getFunc(epSdkCustomAttributeDefinitionTask_Keys: IEpSdkCustomAttributeDefinitionTask_Keys): Promise<IEpSdkCustomAttributeDefinitionTask_GetFuncReturn> {
    const funcName = "getFunc";
    const logName = `${EpSdkCustomAttributeDefinitionTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_GET, module: this.constructor.name, details: {
      epSdkCustomAttributeDefinitionTask_Keys: epSdkCustomAttributeDefinitionTask_Keys,
    }}));

    const customAttributeDefinition: CustomAttributeDefinition | undefined = await EpSdkCustomAttributeDefinitionsService.getByName({
      xContextId: this.xContextId,
      attributeName: epSdkCustomAttributeDefinitionTask_Keys.attributeName,
      applicationDomainId: this.getTaskConfig().customAttributeDefinitionObjectSettings.applicationDomainId
    });

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_API_GET, module: this.constructor.name, details: {
      epSdkCustomAttributeDefinitionTask_Keys: epSdkCustomAttributeDefinitionTask_Keys,
      customAttributeDefinition: customAttributeDefinition ? customAttributeDefinition : "undefined",
    }}));

    if (customAttributeDefinition === undefined) return this.Empty_IEpSdkCustomAttributeDefinitionTask_GetFuncReturn;

    const epSdkCustomAttributeDefinitionTask_GetFuncReturn: IEpSdkCustomAttributeDefinitionTask_GetFuncReturn = {
      epObjectKeys: this.getEpObjectKeys(customAttributeDefinition),
      epObject: customAttributeDefinition,
      epObjectExists: true,
    };
    return epSdkCustomAttributeDefinitionTask_GetFuncReturn;
  }

  private createExistingCompareObject({ customAttributeDefinition }:{
    customAttributeDefinition: CustomAttributeDefinition;
  }): TEpSdkCustomAttributeDefinitionTask_CompareObject {
    const applicationDomainIds: Array<string> = [];
    if(customAttributeDefinition.associatedEntities) {
      for(const associatedEntity of customAttributeDefinition.associatedEntities) {
        if(associatedEntity.applicationDomainIds) applicationDomainIds.push(...associatedEntity.applicationDomainIds);
      }
    }
    return {
      associatedEntityTypes: this.sortEpSdkCustomAttributeEntityTypes({
        epSdkCustomAttributeEntityTypes: customAttributeDefinition.associatedEntityTypes ? customAttributeDefinition.associatedEntityTypes as unknown as Array<EEpSdkCustomAttributeEntityTypes> : [],
      }),
      valueType: customAttributeDefinition.valueType,
      scope: customAttributeDefinition.scope,
      applicationDomainId: applicationDomainIds.find(x => x === this.getTaskConfig().customAttributeDefinitionObjectSettings.applicationDomainId )
    };
  }
  protected async isUpdateRequiredFunc(epSdkCustomAttributeDefinitionTask_GetFuncReturn: IEpSdkCustomAttributeDefinitionTask_GetFuncReturn): Promise<IEpSdkTask_IsUpdateRequiredFuncReturn> {
    const funcName = "isUpdateRequiredFunc";
    const logName = `${EpSdkCustomAttributeDefinitionTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_IS_UPDATE_REQUIRED, module: this.constructor.name, details: {
      epSdkCustomAttributeDefinitionTask_GetFuncReturn: epSdkCustomAttributeDefinitionTask_GetFuncReturn,
    }}));

    if (epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject === undefined) throw new EpSdkInternalTaskError(logName, this.constructor.name, "epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject === undefined");

    const existingObject: CustomAttributeDefinition = epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject;
    const existingCompareObject: TEpSdkCustomAttributeDefinitionTask_CompareObject = this.createExistingCompareObject({ customAttributeDefinition: existingObject });
    const requestedCompareObject: TEpSdkCustomAttributeDefinitionTask_CompareObject = this.createObjectSettings();

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

  protected async createFunc(): Promise<IEpSdkCustomAttributeDefinitionTask_CreateFuncReturn> {
    const funcName = "createFunc";
    const logName = `${EpSdkCustomAttributeDefinitionTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_CREATE, module: this.constructor.name, }));

    const create: CustomAttributeDefinition = {
      ...this.createObjectSettings(),
      name: this.getTaskConfig().attributeName,
    };

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_CREATE, module: this.constructor.name, details: {
      epSdkApplicationTask_Config: this.getTaskConfig(),
      create: create,
    }}));

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
    let customAttributeDefinitionResponse: CustomAttributeDefinitionResponse;
    if(this.getTaskConfig().customAttributeDefinitionObjectSettings.applicationDomainId) {
      customAttributeDefinitionResponse = await CustomAttributeDefinitionsService.createCustomAttributeDefinitionByApplicationDomain({
        xContextId: this.xContextId,
        applicationDomainId: this.getTaskConfig().customAttributeDefinitionObjectSettings.applicationDomainId,
        requestBody: create,
      });  
    } else {
      customAttributeDefinitionResponse = await CustomAttributeDefinitionsService.createCustomAttributeDefinition({
        xContextId: this.xContextId,
        requestBody: create,
      });  
    }
    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_CREATE, module: this.constructor.name, details: {
      epSdkApplicationTask_Config: this.getTaskConfig(),
      create: create,
      customAttributeDefinitionResponse: customAttributeDefinitionResponse,
    }}));

    /* istanbul ignore next */
    if (customAttributeDefinitionResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "customAttributeDefinitionResponse.data === undefined", {
      epSdkCustomAttributeDefinitionTask_Config: this.getTaskConfig(),
      create: create,
      customAttributeDefinitionResponse: customAttributeDefinitionResponse,
    });
    return {
      epSdkTask_Action: this.getCreateFuncAction(),
      epObject: customAttributeDefinitionResponse.data,
      epObjectKeys: this.getEpObjectKeys(customAttributeDefinitionResponse.data),
    };
  }

  protected async updateFunc(epSdkCustomAttributeDefinitionTask_GetFuncReturn: IEpSdkCustomAttributeDefinitionTask_GetFuncReturn): Promise<IEpSdkCustomAttributeDefinitionTask_UpdateFuncReturn> {
    const funcName = "updateFunc";
    const logName = `${EpSdkCustomAttributeDefinitionTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_UPDATE, module: this.constructor.name }));

    /* istanbul ignore next */
    if (epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject === undefined) throw new EpSdkInternalTaskError( logName, this.constructor.name, "epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject === undefined");
    /* istanbul ignore next */
    if (epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject.id === undefined", {
      epObject: epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject,
    });

    // const update: CustomAttributeDefinition = {
    //   ...this.createObjectSettings(),
    //   name: this.getTaskConfig().attributeName,
    // };
    // can only update associatedEntityTypes
    const update: Partial<CustomAttributeDefinition> = {
      id: epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject.id,
      name: epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject.name,
      valueType: epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject.valueType,
      associatedEntityTypes: this.sortEpSdkCustomAttributeEntityTypes({ 
        epSdkCustomAttributeEntityTypes: this.getTaskConfig().customAttributeDefinitionObjectSettings.associatedEntityTypes ? this.getTaskConfig().customAttributeDefinitionObjectSettings.associatedEntityTypes : []
      }),
      // scope: this.createObjectSettings().scope
    };

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_UPDATE, module: this.constructor.name, details: {
      epSdkCustomAttributeDefinitionTask_Config: this.getTaskConfig(),
      update: update,
    }}));

    if (this.isCheckmode()) {
      const wouldBe_EpObject: CustomAttributeDefinition = {
        ...epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject,
        ...update,
      };
      let epSdkTask_Action = this.getUpdateFuncAction();
      let issue: any = undefined;
      if(wouldBe_EpObject.scope !== epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject.scope) {
        // check if scope is in update => that would fail
        epSdkTask_Action = this.getUpdateFuncAction(true);
        issue = {
          message: "cannot update scope",
          requestedUpdate: {
            from: epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject.scope,
            to: wouldBe_EpObject.scope
          }
        }
      }
      return {
        issue: issue,
        epSdkTask_Action: epSdkTask_Action,
        epObject: wouldBe_EpObject,
        epObjectKeys: this.getEpObjectKeys(wouldBe_EpObject),
      };
    }
    let customAttributeDefinitionResponse: CustomAttributeDefinitionResponse;
    if(this.getTaskConfig().customAttributeDefinitionObjectSettings.applicationDomainId) {
      // issue:
      // patching 1 attribute seems to lose applicationDomainIds properties for all other attributes
      // next call to task with different attribute will create it again
      // const bug=true; if(bug) throw new EpSdkTaskUpdateNotSupportedError(logName, this.constructor.name, this.getEpObjectType(), {
      //   message: 'feature currently not supported for application domain scoped attributes',
      //   taskConfig: this.getTaskConfig()
      // })

      // DEBUG: get all definitions
      // const customAttributeDefinitionsResponseBefore = await CustomAttributeDefinitionsService.getCustomAttributeDefinitions({ pageSize: 100 });
      // const customAttributeDefinitionsResponseBefore = await CustomAttributeDefinitionsService.getCustomAttributeDefinitionsByApplicationDomain({
      //   applicationDomainId: this.getTaskConfig().customAttributeDefinitionObjectSettings.applicationDomainId,
      // });
      // const logBefore = {
      //   customAttributeDefinitionsResponseBefore: customAttributeDefinitionsResponseBefore.data.filter(x => x.name.startsWith('app-domain'))
      //   // customAttributeDefinitionsResponseBefore
      // }
      // console.log(`\n\n\n${logName}: all definitions before PATCH = ${JSON.stringify(logBefore, null, 2)}\n\n\n`);

      // const log = {
      //   customAttributeName: this.getTaskConfig().attributeName,
      //   customAttributeId: epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject.id,
      //   applicationDomainId: this.getTaskConfig().customAttributeDefinitionObjectSettings.applicationDomainId,
      //   requestBody: update,
      // }
      // console.log(`\n\n\n${logName}: update wrong? = ${JSON.stringify(log, null, 2)}\n\n\n`);


      customAttributeDefinitionResponse = await CustomAttributeDefinitionsService.updateCustomAttributeDefinitionByApplicationDomain({
        xContextId: this.xContextId,
        applicationDomainId: this.getTaskConfig().customAttributeDefinitionObjectSettings.applicationDomainId,
        customAttributeId: epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject.id,
        requestBody: update as any
      });  

      // DEBUG: get all definitions
      // const customAttributeDefinitionsResponseAfter = await CustomAttributeDefinitionsService.getCustomAttributeDefinitions({ pageSize: 100 });
      // const customAttributeDefinitionsResponseAfter = await CustomAttributeDefinitionsService.getCustomAttributeDefinitionsByApplicationDomain({
      //   applicationDomainId: this.getTaskConfig().customAttributeDefinitionObjectSettings.applicationDomainId,
      // });
      // const logAfter = {
      //   customAttributeDefinitionsResponseAfter: customAttributeDefinitionsResponseAfter.data.filter(x => x.name.startsWith('app-domain'))
      //   // customAttributeDefinitionsResponseAfter
      // }
      // console.log(`\n\n\n${logName}: all definitions after PATCH = ${JSON.stringify(logAfter, null, 2)}\n\n\n`);


    } else {
      customAttributeDefinitionResponse = await CustomAttributeDefinitionsService.updateCustomAttributeDefinition({
        xContextId: this.xContextId,
        id: epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject.id,
        requestBody: update as any,
      });  
    }

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_UPDATE, module: this.constructor.name, details: {
      epSdkApplicationDomainTask_Config: this.getTaskConfig(),
      update: update,
      customAttributeDefinitionResponse: customAttributeDefinitionResponse,
    }}));

    /* istanbul ignore next */
    if (customAttributeDefinitionResponse.data === undefined) throw new EpSdkApiContentError( logName, this.constructor.name, "customAttributeDefinitionResponse.data === undefined", {
      customAttributeDefinitionResponse,
    });
    const epSdkCustomAttributeDefinitionTask_UpdateFuncReturn: IEpSdkCustomAttributeDefinitionTask_UpdateFuncReturn = {
      epSdkTask_Action: this.getUpdateFuncAction(),
      epObject: customAttributeDefinitionResponse.data,
      epObjectKeys: this.getEpObjectKeys(customAttributeDefinitionResponse.data),
    };
    return epSdkCustomAttributeDefinitionTask_UpdateFuncReturn;
  }

  protected async deleteFunc(epSdkCustomAttributeDefinitionTask_GetFuncReturn: IEpSdkCustomAttributeDefinitionTask_GetFuncReturn): Promise<IEpSdkCustomAttributeDefinitionTask_DeleteFuncReturn> {
    const funcName = "deleteFunc";
    const logName = `${EpSdkCustomAttributeDefinitionTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_DELETE, module: this.constructor.name, }));
    /* istanbul ignore next */
    if (epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject === undefined) throw new EpSdkInternalTaskError(logName, this.constructor.name, "epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject === undefined");
    /* istanbul ignore next */
    if (epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject.id === undefined) throw new EpSdkApiContentError( logName, this.constructor.name, "epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject.id === undefined", {
      epObject: epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject,
    });

    if(this.isCheckmode()) {
      return {
        epSdkTask_Action: this.getDeleteFuncAction(),
        epObject: epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject,
        epObjectKeys: this.getEpObjectKeys(epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject),
      };
    }
    const customAttributeDefinition: CustomAttributeDefinition = await EpSdkCustomAttributeDefinitionsService.deleteById({
      xContextId: this.xContextId,
      applicationDomainId: this.getTaskConfig().customAttributeDefinitionObjectSettings.applicationDomainId,
      customAttributeDefinitionId: epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject.id,
    });
    const epSdkCustomAttributeDefinitionTask_DeleteFuncReturn: IEpSdkCustomAttributeDefinitionTask_DeleteFuncReturn = {
      epSdkTask_Action: this.getDeleteFuncAction(),
      epObject: customAttributeDefinition,
      epObjectKeys: this.getEpObjectKeys(customAttributeDefinition),
    };
    return epSdkCustomAttributeDefinitionTask_DeleteFuncReturn;
  }

  public async execute(xContextId?: string): Promise<IEpSdkCustomAttributeDefinitionTask_ExecuteReturn> {
    const epSdkTask_ExecuteReturn: IEpSdkCustomAttributeDefinitionTask_ExecuteReturn = await super.execute(xContextId);
    return epSdkTask_ExecuteReturn;
  }
}
