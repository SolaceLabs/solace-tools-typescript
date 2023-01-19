import "mocha";
import { expect } from "chai";
import path from "path";
import { EEpSdkTask_Action } from "@solace-labs/ep-sdk";
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

const SpecFilesDir = "error-capture-and-logging";
const SingleTest_NewEventSameVersion = "new-event-same-version";
const SingleTest_SameApiVersionCombinedIssues =
  "same-api-version-combined-issues";
const SingleTest_SameApiVersionDifferentChannels =
  "same-api-version-different-channels";
const SingleTest_SameApiVersionNewEnum = "same-api-version-new-enum";
const SingleTest_SameApiVersionRemoveEnum = "same-api-version-remove-enum";
const SingleTest_SameApiVersionRemovedChannel =
  "same-api-version-removed-channel";

let FileList: Array<string> = [];

const initializeGlobals = () => {
  FileList.push(
    ...CliUtils.createFileList(
      `${TestConfig.getConfig().dataRootDir}/${SpecFilesDir}/**/*.spec.yml`
    )
  );
  // set test specific importer options
  CliConfig.getCliImporterManagerOptions().asyncApiFileList = FileList;
  CliConfig.getCliImporterManagerOptions().cliImporterManagerMode =
    ECliImporterManagerMode.RELEASE_MODE;
  CliConfig.getCliImporterManagerOptions().cliTestSetupDomainsForApis = true;
  CliConfig.getCliImporterManagerOptions().createEventApiApplication = false;
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
      // test ep assets & versions are correctly imported as in epAsyncApiDocument
      const pass: boolean = await TestService.checkAssetsCreatedAsExpected();
      expect(pass, `${scriptName}: checks not passed`).to.be.true;
    } catch (e) {
      err = e;
    } finally {
      // ensure all app domains are absent
      const xvoid: void = await TestService.absent_ApplicationDomains(
        CliConfig.getCliImporterManagerOptions().cliImporterManagerMode ===
          ECliImporterManagerMode.TEST_MODE_KEEP
      );
    }
    expect(err, TestLogger.createNotCliErrorMesssage(JSON.stringify(err))).to.be
      .undefined;
  });

  it(`${scriptName}: should report correct errors for: ${SingleTest_NewEventSameVersion} `, async () => {
    const logName = `${scriptName}.${SingleTest_NewEventSameVersion}`;
    try {
      CliConfig.getCliImporterManagerOptions().asyncApiFileList =
        CliUtils.createFileList(
          `${
            TestConfig.getConfig().dataRootDir
          }/${SpecFilesDir}/${SingleTest_NewEventSameVersion}/*.spec.yml`
        );
      const cliImporter = new CliImporterManager(
        CliConfig.getCliImporterManagerOptions()
      );
      const xvoid: void = await cliImporter.run();
      expect(false, "should never get here").to.be.true;
    } catch (e) {
      expect(
        e instanceof CliError,
        TestLogger.createNotCliErrorMesssage(e.message)
      ).to.be.true;
      const ce: CliImporterTestRunAssetsInconsistencyError =
        new CliImporterTestRunAssetsInconsistencyError("check", {});
      expect(
        e instanceof CliImporterTestRunAssetsInconsistencyError,
        TestLogger.createWrongCliErrorInstance(ce.constructor.name, e)
      ).to.be.true;

      const cliRunSummaryList: Array<ICliRunSummary_Base> =
        CliRunSummary.getSummaryLogList();
      // // DEBUG
      // console.log(`>>>>> cliRunSummaryList=\n ${JSON.stringify(cliRunSummaryList, null, 2)}`);

      const thirdLastEntry: ICliRunSummary_Base =
        cliRunSummaryList[cliRunSummaryList.length - 3];
      expect(
        thirdLastEntry.type,
        TestLogger.createLogMessage("thirdLastEntry.type, wrong type", {
          type: thirdLastEntry.type,
          thirdLastEntry: thirdLastEntry,
        })
      ).to.equal(ECliRunSummary_Type.EventApiVersioningError);
      const secondLastEntry: ICliRunSummary_Base =
        cliRunSummaryList[cliRunSummaryList.length - 2];
      expect(
        secondLastEntry.type,
        `secondLastEntry.type, wrong type = ${secondLastEntry.type}`
      ).to.equal(ECliRunSummary_Type.VersionObject);
      const versionObjectEntry: ICliRunSummary_Task_VersionObject =
        secondLastEntry as ICliRunSummary_Task_VersionObject;
      expect(
        versionObjectEntry.action,
        `versionObjectEntry.action, wrong action = ${versionObjectEntry.action}`
      ).to.equal(
        EEpSdkTask_Action.WOULD_FAIL_CREATE_NEW_VERSION_ON_EXACT_VERSION_REQUIREMENT
      );
    }
  });

  it(`${scriptName}: should report correct errors for: ${SingleTest_SameApiVersionCombinedIssues} `, async () => {
    const logName = `${scriptName}.${SingleTest_SameApiVersionCombinedIssues}`;
    try {
      CliConfig.getCliImporterManagerOptions().asyncApiFileList =
        CliUtils.createFileList(
          `${
            TestConfig.getConfig().dataRootDir
          }/${SpecFilesDir}/${SingleTest_SameApiVersionCombinedIssues}/*.spec.yml`
        );
      const cliImporter = new CliImporterManager(
        CliConfig.getCliImporterManagerOptions()
      );
      const xvoid: void = await cliImporter.run();
      expect(false, "should never get here").to.be.true;
    } catch (e) {
      expect(
        e instanceof CliError,
        TestLogger.createNotCliErrorMesssage(e.message)
      ).to.be.true;
      const ce: CliImporterTestRunAssetsInconsistencyError =
        new CliImporterTestRunAssetsInconsistencyError("check", {});
      expect(
        e instanceof CliImporterTestRunAssetsInconsistencyError,
        TestLogger.createWrongCliErrorInstance(ce.constructor.name, e)
      ).to.be.true;

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
    }
  });

  it(`${scriptName}: should report correct errors for: ${SingleTest_SameApiVersionDifferentChannels} `, async () => {
    const logName = `${scriptName}.${SingleTest_SameApiVersionDifferentChannels}`;
    try {
      CliConfig.getCliImporterManagerOptions().asyncApiFileList =
        CliUtils.createFileList(
          `${
            TestConfig.getConfig().dataRootDir
          }/${SpecFilesDir}/${SingleTest_SameApiVersionDifferentChannels}/*.spec.yml`
        );
      const cliImporter = new CliImporterManager(
        CliConfig.getCliImporterManagerOptions()
      );
      const xvoid: void = await cliImporter.run();
      expect(false, "should never get here").to.be.true;
    } catch (e) {
      expect(
        e instanceof CliError,
        TestLogger.createNotCliErrorMesssage(e.message)
      ).to.be.true;
      const ce: CliImporterTestRunAssetsInconsistencyError =
        new CliImporterTestRunAssetsInconsistencyError("check", {});
      expect(
        e instanceof CliImporterTestRunAssetsInconsistencyError,
        TestLogger.createWrongCliErrorInstance(ce.constructor.name, e)
      ).to.be.true;

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
    }
  });

  it(`${scriptName}: should report correct errors for: ${SingleTest_SameApiVersionNewEnum} `, async () => {
    const logName = `${scriptName}.${SingleTest_SameApiVersionNewEnum}`;
    try {
      CliConfig.getCliImporterManagerOptions().asyncApiFileList =
        CliUtils.createFileList(
          `${
            TestConfig.getConfig().dataRootDir
          }/${SpecFilesDir}/${SingleTest_SameApiVersionNewEnum}/*.spec.yml`
        );
      const cliImporter = new CliImporterManager(
        CliConfig.getCliImporterManagerOptions()
      );
      const xvoid: void = await cliImporter.run();
      expect(false, "should never get here").to.be.true;
    } catch (e) {
      expect(
        e instanceof CliError,
        TestLogger.createNotCliErrorMesssage(e.message)
      ).to.be.true;
      const ce: CliImporterTestRunAssetsInconsistencyError =
        new CliImporterTestRunAssetsInconsistencyError("check", {});
      expect(
        e instanceof CliImporterTestRunAssetsInconsistencyError,
        TestLogger.createWrongCliErrorInstance(ce.constructor.name, e)
      ).to.be.true;

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
    }
  });

  it(`${scriptName}: should report correct errors for: ${SingleTest_SameApiVersionRemoveEnum} `, async () => {
    const logName = `${scriptName}.${SingleTest_SameApiVersionRemoveEnum}`;
    try {
      CliConfig.getCliImporterManagerOptions().asyncApiFileList =
        CliUtils.createFileList(
          `${
            TestConfig.getConfig().dataRootDir
          }/${SpecFilesDir}/${SingleTest_SameApiVersionRemoveEnum}/*.spec.yml`
        );
      const cliImporter = new CliImporterManager(
        CliConfig.getCliImporterManagerOptions()
      );
      const xvoid: void = await cliImporter.run();
    } catch (e) {
      expect(false, "should never get here").to.be.true;
      expect(
        e instanceof CliError,
        TestLogger.createNotCliErrorMesssage(e.message)
      ).to.be.true;
      const ce: CliImporterTestRunAssetsInconsistencyError =
        new CliImporterTestRunAssetsInconsistencyError("check", {});
      expect(
        e instanceof CliImporterTestRunAssetsInconsistencyError,
        TestLogger.createWrongCliErrorInstance(ce.constructor.name, e)
      ).to.be.true;

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
    }
  });

  it(`${scriptName}: should report correct errors for: ${SingleTest_SameApiVersionRemovedChannel} `, async () => {
    const logName = `${scriptName}.${SingleTest_SameApiVersionRemovedChannel}`;
    try {
      CliConfig.getCliImporterManagerOptions().asyncApiFileList =
        CliUtils.createFileList(
          `${
            TestConfig.getConfig().dataRootDir
          }/${SpecFilesDir}/${SingleTest_SameApiVersionRemovedChannel}/*.spec.yml`
        );
      const cliImporter = new CliImporterManager(
        CliConfig.getCliImporterManagerOptions()
      );
      const xvoid: void = await cliImporter.run();
      expect(false, "should never get here").to.be.true;
    } catch (e) {
      expect(
        e instanceof CliError,
        TestLogger.createNotCliErrorMesssage(e.message)
      ).to.be.true;
      const ce: CliImporterTestRunAssetsInconsistencyError =
        new CliImporterTestRunAssetsInconsistencyError("check", {});
      expect(
        e instanceof CliImporterTestRunAssetsInconsistencyError,
        TestLogger.createWrongCliErrorInstance(ce.constructor.name, e)
      ).to.be.true;

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
    }
  });
});
