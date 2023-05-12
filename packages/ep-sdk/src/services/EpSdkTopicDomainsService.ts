import {
  TopicDomainsResponse,
  TopicDomainsService,
  TopicDomain,
  Pagination
} from '@solace-labs/ep-openapi-node';
import { 
  EpSdkApiContentError, 
  EpSdkLogger,
  EEpSdkLoggerCodes
} from '../utils';
import { EpSdkServiceClass } from './EpSdkService';
import { EpApiMaxPageSize } from '../constants';

/** @category Services */
export class EpSdkTopicDomainsServiceClass extends EpSdkServiceClass {

  public listAll = async({ applicationDomainId, pageSize = EpApiMaxPageSize, xContextId }:{
    xContextId?: string;
    applicationDomainId: string;
    pageSize?: number; /** for testing */
  }): Promise<TopicDomainsResponse> => {
    const funcName = 'listAll';
    const logName = `${EpSdkTopicDomainsServiceClass.name}.${funcName}()`;
    const topicDomainList: Array<TopicDomain> = [];
    let nextPage: number | undefined | null = 1;
    while(nextPage !== undefined && nextPage !== null) {
      const topicDomainsResponse: TopicDomainsResponse = await TopicDomainsService.getTopicDomains({ 
        xContextId,
        applicationDomainId,
        pageSize,
        pageNumber: nextPage
      });
      if(topicDomainsResponse.data === undefined || topicDomainsResponse.data.length === 0) nextPage = undefined;
      else {
        topicDomainList.push(...topicDomainsResponse.data);
        /* istanbul ignore next */
        if(topicDomainsResponse.meta === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'topicDomainsResponse.meta === undefined', { topicDomainsResponse });
        /* istanbul ignore next */
        if(topicDomainsResponse.meta.pagination === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'topicDomainsResponse.meta.pagination === undefined', { topicDomainsResponse });
        const pagination: Pagination = topicDomainsResponse.meta.pagination;
        nextPage = pagination.nextPage;  
      }
    }
    const topicDomainsResponse: TopicDomainsResponse = {
      data: topicDomainList,
      meta: {
        pagination: {
          count: topicDomainList.length
        }
      }
    };
    return topicDomainsResponse;
  }

  public getByApplicationDomainId = async ({ xContextId, applicationDomainId }: {
    xContextId?: string;
    applicationDomainId: string;
  }): Promise<TopicDomain | undefined> => {
    const funcName = 'getByApplicationDomainId';
    const logName = `${EpSdkTopicDomainsServiceClass.name}.${funcName}()`;

    const topicDomainsResponse: TopicDomainsResponse = await TopicDomainsService.getTopicDomains({ xContextId, applicationDomainId });
    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, {code: EEpSdkLoggerCodes.SERVICE_GET, module: this.constructor.name, details: {
      applicationDomainId,
      topicDomainsResponse
    }}));

    if(topicDomainsResponse.data === undefined) return undefined;
    /* istanbul ignore next */
    if(topicDomainsResponse.data.length > 1) throw new EpSdkApiContentError(logName, this.constructor.name, "topicDomainsResponse.data.length > 1", {
      applicationDomainId,
      topicDomainsResponse
    });
    return topicDomainsResponse.data[0];
  }

}

/** @category Services */
export default new EpSdkTopicDomainsServiceClass();

