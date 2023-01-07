import 'mocha';
import { expect } from 'chai';
import path from 'path';
import {
  TestContext,
} from '@internal/tools/src';
import { TestLogger } from '../../lib';
import {
  AboutApiResponse,
  AboutService,
  ApiError,
} from '../../../generated-src';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");


describe(`${scriptName}`, () => {
    
    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: should get about api`, async () => {
      try {
        const aboutApiResponse: AboutApiResponse = await AboutService.getAboutApi({});
        expect(aboutApiResponse.data, TestLogger.createApiTestFailMessage('failed')).to.not.be.undefined;
        // // DEBUG:
        // expect(false, TestLogger.createLogMessage('aboutApiResponse', aboutApiResponse)).to.be.true;
      } catch(e) {
        expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
        expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
      }
    });

});

