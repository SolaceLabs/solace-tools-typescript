import "mocha";
import { expect } from "chai";
import path from "path";
import { 
  TestContext, 
  TestUtils 
} from "@internal/tools/src";
import { 
  TestLogger, 
  TestConfig, 
  TestHelpers 
} from "../../lib";
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
  SchemaVersion,
} from "@solace-labs/ep-openapi-node";
import {
  EpSdkError,
  EpSdkServiceError,
  EpSdkApplicationDomainsService,
  EpSdkSchemaVersionsService,
  EpSdkStatesService,
  EpSdkEpEventVersionsService,
  EEpSdkSchemaContentType,
  EEpSdkSchemaType,
  EpSdkEpEventsService,
  EpSdkEventResponse,
  EpSdkBrokerTypes,
} from "../../../src";

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId: string = TestUtils.getUUID();
let ApplicationDomainName: string;
let ApplicationDomainId: string | undefined;

const SchemaName = `${TestSpecId}`;
let SchemaId: string | undefined;
const SchemaVersionString = "1.0.0";
let SchemaVersionId: string | undefined;

const EventName = `KAFKA-${TestSpecId}`;
let EventId: string | undefined;
const EventVersionString = "1.1.1";
let EventVersionId: string | undefined;
const EventNextVersionString = "1.1.2";
let EventNextVersionId: string | undefined;

const EventVersionDeliveryDescriptor: DeliveryDescriptor = {
  brokerType: EpSdkBrokerTypes.Kafka,
  address: {
    addressType: Address.addressType.TOPIC,
    addressLevels: [
      {
        addressLevelType: AddressLevel.addressLevelType.LITERAL,
        name: "hello",
      },
      {
        addressLevelType: AddressLevel.addressLevelType.LITERAL,
        name: "world",
      },
    ],
  },
};

const initializeGlobals = () => {
  ApplicationDomainName = `${TestConfig.getAppId()}/services/${TestSpecName}`;
};

describe(`${scriptName}`, () => {

  before(async () => {
    initializeGlobals();
    TestContext.newItId();
    const xvoid: void = await TestHelpers.applicationDomainAbsent({
      applicationDomainName: ApplicationDomainName,
    });
    TestContext.newItId();
    const applicationDomainResponse: ApplicationDomainResponse =
      await ApplicationDomainsService.createApplicationDomain({
        requestBody: {
          name: ApplicationDomainName,
        },
      });
    ApplicationDomainId = applicationDomainResponse.data.id;

    const schemaResponse: SchemaResponse = await SchemasService.createSchema({
      requestBody: {
        applicationDomainId: ApplicationDomainId,
        name: SchemaName,
        schemaType: EEpSdkSchemaType.JSON_SCHEMA,
        contentType: EEpSdkSchemaContentType.APPLICATION_JSON,
        shared: true,
      },
    });
    SchemaId = schemaResponse.data.id;

    const createSchemaVersion: SchemaVersion = {
      schemaId: SchemaId,
      displayName: SchemaName,
      description: `schema version for schema = ${SchemaName}, id=${SchemaId}`,
      version: SchemaVersionString,
    };
    const createdSchemaVersion: SchemaVersion =
      await EpSdkSchemaVersionsService.createSchemaVersion({
        applicationDomainId: ApplicationDomainId,
        schemaId: SchemaId,
        schemaVersion: createSchemaVersion,
        targetLifecycleStateId: EpSdkStatesService.releasedId,
      });
    SchemaVersionId = createdSchemaVersion.id;
  });

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async () => {
    TestContext.newItId();
    TestLogger.createLogMessage(`${scriptName}: after starting ...`);
    // delete application domain
    await EpSdkApplicationDomainsService.deleteById({
      applicationDomainId: ApplicationDomainId,
    });
    TestLogger.createLogMessage(`${scriptName}: after done.`);
  });

  it(`${scriptName}: should create KAFKA Event`, async () => {
    try {
      const epSdkEventResponse: EpSdkEventResponse = await EpSdkEpEventsService.createEvent({
        requestBody: {
          applicationDomainId: ApplicationDomainId,
          name: EventName,
          brokerType: EpSdkBrokerTypes.Kafka
        }
      });
      EventId = epSdkEventResponse.data.id;
      expect(epSdkEventResponse.data.brokerType, TestLogger.createLogMessage(`epSdkEventResponse=${JSON.stringify(epSdkEventResponse, null, 2)}`)).to.equal(EpSdkBrokerTypes.Kafka);
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should create event version`, async () => {
    try {
      const create: EventVersion = {
        eventId: EventId,
        description: `event version for event = ${EventName}, id=${EventId}`,
        version: EventVersionString,
        displayName: 'kafka',
        schemaVersionId: SchemaVersionId,
        deliveryDescriptor: EventVersionDeliveryDescriptor,
      };
      const created: EventVersion = await EpSdkEpEventVersionsService.createEventVersion({
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        eventVersion: create,
        targetLifecycleStateId: EpSdkStatesService.releasedId,
      });
      EventVersionId = created.id;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should get event versions and test brokerType`, async () => {
    try {
      const eventVersionList: Array<EventVersion> = await EpSdkEpEventVersionsService.getVersionsForEventId({
        eventId: EventId
      });
      expect(eventVersionList.length, TestLogger.createApiTestFailMessage("length not === 1")).to.eq(1);
      const eventVersion: EventVersion = eventVersionList[0];
      expect(eventVersion.deliveryDescriptor.brokerType, TestLogger.createLogMessage(`eventVersion=${JSON.stringify(eventVersion, null, 2)}`)).to.equal(EpSdkBrokerTypes.Kafka);
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });


});
