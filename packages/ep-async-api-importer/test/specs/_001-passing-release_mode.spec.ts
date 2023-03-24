import 'mocha';
import { expect } from 'chai';
import path from 'path';
import { 
  TestContext,
} from "@internal/tools/src";
import { 
  TestConfig,
  TestLogger,
  TestService, 
  TTestApiSpecRecord
} from '../lib';
import { 
  CliConfig,
  CliError,
  CliRunSummary,
  ICliRunSummary_Base,
  CliImporterManager, 
  ECliImporterManagerMode,
  CliUtils
} from '../../src/cli-components';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

let FileList: Array<string> = [];

const initializeGlobals = () => {
  // test individual specs only
  // FileList.push(...CliUtils.createFileList(`${TestConfig.getConfig().dataRootDir}/passing/**/AcmeRetail-Central-IT-Provider-TillSystem-v1-Test.spec.yml`));

  // test all specs found in dir
  FileList.push(...CliUtils.createFileList(`${TestConfig.getConfig().dataRootDir}/passing/**/*.spec.yml`));

  // set test specific importer options
  CliConfig.getCliImporterManagerOptions().asyncApiFileList = FileList;
  CliConfig.getCliImporterManagerOptions().cliImporterManagerMode = ECliImporterManagerMode.RELEASE_MODE;
  CliConfig.getCliImporterManagerOptions().cliTestSetupDomainsForApis = true;
  CliConfig.getCliImporterManagerOptions().createApiApplication = false;
  CliConfig.getCliImporterManagerOptions().applicationDomainName = undefined;
  CliConfig.getCliImporterManagerOptions().assetApplicationDomainName = undefined;    
}

describe(`${scriptName}`, () => {
    
  before(async() => {
    TestContext.newItId();
    initializeGlobals();
    try {
      const testApiSpecRecordList: Array<TTestApiSpecRecord> = await TestService.createTestApiSpecRecordList({
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
      const xvoid: void = await TestService.absent_ApplicationDomains(false);
    } catch(e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError('failed', e)).to.be.true;
    }
  });

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async() => {
    TestContext.newItId();
    let err: Error | undefined = undefined;
    try {
      // test ep assets & versions are correctly imported as in epAsyncApiDocument
      const pass: boolean = await TestService.checkAssetsCreatedAsExpected();
      expect(pass, `${scriptName}: AFTER checks not passed`).to.be.true;
    } catch(e) {
      err = e;
    } finally {
      const xvoid: void = await TestService.absent_ApplicationDomains(CliConfig.getCliImporterManagerOptions().cliImporterManagerMode === ECliImporterManagerMode.TEST_MODE_KEEP);
    }
    expect(err, TestLogger.createNotCliErrorMesssage(JSON.stringify(err))).to.be.undefined;
  });

  it(`${scriptName}: should import specs`, async () => {
    try {
      const cliImporter = new CliImporterManager(CliConfig.getCliImporterManagerOptions());
      const xvoid: void = await cliImporter.run();      
      const cliRunSummaryList: Array<ICliRunSummary_Base> = CliRunSummary.getSummaryLogList();
      // // DEBUG
      // expect(false, 'check imported specs & assets').to.be.true;
    } catch(e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should import specs: idempotency`, async () => {
    try {
      const cliImporter = new CliImporterManager(CliConfig.getCliImporterManagerOptions());
      const xvoid: void = await cliImporter.run();      
      const cliRunSummaryList: Array<ICliRunSummary_Base> = CliRunSummary.getSummaryLogList();
      // DEBUG
      // expect(false, JSON.stringify(cliRunSummaryList, null, 2)).to.be.true;
    } catch(e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should import specs with application / version`, async () => {
    try {
      CliConfig.getCliImporterManagerOptions().createApiApplication = true;

      const cliImporter = new CliImporterManager(CliConfig.getCliImporterManagerOptions());
      const xvoid: void = await cliImporter.run();      
      const cliRunSummaryList: Array<ICliRunSummary_Base> = CliRunSummary.getSummaryLogList();
      // DEBUG
      // expect(false, JSON.stringify(cliRunSummaryList, null, 2)).to.be.true;
    } catch(e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError('failed', e)).to.be.true;
    }
  });

});

