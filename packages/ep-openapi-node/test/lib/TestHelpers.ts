import { expect } from 'chai';
import { 
  ApiError,
  ApplicationDomainsResponse,
  ApplicationDomainsService,
} from '../../generated-src';
import { TestLogger } from './TestLogger';

export class TestHelpers {

  public static applicationDomainAbsent = async({ applicationDomainName }:{
    applicationDomainName: string;
  }): Promise<void> => {
    const funcName = 'applicationDomainAbsent';
    const logName = `${TestHelpers.name}.${funcName}()`;
    try {
      const applicationDomainsResponse: ApplicationDomainsResponse = await ApplicationDomainsService.getApplicationDomains({
        name: applicationDomainName,
      });
      if(applicationDomainsResponse.data === undefined) throw new Error(`${logName}: applicationDomainsResponse.data`);
      if(applicationDomainsResponse.data.length > 1) throw new Error(`${logName}: applicationDomainsResponse.data.length > 1`);
      if(applicationDomainsResponse.data.length === 1) {
        const xvoid: void = await ApplicationDomainsService.deleteApplicationDomain({
          id: applicationDomainsResponse.data[0].id,
        });  
      }
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
    }
  }

}