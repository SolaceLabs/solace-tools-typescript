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
  ConfigurationTypesResponse, 
  ConfigurationTypesService, 
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

  it(`${scriptName}: should get list of configuration types`, async () => {
    try {
      const configurationTypesResponse: ConfigurationTypesResponse = await ConfigurationTypesService.getConfigurationTypes({
        xContextId: 'xContextId',
        pageNumber: 1,
        pageSize: 100,
        // ids,
        // names,
        // associatedEntityTypes,
        // brokerType,
        // sort,
      });
      // DEBUG
      // const message = TestLogger.createLogMessage('debug: configurationTypesResponse', configurationTypesResponse);
      // expect(false, message).to.be.true;
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
    }
  });

});

