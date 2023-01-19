import "mocha";
import { expect } from "chai";
import path from "path";
import {
  ApplicationDomain,
  EventApisResponse,
  EventApIsService,
  EventsResponse,
  EventsService,
  SchemasResponse,
  SchemasService,
} from "@solace-labs/ep-openapi-node";
import { EpSdkApplicationDomainsService } from "@solace-labs/ep-sdk";
import { TestContext } from "@internal/tools/src";
import {
  TestConfig,
  TestLogger,
  TestService,
  TTestApiSpecRecord,
} from "../lib";
import {
  CliConfig,
  CliError,
  CliRunSummary,
  ICliRunSummary_Base,
  CliImporterManager,
  ECliImporterManagerMode,
  CliErrorFromEpAsyncApiError,
} from "../../src/cli-components";
import { EpAsyncApiBestPracticesError, EpAsyncApiError, EpAsyncApiMessageDocument } from "@solace-labs/ep-asyncapi";

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

// TEST expects only 1 api file, not a list of api files.
let FileList: Array<string> = [];
let AsyncApiSpecFile: string;
let AsyncApiSpecFile_X_EpApplicationDomainName: string;
let AsyncApiSpecFile_X_EpAssetApplicationDomainName: string;

const initializeGlobals = () => {
  AsyncApiSpecFile = TestService.validateFilePathWithReadPermission(`${TestConfig.getConfig().dataRootDir}/best-practices/message-no-schema.spec.yml`);
  FileList.push(AsyncApiSpecFile);
  // set test specific importer options
  CliConfig.getCliImporterManagerOptions().asyncApiFileList = FileList;
  CliConfig.getCliImporterManagerOptions().cliImporterManagerMode = ECliImporterManagerMode.RELEASE_MODE;
  // CliConfig.getCliImporterManagerOptions().runId = scriptName;
  // // DEBUG
  // CliConfig.getCliImporterManagerOptions().cliImporterManagerMode = ECliImporterManagerMode.TEST_MODE_KEEP;
  // CliConfig.getCliImporterManagerOptions().applicationDomainName = 'release_mode';
  CliConfig.getCliImporterManagerOptions().createEventApiApplication = false;
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
    let err: Error | undefined = undefined;
    try {
      // test ep assets & versions are correctly imported as in epAsyncApiDocument
      const pass: boolean = await TestService.checkAssetsCreatedAsExpected();
      expect(pass, `${scriptName}: AFTER checks not passed`).to.be.true;
    } catch (e) {
      err = e;
    } finally {
      // ensure all app domains are absent
      const xvoid: void = await TestService.absent_ApplicationDomains(CliConfig.getCliImporterManagerOptions().cliImporterManagerMode === ECliImporterManagerMode.TEST_MODE_KEEP);
    }
    expect(err, TestLogger.createNotCliErrorMesssage(JSON.stringify(err))).to.be.undefined;
  });

  it(`${scriptName}: should import spec with validate best practices ON`, async () => {
    try {
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliValidateApiSpecBestPractices = true;
      const cliImporter = new CliImporterManager(CliConfig.getCliImporterManagerOptions());
      const xvoid: void = await cliImporter.run();
      expect(false, 'should never get here').to.be.true;
    } catch (e) {
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
