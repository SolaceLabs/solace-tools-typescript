import "mocha";
import { expect } from "chai";
import path from "path";
import fs from 'fs';
import { TestContext, TestUtils } from "@internal/tools/src";
import { TestLogger, TestConfig, TestService } from "../../lib";
import {
  ApiError,
  EventApIsService
} from "@solace-labs/ep-openapi-node";
import { 
  EEpSdkSchemaType,
  EEpSdkTask_TargetState, 
  EpSdkEpEventTask, 
  EpSdkEpEventVersionTask, 
  EpSdkSchemaTask,
  EpSdkSchemaVersionTask,
  EpSdkStatesService,
  IEpSdkEpEventTask_ExecuteReturn,
  IEpSdkEpEventVersionTask_ExecuteReturn,
  IEpSdkSchemaTask_ExecuteReturn,
  IEpSdkSchemaVersionTask_ExecuteReturn,
  EpSdkEventApiTask,
  IEpSdkEventApiTask_ExecuteReturn,
  EpSdkEventApiVersionTask,
  IEpSdkEventApiVersionTask_ExecuteReturn
} from "@solace-labs/ep-sdk";


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId = TestUtils.getShortUUID();

let ApplicationDomainName: string; 
let ApplicationDomainId: string | undefined;
let SchemaName: string;
let SchemaId: string | undefined;
let SchemaVersionId: string | undefined;
let SchemaContentXSD: string;
let EventName: string;
let EventId: string;
let EventVersionId: string;
let EventApiName: string;
let EventApiId: string;
let EventApiVersionId: string;

const initializeGlobals = () => {
  ApplicationDomainName = `${TestConfig.getAppId()}/${TestSpecName}`;
  SchemaName = ApplicationDomainName;
  SchemaContentXSD = TestUtils.readFile(`${TestConfig.getConfig().dataRootDir}/xml-schema.xsd`);
  EventName = ApplicationDomainName;
  EventApiName = ApplicationDomainName;
}

describe(`${scriptName}`, () => {
  
  before(async() => {
    TestContext.newItId();
    initializeGlobals();
    ApplicationDomainId = await TestService.applicationDomainAbsent({ applicationDomainName: ApplicationDomainName });
    ApplicationDomainId = await TestService.applicationDomainPresent({ applicationDomainName: ApplicationDomainName });
    // EventApiId = await TestService.eventApiAbsent({ applicationDomainId: ApplicationDomainId, eventApiName: EventApiName });
    // EventId = await TestService.eventAbsent({ applicationDomainId: ApplicationDomainId, eventName: EventName });
    // SchemaId = await TestService.schemaAbsent({ applicationDomainId: ApplicationDomainId, schemaName: SchemaName });
  });

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async() => {
    TestContext.newItId();
    ApplicationDomainId = await TestService.applicationDomainAbsent({ applicationDomainName: ApplicationDomainName });
  });

  it(`${scriptName}: create xsd/xml schema`, async () => {
    try {
      const epSdkSchemaTask = new EpSdkSchemaTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        schemaName: SchemaName,
        schemaObjectSettings: {
          shared: true,
          schemaType: EEpSdkSchemaType.XSD
        },
      });
      const epSdkSchemaTask_ExecuteReturn: IEpSdkSchemaTask_ExecuteReturn = await epSdkSchemaTask.execute('xContextId');
      SchemaId = epSdkSchemaTask_ExecuteReturn.epObject.id;
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: create xml schema version`, async () => {
    try {
      const epSdkSchemaVersionTask = new EpSdkSchemaVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        schemaId: SchemaId,
        versionString: "0.1.0",
        schemaVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: 'xml schema',
          description: "description",
          content: SchemaContentXSD,
        },
      });
      const epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn = await epSdkSchemaVersionTask.execute('xContextId');
      SchemaVersionId = epSdkSchemaVersionTask_ExecuteReturn.epObject.id;
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: create event`, async () => {
    try {
      const epSdkEpEventTask = new EpSdkEpEventTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventName: EventName,
        eventObjectSettings: { shared: true },
      });
      const epSdkEpEventTask_ExecuteReturn: IEpSdkEpEventTask_ExecuteReturn = await epSdkEpEventTask.execute('xContextId');
      EventId = epSdkEpEventTask_ExecuteReturn.epObject.id;
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: create event version`, async () => {
    try {
      const epSdkEpEventVersionTask = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        versionString: "0.1.0",
        topicString: "test/xml/event",
        eventVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: "description",
          displayName: "displayName",
          schemaVersionId: SchemaVersionId,
        },
      });
      const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn = await epSdkEpEventVersionTask.execute('xContextId');
      EventVersionId = epSdkEpEventVersionTask_ExecuteReturn.epObject.id;
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: create event api`, async () => {
    try {
      const epSdkEventApiTask = new EpSdkEventApiTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventApiName: EventApiName,
        eventApiObjectSettings: { shared: true },
      });
      const epSdkEventApiTask_ExecuteReturn: IEpSdkEventApiTask_ExecuteReturn = await epSdkEventApiTask.execute('xContextId');
      EventApiId = epSdkEventApiTask_ExecuteReturn.epObject.id;
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: create event api version`, async () => {
    try {
      const epSdkEventApiVersionTask = new EpSdkEventApiVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventApiId: EventApiId,
        versionString: "0.1.0",
        eventApiVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: "description",
          displayName: "displayName",
          producedEventVersionIds: [EventVersionId],
          consumedEventVersionIds: [EventVersionId],
        }
      });
      const epSdkEventApiVersionTask_ExecuteReturn: IEpSdkEventApiVersionTask_ExecuteReturn = await epSdkEventApiVersionTask.execute('xContextId');
      EventApiVersionId = epSdkEventApiVersionTask_ExecuteReturn.epObject.id;
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: get event api async api`, async () => {
    try {
      const asyncApiStr: string = await EventApIsService.getAsyncApiForEventApiVersion({ 
        xContextId: 'xContextId',
        eventApiVersionId: EventApiVersionId,
      });
      // parse it
      // get the zip file
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage("failed", e)).to.be.true;
    }
  });

});
