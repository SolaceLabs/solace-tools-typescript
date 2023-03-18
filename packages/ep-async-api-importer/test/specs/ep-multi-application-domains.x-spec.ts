import "mocha";
import { expect } from "chai";
import path from "path";
import {
  ApiError,
  ApplicationsService,
  EventApi,
  EventApIsService,
  EventApiVersion,
} from "@solace-labs/ep-openapi-node";
import { 
  EEpSdkTask_TargetState,
  EpSdkApplicationDomainTask, 
  EpSdkEnumTask, 
  EpSdkEnumVersionTask, 
  EpSdkSchemaTask, 
  EpSdkSchemaVersionTask, 
  EpSdkStatesService, 
  IEpSdkApplicationDomainTask_ExecuteReturn,
  IEpSdkEnumTask_ExecuteReturn,
  IEpSdkEnumVersionTask_ExecuteReturn,
  IEpSdkSchemaTask_ExecuteReturn,
  IEpSdkSchemaVersionTask_ExecuteReturn,
  EpSdkEpEventTask,
  EpSdkBrokerTypes,
  IEpSdkEpEventTask_ExecuteReturn,
  EpSdkEpEventVersionTask,
  IEpSdkEpEventVersionTask_ExecuteReturn,
  EpSdkEventApiTask,
  IEpSdkEventApiTask_ExecuteReturn,
  EpSdkEventApiVersionTask,
  IEpSdkEventApiVersionTask_ExecuteReturn,
  EpSdkApplicationTask,
  IEpSdkApplicationTask_ExecuteReturn,
  EpSdkApplicationVersionTask,
  IEpSdkApplicationVersionTask_ExecuteReturn,
  EpSdkEventApiVersionsService,
  EpSdkError,
  EpSdkEpEventsService,
  EpSdkEvent,
  EpSdkCustomAttributeNameSourceApplicationDomainId,
  EpSdkEventApisService
} from "@solace-labs/ep-sdk";
import { TestContext, TestUtils } from "@internal/tools/src";
import {
  TestConfig,
  TestLogger,
} from "../lib";
import {
  CliConfig,
  CliError,
  CliImporterManager,
  CliRunSummary,
  CliUtils,
  ECliImporterManagerMode,
  ICliRunSummary_Base,
} from "../../src/cli-components";
import { EpAsyncApiDocument, EpAsyncApiDocumentService } from "@solace-labs/ep-asyncapi";

const scriptName: string = path.basename(__filename);
const TestSpecName = scriptName;
const TestSpecId = TestUtils.getShortUUID();
TestLogger.logMessage(scriptName, ">>> starting ...");

let ApplicationDomain_Events_1_Name: string;
let ApplicationDomain_Events_1_Id: string | undefined;
let ApplicationDomain_Events_2_Name: string;
let ApplicationDomain_Events_2_Id: string | undefined;
let ApplicationDomain_Main_Name: string;
let ApplicationDomain_Main_Id: string | undefined;

let Schema_1_Name: string;
let Schema_1_Id: string | undefined;
let SchemaVersion_1_Id: string | undefined;
let Schema_2_Name: string;
let Schema_2_Id: string | undefined;
let SchemaVersion_2_Id: string | undefined;
const SchemaContent = `
{
  "description": "Generic message header.",
  "type": "object",
  "properties": {
    "sentAt": {
      "type": "string",
      "format": "date-time",
      "description": "Date and time when the message was sent."
    },
    "transactionId": {
      "type": "string",
      "description": "The transaction id."
    },
    "storeId": {
      "type": "string",
      "description": "The store id."
    }
  },
  "required": [
    "sentAt",
    "transactionId",
    "storeId"
  ]
}
`;

let Enum_1_Name: string;
let Enum_1_Id: string | undefined;
let EnumVersion_1_Id: string | undefined;
let Enum_2_Name: string;
let Enum_2_Id: string | undefined;
let EnumVersion_2_Id: string | undefined;
const EnumValues = ['value1', 'value2'];

let Event_1_Name: string;
let Event_1_Id: string | undefined;
let EventVersion_1_Id: string | undefined;
let Event_2_Name: string;
let Event_2_Id: string | undefined;
let EventVersion_2_Id: string | undefined;
let TopicString_1: string;
let TopicString_2: string;

let EventApi_Name: string;
let EventApi_Id: string | undefined;
let EventApiVersion_Id: string | undefined;
let EventApiSpec: any;
let CopiedEventApi_Id: string | undefined;

let App_Name: string;
let App_Id: string | undefined;
let AppVersion_Id: string | undefined;
let AppApiSpec: any;

let ApplicationDomain_Copy_Name: string;
let ApplicationDomain_Copy_Id: string;

let EventApiAsyncApiSpecFileNameJson: string;
let AppAsyncApiSpecFileNameJson: string;
// let AsyncApiSpecFile_X_EpApplicationDomainName: string;
// let AsyncApiSpecFile_X_EpAssetApplicationDomainName: string;




const initializeGlobals = () => {
  ApplicationDomain_Events_1_Name = `${TestConfig.getAppId()}/${TestSpecName}/Consumed_Events_1_Name`;
  ApplicationDomain_Events_2_Name = `${TestConfig.getAppId()}/${TestSpecName}/Consumed_Events_2_Name`;
  ApplicationDomain_Main_Name = `${TestConfig.getAppId()}/${TestSpecName}/ApplicationDomain_Main_Name`;
  ApplicationDomain_Copy_Name = `${TestConfig.getAppId()}/${TestSpecName}/ApplicationDomain_Copy_Name`;

  Schema_1_Name = 'Consumed_Schema_1_Name';
  Schema_2_Name = 'Consumed_Schema_2_Name';

  Enum_1_Name = 'Consumed_Enum_1_Name';
  Enum_2_Name = 'Consumed_Enum_2_Name';

  Event_1_Name = 'Consumed_Event_1_Name';
  Event_2_Name = 'Consumed_Event_2_Name';
  TopicString_1 = 'consumed/topic/{Consumed_Enum_1_Name}/_1_';
  TopicString_2 = 'consumed/topic/{Consumed_Enum_2_Name}/_2_';

  EventApi_Name = "EventApi_Name";
  App_Name = "App_Name";

};

const applicationDomainTasks = async(epSdkTask_TargetState: EEpSdkTask_TargetState) => {
  // reverse the order for absent / present
  if(epSdkTask_TargetState === EEpSdkTask_TargetState.PRESENT) {
    const task_1 = new EpSdkApplicationDomainTask({
      applicationDomainName: ApplicationDomain_Events_1_Name,
      epSdkTask_TargetState: epSdkTask_TargetState
    });
    const task1_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await task_1.execute('xContextId');
    ApplicationDomain_Events_1_Id = task1_ExecuteReturn.epObject.id;
  
    const task_2 = new EpSdkApplicationDomainTask({
      applicationDomainName: ApplicationDomain_Events_2_Name,
      epSdkTask_TargetState: epSdkTask_TargetState
    });
    const task2_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await task_2.execute('xContextId');
    ApplicationDomain_Events_2_Id = task2_ExecuteReturn.epObject.id;
  
    const task_3 = new EpSdkApplicationDomainTask({
      applicationDomainName: ApplicationDomain_Main_Name,
      epSdkTask_TargetState: epSdkTask_TargetState
    });
    const task3_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await task_3.execute('xContextId');
    ApplicationDomain_Main_Id = task3_ExecuteReturn.epObject.id;
  
    const task_4 = new EpSdkApplicationDomainTask({
      applicationDomainName: ApplicationDomain_Copy_Name,
      epSdkTask_TargetState: epSdkTask_TargetState
    });
    const task4_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await task_4.execute('xContextId');
    ApplicationDomain_Copy_Id = task4_ExecuteReturn.epObject.id;  
  } else {
    const task_4 = new EpSdkApplicationDomainTask({
      applicationDomainName: ApplicationDomain_Copy_Name,
      epSdkTask_TargetState: epSdkTask_TargetState
    });
    const task4_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await task_4.execute('xContextId');
    ApplicationDomain_Copy_Id = task4_ExecuteReturn.epObject ? task4_ExecuteReturn.epObject.id : undefined;  
    
    const task_3 = new EpSdkApplicationDomainTask({
      applicationDomainName: ApplicationDomain_Main_Name,
      epSdkTask_TargetState: epSdkTask_TargetState
    });
    const task3_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await task_3.execute('xContextId');
    ApplicationDomain_Main_Id = task3_ExecuteReturn.epObject ? task3_ExecuteReturn.epObject.id : undefined;
  
    const task_2 = new EpSdkApplicationDomainTask({
      applicationDomainName: ApplicationDomain_Events_2_Name,
      epSdkTask_TargetState: epSdkTask_TargetState
    });
    const task2_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await task_2.execute('xContextId');
    ApplicationDomain_Events_2_Id = task2_ExecuteReturn.epObject ? task2_ExecuteReturn.epObject.id : undefined;
  
    const task_1 = new EpSdkApplicationDomainTask({
      applicationDomainName: ApplicationDomain_Events_1_Name,
      epSdkTask_TargetState: epSdkTask_TargetState
    });
    const task1_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await task_1.execute('xContextId');
    ApplicationDomain_Events_1_Id = task1_ExecuteReturn.epObject ? task1_ExecuteReturn.epObject.id : undefined;
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
    // await applicationDomainTasks(EEpSdkTask_TargetState.ABSENT);
  });

  it(`${scriptName}: should setup the domains`, async () => {
    try {
      await applicationDomainTasks(EEpSdkTask_TargetState.ABSENT);
      await applicationDomainTasks(EEpSdkTask_TargetState.PRESENT);
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should create the schemas & versions`, async () => {
    try {
      const task_1 = new EpSdkSchemaTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomain_Events_1_Id,
        schemaName: Schema_1_Name,
        schemaObjectSettings: {
          shared: true,
        },
      });
      const task_1_ExecuteReturn: IEpSdkSchemaTask_ExecuteReturn = await task_1.execute();
      Schema_1_Id = task_1_ExecuteReturn.epObject.id;

      const task_1_1 = new EpSdkSchemaVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomain_Events_1_Id,
        schemaId: Schema_1_Id,
        versionString: "1.0.0",
        schemaVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: 'Schema_1_Id',
          description: 'Schema_1_Id',
          content: SchemaContent,
        },
      });
      const task_1_1_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn = await task_1_1.execute();
      SchemaVersion_1_Id = task_1_1_ExecuteReturn.epObject.id;

      const task_2 = new EpSdkSchemaTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomain_Events_2_Id,
        schemaName: Schema_2_Name,
        schemaObjectSettings: {
          shared: true,
        },
      });
      const task_2_ExecuteReturn: IEpSdkSchemaTask_ExecuteReturn = await task_2.execute();
      Schema_2_Id = task_2_ExecuteReturn.epObject.id;

      const task_2_1 = new EpSdkSchemaVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomain_Events_2_Id,
        schemaId: Schema_2_Id,
        versionString: "1.0.0",
        schemaVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: 'Schema_2_Id',
          description: 'Schema_2_Id',
          content: SchemaContent,
        },
      });
      const task_2_1_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn = await task_2_1.execute();
      SchemaVersion_2_Id = task_2_1_ExecuteReturn.epObject.id;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should create the enums & versions`, async () => {
    try {
      const task_1 = new EpSdkEnumTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomain_Events_1_Id,
        enumName: Enum_1_Name,
        enumObjectSettings: {
          shared: true,          
        }
      });
      const task_1_ExecuteReturn: IEpSdkEnumTask_ExecuteReturn = await task_1.execute();
      Enum_1_Id = task_1_ExecuteReturn.epObject.id;
      const task_1_1 = new EpSdkEnumVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomain_Events_1_Id,
        enumId: Enum_1_Id,
        versionString: "1.0.0",
        enumVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: 'Enum_1_Id',
          description: 'Enum_1_Id',
        },
        enumValues: EnumValues
      });
      const task_1_1_ExecuteReturn: IEpSdkEnumVersionTask_ExecuteReturn = await task_1_1.execute();
      EnumVersion_1_Id = task_1_1_ExecuteReturn.epObject.id;

      const task_2 = new EpSdkEnumTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomain_Events_2_Id,
        enumName: Enum_2_Name,
        enumObjectSettings: {
          shared: true,          
        }
      });
      const task_2_ExecuteReturn: IEpSdkEnumTask_ExecuteReturn = await task_2.execute();
      Enum_2_Id = task_2_ExecuteReturn.epObject.id;
      const task_2_1 = new EpSdkEnumVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomain_Events_2_Id,
        enumId: Enum_2_Id,
        versionString: "1.0.0",
        enumVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: 'Enum_2_Id',
          description: 'Enum_2_Id',
        },
        enumValues: EnumValues
      });
      const task_2_1_ExecuteReturn: IEpSdkEnumVersionTask_ExecuteReturn = await task_2_1.execute();
      EnumVersion_2_Id = task_2_1_ExecuteReturn.epObject.id;

    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should create the events & versions`, async () => {
    try {
      const task_1 = new EpSdkEpEventTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomain_Events_1_Id,
        eventName: Event_1_Name,
        eventObjectSettings: {
          brokerType: EpSdkBrokerTypes.Solace,
          shared: true
        }
      });
      const task_1_ExecuteReturn: IEpSdkEpEventTask_ExecuteReturn = await task_1.execute();
      Event_1_Id = task_1_ExecuteReturn.epObject.id;
      const task_1_1 = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomain_Events_1_Id,
        eventId: Event_1_Id,
        versionString: "1.0.0",
        eventVersionSettings: {
          displayName: 'Event_1_Id',
          description: 'Event_1_Id',
          schemaVersionId: SchemaVersion_1_Id,
          stateId: EpSdkStatesService.releasedId,
        },
        topicString: TopicString_1
      });
      const task_1_1_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn = await task_1_1.execute();
      EventVersion_1_Id = task_1_1_ExecuteReturn.epObject.id;

      const task_2 = new EpSdkEpEventTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomain_Events_2_Id,
        eventName: Event_2_Name,
        eventObjectSettings: {
          brokerType: EpSdkBrokerTypes.Solace,
          shared: true
        }
      });
      const task_2_ExecuteReturn: IEpSdkEpEventTask_ExecuteReturn = await task_2.execute();
      Event_2_Id = task_2_ExecuteReturn.epObject.id;
      const task_2_1 = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomain_Events_2_Id,
        eventId: Event_2_Id,
        versionString: "1.0.0",
        eventVersionSettings: {
          displayName: 'Event_2_Id',
          description: 'Event_2_Id',
          schemaVersionId: SchemaVersion_2_Id,
          stateId: EpSdkStatesService.releasedId,
        },
        topicString: TopicString_2
      });
      const task_2_1_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn = await task_2_1.execute();
      EventVersion_2_Id = task_2_1_ExecuteReturn.epObject.id;

    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should create the event api & version`, async () => {
    try {
      const task_1 = new EpSdkEventApiTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomain_Main_Id,
        eventApiName: EventApi_Name,
        eventApiObjectSettings: {
          brokerType: EventApi.brokerType.SOLACE,
          shared: true
        }
      });
      const task_1_ExecuteReturn: IEpSdkEventApiTask_ExecuteReturn = await task_1.execute();
      EventApi_Id = task_1_ExecuteReturn.epObject.id;
      const task_1_1 = new EpSdkEventApiVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomain_Main_Id,
        eventApiId: EventApi_Id,
        versionString: "1.0.0",
        eventApiVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: 'EventApi_Id',
          description: 'EventApi_Id',
          consumedEventVersionIds: [],
          producedEventVersionIds: [EventVersion_1_Id, EventVersion_2_Id],
        }
      });
      const task_1_1_ExecuteReturn: IEpSdkEventApiVersionTask_ExecuteReturn = await task_1_1.execute();
      EventApiVersion_Id = task_1_1_ExecuteReturn.epObject.id;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  xit(`${scriptName}: should deep copy event api version`, async () => {
    try {
      const copiedEventApiVersion: EventApiVersion | undefined = await EpSdkEventApiVersionsService.deepCopyLastestVersionById_IfNotExists({
        eventApiName: EventApi_Name,
        fromApplicationDomainId: ApplicationDomain_Main_Id,
        toApplicationDomainId: ApplicationDomain_Copy_Id,
      });
      expect(copiedEventApiVersion, 'copy failed').to.not.be.undefined;
      CopiedEventApi_Id = copiedEventApiVersion.id;
      expect(CopiedEventApi_Id, 'api content error').to.not.be.undefined;
      // check that the attribute is set on the EventApi object
      const eventApi: EventApi = await EpSdkEventApisService.getById({ eventApiId: copiedEventApiVersion.eventApiId });
      expect(eventApi, 'EventApi is undefined').to.not.be.undefined;
      const customAttributesStr = JSON.stringify(eventApi.customAttributes);
      expect(customAttributesStr, 'source attribute not found in eventApi').to.include(EpSdkCustomAttributeNameSourceApplicationDomainId)
      // const copiedApplicationVersion: ApplicationVersion | undefined = await EpSdkApplicationVersionsService.deepCopyLastestVersionById_IfNotExists({
      //   eventApiName: EventApi_Name,
      //   fromApplicationDomainId: ApplicationDomain_Main_Id,
      //   toApplicationDomainId: ApplicationDomain_Copy_Id,
      // });
    } catch (e) {
      TestLogger.logMessageWithId(TestLogger.createTestFailMessageForError('error', e));
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should create the app & version`, async () => {
    try {
      const task_1 = new EpSdkApplicationTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomain_Main_Id,
        applicationName: App_Name,
        applicationObjectSettings: {
          brokerType: EventApi.brokerType.SOLACE,
          applicationType: "standard",
        }
      });
      const task_1_ExecuteReturn: IEpSdkApplicationTask_ExecuteReturn = await task_1.execute();
      App_Id = task_1_ExecuteReturn.epObject.id;
      const task_1_1 = new EpSdkApplicationVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomain_Main_Id,
        applicationId: App_Id,
        versionString: "1.0.0",
        applicationVersionSettings: {
          displayName: 'App_Id',
          description: 'App_Id',
          declaredConsumedEventVersionIds: [EventVersion_1_Id, EventVersion_2_Id],
          declaredProducedEventVersionIds: [],
          stateId: EpSdkStatesService.releasedId,
        }
      });
      const task_1_1_ExecuteReturn: IEpSdkApplicationVersionTask_ExecuteReturn = await task_1_1.execute();
      AppVersion_Id = task_1_1_ExecuteReturn.epObject.id;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should get the application version api spec`, async () => {
    try {
      AppApiSpec = await ApplicationsService.getAsyncApiForApplicationVersion({
        applicationVersionId: AppVersion_Id
      })
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should parse the application version api spec and save it to file`, async () => {
    try {
      const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromAny({ 
        anySpec: AppApiSpec
      });
      const applicationDomainName = epAsyncApiDocument.getApplicationDomainName();
      const assetsApplicationDomainName = epAsyncApiDocument.getAssetsApplicationDomainName();

      AppAsyncApiSpecFileNameJson = TestConfig.getConfig().tmpDir + "/" + epAsyncApiDocument.getEpApiNameAsFileName("json");
      CliUtils.saveContents2File({
        filePath: AppAsyncApiSpecFileNameJson,
        content: JSON.stringify(epAsyncApiDocument.getOriginalSpecAsJson(), null, 2 ),
      });
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should get the event api spec`, async () => {
    try {
      EventApiSpec = await EventApIsService.getAsyncApiForEventApiVersion({
        eventApiVersionId: EventApiVersion_Id,
      });
      // console.log(`EventApiSpec = ${JSON.stringify(EventApiSpec, null, 2)}`);
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should parse the event api spec and save it to file`, async () => {
    try {
      const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromAny({ 
        anySpec: EventApiSpec
      });
      const applicationDomainName = epAsyncApiDocument.getApplicationDomainName();
      const assetsApplicationDomainName = epAsyncApiDocument.getAssetsApplicationDomainName();

      EventApiAsyncApiSpecFileNameJson = TestConfig.getConfig().tmpDir + "/" + epAsyncApiDocument.getEpApiNameAsFileName("json");
      CliUtils.saveContents2File({
        filePath: EventApiAsyncApiSpecFileNameJson,
        content: JSON.stringify(epAsyncApiDocument.getOriginalSpecAsJson(), null, 2 ),
      });
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });


  it(`${scriptName}: should import event api spec without any changes`, async () => {
    try {
      CliConfig.getCliImporterManagerOptions().asyncApiFileList = [EventApiAsyncApiSpecFileNameJson];
      CliConfig.getCliImporterManagerOptions().cliImporterManagerMode = ECliImporterManagerMode.RELEASE_MODE;
      // CliConfig.getCliImporterManagerOptions().runId = scriptName;
      // // DEBUG
      CliConfig.getCliImporterManagerOptions().cliImporterManagerMode = ECliImporterManagerMode.TEST_MODE_KEEP;
      // CliConfig.getCliImporterManagerOptions().applicationDomainName = 'release_mode';
      CliConfig.getCliImporterManagerOptions().createApiApplication = false;
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliAssetImport_BrokerType = undefined;
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliAssetImport_ChannelDelimiter = undefined;

      const cliImporter = new CliImporterManager(CliConfig.getCliImporterManagerOptions());
      const xvoid: void = await cliImporter.run();
      // // DEBUG
      // const cliRunSummaryList: Array<ICliRunSummary_Base> = CliRunSummary.getSummaryLogList();
      // expect(false, JSON.stringify(cliRunSummaryList, null, 2)).to.be.true;

      expect(false, "not idempotent - needs to respect source app domains of all objects").to.be.true;
    } catch (e) {
      TestLogger.logMessageWithId(TestLogger.createTestFailMessageForError('error', e));
      expect( e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError("failed", e)).to.be.true;
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: continue here`, async () => {
    expect(false, "continue here").to.be.true;
  });



});
