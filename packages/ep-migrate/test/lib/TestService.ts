import { 
  EpSdkApplicationDomainsService, 
} from "@solace-labs/ep-sdk";
import { 
  ApplicationDomainsResponse 
} from "@solace-labs/ep-openapi-node";

export class TestService {

  public static absent_EpV2_PrefixedApplicationDomains = async(prefix: string): Promise<void> => {
    if(prefix.length < 2 ) return;
    const applicationDomainsResponse: ApplicationDomainsResponse = await EpSdkApplicationDomainsService.listAll({});

    const absentApplicationDomainNames: Array<string> = [];
    if(applicationDomainsResponse.data) {
      for(const applicationDomain of applicationDomainsResponse.data) {
        if(applicationDomain.name.startsWith(prefix)) absentApplicationDomainNames.push(applicationDomain.name);
      }
    }

    for(const applicationDomainName of absentApplicationDomainNames) {
      await EpSdkApplicationDomainsService.deleteByName({ applicationDomainName});
    }

  }
  
}
