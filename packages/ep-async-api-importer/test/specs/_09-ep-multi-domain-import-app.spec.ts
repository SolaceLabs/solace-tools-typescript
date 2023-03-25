import "mocha";
import { expect } from "chai";
import path from "path";
import {
  ApiError, 
  ApplicationsService, 
  ApplicationVersion, 
} from "@solace-labs/ep-openapi-node";
import { 
  EpAsyncApiDocument, 
  EpAsyncApiDocumentService, 
  T_EpAsyncApiChannelDocumentMap, 
  T_EpAsyncApiChannelParameterDocumentMap 
} from "@solace-labs/ep-asyncapi";
import { 
  EEpSdkTask_TargetState, 
  EpSdkApplicationDomainsService, 
  EpSdkApplicationDomainTask, 
  EpSdkApplicationVersionsService, 
  EpSdkError, 
} from "@solace-labs/ep-sdk";
import { 
  TestContext, 
  TestUtils 
} from "@internal/tools/src";
import {
  TestConfig,
  TestLogger,
  TestService,
} from "../lib";
import {
  CliConfig,
  CliError,
  CliImporterManager,
  CliUtils,
  ECliAssetsApplicationDomainEnforcementPolicies,
  ECliImporterManagerMode,
} from "../../src/cli-components";

const scriptName: string = path.basename(__filename);
const TestSpecName = scriptName;
const TestSpecId = TestUtils.getShortUUID();
TestLogger.logMessage(scriptName, ">>> starting ...");

let Start_AppAsyncApiSpecFile: string;
const TestApplicationDomainNames: Array<string> = [];
let DownloadedAsyncApiSpecFileNameJson: string;

const absentApplicationDomains = async() => {
  // remove them backwards
  for(let i=TestApplicationDomainNames.length -1; i>=0; i--) {
    try {
      const task = new EpSdkApplicationDomainTask({applicationDomainName: TestApplicationDomainNames[i], epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT });
      await task.execute('xContextId');
    } catch(e) {}
  }
  for(let i=TestApplicationDomainNames.length -1; i>=0; i--) {
    try {
      const task = new EpSdkApplicationDomainTask({applicationDomainName: TestApplicationDomainNames[i], epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT });
      await task.execute('xContextId');
    } catch(e) {}
  }
}

const initializeGlobals = () => {
  Start_AppAsyncApiSpecFile = TestService.validateFilePathWithReadPermission(`${TestConfig.getConfig().dataRootDir}/multi-domain-manual/multi-domain-import-app.spec.yml`);
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
    try { await absentApplicationDomains(); } catch(e) { console.log(`e=${JSON.stringify(e, null, 2)}`)}
    try { await absentApplicationDomains(); } catch(e) { console.log(`e=${JSON.stringify(e, null, 2)}`)}
    try { await absentApplicationDomains(); } catch(e) { console.log(`e=${JSON.stringify(e, null, 2)}`)}
  });

  it(`${scriptName}: should parse the Start_AppAsyncApiSpecFile and remove domains`, async () => {
    try {
      const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({ 
        filePath: Start_AppAsyncApiSpecFile
      });
      TestApplicationDomainNames.push(epAsyncApiDocument.getApplicationDomainName());
      TestApplicationDomainNames.push(epAsyncApiDocument.getAssetsApplicationDomainName());
      const epAsyncApiChannelDocumentMap: T_EpAsyncApiChannelDocumentMap = epAsyncApiDocument.getEpAsyncApiChannelDocumentMap();
      for(const [key, epAsyncApiChannelDocument] of epAsyncApiChannelDocumentMap) {
        const epAsyncApiChannelParameterDocumentMap: T_EpAsyncApiChannelParameterDocumentMap = epAsyncApiChannelDocument.getEpAsyncApiChannelParameterDocumentMap();
        for(const [key, epAsyncApiChannelParameterDocument] of epAsyncApiChannelParameterDocumentMap) {
          TestApplicationDomainNames.push(epAsyncApiChannelParameterDocument.getEpApplicationDomainName());
        }
        const epAsynApiChannelPublishOperation = epAsyncApiChannelDocument.getEpAsyncApiChannelPublishOperation();
        if(epAsynApiChannelPublishOperation) {
          const epAsyncApiPublishMessageDocument = epAsynApiChannelPublishOperation.getEpAsyncApiMessageDocument();
          TestApplicationDomainNames.push(epAsyncApiPublishMessageDocument.getMessageEpApplicationDomainName());
          TestApplicationDomainNames.push(epAsyncApiPublishMessageDocument.getPayloadSchemaEpApplicationDomainName());  
        }
        const epAsynApiChannelSubscribeOperation = epAsyncApiChannelDocument.getEpAsyncApiChannelSubscribeOperation();
        if(epAsynApiChannelSubscribeOperation) {
          const epAsyncApiSubscribeMessageDocument = epAsynApiChannelSubscribeOperation.getEpAsyncApiMessageDocument();
          TestApplicationDomainNames.push(epAsyncApiSubscribeMessageDocument.getMessageEpApplicationDomainName());
          TestApplicationDomainNames.push(epAsyncApiSubscribeMessageDocument.getPayloadSchemaEpApplicationDomainName());  
        }
      }
      try { await absentApplicationDomains(); } catch(e) { console.log(`e=${JSON.stringify(e, null, 2)}`)}
      try { await absentApplicationDomains(); } catch(e) { console.log(`e=${JSON.stringify(e, null, 2)}`)}
      try { await absentApplicationDomains(); } catch(e) { console.log(`e=${JSON.stringify(e, null, 2)}`)}
    } catch (e) {
      TestLogger.logMessageWithId(TestLogger.createTestFailMessageForError('error', e));
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should import Start_AppAsyncApiSpecFile`, async () => {
    try {
      CliConfig.getCliImporterManagerOptions().asyncApiFileList = [Start_AppAsyncApiSpecFile];
      CliConfig.getCliImporterManagerOptions().cliImporterManagerMode = ECliImporterManagerMode.RELEASE_MODE;
      // // DEBUG
      // CliConfig.getCliImporterManagerOptions().cliImporterManagerMode = ECliImporterManagerMode.TEST_MODE_KEEP;
      CliConfig.getCliImporterManagerOptions().createApiApplication = true;
      CliConfig.getCliImporterManagerOptions().createApiEventApi = false;
      CliConfig.getCliImporterManagerOptions().cliTestSetupDomainsForApis = true;
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliAssetImport_BrokerType = undefined;
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliAssetImport_ChannelDelimiter = undefined;
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliAssetsApplicationDomainEnforcementPolicy = ECliAssetsApplicationDomainEnforcementPolicies.LAX;

      const cliImporter = new CliImporterManager(CliConfig.getCliImporterManagerOptions());
      const xvoid: void = await cliImporter.run();
    } catch (e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should download the imported app spec and save it to file`, async () => {
    try {
      const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({ 
        filePath: Start_AppAsyncApiSpecFile,
      });
      const applicationDomainName = epAsyncApiDocument.getApplicationDomainName();
      const applicationName = epAsyncApiDocument.getEpApiName();
      const applicationDomain = await EpSdkApplicationDomainsService.getByName({ applicationDomainName: applicationDomainName });
      const applicationVersionList: Array<ApplicationVersion> = await EpSdkApplicationVersionsService.getVersionsForApplicationName({
        applicationName: applicationName,
        applicationDomainId: applicationDomain.id
      });
      expect(applicationVersionList.length, 'wrong number of versions').to.equal(1);
      const asyncApiSpec = await ApplicationsService.getAsyncApiForApplicationVersion({
        applicationVersionId: applicationVersionList[0].id
      });
      DownloadedAsyncApiSpecFileNameJson = TestConfig.getConfig().tmpDir + "/" + epAsyncApiDocument.getEpApiNameAsFileName("json");
      CliUtils.saveContents2File({
        filePath: DownloadedAsyncApiSpecFileNameJson,
        content: JSON.stringify(asyncApiSpec, null, 2 ),
      });
    } catch (e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should import donwload application spec without any changes`, async () => {
    try {
      CliConfig.getCliImporterManagerOptions().asyncApiFileList = [DownloadedAsyncApiSpecFileNameJson];
      CliConfig.getCliImporterManagerOptions().cliImporterManagerMode = ECliImporterManagerMode.RELEASE_MODE;
      // // DEBUG
      // CliConfig.getCliImporterManagerOptions().cliImporterManagerMode = ECliImporterManagerMode.TEST_MODE_KEEP;
      // end DEBUG
      CliConfig.getCliImporterManagerOptions().createApiApplication = true;
      CliConfig.getCliImporterManagerOptions().createApiEventApi = false;
      CliConfig.getCliImporterManagerOptions().cliTestSetupDomainsForApis = true;
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliAssetImport_BrokerType = undefined;
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliAssetImport_ChannelDelimiter = undefined;
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliAssetsApplicationDomainEnforcementPolicy = ECliAssetsApplicationDomainEnforcementPolicies.STRICT;
      const cliImporter = new CliImporterManager(CliConfig.getCliImporterManagerOptions());
      const xvoid: void = await cliImporter.run();
    } catch (e) {
      TestLogger.logMessageWithId(TestLogger.createTestFailMessageForError('error', e));
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should import Start_AppAsyncApiSpecFile again, test idempotency`, async () => {
    try {
      CliConfig.getCliImporterManagerOptions().asyncApiFileList = [Start_AppAsyncApiSpecFile];
      CliConfig.getCliImporterManagerOptions().cliImporterManagerMode = ECliImporterManagerMode.RELEASE_MODE;
      // // DEBUG
      // CliConfig.getCliImporterManagerOptions().cliImporterManagerMode = ECliImporterManagerMode.TEST_MODE_KEEP;
      // // end DEBUG
      CliConfig.getCliImporterManagerOptions().createApiApplication = true;
      CliConfig.getCliImporterManagerOptions().createApiEventApi = false;
      CliConfig.getCliImporterManagerOptions().cliTestSetupDomainsForApis = true;
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliAssetImport_BrokerType = undefined;
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliAssetImport_ChannelDelimiter = undefined;
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliAssetsApplicationDomainEnforcementPolicy = ECliAssetsApplicationDomainEnforcementPolicies.STRICT;
      const cliImporter = new CliImporterManager(CliConfig.getCliImporterManagerOptions());
      const xvoid: void = await cliImporter.run();
    } catch (e) {
      TestLogger.logMessageWithId(TestLogger.createTestFailMessageForError('error', e));
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should check no new version created for Start_AppAsyncApiSpecFile`, async () => {
    try {
      const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({ 
        filePath: Start_AppAsyncApiSpecFile
      });
      const applicationDomain = await EpSdkApplicationDomainsService.getByName({ 
        applicationDomainName: epAsyncApiDocument.getApplicationDomainName()
      });
      const applicationVersions = await EpSdkApplicationVersionsService.getVersionsForApplicationName({
        applicationName: epAsyncApiDocument.getEpApiName(),
        applicationDomainId: applicationDomain.id
      })
      expect(applicationVersions.length,'applicationVersions.length not 1').to.equal(1);
    } catch (e) {
      TestLogger.logMessageWithId(TestLogger.createTestFailMessageForError('error', e));
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

});
