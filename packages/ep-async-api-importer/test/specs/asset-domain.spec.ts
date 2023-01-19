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
} from "../../src/cli-components";

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

// TEST expects only 1 api file, not a list of api files.
let FileList: Array<string> = [];
let AsyncApiSpecFile: string;
let AsyncApiSpecFile_X_EpApplicationDomainName: string;
let AsyncApiSpecFile_X_EpAssetApplicationDomainName: string;

const initializeGlobals = () => {
  AsyncApiSpecFile = TestService.validateFilePathWithReadPermission(`${TestConfig.getConfig().dataRootDir}/individual-tests/asset-domain/asset-domain-1.spec.yml`);
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
    //parse all specs
    try {
      const testApiSpecRecordList: Array<TTestApiSpecRecord> =
        await TestService.createTestApiSpecRecordList({
          apiFileList: FileList,
          overrideApplicationDomainName: CliConfig.getCliImporterManagerOptions().applicationDomainName,
          overrideAssetApplicationDomainName: CliConfig.getCliImporterManagerOptions().assetApplicationDomainName,
          // prefixApplicationDomainName: CliImporterManager.createApplicationDomainPrefix({
          //   appName: CliConfig.getCliImporterManagerOptions().appName,
          //   runId: CliConfig.getCliImporterManagerOptions().runId
          // })
          overrideBrokerType: CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliAssetImport_BrokerType,
          overrideChannelDelimiter: CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliAssetImport_ChannelDelimiter,
          validateBestPractices: CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliValidateApiSpecBestPractices
        });
      // ensure all app domains are absent
      const xvoid: void = await TestService.absent_ApplicationDomains(false);
      expect(testApiSpecRecordList.length, "expecting only 1 api file").to.equal(1);
      AsyncApiSpecFile_X_EpApplicationDomainName = testApiSpecRecordList[0].epAsyncApiDocument.getApplicationDomainName();
      AsyncApiSpecFile_X_EpAssetApplicationDomainName = testApiSpecRecordList[0].epAsyncApiDocument.getAssetsApplicationDomainName();
    } catch (e) {
      expect( e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError("failed", e)).to.be.true;
    }
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

  it(`${scriptName}: should import spec`, async () => {
    try {
      const cliImporter = new CliImporterManager(
        CliConfig.getCliImporterManagerOptions()
      );
      const xvoid: void = await cliImporter.run();
      const cliRunSummaryList: Array<ICliRunSummary_Base> =
        CliRunSummary.getSummaryLogList();
      // DEBUG
      // expect(false, JSON.stringify(cliRunSummaryList, null, 2)).to.be.true;
    } catch (e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: check app domains`, async () => {
    try {
      // check api app domain
      const applicationDomain: ApplicationDomain =
        await EpSdkApplicationDomainsService.getByName({
          applicationDomainName: AsyncApiSpecFile_X_EpApplicationDomainName,
        });
      const eventApisResponse: EventApisResponse =
        await EventApIsService.getEventApis({
          applicationDomainId: applicationDomain.id,
        });
      let message = `eventApisResponse=${JSON.stringify(
        eventApisResponse,
        null,
        2
      )}`;
      expect(eventApisResponse.data.length, message).to.equal(1);
      let eventsResponse: EventsResponse = await EventsService.getEvents({
        applicationDomainId: applicationDomain.id,
      });
      message = `eventsResponse=${JSON.stringify(eventsResponse, null, 2)}`;
      expect(eventsResponse.data.length, message).to.equal(0);
      let schemasResponse: SchemasResponse = await SchemasService.getSchemas({
        applicationDomainId: applicationDomain.id,
      });
      message = `schemasResponse=${JSON.stringify(schemasResponse, null, 2)}`;
      expect(schemasResponse.data.length, message).to.equal(0);

      // check asset app domain
      const assetApplicationDomain: ApplicationDomain =
        await EpSdkApplicationDomainsService.getByName({
          applicationDomainName:
            AsyncApiSpecFile_X_EpAssetApplicationDomainName,
        });
      eventsResponse = await EventsService.getEvents({
        applicationDomainId: assetApplicationDomain.id,
      });
      message = `eventsResponse=${JSON.stringify(eventsResponse, null, 2)}`;
      expect(eventsResponse.data.length, message).to.equal(2);
      schemasResponse = await SchemasService.getSchemas({
        applicationDomainId: assetApplicationDomain.id,
      });
      message = `schemasResponse=${JSON.stringify(schemasResponse, null, 2)}`;
      expect(schemasResponse.data.length, message).to.equal(2);
    } catch (e) {
      expect(
        e instanceof CliError,
        TestLogger.createNotCliErrorMesssage(e.message)
      ).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError("failed", e))
        .to.be.true;
    }
  });
});
