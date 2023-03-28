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
  EventMeshesResponse,
  EventMeshesService, 
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

  it(`${scriptName}: should get list of event meshes`, async () => {
    try {
      const eventMeshesResponse: EventMeshesResponse = await EventMeshesService.getEventMeshes({
        xContextId: 'xContextId',
        pageSize: 100,
        pageNumber: 1,
        // name,
        // environmentId,
      });
      // DEBUG
      // const message = TestLogger.createLogMessage('debug: eventMeshesResponse', eventMeshesResponse);
      // expect(false, message).to.be.true;
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
    }
  });

});

