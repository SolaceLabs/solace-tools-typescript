import "mocha";
import { expect } from 'chai';
import path from 'path';
import { 
  OpenAPI 
} from '@rjgu/ep-openapi-node';
import {
  EpSdkClient, 
  EpSdkConfig, 
  EpSdkConsoleLogger, 
  EpSdkLogger
}from '@rjgu/ep-sdk';
import { 
  TestContext 
} from "@internal/tools/src";
import { 
  TestConfig, TestLogger 
} from "./lib";
import { 
  CliConfig,
  CliLogger,
  CliError
 }  from "../src/cli-components";

// ensure any unhandled exception cause exit = 1
function onUncaught(err: any){
  console.log(err);
  process.exit(1);
}
process.on('unhandledRejection', onUncaught);
// // this does not catch ctrl-c
// async function onExit() {
//   console.log('onExit: delete all application domains');
//   const xvoid: void = await TestServices.absent_ApplicationDomains();
//   console.log('onExit: done');
//   process.exit(1);
// }
// process.on('exit', onExit);

const scriptName: string = path.basename(__filename);
const scriptDir: string = path.dirname(__filename);

TestLogger.setLogging(true);
TestLogger.logMessage(scriptName, ">>> initializing ...");

before(async() => {
  TestContext.newItId();
});

after(async() => {
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
        TestConfig.init( { scriptDir: scriptDir });
        const epSdkConsoleLogger: EpSdkConsoleLogger = new EpSdkConsoleLogger(TestConfig.getAppId(), TestConfig.getConfig().epSdkLogLevel);
        EpSdkLogger.initialize({ epSdkLoggerInstance: epSdkConsoleLogger });
        EpSdkConfig.initialize(TestConfig.getAppId());
        console.log(TestLogger.createLogMessage('TestConfig', {
          TestConfig: TestConfig.getConfig()
        }));  
      } catch (e) {
        expect(false, TestLogger.createTestFailMessageForError('intitializing test config failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should initialize cli & ep client`, async () => {
      try {
        CliConfig.validate_CliConfigEnvVarConfigList();
        CliLogger.initialize({ cliLoggerOptions: CliConfig.getDefaultLoggerOptions() });
        CliConfig.initialize({
          defaultAppName: TestConfig.getAppId(),
          fileList: [],
        });
        if(TestConfig.isCi()) CliConfig.getCliLoggerOptions().logSummary2Console = false;
        CliLogger.initialize({ cliLoggerOptions: CliConfig.getCliLoggerOptions() });
        CliConfig.logConfig();
        EpSdkClient.initialize({
          globalOpenAPI: OpenAPI,
          token: CliConfig.getSolaceCloudToken(),
          baseUrl: CliConfig.getEpApiBaseUrl()
        });
        // DEBUG
        // expect(false, TestLogger.createLogMessage('OpenApi', OpenAPI )).to.be.true;
      } catch (e) {
        expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
        expect(false, TestLogger.createTestFailMessageWithCliError('failed', e)).to.be.true;
      }

    });

  });
});

