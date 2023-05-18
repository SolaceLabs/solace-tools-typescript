import { 
  ApiError,
  CustomAttribute,
  Event as EPEvent,
  EventResponse, 
  EventsResponse,
  EventsService,
  Pagination,
} from '@solace-labs/ep-openapi-node';
import { 
  EpSdkBrokerTypes,
  IEpSdkAttributesQuery,
  EpSdkEvent,
  EpSdkEventResponse,
  EpSdkEventCreate,
  EpSdkEventUpdate,
  EpSdkEventsResponse,
  TEpSdkCustomAttribute,
  EEpSdkCustomAttributeEntityTypes,
} from '../types';
import { 
  EpSdkApiContentError, 
  EpSdkServiceError,
  EpSdkLogger,
  EEpSdkLoggerCodes
} from '../utils';
import { 
  EpSdkServiceClass 
} from './EpSdkService';
import EpSdkCustomAttributeDefinitionsService from './EpSdkCustomAttributeDefinitionsService';
import EpSdkCustomAttributesQueryService from './EpSdkCustomAttributesQueryService';
import EpSdkCustomAttributesService from './EpSdkCustomAttributesService';

/** @category Services */
export class EpSdkEpEventsServiceClass extends EpSdkServiceClass {
  
  private async updateEpEvent({ xContextId, update }:{
    xContextId?: string;
    update: EpSdkEventUpdate;
  }): Promise<EpSdkEvent> {
    const funcName = 'updateEpEvent';
    const logName = `${EpSdkEpEventsServiceClass.name}.${funcName}()`;

    /* istanbul ignore next */
    if(update.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'update.id === undefined', {
      update: update
    });

    const eventResponse: EventResponse = await EventsService.updateEvent({
      xContextId,
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
   * Sets the custom attributes in the list on the event.
   * Creates attribute definitions / adds entity type 'event' if it doesn't exist.
   * @param param0 
   * @returns 
   */
  public async setCustomAttributes({ xContextId, eventId, epSdkCustomAttributes }:{
    xContextId?: string;
    eventId: string;
    epSdkCustomAttributes: Array<TEpSdkCustomAttribute>;
  }): Promise<EpSdkEvent> {
    const epSdkEvent: EpSdkEvent = await this.getById({xContextId, eventId });
    const customAttributes: Array<CustomAttribute> = await EpSdkCustomAttributesService.createCustomAttributesWithNew({
      xContextId,
      existingCustomAttributes: epSdkEvent.customAttributes,
      epSdkCustomAttributes,
      epSdkCustomAttributeEntityType: EEpSdkCustomAttributeEntityTypes.EVENT,
    });
    return await this.updateEpEvent({
      xContextId,
      update: {
        ...epSdkEvent,
        customAttributes: customAttributes,  
      }
    });
  }

  /**
   * Unsets the custom attributes in the list on the event.
   * Leaves attibute definitions as-is.
   */
  public async unsetCustomAttributes({ xContextId, eventId, epSdkCustomAttributes }:{
    xContextId?: string;
    eventId: string;
    epSdkCustomAttributes: Array<TEpSdkCustomAttribute>;
  }): Promise<EpSdkEvent> {
    const epSdkEvent: EpSdkEvent = await this.getById({
      xContextId,
      eventId: eventId
    });
    const customAttributes: Array<CustomAttribute> = EpSdkCustomAttributesService.createCustomAttributesExcluding({
      existingCustomAttributes: epSdkEvent.customAttributes,
      epSdkCustomAttributes
    });
    return await this.updateEpEvent({
      xContextId,
      update: {
        ...epSdkEvent,
        customAttributes: customAttributes,  
      }
    });
  }

  public async removeAssociatedEntityTypeFromCustomAttributeDefinitions({ xContextId, customAttributeNames }: {
    xContextId?: string;
    customAttributeNames: Array<string>;
  }): Promise<void> {
    for(const customAttributeName of customAttributeNames) {
      await EpSdkCustomAttributeDefinitionsService.removeAssociatedEntityTypeFromCustomAttributeDefinition({
        xContextId,
        attributeName: customAttributeName,
        associatedEntityType: EEpSdkCustomAttributeEntityTypes.EVENT,
      });
    }
  }

  /**
   * Retrieves a sorted and filtered list of all Events without paging.
   * Filters are all AND.
   */
  public listAll = async({ xContextId, applicationDomainIds, shared, sortFieldName, brokerType, attributesQuery }:{
    xContextId?: string;
    applicationDomainIds?: Array<string>;
    shared: boolean;
    brokerType?: EpSdkBrokerTypes;
    attributesQuery?: IEpSdkAttributesQuery;
    sortFieldName?: string;
  }): Promise<EpSdkEventsResponse> => {
    const funcName = 'listAll';
    const logName = `${EpSdkEpEventsServiceClass.name}.${funcName}()`;

    const eventList: Array<EpSdkEvent> = [];
    
    let nextPage: number | undefined | null = 1;
    while(nextPage !== undefined && nextPage !== null) {
      const eventsResponse: EventsResponse = await EventsService.getEvents({
        xContextId,
        applicationDomainIds: applicationDomainIds,
        shared: shared,
        pageSize: 100,
        pageNumber: nextPage,
        sort: sortFieldName,
      });
      if(eventsResponse.data === undefined || eventsResponse.data.length === 0) nextPage = undefined;
      else {
        if(brokerType || attributesQuery) {
          const filteredList: Array<EPEvent> = eventsResponse.data.filter( (epEvent: EPEvent) => {
            let doAdd = false;
            /* istanbul ignore next */
            if(brokerType) {
              // EPEvent still has no brokerType in it
              // it is only in the event version, deliveryDescriptor
            }
            if(attributesQuery) {
              if(EpSdkCustomAttributesQueryService.resolve({
                customAttributes: epEvent.customAttributes,
                attributesQuery: attributesQuery,
              })) doAdd = true;
            }
            return doAdd;
          });
          eventList.push(...filteredList);
        } else eventList.push(...eventsResponse.data);
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
    const eventsResponse: EpSdkEventsResponse = {
      data: eventList,
      meta: {
        pagination: {
          count: eventList.length,
        }
      }
    };
    return eventsResponse;
  }

  public getByName = async({ xContextId, eventName, applicationDomainId }:{
    xContextId?: string;
    eventName: string;
    applicationDomainId: string;
  }): Promise<EpSdkEvent | undefined> => {
    const funcName = 'getByName';
    const logName = `${EpSdkEpEventsServiceClass.name}.${funcName}()`;

    const eventsResponse: EventsResponse = await EventsService.getEvents({
      xContextId,
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
    const epSdkEvent: EpSdkEvent = eventsResponse.data[0];
    return epSdkEvent;
  }

  public getById = async({ xContextId, eventId }:{
    xContextId?: string;
    eventId: string;
  }): Promise<EpSdkEvent | undefined> => {
    const funcName = 'getById';
    const logName = `${EpSdkEpEventsServiceClass.name}.${funcName}()`;
    try {
      const eventResponse: EventResponse = await EventsService.getEvent({
        xContextId,
        id: eventId
      });
      EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.SERVICE_GET, module: this.constructor.name, details: {
        eventResponse: eventResponse
      }}));
      if(eventResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "eventResponse.data === undefined", {
          eventId: eventId
        });
      const epSdkEvent: EpSdkEvent = eventResponse.data;
      return epSdkEvent;  
    } catch(e) {
      if(e instanceof ApiError && e.status === 404) return undefined;
      throw e;
    }
  }

  public deleteById = async({ xContextId, eventId }:{
    xContextId?: string;
    eventId: string;
  }): Promise<EpSdkEvent> => {
    const epSdkEvent: EpSdkEvent = await this.getById({ 
      xContextId,
      eventId: eventId,
     });
    const xvoid: void = await EventsService.deleteEvent({ 
      xContextId,
      id: eventId,
    });
    xvoid;
    return epSdkEvent;
  }

  public deleteByName = async({ xContextId, applicationDomainId, eventName }: {
    xContextId?: string;
    eventName: string;
    applicationDomainId: string;
  }): Promise<EpSdkEvent> => {
    const funcName = 'deleteByName';
    const logName = `${EpSdkEpEventsServiceClass.name}.${funcName}()`;
    
    const epSdkEvent: EpSdkEvent | undefined = await this.getByName({ 
      xContextId,
      applicationDomainId: applicationDomainId,
      eventName: eventName,
     });
    if(epSdkEvent === undefined) throw new EpSdkServiceError(logName, this.constructor.name, "epSdkEvent === undefined", {
      applicationDomainId: applicationDomainId,
      eventName: eventName
    });
    if(epSdkEvent.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epSdkEvent.id === undefined', {
      epSdkEvent: epSdkEvent,
    });
    const epSdkEventDeleted: EpSdkEvent = await this.deleteById({ 
      xContextId,
      eventId: epSdkEvent.id
     });
    return epSdkEventDeleted;
  }

  public createEvent = async({ xContextId, requestBody }:{
    xContextId?: string;
    requestBody: EpSdkEventCreate;
  }): Promise<EpSdkEventResponse> => {
    const funcName = 'createEvent';
    const logName = `${EpSdkEpEventsServiceClass.name}.${funcName}()`;
    const eventResponse: EventResponse = await EventsService.createEvent({
      xContextId,
      requestBody: {
        ...requestBody
      },
    });
    if(eventResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventResponse.data === undefined', {
      eventResponse: eventResponse,
    });
    const epSdkEventResponse: EpSdkEventResponse = {
      data: {
        ...eventResponse.data,
        brokerType: requestBody.brokerType
      },
      meta: eventResponse.meta
    }
    return epSdkEventResponse;
  }

  public updateEvent = async({ xContextId, eventId, requestBody }:{
    xContextId?: string;
    eventId: string;
    requestBody: EpSdkEventUpdate;
  }): Promise<EpSdkEventResponse> => {
    const funcName = 'updateEvent';
    const logName = `${EpSdkEpEventsServiceClass.name}.${funcName}()`;
    const eventResponse: EventResponse = await EventsService.updateEvent({
      xContextId,
      id: eventId,
      requestBody: {
        ...requestBody
      },
    });
    if(eventResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventResponse.data === undefined', {
      eventResponse: eventResponse,
    });
    const epSdkEventResponse: EpSdkEventResponse = {
      data: {
        ...eventResponse.data,
      },
      meta: eventResponse.meta
    }
    return epSdkEventResponse;
  }


}

/** @category Services */
export default new EpSdkEpEventsServiceClass();

