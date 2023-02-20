import {
  CustomAttributeDefinition,
  CustomAttributeDefinitionResponse,
  CustomAttributeDefinitionsResponse,
  CustomAttributeDefinitionsService,
  Pagination,
} from '@solace-labs/ep-openapi-node';
import { 
  EpSdkApiContentError, 
  EpSdkLogger,
  EEpSdkLoggerCodes
} from '../utils';
import { 
  EpApiMaxPageSize 
} from '../constants';
import { 
  EEpSdkCustomAttributeEntityTypes, 
} from '../types';
import { 
  EEpSdkTask_TargetState, 
  EpSdkCustomAttributeDefinitionTask, 
  IEpSdkCustomAttributeDefinitionTask_ExecuteReturn 
} from '../tasks';
import { EpSdkServiceClass } from './EpSdkService';

/** @category Services */
export class EpSdkCustomAttributeDefinitionsServiceClass extends EpSdkServiceClass {

  /**
   * Adds the associated entity type to existing list of entity types if definition exists.
   * Returns list of all associated enitity types.
   */
  public async presentAssociatedEntityType({ xContextId, attributeName, associatedEntityType}:{
    xContextId?: string;
    attributeName: string;
    associatedEntityType: EEpSdkCustomAttributeEntityTypes;
  }): Promise<Array<EEpSdkCustomAttributeEntityTypes>> {
    const customAttributeDefinition: CustomAttributeDefinition | undefined = await this.getByName({
      xContextId: xContextId,
      attributeName: attributeName,
    });
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

  /* istanbul ignore next */
  // public getByAssociatedEntityTypes = async({ associatedEntityTypes, pageSize = EpApiHelpers.MaxPageSize }:{
  //   associatedEntityTypes: Array<string>;
  //   pageSize?: number; /** for testing */
  // }): Promise<Array<CustomAttributeDefinition>> => {
  //   const funcName = 'getByAssociatedEntityTypes';
  //   const logName = `${EpSdkCustomAttributeDefinitionsService.name}.${funcName}()`;

  //   if(associatedEntityTypes.length === 0) return [];

  //   let customAttributeDefinitionList: Array<CustomAttributeDefinition> = [];
  //   let nextPage: number | undefined | null = 1;

  //   while(nextPage !== null) {
  //     const customAttributeDefinitionsResponse: CustomAttributeDefinitionsResponse = await CustomAttributeDefinitionsService.getCustomAttributeDefinitions({
  //       associatedEntityTypes: associatedEntityTypes,
  //       pageSize: pageSize,
  //       pageNumber: nextPage,
  //     });
  //     if(customAttributeDefinitionsResponse.data === undefined || customAttributeDefinitionsResponse.data.length === 0) nextPage = null;
  //     else customAttributeDefinitionList.push(...customAttributeDefinitionsResponse.data);

  //     /* istanbul ignore next */
  //     if(customAttributeDefinitionsResponse.meta === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'customAttributeDefinitionsResponse.meta === undefined', {
  //       customAttributeDefinitionsResponse: customAttributeDefinitionsResponse
  //     });
  //     /* istanbul ignore next */
  //     if(customAttributeDefinitionsResponse.meta.pagination === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'customAttributeDefinitionsResponse.meta.pagination === undefined', {
  //       customAttributeDefinitionsResponse: customAttributeDefinitionsResponse
  //     });      
  //     const pagination: Pagination = customAttributeDefinitionsResponse.meta.pagination;
  //     nextPage = pagination.nextPage;
  //   }
  //   return customAttributeDefinitionList;
  // }

  /**
   * Get attribute definition by name. Name is unique.
   */
  public getByName = async ({ xContextId, attributeName, pageSize = EpApiMaxPageSize }: {
    xContextId?: string;
    attributeName: string;
    pageSize?: number; /** for testing */
  }): Promise<CustomAttributeDefinition | undefined> => {
    const funcName = 'getByName';
    const logName = `${EpSdkCustomAttributeDefinitionsServiceClass.name}.${funcName}()`;

    const customAttributeDefinitionList: Array<CustomAttributeDefinition> = [];
    let nextPage: number | undefined | null = 1;

    while(nextPage !== null) {
      const customAttributeDefinitionsResponse: CustomAttributeDefinitionsResponse = await CustomAttributeDefinitionsService.getCustomAttributeDefinitions({
        xContextId: xContextId,
        pageSize: pageSize,
        pageNumber: nextPage,
      });
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
    return customAttributeDefinitionList[0];
  }

  public getById = async ({ xContextId, customAttributeDefinitionId }: {
    xContextId?: string;
    customAttributeDefinitionId: string;
  }): Promise<CustomAttributeDefinition> => {
    const funcName = 'getById';
    const logName = `${EpSdkCustomAttributeDefinitionsServiceClass.name}.${funcName}()`;

    const customAttributeDefinitionResponse: CustomAttributeDefinitionResponse = await CustomAttributeDefinitionsService.getCustomAttributeDefinition({
      xContextId: xContextId,
      id: customAttributeDefinitionId,
    })
    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, {
      code: EEpSdkLoggerCodes.SERVICE_GET, module: this.constructor.name, details: {
        customAttributeDefinitionResponse: customAttributeDefinitionResponse
      }
    }));

    /* istanbul ignore next */
    if (customAttributeDefinitionResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "customAttributeDefinitionResponse.data === undefined", {
      customAttributeDefinitionId: customAttributeDefinitionId
    });
    const customAttributeDefinition: CustomAttributeDefinition = customAttributeDefinitionResponse.data;
    return customAttributeDefinition;
  }

  public deleteById = async ({ xContextId, customAttributeDefinitionId }: {
    xContextId?: string;
    customAttributeDefinitionId: string;
  }): Promise<CustomAttributeDefinition> => {
    const customAttributeDefinition: CustomAttributeDefinition = await this.getById({
      xContextId: xContextId,
      customAttributeDefinitionId: customAttributeDefinitionId,
    });
    const xvoid: void = await CustomAttributeDefinitionsService.deleteCustomAttributeDefinition({
      xContextId: xContextId,
      id: customAttributeDefinitionId,
    });
    xvoid;
    return customAttributeDefinition;
  }


}

/** @category Services */
export default new EpSdkCustomAttributeDefinitionsServiceClass();

