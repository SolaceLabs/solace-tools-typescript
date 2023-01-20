import {
  ApplicationDomainResponse,
  ApplicationDomainsService,
  OpenAPIConfig,
} from '@solace-labs/ep-openapi-node';
import {
  EpSdkApiContentError,
  EpSdkClient,
} from '../../utils';
import { 
  EpSdkValidationClass 
} from './EpSdkValidation';

import { 
  EEpSdkPermissions,
  EpSdkValidationLog, 
  TEpSdkPermissionResources 
} from './index';

/** 
 * Tests application domain permissions.
 * 
 * @experimental
 * @category Utils 
 * 
*/
export class EpSdkValidateApplicationDomainsClass extends EpSdkValidationClass {
  private readonly entityBaseName = "EpSdkApplictaionDomainValidation";
  
  public createEntityName(): string {
    return `${this.entityBaseName}/${super.createEntityName()}`;
  }

  public validateReadPermissions = async({ globalOpenAPI, token }:{
    globalOpenAPI: OpenAPIConfig;
    token: string;
  }): Promise<void> => {
    let error: any = undefined;
    try {
      EpSdkClient.setToken({ globalOpenAPI: globalOpenAPI, token: token });
      try { 
        await ApplicationDomainsService.getApplicationDomains({ pageSize: 1 });
        EpSdkValidationLog.addValidationToLog({ resource: TEpSdkPermissionResources.ApplicationDomains, permissionResult: { permission: EEpSdkPermissions.READ, access: true }});
      } catch(e) {
        if(this.isAuthorizationError(e)) EpSdkValidationLog.addValidationToLog({ resource: TEpSdkPermissionResources.ApplicationDomains, permissionResult: { permission: EEpSdkPermissions.READ, access: false }});
        else throw e;
      }
    } catch (e) { 
      error = e;
    } finally {
      EpSdkClient.resetToken({globalOpenAPI: globalOpenAPI});
    }
    if(error) throw error;
  }
  /**
   * Tests if token has permissions to create & delete application domains.
   * Writes results into {@link EpSdkValidationLog}.
   * 
   * @remarks
   * Warning: if application domain is created but token has no permissions to delete, the application domain will exist after.
   * 
   * @returns true if write & delete access, false otherwise. 
   */
  public validateWriteDeletePermissions = async({ globalOpenAPI, token }:{
    globalOpenAPI: OpenAPIConfig;
    token: string;
  }): Promise<boolean> => {
    const funcName = "validateWriteDeletePermissions";
    const logName = `${EpSdkValidateApplicationDomainsClass.name}.${funcName}()`;
    let error: any = undefined;
    let applicationDomainId: string;
    try {
      try { 
        // create
        EpSdkClient.setToken({ globalOpenAPI: globalOpenAPI, token: token });
        const applicationDomainResponse: ApplicationDomainResponse = await ApplicationDomainsService.createApplicationDomain({ requestBody: { name: this.createEntityName() }});
        EpSdkValidationLog.addValidationToLog({ resource: TEpSdkPermissionResources.ApplicationDomains, permissionResult: { permission: EEpSdkPermissions.WRITE, access: true }});
        /* istanbul ignore next */
        if(applicationDomainResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'applicationDomainResponse.data === undefined', {});
        /* istanbul ignore next */
        if(applicationDomainResponse.data.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'applicationDomainResponse.data.id === undefined', {});
        applicationDomainId = applicationDomainResponse.data.id;
      } catch(e) {
        if(this.isAuthorizationError(e)) EpSdkValidationLog.addValidationToLog({ resource: TEpSdkPermissionResources.ApplicationDomains, permissionResult: { permission: EEpSdkPermissions.WRITE, access: false }});
        else throw e;
      }
      try { 
        // delete
        EpSdkClient.setToken({ globalOpenAPI: globalOpenAPI, token: token });
        await ApplicationDomainsService.deleteApplicationDomain({ id: applicationDomainId });
        EpSdkValidationLog.addValidationToLog({ resource: TEpSdkPermissionResources.ApplicationDomains, permissionResult: { permission: EEpSdkPermissions.DELETE, access: true }});
      } catch(e) {
        if(this.isAuthorizationError(e)) EpSdkValidationLog.addValidationToLog({ resource: TEpSdkPermissionResources.ApplicationDomains, permissionResult: { permission: EEpSdkPermissions.DELETE, access: false }});
        else throw e;
      }
    } catch (e) { 
      error = e;
    } finally {
      EpSdkClient.resetToken({globalOpenAPI: globalOpenAPI});
    }
    if(error) throw error;
    const writeAccess = EpSdkValidationLog.getValidationPermissionResultAccess(TEpSdkPermissionResources.ApplicationDomains, EEpSdkPermissions.WRITE);
    const deleteAccess = EpSdkValidationLog.getValidationPermissionResultAccess(TEpSdkPermissionResources.ApplicationDomains, EEpSdkPermissions.DELETE);
    return writeAccess && deleteAccess;
  }

}
/** @category Utils */
export default new EpSdkValidateApplicationDomainsClass();

