import {
  EventsService, 
  EventVersion, 
  EventVersionsResponse,
  Event as EpEvent,
  EventVersionResponse,
  SchemaVersion,
  Address,
  AddressLevel,
  TopicAddressEnumVersion,
  EventsResponse,
  Pagination,
  EventResponse,
  StateChangeRequestResponse,
  CustomAttributeDefinition
} from '@solace-labs/ep-openapi-node';
import { 
  EpSdkApiContentError, 
  EpSdkFeatureNotSupportedError,
  EpSdkUtils
} from "../utils";
import { 
  EpSdkPagination 
} from "../types";
import { 
  EpApiMaxPageSize, EpSdkCustomAttributeNameSourceApplicationDomainId 
} from '../constants';
import { 
  EpSdkEpEventTask, 
  IEpSdkEpEventTask_ExecuteReturn,
  EEpSdkTask_Action, 
  EEpSdkTask_TargetState,
  EpSdkEpEventVersionTask, 
  IEpSdkEpEventVersionTask_ExecuteReturn,
  EEpSdk_VersionTaskStrategy,
} from "../tasks";
import EpSdkEpEventsService from "./EpSdkEpEventsService";
import { EpSdkVersionServiceClass } from "./EpSdkVersionService";
import EpSdkSchemaVersionsService from "./EpSdkSchemaVersionsService";
import EpSdkEnumVersionsService from "./EpSdkEnumVersionsService";

/** @category Services */
export type EpSdkEpEvent = Required<Pick<EpEvent, "applicationDomainId" | "id" | "name">> & Omit<EpEvent, "applicationDomainId" | "id" | "name">;
/** @category Services */
export type EpSdkEpEventVersion = Required<Pick<EventVersion, "id" | "eventId" | "version" | "stateId">> & Omit<EventVersion, "id" | "eventId" | "version" | "stateId">;
/** @category Services */
export type EpSdkEpEventVersionList = Array<EpSdkEpEventVersion>;
/** @category Services */
export type EpSdkEpEventAndVersion = {
  event: EpSdkEpEvent;
  eventVersion: EpSdkEpEventVersion;
}
/** @category Services */
export type EpSdkEpEventAndVersionList = Array<EpSdkEpEventAndVersion>;
/** @category Services */
export type EpSdkEpEventAndVersionListResponse = {
  data: EpSdkEpEventAndVersionList;
  meta: {
    pagination: EpSdkPagination;
  }
}
/** @category Services */
export type EpSdkEpEventAndVersionResponse = EpSdkEpEventAndVersion & {
  meta: {
    versionStringList: Array<string>;
  }
}

/** @category Services */
export class EpSdkEpEventVersionsServiceClass extends EpSdkVersionServiceClass {

  public getObjectAndVersionForEventId = async({ xContextId,eventId, stateIds, versionString }:{
    xContextId?: string;
    eventId: string;
    stateIds?: Array<string>;
    versionString?: string;
  }): Promise<EpSdkEpEventAndVersionResponse | undefined> => {
    const funcName = 'getObjectAndVersionForEventId';
    const logName = `${EpSdkEpEventVersionsServiceClass.name}.${funcName}()`;

    // get event 
    let eventResponse: EventResponse;
    try {
      eventResponse = await EventsService.getEvent({ xContextId, id: eventId });
    } catch(e) {
      return undefined;
    }
    // get all versions for selected stateId
    const eventVersionList: Array<EventVersion> = await this.getVersionsForEventId({
      xContextId,
      eventId: eventId,
      stateIds: stateIds,
    });

    let eventVersion: EventVersion | undefined = undefined;
    if(versionString === undefined) {
      // extract the latest version
      eventVersion = this.getLatestEpObjectVersionFromList({ epObjectVersionList: eventVersionList });
    } else {
      // extract the version
      eventVersion = this.getEpObjectVersionFromList({ 
        epObjectVersionList: eventVersionList,
        versionString: versionString,
      });
    }
    if(eventVersion === undefined) return undefined;
    // create a list of all versions
    const versionStringList: Array<string> = eventVersionList.map( (eventVersion: EventVersion) => {
      /* istanbul ignore next */
      if(eventVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'eventVersion.version === undefined', {
        eventVersion: eventVersion
      });
      return eventVersion.version;
    });
    /* istanbul ignore next */
    if(eventResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'eventResponse.data === undefined', {
      eventResponse: eventResponse
    });
    return {
      event: eventResponse.data as EpSdkEpEvent,
      eventVersion: eventVersion as EpSdkEpEventVersion,
      meta: {
        versionStringList: versionStringList
      }
    }
  }

  public getVersionByVersion = async ({ xContextId, eventId, eventVersionString }: {
    xContextId?: string;
    eventId: string;
    eventVersionString: string;
  }): Promise<EventVersion | undefined> => {
    const funcName = 'getVersionByVersion';
    const logName = `${EpSdkEpEventVersionsServiceClass.name}.${funcName}()`;

    const eventVersionList: Array<EventVersion> = await this.getVersionsForEventId({ xContextId, eventId: eventId });
    const found: EventVersion | undefined = eventVersionList.find( (eventVersion: EventVersion ) => {
      /* istanbul ignore next */
      if(eventVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventVersion.version === undefined', {
        eventVersion: eventVersion
      });
      return eventVersion.version === eventVersionString;
    });
    return found;
  }

  public getVersionsForEventId = async ({ xContextId, eventId, stateIds, pageSize = EpApiMaxPageSize }: {
    xContextId?: string;
    eventId: string;
    stateIds?: Array<string>;
    pageSize?: number; /** for testing */
  }): Promise<Array<EventVersion>> => {
    const funcName = 'getVersionsForEventId';
    const logName = `${EpSdkEpEventVersionsServiceClass.name}.${funcName}()`;

    const eventVersionList: Array<EventVersion> = [];
    let nextPage: number | undefined | null = 1;

    while(nextPage !== undefined && nextPage !== null) {
      const eventVersionsResponse: EventVersionsResponse = await EventsService.getEventVersions({
        xContextId,
        eventIds: [eventId],
        pageNumber: nextPage,
        pageSize: pageSize,
      });      
      if(eventVersionsResponse.data === undefined || eventVersionsResponse.data.length === 0) nextPage = null;
      else {
        // filter for stateId
        if(stateIds && stateIds.length > 0) {
          const filteredList = eventVersionsResponse.data.filter( (eventVersion: EventVersion) => {
            /* istanbul ignore next */
            if(eventVersion.stateId === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'eventVersion.stateId === undefined', {
              eventVersion: eventVersion
            });
            if(!stateIds.includes(eventVersion.stateId)) return false;
            return true;
          });
          eventVersionList.push(...filteredList);
        } else {
          eventVersionList.push(...eventVersionsResponse.data);
        }
        /* istanbul ignore next */
        if(eventVersionsResponse.meta === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'eventVersionsResponse.meta === undefined', {
          eventVersionsResponse: eventVersionsResponse
        });
        /* istanbul ignore next */
        if(eventVersionsResponse.meta.pagination === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'eventVersionsResponse.meta.pagination === undefined', {
          eventVersionsResponse: eventVersionsResponse
        });
        const pagination: Pagination = eventVersionsResponse.meta.pagination;
        nextPage = pagination.nextPage;  
      }
    }
    return eventVersionList;
  }

  public getVersionsForEventName = async ({ xContextId, eventName, applicationDomainId }: {
    xContextId?: string;
    applicationDomainId: string;
    eventName: string;
  }): Promise<Array<EventVersion>> => {
    const funcName = 'getVersionsForEventName';
    const logName = `${EpSdkEpEventVersionsServiceClass.name}.${funcName}()`;

    const epEvent: EpEvent | undefined = await EpSdkEpEventsService.getByName({
      xContextId,
      applicationDomainId: applicationDomainId,
      eventName: eventName,
    });

    if (epEvent === undefined) return [];
    /* istanbul ignore next */
    if (epEvent.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epEvent.id === undefined', {
      epEvent: epEvent
    });
    const eventVersionList: Array<EventVersion> = await this.getVersionsForEventId({ xContextId, eventId: epEvent.id });
    return eventVersionList;
  }

  public getLatestVersionString = async ({ xContextId, eventId }: {
    xContextId?: string;
    eventId: string;
  }): Promise<string | undefined> => {
    const funcName = 'getLatestVersionString';
    const logName = `${EpSdkEpEventVersionsServiceClass.name}.${funcName}()`;

    const eventVersionList: Array<EventVersion> = await this.getVersionsForEventId({ xContextId, eventId: eventId });
    // CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.SERVICE, details: {
    //   enumVersionList: enumVersionList
    // }}));
    const latestEventVersion: EventVersion | undefined = this.getLatestEpObjectVersionFromList({ epObjectVersionList: eventVersionList });
    if(latestEventVersion === undefined) return undefined;
    /* istanbul ignore next */
    if(latestEventVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'latestEventVersion.version === undefined', {
      latestEventVersion: latestEventVersion
    });
    return latestEventVersion.version;
  }

  public getLatestVersionForEventId = async ({ xContextId, eventId, applicationDomainId, stateIds }: {
    xContextId?: string;
    applicationDomainId?: string;
    eventId: string;
    stateIds?: Array<string>;
  }): Promise<EventVersion | undefined> => {
    applicationDomainId;
    const eventVersionList: Array<EventVersion> = await this.getVersionsForEventId({
      xContextId,
      eventId: eventId,
      stateIds: stateIds,
    });
    const latestEventVersion: EventVersion | undefined = this.getLatestEpObjectVersionFromList({ epObjectVersionList: eventVersionList });
    return latestEventVersion;
  }

  public getLatestVersionForEventName = async ({ xContextId, applicationDomainId, eventName }: {
    xContextId?: string;
    applicationDomainId: string;
    eventName: string;
  }): Promise<EventVersion | undefined> => {
    const eventVersionList: Array<EventVersion> = await this.getVersionsForEventName({
      xContextId,
      eventName: eventName,
      applicationDomainId: applicationDomainId
    });
    const latestEventVersion: EventVersion | undefined = this.getLatestEpObjectVersionFromList({ epObjectVersionList: eventVersionList });
    return latestEventVersion;
  }

  public createEventVersion = async({ xContextId, applicationDomainId, eventId, eventVersion, targetLifecycleStateId }:{
    xContextId?: string;
    applicationDomainId: string;
    eventId: string;
    eventVersion: EventVersion;
    targetLifecycleStateId: string;
  }): Promise<EventVersion> => {
    const funcName = 'createEventVersion';
    const logName = `${EpSdkEpEventVersionsServiceClass.name}.${funcName}()`;

    applicationDomainId;
    const eventVersionResponse: EventVersionResponse = await EventsService.createEventVersion({
      xContextId,
      requestBody: {
        ...eventVersion,
        eventId: eventId
      }
    });
    /* istanbul ignore next */
    if(eventVersionResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventVersionResponse.data === undefined', {
      eventVersionResponse: eventVersionResponse
    });
    const createdEventVersion: EventVersion = eventVersionResponse.data;
    /* istanbul ignore next */
    if(createdEventVersion.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventVersionResponse.data.id === undefined', {
      eventVersionResponse: eventVersionResponse
    });
    /* istanbul ignore next */
    if(createdEventVersion.stateId === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventVersionResponse.data.stateId === undefined', {
      eventVersionResponse: eventVersionResponse
    });
    /* istanbul ignore next */
    if(createdEventVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventVersionResponse.data.version === undefined', {
      eventVersionResponse: eventVersionResponse
    });
    if(createdEventVersion.stateId !== targetLifecycleStateId) {
      const stateChangeRequestResponse: StateChangeRequestResponse = await EventsService.updateEventVersionState({
        xContextId,
        id: createdEventVersion.id,
        requestBody: {
          ...createdEventVersion,
          stateId: targetLifecycleStateId
        }
      });
      stateChangeRequestResponse;
      const updatedEventVersion: EventVersion | undefined = await this.getVersionByVersion({
        xContextId,
        eventId: eventId,
        eventVersionString: createdEventVersion.version
      });
      /* istanbul ignore next */
      if(updatedEventVersion === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'updatedEventVersion === undefined', {
        updatedEventVersion: updatedEventVersion
      });
      return updatedEventVersion;
    }
    return createdEventVersion;
  }

  public createTopicStringFromAddress = ({ address }: {
    address: Address;
  }): string => {
    const funcName = 'createTopicStringFromAddress';
    const logName = `${EpSdkEpEventVersionsServiceClass.name}.${funcName}()`;
    if(address.addressType !== Address.addressType.TOPIC) throw new EpSdkFeatureNotSupportedError(logName, this.constructor.name, `only addressType=${Address.addressType.TOPIC} supported`, {
      address: address
    });
    let topicString = '';
    for(const addressLevel of address.addressLevels) {
      if(topicString.length > 0) topicString += '/';
      switch(addressLevel.addressLevelType) {
        case AddressLevel.addressLevelType.LITERAL:
          topicString += addressLevel.name;
          break;
        case AddressLevel.addressLevelType.VARIABLE:
          topicString += `{${addressLevel.name}}`;
          break;
        default:
          /* istanbul ignore next */
          EpSdkUtils.assertNever(logName, addressLevel.addressLevelType);
      }
    }
    return topicString;
  }

  public deepCopyAddress = async({ xContextId, address, fromApplicationDomainId, toApplicationDomainId }: {
    xContextId?: string;
    address: Address;
    fromApplicationDomainId: string;
    toApplicationDomainId: string;
  }): Promise<Address> => {
    const funcName = 'deepCopyAddress';
    const logName = `${EpSdkEpEventVersionsServiceClass.name}.${funcName}()`;

    if(address.addressType !== Address.addressType.TOPIC) throw new EpSdkFeatureNotSupportedError(logName, this.constructor.name, `only addressType=${Address.addressType.TOPIC} supported`, {
      address: address
    });
    const fromAddressLevels: Array<AddressLevel> = address.addressLevels;
    const targetAddressLevels: Array<AddressLevel> = [];
    for(const fromAddressLevel of fromAddressLevels) {
      if(fromAddressLevel.addressLevelType === AddressLevel.addressLevelType.VARIABLE && fromAddressLevel.enumVersionId !== undefined) {
        const targetEnumVersion: TopicAddressEnumVersion = await EpSdkEnumVersionsService.copyLastestVersionById_IfNotExists({
          xContextId,
          enumVersionId: fromAddressLevel.enumVersionId,
          fromApplicationDomainId: fromApplicationDomainId,
          toApplicationDomainId: toApplicationDomainId,
        });
        const targetAddressLevel: AddressLevel = {
          addressLevelType: AddressLevel.addressLevelType.VARIABLE,
          name: fromAddressLevel.name,
          enumVersionId: targetEnumVersion.id
        };
        targetAddressLevels.push(targetAddressLevel);
      } else {
        targetAddressLevels.push(fromAddressLevel);
      }
    }
    const targetAddress: Address = {
      addressLevels: targetAddressLevels,
      addressType: address.addressType,
    };
    return targetAddress;
  }

  /**
   * Conditional deep copy of event version from 'fromApplicationDomain' to 'toApplicationDomain'. 
   * - copies all schemas and enums first
   * 
   * If an event version with the id already exists, returns that version. It still copies all schemas / enums.
   * 
   * @returns existing or created event version
   */
  public deepCopyLastestVersionById_IfNotExists = async({ xContextId, eventVersionId, fromApplicationDomainId, toApplicationDomainId }: {
    xContextId?: string;
    eventVersionId: string;
    fromApplicationDomainId: string;
    toApplicationDomainId: string;
  }): Promise<EventVersion> => {
    const funcName = 'deepCopyLastestVersionById_IfNotExists';
    const logName = `${EpSdkEpEventVersionsServiceClass.name}.${funcName}()`;

    // get the source event version
    const fromEventVersionResponse: EventVersionResponse = await EventsService.getEventVersion({ 
      xContextId,
      id: eventVersionId
    });
    /* istanbul ignore next */
    if(fromEventVersionResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "fromEventVersionResponse.data === undefined", {
      fromEventVersionResponse: fromEventVersionResponse
    });
    const fromEventVersion: EventVersion = fromEventVersionResponse.data;
    /* istanbul ignore next */
    if(fromEventVersion.stateId === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "fromEventVersion.stateId === undefined", {
      fromEventVersion: fromEventVersion
    });
    /* istanbul ignore next */
    if(fromEventVersion.schemaVersionId === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "fromEventVersion.schemaVersionId === undefined", {
      fromEventVersion: fromEventVersion
    });
    // get the source event object
    const fromEvent: EpEvent = await EpSdkEpEventsService.getById({
      xContextId,
      eventId: fromEventVersion.eventId,
    });

    // copy the schema version
    const targetSchemaVersion: SchemaVersion = await EpSdkSchemaVersionsService.copyLastestVersionById_IfNotExists({
      xContextId,
      schemaVersionId: fromEventVersion.schemaVersionId,
      fromApplicationDomainId: fromApplicationDomainId,
      toApplicationDomainId: toApplicationDomainId,
    });
    /* istanbul ignore next */
    if(targetSchemaVersion.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "targetSchemaVersion.id === undefined", {
      targetSchemaVersion: targetSchemaVersion
    });

    // copy all enums in address
    /* istanbul ignore next */
    if(fromEventVersion.deliveryDescriptor === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "fromEventVersion.deliveryDescriptor === undefined", {
      fromEventVersion: fromEventVersion
    });
    /* istanbul ignore next */
    if(fromEventVersion.deliveryDescriptor.address === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "fromEventVersion.deliveryDescriptor.address === undefined", {
      fromEventVersion: fromEventVersion
    });
    const fromEventVersionDeliveryDescriptorAddress: Address = fromEventVersion.deliveryDescriptor.address;
    const targetEventVersionDeliveryDescriptorAddress: Address = await this.deepCopyAddress({
      xContextId,
      address: fromEventVersionDeliveryDescriptorAddress,
      fromApplicationDomainId: fromApplicationDomainId,
      toApplicationDomainId: toApplicationDomainId,
    });

    // ensure target event exists
    const epSdkEpEventTask = new EpSdkEpEventTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: toApplicationDomainId,
      eventName: fromEvent.name,
      eventObjectSettings: {
        shared: fromEvent.shared ? fromEvent.shared : true,
      },
    });
    const epSdkEpEventTask_ExecuteReturn: IEpSdkEpEventTask_ExecuteReturn = await epSdkEpEventTask.execute(xContextId);
    if(epSdkEpEventTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action === EEpSdkTask_Action.NO_ACTION) {
      // return the latest version
      const targetEventVersion: EventVersion | undefined = await this.getLatestVersionForEventId({
        xContextId,
        applicationDomainId: toApplicationDomainId,
        eventId: epSdkEpEventTask_ExecuteReturn.epObjectKeys.epObjectId,
      });
      if(targetEventVersion !== undefined) return targetEventVersion;
    }
    // add the source application domain id to custom attribute
    await EpSdkEpEventsService.setCustomAttributes({
      xContextId: xContextId,
      applicationDomainId: toApplicationDomainId,
      eventId: epSdkEpEventTask_ExecuteReturn.epObjectKeys.epObjectId,
      scope: CustomAttributeDefinition.scope.APPLICATION_DOMAIN,
      epSdkCustomAttributeList: [ 
        { name: EpSdkCustomAttributeNameSourceApplicationDomainId, value: fromApplicationDomainId }
      ]
    });        
    // create target event version
    const epSdkEpEventVersionTask = new EpSdkEpEventVersionTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: toApplicationDomainId,
      eventId: epSdkEpEventTask_ExecuteReturn.epObjectKeys.epObjectId,
      versionString: fromEventVersion.version,
      versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
      topicString: this.createTopicStringFromAddress({ address: targetEventVersionDeliveryDescriptorAddress }),
      eventVersionSettings: {
        stateId: fromEventVersion.stateId,
        displayName: fromEventVersion.displayName ? fromEventVersion.displayName : '',
        description: fromEventVersion.description ? fromEventVersion.description : '',
        schemaVersionId: targetSchemaVersion.id,
      },
    });
    const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn = await epSdkEpEventVersionTask.execute(xContextId);
    // must get the object again, otherwise not all properties are set correctly
    /* istanbul ignore next */
    if(epSdkEpEventVersionTask_ExecuteReturn.epObject.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epSdkEpEventVersionTask_ExecuteReturn.epObject.id === undefined', {
      epSdkEpEventVersionTask_ExecuteReturn: epSdkEpEventVersionTask_ExecuteReturn
    });
    const eventVersionResponse: EventVersionResponse =  await EventsService.getEventVersion({
      xContextId,
      id: epSdkEpEventVersionTask_ExecuteReturn.epObject.id
    });
    /* istanbul ignore next */
    if(eventVersionResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventVersionResponse.data === undefined', {
      eventVersionResponse: eventVersionResponse
    });
    return eventVersionResponse.data;
  }

  public listLatestVersions = async({ xContextId, applicationDomainIds, shared, stateIds, pageNumber = 1, pageSize = 20, sortFieldName }:{
    xContextId?: string;
    applicationDomainIds?: Array<string>;
    shared: boolean;
    stateIds?: Array<string>;
    pageNumber?: number;
    pageSize?: number;
    sortFieldName?: string;
  }): Promise<EpSdkEpEventAndVersionListResponse> => {
    const funcName = 'listLatestVersions';
    const logName = `${EpSdkEpEventVersionsServiceClass.name}.${funcName}()`;

    // get all events:
    // - we may have events without a version in the state requested
    const eventsResponse: EventsResponse = await EpSdkEpEventsService.listAll({
      xContextId,
      applicationDomainIds: applicationDomainIds,
      shared: shared,
      sortFieldName: sortFieldName
    });
    const eventList: Array<EpEvent> = eventsResponse.data ? eventsResponse.data : [];

    // create the complete list
    const complete_EpSdkEpEventAndVersionList: EpSdkEpEventAndVersionList = [];
    for(const epEvent of eventList) {
      /* istanbul ignore next */
      if(epEvent.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epEvent.id === undefined', {
        epEvent: epEvent
      });
      // get the latest version in the requested state
      const latest_EventVersion: EventVersion | undefined = await this.getLatestVersionForEventId({
        xContextId,
        eventId: epEvent.id,
        stateIds: stateIds
      });      
      if(latest_EventVersion !== undefined) complete_EpSdkEpEventAndVersionList.push({
        event: epEvent as EpSdkEpEvent,
        eventVersion: latest_EventVersion as EpSdkEpEventVersion
      });
    }
    // extract the page
    const startIdx = (pageSize * (pageNumber-1));
    const endIdx = (startIdx + pageSize);
    const epSdkEpEventAndVersionList: EpSdkEpEventAndVersionList = complete_EpSdkEpEventAndVersionList.slice(startIdx, endIdx);
    const nextPage: number | undefined = endIdx < complete_EpSdkEpEventAndVersionList.length ? (pageNumber + 1) : undefined;

    return {
      data: epSdkEpEventAndVersionList,
      meta: {
        pagination: {
          count: complete_EpSdkEpEventAndVersionList.length,
          pageNumber: pageNumber,
          nextPage: nextPage
        }
      } 
    };
  }

}

/** @category Services */
export default new EpSdkEpEventVersionsServiceClass();

