import {
  AddressLevel,
  TopicAddressEnumVersion,
} from '@solace-labs/ep-openapi-node';
import { EpSdkServiceClass } from './EpSdkService';
import EpSdkEnumVersionsService from './EpSdkEnumVersionsService';
import { EpSdkDefaultTopicDelimitors } from '../types';

/** @category Services */
export class EpSdkTopicAddressLevelServiceClass extends EpSdkServiceClass {

  private async getEnumVersionId({ enumName, applicationDomainIds, xContextId }:{
    xContextId?: string;
    enumName: string;
    applicationDomainIds?: Array<string>;
  }): Promise<string | undefined> {
    if(applicationDomainIds && applicationDomainIds.length > 0) {
      for(const applicationDomainId of applicationDomainIds) {
        const topicAddressEnumVersion: TopicAddressEnumVersion | undefined = await EpSdkEnumVersionsService.getLatestVersionForEnumName({
          xContextId,
          enumName,
          applicationDomainId,
        });
        if(topicAddressEnumVersion !== undefined) return topicAddressEnumVersion.id;    
      }
    }
    return undefined;
  }

  /**
   * Creates AddressLevel array from topic string.
   * If topic string includes variables (denoted by encapuslating curly braces), it tries to find the enum by Name in the provided enumApplicationDomainIds.
   * It will use the first one found.
   * It will use the latest enumVersion for the enumName.
   * If the enum cannot be found, it will assume an unbounded variable.
   * @returns Array<AddressLevel> if topicString.length > 0, otherwise undefined
   */
  public async createTopicAddressLevels({ topicString, topicDelimiter = EpSdkDefaultTopicDelimitors.Solace, enumApplicationDomainIds, xContextId }:{
    xContextId?: string;
    topicString: string;
    topicDelimiter?: string[1];
    enumApplicationDomainIds?: Array<string>;
  }): Promise<Array<AddressLevel> | undefined> {
    if(topicString.length === 0) return undefined;
    const topicLevelList: Array<string> = topicString.split(topicDelimiter);
    const addressLevels: Array<AddressLevel> = [];
    for (let topicLevel of topicLevelList) {
      let type = AddressLevel.addressLevelType.LITERAL;
      let enumVersionId: string | undefined = undefined;
      if (topicLevel.includes("{")) {
        topicLevel = topicLevel.replace("}", "").replace("{", "");
        type = AddressLevel.addressLevelType.VARIABLE;
        enumVersionId = await this.getEnumVersionId({
          xContextId,
          enumName: topicLevel,
          applicationDomainIds: enumApplicationDomainIds
        });
      }
      addressLevels.push({
        name: topicLevel,
        addressLevelType: type,
        enumVersionId: enumVersionId,
      });
    }
    return addressLevels;
  }

}

/** @category Services */
export default new EpSdkTopicAddressLevelServiceClass();

