import { expect } from 'chai';
import { 
  ApiError,
  ApplicationDomainsResponse,
  ApplicationDomainsService,
  CustomAttributeDefinitionsResponse,
  CustomAttributeDefinitionsService,
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
        xContextId: 'xContextId',
        name: applicationDomainName,
      });
      if(applicationDomainsResponse.data === undefined) throw new Error(`${logName}: applicationDomainsResponse.data`);
      if(applicationDomainsResponse.data.length > 1) throw new Error(`${logName}: applicationDomainsResponse.data.length > 1`);
      if(applicationDomainsResponse.data.length === 1) {
        const xvoid: void = await ApplicationDomainsService.deleteApplicationDomain({
          xContextId: 'xContextId',
          id: applicationDomainsResponse.data[0].id,
        });  
      }
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
    }
  }

  public static customAttributeDefinitionAbsent = async({ customAttributeDefinitionName }:{ 
    customAttributeDefinitionName?: string; 
  }): Promise<void> => {
    const funcName = 'customAttributeDefinitionAbsent';
    const logName = `${TestHelpers.name}.${funcName}()`;
    try {
      if(customAttributeDefinitionName === undefined) throw new Error(`${logName}: customAttributeDefinitionName === undefined`);
      const customAttributeDefinitionsResponse: CustomAttributeDefinitionsResponse = await CustomAttributeDefinitionsService.getCustomAttributeDefinitions({ pageSize: 100 });
      if(customAttributeDefinitionsResponse.data === undefined) return;
      const found = customAttributeDefinitionsResponse.data.find(x => x.name === customAttributeDefinitionName );
      if(found === undefined) return;
      await CustomAttributeDefinitionsService.deleteCustomAttributeDefinition({ 
        id: found.id,        
      });
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
    }
  }

}