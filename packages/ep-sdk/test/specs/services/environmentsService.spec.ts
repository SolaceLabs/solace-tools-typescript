import "mocha";
import { expect } from "chai";
import path from "path";
import {
  ApiError,
  Environment,
  EnvironmentsResponse,
} from "@solace-labs/ep-openapi-node";
import { TestContext, TestUtils } from "@internal/tools/src";
import { TestLogger } from "../../lib";
import {
  EpSdkError,
  EpSdkEnvironmentsService,
} from "../../../src";

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId: string = TestUtils.getUUID();

const initializeGlobals = () => {
};

describe(`${scriptName}`, () => {
  before(async () => {
    TestContext.newItId();
    initializeGlobals();
  });

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async () => {
    TestContext.newItId();
  });

  it(`${scriptName}: should list all environments`, async () => {
    try {
      const environmentsResponse: EnvironmentsResponse = await EpSdkEnvironmentsService.listAll({ pageSize: 1 });
      const message = `environmentsResponse=\n${JSON.stringify(environmentsResponse, null, 2 )}`;
      expect(environmentsResponse.meta.pagination.count, TestLogger.createApiTestFailMessage(message)).to.be.greaterThanOrEqual(1);
      expect(environmentsResponse.data, TestLogger.createApiTestFailMessage(message)).to.not.be.undefined;
      expect(environmentsResponse.data.length, TestLogger.createApiTestFailMessage(message)).to.be.greaterThanOrEqual(1);
      // // DEBUG
      // expect(false, TestLogger.createApiTestFailMessage(message)).to.be.true;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should get each environment by Id`, async () => {
    try {
      const environmentsResponse: EnvironmentsResponse = await EpSdkEnvironmentsService.listAll({});
      if(environmentsResponse.data === undefined) throw new Error('environmentsResponse.data === undefined');
      for(const environment of environmentsResponse.data) {
        const env: Environment = await EpSdkEnvironmentsService.getById({ environmentId: environment.id });        
      }
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

});
