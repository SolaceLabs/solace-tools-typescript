import "mocha";
import { expect } from "chai";
import path from "path";
import {
  ApiError, SchemasResponse, SchemasService,
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
  ECliImporterManagerMode,
} from "../../src/cli-components";

const scriptName: string = path.basename(__filename);
const TestSpecName = scriptName;
const TestSpecId = TestUtils.getShortUUID();
TestLogger.logMessage(scriptName, ">>> starting ...");

let Start_EventApiAsyncApiSpecFile: string;
let Update_1_EventApiAsyncApiSpecFile: string;
let Update_2_EventApiAsyncApiSpecFile: string;
let Start_AppAsyncApiSpecFile: string;
let Update_1_AppAsyncApiSpecFile: string;
let Update_2_AppAsyncApiSpecFile: string;
let Update_3_AppAsyncApiSpecFile: string;
const Update_3_AppAsyncApiSpecFile_Updated_Schema_Name = "Consumed_Schema_1_Name";

const TestApplicationDomainNames: Array<string> = [];

const initializeGlobals = () => {
  Start_EventApiAsyncApiSpecFile = TestService.validateFilePathWithReadPermission(`${TestConfig.getConfig().dataRootDir}/multi-domain-manual/multi-domain-event-api.start.spec.yml`);
  Update_1_EventApiAsyncApiSpecFile = TestService.validateFilePathWithReadPermission(`${TestConfig.getConfig().dataRootDir}/multi-domain-manual/multi-domain-event-api.update-1.spec.yml`);
  Update_2_EventApiAsyncApiSpecFile = TestService.validateFilePathWithReadPermission(`${TestConfig.getConfig().dataRootDir}/multi-domain-manual/multi-domain-event-api.update-2.spec.yml`);

  Start_AppAsyncApiSpecFile = TestService.validateFilePathWithReadPermission(`${TestConfig.getConfig().dataRootDir}/multi-domain-manual/multi-domain-app.start.spec.yml`);
  Update_1_AppAsyncApiSpecFile = TestService.validateFilePathWithReadPermission(`${TestConfig.getConfig().dataRootDir}/multi-domain-manual/multi-domain-app.update-1.spec.yml`);
  Update_2_AppAsyncApiSpecFile = TestService.validateFilePathWithReadPermission(`${TestConfig.getConfig().dataRootDir}/multi-domain-manual/multi-domain-app.update-2.spec.yml`);
  Update_3_AppAsyncApiSpecFile = TestService.validateFilePathWithReadPermission(`${TestConfig.getConfig().dataRootDir}/multi-domain-manual/multi-domain-app.update-3.spec.yml`);
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
      console.log(`e=${JSON.stringify(e, null, 2)}`);
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
    await absentApplicationDomains();
  });

  it(`${scriptName}: should parse the Start_EventApiAsyncApiSpecFile and remove domains`, async () => {
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
          expect(epAsyncApiChannelParameterDocument.getEpApplicationDomainName(), `failed for key=${key}`).to.not.be.undefined;  
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
      // console.log(`TestApplicationDomainNames=${JSON.stringify(TestApplicationDomainNames, null, 2)}`);
      try { await absentApplicationDomains(); } catch(e) { console.log(`e=${JSON.stringify(e, null, 2)}`)}
      try { await absentApplicationDomains(); } catch(e) { console.log(`e=${JSON.stringify(e, null, 2)}`)}
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should import Start_EventApiAsyncApiSpecFile`, async () => {
    try {
      CliConfig.getCliImporterManagerOptions().asyncApiFileList = [Start_EventApiAsyncApiSpecFile];
      CliConfig.getCliImporterManagerOptions().cliImporterManagerMode = ECliImporterManagerMode.RELEASE_MODE;
      CliConfig.getCliImporterManagerOptions().applicationDomainName = undefined;
      CliConfig.getCliImporterManagerOptions().assetApplicationDomainName = undefined;    
      // // DEBUG
      // CliConfig.getCliImporterManagerOptions().cliImporterManagerMode = ECliImporterManagerMode.TEST_MODE_KEEP;
      CliConfig.getCliImporterManagerOptions().createApiApplication = false;
      CliConfig.getCliImporterManagerOptions().createApiEventApi = true;
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliAssetImport_BrokerType = undefined;
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliAssetImport_ChannelDelimiter = undefined;

      const cliImporter = new CliImporterManager(CliConfig.getCliImporterManagerOptions());
      const xvoid: void = await cliImporter.run();
    } catch (e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should import Start_EventApiAsyncApiSpecFile again, test idempotency`, async () => {
    try {
      const cliImporter = new CliImporterManager(CliConfig.getCliImporterManagerOptions());
      const xvoid: void = await cliImporter.run();
    } catch (e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should check no new version created for Start_EventApiAsyncApiSpecFile`, async () => {
    try {
      const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({ 
        filePath: Start_EventApiAsyncApiSpecFile
      });
      const applicationDomain = await EpSdkApplicationDomainsService.getByName({ 
        applicationDomainName: epAsyncApiDocument.getApplicationDomainName()
      });
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

  it(`${scriptName}: should import Update_1_EventApiAsyncApiSpecFile`, async () => {
    try {
      CliConfig.getCliImporterManagerOptions().asyncApiFileList = [Update_1_EventApiAsyncApiSpecFile];
      const cliImporter = new CliImporterManager(CliConfig.getCliImporterManagerOptions());
      const xvoid: void = await cliImporter.run();
    } catch (e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should import Update_1_EventApiAsyncApiSpecFile again, test idempotency`, async () => {
    try {
      const cliImporter = new CliImporterManager(CliConfig.getCliImporterManagerOptions());
      const xvoid: void = await cliImporter.run();
    } catch (e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should check a new version was created for Update_1_EventApiAsyncApiSpecFile`, async () => {
    try {
      const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({ 
        filePath: Update_1_EventApiAsyncApiSpecFile
      });
      const applicationDomain = await EpSdkApplicationDomainsService.getByName({ 
        applicationDomainName: epAsyncApiDocument.getApplicationDomainName()
      });
      const eventApiVersions = await EpSdkEventApiVersionsService.getVersionsForEventApiName({
        eventApiName: epAsyncApiDocument.getEpApiName(),
        applicationDomainId: applicationDomain.id
      })
      expect(eventApiVersions.length,'eventApiVersions.length not 2').to.equal(2);
    } catch (e) {
      TestLogger.logMessageWithId(TestLogger.createTestFailMessageForError('error', e));
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should import Update_2_EventApiAsyncApiSpecFile`, async () => {
    try {
      CliConfig.getCliImporterManagerOptions().asyncApiFileList = [Update_2_EventApiAsyncApiSpecFile];
      const cliImporter = new CliImporterManager(CliConfig.getCliImporterManagerOptions());
      const xvoid: void = await cliImporter.run();
    } catch (e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should import Update_2_EventApiAsyncApiSpecFile again, test idempotency`, async () => {
    try {
      const cliImporter = new CliImporterManager(CliConfig.getCliImporterManagerOptions());
      const xvoid: void = await cliImporter.run();
    } catch (e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should check a new version was created for Update_2_EventApiAsyncApiSpecFile`, async () => {
    try {
      const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({ 
        filePath: Update_2_EventApiAsyncApiSpecFile
      });
      const applicationDomain = await EpSdkApplicationDomainsService.getByName({ 
        applicationDomainName: epAsyncApiDocument.getApplicationDomainName()
      });
      const eventApiVersions = await EpSdkEventApiVersionsService.getVersionsForEventApiName({
        eventApiName: epAsyncApiDocument.getEpApiName(),
        applicationDomainId: applicationDomain.id
      })
      expect(eventApiVersions.length,'eventApiVersions.length not 3').to.equal(3);
    } catch (e) {
      TestLogger.logMessageWithId(TestLogger.createTestFailMessageForError('error', e));
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
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
      try {
        await absentApplicationDomains();
      } catch(e) {}
      try {
        await absentApplicationDomains();
      } catch(e) {}
    } catch (e) {
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
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliAssetImport_BrokerType = undefined;
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliAssetImport_ChannelDelimiter = undefined;

      const cliImporter = new CliImporterManager(CliConfig.getCliImporterManagerOptions());
      const xvoid: void = await cliImporter.run();
    } catch (e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should import Start_AppAsyncApiSpecFile again, test idempotency`, async () => {
    try {
      const cliImporter = new CliImporterManager(CliConfig.getCliImporterManagerOptions());
      const xvoid: void = await cliImporter.run();
    } catch (e) {
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

  it(`${scriptName}: should import Update_1_AppAsyncApiSpecFile`, async () => {
    try {
      CliConfig.getCliImporterManagerOptions().asyncApiFileList = [Update_1_AppAsyncApiSpecFile];
      const cliImporter = new CliImporterManager(CliConfig.getCliImporterManagerOptions());
      const xvoid: void = await cliImporter.run();
    } catch (e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should import Update_1_AppAsyncApiSpecFile again, test idempotency`, async () => {
    try {
      const cliImporter = new CliImporterManager(CliConfig.getCliImporterManagerOptions());
      const xvoid: void = await cliImporter.run();
    } catch (e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should check a new version was created for Update_1_AppAsyncApiSpecFile`, async () => {
    try {
      const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({ 
        filePath: Update_1_AppAsyncApiSpecFile
      });
      const applicationDomain = await EpSdkApplicationDomainsService.getByName({ 
        applicationDomainName: epAsyncApiDocument.getApplicationDomainName()
      });
      // console.log('\n\n\n\n******************************')
      // console.log(`epAsyncApiDocument.getApplicationDomainName()=${epAsyncApiDocument.getApplicationDomainName()}`);
      // console.log(`epAsyncApiDocument.getEpApiName()=${epAsyncApiDocument.getEpApiName()}`);
      // console.log(`applicationDomain=${JSON.stringify(applicationDomain, null, 2)}`);
      // console.log('\n\n\n\n******************************')
      const applicationVersions = await EpSdkApplicationVersionsService.getVersionsForApplicationName({
        applicationName: epAsyncApiDocument.getEpApiName(),
        applicationDomainId: applicationDomain.id
      })
      expect(applicationVersions.length,'applicationVersions.length not 2').to.equal(2);
    } catch (e) {
      TestLogger.logMessageWithId(TestLogger.createTestFailMessageForError('error', e));
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should import Update_2_AppAsyncApiSpecFile`, async () => {
    try {
      CliConfig.getCliImporterManagerOptions().asyncApiFileList = [Update_2_AppAsyncApiSpecFile];
      const cliImporter = new CliImporterManager(CliConfig.getCliImporterManagerOptions());
      const xvoid: void = await cliImporter.run();
    } catch (e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should import Update_2_AppAsyncApiSpecFile again, test idempotency`, async () => {
    try {
      const cliImporter = new CliImporterManager(CliConfig.getCliImporterManagerOptions());
      const xvoid: void = await cliImporter.run();
    } catch (e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError("failed", e)).to.be.true;
    }
  });


  it(`${scriptName}: should check a new version was created for Update_2_AppAsyncApiSpecFile`, async () => {
    try {
      const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({ 
        filePath: Update_3_AppAsyncApiSpecFile
      });
      const applicationDomain = await EpSdkApplicationDomainsService.getByName({ 
        applicationDomainName: epAsyncApiDocument.getApplicationDomainName()
      });
      const applicationVersions = await EpSdkApplicationVersionsService.getVersionsForApplicationName({
        applicationName: epAsyncApiDocument.getEpApiName(),
        applicationDomainId: applicationDomain.id
      })
      expect(applicationVersions.length,'applicationVersions.length not 3').to.equal(3);
    } catch (e) {
      TestLogger.logMessageWithId(TestLogger.createTestFailMessageForError('error', e));
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should import Update_3_AppAsyncApiSpecFile`, async () => {
    try {
      CliConfig.getCliImporterManagerOptions().asyncApiFileList = [Update_3_AppAsyncApiSpecFile];
      const cliImporter = new CliImporterManager(CliConfig.getCliImporterManagerOptions());
      const xvoid: void = await cliImporter.run();
    } catch (e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should import Update_3_AppAsyncApiSpecFile again, test idempotency`, async () => {
    try {
      const cliImporter = new CliImporterManager(CliConfig.getCliImporterManagerOptions());
      const xvoid: void = await cliImporter.run();
    } catch (e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should check a new version was created for Update_3_AppAsyncApiSpecFile`, async () => {
    try {
      const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({ 
        filePath: Update_3_AppAsyncApiSpecFile
      });
      const applicationDomain = await EpSdkApplicationDomainsService.getByName({ 
        applicationDomainName: epAsyncApiDocument.getApplicationDomainName()
      });
      const applicationVersions = await EpSdkApplicationVersionsService.getVersionsForApplicationName({
        applicationName: epAsyncApiDocument.getEpApiName(),
        applicationDomainId: applicationDomain.id
      })
      expect(applicationVersions.length,'applicationVersions.length not 4').to.equal(4);
    } catch (e) {
      TestLogger.logMessageWithId(TestLogger.createTestFailMessageForError('error', e));
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should check a new schema version of Update_3_AppAsyncApiSpecFile_Updated_Schema_Name was created for Update_3_AppAsyncApiSpecFile`, async () => {
    try {
      const schemasResponse: SchemasResponse = await SchemasService.getSchemas({
        name: Update_3_AppAsyncApiSpecFile_Updated_Schema_Name,
      });
      const schemaObjects = schemasResponse.data;
      expect(schemaObjects.length, `wrong number of schemas for schema name ${Update_3_AppAsyncApiSpecFile_Updated_Schema_Name}`).to.equal(1);
      const schemaObject = schemaObjects[0];
      const schemaVersionsResponse = await SchemasService.getSchemaVersions({
        schemaIds: [schemaObject.id]
      });
      const schemaVersionList = schemaVersionsResponse.data;
      expect(schemaVersionList.length, `wrong number of schema versions, schemaName=${Update_3_AppAsyncApiSpecFile_Updated_Schema_Name}, schemaVersionList=${JSON.stringify(schemaVersionList, null, 2)}`).to.equal(2);
    } catch (e) {
      TestLogger.logMessageWithId(TestLogger.createTestFailMessageForError('error', e));
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

});
