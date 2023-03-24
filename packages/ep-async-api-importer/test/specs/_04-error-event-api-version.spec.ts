import "mocha";
import { expect } from "chai";
import path from "path";
import {
  ApplicationDomain,
  EventApiVersion,
} from "@solace-labs/ep-openapi-node";
import { EpAsyncApiDocument } from "@solace-labs/ep-asyncapi";
import {
  EEpSdkTask_Action,
  EpSdkApplicationDomainsService,
  EpSdkEventApiVersionsService,
  EpSdkSemVerUtils,
  EEpSdk_VersionStrategy,
} from "@solace-labs/ep-sdk";
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
  CliImporterTestRunAssetsInconsistencyError,
  CliRunSummary,
  ECliRunSummary_Type,
  ICliRunSummary_Base,
  ICliRunSummary_Task_VersionObject,
  CliImporterManager,
  ECliImporterManagerMode,
  CliUtils,
} from "../../src/cli-components";

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

let FileList: Array<string> = [];

const initializeGlobals = () => {
  FileList.push(
    ...CliUtils.createFileList(
      `${
        TestConfig.getConfig().dataRootDir
      }/single-tests/warning-event-api-version.spec.yml`
    )
  );
  // set test specific importer options
  CliConfig.getCliImporterManagerOptions().asyncApiFileList = FileList;
  CliConfig.getCliImporterManagerOptions().cliImporterManagerMode = ECliImporterManagerMode.RELEASE_MODE;
  CliConfig.getCliImporterManagerOptions().applicationDomainName = undefined;
  CliConfig.getCliImporterManagerOptions().assetApplicationDomainName = undefined;
  CliConfig.getCliImporterManagerOptions().cliTestSetupDomainsForApis = true;
  CliConfig.getCliImporterManagerOptions().createApiApplication = false;
  CliConfig.validateConfig();
};

describe(`${scriptName}`, () => {
  before(async () => {
    TestContext.newItId();
    initializeGlobals();
    //parse all specs
    try {
      const testApiSpecRecordList: Array<TTestApiSpecRecord> = await TestService.createTestApiSpecRecordList({
        apiFileList: FileList,
        overrideApplicationDomainName: CliConfig.getCliImporterManagerOptions().applicationDomainName,
        overrideAssetApplicationDomainName: CliConfig.getCliImporterManagerOptions().assetApplicationDomainName,
        overrideBrokerType: CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliAssetImport_BrokerType,
        overrideChannelDelimiter: CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliAssetImport_ChannelDelimiter,  
        validateBestPractices: CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliValidateApiSpecBestPractices
      });
      // ensure all app domains are absent
      const xvoid: void = await TestService.absent_ApplicationDomains(false);
    } catch (e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
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
      const xvoid: void = await TestService.absent_ApplicationDomains(CliConfig.getCliImporterManagerOptions().cliImporterManagerMode === ECliImporterManagerMode.TEST_MODE_KEEP);
    }
    expect(err, TestLogger.createNotCliErrorMesssage(JSON.stringify(err))).to.be.undefined;
  });

  it(`${scriptName}: should import specs`, async () => {
    try {
      CliConfig.validateConfig();
      const cliImporter = new CliImporterManager(CliConfig.getCliImporterManagerOptions());
      const xvoid: void = await cliImporter.run();
      // DEBUG
      // const cliRunSummaryList: Array<ICliRunSummary_Base> = CliRunSummary.getSummaryLogList();
      // expect(false, JSON.stringify(cliRunSummaryList, null, 2)).to.be.true;
    } catch (e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should create new version`, async () => {
    try {
      const testApiSpecRecordList: Array<TTestApiSpecRecord> = TestService.getTestApiSpecRecordList();
      expect(testApiSpecRecordList.length, TestLogger.createLogMessage("testApiSpecRecordList.length !== 1", testApiSpecRecordList)).to.eq(1);
      const epAsyncApiDocument: EpAsyncApiDocument = testApiSpecRecordList[0].epAsyncApiDocument;
      // get latest version
      const applicationDomainName = epAsyncApiDocument.getApplicationDomainName();
      const applicationDomain: ApplicationDomain | undefined = await EpSdkApplicationDomainsService.getByName({
        applicationDomainName: applicationDomainName,
      });
      expect(applicationDomain, TestLogger.createLogMessage("applicationDomain undefined", { applicationDomainName: applicationDomainName })).not.to.be.undefined;
      const applicationDomainId = applicationDomain.id;
      const eventApiName = epAsyncApiDocument.getTitle();
      const latestEventApiVersion: EventApiVersion = await EpSdkEventApiVersionsService.getLatestVersionForEventApiName({
        applicationDomainId: applicationDomainId,
        eventApiName: eventApiName,
      });
      expect(latestEventApiVersion, TestLogger.createLogMessage("latestEventApiVersion undefined", { applicationDomainId: applicationDomainId, eventApiName: eventApiName })).not.to.be.undefined;
      // create a new version
      const eventApiId = latestEventApiVersion.eventApiId;
      const latestVersionString = latestEventApiVersion.version;
      const newVersionString = EpSdkSemVerUtils.createNextVersionByStrategy({
        fromVersionString: latestVersionString,
        strategy: EEpSdk_VersionStrategy.BUMP_MINOR,
      });
      await EpSdkEventApiVersionsService.createEventApiVersion({
        applicationDomainId: applicationDomainId,
        eventApiId: eventApiId,
        eventApiVersion: {
          ...latestEventApiVersion,
          version: newVersionString,
          description: "new description",
        },
        targetLifecycleStateId: latestEventApiVersion.stateId,
      });
    } catch (e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should import specs: with error`, async () => {
    try {
      CliConfig.validateConfig();
      const cliImporter = new CliImporterManager(CliConfig.getCliImporterManagerOptions());
      try {
        const xvoid: void = await cliImporter.run();
      } catch (e) {
        expect(
          e instanceof CliError,
          TestLogger.createNotCliErrorMesssage(e.message)
        ).to.be.true;
        // // DEBUG:
        // const cliError: CliError = e;
        // console.log(`>>>>> cliError=\n ${JSON.stringify(cliError, null, 2)}`);
        expect(
          e instanceof CliImporterTestRunAssetsInconsistencyError,
          `e not instance of CliImporterTestRunAssetsInconsistencyError, message=${e.message}`
        ).to.be.true;
        const ciiImporterTestRunAssetsInconsistencyError: CliImporterTestRunAssetsInconsistencyError =
          e;
        const details = ciiImporterTestRunAssetsInconsistencyError.details;
        const requestedUpdates = details.requestedUpdates;
        expect(requestedUpdates, "requestedUpdates is undefined").to.be.not
          .undefined;
        expect(
          JSON.stringify(requestedUpdates),
          "wrong requestedUpdates"
        ).to.include("description");
        expect(
          JSON.stringify(requestedUpdates),
          "wrong requestedUpdates"
        ).to.include("version");
      }
      const cliRunSummaryList: Array<ICliRunSummary_Base> =
        CliRunSummary.getSummaryLogList();
      // // DEBUG
      // console.log(`>>>>> cliRunSummaryList=\n ${JSON.stringify(cliRunSummaryList, null, 2)}`);

      const thirdLastEntry: ICliRunSummary_Base =
        cliRunSummaryList[cliRunSummaryList.length - 3];
      expect(
        thirdLastEntry.type,
        `wrong type = ${thirdLastEntry.type}`
      ).to.equal(ECliRunSummary_Type.EventApiVersioningError);

      const secondLastEntry: ICliRunSummary_Base =
        cliRunSummaryList[cliRunSummaryList.length - 2];
      expect(
        secondLastEntry.type,
        `wrong type = ${secondLastEntry.type}`
      ).to.equal(ECliRunSummary_Type.VersionObject);
      const versionObjectEntry: ICliRunSummary_Task_VersionObject =
        secondLastEntry as ICliRunSummary_Task_VersionObject;
      expect(
        versionObjectEntry.action,
        `wrong action = ${versionObjectEntry.action}`
      ).to.equal(
        EEpSdkTask_Action.WOULD_FAIL_CREATE_NEW_VERSION_ON_EXACT_VERSION_REQUIREMENT
      );
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
