import {
  EventsService,
  OpenAPIConfig,
} from '@solace-labs/ep-openapi-node';
import {
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
 * Tests events permissions.
 * 
 * @experimental
 * @category Utils 
 * 
*/
export class EpSdkValidateEventsClass extends EpSdkValidationClass {

  public validateReadPermissions = async({ globalOpenAPI, token }:{
    globalOpenAPI: OpenAPIConfig;
    token: string;
  }): Promise<void> => {
    let error: any = undefined;
    try {
      EpSdkClient.setToken({ globalOpenAPI: globalOpenAPI, token: token });
      try { 
        await EventsService.getEvents({ pageSize: 1 });
        EpSdkValidationLog.addValidationToLog({ resource: TEpSdkPermissionResources.Events, permissionResult: { permission: EEpSdkPermissions.READ, access: true }});
      } catch(e) {
        if(this.isAuthorizationError(e)) EpSdkValidationLog.addValidationToLog({ resource: TEpSdkPermissionResources.Events, permissionResult: { permission: EEpSdkPermissions.READ, access: false }});
        else throw e;
      }
    } catch (e) { 
      error = e;
    } finally {
      EpSdkClient.resetToken({globalOpenAPI: globalOpenAPI});
      if(error) throw error;
    }
  }

}
/** @category Utils */
export default new EpSdkValidateEventsClass();

