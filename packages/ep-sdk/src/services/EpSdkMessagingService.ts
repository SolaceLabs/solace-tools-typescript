import {
  MessagingService, 
  MessagingServiceResponse, 
  MessagingServicesResponse, 
  MessagingServicesService,
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
import { EpSdkServiceClass } from './EpSdkService';


/** @category Services */
export class EpSdkMessagingServiceClass extends EpSdkServiceClass {

  public getById = async ({ xContextId, messagingServiceId }: {
    xContextId: string;
    messagingServiceId: string;
  }): Promise<MessagingService> => {
    const funcName = 'getById';
    const logName = `${EpSdkMessagingServiceClass.name}.${funcName}()`;

    const messagingServiceResponse: MessagingServiceResponse = await MessagingServicesService.getMessagingService({ 
      xContextId,
      id: messagingServiceId,
    });
    /* istanbul ignore next */
    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, {
      code: EEpSdkLoggerCodes.SERVICE_GET, module: this.constructor.name, details: {
        messagingServiceResponse: messagingServiceResponse
      }
    }));

    /* istanbul ignore next */
    if (messagingServiceResponse.data === undefined) {
      throw new EpSdkApiContentError(logName, this.constructor.name, "messagingServiceResponse.data === undefined", {
        messagingServiceId: messagingServiceId
      });
    }
    return messagingServiceResponse.data;
  }

  public listAll = async({ xContextId, idList, pageSize = EpApiMaxPageSize }:{
    xContextId: string;
    idList?: Array<string>;
    pageSize?: number; /** for testing */
  }): Promise<Array<MessagingService>> => {
    const funcName = 'listAll';
    const logName = `${EpSdkMessagingServiceClass.name}.${funcName}()`;

    const messagingServiceList: Array<MessagingService> = [];
    let nextPage: number | undefined | null = 1;
    while (nextPage !== undefined && nextPage !== null) {
      const messagingServicesResponse: MessagingServicesResponse = await MessagingServicesService.getMessagingServices({
        xContextId,
        ids: idList && idList.length > 0 ? idList : undefined,
        pageNumber: nextPage,
        pageSize: pageSize,
      });
      if (messagingServicesResponse.data === undefined || messagingServicesResponse.data.length === 0) nextPage = null;
      else {
        messagingServiceList.push(...messagingServicesResponse.data);
      }
      /* istanbul ignore next */
      if (messagingServicesResponse.meta === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'messagingServicesResponse.meta === undefined', {
        messagingServicesResponse: messagingServicesResponse
      });
      /* istanbul ignore next */
      if (messagingServicesResponse.meta.pagination === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'messagingServicesResponse.meta.pagination === undefined', {
        messagingServicesResponse: messagingServicesResponse
      });      
      const pagination: Pagination = messagingServicesResponse.meta.pagination;
      nextPage = pagination.nextPage;
    }
    return messagingServiceList;
  }

}

/** @category Services */
export default new EpSdkMessagingServiceClass();

