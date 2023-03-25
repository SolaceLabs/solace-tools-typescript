import {
  Application,
  ApplicationsService,
  ApplicationVersion,
  ApplicationVersionResponse,
  ApplicationVersionsResponse,
  ApplicationResponse,
  Pagination,
  ApplicationsResponse,
  StateChangeRequestResponse,
  EventVersion,
  CustomAttributeDefinition
} from '@solace-labs/ep-openapi-node';
import { 
  EpSdkApiContentError 
} from "../utils";
import { 
  EpApiMaxPageSize, EpSdkCustomAttributeNameSourceApplicationDomainId 
} from '../constants';
import { 
  EpSdkPagination 
} from "../types";
import EpSdkApplicationsService from "./EpSdkApplicationsService";
import { EpSdkVersionServiceClass } from "./EpSdkVersionService";
import EpSdkEpEventVersionsService from './EpSdkEpEventVersionsService';
import { EEpSdkTask_TargetState, EEpSdk_VersionTaskStrategy, EpSdkApplicationTask, EpSdkApplicationVersionTask, IEpSdkApplicationTask_ExecuteReturn, IEpSdkApplicationVersionTask_ExecuteReturn } from '../tasks';

/** @category Services */
export type EpSdkApplication = Required<Pick<Application, "applicationDomainId" | "id" | "name">> & Omit<Application, "applicationDomainId" | "id" | "name">;
/** @category Services */
export type EpSdkApplicationVersion = Required<Pick<ApplicationVersion, "id" | "applicationId" | "version" | "stateId">> & Omit<ApplicationVersion, "id" | "applicationId" | "version" | "stateId">;
/** @category Services */
export type EpSdkApplicationVersionList = Array<EpSdkApplicationVersion>;
/** @category Services */
export type EpSdkApplicationAndVersion = {
  application: EpSdkApplication;
  applicationVersion: EpSdkApplicationVersion;
}
/** @category Services */
export type EpSdkApplicationAndVersionList = Array<EpSdkApplicationAndVersion>;
/** @category Services */
export type EpSdkApplicationAndVersionListResponse = {
  data: EpSdkApplicationAndVersionList;
  meta: {
    pagination: EpSdkPagination;
  }
}
/** @category Services */
export type EpSdkApplicationAndVersionResponse = EpSdkApplicationAndVersion & {
  meta: {
    versionStringList: Array<string>;
  }
}

/** @category Services */
export class EpSdkApplicationVersionsServiceClass extends EpSdkVersionServiceClass {

  public getObjectAndVersionForApplicationId = async({ xContextId, applicationId, stateId, versionString }:{
    applicationId: string;
    stateId?: string;
    versionString?: string;
    xContextId?: string;
  }): Promise<EpSdkApplicationAndVersionResponse | undefined> => {
    const funcName = 'getObjectAndVersionForEventId';
    const logName = `${EpSdkApplicationVersionsServiceClass.name}.${funcName}()`;

    // get application
    let applicationResponse: ApplicationResponse;
    try {
      applicationResponse = await ApplicationsService.getApplication({ xContextId: xContextId, id: applicationId });
    } catch(e) {
      return undefined;
    }
    // get all versions for selected stateId
    const applicationVersionList: Array<ApplicationVersion> = await this.getVersionsForApplicationId({
      xContextId: xContextId,
      applicationId: applicationId,
      stateId: stateId,
    });

    let applicationVersion: ApplicationVersion | undefined = undefined;
    if(versionString === undefined) {
      // extract the latest version
      applicationVersion = this.getLatestEpObjectVersionFromList({ epObjectVersionList: applicationVersionList });
    } else {
      // extract the version
      applicationVersion = this.getEpObjectVersionFromList({ 
        epObjectVersionList: applicationVersionList,
        versionString: versionString,
      });
    }
    if(applicationVersion === undefined) return undefined;
    // create a list of all versions
    const versionStringList: Array<string> = applicationVersionList.map( (applicationVersion: ApplicationVersion) => {
      /* istanbul ignore next */
      if(applicationVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'applicationVersion.version === undefined', {
        applicationVersion: applicationVersion
      });
      return applicationVersion.version;
    });
    /* istanbul ignore next */
    if(applicationResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'applicationResponse.data === undefined', {
      applicationResponse: applicationResponse
    });
    return {
      application: applicationResponse.data as EpSdkApplication,
      applicationVersion: applicationVersion as EpSdkApplicationVersion,
      meta: {
        versionStringList: versionStringList
      }
    }
  }

  public getVersionByVersion = async ({ xContextId, applicationId, applicationVersionString }: {
    xContextId?: string;
    applicationId: string;
    applicationVersionString: string;
  }): Promise<ApplicationVersion | undefined> => {
    const applicationVersionList: Array<ApplicationVersion> = await this.getVersionsForApplicationId({
      xContextId: xContextId,
      applicationId: applicationId
    });
    return applicationVersionList.find( (applicationVersion: ApplicationVersion) => {
      return applicationVersion.version === applicationVersionString;
    });
  }

  public getVersionsForApplicationId = async ({ xContextId, applicationId, stateId, pageSize = EpApiMaxPageSize }: {
    xContextId?: string;
    applicationId: string;
    stateId?: string;
    pageSize?: number; /** for testing */
  }): Promise<Array<ApplicationVersion>> => {
    const funcName = 'getVersionsForApplicationId';
    const logName = `${EpSdkApplicationVersionsServiceClass.name}.${funcName}()`;

    const applicationVersionList: Array<ApplicationVersion> = [];
    let nextPage: number | undefined | null = 1;

    while(nextPage !== undefined && nextPage !== null) {

      const applicationVersionsResponse: ApplicationVersionsResponse = await ApplicationsService.getApplicationVersions({
        xContextId: xContextId,
        applicationIds: [applicationId],
        pageNumber: nextPage,
        pageSize: pageSize,
      });

      if(applicationVersionsResponse.data === undefined || applicationVersionsResponse.data.length === 0) nextPage = null;
      else {
        // filter for stateId
        if(stateId) {
          const filteredList = applicationVersionsResponse.data.filter( (applicationVersion: ApplicationVersion) => {
            /* istanbul ignore next */
            if(applicationVersion.stateId === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'applicationVersion.stateId === undefined', {
              applicationVersion: applicationVersion
            });
            return applicationVersion.stateId === stateId;
          });
          applicationVersionList.push(...filteredList);
        } else {
          applicationVersionList.push(...applicationVersionsResponse.data);
        }
        /* istanbul ignore next */
        if(applicationVersionsResponse.meta === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'applicationVersionsResponse.meta === undefined', {
          applicationVersionsResponse: applicationVersionsResponse
        });
        /* istanbul ignore next */
        if(applicationVersionsResponse.meta.pagination === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'applicationVersionsResponse.meta.pagination === undefined', {
          applicationVersionsResponse: applicationVersionsResponse
        });
        const pagination: Pagination = applicationVersionsResponse.meta.pagination;
        nextPage = pagination.nextPage;  
      }
    }
    // // DEBUG
    // throw new EpSdkApiContentError(logName, this.constructor.name, 'testing', {
    //   applicationVersionList: applicationVersionList
    // });
    return applicationVersionList;
  }

  public getVersionsForApplicationName = async ({ xContextId, applicationName, applicationDomainId }: {
    xContextId?: string;
    applicationDomainId: string;
    applicationName: string;
  }): Promise<Array<ApplicationVersion>> => {
    const funcName = 'getVersionsForApplicationName';
    const logName = `${EpSdkApplicationVersionsServiceClass.name}.${funcName}()`;

    const applicationObject: Application | undefined = await EpSdkApplicationsService.getByName({
      xContextId: xContextId,
      applicationDomainId: applicationDomainId,
      applicationName: applicationName
    });
    if (applicationObject === undefined) return [];
    /* istanbul ignore next */
    if (applicationObject.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'applicationObject.id === undefined', {
      applicationObject: applicationObject
    });
    const applicationVersionList: Array<ApplicationVersion> = await this.getVersionsForApplicationId({ xContextId: xContextId, applicationId: applicationObject.id });
    return applicationVersionList;
  }

  public getLatestVersionString = async ({ xContextId, applicationId }: {
    xContextId?: string;
    applicationId: string;
  }): Promise<string | undefined> => {
    const funcName = 'getLatestVersionString';
    const logName = `${EpSdkApplicationVersionsServiceClass.name}.${funcName}()`;

    const applicationVersionList: Array<ApplicationVersion> = await this.getVersionsForApplicationId({ xContextId: xContextId, applicationId: applicationId });
    // CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.SERVICE, details: {
    //   applicationVersionList: applicationVersionList
    // }}));
    const latestApplicationVersion: ApplicationVersion | undefined = this.getLatestEpObjectVersionFromList({ epObjectVersionList: applicationVersionList });
    if (latestApplicationVersion === undefined) return undefined;
    /* istanbul ignore next */
    if (latestApplicationVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'latestApplicationVersion.version === undefined', {
      latestApplicationVersion: latestApplicationVersion
    });
    return latestApplicationVersion.version;
  }

  public getLatestVersionForApplicationId = async ({ xContextId, applicationId, applicationDomainId, stateId }: {
    xContextId?: string;
    applicationDomainId?: string;
    applicationId: string;
    stateId?: string;
  }): Promise<ApplicationVersion | undefined> => {
    applicationDomainId;
    const applicationVersionList: Array<ApplicationVersion> = await this.getVersionsForApplicationId({
      xContextId: xContextId,
      applicationId: applicationId,
      stateId: stateId,
    });
    const latestApplicationVersion: ApplicationVersion | undefined = this.getLatestEpObjectVersionFromList({ epObjectVersionList: applicationVersionList });
    return latestApplicationVersion;
  }

  public getLatestVersionForApplicationName = async ({ xContextId, applicationDomainId, applicationName }: {
    xContextId?: string;
    applicationDomainId: string;
    applicationName: string;
  }): Promise<ApplicationVersion | undefined> => {
    const applicationVersionList: Array<ApplicationVersion> = await this.getVersionsForApplicationName({
      xContextId: xContextId,
      applicationName: applicationName,
      applicationDomainId: applicationDomainId
    });
    const latestApplicationVersion: ApplicationVersion | undefined = this.getLatestEpObjectVersionFromList({ epObjectVersionList: applicationVersionList });
    return latestApplicationVersion;
  }

  public createApplicationVersion = async({ xContextId, applicationDomainId, applicationId, applicationVersion, targetLifecycleStateId }:{
    xContextId?: string;
    applicationDomainId: string;
    applicationId: string;
    applicationVersion: ApplicationVersion;
    targetLifecycleStateId: string;
  }): Promise<ApplicationVersion> => {
    const funcName = 'createApplicationVersion';
    const logName = `${EpSdkApplicationVersionsServiceClass.name}.${funcName}()`;

    applicationDomainId;
    const applicationVersionResponse: ApplicationVersionResponse = await ApplicationsService.createApplicationVersion({
      xContextId: xContextId,
      requestBody: {
        ...applicationVersion,
        applicationId: applicationId,
      }
    });
    /* istanbul ignore next */
    if(applicationVersionResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'applicationVersionResponse.data === undefined', {
      applicationVersionResponse: applicationVersionResponse
    });
    const createdApplicationVersion: ApplicationVersion = applicationVersionResponse.data;
    /* istanbul ignore next */
    if(createdApplicationVersion.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'applicationVersionResponse.data.id === undefined', {
      applicationVersionResponse: applicationVersionResponse
    });
    /* istanbul ignore next */
    if(createdApplicationVersion.stateId === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'applicationVersionResponse.data.stateId === undefined', {
      applicationVersionResponse: applicationVersionResponse
    });
    /* istanbul ignore next */
    if(createdApplicationVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'applicationVersionResponse.data.version === undefined', {
      applicationVersionResponse: applicationVersionResponse
    });
    if(createdApplicationVersion.stateId !== targetLifecycleStateId) {
      const stateChangeRequestResponse: StateChangeRequestResponse = await ApplicationsService.updateApplicationVersionState({
        xContextId: xContextId,
        versionId: createdApplicationVersion.id,
        requestBody: {
          ...applicationVersion,
          stateId: targetLifecycleStateId          
        }
      });
      stateChangeRequestResponse;
      const updatedApplicationVersion: ApplicationVersion | undefined = await this.getVersionByVersion({
        xContextId: xContextId,
        applicationId: applicationId,
        applicationVersionString: createdApplicationVersion.version
      });
      /* istanbul ignore next */
      if(updatedApplicationVersion === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'updatedApplicationVersion === undefined', {
        updatedApplicationVersion: updatedApplicationVersion
      });
      return updatedApplicationVersion;
    }
    return createdApplicationVersion;
  }

  public listLatestVersions = async({ xContextId, applicationDomainIds, stateId, pageNumber = 1, pageSize = 20, sortFieldName }:{
    xContextId?: string;
    applicationDomainIds?: Array<string>;
    stateId?: string;
    pageNumber?: number;
    pageSize?: number;
    sortFieldName?: string;
  }): Promise<EpSdkApplicationAndVersionListResponse> => {
    const funcName = 'listLatestVersions';
    const logName = `${EpSdkApplicationVersionsServiceClass.name}.${funcName}()`;

    // get all applications:
    // - we may have applications without a version in the state requested
    const applicationsResponse: ApplicationsResponse = await EpSdkApplicationsService.listAll({
      xContextId: xContextId,
      applicationDomainIds: applicationDomainIds,
      sortFieldName: sortFieldName
    });
    const applicationList: Array<Application> = applicationsResponse.data ? applicationsResponse.data : [];

    // create the complete list
    const complete_EpSdkApplicationAndVersionList: EpSdkApplicationAndVersionList = [];
    for(const application of applicationList) {
      /* istanbul ignore next */
      if(application.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'application.id === undefined', {
        application: application
      });
      // get the latest version in the requested state
      const latest_ApplicationVersion: ApplicationVersion | undefined = await this.getLatestVersionForApplicationId({
        xContextId: xContextId,
        applicationId: application.id,
        stateId: stateId
      });
      if(latest_ApplicationVersion !== undefined) complete_EpSdkApplicationAndVersionList.push({
        application: application as EpSdkApplication,
        applicationVersion: latest_ApplicationVersion as EpSdkApplicationVersion
      });
    }
    // extract the page
    const startIdx = (pageSize * (pageNumber-1));
    const endIdx = (startIdx + pageSize);
    const epSdkApplicationAndVersionList: EpSdkApplicationAndVersionList = complete_EpSdkApplicationAndVersionList.slice(startIdx, endIdx);
    const nextPage: number | undefined = endIdx < complete_EpSdkApplicationAndVersionList.length ? (pageNumber + 1) : undefined;

    return {
      data: epSdkApplicationAndVersionList,
      meta: {
        pagination: {
          count: complete_EpSdkApplicationAndVersionList.length,
          pageNumber: pageNumber,
          nextPage: nextPage
        }
      } 
    };
  }

  public deepCopyLastestVersionById_IfNotExists = async({ xContextId, applicationName, fromApplicationDomainId, toApplicationDomainId, fromAssetsApplicationDomainId, toAssetsApplicationDomainId }:{
    xContextId?: string;
    applicationName: string; 
    fromApplicationDomainId: string;
    toApplicationDomainId: string;
    fromAssetsApplicationDomainId?: string;
    toAssetsApplicationDomainId?: string;
  }): Promise<ApplicationVersion | undefined> => {
      const funcName = 'deepCopyLastestVersionById_IfNotExists';
      const logName = `${EpSdkApplicationVersionsServiceClass.name}.${funcName}()`;
  
      if(fromAssetsApplicationDomainId === undefined || toAssetsApplicationDomainId === undefined) {
        fromAssetsApplicationDomainId = fromApplicationDomainId;
        toAssetsApplicationDomainId = toApplicationDomainId;
      }
      // get the source application by name
      const fromApplication: Application | undefined = await EpSdkApplicationsService.getByName({ 
        xContextId,
        applicationName,
        applicationDomainId: fromApplicationDomainId
      });
      if(fromApplication === undefined) return undefined;
      /* istanbul ignore next */
      if(fromApplication.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'fromApplication.id === undefined', {
        fromApplication: fromApplication
      });
      // get the latest source application version
      const fromApplicationVersion = await this.getLatestVersionForApplicationId({
        xContextId,
        applicationId: fromApplication.id,
        applicationDomainId: fromApplicationDomainId,
      });
      if(fromApplicationVersion === undefined) return undefined;
      /* istanbul ignore next */
      if(fromApplicationVersion.stateId === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "fromApplicationVersion.stateId === undefined", {
        fromApplicationVersion: fromApplicationVersion
      });
      // check if a version already exists, if it does, return undefined
      const targetApplicationCheck: Application | undefined = await EpSdkApplicationsService.getByName({
        xContextId,
        applicationName,
        applicationDomainId: toApplicationDomainId,
      });
      if(targetApplicationCheck !== undefined) {
        /* istanbul ignore next */
        if(targetApplicationCheck.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "targetApplicationCheck.id === undefined", {
          targetApplicationCheck: targetApplicationCheck
        });
        const existingTargetVersion: ApplicationVersion | undefined = await this.getLatestVersionForApplicationId({
          xContextId,
          applicationDomainId: toApplicationDomainId,
          applicationId: targetApplicationCheck.id,
        });
        if(existingTargetVersion !== undefined) return undefined;
      }
      // get list of consumed & produced event versions
      const targetConsumedEventVersions: Array<EventVersion> = [];
      const targetProducedEventVersions: Array<EventVersion> = [];

      if(fromApplicationVersion.declaredConsumedEventVersionIds) {
        for(const eventVersionId of fromApplicationVersion.declaredConsumedEventVersionIds) {
          const eventVersion: EventVersion | undefined = await EpSdkEpEventVersionsService.deepCopyLastestVersionById_IfNotExists({ 
            xContextId,
            eventVersionId: eventVersionId,
            toApplicationDomainId: toAssetsApplicationDomainId,
          });
          targetConsumedEventVersions.push(eventVersion);
        }
      }
      if(fromApplicationVersion.declaredProducedEventVersionIds) {
        for(const eventVersionId of fromApplicationVersion.declaredProducedEventVersionIds) {
          const eventVersion: EventVersion | undefined = await EpSdkEpEventVersionsService.deepCopyLastestVersionById_IfNotExists({ 
            xContextId,
            eventVersionId: eventVersionId,
            toApplicationDomainId: toAssetsApplicationDomainId,
          });
          targetProducedEventVersions.push(eventVersion);
        }
      }
      // create the target application & version
      // ensure target version object exists
      const epSdkApplicationTask = new EpSdkApplicationTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: toApplicationDomainId,
        applicationName: fromApplication.name,
        applicationObjectSettings: {
          applicationType: fromApplication.applicationType,
          brokerType: fromApplication.brokerType
        }
      });
      const epSdkApplicationTask_ExecuteReturn: IEpSdkApplicationTask_ExecuteReturn = await epSdkApplicationTask.execute(xContextId);
      // add the source application domain id to custom attribute
      await EpSdkApplicationsService.setCustomAttributes({
        xContextId: xContextId,
        applicationDomainId: toApplicationDomainId,
        applicationId: epSdkApplicationTask_ExecuteReturn.epObjectKeys.epObjectId,
        scope: CustomAttributeDefinition.scope.APPLICATION_DOMAIN,
        epSdkCustomAttributeList: [ 
          { name: EpSdkCustomAttributeNameSourceApplicationDomainId, value: fromApplication.applicationDomainId }
        ]
      });
      // create target application version
      const epSdkApplicationVersionTask = new EpSdkApplicationVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: toApplicationDomainId,
        applicationId: epSdkApplicationTask_ExecuteReturn.epObjectKeys.epObjectId,
        versionString: fromApplicationVersion.version,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        applicationVersionSettings: {
          stateId: fromApplicationVersion.stateId,
          displayName: fromApplicationVersion.displayName,
          description: fromApplicationVersion.description,
          declaredConsumedEventVersionIds: targetConsumedEventVersions.map( (targetConsumedEventVersion: EventVersion) => {
            /* istanbul ignore next */
            if(targetConsumedEventVersion.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "targetConsumedEventVersion.id === undefined", {
              targetConsumedEventVersion: targetConsumedEventVersion
            });
            return targetConsumedEventVersion.id; 
          }),
          declaredProducedEventVersionIds: targetProducedEventVersions.map( (targetProducedEventVersion: EventVersion) => { 
            /* istanbul ignore next */
            if(targetProducedEventVersion.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "targetProducedEventVersion.id === undefined", {
              targetProducedEventVersion: targetProducedEventVersion
            });
            return targetProducedEventVersion.id; 
          }),
        },
      });
      const epSdkApplicationVersionTask_ExecuteReturn: IEpSdkApplicationVersionTask_ExecuteReturn = await epSdkApplicationVersionTask.execute(xContextId);
      // must get the object again, otherwise not all properties are set correctly
      /* istanbul ignore next */
      if(epSdkApplicationVersionTask_ExecuteReturn.epObject.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epSdkApplicationVersionTask_ExecuteReturn.epObject.id === undefined', {
        epSdkApplicationVersionTask_ExecuteReturn: epSdkApplicationVersionTask_ExecuteReturn
      });
      const applicationVersionResponse: ApplicationVersionResponse =  await ApplicationsService.getApplicationVersion({
        xContextId,
        versionId: epSdkApplicationVersionTask_ExecuteReturn.epObject.id,
      });
      /* istanbul ignore next */
      if(applicationVersionResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'applicationVersionResponse.data === undefined', {
        applicationVersionResponse: applicationVersionResponse
      });
      return applicationVersionResponse.data;
    }
  
}

/** @category Services */
export default new EpSdkApplicationVersionsServiceClass();

