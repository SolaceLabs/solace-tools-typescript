import { 
  EpSdkApplicationDomainsService, 
  EpSdkTopicDomainsService, 
} from "@solace-labs/ep-sdk";
import { 
  ApplicationDomainsResponse, 
  TopicDomainsResponse, 
  TopicDomainsService 
} from "@solace-labs/ep-openapi-node";
import { CliRunIssues, ICliRunIssue } from "../../src/cli-components";
import { TestLogger } from "./TestLogger";
import { expect } from "chai";

export class TestService {

  private static deleteApplicationDomain = async({ applicationDomainName }:{
    applicationDomainName: string;
  }): Promise<void> => {
    try {
      const applicationDomain = await EpSdkApplicationDomainsService.getByName({ applicationDomainName });
      if(applicationDomain !== undefined) {
        if(applicationDomain.id === undefined) throw new Error('applicationDomain.id === undefined');
        // does it have topicDomains? delete these too
        const topicDomainsResponse: TopicDomainsResponse = await EpSdkTopicDomainsService.listAll({ applicationDomainId: applicationDomain.id });
        for(const topicDomain of topicDomainsResponse.data) { await TopicDomainsService.deleteTopicDomain({ id: topicDomain.id }); }
        await EpSdkApplicationDomainsService.deleteByName({ applicationDomainName});  
      }
    } catch(e) {
    }
  }

  public static absent_EpV2_PrefixedApplicationDomains = async(prefix: string): Promise<void> => {
    if(prefix.length < 2 ) return;
    const applicationDomainsResponse: ApplicationDomainsResponse = await EpSdkApplicationDomainsService.listAll({});
    const absentApplicationDomainNames: Array<string> = [];
    if(applicationDomainsResponse.data) {
      for(const applicationDomain of applicationDomainsResponse.data) {
        if(applicationDomain.name.startsWith(prefix)) absentApplicationDomainNames.push(applicationDomain.name);
      }
    }
    // first pass
    for(const applicationDomainName of absentApplicationDomainNames) { await TestService.deleteApplicationDomain({ applicationDomainName }); }
    // second pass
    for(const applicationDomainName of absentApplicationDomainNames) { await TestService.deleteApplicationDomain({ applicationDomainName }); }
    // third pass
    for(const applicationDomainName of absentApplicationDomainNames) { await TestService.deleteApplicationDomain({ applicationDomainName }); }
  }

  public static testRunIssues = () => {
    const cliRunIssues: Array<ICliRunIssue> = CliRunIssues.get({});
    const message = TestLogger.createLogMessage("cliRunIssues", {
      count: cliRunIssues.length,
      cliRunIssues
    });
    expect(cliRunIssues.length, message).to.equal(0);
  }
  
}
