import { Validator, ValidatorResult } from 'jsonschema';
import {
  $EventApiVersion, 
  EventApIsService,
  EventApiVersionsResponse,
  EventApi,
  EventApiVersionResponse,
  EventApiVersion,
  EventVersion,
  StateChangeRequestResponse,
  EventApiResponse,
  Pagination,
} from '@rjgu/ep-openapi-node';
import { 
  EpSdkApiContentError, 
  EpSdkValidationError 
} from "../utils";
import { 
  EpApiMaxPageSize 
} from '../constants';
import { 
  EEpSdkObjectTypes 
} from '../types';
import { 
  EpSdkEventApiTask, 
  IEpSdkEventApiTask_ExecuteReturn,
  EEpSdkTask_TargetState,
  EpSdkEventApiVersionTask,
  IEpSdkEventApiVersionTask_ExecuteReturn,
  EEpSdk_VersionTaskStrategy
} from '../tasks';
import { EpSdkVersionServiceClass } from "./EpSdkVersionService";
import EpSdkEventApisService from './EpSdkEventApisService';
import EpSdkEpEventVersionsService from './EpSdkEpEventVersionsService';


/** @category Services */
export type EpSdkEventApi = Required<Pick<EventApi, "applicationDomainId" | "id" | "name">> & Omit<EventApi, "applicationDomainId" | "id" | "name">;
/** @category Services */
export type EpSdkEventApiVersion = Required<Pick<EventApiVersion, "id" | "eventApiId" | "version" | "stateId">> & Omit<EventApiVersion, "id" | "eventApiId" | "version" | "stateId">;
/** @category Services */
export type EpSdkEventApiAndVersion = {
  eventApi: EpSdkEventApi;
  eventApiVersion: EpSdkEventApiVersion;
}

/** @category Services */
export class EpSdkEventApiVersionsServiceClass extends EpSdkVersionServiceClass {

  /**
   * Retrieves Event API & Version object for a list of version ids.
   */
  public getObjectAndVersionListForEventApiVersionIds = async ({ eventApiVersionIds }: {
    eventApiVersionIds?: Array<string>;
  }): Promise<Array<EpSdkEventApiAndVersion>> => {
    const funcName = 'getObjectAndVersionListForEventApiVersionIds';
    const logName = `${EpSdkEventApiVersionsServiceClass.name}.${funcName}()`;

    if(eventApiVersionIds === undefined) return [];

    const epSdkEventApiAndVersionList: Array<EpSdkEventApiAndVersion> = [];

    for(const eventApiVersionId of eventApiVersionIds) {
      // get the version
      const eventApiVersionResponse: EventApiVersionResponse = await EventApIsService.getEventApiVersion({
        versionId: eventApiVersionId,
        include: EEpSdkObjectTypes.EVENT_API
      });
      /* istanbul ignore next */      
      if(eventApiVersionResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'eventApiVersionResponse.data === undefined', {
        eventApiVersionResponse: eventApiVersionResponse
      });
      // get the object
      const eventApiResponse: EventApiResponse = await EventApIsService.getEventApi({ id: eventApiVersionResponse.data.eventApiId });
      /* istanbul ignore next */
      if(eventApiResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'eventApiResponse.data === undefined', {
        eventApiResponse: eventApiResponse
      });
      const epSdkEventApiAndVersion: EpSdkEventApiAndVersion = {
        eventApi: eventApiResponse.data as EpSdkEventApi,
        eventApiVersion: eventApiVersionResponse.data as EpSdkEventApiVersion,
      }
      epSdkEventApiAndVersionList.push(epSdkEventApiAndVersion);
    }
    return epSdkEventApiAndVersionList;
  }

  public validateDisplayName = ({ displayName }: {
    displayName: string;
  }): string => {
    const funcName = 'validateDisplayName';
    const logName = `${EpSdkEventApiVersionsServiceClass.name}.${funcName}()`;
    const schema = $EventApiVersion.properties.displayName;

    const v: Validator = new Validator();
    const validateResult: ValidatorResult = v.validate(displayName, schema);
    if(!validateResult.valid) throw new EpSdkValidationError(logName, this.constructor.name, undefined, validateResult.errors, {
      displayName: displayName
    });
    return displayName;
  }

  public getVersionByVersion = async ({ eventApiId, eventApiVersionString }: {
    eventApiId: string;
    eventApiVersionString: string;
  }): Promise<EventApiVersion | undefined> => {
    const funcName = 'getVersionByVersion';
    const logName = `${EpSdkEventApiVersionsServiceClass.name}.${funcName}()`;

    const eventApiVersionList: Array<EventApiVersion> = await this.getVersionsForEventApiId({ eventApiId: eventApiId });
    return eventApiVersionList.find( (eventApiVersion: EventApiVersion ) => {
      /* istanbul ignore next */
      if(eventApiVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventApiVersion.version === undefined', {
        eventApiVersion: eventApiVersion
      });
      return eventApiVersion.version === eventApiVersionString;
    });
  }

  public getVersionsForEventApiId = async ({ eventApiId, pageSize = EpApiMaxPageSize }: {
    eventApiId: string;
    pageSize?: number; /** for testing */
  }): Promise<Array<EventApiVersion>> => {
    const funcName = 'getVersionsForEventApiId';
    const logName = `${EpSdkEventApiVersionsServiceClass.name}.${funcName}()`;

    const eventApiVersionList: Array<EventApiVersion> = [];
    let nextPage: number | undefined | null = 1;

    while(nextPage !== undefined && nextPage !== null) {
      const eventApiVersionsResponse: EventApiVersionsResponse = await EventApIsService.getEventApiVersions({
        eventApiIds: [eventApiId],
        pageNumber: nextPage,
        pageSize: pageSize
      });
      if(eventApiVersionsResponse.data === undefined || eventApiVersionsResponse.data.length === 0) nextPage = null;
      else {
        eventApiVersionList.push(...eventApiVersionsResponse.data);
      }
      /* istanbul ignore next */
      if(eventApiVersionsResponse.meta === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'eventApiVersionsResponse.meta === undefined', {
        eventApiVersionsResponse: eventApiVersionsResponse
      });
      /* istanbul ignore next */
      if(eventApiVersionsResponse.meta.pagination === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'eventApiVersionsResponse.meta.pagination === undefined', {
        eventApiVersionsResponse: eventApiVersionsResponse
      });
      const pagination: Pagination = eventApiVersionsResponse.meta.pagination;
      nextPage = pagination.nextPage;  
    }
    return eventApiVersionList;
  }

  public getVersionsForEventApiName = async ({ eventApiName, applicationDomainId }: {
    applicationDomainId: string;
    eventApiName: string;
  }): Promise<Array<EventApiVersion>> => {
    const funcName = 'getVersionsForEventName';
    const logName = `${EpSdkEventApiVersionsServiceClass.name}.${funcName}()`;

    const eventApi: EventApi | undefined = await EpSdkEventApisService.getByName({
      applicationDomainId: applicationDomainId,
      eventApiName: eventApiName,
    });

    if (eventApi === undefined) return [];
    /* istanbul ignore next */
    if (eventApi.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventApi.id === undefined', {
      eventApi: eventApi
    });
    const eventApiVersionList: Array<EventApiVersion> = await this.getVersionsForEventApiId({ eventApiId: eventApi.id });
    return eventApiVersionList;
  }

  public getLatestVersionString = async ({ eventApiId }: {
    eventApiId: string;
  }): Promise<string | undefined> => {
    const funcName = 'getLatestVersionString';
    const logName = `${EpSdkEventApiVersionsServiceClass.name}.${funcName}()`;

    const eventApiVersionList: Array<EventApiVersion> = await this.getVersionsForEventApiId({ eventApiId: eventApiId });
    // CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.SERVICE, details: {
    //   enumVersionList: enumVersionList
    // }}));
    const latestEventVersion: EventApiVersion | undefined = this.getLatestEpObjectVersionFromList({ epObjectVersionList: eventApiVersionList });
    if(latestEventVersion === undefined) return undefined;
    /* istanbul ignore next */
    if(latestEventVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'latestEventVersion.version === undefined', {
      latestEventVersion: latestEventVersion
    });
    return latestEventVersion.version;
  }

  public getLatestVersionForEventApiId = async ({ eventApiId, applicationDomainId }: {
    applicationDomainId: string;
    eventApiId: string;
  }): Promise<EventApiVersion | undefined> => {
    applicationDomainId;
    const eventApiVersionList: Array<EventApiVersion> = await this.getVersionsForEventApiId({
      eventApiId: eventApiId,
    });
    const latestEventVersion: EventApiVersion | undefined = this.getLatestEpObjectVersionFromList({ epObjectVersionList: eventApiVersionList });
    return latestEventVersion;
  }

  public getLatestVersionForEventApiName = async ({ applicationDomainId, eventApiName }: {
    applicationDomainId: string;
    eventApiName: string;
  }): Promise<EventApiVersion | undefined> => {
    const eventApiVersionList: Array<EventApiVersion> = await this.getVersionsForEventApiName({
      eventApiName: eventApiName,
      applicationDomainId: applicationDomainId
    });
    const latestEventApiVersion: EventApiVersion | undefined = this.getLatestEpObjectVersionFromList({ epObjectVersionList: eventApiVersionList });
    return latestEventApiVersion;
  }

  public createEventApiVersion = async({ applicationDomainId, eventApiId, eventApiVersion, targetLifecycleStateId }:{
    applicationDomainId: string;
    eventApiId: string;
    eventApiVersion: EventApiVersion;
    targetLifecycleStateId: string;
  }): Promise<EventApiVersion> => {
    const funcName = 'createEventApiVersion';
    const logName = `${EpSdkEventApiVersionsServiceClass.name}.${funcName}()`;

    applicationDomainId;

    if(eventApiVersion.displayName) this.validateDisplayName({ displayName: eventApiVersion.displayName });

    const eventApiVersionResponse: EventApiVersionResponse = await EventApIsService.createEventApiVersion({
      requestBody: {
        ...eventApiVersion,
        eventApiId: eventApiId
      }
    });
    /* istanbul ignore next */
    if(eventApiVersionResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventApiVersionResponse.data === undefined', {
      eventApiVersionResponse: eventApiVersionResponse
    });
    const createdEvenApiVersion: EventApiVersion = eventApiVersionResponse.data;
    /* istanbul ignore next */
    if(createdEvenApiVersion.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventApiVersionResponse.data.id === undefined', {
      eventApiVersionResponse: eventApiVersionResponse
    });
    /* istanbul ignore next */
    if(createdEvenApiVersion.stateId === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventApiVersionResponse.data.stateId === undefined', {
      eventApiVersionResponse: eventApiVersionResponse
    });
    /* istanbul ignore next */
    if(createdEvenApiVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventApiVersionResponse.data.version === undefined', {
      eventApiVersionResponse: eventApiVersionResponse
    });
    if(createdEvenApiVersion.stateId !== targetLifecycleStateId) {
      const stateChangeRequestResponse: StateChangeRequestResponse = await EventApIsService.updateEventApiVersionState({
        versionId: createdEvenApiVersion.id,
        requestBody: {
          eventApiId: eventApiId,
          stateId: targetLifecycleStateId
        }
      });
      stateChangeRequestResponse;
      const updatedEventApiVersion: EventApiVersion | undefined = await this.getVersionByVersion({
        eventApiId: eventApiId,
        eventApiVersionString: createdEvenApiVersion.version
      });
      /* istanbul ignore next */
      if(updatedEventApiVersion === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'updatedEventApiVersion === undefined', {
        updatedEventApiVersion: updatedEventApiVersion
      });
      return updatedEventApiVersion;
    }
    return createdEvenApiVersion;
  }

  /**
   * Conditional deep copy of event api & event api latest version from 'fromApplicationDomain' to 'toApplicationDomain'. 
   * - copies all referenced events, schemas, enums first from 'fromAssetApplicationDomainId' to 'toAssetApplicationDomainId'
   * - sets 'fromAssetApplicationDomainId' and 'toAssetApplicationDomainId' to 'fromApplicationDomainId' and 'toApplicationDomainId' respectively if not defined.
   * 
   * If an event api version for the event api with 'eventApiName' already exists, returns undefined. 
   * 
   * @returns undefined or created event api version
   */
  public deepCopyLastestVersionById_IfNotExists = async({ eventApiName, fromApplicationDomainId, toApplicationDomainId, fromAssetsApplicationDomainId, toAssetsApplicationDomainId }:{
    eventApiName: string; 
    fromApplicationDomainId: string;
    toApplicationDomainId: string;
    fromAssetsApplicationDomainId?: string;
    toAssetsApplicationDomainId?: string;
  }): Promise<EventApiVersion | undefined> => {
    const funcName = 'deepCopyLastestVersionById_IfNotExists';
    const logName = `${EpSdkEventApiVersionsServiceClass.name}.${funcName}()`;

    if(fromAssetsApplicationDomainId === undefined || toAssetsApplicationDomainId === undefined) {
      fromAssetsApplicationDomainId = fromApplicationDomainId;
      toAssetsApplicationDomainId = toApplicationDomainId;
    }
    // get the source event api by name
    const fromEventApi: EventApi | undefined = await EpSdkEventApisService.getByName({ 
      eventApiName: eventApiName,
      applicationDomainId: fromApplicationDomainId
    });
    if(fromEventApi === undefined) return undefined;
    /* istanbul ignore next */
    if(fromEventApi.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'fromEventApi.id === undefined', {
      fromEventApi: fromEventApi
    });
    /* istanbul ignore next */
    if(fromEventApi.name === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'fromEventApi.name === undefined', {
      fromEventApi: fromEventApi
    });
    // get the latest source event api version
    const fromEventApiVersion = await this.getLatestVersionForEventApiId({
      eventApiId: fromEventApi.id,
      applicationDomainId: fromApplicationDomainId,
    });
    if(fromEventApiVersion === undefined) return undefined;
    /* istanbul ignore next */
    if(fromEventApiVersion.stateId === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "fromEventApiVersion.stateId === undefined", {
      fromEventApiVersion: fromEventApiVersion
    });

    // check if a version already exists, if it does, return undefined
    const targetEventApiCheck: EventApi | undefined = await EpSdkEventApisService.getByName({
      applicationDomainId: toApplicationDomainId,
      eventApiName: eventApiName
    });
    if(targetEventApiCheck !== undefined) {
      /* istanbul ignore next */
      if(targetEventApiCheck.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "targetEventApiCheck.id === undefined", {
        targetEventApiCheck: targetEventApiCheck
      });
      const existingTargetVersion: EventApiVersion | undefined = await this.getLatestVersionForEventApiId({
        applicationDomainId: toApplicationDomainId,
        eventApiId: targetEventApiCheck.id
      });
      if(existingTargetVersion !== undefined) return undefined;
    }

    // get list of consumed & produced event versions
    const targetConsumedEventVersions: Array<EventVersion> = [];
    const targetProducedEventVersions: Array<EventVersion> = [];
    if(fromEventApiVersion.consumedEventVersionIds) {
      for(const eventVersionId of fromEventApiVersion.consumedEventVersionIds) {
        const eventVersion: EventVersion | undefined = await EpSdkEpEventVersionsService.deepCopyLastestVersionById_IfNotExists({ 
          eventVersionId: eventVersionId,
          fromApplicationDomainId: fromAssetsApplicationDomainId,
          toApplicationDomainId: toAssetsApplicationDomainId,
        });
        targetConsumedEventVersions.push(eventVersion);
      }
    }
    if(fromEventApiVersion.producedEventVersionIds) {
      for(const eventVersionId of fromEventApiVersion.producedEventVersionIds) {
        const eventVersion: EventVersion | undefined = await EpSdkEpEventVersionsService.deepCopyLastestVersionById_IfNotExists({ 
          eventVersionId: eventVersionId,
          fromApplicationDomainId: fromAssetsApplicationDomainId,
          toApplicationDomainId: toAssetsApplicationDomainId,
        });
        targetProducedEventVersions.push(eventVersion);
      }
    }
    // create the target event api & version
    // ensure target version object exists
    const epSdkEventApiTask = new EpSdkEventApiTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: toApplicationDomainId,
      eventApiName: fromEventApi.name,
      eventApiObjectSettings: {
        shared: fromEventApi.shared ? fromEventApi.shared : true,
      },
    });
    const epSdkEventApiTask_ExecuteReturn: IEpSdkEventApiTask_ExecuteReturn = await epSdkEventApiTask.execute();
    // note: not necessary, check has been done above
    // if(epSdkEventApiTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action === EEpSdkTask_Action.NO_ACTION) {
    //   // return the latest version
    //   const targetEventApiVersion: EventApiVersion | undefined = await this.getLatestVersionForEventApiId({
    //     applicationDomainId: toApplicationDomainId,
    //     eventApiId: epSdkEventApiTask_ExecuteReturn.epObjectKeys.epObjectId,
    //   });
    //   if(targetEventApiVersion !== undefined) return targetEventApiVersion;
    // }
    // create target event api version
    const epSdkEventApiVersionTask = new EpSdkEventApiVersionTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: toApplicationDomainId,
      eventApiId: epSdkEventApiTask_ExecuteReturn.epObjectKeys.epObjectId,
      versionString: fromEventApiVersion.version,
      versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
      eventApiVersionSettings: {
        stateId: fromEventApiVersion.stateId,
        displayName: fromEventApiVersion.displayName ? fromEventApiVersion.displayName : fromEventApi.name,
        description: fromEventApiVersion.description ? fromEventApiVersion.description : '',
        consumedEventVersionIds: targetConsumedEventVersions.map( (targetConsumedEventVersion: EventVersion) => {
          /* istanbul ignore next */
          if(targetConsumedEventVersion.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "targetConsumedEventVersion.id === undefined", {
            targetConsumedEventVersion: targetConsumedEventVersion
          });
          return targetConsumedEventVersion.id; 
        }),
        producedEventVersionIds: targetProducedEventVersions.map( (targetProducedEventVersion: EventVersion) => { 
          /* istanbul ignore next */
          if(targetProducedEventVersion.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "targetProducedEventVersion.id === undefined", {
            targetProducedEventVersion: targetProducedEventVersion
          });
          return targetProducedEventVersion.id; 
        }),
      },
    });
    const epSdkEventApiVersionTask_ExecuteReturn: IEpSdkEventApiVersionTask_ExecuteReturn = await epSdkEventApiVersionTask.execute();
    // must get the object again, otherwise not all properties are set correctly
    /* istanbul ignore next */
    if(epSdkEventApiVersionTask_ExecuteReturn.epObject.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epSdkEventApiVersionTask_ExecuteReturn.epObject.id === undefined', {
      epSdkEventApiVersionTask_ExecuteReturn: epSdkEventApiVersionTask_ExecuteReturn
    });
    const eventApiVersionResponse: EventApiVersionResponse =  await EventApIsService.getEventApiVersion({
      versionId: epSdkEventApiVersionTask_ExecuteReturn.epObject.id,
      include: ''
    });
    /* istanbul ignore next */
    if(eventApiVersionResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventApiVersionResponse.data === undefined', {
      eventApiVersionResponse: eventApiVersionResponse
    });
    return eventApiVersionResponse.data;
  }

}

/** @category Services */
export default new EpSdkEventApiVersionsServiceClass();

