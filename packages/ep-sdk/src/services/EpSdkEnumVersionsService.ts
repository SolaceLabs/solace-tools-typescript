import {
  EnumsService,
  Pagination,
  StateChangeRequestResponse,
  TopicAddressEnum,
  TopicAddressEnumVersion,
  TopicAddressEnumVersionResponse,
  TopicAddressEnumVersionsResponse,
} from '@solace-labs/ep-openapi-node';
import { 
  EpSdkApiContentError 
} from "../utils";
import { 
  EpApiMaxPageSize 
} from '../constants';
import { 
  EpSdkEnumTask, 
  IEpSdkEnumTask_ExecuteReturn,
  EEpSdkTask_Action, 
  EEpSdkTask_TargetState,
  EpSdkEnumVersionTask, 
  IEpSdkEnumVersionTask_ExecuteReturn,
  EEpSdk_VersionTaskStrategy
} from "../tasks";
import EpSdkEnumsService from "./EpSdkEnumsService";
import { EpSdkVersionServiceClass } from "./EpSdkVersionService";

/** @category Services */
export class EpSdkEnumVersionsServiceClass extends EpSdkVersionServiceClass {

  public getVersionByVersion = async ({ xContextId, enumId, enumVersionString }: {
    xContextId: string;
    enumId: string;
    enumVersionString: string;
  }): Promise<TopicAddressEnumVersion | undefined> => {
    const topicAddressEnumVersionList: Array<TopicAddressEnumVersion> = await this.getVersionsForEnumId({
      xContextId: xContextId,
      enumId: enumId,
    });
    return topicAddressEnumVersionList.find( (topicAddressEnumVersion: TopicAddressEnumVersion) => {
      return topicAddressEnumVersion.version === enumVersionString;
    });
  }

  public getVersionsForEnumId = async ({ xContextId, enumId, pageSize = EpApiMaxPageSize }: {
    xContextId: string;
    enumId: string;
    pageSize?: number; /** for testing */
  }): Promise<Array<TopicAddressEnumVersion>> => {
    const funcName = 'getVersionsForEnumId';
    const logName = `${EpSdkEnumVersionsServiceClass.name}.${funcName}()`;

    const topicAddressEnumVersionList: Array<TopicAddressEnumVersion> = [];
    let nextPage: number | undefined | null = 1;

    while(nextPage !== undefined && nextPage !== null) {

      const topicAddressEnumVersionsResponse: TopicAddressEnumVersionsResponse = await EnumsService.getEnumVersions({
        xContextId: xContextId,
        enumIds: [enumId],
        pageNumber: nextPage,
        pageSize: pageSize
      });
      if (topicAddressEnumVersionsResponse.data === undefined || topicAddressEnumVersionsResponse.data.length === 0) nextPage = null;
      else {
        topicAddressEnumVersionList.push(...topicAddressEnumVersionsResponse.data);
      }
      /* istanbul ignore next */
      if(topicAddressEnumVersionsResponse.meta === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'topicAddressEnumVersionsResponse.meta === undefined', {
        topicAddressEnumVersionsResponse: topicAddressEnumVersionsResponse
      });
      /* istanbul ignore next */
      if(topicAddressEnumVersionsResponse.meta.pagination === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'topicAddressEnumVersionsResponse.meta.pagination === undefined', {
        topicAddressEnumVersionsResponse: topicAddressEnumVersionsResponse
      });
      const pagination: Pagination = topicAddressEnumVersionsResponse.meta.pagination;
      nextPage = pagination.nextPage;  
    }
    // // DEBUG
    // throw new EpSdkApiContentError(logName, this.constructor.name, 'testing', {
    //   enumVersionList: enumVersionList
    // });
    return topicAddressEnumVersionList;
  }

  public getVersionsForEnumName = async ({ xContextId, enumName, applicationDomainId }: {
    xContextId: string;
    applicationDomainId: string;
    enumName: string;
  }): Promise<Array<TopicAddressEnumVersion>> => {
    const funcName = 'getVersionsForEnumName';
    const logName = `${EpSdkEnumVersionsServiceClass.name}.${funcName}()`;

    const topicAddressEnum: TopicAddressEnum | undefined = await EpSdkEnumsService.getByName({
      xContextId: xContextId,
      applicationDomainId: applicationDomainId,
      enumName: enumName
    });
    if (topicAddressEnum === undefined) return [];
    /* istanbul ignore next */
    if (topicAddressEnum.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'topicAddressEnum.id === undefined', {
      topicAddressEnum: topicAddressEnum
    });
    const topicAddressEnumVersionList: Array<TopicAddressEnumVersion> = await this.getVersionsForEnumId({ xContextId, enumId: topicAddressEnum.id });
    return topicAddressEnumVersionList;
  }

  public getLatestVersionString = async ({ xContextId, enumId }: {
    xContextId: string;
    enumId: string;
  }): Promise<string | undefined> => {
    const funcName = 'getLatestVersionString';
    const logName = `${EpSdkEnumVersionsServiceClass.name}.${funcName}()`;

    const topicAddressEnumVersionList: Array<TopicAddressEnumVersion> = await this.getVersionsForEnumId({ xContextId, enumId: enumId });
    // CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.SERVICE, details: {
    //   enumVersionList: enumVersionList
    // }}));
    const latestTopicAddressEnumVersion: TopicAddressEnumVersion | undefined = this.getLatestEpObjectVersionFromList({ epObjectVersionList: topicAddressEnumVersionList });
    if (latestTopicAddressEnumVersion === undefined) return undefined;
    /* istanbul ignore next */
    if (latestTopicAddressEnumVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'latestTopicAddressEnumVersion.version === undefined', {
      latestTopicAddressEnumVersion: latestTopicAddressEnumVersion
    });
    return latestTopicAddressEnumVersion.version;
  }

  public getLatestVersionForEnumId = async ({ xContextId, enumId, applicationDomainId }: {
    xContextId: string;
    applicationDomainId: string;
    enumId: string;
  }): Promise<TopicAddressEnumVersion | undefined> => {
    applicationDomainId;
    const topicAddressEnumVersionList: Array<TopicAddressEnumVersion> = await this.getVersionsForEnumId({
      xContextId: xContextId,
      enumId: enumId,
    });
    const latestTopicAddressEnumVersion: TopicAddressEnumVersion | undefined = this.getLatestEpObjectVersionFromList({ epObjectVersionList: topicAddressEnumVersionList });
    return latestTopicAddressEnumVersion;
  }

  public getLatestVersionForEnumName = async ({ xContextId, applicationDomainId, enumName }: {
    xContextId: string;
    applicationDomainId: string;
    enumName: string;
  }): Promise<TopicAddressEnumVersion | undefined> => {
    const topicAddressEnumVersionList: Array<TopicAddressEnumVersion> = await this.getVersionsForEnumName({
      xContextId: xContextId,
      enumName: enumName,
      applicationDomainId: applicationDomainId
    });
    const latestTopicAddressEnumVersion: TopicAddressEnumVersion | undefined = this.getLatestEpObjectVersionFromList({ epObjectVersionList: topicAddressEnumVersionList });
    return latestTopicAddressEnumVersion;
  }

  public createEnumVersion = async({ xContextId, enumId, topicAddressEnumVersion, targetLifecycleStateId }:{
    xContextId: string;
    enumId: string;
    topicAddressEnumVersion: TopicAddressEnumVersion;
    targetLifecycleStateId: string;
  }): Promise<TopicAddressEnumVersion> => {
    const funcName = 'createEnumVersion';
    const logName = `${EpSdkEnumVersionsServiceClass.name}.${funcName}()`;

    const topicAddressEnumVersionResponse: TopicAddressEnumVersionResponse = await EnumsService.createEnumVersion({
      xContextId: xContextId,
      requestBody: {        
        ...topicAddressEnumVersion,
        enumId: enumId,
      }
    });
    /* istanbul ignore next */
    if(topicAddressEnumVersionResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'topicAddressEnumVersionResponse.data === undefined', {
      topicAddressEnumVersionResponse: topicAddressEnumVersionResponse
    });
    const createdTopicAddressEnumVersion: TopicAddressEnumVersion = topicAddressEnumVersionResponse.data;
    /* istanbul ignore next */
    if(createdTopicAddressEnumVersion.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'createdTopicAddressEnumVersion.data.id === undefined', {
      createdTopicAddressEnumVersion: createdTopicAddressEnumVersion
    });
    /* istanbul ignore next */
    if(createdTopicAddressEnumVersion.stateId === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'createdTopicAddressEnumVersion.data.stateId === undefined', {
      createdTopicAddressEnumVersion: createdTopicAddressEnumVersion
    });
    /* istanbul ignore next */
    if(createdTopicAddressEnumVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'createdTopicAddressEnumVersion.data.version === undefined', {
      createdTopicAddressEnumVersion: createdTopicAddressEnumVersion
    });
    if(createdTopicAddressEnumVersion.stateId !== targetLifecycleStateId) {
      const stateChangeRequestResponse: StateChangeRequestResponse = await EnumsService.updateEnumVersionState({
        xContextId,
        id: createdTopicAddressEnumVersion.id,
        requestBody: {
          stateId: targetLifecycleStateId
        }
      });
      stateChangeRequestResponse;
      const updatedTopicAddressEnumVersion: TopicAddressEnumVersion | undefined = await this.getVersionByVersion({
        xContextId,
        enumId: enumId,
        enumVersionString: createdTopicAddressEnumVersion.version
      });
      /* istanbul ignore next */
      if(updatedTopicAddressEnumVersion === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'updatedTopicAddressEnumVersion === undefined', {
        updatedTopicAddressEnumVersion: updatedTopicAddressEnumVersion
      });
      return updatedTopicAddressEnumVersion;
    }
    return createdTopicAddressEnumVersion;
  }

  public copyLastestVersionById_IfNotExists = async({ xContextId, enumVersionId, fromApplicationDomainId, toApplicationDomainId }: {
    xContextId: string;
    enumVersionId: string;
    fromApplicationDomainId: string;
    toApplicationDomainId: string;
  }): Promise<TopicAddressEnumVersion> => {
    const funcName = 'copyLastestVersionById_IfNotExists';
    const logName = `${EpSdkEnumVersionsServiceClass.name}.${funcName}()`;

    // get the source enum version
    const fromTopicAddressEnumVersionResponse: TopicAddressEnumVersionResponse = await EnumsService.getEnumVersion({
      xContextId,
      versionId: enumVersionId,
    });
    /* istanbul ignore next */
    if(fromTopicAddressEnumVersionResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'fromTopicAddressEnumVersionResponse.data === undefined', {
      fromTopicAddressEnumVersionResponse: fromTopicAddressEnumVersionResponse
    });
    const fromTopicAddressEnumVersion: TopicAddressEnumVersion = fromTopicAddressEnumVersionResponse.data;
    /* istanbul ignore next */
    if(fromTopicAddressEnumVersion.stateId === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'fromTopicAddressEnumVersion.stateId === undefined', {
      fromTopicAddressEnumVersion: fromTopicAddressEnumVersion
    });
    
    // get the source enum
    const fromTopicAddressEnum: TopicAddressEnum = await EpSdkEnumsService.getById({
      xContextId,
      applicationDomainId: fromApplicationDomainId,
      enumId: fromTopicAddressEnumVersion.enumId
    });
    // ensure target enum exists
    const epSdkEnumTask = new EpSdkEnumTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: toApplicationDomainId,
      enumName: fromTopicAddressEnum.name,
      enumObjectSettings: {
        shared: fromTopicAddressEnum.shared ? fromTopicAddressEnum.shared : true,
      },
    });
    const epSdkEnumTask_ExecuteReturn: IEpSdkEnumTask_ExecuteReturn = await epSdkEnumTask.execute(xContextId);
    if(epSdkEnumTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action === EEpSdkTask_Action.NO_ACTION) {
      // return the latest version
      const targetTopicAddressEnumVersion: TopicAddressEnumVersion | undefined = await this.getLatestVersionForEnumId({
        xContextId,
        enumId: epSdkEnumTask_ExecuteReturn.epObjectKeys.epObjectId,
        applicationDomainId: toApplicationDomainId
      });
      if(targetTopicAddressEnumVersion !== undefined) return targetTopicAddressEnumVersion;
    }
    // create target enum version
    const epSdkEnumVersionTask = new EpSdkEnumVersionTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: toApplicationDomainId,
      enumId: epSdkEnumTask_ExecuteReturn.epObjectKeys.epObjectId,
      versionString: fromTopicAddressEnumVersion.version,
      versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
      enumVersionSettings: {
        stateId: fromTopicAddressEnumVersion.stateId,
        displayName: fromTopicAddressEnumVersion.displayName ? fromTopicAddressEnumVersion.displayName : fromTopicAddressEnum.name,
        description: fromTopicAddressEnumVersion.description
      },
      enumValues: fromTopicAddressEnumVersion.values.map( (x) => { return x.value; }),
    });
    const epSdkEnumVersionTask_ExecuteReturn: IEpSdkEnumVersionTask_ExecuteReturn = await epSdkEnumVersionTask.execute(xContextId);
    return epSdkEnumVersionTask_ExecuteReturn.epObject;
  }

}

/** @category Services */
export default new EpSdkEnumVersionsServiceClass();

