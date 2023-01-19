import "mocha";
import { expect } from "chai";
import path from "path";
import { EpAsyncApiDocument } from "@solace-labs/ep-asyncapi";
import {
  EEpSdk_VersionStrategy,
  EpSdkApplicationDomainsService,
  EpSdkApplicationVersionsService,
  EpSdkEventApiVersionsService,
  EpSdkSemVerUtils,
} from "@solace-labs/ep-sdk";
import {
  ApplicationDomain,
  ApplicationVersion,
  EventApiVersion,
} from "@solace-labs/ep-openapi-node";
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
  CliUtils,
  ICliImportSummary,
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
  CliConfig.getCliImporterManagerOptions().cliImporterManagerMode =
    ECliImporterManagerMode.RELEASE_MODE;
  CliConfig.getCliImporterManagerOptions().cliTestSetupDomainsForApis = false;
  CliConfig.getCliImporterManagerOptions().createEventApiApplication = true;
};

describe(`${scriptName}`, () => {
  before(async () => {
    TestContext.newItId();
    initializeGlobals();
    try {
      const testApiSpecRecordList: Array<TTestApiSpecRecord> =
        await TestService.createTestApiSpecRecordList({
          apiFileList: FileList,
          overrideApplicationDomainName: CliConfig.getCliImporterManagerOptions().applicationDomainName,
          overrideAssetApplicationDomainName: CliConfig.getCliImporterManagerOptions().assetApplicationDomainName,
          overrideBrokerType: CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliAssetImport_BrokerType,
          overrideChannelDelimiter: CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliAssetImport_ChannelDelimiter, 
          validateBestPractices: CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliValidateApiSpecBestPractices,   
        });
      const xvoid: void = await TestService.absent_ApplicationDomains(false);
    } catch (e) {
      expect(
        e instanceof CliError,
        TestLogger.createNotCliErrorMesssage(e.message)
      ).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError("failed", e))
        .to.be.true;
    }
  });

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async () => {
    TestContext.newItId();
    let err: Error | undefined = undefined;
    try {
      const pass: boolean = await TestService.checkAssetsCreatedAsExpected();
      expect(pass, `${scriptName}: AFTER checks not passed`).to.be.true;
    } catch (e) {
      err = e;
    } finally {
      const xvoid: void = await TestService.absent_ApplicationDomains(
        CliConfig.getCliImporterManagerOptions().cliImporterManagerMode ===
          ECliImporterManagerMode.TEST_MODE_KEEP
      );
    }
    expect(err, TestLogger.createNotCliErrorMesssage(JSON.stringify(err))).to.be
      .undefined;
  });

  it(`${scriptName}: should import specs`, async () => {
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
      expect(
        e instanceof CliError,
        TestLogger.createNotCliErrorMesssage(e.message)
      ).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError("failed", e))
        .to.be.true;
    }
  });

  it(`${scriptName}: should create new event api version`, async () => {
    try {
      const testApiSpecRecordList: Array<TTestApiSpecRecord> =
        TestService.getTestApiSpecRecordList();
      expect(
        testApiSpecRecordList.length,
        TestLogger.createLogMessage(
          "testApiSpecRecordList.length !== 1",
          testApiSpecRecordList
        )
      ).to.eq(1);
      const epAsyncApiDocument: EpAsyncApiDocument =
        testApiSpecRecordList[0].epAsyncApiDocument;
      // get latest version
      const applicationDomainName =
        epAsyncApiDocument.getApplicationDomainName();
      const applicationDomain: ApplicationDomain | undefined =
        await EpSdkApplicationDomainsService.getByName({
          applicationDomainName: applicationDomainName,
        });
      expect(
        applicationDomain,
        TestLogger.createLogMessage("applicationDomain undefined", {
          applicationDomainName: applicationDomainName,
        })
      ).not.to.be.undefined;
      const applicationDomainId = applicationDomain.id;
      const eventApiName = epAsyncApiDocument.getTitle();
      const latestEventApiVersion: EventApiVersion =
        await EpSdkEventApiVersionsService.getLatestVersionForEventApiName({
          applicationDomainId: applicationDomainId,
          eventApiName: eventApiName,
        });
      expect(
        latestEventApiVersion,
        TestLogger.createLogMessage("latestEventApiVersion undefined", {
          applicationDomainId: applicationDomainId,
          eventApiName: eventApiName,
        })
      ).not.to.be.undefined;
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
      // const newEventApiVersion: EventApiVersion = await EpSdkEventApiVersionsService.getLatestVersionForEventApiId({ applicationDomainId: applicationDomainId, eventApiId: eventApiId });
      // expect(newEventApiVersion.version, TestLogger.createLogMessage('newEventApiVersion.version !== newVersionString', {
      //   newEventApiVersion: newEventApiVersion,
      //   newVersionString: newVersionString
      // })).to.eq(newVersionString);
      // DEBUG
      // expect(false, JSON.stringify(cliRunSummaryList, null, 2)).to.be.true;
    } catch (e) {
      expect(
        e instanceof CliError,
        TestLogger.createNotCliErrorMesssage(e.message)
      ).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError("failed", e))
        .to.be.true;
    }
  });

  it(`${scriptName}: should create new application version`, async () => {
    try {
      const testApiSpecRecordList: Array<TTestApiSpecRecord> =
        TestService.getTestApiSpecRecordList();
      expect(
        testApiSpecRecordList.length,
        TestLogger.createLogMessage(
          "testApiSpecRecordList.length !== 1",
          testApiSpecRecordList
        )
      ).to.eq(1);
      const epAsyncApiDocument: EpAsyncApiDocument =
        testApiSpecRecordList[0].epAsyncApiDocument;
      // get latest version
      const applicationDomainName =
        epAsyncApiDocument.getApplicationDomainName();
      const applicationDomain: ApplicationDomain | undefined =
        await EpSdkApplicationDomainsService.getByName({
          applicationDomainName: applicationDomainName,
        });
      expect(
        applicationDomain,
        TestLogger.createLogMessage("applicationDomain undefined", {
          applicationDomainName: applicationDomainName,
        })
      ).not.to.be.undefined;
      const applicationDomainId = applicationDomain.id;
      const applicationName = epAsyncApiDocument.getTitle();
      const latestApplicationVersion: ApplicationVersion =
        await EpSdkApplicationVersionsService.getLatestVersionForApplicationName(
          {
            applicationDomainId: applicationDomainId,
            applicationName: applicationName,
          }
        );
      expect(
        latestApplicationVersion,
        TestLogger.createLogMessage("latestApplicationVersion undefined", {
          applicationDomainId: applicationDomainId,
          applicationName: applicationName,
        })
      ).not.to.be.undefined;
      // create a new version
      const applicationId = latestApplicationVersion.applicationId;
      const latestVersionString = latestApplicationVersion.version;
      const newVersionString = EpSdkSemVerUtils.createNextVersionByStrategy({
        fromVersionString: latestVersionString,
        strategy: EEpSdk_VersionStrategy.BUMP_MINOR,
      });

      await EpSdkApplicationVersionsService.createApplicationVersion({
        applicationDomainId: applicationDomainId,
        applicationId: applicationId,
        applicationVersion: {
          ...latestApplicationVersion,
          version: newVersionString,
          description: "new description",
        },
        targetLifecycleStateId: latestApplicationVersion.stateId,
      });
    } catch (e) {
      expect(
        e instanceof CliError,
        TestLogger.createNotCliErrorMesssage(e.message)
      ).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError("failed", e))
        .to.be.true;
    }
  });

  it(`${scriptName}: should import specs: with warnings`, async () => {
    try {
      const cliImporter = new CliImporterManager(
        CliConfig.getCliImporterManagerOptions()
      );
      const xvoid: void = await cliImporter.run();
      const cliRunSummaryList: Array<ICliRunSummary_Base> =
        CliRunSummary.getSummaryLogList();
      const cliImportSummary: ICliImportSummary =
        CliRunSummary.createImportSummary(
          CliConfig.getCliImporterManagerOptions().cliImporterManagerMode
        );
      expect(
        cliImportSummary.warnings.length,
        TestLogger.createLogMessage(
          "cliImportSummary.warnings.length !== 2",
          cliImportSummary.warnings
        )
      ).to.eq(2);
      // // DEBUG
      // expect(false, JSON.stringify(cliRunSummaryList, null, 2)).to.be.true;
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
