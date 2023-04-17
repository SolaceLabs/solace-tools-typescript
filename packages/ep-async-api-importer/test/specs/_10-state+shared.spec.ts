import "mocha";
import { expect } from "chai";
import path from "path";
import {
  ApiError, 
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
  EpSdkEventApiVersionsService, 
  IEpSdkApplicationDomainTask_ExecuteReturn 
} from "@solace-labs/ep-sdk";
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
  ECliAssetsApplicationDomainEnforcementPolicies,
  ECliImporterManagerMode,
} from "../../src/cli-components";
import { ECliImport_TargetLifecycleState } from "../../src/services";

const scriptName: string = path.basename(__filename);
const TestSpecName = scriptName;
const TestSpecId = TestUtils.getShortUUID();
TestLogger.logMessage(scriptName, ">>> starting ...");

let Start_AppAsyncApiSpecFile: string;
let Start_EventApiAsyncApiSpecFile: string;

const TestApplicationDomainNames: Array<string> = [];

const initializeGlobals = () => {
  Start_AppAsyncApiSpecFile = TestService.validateFilePathWithReadPermission(`${TestConfig.getConfig().dataRootDir}/shared+state/state+shared.app.pass.spec.yml`);
  Start_EventApiAsyncApiSpecFile = TestService.validateFilePathWithReadPermission(`${TestConfig.getConfig().dataRootDir}/shared+state/state+shared.event-api.pass.spec.yml`); 
};

const absentApplicationDomains = async() => {
  // remove them backwards
  for(let i=TestApplicationDomainNames.length -1; i>=0; i--) {
    try {
      // console.log(`deleting TestApplicationDomainNames[${i}]="${TestApplicationDomainNames[i]}"`);
      const task = new EpSdkApplicationDomainTask({
        applicationDomainName: TestApplicationDomainNames[i],
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT
      });
      const task_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await task.execute('xContextId');
      // console.log(`deleted TestApplicationDomainNames[${i}]="${TestApplicationDomainNames[i]}"`);
    } catch(e) {
      // console.log(`scriptName=${scriptName}, e=${JSON.stringify(e, null, 2)}`);
    }
  }
}

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
    // try { await absentApplicationDomains(); } catch(e) { console.log(`e=${JSON.stringify(e, null, 2)}`)}
    // try { await absentApplicationDomains(); } catch(e) { console.log(`e=${JSON.stringify(e, null, 2)}`)}
    // try { await absentApplicationDomains(); } catch(e) { console.log(`e=${JSON.stringify(e, null, 2)}`)}
  });

  it(`${scriptName}: should parse the Start_AppAsyncApiSpecFile and remove domains`, async () => {
    console.log(`\t\t>>> removing application domains ...`)
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
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliImport_DefaultSharedFlag = false;
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliImport_DefaultStateName = ECliImport_TargetLifecycleState.DRAFT;
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliAssetImport_BrokerType = undefined;
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliAssetImport_ChannelDelimiter = undefined;
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliAssetsApplicationDomainEnforcementPolicy = ECliAssetsApplicationDomainEnforcementPolicies.LAX;
      CliConfig.validateConfig();
      const cliImporter = new CliImporterManager(CliConfig.getCliImporterManagerOptions());
      const xvoid: void = await cliImporter.run();
    } catch (e) {
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
      CliConfig.getCliImporterManagerOptions().createApiApplication = true;
      CliConfig.getCliImporterManagerOptions().createApiEventApi = false;
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliImport_DefaultSharedFlag = false;
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliImport_DefaultStateName = ECliImport_TargetLifecycleState.DRAFT;
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliAssetImport_BrokerType = undefined;
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliAssetImport_ChannelDelimiter = undefined;
      CliConfig.getCliImporterManagerOptions().cliTestSetupDomainsForApis = true;
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliAssetsApplicationDomainEnforcementPolicy = ECliAssetsApplicationDomainEnforcementPolicies.STRICT;
      CliConfig.validateConfig();
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
      const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({ filePath: Start_AppAsyncApiSpecFile });
      const applicationDomain = await EpSdkApplicationDomainsService.getByName({ applicationDomainName: epAsyncApiDocument.getApplicationDomainName()});
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

  it(`${scriptName}: should parse the Start_EventApiAsyncApiSpecFile and remove domains`, async () => {
    console.log(`\t\t>>> removing application domains ...`)
    try {
      const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({ 
        filePath: Start_EventApiAsyncApiSpecFile
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

  it(`${scriptName}: should import Start_EventApiAsyncApiSpecFile`, async () => {
    try {
      CliConfig.getCliImporterManagerOptions().asyncApiFileList = [Start_EventApiAsyncApiSpecFile];
      CliConfig.getCliImporterManagerOptions().cliImporterManagerMode = ECliImporterManagerMode.RELEASE_MODE;
      // // DEBUG
      // CliConfig.getCliImporterManagerOptions().cliImporterManagerMode = ECliImporterManagerMode.TEST_MODE_KEEP;
      CliConfig.getCliImporterManagerOptions().createApiApplication = false;
      CliConfig.getCliImporterManagerOptions().createApiEventApi = true;
      CliConfig.getCliImporterManagerOptions().cliTestSetupDomainsForApis = true;
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliImport_DefaultSharedFlag = false;
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliImport_DefaultStateName = ECliImport_TargetLifecycleState.DRAFT;
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliAssetImport_BrokerType = undefined;
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliAssetImport_ChannelDelimiter = undefined;
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliAssetsApplicationDomainEnforcementPolicy = ECliAssetsApplicationDomainEnforcementPolicies.LAX;
      CliConfig.validateConfig();
      const cliImporter = new CliImporterManager(CliConfig.getCliImporterManagerOptions());
      const xvoid: void = await cliImporter.run();
    } catch (e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should import Start_EventApiAsyncApiSpecFile again, test idempotency`, async () => {
    try {
      CliConfig.getCliImporterManagerOptions().asyncApiFileList = [Start_EventApiAsyncApiSpecFile];
      CliConfig.getCliImporterManagerOptions().cliImporterManagerMode = ECliImporterManagerMode.RELEASE_MODE;
      // // DEBUG
      // CliConfig.getCliImporterManagerOptions().cliImporterManagerMode = ECliImporterManagerMode.TEST_MODE_KEEP;
      CliConfig.getCliImporterManagerOptions().createApiApplication = false;
      CliConfig.getCliImporterManagerOptions().createApiEventApi = true;
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliImport_DefaultSharedFlag = false;
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliImport_DefaultStateName = ECliImport_TargetLifecycleState.DRAFT;
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliAssetImport_BrokerType = undefined;
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliAssetImport_ChannelDelimiter = undefined;
      CliConfig.getCliImporterManagerOptions().cliTestSetupDomainsForApis = true;
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliAssetsApplicationDomainEnforcementPolicy = ECliAssetsApplicationDomainEnforcementPolicies.STRICT;
      CliConfig.validateConfig();
      const cliImporter = new CliImporterManager(CliConfig.getCliImporterManagerOptions());
      const xvoid: void = await cliImporter.run();
    } catch (e) {
      TestLogger.logMessageWithId(TestLogger.createTestFailMessageForError('error', e));
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should check no new version created for Start_EventApiAsyncApiSpecFile`, async () => {
    try {
      const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({ filePath: Start_EventApiAsyncApiSpecFile });
      const applicationDomain = await EpSdkApplicationDomainsService.getByName({ applicationDomainName: epAsyncApiDocument.getApplicationDomainName()});
      const eventApiVersions = await EpSdkEventApiVersionsService.getVersionsForEventApiName({
        eventApiName: epAsyncApiDocument.getEpApiName(),
        applicationDomainId: applicationDomain.id
      })
      expect(eventApiVersions.length,'eventApiVersions.length not 1').to.equal(1);
    } catch (e) {
      TestLogger.logMessageWithId(TestLogger.createTestFailMessageForError('error', e));
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });
});
