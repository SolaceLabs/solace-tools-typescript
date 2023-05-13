import { 
  EEpSdkTask_TargetState,
  EpSdkApplicationDomainTask,
  EpSdkApplicationDomainsService, 
  IEpSdkApplicationDomainTask_ExecuteReturn
} from "@solace-labs/ep-sdk";
import { 
  ApplicationDomain, 
  ApplicationDomainsResponse 
} from "@solace-labs/ep-openapi-node";
import { 
  CliInternalCodeInconsistencyError, 
  CliRunContext, 
  CliRunSummary, 
  ICliApplicationDomainRunAbsentContext 
} from "../cli-components";

class CliApplicationDomainsService {

  private async absentApplicationDomain(applicationDomainName: string): Promise<boolean> {
    try {
      const epSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        applicationDomainName,
      });
      const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await epSdkApplicationDomainTask.execute();
      // console.log(`${logName}: deleted applicationDomainName = ${applicationDomainName}`);
      CliRunSummary.absentEpV2ApplicationDomain({ epSdkApplicationDomainTask_ExecuteReturn})
      return true;
    } catch(e) {
      return false;
    }
  }

  public async absent_EpV2_PrefixedApplicationDomains(prefix: string): Promise<void> {
    const funcName = "absent_EpV2_PrefixedApplicationDomains";
    const logName = `${CliApplicationDomainsService.name}.${funcName}()`;
    /* istanbul ignore next */
    if(prefix === undefined || prefix.length < 2) {
      throw new CliInternalCodeInconsistencyError(logName, { message: "invalid prefix",
        prefix: prefix ? prefix : 'undefined' 
      });
    }
    const rctxt: ICliApplicationDomainRunAbsentContext = {
      epV2ApplicationDomainPrefix: prefix
    };
    CliRunContext.push(rctxt);

    const applicationDomainsResponse: ApplicationDomainsResponse = await EpSdkApplicationDomainsService.listAll({});
    const absentApplicationDomains: Array<ApplicationDomain> = [];
    if(applicationDomainsResponse.data) {
      for(const applicationDomain of applicationDomainsResponse.data) {
        if(applicationDomain.name.startsWith(prefix)) {
          absentApplicationDomains.push(applicationDomain);
        }
      }
    }
    CliRunSummary.processingEpV2ApplicationDomainsAbsent({ absentApplicationDomainNames: absentApplicationDomains.map(x => x.name) });

    const applicationDomainNames: Array<string> = absentApplicationDomains.map( x => x.name );
    if(applicationDomainNames.length === 0) {
      CliRunSummary.processingEpV2ApplicationDomainsAbsentNoneFound();
    }
    let pass = 0;
    while(applicationDomainNames.length > 0 && pass < 10) {
      // console.log(`${logName}: pass=${pass}, applicationDomainNames=${JSON.stringify(applicationDomainNames)}`);
      for(let i=0; i < applicationDomainNames.length; i++) {
        const success = await this.absentApplicationDomain(applicationDomainNames[i]);
        if(success) {
          applicationDomainNames.splice(i, 1);
          i--;
        }
      }
      pass++;
    }
    CliRunSummary.processedEpV2ApplicationDomainsAbsent();
    CliRunContext.pop();
  }

}

export default new CliApplicationDomainsService();
