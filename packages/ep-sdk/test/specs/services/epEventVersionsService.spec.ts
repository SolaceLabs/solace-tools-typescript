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
  Address,
  AddressLevel,
  ApiError, 
  ApplicationDomainResponse, 
  ApplicationDomainsService, 
  DeliveryDescriptor, 
  EventResponse, 
  EventsService, 
  EventVersion, 
  EventVersionResponse, 
  SchemaResponse, 
  SchemasService,
  SchemaVersion
} from '@rjgu/ep-openapi-node';
import { 
  EpSdkError, 
  EpSdkServiceError,
  EpSdkApplicationDomainsService,
  EpSdkSchemaVersionsService,
  EpSdkStatesService,
  EpSdkEpEventVersionsService,
  EEpSdkSchemaContentType,
  EEpSdkSchemaType,
} from '../../../src';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId: string = TestUtils.getUUID();
let ApplicationDomainName: string;
let ApplicationDomainId: string | undefined;

const SchemaName = `${TestSpecId}`;
let SchemaId: string | undefined;
const SchemaVersionString = '1.0.0';
let SchemaVersionId: string | undefined;

const EventName = `${TestSpecId}`;
let EventId: string | undefined;
const EventVersionString = '1.1.1';
let EventVersionId: string | undefined;
const EventNextVersionString = '1.1.2';
let EventNextVersionId: string | undefined;

const EventVersionDeliveryDescriptor: DeliveryDescriptor = {
  brokerType: "solace",
  address: {
    addressType: Address.addressType.TOPIC,
    addressLevels: [
      { addressLevelType: AddressLevel.addressLevelType.LITERAL, name: 'hello' },
      { addressLevelType: AddressLevel.addressLevelType.LITERAL, name: 'world' },
    ]
  }
};

const initializeGlobals = () => {
  ApplicationDomainName = `${TestConfig.getAppId()}/services/${TestSpecName}`;
}

describe(`${scriptName}`, () => {

  before(async() => {
    initializeGlobals();
    TestContext.newItId();
    const applicationDomainResponse: ApplicationDomainResponse = await ApplicationDomainsService.createApplicationDomain({
      requestBody: {
        name: ApplicationDomainName,
      }
    });
    ApplicationDomainId = applicationDomainResponse.data.id;

    const schemaResponse: SchemaResponse = await SchemasService.createSchema({
      requestBody: {
        applicationDomainId: ApplicationDomainId,
        name: SchemaName,
        schemaType: EEpSdkSchemaType.JSON_SCHEMA,
        contentType: EEpSdkSchemaContentType.APPLICATION_JSON,
        shared: true
      }
    });
    SchemaId = schemaResponse.data.id;

    const createSchemaVersion: SchemaVersion = {
      schemaId: SchemaId,
      displayName: SchemaName,
      description: `schema version for schema = ${SchemaName}, id=${SchemaId}`,        
      version: SchemaVersionString
    };
    const createdSchemaVersion: SchemaVersion = await EpSdkSchemaVersionsService.createSchemaVersion({
      applicationDomainId: ApplicationDomainId,
      schemaId: SchemaId,
      schemaVersion: createSchemaVersion,
      targetLifecycleStateId: EpSdkStatesService.releasedId
    });
    SchemaVersionId = createdSchemaVersion.id;

    const eventResponse: EventResponse = await EventsService.createEvent({
      requestBody: {
        applicationDomainId: ApplicationDomainId,
        name: EventName,
        shared: true,          
      }
    });
    EventId = eventResponse.data.id;

  });

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async() => {
    TestContext.newItId();
    // delete application domain
    await EpSdkApplicationDomainsService.deleteById({ applicationDomainId: ApplicationDomainId });
  });

  it(`${scriptName}: should create event version`, async () => {
    try {
      const create: EventVersion = {
        eventId: EventId,
        description: `event version for event = ${EventName}, id=${EventId}`,        
        version: EventVersionString,
        displayName: EventName,
        schemaVersionId: SchemaVersionId,
        deliveryDescriptor: EventVersionDeliveryDescriptor,
      };
      const created: EventVersion = await EpSdkEpEventVersionsService.createEventVersion({
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        eventVersion: create,
        targetLifecycleStateId: EpSdkStatesService.releasedId
      });
      EventVersionId = created.id;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should get event version by version`, async () => {
    try {
      const eventVersion: EventVersion = await EpSdkEpEventVersionsService.getVersionByVersion({ 
        eventId: EventId,
        eventVersionString: EventVersionString,
      });
      expect(eventVersion.version, TestLogger.createApiTestFailMessage('version mismatch')).to.eq(EventVersionString);
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should get event versions for event id`, async () => {
    try {
      const eventVersionList: Array<EventVersion> = await EpSdkEpEventVersionsService.getVersionsForEventId({ 
        eventId: EventId,
        stateId: EpSdkStatesService.releasedId
      });
      expect(eventVersionList.length, TestLogger.createApiTestFailMessage('length not === 1')).to.eq(1);
      const eventVersion: EventVersion = eventVersionList[0];
      expect(eventVersion.id, TestLogger.createApiTestFailMessage('id mismatch')).to.eq(EventVersionId);
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should get event versions for event name`, async () => {
    try {
      const eventVersionList: Array<EventVersion> = await EpSdkEpEventVersionsService.getVersionsForEventName({ 
        applicationDomainId: ApplicationDomainId,
        eventName: EventName 
      });
      expect(eventVersionList.length, TestLogger.createApiTestFailMessage('length not === 1')).to.eq(1);
      const eventVersion: EventVersion = eventVersionList[0];
      expect(eventVersion.id, TestLogger.createApiTestFailMessage('id mismatch')).to.eq(EventVersionId);
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should create new event version`, async () => {
    try {
      const create: EventVersion = {
        eventId: EventId,
        description: `event version for event = ${EventName}, id=${EventId}`,        
        version: EventNextVersionString,
        schemaVersionId: SchemaVersionId,
        deliveryDescriptor: EventVersionDeliveryDescriptor,
      };
      const created: EventVersion = await EpSdkEpEventVersionsService.createEventVersion({
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        eventVersion: create,
        targetLifecycleStateId: EpSdkStatesService.releasedId
      });
      EventNextVersionId = created.id;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should get latest version string`, async () => {
    try {
      const latestVersionString: string = await EpSdkEpEventVersionsService.getLatestVersionString({ eventId: EventId });
      expect(latestVersionString, TestLogger.createApiTestFailMessage('version string mismatch')).to.eq(EventNextVersionString);
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should get latest version for event id`, async () => {
    try {
      const eventVersion: EventVersion = await EpSdkEpEventVersionsService.getLatestVersionForEventId({ 
        applicationDomainId: ApplicationDomainId,
        eventId: EventId
      });
      expect(eventVersion.version, TestLogger.createApiTestFailMessage('version string mismatch')).to.eq(EventNextVersionString);
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should get latest version for event name`, async () => {
    try {
      const eventVersion: EventVersion = await EpSdkEpEventVersionsService.getLatestVersionForEventName({ 
        applicationDomainId: ApplicationDomainId,
        eventName: EventName
      });
      expect(eventVersion, TestLogger.createApiTestFailMessage('eventVersion === undefined')).to.not.be.undefined;
      expect(eventVersion.version, TestLogger.createApiTestFailMessage('version string mismatch')).to.eq(EventNextVersionString);
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should get latest version for event name that doesn't exist`, async () => {
    const NonExistentName = 'non-existent';
    try {
      const eventVersion: EventVersion = await EpSdkEpEventVersionsService.getLatestVersionForEventName({ 
        applicationDomainId: ApplicationDomainId,
        eventName: NonExistentName
      });
      expect(eventVersion, TestLogger.createApiTestFailMessage('eventVersion !== undefined')).to.be.undefined;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkServiceError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      const epSdkServiceError: EpSdkServiceError = e;
      expect(epSdkServiceError.toString(), TestLogger.createApiTestFailMessage(`error does not contain ${NonExistentName}`)).to.contain(NonExistentName);
    }
  });

  it(`${scriptName}: should create 10 event versions & get latest version string them using paging`, async () => {
    const PagingName = 'Paging-Object';
    const VersionQuantity = 10;
    const PageSize = 2;
    try {
      const response: EventResponse = await EventsService.createEvent({
        requestBody: {
          applicationDomainId: ApplicationDomainId,
          name: PagingName,
          shared: false
        }
      });
      EventId = response.data.id;

      let VersionString = '';
      for(let i=0; i<VersionQuantity; i++) {
        VersionString = `3.0.${i}`;
        const versionResponse: EventVersionResponse = await EventsService.createEventVersionForEvent({
          eventId: EventId,
          requestBody: {
            eventId: EventId,
            description: 'paging version',
            version: VersionString,
          }
        });
      }
      // // DEBUG
      // expect(false, 'check 1000 enum versions created').to.be.true;
      const versionList: Array<EventVersion> = await EpSdkEpEventVersionsService.getVersionsForEventId({ 
        eventId: EventId,
        pageSize: PageSize,
        stateId: EpSdkStatesService.draftId
      });
      expect(versionList.length, TestLogger.createApiTestFailMessage('failed')).to.eq(VersionQuantity);

      let latestObjectVersion: EventVersion = await EpSdkEpEventVersionsService.getLatestVersionForEventId({ eventId: EventId, applicationDomainId: ApplicationDomainId });
      expect(latestObjectVersion.version, TestLogger.createApiTestFailMessage('failed')).to.eq(VersionString);

      latestObjectVersion = await EpSdkEpEventVersionsService.getLatestVersionForEventName({ eventName: PagingName, applicationDomainId: ApplicationDomainId });
      expect(latestObjectVersion.version, TestLogger.createApiTestFailMessage('failed')).to.eq(VersionString);

      const latestObjectVersionString: string = await EpSdkEpEventVersionsService.getLatestVersionString({ eventId: EventId });
      expect(latestObjectVersionString, TestLogger.createApiTestFailMessage('failed')).to.eq(VersionString);

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

});

