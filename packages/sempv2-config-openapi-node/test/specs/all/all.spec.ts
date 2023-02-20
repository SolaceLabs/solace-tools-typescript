import 'mocha';
import { expect } from 'chai';
import path from 'path';
import {
  TestContext,
} from '@internal/tools/src';
import { 
  TestLogger 
} from '../../lib';
import {
  AllService,
  ApiError,
  BrokerResponse, 
} from '../../../generated-src';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");


describe(`${scriptName}`, () => {
    
    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: should get broker object`, async () => {
      try {
        const brokerResponse: BrokerResponse = await AllService.getBroker({ 
          xContextId: 'xContextId' 
        });
        expect(brokerResponse.data, TestLogger.createApiTestFailMessage('failed')).to.not.be.undefined;
        // DEBUG:
        expect(false, TestLogger.createLogMessage('brokerResponse', brokerResponse)).to.be.true;
      } catch(e) {
        expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
        const apiError: ApiError = e;
        expect(apiError.status, TestLogger.createApiTestFailMessage('failed', apiError)).to.equal(400);
        // expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      }
    });

});

