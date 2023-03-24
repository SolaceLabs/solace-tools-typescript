import {
  ApplicationDomain,
  ApplicationVersion,
} from "@solace-labs/ep-openapi-node";
import {
  EEpSdkTask_TargetState,
  EpSdkApplicationDomainsService,
  EpSdkApplicationDomainTask,
  EpSdkApplicationVersionsService,
  IEpSdkApplicationDomainTask_ExecuteReturn,
} from "@solace-labs/ep-sdk";
import { EpAsyncApiDocument } from "@solace-labs/ep-asyncapi";
import { CliEPApiContentError } from "../cli-components";

class CliAppsService {

  public deepCopyLatestAppVersion = async ({ epAsyncApiDocument }: {
    epAsyncApiDocument: EpAsyncApiDocument;
  }): Promise<boolean> => {
    const funcName = "deepCopyLatestAppVersion";
    const logName = `${CliAppsService.name}.${funcName}()`;
    // create the target application domains
    const fromApplicationDomainName: string = epAsyncApiDocument.getUnprefixedApplicationDomainName();
    let fromApplicationDomainId: string;
    const toApplicationDomainName: string = epAsyncApiDocument.getApplicationDomainName();
    let toApplicationDomainId: string;
    const fromAssetsApplicationDomainName: string = epAsyncApiDocument.getUnprefixedAssetsApplicationDomainName();
    let fromAssetsApplicationDomainId: string | undefined;
    const toAssetsApplicationDomainName: string = epAsyncApiDocument.getAssetsApplicationDomainName();
    let toAssetsApplicationDomainId: string | undefined;

    const fromApplicationDomain: ApplicationDomain | undefined = await EpSdkApplicationDomainsService.getByName({
      applicationDomainName: fromApplicationDomainName,
    });
    if (fromApplicationDomain !== undefined) {
      /* istanbul ignore next */
      if (fromApplicationDomain.id === undefined) throw new CliEPApiContentError(logName, "fromApplicationDomain.id === undefined", {
        fromApplicationDomain: fromApplicationDomain,
      });
      fromApplicationDomainId = fromApplicationDomain.id;
      if (fromAssetsApplicationDomainName !== fromApplicationDomainName) {
        const fromAssetsApplicationDomain: ApplicationDomain | undefined = await EpSdkApplicationDomainsService.getByName({
          applicationDomainName: fromAssetsApplicationDomainName,
        });
        fromAssetsApplicationDomainId = fromAssetsApplicationDomain?.id;
      }
      // create the to application domain
      const toApplicationDomainsTask = new EpSdkApplicationDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainName: toApplicationDomainName,
        applicationDomainSettings: {},
      });
      const toEpSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await toApplicationDomainsTask.execute();
      /* istanbul ignore next */
      if (toEpSdkApplicationDomainTask_ExecuteReturn.epObject.id === undefined) throw new CliEPApiContentError(logName, "toEpSdkApplicationDomainTask_ExecuteReturn.epObject.id === undefined", {
        applicationDomainObject: toEpSdkApplicationDomainTask_ExecuteReturn.epObject,
      });
      toApplicationDomainId = toEpSdkApplicationDomainTask_ExecuteReturn.epObject.id;
      const toAssetsApplicationDomainsTask = new EpSdkApplicationDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainName: toAssetsApplicationDomainName,
        applicationDomainSettings: {},
      });
      const toAssetsEpSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await toAssetsApplicationDomainsTask.execute();
      /* istanbul ignore next */
      if(toAssetsEpSdkApplicationDomainTask_ExecuteReturn.epObject.id === undefined) throw new CliEPApiContentError(logName, "toAssetsEpSdkApplicationDomainTask_ExecuteReturn.epObject.id === undefined", {
        applicationDomainObject: toAssetsEpSdkApplicationDomainTask_ExecuteReturn.epObject
      });
      toAssetsApplicationDomainId = toAssetsEpSdkApplicationDomainTask_ExecuteReturn.epObject.id;

      const applicationVersion: ApplicationVersion | undefined = await EpSdkApplicationVersionsService.deepCopyLastestVersionById_IfNotExists({
        applicationName: epAsyncApiDocument.getTitle(),
        fromApplicationDomainId: fromApplicationDomainId,
        toApplicationDomainId: toApplicationDomainId,
        fromAssetsApplicationDomainId: fromAssetsApplicationDomainId,
        toAssetsApplicationDomainId: toAssetsApplicationDomainId,
      });
      if (applicationVersion !== undefined) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };
}

export default new CliAppsService();
