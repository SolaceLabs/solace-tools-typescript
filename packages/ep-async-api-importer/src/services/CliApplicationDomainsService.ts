import { ApplicationDomain } from "@solace-labs/ep-openapi-node";
import { EpSdkApplicationDomainsService } from "@solace-labs/ep-sdk";

class CliApplicationDomainsService {
  public absent_ApplicationDomains = async ({
    applicationDomainNameList,
  }: {
    applicationDomainNameList: Array<string>;
  }): Promise<void> => {
    for (const applicationDomainName of applicationDomainNameList) {
      try {
        const applicationDomain: ApplicationDomain = await EpSdkApplicationDomainsService.deleteByName({
          applicationDomainName: applicationDomainName,
        });
        /* istanbul ignore next */
        applicationDomain;
      } catch (e) {
        // may already have been deleted, do nothing
      }
    }
  };
}

export default new CliApplicationDomainsService();
