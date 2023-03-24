import {
  Application,
  ApplicationResponse,
  ApplicationsResponse,
  ApplicationsService,
  CustomAttribute,
  CustomAttributeDefinition,
  Pagination,
} from '@solace-labs/ep-openapi-node';
import { 
  EpSdkApiContentError, 
  EpSdkServiceError,
  EpSdkLogger,
  EEpSdkLoggerCodes
} from '../utils';
import { 
  EpApiMaxPageSize 
} from '../constants';
import { EpSdkServiceClass } from './EpSdkService';
import { EEpSdkCustomAttributeEntityTypes, TEpSdkCustomAttributeList } from '../types';
import EpSdkCustomAttributesService from './EpSdkCustomAttributesService';
import EpSdkCustomAttributeDefinitionsService from './EpSdkCustomAttributeDefinitionsService';

/** @category Services */
export class EpSdkApplicationsServiceClass extends EpSdkServiceClass {

  private listAllForApplicationDomainId = async({ xContextId, applicationDomainId }:{
    xContextId?: string;
    applicationDomainId?: string;
  }): Promise<ApplicationsResponse> => {
    const funcName = 'listAllForApplicationDomainId';
    const logName = `${EpSdkApplicationsServiceClass.name}.${funcName}()`;

    const applicationList: Array<Application> = [];
    
    let nextPage: number | undefined | null = 1;
    while(nextPage !== undefined && nextPage !== null) {

      const applicationsResponse: ApplicationsResponse = await ApplicationsService.getApplications({
        xContextId: xContextId,
        applicationDomainId: applicationDomainId,
        pageSize: EpApiMaxPageSize,
        pageNumber: nextPage,
      });
      if(applicationsResponse.data === undefined || applicationsResponse.data.length === 0) nextPage = undefined;
      else {
        applicationList.push(...applicationsResponse.data);
        /* istanbul ignore next */
        if(applicationsResponse.meta === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'applicationsResponse.meta === undefined', {
          applicationsResponse: applicationsResponse
        });
        /* istanbul ignore next */
        if(applicationsResponse.meta.pagination === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'applicationsResponse.meta.pagination === undefined', {
          applicationsResponse: applicationsResponse
        });
        const pagination: Pagination = applicationsResponse.meta.pagination;
        nextPage = pagination.nextPage;  
      }
    }
    const applicationsResponse: ApplicationsResponse = {
      data: applicationList,
      meta: {
        pagination: {
          count: applicationList.length,
        }
      }
    };
    return applicationsResponse;
  }

  private async updateApplication({ xContextId, update }:{
    xContextId?: string;
    update: Application;
  }): Promise<Application> {
    const funcName = 'updateApplication';
    const logName = `${EpSdkApplicationsServiceClass.name}.${funcName}()`;

    /* istanbul ignore next */
    if(update.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'update.id === undefined', {
      update: update
    });

    const applicationResponse: ApplicationResponse = await ApplicationsService.updateApplication({
      xContextId: xContextId,
      id: update.id,
      requestBody: update
    });
    /* istanbul ignore next */
    if(applicationResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'applicationResponse.data === undefined', {
      applicationResponse: applicationResponse
    });
    return applicationResponse.data;
  }

  /**
   * Sets the custom attributes in the list on the application.
   * Creates attribute definitions / adds entity type 'application' if it doesn't exist.
   * @param param0 
   * @returns 
   */
  public async setCustomAttributes({ xContextId, applicationId, epSdkCustomAttributeList, scope, applicationDomainId }:{
    xContextId?: string;
    applicationId: string;
    epSdkCustomAttributeList: TEpSdkCustomAttributeList;
    scope?: CustomAttributeDefinition.scope;
    applicationDomainId?: string;
  }): Promise<Application> {
    const application: Application = await this.getById({
      xContextId: xContextId,
      applicationId: applicationId
    });
    scope;
    const customAttributes: Array<CustomAttribute> = await EpSdkCustomAttributesService.createCustomAttributesWithNew({
      xContextId: xContextId,
      existingCustomAttributes: application.customAttributes,
      epSdkCustomAttributeList: epSdkCustomAttributeList,
      epSdkCustomAttributeEntityType: EEpSdkCustomAttributeEntityTypes.APPLICATION,
      applicationDomainId: applicationDomainId
    });
    return await this.updateApplication({
      xContextId: xContextId,
      update: {
        ...application,
        customAttributes: customAttributes,  
      }
    });
  }

  /**
   * Unsets the custom attributes in the list on the application.
   * Leaves attibute definitions as-is.
   */
  public async unsetCustomAttributes({ xContextId, applicationId, epSdkCustomAttributeList }:{
    xContextId?: string;
    applicationId: string;
    epSdkCustomAttributeList: TEpSdkCustomAttributeList;
  }): Promise<Application> {
    const application: Application = await this.getById({
      xContextId: xContextId,
      applicationId: applicationId
    });
    const customAttributes: Array<CustomAttribute> = await EpSdkCustomAttributesService.createCustomAttributesExcluding({
      existingCustomAttributes: application.customAttributes,
      epSdkCustomAttributeList: epSdkCustomAttributeList,
    });
    return await this.updateApplication({
      xContextId: xContextId,
      update: {
        ...application,
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
        xContextId: xContextId,
        attributeName: customAttributeName,
        associatedEntityType: EEpSdkCustomAttributeEntityTypes.APPLICATION,
      });
    }
  }

  /**
   * Retrieves a list of all Applications without paging.
   * @param param0 
   */
  public listAll = async({ xContextId, applicationDomainIds, sortFieldName }:{
    xContextId?: string;
    applicationDomainIds?: Array<string>;
    sortFieldName?: string;
  }): Promise<ApplicationsResponse> => {
    const applicationList: Array<Application> = [];    
    if(applicationDomainIds) {
      for(const applicationDomainId of applicationDomainIds) {
        const applicationsResponse: ApplicationsResponse = await this.listAllForApplicationDomainId({
          xContextId: xContextId,
          applicationDomainId: applicationDomainId
        });
        if(applicationsResponse.data) applicationList.push(...applicationsResponse.data);
      }
    } else {
      const applicationsResponse: ApplicationsResponse = await this.listAllForApplicationDomainId({ xContextId: xContextId });
      if(applicationsResponse.data) applicationList.push(...applicationsResponse.data);
    }
    // TODO: sort by sortFieldName
    sortFieldName;
    const applicationsResponse: ApplicationsResponse = {
      data: applicationList,
      meta: {
        pagination: {
          count: applicationList.length,
        }
      }
    };
    return applicationsResponse;
  }

  public getByName = async ({ xContextId, applicationName, applicationDomainId }: {
    xContextId?: string;
    applicationName: string;
    applicationDomainId: string;
  }): Promise<Application | undefined> => {
    const funcName = 'getByName';
    const logName = `${EpSdkApplicationsServiceClass.name}.${funcName}()`;

    const applicationsResponse: ApplicationsResponse = await ApplicationsService.getApplications({
      xContextId: xContextId,
      applicationDomainId: applicationDomainId,
      name: applicationName
    });
    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, {code: EEpSdkLoggerCodes.SERVICE_GET, module: this.constructor.name, details: {
      applicationsResponse: applicationsResponse
    }}));

    if (applicationsResponse.data === undefined || applicationsResponse.data.length === 0) return undefined;
    /* istanbul ignore next */
    if (applicationsResponse.data.length > 1) throw new EpSdkApiContentError(logName, this.constructor.name, 'applicationsResponse.data.length > 1', {
      applicationsResponse: applicationsResponse
    });
    const epApplication: Application = applicationsResponse.data[0];
    return epApplication;
  }

  public getById = async ({ xContextId, applicationId, applicationDomainId }: {
    xContextId?: string;
    applicationId: string;
    applicationDomainId?: string;
  }): Promise<Application> => {
    const funcName = 'getById';
    const logName = `${EpSdkApplicationsServiceClass.name}.${funcName}()`;

    applicationDomainId;
    const applicationResponse: ApplicationResponse = await ApplicationsService.getApplication({
      xContextId: xContextId,
      id: applicationId
    });
    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, {
      code: EEpSdkLoggerCodes.SERVICE_GET, module: this.constructor.name, details: {
        applicationResponse: applicationResponse
      }
    }));

    /* istanbul ignore next */
    if (applicationResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "applicationResponse.data === undefined", {
      applicationId: applicationId
    });
    const epApplication: Application = applicationResponse.data;
    return epApplication;
  }

  public deleteById = async ({ xContextId, applicationId, applicationDomainId }: {
    xContextId?: string;
    applicationId: string;
    applicationDomainId?: string;
  }): Promise<Application> => {
    const epApplication: Application = await this.getById({
      xContextId: xContextId,
      applicationDomainId: applicationDomainId,
      applicationId: applicationId,
    });
    const xvoid: void = await ApplicationsService.deleteApplication({
      xContextId: xContextId,
      id: applicationId,
    });
    xvoid;
    return epApplication;
  }

  public deleteByName = async ({ xContextId, applicationDomainId, applicationName }: {
    xContextId?: string;
    applicationName: string;
    applicationDomainId: string;
  }): Promise<Application> => {
    const funcName = 'deleteByName';
    const logName = `${EpSdkApplicationsServiceClass.name}.${funcName}()`;

    const epApplication: Application | undefined = await this.getByName({
      xContextId: xContextId,
      applicationDomainId: applicationDomainId,
      applicationName: applicationName,
    });
    if (epApplication === undefined) throw new EpSdkServiceError(logName, this.constructor.name, "epApplication === undefined", {
      applicationDomainId: applicationDomainId,
      applicationName: applicationName
    });
    /* istanbul ignore next */
    if (epApplication.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epApplication.id === undefined', {
      epApplication: epApplication,
    });
    const epApplicationDeleted: Application = await this.deleteById({
      xContextId: xContextId,
      applicationDomainId: applicationDomainId,
      applicationId: epApplication.id
    });
    return epApplicationDeleted;
  }


}

/** @category Services */
export default new EpSdkApplicationsServiceClass();
