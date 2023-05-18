import { 
  CustomAttribute,
} from "@solace-labs/ep-openapi-node";
import { 
  EpSdkApiContentError 
} from "../utils";
import { 
  EEpSdkCustomAttributeEntityTypes,
  TEpSdkCustomAttribute, 
} from "../types";
import { 
  EEpSdkTask_TargetState, 
  EpSdkCustomAttributeDefinitionTask, 
  IEpSdkCustomAttributeDefinitionTask_ExecuteReturn 
} from "../tasks";
import EpSdkCustomAttributeDefinitionsService from "./EpSdkCustomAttributeDefinitionsService";

/** @category Services */
export class EpSdkCustomAttributesServiceClass {

  /**
   * Returns full custom attributes including existing & new ones.
   * Ensures any missing definitions are created or their entity types added.
   */
  public async createCustomAttributesWithNew({ xContextId, existingCustomAttributes, epSdkCustomAttributes, epSdkCustomAttributeEntityType }:{
    xContextId?: string;
    existingCustomAttributes?: Array<CustomAttribute>;
    epSdkCustomAttributes: Array<TEpSdkCustomAttribute>;
    epSdkCustomAttributeEntityType: EEpSdkCustomAttributeEntityTypes;
  }): Promise<Array<CustomAttribute>> {
    const funcName = 'createCustomAttributesWithNew';
    const logName = `${EpSdkCustomAttributesServiceClass.name}.${funcName}()`;

    const customAttributeList: Array<CustomAttribute> = [];

    for(const epSdkCustomAttribute of epSdkCustomAttributes) {
      const associatedEntityTypes: Array<EEpSdkCustomAttributeEntityTypes> = await EpSdkCustomAttributeDefinitionsService.presentAssociatedEntityType({
        xContextId: xContextId,
        attributeName: epSdkCustomAttribute.name,
        associatedEntityType: epSdkCustomAttributeEntityType
      });
      // present custom attribute definition
      const epSdkCustomAttributeDefinitionTask = new EpSdkCustomAttributeDefinitionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        attributeName: epSdkCustomAttribute.name,
        customAttributeDefinitionObjectSettings: {
          associatedEntityTypes,
          scope: epSdkCustomAttribute.scope,
          applicationDomainId: epSdkCustomAttribute.applicationDomainId,
          valueType: epSdkCustomAttribute.valueType,
        },
      });
      const epSdkCustomAttributeDefinitionTask_ExecuteReturn: IEpSdkCustomAttributeDefinitionTask_ExecuteReturn = await epSdkCustomAttributeDefinitionTask.execute(xContextId);
      /* istanbul ignore next */
      if(epSdkCustomAttributeDefinitionTask_ExecuteReturn.epObject.id == undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'epSdkCustomAttributeDefinitionTask_ExecuteReturn.epObject.id == undefined', {
        epSdkCustomAttributeDefinitionTask_ExecuteReturn_epObject: epSdkCustomAttributeDefinitionTask_ExecuteReturn.epObject
      });
      customAttributeList.push({
        customAttributeDefinitionId: epSdkCustomAttributeDefinitionTask_ExecuteReturn.epObject.id,
        customAttributeDefinitionName: epSdkCustomAttribute.name,
        value: epSdkCustomAttribute.value
      });
    }
    // add existing ones if not present
    if(existingCustomAttributes) {
      for(const existing of existingCustomAttributes) {
        const exists = customAttributeList.find( (x) => {
          return x.customAttributeDefinitionName === existing.customAttributeDefinitionName;
        });
        if(exists === undefined) customAttributeList.push(existing);
      }
    }
    return customAttributeList;
  }

  /**
   * Returns full custom attributes exluding list of attributes.
   */
  public createCustomAttributesExcluding({ existingCustomAttributes, epSdkCustomAttributes }:{
    existingCustomAttributes?: Array<CustomAttribute>;
    epSdkCustomAttributes: Array<TEpSdkCustomAttribute>;
  }): Array<CustomAttribute> {
    // const funcName = 'createCustomAttributesExcluding';
    // const logName = `${EpSdkCustomAttributesService.name}.${funcName}()`;

    const customAttributeList: Array<CustomAttribute> = [];

    if(existingCustomAttributes === undefined) return [];
    for(const existingCustomAttribute of existingCustomAttributes) {
      const exists = epSdkCustomAttributes.find( (x) => {
        return x.name === existingCustomAttribute.customAttributeDefinitionName;
      });
      if(exists === undefined) customAttributeList.push(existingCustomAttribute);
    }
    return customAttributeList;
  }
}

/** @category Services */
export default new EpSdkCustomAttributesServiceClass();

