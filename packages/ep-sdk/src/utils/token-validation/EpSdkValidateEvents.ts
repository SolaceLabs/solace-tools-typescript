import {
  EventsService,
  OpenAPIConfig,
} from '@solace-labs/ep-openapi-node';
import {
  EpSdkClient, 
  isEpPermissionsError,
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

  public validateReadPermissions = async({ xContextId, globalEpOpenAPI, globalEpRtOpenAPI, token }:{
    xContextId?: string;
    globalEpOpenAPI: OpenAPIConfig;
    globalEpRtOpenAPI: OpenAPIConfig;
    token: string;
  }): Promise<void> => {
    let error: any = undefined;
    try {
      EpSdkClient.setToken({ globalEpOpenAPI, globalEpRtOpenAPI, token });
      try { 
        await EventsService.getEvents({ xContextId, pageSize: 1 });
        EpSdkValidationLog.addValidationToLog({ resource: TEpSdkPermissionResources.Events, permissionResult: { permission: EEpSdkPermissions.READ, access: true }});
      } catch(e) {
        if(isEpPermissionsError(e)) EpSdkValidationLog.addValidationToLog({ resource: TEpSdkPermissionResources.Events, permissionResult: { permission: EEpSdkPermissions.READ, access: false }});
        else throw e;
      }
    } catch (e) { 
      /* istanbul ignore next */
      error = e;
    } finally {
      EpSdkClient.resetToken({ globalEpOpenAPI, globalEpRtOpenAPI });
    }
    /* istanbul ignore next */
    if(error) throw error;
  }

}
/** @category Utils */
export default new EpSdkValidateEventsClass();

