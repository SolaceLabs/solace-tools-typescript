import 'mocha';
import { expect } from 'chai';
import path from 'path';
import {
  TestContext,
  TestUtils
} from '@internal/tools/src';
import {
  TestConfig,
  TestLogger 
} from '../../lib';
import {
  ApiError, 
  ApplicationDomainResponse, 
  ApplicationDomainsService
} from '../../../generated-src';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");


const ApplicationDomainName = `${TestConfig.getAppId()}/ep-openapi/${TestUtils.getUUID()}`;
let ApplicationDomainId: string;

describe(`${scriptName}`, () => {
    
    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: should create application domain`, async () => {
      try {
        const applicationDomainResponse: ApplicationDomainResponse = await ApplicationDomainsService.createApplicationDomain({
          xContextId: 'xContextId',
          requestBody: {
            name: ApplicationDomainName,
          }
        });
        expect(applicationDomainResponse.data.id, TestLogger.createApiTestFailMessage('failed')).to.not.be.undefined;
        ApplicationDomainId = applicationDomainResponse.data.id;
      } catch(e) {
        expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
        expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should delete application domain`, async () => {
      try {
        const xvoid: void = await ApplicationDomainsService.deleteApplicationDomain({
          xContextId: 'xContextId',
          id: ApplicationDomainId
        });
      } catch(e) {
        expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
        expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
      }
    });

});

