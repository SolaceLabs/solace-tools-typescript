import { 
  ApplicationDomain, 
  EventApiVersion 
} from '@rjgu/ep-openapi-node';
import {
  EEpSdkTask_TargetState,
  EpSdkApplicationDomainsService, 
  EpSdkApplicationDomainTask, 
  EpSdkEventApiVersionsService, 
  IEpSdkApplicationDomainTask_ExecuteReturn,
} from "@rjgu/ep-sdk";
import { 
  EpAsyncApiDocument 
} from "@rjgu/ep-asyncapi";
import { 
  CliEPApiContentError 
} from "../cli-components";


class CliEventApisService {

  public deepCopyLatestEventApiVersion = async({ epAsyncApiDocument }:{
    epAsyncApiDocument: EpAsyncApiDocument;
  }): Promise<boolean> => {
    const funcName = 'deepCopyLatestEventApiVersion';
    const logName = `${CliEventApisService.name}.${funcName}()`;

    // create the target application domains
    const fromApplicationDomainName: string = epAsyncApiDocument.getUnprefixedApplicationDomainName();
    let fromApplicationDomainId: string;
    const toApplicationDomainName: string = epAsyncApiDocument.getApplicationDomainName();
    let toApplicationDomainId: string;
    const fromAssetsApplicationDomainName: string = epAsyncApiDocument.getUnprefixedAssetsApplicationDomainName();
    let fromAssetsApplicationDomainId: string | undefined;
    const toAssetsApplicationDomainName: string = epAsyncApiDocument.getAssetsApplicationDomainName();
    let toAssetsApplicationDomainId: string | undefined;

    const fromApplicationDomain: ApplicationDomain | undefined = await EpSdkApplicationDomainsService.getByName({ applicationDomainName: fromApplicationDomainName });
    if(fromApplicationDomain !== undefined) {
      /* istanbul ignore next */
      if(fromApplicationDomain.id === undefined) throw new CliEPApiContentError(logName, 'fromApplicationDomain.id === undefined', {
        fromApplicationDomain: fromApplicationDomain
      });
      fromApplicationDomainId = fromApplicationDomain.id;
      if(fromAssetsApplicationDomainName !== fromApplicationDomainName) {
        const fromAssetsApplicationDomain: ApplicationDomain | undefined = await EpSdkApplicationDomainsService.getByName({ applicationDomainName: fromAssetsApplicationDomainName });
        fromAssetsApplicationDomainId = fromAssetsApplicationDomain?.id;
      }
      // create the to application domain
      const toApplicationDomainsTask = new EpSdkApplicationDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainName: toApplicationDomainName,
        applicationDomainSettings: {
        },
      });
      const toEpSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await toApplicationDomainsTask.execute();
      /* istanbul ignore next */
      if(toEpSdkApplicationDomainTask_ExecuteReturn.epObject.id === undefined) throw new CliEPApiContentError(logName, 'toEpSdkApplicationDomainTask_ExecuteReturn.epObject.id === undefined', {
        applicationDomainObject: toEpSdkApplicationDomainTask_ExecuteReturn.epObject,
      });
      toApplicationDomainId = toEpSdkApplicationDomainTask_ExecuteReturn.epObject.id;
      const toAssetsApplicationDomainsTask = new EpSdkApplicationDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainName: toAssetsApplicationDomainName,
        applicationDomainSettings: {
        },
      });
      const toAssetsEpSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await toAssetsApplicationDomainsTask.execute();
      /* istanbul ignore next */
      if(toAssetsEpSdkApplicationDomainTask_ExecuteReturn.epObject.id === undefined) throw new CliEPApiContentError(logName, 'toAssetsEpSdkApplicationDomainTask_ExecuteReturn.epObject.id === undefined', {
        applicationDomainObject: toAssetsEpSdkApplicationDomainTask_ExecuteReturn.epObject,
      });
      toAssetsApplicationDomainId = toAssetsEpSdkApplicationDomainTask_ExecuteReturn.epObject.id;
  
      const eventApiVersion: EventApiVersion | undefined = await EpSdkEventApiVersionsService.deepCopyLastestVersionById_IfNotExists({
        eventApiName: epAsyncApiDocument.getTitle(),
        fromApplicationDomainId: fromApplicationDomainId,
        toApplicationDomainId: toApplicationDomainId,
        fromAssetsApplicationDomainId: fromAssetsApplicationDomainId,
        toAssetsApplicationDomainId: toAssetsApplicationDomainId,
      });

      if(eventApiVersion !== undefined) {
        return true;
      } else {
        return false;
      }  
    } else {
      return false;
    }

  }

}

export default new CliEventApisService();

