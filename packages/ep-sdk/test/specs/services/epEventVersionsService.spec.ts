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
  CustomAttributeDefinition,
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
  EEpSdkSchemaType,
  TEpSdkCustomAttribute,
  EpSdkApplicationDomainTask,
  EEpSdkTask_TargetState,
  EpSdkCustomAttributeDefinitionTask,
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

const EventName = `${TestSpecId}`;
let EventId: string | undefined;
const EventVersionString = "1.1.1";
let EventVersionId: string | undefined;
const EventNextVersionString = "1.1.2";
let EventNextVersionId: string | undefined;

const EventVersionDeliveryDescriptor: DeliveryDescriptor = {
  brokerType: "solace",
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

const VersionCustomAttribute: TEpSdkCustomAttribute = {
  name: 'VersionCustomAttribute',
  value: "VersionCustomAttribute",
  valueType: CustomAttributeDefinition.valueType.STRING,
  scope: CustomAttributeDefinition.scope.ORGANIZATION
};

const initializeGlobals = () => {
  ApplicationDomainName = `${TestConfig.getAppId()}/services/${TestSpecName}`;
};

const cleanTest = async() => {
  try {
    const epSdkApplicationDomainTask_1 = new EpSdkApplicationDomainTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
      applicationDomainName: ApplicationDomainName,
    });
    await epSdkApplicationDomainTask_1.execute('contextId');

    const epSdkCustomAttributeDefinitionTask_1 = new EpSdkCustomAttributeDefinitionTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
      attributeName: VersionCustomAttribute.name,
      customAttributeDefinitionObjectSettings: {}
    });
    await epSdkCustomAttributeDefinitionTask_1.execute();

  } catch (e) {
    if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
    expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
    expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
  }
}

describe(`${scriptName}`, () => {

  before(async () => {
    initializeGlobals();
    TestContext.newItId();
    await cleanTest();
    const applicationDomainResponse: ApplicationDomainResponse = await ApplicationDomainsService.createApplicationDomain({
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

    const eventResponse: EventResponse = await EventsService.createEvent({
      requestBody: {
        applicationDomainId: ApplicationDomainId,
        name: EventName,
        shared: true,
      },
    });
    EventId = eventResponse.data.id;
  });

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async () => {
    TestContext.newItId();
    await cleanTest();
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
        targetLifecycleStateId: EpSdkStatesService.releasedId,
      });
      EventVersionId = created.id;
      expect(created.stateId, TestLogger.createLogMessage(`created=${JSON.stringify(created, null, 2)}`)).to.equal(EpSdkStatesService.releasedId);
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should set VersionCustomAttribute on event version`, async () => {
    try {
      const eventVersion: EventVersion = await EpSdkEpEventVersionsService.setCustomAttributes({
        eventVersionId: EventVersionId,
        epSdkCustomAttributes: [VersionCustomAttribute],
      })
      const customAttributes = eventVersion.customAttributes;
      const message = TestLogger.createLogMessage("customAttributes", customAttributes);
      expect(customAttributes, message).to.not.be.undefined;
      // DEBUG
      // expect(false, message).to.be.true;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should get event version by version`, async () => {
    try {
      const eventVersion: EventVersion = await EpSdkEpEventVersionsService.getVersionByVersion({
        eventId: EventId,
        eventVersionString: EventVersionString,
      });
      expect(eventVersion.version, TestLogger.createApiTestFailMessage("version mismatch")).to.eq(EventVersionString);
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should get event versions for event id`, async () => {
    try {
      const eventVersionList: Array<EventVersion> = await EpSdkEpEventVersionsService.getVersionsForEventId({
        eventId: EventId,
        stateIds: [EpSdkStatesService.releasedId],
      });
      expect(eventVersionList.length, TestLogger.createApiTestFailMessage(`length=${eventVersionList.length} not eq 1, eventVersionList=${JSON.stringify(eventVersionList, null, 2)}`)).to.eq(1);
      const eventVersion: EventVersion = eventVersionList[0];
      expect(eventVersion.id, TestLogger.createApiTestFailMessage("id mismatch")).to.eq(EventVersionId);
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should get event versions for event name`, async () => {
    try {
      const eventVersionList: Array<EventVersion> = await EpSdkEpEventVersionsService.getVersionsForEventName({
        applicationDomainId: ApplicationDomainId,
        eventName: EventName,
      });
      expect(eventVersionList.length, TestLogger.createApiTestFailMessage("length not === 1")).to.eq(1);
      const eventVersion: EventVersion = eventVersionList[0];
      expect(eventVersion.id, TestLogger.createApiTestFailMessage("id mismatch")).to.eq(EventVersionId);
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
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
        targetLifecycleStateId: EpSdkStatesService.releasedId,
      });
      EventNextVersionId = created.id;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should get latest version string`, async () => {
    try {
      const latestVersionString: string = await EpSdkEpEventVersionsService.getLatestVersionString({
        eventId: EventId,
      });
      expect(latestVersionString, TestLogger.createApiTestFailMessage("version string mismatch")).to.eq(EventNextVersionString);
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should get latest version for event id`, async () => {
    try {
      const eventVersion: EventVersion = await EpSdkEpEventVersionsService.getLatestVersionForEventId({
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
      });
      expect(eventVersion.version, TestLogger.createApiTestFailMessage("version string mismatch")).to.eq(EventNextVersionString);
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should get latest version for event name`, async () => {
    try {
      const eventVersion: EventVersion =
        await EpSdkEpEventVersionsService.getLatestVersionForEventName({
          applicationDomainId: ApplicationDomainId,
          eventName: EventName,
        });
      expect(
        eventVersion,
        TestLogger.createApiTestFailMessage("eventVersion === undefined")
      ).to.not.be.undefined;
      expect(
        eventVersion.version,
        TestLogger.createApiTestFailMessage("version string mismatch")
      ).to.eq(EventNextVersionString);
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should get latest version for event name that doesn't exist`, async () => {
    const NonExistentName = "non-existent";
    try {
      const eventVersion: EventVersion =
        await EpSdkEpEventVersionsService.getLatestVersionForEventName({
          applicationDomainId: ApplicationDomainId,
          eventName: NonExistentName,
        });
      expect(
        eventVersion,
        TestLogger.createApiTestFailMessage("eventVersion !== undefined")
      ).to.be.undefined;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(
        e instanceof EpSdkServiceError,
        TestLogger.createNotEpSdkErrorMessage(e)
      ).to.be.true;
      const epSdkServiceError: EpSdkServiceError = e;
      expect(
        epSdkServiceError.toString(),
        TestLogger.createApiTestFailMessage(
          `error does not contain ${NonExistentName}`
        )
      ).to.contain(NonExistentName);
    }
  });

  it(`${scriptName}: should create 10 event versions & get latest version string them using paging`, async () => {
    const PagingName = "Paging-Object";
    const VersionQuantity = 10;
    const PageSize = 2;
    try {
      const response: EventResponse = await EventsService.createEvent({
        requestBody: {
          applicationDomainId: ApplicationDomainId,
          name: PagingName,
          shared: false,
          brokerType: EpSdkBrokerTypes.Solace,
        },
      });
      EventId = response.data.id;

      let VersionString = "";
      for (let i = 0; i < VersionQuantity; i++) {
        VersionString = `3.0.${i}`;
        const versionResponse: EventVersionResponse =
          await EventsService.createEventVersion({
            requestBody: {
              eventId: EventId,
              description: "paging version",
              version: VersionString,
              deliveryDescriptor: {
                brokerType: EpSdkBrokerTypes.Solace,
              }
            },
          });
      }
      // // DEBUG
      // expect(false, 'check 1000 enum versions created').to.be.true;
      const versionList: Array<EventVersion> =
        await EpSdkEpEventVersionsService.getVersionsForEventId({
          eventId: EventId,
          pageSize: PageSize,
          stateIds: [EpSdkStatesService.draftId],
        });
      expect(
        versionList.length,
        TestLogger.createApiTestFailMessage("failed")
      ).to.eq(VersionQuantity);

      let latestObjectVersion: EventVersion =
        await EpSdkEpEventVersionsService.getLatestVersionForEventId({
          eventId: EventId,
          applicationDomainId: ApplicationDomainId,
        });
      expect(
        latestObjectVersion.version,
        TestLogger.createApiTestFailMessage("failed")
      ).to.eq(VersionString);

      latestObjectVersion =
        await EpSdkEpEventVersionsService.getLatestVersionForEventName({
          eventName: PagingName,
          applicationDomainId: ApplicationDomainId,
        });
      expect(
        latestObjectVersion.version,
        TestLogger.createApiTestFailMessage("failed")
      ).to.eq(VersionString);

      const latestObjectVersionString: string =
        await EpSdkEpEventVersionsService.getLatestVersionString({
          eventId: EventId,
        });
      expect(
        latestObjectVersionString,
        TestLogger.createApiTestFailMessage("failed")
      ).to.eq(VersionString);
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });
});
