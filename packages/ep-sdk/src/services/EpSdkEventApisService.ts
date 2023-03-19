import { 
  CustomAttribute,
  CustomAttributeDefinition,
  EventApi,
  EventApiResponse,
  EventApisResponse, 
  EventApIsService, 
} from '@solace-labs/ep-openapi-node';
import { EEpSdkCustomAttributeEntityTypes, TEpSdkCustomAttributeList } from '../types';
import { 
  EpSdkApiContentError, 
  EpSdkServiceError,
  EpSdkLogger,
  EEpSdkLoggerCodes
} from '../utils';
import EpSdkCustomAttributesService from './EpSdkCustomAttributesService';
import { EpSdkServiceClass } from './EpSdkService';


/** @category Services */
export class EpSdkEventApisServiceClass extends EpSdkServiceClass {
  
  private async updateEventApi({ xContextId, update }:{
    xContextId?: string;
    update: EventApi;
  }): Promise<EventApi> {
    const funcName = 'updateEpEvent';
    const logName = `${EpSdkEventApisServiceClass.name}.${funcName}()`;
    /* istanbul ignore next */
    if(update.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'update.id === undefined', {
      update: update
    });
    const eventApiResponse: EventApiResponse = await EventApIsService.updateEventApi({
      xContextId,
      id: update.id,
      requestBody: update
    });
    /* istanbul ignore next */
    if(eventApiResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventApiResponse.data === undefined', {
      eventApiResponse: eventApiResponse
    });
    return eventApiResponse.data;
  }

  /**
   * Sets the custom attributes in the list on the application.
   * Creates attribute definitions / adds entity type 'application' if it doesn't exist.
   * @param param0 
   * @returns 
   */
  public async setCustomAttributes({ xContextId, eventApiId, epSdkCustomAttributeList, scope, applicationDomainId }:{
    xContextId?: string;
    eventApiId: string;
    epSdkCustomAttributeList: TEpSdkCustomAttributeList;
    scope?: CustomAttributeDefinition.scope;
    applicationDomainId?: string;
  }): Promise<EventApi> {
    const eventApi: EventApi = await this.getById({
      xContextId,
      eventApiId: eventApiId
    });
    scope;
    const customAttributes: Array<CustomAttribute> = await EpSdkCustomAttributesService.createCustomAttributesWithNew({
      xContextId,
      existingCustomAttributes: eventApi.customAttributes,
      epSdkCustomAttributeList: epSdkCustomAttributeList,
      epSdkCustomAttributeEntityType: EEpSdkCustomAttributeEntityTypes.EVENT_API,
      applicationDomainId: applicationDomainId,
      // note: adding scope if not organization currently causes EP to return an internal server error
      // scope: scope
    });
    return await this.updateEventApi({
      xContextId,
      update: {
        ...eventApi,
        customAttributes: customAttributes,  
      }
    });
  }

  public getByName = async({ xContextId, eventApiName, applicationDomainId }:{
    xContextId?: string;
    eventApiName: string;
    applicationDomainId: string;
  }): Promise<EventApi | undefined> => {
    const funcName = 'getByName';
    const logName = `${EpSdkEventApisServiceClass.name}.${funcName}()`;

    const eventApisResponse: EventApisResponse = await EventApIsService.getEventApis({
      xContextId,
      applicationDomainId: applicationDomainId,
      name: eventApiName
    });

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.SERVICE_GET, module: this.constructor.name, details: {
      eventApisResponse: eventApisResponse
    }}));

    if(eventApisResponse.data === undefined || eventApisResponse.data.length === 0) return undefined;
    /* istanbul ignore next */
    if(eventApisResponse.data.length > 1) throw new EpSdkApiContentError(logName, this.constructor.name,'eventApisResponse.data.length > 1', {    
      eventApisResponse: eventApisResponse
    });
    const eventApi: EventApi = eventApisResponse.data[0];
    return eventApi;
  }

  public getById = async({ xContextId, eventApiId, applicationDomainId }:{
    xContextId?: string;
    eventApiId: string;
    applicationDomainId?: string;
  }): Promise<EventApi> => {
    const funcName = 'getById';
    const logName = `${EpSdkEventApisServiceClass.name}.${funcName}()`;

    applicationDomainId;
    const eventApiResponse: EventApiResponse = await EventApIsService.getEventApi({
      xContextId,
      id: eventApiId
    });

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.SERVICE_GET, module: this.constructor.name, details: {
      eventApiResponse: eventApiResponse
    }}));

    if(eventApiResponse.data === undefined) {
      /* istanbul ignore next */
      throw new EpSdkApiContentError(logName, this.constructor.name, "eventApiResponse.data === undefined", {
        eventApiId: eventApiId
      });
    }
    const eventApi: EventApi = eventApiResponse.data;
    return eventApi;
  }

  public deleteById = async({ xContextId, eventApiId, applicationDomainId }:{
    xContextId?: string;
    eventApiId: string;
    applicationDomainId?: string;
  }): Promise<EventApi> => {
    const eventApi: EventApi = await this.getById({ 
      xContextId,
      applicationDomainId: applicationDomainId,
      eventApiId: eventApiId,
    });
    const xvoid: void = await EventApIsService.deleteEventApi({ 
      xContextId,
      id: eventApiId,
    });
    xvoid;
    return eventApi;
  }

  public deleteByName = async({ xContextId, applicationDomainId, eventApiName }: {
    xContextId?: string;
    eventApiName: string;
    applicationDomainId: string;
  }): Promise<EventApi> => {
    const funcName = 'deleteByName';
    const logName = `${EpSdkEventApisServiceClass.name}.${funcName}()`;
    
    const eventApi: EventApi | undefined = await this.getByName({ 
      xContextId,
      applicationDomainId: applicationDomainId,
      eventApiName: eventApiName,
     });
    if(eventApi === undefined) throw new EpSdkServiceError(logName, this.constructor.name, "eventApi === undefined", {
      applicationDomainId: applicationDomainId,
      eventApiName: eventApiName
    });
    /* istanbul ignore next */
    if(eventApi.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventApi.id === undefined', {
      eventApi: eventApi,
    });
    const eventApiDeleted: EventApi = await this.deleteById({ 
      xContextId,
      applicationDomainId: applicationDomainId,
      eventApiId: eventApi.id
     });
    return eventApiDeleted;
  }

}

/** @category Services */
export default new EpSdkEventApisServiceClass();

