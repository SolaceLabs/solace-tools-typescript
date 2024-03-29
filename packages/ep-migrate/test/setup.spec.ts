import "mocha";
import { expect } from "chai";
import path from "path";
import { OpenAPI as EpV2OpenApi} from "@solace-labs/ep-openapi-node";
import { OpenAPI as EpV2RtOpenApi} from "@solace-labs/ep-rt-openapi-node";
import { OpenAPI as EpV1OpenApi } from "@solace-labs/ep-v1-openapi-node";
import {
  EEpSdkLogLevel,
  EpSdkClient,
  EpSdkConfig,
  EpSdkConsoleLogger,
  EpSdkLogger,
} from "@solace-labs/ep-sdk";
import { TestContext } from "@internal/tools/src";
import { TestConfig, TestLogger } from "./lib";
import { 
  CliConfig, 
  CliLogger, 
  CliError, 
  ECliMigrateManagerRunState 
} from "../src/cli-components";
import { packageJson } from "../src/constants";
import { CliEpV1Client } from "../src/cli-components/CliEpV1Client";



// ensure any unhandled exception cause exit = 1
function onUncaught(err: any) {
  console.log(err);
  process.exit(1);
}
process.on("unhandledRejection", onUncaught);
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
          EEpSdkLogLevel.Silent
        );
        EpSdkLogger.initialize({ epSdkLoggerInstance: epSdkConsoleLogger });
        EpSdkConfig.initialize(TestConfig.getAppId());
        console.log(TestLogger.createLogMessage("TestConfig", {
          TestConfig: TestConfig.getConfig(),
        }));
      } catch (e) {
        expect(false, TestLogger.createTestFailMessageForError("intitializing test config failed", e)).to.be.true;
      }
    });

    it(`${scriptName}: should initialize cli & ep client`, async () => {
      try {
        CliLogger.initialize({cliLoggerOptions: CliConfig.getDefaultLoggerOptions()});
        CliConfig.initialize({
          cliVersion: packageJson.version,
          commandLineOptionValues: {},
          configFile: TestConfig.getConfig().configFile,
          runState: ECliMigrateManagerRunState.PRESENT
        });
        if(TestConfig.isCi()) {
          CliConfig.getCliLoggerOptions().logSummary2Console = false;
          CliConfig.getCliLoggerOptions().log2Stdout = false;
        }
        CliLogger.initialize({ cliLoggerOptions: CliConfig.getCliLoggerOptions()});
        CliConfig.logConfig();

        CliEpV1Client.initialize({
          token: CliConfig.getEpV1SolaceCloudToken(),
          globalEpOpenAPI: EpV1OpenApi,
          baseUrl: CliConfig.getEpV1ApiBaseUrl(),
        });
        EpSdkClient.initialize({
          globalEpOpenAPI: EpV2OpenApi,
          globalEpRtOpenAPI: EpV2RtOpenApi,
          token: CliConfig.getEpV2SolaceCloudToken(),
          baseUrl: CliConfig.getEpV2ApiBaseUrl(),
        });
      

        // DEBUG
        // expect(false, TestLogger.createLogMessage('OpenApi', OpenAPI )).to.be.true;
      } catch (e) {
        expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
        expect(false, TestLogger.createTestFailMessageWithCliError("failed", e)).to.be.true;
      }
    });
  });
});
