import "mocha";
import path from "path";
import { expect } from "chai";
import { OpenAPI as EpCoreOpenAPI } from "@solace-labs/ep-openapi-node";
import { OpenAPI as EpRtOpenAPI } from "@solace-labs/ep-rt-openapi-node";
import {
  EpSdkClient,
  EpSdkConsoleLogger,
  EpSdkLogger,
  EpSdkConfig,
} from "@solace-labs/ep-sdk";
import { TestContext } from "@internal/tools/src";
import { TestConfig, TestLogger } from "./lib";

// load test stub
const x = require("./lib/TestStubEpCoreOpenApi");

// ensure any unhandled exception cause exit = 1
function onUncaught(err: any) {
  console.log(err);
  process.exit(1);
}
process.on("unhandledRejection", onUncaught);

const scriptName: string = path.basename(__filename);
const scriptDir: string = path.dirname(__filename);

TestLogger.setLogging(true);
TestLogger.logMessage(scriptName, ">>> initializing ...");

before(async () => {
  TestContext.newItId();
});

after(async () => {
  TestContext.newItId();
  // put general cleanup code here if required
});

describe(`${scriptName}`, () => {
  context(`${scriptName}`, () => {
    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: should initialize test config & logger`, async () => {
      try {
        TestConfig.init({ scriptDir: scriptDir });
        const epSdkConsoleLogger: EpSdkConsoleLogger = new EpSdkConsoleLogger(
          TestConfig.getAppId(),
          TestConfig.getConfig().epSdkLogLevel
        );
        EpSdkLogger.initialize({ epSdkLoggerInstance: epSdkConsoleLogger });
        EpSdkConfig.initialize(TestConfig.getAppId());
      } catch (e) {
        expect(false, TestLogger.createTestFailMessageForError("intitializing test config failed",e)).to.be.true;
      }
    });

    it(`${scriptName}: should initialize EP client`, async () => {
      try {
        EpSdkClient.initialize({
          globalEpOpenAPI: EpCoreOpenAPI,
          globalEpRtOpenAPI: EpRtOpenAPI,
          token: TestConfig.getSolaceCloudToken(),
          baseUrl: TestConfig.getConfig().apiBaseUrl,
        });
      } catch (e) {
        expect(false, TestLogger.createTestFailMessageForError("initializing ep client", e)).to.be.true;
      }
    });
  });
});
