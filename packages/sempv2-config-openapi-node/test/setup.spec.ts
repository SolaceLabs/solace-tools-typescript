import "mocha";
import path from 'path';
import { expect } from 'chai';
import {
  TestContext,
} from '@internal/tools/src';
import { 
  TestConfig,
  TestLogger
} from "./lib";
import { OpenAPI } from '../generated-src';


// load test stub
const x = require('./lib/TestStub');

// ensure any unhandled exception cause exit = 1
function onUncaught(err: any){
  console.log(err);
  process.exit(1);
}
process.on('unhandledRejection', onUncaught);

const scriptName: string = path.basename(__filename);
const scriptDir: string = path.dirname(__filename);

TestLogger.setLogging(true);
TestLogger.logMessage(scriptName, ">>> initializing ...");

describe(`${scriptName}`, () => {
  context(`${scriptName}`, () => {

    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: should initialize test config`, async () => {
      TestConfig.initialize();
    });

    it(`${scriptName}: should initialize OpenAPI client`, async () => {
      try{
        const base: URL = new URL(TestConfig.getConfig().apiBaseUrl);
      } catch(e) {
        expect(false, TestLogger.createLogMessage('invalid apiBaseUrl', {
          apiBaseUrl: TestConfig.getConfig().apiBaseUrl
        })).to.be.true;
      }

      try {
        OpenAPI.BASE = TestConfig.getConfig().apiBaseUrl;
        // OpenAPI.WITH_CREDENTIALS = true;
        // OpenAPI.CREDENTIALS = "include";
        OpenAPI.USERNAME = TestConfig.getConfig().username;
        OpenAPI.PASSWORD = TestConfig.getConfig().password;

        const _log = {
          ...OpenAPI,
          PASSWORD: "***"
        };

        console.log(TestLogger.createLogMessage('OpenApi Config', _log));

      } catch (e) {
        expect(false, TestLogger.createTestFailMessageForError('initializing sempv2 client failed', e)).to.be.true;
      }
    });

  });
});
