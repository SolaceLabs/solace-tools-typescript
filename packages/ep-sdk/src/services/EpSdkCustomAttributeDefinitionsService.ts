import {
  CustomAttributeDefinition,
  CustomAttributeDefinitionsResponse,
  CustomAttributeDefinitionsService,
  Pagination,
} from '@solace-labs/ep-openapi-node';
import { 
  EpSdkApiContentError, 
  EpSdkLogger,
  EEpSdkLoggerCodes,
} from '../utils';
import { 
  EpApiMaxPageSize 
} from '../constants';
import { 
  EEpSdkCustomAttributeEntityTypes, 
  TEpSdkCustomAttributeList, 
} from '../types';
import { 
  EEpSdkTask_TargetState, 
  EpSdkCustomAttributeDefinitionTask, 
  IEpSdkCustomAttributeDefinitionTask_ExecuteReturn 
} from '../tasks';
import { EpSdkServiceClass } from './EpSdkService';

/** @category Services */
export class EpSdkCustomAttributeDefinitionsServiceClass extends EpSdkServiceClass {

  public async listAll({ xContextId }:{
    xContextId?: string;
  }): Promise<Array<CustomAttributeDefinition>> {
    const funcName = 'listAll';
    const logName = `${EpSdkCustomAttributeDefinitionsServiceClass.name}.${funcName}()`;

    const customAttributeDefintions: Array<CustomAttributeDefinition> = [];    
    let nextPage: number | undefined | null = 1;
    while(nextPage !== undefined && nextPage !== null) {
      const customAttributeDefinitionsResponse: CustomAttributeDefinitionsResponse = await CustomAttributeDefinitionsService.getCustomAttributeDefinitions({
        xContextId,
        pageSize: 100,
        pageNumber: nextPage,
      });
      if(customAttributeDefinitionsResponse.data === undefined || customAttributeDefinitionsResponse.data.length === 0) nextPage = undefined;
      else {
        customAttributeDefintions.push(...customAttributeDefinitionsResponse.data);
        /* istanbul ignore next */
        if(customAttributeDefinitionsResponse.meta === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'customAttributeDefinitionsResponse.meta === undefined', { customAttributeDefinitionsResponse });
        /* istanbul ignore next */
        if(customAttributeDefinitionsResponse.meta.pagination === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'customAttributeDefinitionsResponse.meta.pagination === undefined', { customAttributeDefinitionsResponse });
        const pagination: Pagination = customAttributeDefinitionsResponse.meta.pagination;
        nextPage = pagination.nextPage;  
      }
    }
    return customAttributeDefintions;
  }
  /**
   * Adds the associated entity type to existing list of entity types if definition exists.
   * Returns list of all associated enitity types.
   */
  public async presentAssociatedEntityType({ xContextId, attributeName, associatedEntityType, applicationDomainId }:{
    xContextId?: string;
    attributeName: string;
    associatedEntityType: EEpSdkCustomAttributeEntityTypes;
    applicationDomainId?: string;
  }): Promise<Array<EEpSdkCustomAttributeEntityTypes>> {
    const customAttributeDefinition: CustomAttributeDefinition | undefined = await this.getByName({ xContextId, attributeName, applicationDomainId });
    if(customAttributeDefinition === undefined || customAttributeDefinition.associatedEntityTypes === undefined) return [associatedEntityType];
    const exists = customAttributeDefinition.associatedEntityTypes.find( (x) => {
      return x === associatedEntityType;
    });
    if(!exists) return customAttributeDefinition.associatedEntityTypes.concat([associatedEntityType]) as Array<EEpSdkCustomAttributeEntityTypes>;
    return customAttributeDefinition.associatedEntityTypes.concat([]) as Array<EEpSdkCustomAttributeEntityTypes>;
  }

  /* istanbul ignore next */
  // /**
  //  * Removes the associated entity type from the existing list.
  //  * Returns list of remaining associated entity types, which could be empty.
  //  */
  // public async absentAssociatedEntityType({ attributeName, associatedEntityType}:{
  //   attributeName: string;
  //   associatedEntityType: EEpSdkCustomAttributeEntityTypes;
  // }): Promise<Array<EEpSdkCustomAttributeEntityTypes>> {
  //   const customAttributeDefinition: CustomAttributeDefinition | undefined = await this.getByName({
  //     attributeName: attributeName,
  //   });
  //   if(customAttributeDefinition === undefined || customAttributeDefinition.associatedEntityTypes === undefined) return [];
  //   return customAttributeDefinition.associatedEntityTypes.filter( (x) => {
  //     return x !== associatedEntityType;
  //   }).concat([]) as Array<EEpSdkCustomAttributeEntityTypes>;
  // }

  /**
   * Removes the associatedEntityType from the custom attribute definition.
   * If no associatedEntityTypes are left, then deletes the entire custom attribute definition.
   * @returns The modified custom attribute definition or undefined if it has been deleted.
   */
  public async removeAssociatedEntityTypeFromCustomAttributeDefinition({ xContextId, attributeName, associatedEntityType }:{
    xContextId?: string;
    attributeName: string;
    associatedEntityType: EEpSdkCustomAttributeEntityTypes;
  }): Promise<CustomAttributeDefinition | undefined> {

    const customAttributeDefinition: CustomAttributeDefinition | undefined = await this.getByName({
      xContextId: xContextId,
      attributeName: attributeName,
    });
    if(customAttributeDefinition === undefined) return undefined;
    
    let associatedEntityTypes: Array<EEpSdkCustomAttributeEntityTypes> = [];
    if(customAttributeDefinition.associatedEntityTypes !== undefined) {
      associatedEntityTypes = customAttributeDefinition.associatedEntityTypes.filter( (x) => {
        return x !== associatedEntityType;
      }).concat([]) as Array<EEpSdkCustomAttributeEntityTypes>;
    }
    let epSdkTask_TargetState = EEpSdkTask_TargetState.PRESENT;
    if(associatedEntityTypes.length === 0) epSdkTask_TargetState = EEpSdkTask_TargetState.ABSENT;
    const epSdkCustomAttributeDefinitionTask = new EpSdkCustomAttributeDefinitionTask({
      epSdkTask_TargetState: epSdkTask_TargetState,
      attributeName: attributeName,
      customAttributeDefinitionObjectSettings: {
        associatedEntityTypes: associatedEntityTypes
      }
    });
    const epSdkCustomAttributeDefinitionTask_ExecuteReturn: IEpSdkCustomAttributeDefinitionTask_ExecuteReturn = await epSdkCustomAttributeDefinitionTask.execute(xContextId);
    if(epSdkTask_TargetState === EEpSdkTask_TargetState.ABSENT) return undefined;
    return epSdkCustomAttributeDefinitionTask_ExecuteReturn.epObject;
  }

  /**
   * Wrapper EpSdkCustomAttributeDefinitionTask to avoid circular import dependencies 
   */
  public async presentCustomAttributeDefinitions({ xContextId, epSdkCustomAttributeList, associatedEntityType }:{
    xContextId?: string;
    epSdkCustomAttributeList: TEpSdkCustomAttributeList;
    associatedEntityType: EEpSdkCustomAttributeEntityTypes;
  }): Promise<Array<CustomAttributeDefinition>> {
    // const funcName = "present";
    // const logName = `${EpSdkCustomAttributeDefinitionsServiceClass.name}.${funcName}()`;

    // create full list of associated entity types for all attributes
    for(const epSdkCustomAttribute of epSdkCustomAttributeList) {
      const associatedEntityTypes: Array<EEpSdkCustomAttributeEntityTypes> = await this.presentAssociatedEntityType({
        xContextId,
        attributeName: epSdkCustomAttribute.name,
        associatedEntityType,
      });
      epSdkCustomAttribute.epSdkCustomAttributeEntityTypes = associatedEntityTypes;
    }
    const epSdkCustomAttributeDefinitionTask_ExecuteReturns: Array<IEpSdkCustomAttributeDefinitionTask_ExecuteReturn> = [];
    for(const epSdkCustomAttribute of epSdkCustomAttributeList) {
      const epSdkCustomAttributeDefinitionTask = new EpSdkCustomAttributeDefinitionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        attributeName: epSdkCustomAttribute.name,
        customAttributeDefinitionObjectSettings: {
          associatedEntityTypes: epSdkCustomAttribute.epSdkCustomAttributeEntityTypes,
          scope: epSdkCustomAttribute.scope,
          applicationDomainId: epSdkCustomAttribute.applicationDomainId,
          valueType: epSdkCustomAttribute.valueType
        },
      });
      const epSdkCustomAttributeDefinitionTask_ExecuteReturn: IEpSdkCustomAttributeDefinitionTask_ExecuteReturn = await epSdkCustomAttributeDefinitionTask.execute(xContextId);
      epSdkCustomAttributeDefinitionTask_ExecuteReturns.push(epSdkCustomAttributeDefinitionTask_ExecuteReturn);
    }
    return epSdkCustomAttributeDefinitionTask_ExecuteReturns.map((epSdkCustomAttributeDefinitionTask_ExecuteReturn) => {
      return epSdkCustomAttributeDefinitionTask_ExecuteReturn.epObject;
    });
  }

  /**
   * Get attribute definition by name. Name is unique.
   */
  public getByName = async ({ xContextId, attributeName, applicationDomainId, pageSize = EpApiMaxPageSize }: {
    xContextId?: string;
    attributeName: string;
    applicationDomainId?: string;
    pageSize?: number; /** for testing */
  }): Promise<CustomAttributeDefinition | undefined> => {
    const funcName = 'getByName';
    const logName = `${EpSdkCustomAttributeDefinitionsServiceClass.name}.${funcName}()`;

    const customAttributeDefinitionList: Array<CustomAttributeDefinition> = [];
    let nextPage: number | undefined | null = 1;

    while(nextPage !== null) {
      let customAttributeDefinitionsResponse: CustomAttributeDefinitionsResponse;
      if(applicationDomainId) {
        customAttributeDefinitionsResponse = await CustomAttributeDefinitionsService.getCustomAttributeDefinitionsByApplicationDomain({
          xContextId: xContextId,
          applicationDomainId: applicationDomainId,
          pageSize: pageSize,
          pageNumber: nextPage,
        });
      } else {
        customAttributeDefinitionsResponse = await CustomAttributeDefinitionsService.getCustomAttributeDefinitions({
          xContextId: xContextId,
          pageSize: pageSize,
          pageNumber: nextPage,
        });  
      }

      // // DEBUG
      // const log1 = {
      //   applicationDomainId: applicationDomainId ? applicationDomainId : 'undefined',
      //   attributeName,
      //   customAttributeDefinitionsResponse
      // }
      // console.log(`\n\n\n${logName}: log1 = ${JSON.stringify(log1, null, 2)}\n\n\n`);



      if(customAttributeDefinitionsResponse.data === undefined || customAttributeDefinitionsResponse.data.length === 0) nextPage = null;
      else {
        const filteredList = customAttributeDefinitionsResponse.data.filter( (customAttributeDefinition: CustomAttributeDefinition) => {
          /* istanbul ignore next */
          if(customAttributeDefinition.name === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'customAttributeDefinition.name === undefined', {
            customAttributeDefinition: customAttributeDefinition
          });
          let doInclude = false;
          // return immediately if found
          if(customAttributeDefinition.name === attributeName) return customAttributeDefinition;
          // filter for name          
          if(customAttributeDefinition.name === attributeName) doInclude = true;          
          return doInclude;
        });

      // // DEBUG
      // const log_filteredList = {
      //   applicationDomainId: applicationDomainId ? applicationDomainId : 'undefined',
      //   attributeName,
      //   filteredList
      // }
      // console.log(`\n\n\n${logName}: log_filteredList = ${JSON.stringify(log_filteredList, null, 2)}\n\n\n`);


        customAttributeDefinitionList.push(...filteredList);
      }
      /* istanbul ignore next */
      if(customAttributeDefinitionsResponse.meta === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'customAttributeDefinitionsResponse.meta === undefined', {
        customAttributeDefinitionsResponse: customAttributeDefinitionsResponse
      });
      /* istanbul ignore next */
      if(customAttributeDefinitionsResponse.meta.pagination === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'customAttributeDefinitionsResponse.meta.pagination === undefined', {
        customAttributeDefinitionsResponse: customAttributeDefinitionsResponse
      });
      const pagination: Pagination = customAttributeDefinitionsResponse.meta.pagination;
      nextPage = pagination.nextPage;
    }
    if(customAttributeDefinitionList.length === 0) return undefined;
    if(customAttributeDefinitionList.length > 1) throw new EpSdkApiContentError(logName, this.constructor.name,'customAttributeDefinitionList.length > 1', {
      customAttributeDefinitionList: customAttributeDefinitionList
    });

      // // DEBUG
      // const log2 = {
      //   applicationDomainId: applicationDomainId ? applicationDomainId : 'undefined',
      //   attributeName,
      //   customAttributeDefinitionList_0: customAttributeDefinitionList[0]
      // }
      // console.log(`\n\n\n${logName}: log2 = ${JSON.stringify(log2, null, 2)}\n\n\n`);




    return customAttributeDefinitionList[0];
  }

  public getById = async ({ xContextId, customAttributeDefinitionId, applicationDomainId }: {
    xContextId?: string;
    customAttributeDefinitionId: string;
    applicationDomainId?: string;
  }): Promise<CustomAttributeDefinition> => {
    const funcName = 'getById';
    const logName = `${EpSdkCustomAttributeDefinitionsServiceClass.name}.${funcName}()`;

    let customAttributeDefinition: CustomAttributeDefinition;
    if(applicationDomainId) {
      const customAttributeDefinitionsResponse: CustomAttributeDefinitionsResponse = await CustomAttributeDefinitionsService.getCustomAttributeDefinitionsByApplicationDomain({
        xContextId: xContextId,
        applicationDomainId: applicationDomainId,
      });
      /* istanbul ignore next */
      if(customAttributeDefinitionsResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "customAttributeDefinitionsResponse.data === undefined", {
        customAttributeDefinitionsResponse: customAttributeDefinitionsResponse
      });
      const customAttributeDefinition = customAttributeDefinitionsResponse.data.find((x)=> { return x.id === customAttributeDefinitionId; });
      if(customAttributeDefinition === undefined) throw new Error(`customAttributeDefinitionId=${customAttributeDefinitionId} in applcationDomainId=${applicationDomainId} not found`);
    } else {
      const customAttributeDefinitionResponse = await CustomAttributeDefinitionsService.getCustomAttributeDefinition({
        xContextId: xContextId,
        id: customAttributeDefinitionId,
      });
      /* istanbul ignore next */
      if (customAttributeDefinitionResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "customAttributeDefinitionResponse.data === undefined", {
        customAttributeDefinitionId: customAttributeDefinitionId
      });
      customAttributeDefinition = customAttributeDefinitionResponse.data;      
    }
    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, {code: EEpSdkLoggerCodes.SERVICE_GET, module: this.constructor.name, details: {
      customAttributeDefinition: customAttributeDefinition
    }}));
    return customAttributeDefinition;
  }

  public deleteById = async ({ xContextId, applicationDomainId, customAttributeDefinitionId }: {
    xContextId?: string;
    customAttributeDefinitionId: string;
    applicationDomainId?: string;
  }): Promise<CustomAttributeDefinition> => {
    const customAttributeDefinition: CustomAttributeDefinition = await this.getById({xContextId, customAttributeDefinitionId, applicationDomainId });
    if(applicationDomainId) {
      await CustomAttributeDefinitionsService.deleteCustomAttributeDefinitionOfApplicationDomain({xContextId, applicationDomainId,
        customAttributeId: customAttributeDefinitionId
      });
    } else {
      await CustomAttributeDefinitionsService.deleteCustomAttributeDefinition({ xContextId,
        id: customAttributeDefinitionId,
      });
    }
    return customAttributeDefinition;
  }

}

/** @category Services */
export default new EpSdkCustomAttributeDefinitionsServiceClass();

