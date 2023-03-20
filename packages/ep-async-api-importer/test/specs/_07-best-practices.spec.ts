import "mocha";
import { expect } from "chai";
import path from "path";
import { TestContext, TestUtils } from "@internal/tools/src";
import {
  TestConfig,
  TestLogger,
  TestService,
} from "../lib";
import {
  CliConfig,
  CliError,
  CliImporterManager,
  ECliImporterManagerMode,
  CliErrorFromEpAsyncApiError,
} from "../../src/cli-components";
import { 
  EpAsyncApiBestPracticesError, 
  EpAsyncApiError, 
  EpAsyncApiMessageDocument 
} from "@solace-labs/ep-asyncapi";
import { EEpSdkTask_TargetState } from "@solace-labs/ep-sdk";

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId = TestUtils.getUUID();

// TEST expects only 1 api file, not a list of api files.
let FileList: Array<string> = [];
let AsyncApiSpecFile: string;
let ApplicationDomainName: string;

const initializeGlobals = () => {
  ApplicationDomainName = `${TestConfig.getAppId()}/${TestSpecName}`;
  AsyncApiSpecFile = TestService.validateFilePathWithReadPermission(`${TestConfig.getConfig().dataRootDir}/best-practices/message-no-schema.spec.yml`);
  FileList.push(AsyncApiSpecFile);
  // set test specific importer options
  CliConfig.getCliImporterManagerOptions().asyncApiFileList = FileList;
  CliConfig.getCliImporterManagerOptions().cliImporterManagerMode = ECliImporterManagerMode.RELEASE_MODE;
  CliConfig.getCliImporterManagerOptions().applicationDomainName = ApplicationDomainName;
  CliConfig.getCliImporterManagerOptions().assetApplicationDomainName = undefined;
  // CliConfig.getCliImporterManagerOptions().runId = scriptName;
  // // DEBUG
  // CliConfig.getCliImporterManagerOptions().cliImporterManagerMode = ECliImporterManagerMode.TEST_MODE_KEEP;
  // CliConfig.getCliImporterManagerOptions().applicationDomainName = 'release_mode';
  CliConfig.getCliImporterManagerOptions().createApiApplication = false;
  CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliAssetImport_BrokerType = undefined;
  CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliAssetImport_ChannelDelimiter = undefined;
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
    await TestService.applicationDomainTask({ scriptName, applicationDomainName: ApplicationDomainName, epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT});
  });

  it(`${scriptName}: should import spec with validate best practices ON`, async () => {
    try {
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliValidateApiSpecBestPractices = true;
      const cliImporter = new CliImporterManager(CliConfig.getCliImporterManagerOptions());
      const xvoid: void = await cliImporter.run();
      expect(false, 'should never get here').to.be.true;
    } catch (e) {
      // console.log(`e = ${JSON.stringify(e, null, 2)}`);
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(e instanceof CliErrorFromEpAsyncApiError, TestLogger.createWrongCliErrorInstance(CliErrorFromEpAsyncApiError.name, e)).to.be.true;
      const cliErrorFromEpAsyncApiError: CliErrorFromEpAsyncApiError = e;
      const epAsyncApiError: EpAsyncApiError = cliErrorFromEpAsyncApiError.epAsyncApiError;
      expect(epAsyncApiError, TestLogger.createWrongCliErrorInstance(EpAsyncApiError.name, e)).to.not.be.undefined;
      expect(epAsyncApiError instanceof EpAsyncApiBestPracticesError, TestLogger.createWrongCliErrorInstance(EpAsyncApiBestPracticesError.name, e)).to.be.true;

      const epAsyncApiBestPracticesError: EpAsyncApiBestPracticesError = epAsyncApiError as EpAsyncApiBestPracticesError;
      const details = epAsyncApiBestPracticesError.details;
      expect(details.issues, TestLogger.createTestFailMessage(JSON.stringify(epAsyncApiBestPracticesError.details, null, 2))).to.equal(EpAsyncApiMessageDocument.MissingMessagePayloadSchemaIssue);
      expect(details.value.channel, TestLogger.createTestFailMessage(JSON.stringify(epAsyncApiBestPracticesError.details, null, 2))).to.not.be.undefined;
      expect(details.value.message, TestLogger.createTestFailMessage(JSON.stringify(epAsyncApiBestPracticesError.details, null, 2))).to.not.be.undefined;
    }
  });

  it(`${scriptName}: should import spec with validate best practices OFF`, async () => {
    try {
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliValidateApiSpecBestPractices = false;
      const cliImporter = new CliImporterManager(CliConfig.getCliImporterManagerOptions());
      const xvoid: void = await cliImporter.run();
      // // DEBUG
      // expect(false, 'should never get here').to.be.true;
    } catch (e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError("failed", e)).to.be.true;
    }
  });

});
