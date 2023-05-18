import {
  CustomAttribute,
  EnumsService, 
  TopicAddressEnum,
  TopicAddressEnumResponse, 
  TopicAddressEnumsResponse,
} from '@solace-labs/ep-openapi-node';
import { 
  EEpSdkCustomAttributeEntityTypes,
  TEpSdkCustomAttribute
} from '../types';
import { 
  EpSdkApiContentError, 
  EpSdkServiceError,
  EpSdkLogger,
  EEpSdkLoggerCodes,
} from '../utils';
import { 
  EpSdkServiceClass 
} from './EpSdkService';
import EpSdkCustomAttributesService from './EpSdkCustomAttributesService';


/** @category Services */
export class EpSdkEnumsServiceClass extends EpSdkServiceClass {

  private async updateEnum({ xContextId, update }:{
    xContextId?: string;
    update: TopicAddressEnum;
  }): Promise<TopicAddressEnum> {
    const funcName = 'updateEnum';
    const logName = `${EpSdkEnumsServiceClass.name}.${funcName}()`;
    /* istanbul ignore next */
    if(update.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'update.id === undefined', {
      update: update
    });
    const topicAddressEnumResponse: TopicAddressEnumResponse = await EnumsService.updateEnum({
      xContextId,
      id: update.id,
      requestBody: update
    });
    /* istanbul ignore next */
    if(topicAddressEnumResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'topicAddressEnumResponse.data === undefined', {
      topicAddressEnumResponse: topicAddressEnumResponse
    });
    return topicAddressEnumResponse.data;
  }

  /**
   * Sets the custom attributes in the list on the event api product.
   * Creates attribute definitions / adds entity type 'eventApiProduct' if it doesn't exist.
   */
  public async setCustomAttributes({ xContextId, enumId, epSdkCustomAttributes}:{
    xContextId?: string;
    enumId: string;
    epSdkCustomAttributes: Array<TEpSdkCustomAttribute>;
  }): Promise<TopicAddressEnum> {
    // const funcName = 'setCustomAttributes';
    // const logName = `${EpSdkEnumsServiceClass.name}.${funcName}()`;
    const topicAddressEnum: TopicAddressEnum = await this.getById({xContextId, enumId });
    const customAttributes: Array<CustomAttribute> = await EpSdkCustomAttributesService.createCustomAttributesWithNew({
      xContextId,
      existingCustomAttributes: topicAddressEnum.customAttributes,
      epSdkCustomAttributes,
      epSdkCustomAttributeEntityType: EEpSdkCustomAttributeEntityTypes.ENUM,
    });
    return await this.updateEnum({
      xContextId,
      update: {
        ...topicAddressEnum,
        customAttributes: customAttributes,  
      }
    });
  }

  public getByName = async ({ xContextId, enumName, applicationDomainId }: {
    xContextId?: string;
    enumName: string;
    applicationDomainId: string;
  }): Promise<TopicAddressEnum | undefined> => {
    const funcName = 'getByName';
    const logName = `${EpSdkEnumsServiceClass.name}.${funcName}()`;

    const topicAddressEnumsResponse: TopicAddressEnumsResponse = await EnumsService.getEnums({
      xContextId: xContextId,
      applicationDomainId: applicationDomainId,
      names: [enumName]
    });
    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, {
      code: EEpSdkLoggerCodes.SERVICE_GET, module: this.constructor.name, details: {
        topicAddressEnumsResponse: topicAddressEnumsResponse
      }
    }));

    if (topicAddressEnumsResponse.data === undefined || topicAddressEnumsResponse.data.length === 0) return undefined;
    /* istanbul ignore next */
    if (topicAddressEnumsResponse.data.length > 1) throw new EpSdkApiContentError(logName, this.constructor.name, 'topicAddressEnumsResponse.data.length > 1', {
      topicAddressEnumsResponse: topicAddressEnumsResponse
    });
    const topicAddressEnum: TopicAddressEnum = topicAddressEnumsResponse.data[0];
    return topicAddressEnum;
  }

  public getById = async ({ xContextId, enumId, applicationDomainId }: {
    xContextId?: string;
    enumId: string;
    applicationDomainId?: string;
  }): Promise<TopicAddressEnum> => {
    const funcName = 'getById';
    const logName = `${EpSdkEnumsServiceClass.name}.${funcName}()`;
    applicationDomainId;
    const topicAddressEnumResponse: TopicAddressEnumResponse = await EnumsService.getEnum({
      xContextId: xContextId,
      id: enumId
    });
    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, {
      code: EEpSdkLoggerCodes.SERVICE_GET, module: this.constructor.name, details: {
        topicAddressEnumResponse: topicAddressEnumResponse
      }
    }));

    /* istanbul ignore next */
    if (topicAddressEnumResponse.data === undefined) {
      throw new EpSdkApiContentError(logName, this.constructor.name, "topicAddressEnumResponse.data === undefined", {
        enumId: enumId
      });
    }
    const topicAddressEnum: TopicAddressEnum = topicAddressEnumResponse.data;
    return topicAddressEnum;
  }

  public deleteById = async ({ xContextId, enumId, applicationDomainId }: {
    xContextId?: string;
    enumId: string;
    applicationDomainId: string;
  }): Promise<TopicAddressEnum> => {
    const topicAddressEnum: TopicAddressEnum = await this.getById({
      xContextId: xContextId,
      applicationDomainId: applicationDomainId,
      enumId: enumId,
    });
    const xvoid: void = await EnumsService.deleteEnum({
      xContextId: xContextId,
      id: enumId,
    });
    xvoid;
    return topicAddressEnum;
  }

  public deleteByName = async ({ xContextId, applicationDomainId, enumName }: {
    xContextId?: string;
    enumName: string;
    applicationDomainId: string;
  }): Promise<TopicAddressEnum> => {
    const funcName = 'deleteByName';
    const logName = `${EpSdkEnumsServiceClass.name}.${funcName}()`;

    const topicAddressEnum: TopicAddressEnum | undefined = await this.getByName({
      xContextId: xContextId,
      applicationDomainId: applicationDomainId,
      enumName: enumName,
    });
    if (topicAddressEnum === undefined) throw new EpSdkServiceError(logName, this.constructor.name, "topicAddressEnum === undefined", {
      applicationDomainId: applicationDomainId,
      enumName: enumName
    });
    /* istanbul ignore next */
    if (topicAddressEnum.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'topicAddressEnum.id === undefined', {
      topicAddressEnum: topicAddressEnum,
    });
    const deleted: TopicAddressEnum = await this.deleteById({
      xContextId: xContextId,
      applicationDomainId: applicationDomainId,
      enumId: topicAddressEnum.id
    });
    return deleted;
  }


}

/** @category Services */
export default new EpSdkEnumsServiceClass();

