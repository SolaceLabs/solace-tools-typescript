import { 
  CustomAttribute,
  Event as EPEvent, 
  EventResponse, 
  EventsResponse,
  EventsService,
  Pagination,
} from '@solace-labs/ep-openapi-node';
import { 
  EEpSdkCustomAttributeEntityTypes,
  TEpSdkCustomAttributeList 
} from '../types';
import { 
  EpSdkApiContentError, 
  EpSdkServiceError,
  EpSdkLogger,
  EEpSdkLoggerCodes
} from '../utils';
import EpSdkCustomAttributeDefinitionsService from './EpSdkCustomAttributeDefinitionsService';
import EpSdkCustomAttributesService from './EpSdkCustomAttributesService';
import { EpSdkServiceClass } from './EpSdkService';

/** @category Services */
export class EpSdkEpEventsServiceClass extends EpSdkServiceClass {
  
  private async updateEpEvent({ update }:{
    update: EPEvent;
  }): Promise<EPEvent> {
    const funcName = 'updateEpEvent';
    const logName = `${EpSdkEpEventsServiceClass.name}.${funcName}()`;

    /* istanbul ignore next */
    if(update.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'update.id === undefined', {
      update: update
    });

    const eventResponse: EventResponse = await EventsService.updateEvent({
      id: update.id,
      requestBody: update
    });
    /* istanbul ignore next */
    if(eventResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventResponse.data === undefined', {
      eventResponse: eventResponse
    });
    return eventResponse.data;
  }

  /**
   * Sets the custom attributes in the list on the application.
   * Creates attribute definitions / adds entity type 'application' if it doesn't exist.
   * @param param0 
   * @returns 
   */
  public async setCustomAttributes({ eventId, epSdkCustomAttributeList}:{
    eventId: string;
    epSdkCustomAttributeList: TEpSdkCustomAttributeList;
  }): Promise<EPEvent> {
    const epEvent: EPEvent = await this.getById({
      eventId: eventId
    });
    const customAttributes: Array<CustomAttribute> = await EpSdkCustomAttributesService.createCustomAttributesWithNew({
      existingCustomAttributes: epEvent.customAttributes,
      epSdkCustomAttributeList: epSdkCustomAttributeList,
      epSdkCustomAttributeEntityType: EEpSdkCustomAttributeEntityTypes.EVENT
    });
    return await this.updateEpEvent({
      update: {
        ...epEvent,
        customAttributes: customAttributes,  
      }
    });
  }

  /**
   * Unsets the custom attributes in the list on the application.
   * Leaves attibute definitions as-is.
   */
  public async unsetCustomAttributes({ eventId, epSdkCustomAttributeList }:{
    eventId: string;
    epSdkCustomAttributeList: TEpSdkCustomAttributeList;
  }): Promise<EPEvent> {
    const epEvent: EPEvent = await this.getById({
      eventId: eventId
    });
    const customAttributes: Array<CustomAttribute> = await EpSdkCustomAttributesService.createCustomAttributesExcluding({
      existingCustomAttributes: epEvent.customAttributes,
      epSdkCustomAttributeList: epSdkCustomAttributeList,
    });
    return await this.updateEpEvent({
      update: {
        ...epEvent,
        customAttributes: customAttributes,  
      }
    });
  }

  public async removeAssociatedEntityTypeFromCustomAttributeDefinitions({ customAttributeNames }: {
    customAttributeNames: Array<string>;
  }): Promise<void> {
    for(const customAttributeName of customAttributeNames) {
      await EpSdkCustomAttributeDefinitionsService.removeAssociatedEntityTypeFromCustomAttributeDefinition({
        attributeName: customAttributeName,
        associatedEntityType: EEpSdkCustomAttributeEntityTypes.EVENT,
      });
    }
  }

  /**
   * Retrieves a list of all Events without paging.
   * @param param0 
   */
  public listAll = async({ applicationDomainIds, shared, sortFieldName }:{
    applicationDomainIds?: Array<string>;
    shared: boolean;
    sortFieldName?: string;
  }): Promise<EventsResponse> => {
    const funcName = 'listAll';
    const logName = `${EpSdkEpEventsServiceClass.name}.${funcName}()`;

    const eventList: Array<EPEvent> = [];
    
    let nextPage: number | undefined | null = 1;
    while(nextPage !== undefined && nextPage !== null) {

      const eventsResponse: EventsResponse = await EventsService.getEvents({
        applicationDomainIds: applicationDomainIds,
        shared: shared,
        pageSize: 100,
        pageNumber: nextPage,
        sort: sortFieldName,
      });
      if(eventsResponse.data === undefined || eventsResponse.data.length === 0) nextPage = undefined;
      else {
        eventList.push(...eventsResponse.data);
        /* istanbul ignore next */
        if(eventsResponse.meta === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'eventsResponse.meta === undefined', {
          eventsResponse: eventsResponse
        });
        /* istanbul ignore next */
        if(eventsResponse.meta.pagination === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'eventsResponse.meta.pagination === undefined', {
          eventsResponse: eventsResponse
        });
        const pagination: Pagination = eventsResponse.meta.pagination;
        nextPage = pagination.nextPage;  
      }
    }
    const eventsResponse: EventsResponse = {
      data: eventList,
      meta: {
        pagination: {
          count: eventList.length,
        }
      }
    };
    return eventsResponse;
  }

  public getByName = async({ eventName, applicationDomainId }:{
    eventName: string;
    applicationDomainId: string;
  }): Promise<EPEvent | undefined> => {
    const funcName = 'getByName';
    const logName = `${EpSdkEpEventsServiceClass.name}.${funcName}()`;

    const eventsResponse: EventsResponse = await EventsService.getEvents({
      applicationDomainId: applicationDomainId,
      name: eventName
    });

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.SERVICE_GET, module: this.constructor.name, details: {
      eventsResponse: eventsResponse
    }}));

    if(eventsResponse.data === undefined || eventsResponse.data.length === 0) return undefined;
    if(eventsResponse.data.length > 1) throw new EpSdkApiContentError(logName, this.constructor.name,'eventsResponse.data.length > 1', {    
      eventsResponse: eventsResponse
    });
    const epEvent: EPEvent = eventsResponse.data[0];
    return epEvent;
  }

  public getById = async({ eventId }:{
    eventId: string;
  }): Promise<EPEvent> => {
    const funcName = 'getById';
    const logName = `${EpSdkEpEventsServiceClass.name}.${funcName}()`;

    const eventResponse: EventResponse = await EventsService.getEvent({
      id: eventId
    });
    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.SERVICE_GET, module: this.constructor.name, details: {
      eventResponse: eventResponse
    }}));

    if(eventResponse.data === undefined) {
      throw new EpSdkApiContentError(logName, this.constructor.name, "eventResponse.data === undefined", {
        eventId: eventId
      });
    }
    const epEvent: EPEvent = eventResponse.data;
    return epEvent;  
  }

  public deleteById = async({ eventId }:{
    eventId: string;
  }): Promise<EPEvent> => {
    const epEvent: EPEvent = await this.getById({ 
      eventId: eventId,
     });
    const xvoid: void = await EventsService.deleteEvent({ 
      id: eventId,
    });
    xvoid;
    return epEvent;
  }

  public deleteByName = async({ applicationDomainId, eventName }: {
    eventName: string;
    applicationDomainId: string;
  }): Promise<EPEvent> => {
    const funcName = 'deleteByName';
    const logName = `${EpSdkEpEventsServiceClass.name}.${funcName}()`;
    
    const epEvent: EPEvent | undefined = await this.getByName({ 
      applicationDomainId: applicationDomainId,
      eventName: eventName,
     });
    if(epEvent === undefined) throw new EpSdkServiceError(logName, this.constructor.name, "epEvent === undefined", {
      applicationDomainId: applicationDomainId,
      eventName: eventName
    });
    if(epEvent.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epEvent.id === undefined', {
      epEvent: epEvent,
    });
    const epEventDeleted: EPEvent = await this.deleteById({ 
      eventId: epEvent.id
     });
    return epEventDeleted;
  }


}

/** @category Services */
export default new EpSdkEpEventsServiceClass();

