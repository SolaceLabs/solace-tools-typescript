import {
  Application,
  ApplicationsService,
  ApplicationVersion,
  ApplicationVersionResponse,
  ApplicationVersionsResponse,
  ApplicationResponse,
  Pagination,
  ApplicationsResponse,
  StateChangeRequestResponse
} from '@rjgu/ep-openapi-node';
import { 
  EpSdkApiContentError 
} from "../utils";
import { 
  EpApiMaxPageSize 
} from '../constants';
import { 
  EpSdkPagination 
} from "../types";
import EpSdkApplicationsService from "./EpSdkApplicationsService";
import { EpSdkVersionServiceClass } from "./EpSdkVersionService";

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

  public getObjectAndVersionForApplicationId = async({ applicationId, stateId, versionString }:{
    applicationId: string;
    stateId?: string;
    versionString?: string;
  }): Promise<EpSdkApplicationAndVersionResponse | undefined> => {
    const funcName = 'getObjectAndVersionForEventId';
    const logName = `${EpSdkApplicationVersionsServiceClass.name}.${funcName}()`;

    // get application
    let applicationResponse: ApplicationResponse;
    try {
      applicationResponse = await ApplicationsService.getApplication({ id: applicationId });
    } catch(e) {
      return undefined;
    }
    // get all versions for selected stateId
    const applicationVersionList: Array<ApplicationVersion> = await this.getVersionsForApplicationId({
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

  public getVersionByVersion = async ({ applicationId, applicationVersionString }: {
    applicationId: string;
    applicationVersionString: string;
  }): Promise<ApplicationVersion | undefined> => {
    const applicationVersionList: Array<ApplicationVersion> = await this.getVersionsForApplicationId({
      applicationId: applicationId
    });
    return applicationVersionList.find( (applicationVersion: ApplicationVersion) => {
      return applicationVersion.version === applicationVersionString;
    });
  }

  public getVersionsForApplicationId = async ({ applicationId, stateId, pageSize = EpApiMaxPageSize }: {
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

  public getVersionsForApplicationName = async ({ applicationName, applicationDomainId }: {
    applicationDomainId: string;
    applicationName: string;
  }): Promise<Array<ApplicationVersion>> => {
    const funcName = 'getVersionsForApplicationName';
    const logName = `${EpSdkApplicationVersionsServiceClass.name}.${funcName}()`;

    const applicationObject: Application | undefined = await EpSdkApplicationsService.getByName({
      applicationDomainId: applicationDomainId,
      applicationName: applicationName
    });
    if (applicationObject === undefined) return [];
    /* istanbul ignore next */
    if (applicationObject.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'applicationObject.id === undefined', {
      applicationObject: applicationObject
    });
    const applicationVersionList: Array<ApplicationVersion> = await this.getVersionsForApplicationId({ applicationId: applicationObject.id });
    return applicationVersionList;
  }

  public getLatestVersionString = async ({ applicationId }: {
    applicationId: string;
  }): Promise<string | undefined> => {
    const funcName = 'getLatestVersionString';
    const logName = `${EpSdkApplicationVersionsServiceClass.name}.${funcName}()`;

    const applicationVersionList: Array<ApplicationVersion> = await this.getVersionsForApplicationId({ applicationId: applicationId });
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

  public getLatestVersionForApplicationId = async ({ applicationId, applicationDomainId, stateId }: {
    applicationDomainId?: string;
    applicationId: string;
    stateId?: string;
  }): Promise<ApplicationVersion | undefined> => {
    applicationDomainId;
    const applicationVersionList: Array<ApplicationVersion> = await this.getVersionsForApplicationId({
      applicationId: applicationId,
      stateId: stateId,
    });
    const latestApplicationVersion: ApplicationVersion | undefined = this.getLatestEpObjectVersionFromList({ epObjectVersionList: applicationVersionList });
    return latestApplicationVersion;
  }

  public getLatestVersionForApplicationName = async ({ applicationDomainId, applicationName }: {
    applicationDomainId: string;
    applicationName: string;
  }): Promise<ApplicationVersion | undefined> => {
    const applicationVersionList: Array<ApplicationVersion> = await this.getVersionsForApplicationName({
      applicationName: applicationName,
      applicationDomainId: applicationDomainId
    });
    const latestApplicationVersion: ApplicationVersion | undefined = this.getLatestEpObjectVersionFromList({ epObjectVersionList: applicationVersionList });
    return latestApplicationVersion;
  }

  public createApplicationVersion = async({ applicationDomainId, applicationId, applicationVersion, targetLifecycleStateId }:{
    applicationDomainId: string;
    applicationId: string;
    applicationVersion: ApplicationVersion;
    targetLifecycleStateId: string;
  }): Promise<ApplicationVersion> => {
    const funcName = 'createApplicationVersion';
    const logName = `${EpSdkApplicationVersionsServiceClass.name}.${funcName}()`;

    applicationDomainId;
    const applicationVersionResponse: ApplicationVersionResponse = await ApplicationsService.createApplicationVersion({
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
        versionId: createdApplicationVersion.id,
        requestBody: {
          ...applicationVersion,
          stateId: targetLifecycleStateId          
        }
      });
      stateChangeRequestResponse;
      const updatedApplicationVersion: ApplicationVersion | undefined = await this.getVersionByVersion({
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

  public listLatestVersions = async({ applicationDomainIds, stateId, pageNumber = 1, pageSize = 20, sortFieldName }:{
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

}

/** @category Services */
export default new EpSdkApplicationVersionsServiceClass();

