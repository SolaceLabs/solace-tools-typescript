import 'mocha';
import { expect } from 'chai';
import path from 'path';
import {
  TestContext,
  TestUtils
} from '@internal/tools/src';
import {
  TestLogger,
} from '../../lib';
import { 
  ApiError, 
  EnvironmentsResponse, 
  EnvironmentsService, 
} from '../../../generated-src';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId = TestUtils.getUUID();

const initializeGlobals = () => {}

describe(`${scriptName}`, () => {

  before(async() => {
    TestContext.newItId();
    initializeGlobals();
    // const xvoid: void = await TestHelpers.applicationDomainAbsent({ applicationDomainName: ApplicationDomainName });
  });

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async() => {
    TestContext.newItId();
    // const xvoid: void = await TestHelpers.applicationDomainAbsent({ applicationDomainName: ApplicationDomainName });
  });

  it(`${scriptName}: should get list of environments`, async () => {
    try {
      const environmentsResponse: EnvironmentsResponse = await EnvironmentsService.getEnvironments({
        xContextId: 'xContextId',
        pageSize: 100,
        pageNumber: 1,
      });
      // DEBUG
      // const message = TestLogger.createLogMessage('debug: environmentsResponse', environmentsResponse);
      // expect(false, message).to.be.true;
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
    }
  });

});

