import 'mocha';
import { expect } from 'chai';
import path from 'path';
import {
  TestContext,
} from '@internal/tools/src';
import {
  ApiMeta,
  TestLogger 
} from '../lib';
import {
  ApiError, 
  ApplicationDomain, 
  ApplicationDomainsResponse, 
  ApplicationDomainsService
} from '../../generated-src';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

describe(`${scriptName}`, () => {
    
    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: should list all application domains`, async () => {
      try {
        const completeApplicationDomains: Array<ApplicationDomain> = [];
        let nextPage: number | null = 1;
        while (nextPage !== null) {
          const applicationDomainsResponse: ApplicationDomainsResponse = await ApplicationDomainsService.list12({
            xContextId: 'xContextId',
            pageNumber: nextPage,
            pageSize: 10
          });  
          if(applicationDomainsResponse.data) {
            completeApplicationDomains.push(...applicationDomainsResponse.data);
          }
          if(applicationDomainsResponse.meta) {
            const apiMeta = applicationDomainsResponse.meta as ApiMeta;
            nextPage = apiMeta.pagination.nextPage;
            // console.log(`applicationDomainsResponse.meta = ${JSON.stringify(applicationDomainsResponse.meta, null, 2)}`);
          } else {
            nextPage = null;
          }
        }
        // // DEBUG
        // expect(false, TestLogger.createLogMessage('completeApplicationDomains', completeApplicationDomains)).to.be.true;
      } catch(e) {
        expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
        expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
      }
    });

});

