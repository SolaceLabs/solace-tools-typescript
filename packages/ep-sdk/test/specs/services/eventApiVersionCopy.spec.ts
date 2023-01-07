import 'mocha';
import { expect } from 'chai';
import path from 'path';
import {
  TestContext,
  TestUtils
} from '@internal/tools/src';
import { 
  TestLogger,
  TestConfig,
} from '../../lib';
import { 
  ApiError, 
  EnumsService, 
  EventApisResponse, 
  EventApIsService, 
  EventApiVersion, 
  EventsResponse, 
  EventsService, 
  SchemasResponse, 
  SchemasService, 
  TopicAddressEnumsResponse, 
} from '@rjgu/ep-openapi-node';
import { 
  EpSdkError,
  EpSdkApplicationDomainsService,
  EpSdkStatesService,
  EpSdkApplicationDomainTask,
  IEpSdkApplicationDomainTask_ExecuteReturn,
  EEpSdkTask_TargetState,
  EEpSdk_VersionTaskStrategy,
  EpSdkSchemaTask, 
  IEpSdkSchemaTask_ExecuteReturn,
  EpSdkSchemaVersionTask,
  IEpSdkSchemaVersionTask_ExecuteReturn,
  EpSdkEnumTask,
  IEpSdkEnumTask_ExecuteReturn,
  EpSdkEnumVersionTask,
  IEpSdkEnumVersionTask_ExecuteReturn,
  EpSdkEpEventTask,
  IEpSdkEpEventTask_ExecuteReturn,
  EpSdkEpEventVersionTask,
  IEpSdkEpEventVersionTask_ExecuteReturn,
  EpSdkSemVerUtils,
  EpSdkEventApiTask,
  IEpSdkEventApiTask_ExecuteReturn,
  EpSdkEventApiVersionTask,
  IEpSdkEventApiVersionTask_ExecuteReturn,
  EpSdkEventApiVersionsService,
} from '../../../src';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId: string = TestUtils.getUUID();
let SourceApplicationDomainName: string;
let SourceApplicationDomainId: string | undefined;
let TargetApplicationDomainName: string;
let TargetApplicationDomainId: string | undefined;
let SourceAssetsApplicationDomainName: string;
let SourceAssetsApplicationDomainId: string | undefined;
let TargetAssetsApplicationDomainName: string;
let TargetAssetsApplicationDomainId: string | undefined;

type TVersionInfo = {
  versionString: string;
  versionId?: string;
}
type TEnumInfo = {
  enumName: string;
  enumValues: Array<string>;
  versionInfoList: Array<TVersionInfo>;
  sourceEnumId?: string;
  targetEnumId?: string;
}
const EnumInfoList: Array<TEnumInfo> = [
  { enumName: '_enum_name_0_', versionInfoList: [{ versionString: '1.0.0' }, { versionString: '1.1.0' }], enumValues: ['_enum_name_0_one', '_enum_name_0_two', '_enum_name_0_three'] },
  { enumName: '_enum_name_1_', versionInfoList: [{ versionString: '1.0.0' }, { versionString: '1.1.0' }], enumValues: ['_enum_name_1_one', '_enum_name_1_two', '_enum_name_1_three'] },
  { enumName: '_enum_name_2_', versionInfoList: [{ versionString: '1.0.0' }, { versionString: '1.1.0' }], enumValues: ['_enum_name_2_one', '_enum_name_2_two', '_enum_name_2_three'] },
];

const SchemaContent = `
{
  "type": "object",
  "properties": {
    "hello": {
      "type": "string"
    }
  }
}
`;
type TSchemaInfo = {
  schemaName: string;
  schemaContent: string;
  versionInfoList: Array<TVersionInfo>;
  sourceSchemaId?: string;
  targetSchemaId?: string;
}
const SchemaInfoList: Array<TSchemaInfo> = [
  { schemaName: '_schema_name_0_', versionInfoList: [{ versionString: '1.0.0' }, { versionString: '1.1.0' }], schemaContent: SchemaContent },
  { schemaName: '_schema_name_1_', versionInfoList: [{ versionString: '1.0.0' }, { versionString: '1.1.0' }], schemaContent: SchemaContent },
  { schemaName: '_schema_name_2_', versionInfoList: [{ versionString: '1.0.0' }, { versionString: '1.1.0' }], schemaContent: SchemaContent },
];

type TEventInfo = {
  eventName: string;
  versionInfoList: Array<TVersionInfo>;
  sourceEventId?: string;
  targetEventId?: string;
}
const EventInfoList: Array<TEventInfo> = [
  { eventName: '_event_name_0_', versionInfoList: [{ versionString: '1.0.0' }, { versionString: '1.1.0' }] },
  { eventName: '_event_name_1_', versionInfoList: [{ versionString: '1.0.0' }, { versionString: '1.1.0' }] },
  { eventName: '_event_name_2_', versionInfoList: [{ versionString: '1.0.0' }, { versionString: '1.1.0' }] },
];

type TEventApiInfo = {
  eventApiName: string;
  versionInfoList: Array<TVersionInfo>;
  sourceEventApiId?: string;
  targetEventApiId?: string;
}
const EventApiInfoList: Array<TEventApiInfo> = [
  { eventApiName: '_event_api_name_0_', versionInfoList: [{ versionString: '1.0.0' }, { versionString: '1.1.0' }] },
  { eventApiName: '_event_api_name_1_', versionInfoList: [{ versionString: '1.0.0' }, { versionString: '1.1.0' }] },
  { eventApiName: '_event_api_name_2_', versionInfoList: [{ versionString: '1.0.0' }, { versionString: '1.1.0' }] },
];

const getLatestVersionInfoFromList = (versionInfoList: Array<TVersionInfo>): TVersionInfo | undefined => {
  const funcName = 'getLatestVersionInfoFromList';
  const logName = `${scriptName}.${funcName}()`;

  let latestVersionString: string = '0.0.0';
  let latestVersionInfo: TVersionInfo = {
    versionString: '',
    versionId: ''
  };
  for (const versionInfo of versionInfoList) {
    if(versionInfo.versionString === undefined) throw new Error(`${logName}: versionInfo.versionString === undefined`);
    if(versionInfo.versionId === undefined) throw new Error(`${logName}: versionInfo.versionId === undefined`);
    const newVersionString: string = versionInfo.versionString;
    if (EpSdkSemVerUtils.is_NewVersion_GreaterThan_OldVersion({
      newVersionString: newVersionString,
      oldVersionString: latestVersionString,
    })) {
      latestVersionString = newVersionString;
      latestVersionInfo = {
        ...versionInfo
      };
    }
  }
  return latestVersionInfo;
}

const createCompareObject = (eventApiVersion: EventApiVersion): Partial<EventApiVersion> => {
  return {
    version: eventApiVersion.version,
    description: eventApiVersion.description,
    displayName: eventApiVersion.displayName,
    stateId: eventApiVersion.stateId,
  };
}

const deepCopyEventApis = async() => {
  for(const eventApiInfo of EventApiInfoList) {
    // get latest source version
    const latestSourceEventApiVersion: EventApiVersion = await EpSdkEventApiVersionsService.getLatestVersionForEventApiId({ 
      applicationDomainId: SourceApplicationDomainId,     
      eventApiId: eventApiInfo.sourceEventApiId,
    });
    // deep copy by name
    const copiedEventApiVersion: EventApiVersion | undefined = await EpSdkEventApiVersionsService.deepCopyLastestVersionById_IfNotExists({
      eventApiName: eventApiInfo.eventApiName,
      fromApplicationDomainId: SourceApplicationDomainId,
      toApplicationDomainId: TargetApplicationDomainId,
      fromAssetsApplicationDomainId: SourceAssetsApplicationDomainId,
      toAssetsApplicationDomainId: TargetAssetsApplicationDomainId,
    });
    if(copiedEventApiVersion !== undefined) {
      eventApiInfo.targetEventApiId = copiedEventApiVersion.eventApiId;
      // get latest target version
      const latestTargetEventApiVersion: EventApiVersion = await EpSdkEventApiVersionsService.getLatestVersionForEventApiId({ 
        applicationDomainId: TargetApplicationDomainId,            
        eventApiId: copiedEventApiVersion.eventApiId,
      });
      const sourceCompare: Partial<EventApiVersion> = createCompareObject(latestSourceEventApiVersion);
      const targetCompare: Partial<EventApiVersion> = createCompareObject(latestTargetEventApiVersion);
      let message = TestLogger.createLogMessage('source & target', {
        sourceCompare: sourceCompare,
        targetCompare: targetCompare
      });  
      expect(sourceCompare, message).to.be.deep.equal(targetCompare);
      message = TestLogger.createLogMessage('copied & latest', {
        copiedEventApiVersion: copiedEventApiVersion,
        latestTargetEventApiVersion: latestTargetEventApiVersion
      }); 
      expect(copiedEventApiVersion, message).to.be.deep.equal(latestTargetEventApiVersion);
      // // DEBUG
      // expect(false, message).to.be.true;  
    }
  }  
}

const verifyNumberOfObjects = async() => {
  // test number of event apis in target domain
  const eventApisResponse: EventApisResponse = await EventApIsService.getEventApis({
    applicationDomainId: TargetApplicationDomainId
  });
  expect(eventApisResponse.data.length, 'number of event apis in target domain failed').to.equal(EventApiInfoList.length);
  // test number of event api versions for each event api
  for(const eventApi of eventApisResponse.data) {
    expect(eventApi.numberOfVersions, 'number of event api versions in target domain failed').to.equal(1);
  }
  // test number of events in target domain
  const eventsResponse: EventsResponse = await EventsService.getEvents({
    applicationDomainId: TargetApplicationDomainId
  });
  expect(eventsResponse.data.length, 'number of events in target domain failed').to.equal(0);
  // test number of schemas in target domain
  const schemasResponse: SchemasResponse = await SchemasService.getSchemas({
    applicationDomainId: TargetApplicationDomainId
  });
  expect(schemasResponse.data.length, 'number of schemas in target domain failed').to.equal(0);
  // test number of enums in target domain
  const topicAddressEnumsResponse: TopicAddressEnumsResponse = await EnumsService.getEnums({
    applicationDomainId: TargetApplicationDomainId
  });
  expect(topicAddressEnumsResponse.data.length, 'number of enums in target domain failed').to.equal(0);

  // Assets
  // test number of events in target asset domain
  const eventsResponseAssets: EventsResponse = await EventsService.getEvents({
    applicationDomainId: TargetAssetsApplicationDomainId
  });
  expect(eventsResponseAssets.data.length, 'number of events in target assets domain failed').to.equal(EventInfoList.length);
  // test number of event versions for each event
  for(const event of eventsResponseAssets.data) {
    expect(event.numberOfVersions, 'number of event versions in target domain failed').to.equal(1);
  }
  // test number of schemas in target assets domain
  const schemasResponseAssets: SchemasResponse = await SchemasService.getSchemas({
    applicationDomainId: TargetAssetsApplicationDomainId
  });
  expect(schemasResponseAssets.data.length, 'number of schemas in target assets domain failed').to.equal(SchemaInfoList.length);
  // test number of schema versions for each schema
  for(const schemaObject of schemasResponseAssets.data) {
    expect(schemaObject.numberOfVersions, 'number of schema versions in target domain failed').to.equal(1);
  }
  // test number of enums in target assets domain
  const topicAddressEnumsResponseAssets: TopicAddressEnumsResponse = await EnumsService.getEnums({
    applicationDomainId: TargetAssetsApplicationDomainId
  });
  expect(topicAddressEnumsResponseAssets.data.length, 'number of enums in target assets domain failed').to.equal(EnumInfoList.length);
  // test number of enum versions for each enum
  for(const topicAddressEnum of topicAddressEnumsResponseAssets.data) {
    expect(topicAddressEnum.numberOfVersions, 'number of enum versions in target domain failed').to.equal(1);
  }
}

const initializeGlobals = () => {
  SourceApplicationDomainName = `${TestConfig.getAppId()}/services/${TestSpecName}/source`;
  TargetApplicationDomainName = `${TestConfig.getAppId()}/services/${TestSpecName}/target`;
  SourceAssetsApplicationDomainName = `${TestConfig.getAppId()}/services/${TestSpecName}/source/assets`;
  TargetAssetsApplicationDomainName = `${TestConfig.getAppId()}/services/${TestSpecName}/target/assets`;
}

describe(`${scriptName}`, () => {

  before(async() => {
    initializeGlobals();
    TestContext.newItId();
    // source application domain
    const sourceEpSdkApplicationDomainTask_absent = new EpSdkApplicationDomainTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
      applicationDomainName: SourceApplicationDomainName,
    });
    await sourceEpSdkApplicationDomainTask_absent.execute();
    const sourceEpSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainName: SourceApplicationDomainName,
    });
    const sourceEpSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await sourceEpSdkApplicationDomainTask.execute();
    SourceApplicationDomainId = sourceEpSdkApplicationDomainTask_ExecuteReturn.epObject.id;
    // target application domain
    const targetEpSdkApplicationDomainTask_absent = new EpSdkApplicationDomainTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
      applicationDomainName: TargetApplicationDomainName,
    });
    await targetEpSdkApplicationDomainTask_absent.execute();
    const targetEpSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainName: TargetApplicationDomainName,
    });
    const targetEpSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await targetEpSdkApplicationDomainTask.execute();
    TargetApplicationDomainId = targetEpSdkApplicationDomainTask_ExecuteReturn.epObject.id;
    // source assets application domain
    const sourceAssetsEpSdkApplicationDomainTask_absent = new EpSdkApplicationDomainTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
      applicationDomainName: SourceAssetsApplicationDomainName,
    });
    await sourceAssetsEpSdkApplicationDomainTask_absent.execute();
    const sourceAssetsEpSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainName: SourceAssetsApplicationDomainName,
    });
    const sourceAssetsEpSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await sourceAssetsEpSdkApplicationDomainTask.execute();
    SourceAssetsApplicationDomainId = sourceAssetsEpSdkApplicationDomainTask_ExecuteReturn.epObject.id;
    // target assets application domain
    const targetAssetsEpSdkApplicationDomainTask_absent = new EpSdkApplicationDomainTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
      applicationDomainName: TargetAssetsApplicationDomainName,
    });
    await targetAssetsEpSdkApplicationDomainTask_absent.execute();
    const targetAssetsEpSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainName: TargetAssetsApplicationDomainName,
    });
    const targetAssetsEpSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await targetAssetsEpSdkApplicationDomainTask.execute();
    TargetAssetsApplicationDomainId = targetAssetsEpSdkApplicationDomainTask_ExecuteReturn.epObject.id;
  });

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async() => {
    TestContext.newItId();
    // delete application domains
    await EpSdkApplicationDomainsService.deleteById({ applicationDomainId: SourceApplicationDomainId });
    await EpSdkApplicationDomainsService.deleteById({ applicationDomainId: TargetApplicationDomainId });
    await EpSdkApplicationDomainsService.deleteById({ applicationDomainId: SourceAssetsApplicationDomainId });
    await EpSdkApplicationDomainsService.deleteById({ applicationDomainId: TargetAssetsApplicationDomainId });
  });

  it(`${scriptName}: should create source enums`, async () => {
    try {
      for(const enumInfo of EnumInfoList) {
        const epSdkEnumTask = new EpSdkEnumTask({
          epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
          applicationDomainId: SourceAssetsApplicationDomainId,
          enumName: enumInfo.enumName,
          enumObjectSettings: {
            shared: true,
          },
        });  
        const epSdkEnumTask_ExecuteReturn: IEpSdkEnumTask_ExecuteReturn = await epSdkEnumTask.execute();
        enumInfo.sourceEnumId = epSdkEnumTask_ExecuteReturn.epObject.id;
        for(const versionInfo of enumInfo.versionInfoList) {
          const epSdkEnumVersionTask = new EpSdkEnumVersionTask({
            epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
            applicationDomainId: SourceAssetsApplicationDomainId,
            enumId: enumInfo.sourceEnumId,
            versionString: versionInfo.versionString,
            enumVersionSettings: {
              stateId: EpSdkStatesService.releasedId,
              displayName: versionInfo.versionString,
            },
            enumValues: enumInfo.enumValues,
          });  
          const epSdkEnumVersionTask_ExecuteReturn: IEpSdkEnumVersionTask_ExecuteReturn = await epSdkEnumVersionTask.execute();
          versionInfo.versionId = epSdkEnumVersionTask_ExecuteReturn.epObject.id;  
        }
      }
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should create source schemas`, async () => {
    try {
      for(const schemaInfo of SchemaInfoList) {
        const epSdkSchemaTask = new EpSdkSchemaTask({
          epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
          applicationDomainId: SourceAssetsApplicationDomainId,
          schemaName: schemaInfo.schemaName,
          schemaObjectSettings: {
            shared: true,
          },
        });  
        const epSdkSchemaTask_ExecuteReturn: IEpSdkSchemaTask_ExecuteReturn = await epSdkSchemaTask.execute();
        schemaInfo.sourceSchemaId = epSdkSchemaTask_ExecuteReturn.epObject.id;
        for(const versionInfo of schemaInfo.versionInfoList) {
          const epSdkSchemaVersionTask = new EpSdkSchemaVersionTask({
            epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
            applicationDomainId: SourceAssetsApplicationDomainId,
            schemaId: schemaInfo.sourceSchemaId,
            versionString: versionInfo.versionString,
            schemaVersionSettings: {
              stateId: EpSdkStatesService.releasedId,
              displayName: versionInfo.versionString,
              description: 'description',
              content: schemaInfo.schemaContent,
            },
          });  
          const epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn = await epSdkSchemaVersionTask.execute();
          versionInfo.versionId = epSdkSchemaVersionTask_ExecuteReturn.epObject.id;  
        }
      }
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should create source events`, async () => {
    try {
      let idx=0;
      for(const eventInfo of EventInfoList) {
        const epSdkEpEventTask = new EpSdkEpEventTask({
          epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
          applicationDomainId: SourceAssetsApplicationDomainId,
          eventName: eventInfo.eventName,
          eventObjectSettings: {
            shared: true,
          },
        });  
        const epSdkEpEventTask_ExecuteReturn: IEpSdkEpEventTask_ExecuteReturn = await epSdkEpEventTask.execute();
        eventInfo.sourceEventId = epSdkEpEventTask_ExecuteReturn.epObject.id;
        let versionInfoIdx=0;
        for(const versionInfo of eventInfo.versionInfoList) {
          // get latest schema version id
          // const latestSchemaVersionId: string = getLatestVersionIdFromList(SchemaInfoList[idx].versionInfoList);

          const epSdkEpEventVersionTask = new EpSdkEpEventVersionTask({
            epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
            applicationDomainId: SourceAssetsApplicationDomainId,
            eventId: eventInfo.sourceEventId,
            versionString: versionInfo.versionString,
            topicString: `one/two/{${EnumInfoList[idx].enumName}}`,
            eventVersionSettings: {
              stateId: EpSdkStatesService.releasedId,
              displayName: versionInfo.versionString,
              description: 'description',
              schemaVersionId: SchemaInfoList[idx].versionInfoList[versionInfoIdx].versionId
            },
          });  
          const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn = await epSdkEpEventVersionTask.execute();            
          versionInfo.versionId = epSdkEpEventVersionTask_ExecuteReturn.epObject.id;  
          versionInfoIdx++;
        }
        idx++;
      }
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should create source event apis`, async () => {
    try {
      // create same produced and consumed event version for all apis
      const producedEventVersionIds: Array<string> = [];
      const consumedEventVersionIds: Array<string> = [];
      for(const eventInfo of EventInfoList) {
        const latestVersionInfo: TVersionInfo = getLatestVersionInfoFromList(eventInfo.versionInfoList);
        producedEventVersionIds.push(latestVersionInfo.versionId);
        consumedEventVersionIds.push(latestVersionInfo.versionId);
      }
      // create the event apis
      let eventApiInfoIdx=0;
      for(const eventApiInfo of EventApiInfoList) {
        const epSdkEventApiTask = new EpSdkEventApiTask({
          epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
          applicationDomainId: SourceApplicationDomainId,
          eventApiName: eventApiInfo.eventApiName,
          eventApiObjectSettings: {
            shared: true,            
          },
        });  
        const epSdkEventApiTask_ExecuteReturn: IEpSdkEventApiTask_ExecuteReturn = await epSdkEventApiTask.execute();
        eventApiInfo.sourceEventApiId = epSdkEventApiTask_ExecuteReturn.epObject.id;
        // create the event api versions
        let versionInfoIdx=0;
        for(const versionInfo of eventApiInfo.versionInfoList) {
          const epSdkEventApiVersionTask = new EpSdkEventApiVersionTask({
            epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
            applicationDomainId: SourceApplicationDomainId,
            eventApiId: eventApiInfo.sourceEventApiId,
            versionString: versionInfo.versionString,
            eventApiVersionSettings: {
              stateId: EpSdkStatesService.releasedId,
              displayName: `displayName for ${versionInfo.versionString}`,
              description: `description for ${versionInfo.versionString}`,
              producedEventVersionIds: producedEventVersionIds,
              consumedEventVersionIds: consumedEventVersionIds,  
            },
          });
          const epSdkEventApiVersionTask_ExecuteReturn: IEpSdkEventApiVersionTask_ExecuteReturn = await epSdkEventApiVersionTask.execute();
          versionInfo.versionId = epSdkEventApiVersionTask_ExecuteReturn.epObject.id;  
          versionInfoIdx++;
        }
        eventApiInfoIdx++;
      }
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should deep copy event api versions from source (assets) domain to target (assets) domain`, async () => {
    try {
      await deepCopyEventApis();
      await verifyNumberOfObjects();
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: deep copy event apis idempotency: should not create any new objects`, async () => {
    try {
      await deepCopyEventApis();
      await verifyNumberOfObjects();
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should delete old versions and create new target event api versions`, async () => {
    try {
      let idx = 0;
      for(const eventApiInfo of EventApiInfoList) {
        for(const versionInfo of eventApiInfo.versionInfoList) {
          // delete the version
          const latestTargetEventApiVersion: EventApiVersion = await EpSdkEventApiVersionsService.getLatestVersionForEventApiId({ 
            applicationDomainId: TargetApplicationDomainId,            
            eventApiId: eventApiInfo.targetEventApiId,
          });  
          await EventApIsService.deleteEventApiVersion({
            versionId: latestTargetEventApiVersion.id,
          });
          const epSdkEventApiVersionTask = new EpSdkEventApiVersionTask({
            epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
            applicationDomainId: TargetApplicationDomainId,
            eventApiId: eventApiInfo.targetEventApiId,
            versionString: versionInfo.versionString,
            versionStrategy: EEpSdk_VersionTaskStrategy.BUMP_MINOR,
            eventApiVersionSettings: {
              stateId: EpSdkStatesService.releasedId,
              displayName: `new target version`,
              description: `new target description`,
              producedEventVersionIds: [],
              consumedEventVersionIds: [],  
            },
          });
          const epSdkEventApiVersionTask_ExecuteReturn: IEpSdkEventApiVersionTask_ExecuteReturn = await epSdkEventApiVersionTask.execute();
          versionInfo.versionId = epSdkEventApiVersionTask_ExecuteReturn.epObject.id;
        }
        idx++;
      }
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should NOT copy event api version from source domain to target domain because a version exists`, async () => {
    try {
      for(const eventApiInfo of EventApiInfoList) {
        // get latest target version
        const latestTargetEventApiVersion: EventApiVersion = await EpSdkEventApiVersionsService.getLatestVersionForEventApiId({ 
          applicationDomainId: TargetApplicationDomainId,            
          eventApiId: eventApiInfo.targetEventApiId,
        });
        // copy
        const copiedEventApiVersion: EventApiVersion | undefined = await EpSdkEventApiVersionsService.deepCopyLastestVersionById_IfNotExists({
          fromApplicationDomainId: SourceApplicationDomainId,
          toApplicationDomainId: TargetApplicationDomainId,
          fromAssetsApplicationDomainId: SourceAssetsApplicationDomainId,
          toAssetsApplicationDomainId: TargetAssetsApplicationDomainId,
          eventApiName: eventApiInfo.eventApiName,
        });
        expect(copiedEventApiVersion, 'copiedEventApiVersion is undefined').to.be.undefined;
        // const message = TestLogger.createLogMessage('latest target & copied target', {
        //   latestTargetEventApiVersion: latestTargetEventApiVersion,
        //   copiedEventApiVersion: copiedEventApiVersion
        // });  
        // expect(latestTargetEventApiVersion, message).to.be.deep.equal(copiedEventApiVersion);
    
        // const latestTargetCompare: Partial<EventApiVersion> = createCompareObject(latestTargetEventApiVersion);
        // const copiedCompare: Partial<EventApiVersion> = createCompareObject(copiedEventApiVersion);
        // expect(latestTargetCompare, message).to.be.deep.equal(copiedCompare);
        // // // DEBUG
        // expect(false, message).to.be.true;
      }
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

});

