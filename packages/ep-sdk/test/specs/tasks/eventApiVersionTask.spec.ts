import "mocha";
import { expect } from "chai";
import path from "path";
import { TestContext, TestUtils } from "@internal/tools/src";
import { TestLogger, TestConfig } from "../../lib";
import {
  ApiError,
  ApplicationDomainResponse,
  ApplicationDomainsService,
  EventApi,
  EventApiResponse,
  EventApIsService,
  EventResponse,
  EventsService,
  SchemaResponse,
  SchemasService,
  SchemaVersion,
} from "@solace-labs/ep-openapi-node";
import {
  EpSdkError,
  EpSdkFeatureNotSupportedError,
  EpSdkVersionTaskStrategyValidationError,
  TEpSdkVersionTaskStrategyValidationError_Details,
  EpSdkApplicationDomainsService,
  EpSdkEpEventVersionTask,
  IEpSdkEpEventVersionTask_ExecuteReturn,
  EpSdkStatesService,
  EEpSdk_VersionTaskStrategy,
  IEpSdkTask_TransactionLogData,
  EpSdkSemVerUtils,
  EEpSdk_VersionStrategy,
  EEpSdkSchemaType,
  EpSdkSchemaVersionsService,
  EpSdkEventApiVersionTask,
  IEpSdkEventApiVersionTask_ExecuteReturn,
  TEpSdkEventApiVersionTask_Settings,
  EpSdkEventApiVersionsService,
  EEpSdkTask_Action,
  EEpSdkTask_TargetState,
} from "../../../src";

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId = TestUtils.getUUID();

let ApplicationDomainName: string;
let ApplicationDomainId: string | undefined;

let SchemaName: string;
let SchemaId: string | undefined;
let SchemaVersionId: string | undefined;

let EventName_1: string;
let EventId_1: string | undefined;
let EventVersionId_1: string | undefined;

let EventName_2: string;
let EventId_2: string | undefined;
let EventVersionId_2: string | undefined;

let EventApiName: string;
let EventApiId: string | undefined;
let EventApiVersionId: string | undefined;

const initializeGlobals = () => {
  ApplicationDomainName = `${TestConfig.getAppId()}/tasks/${TestSpecName}`;
  SchemaName = `${TestConfig.getAppId()}-tasks-${TestSpecId}`;
  EventName_1 = `${TestConfig.getAppId()}-tasks-${TestSpecId}-1`;
  EventName_2 = `${TestConfig.getAppId()}-tasks-${TestSpecId}-2`;
  EventApiName = `${TestConfig.getAppId()}-tasks-${TestSpecId}`;
  // EpSdkLogger.getLoggerInstance().setLogLevel(EEpSdkLogLevel.Trace);
};

describe(`${scriptName}`, () => {
  before(async () => {
    TestContext.newItId();
    initializeGlobals();
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
        shared: true,
      },
    });
    SchemaId = schemaResponse.data.id;

    const createSchemaVersion: SchemaVersion = {
      schemaId: SchemaId,
      displayName: "displayName",
      description: `schema version for schema = ${SchemaName}, id=${SchemaId}`,
      version: "1.0.0",
    };
    const createdSchemaVersion: SchemaVersion =
      await EpSdkSchemaVersionsService.createSchemaVersion({
        applicationDomainId: ApplicationDomainId,
        schemaId: SchemaId,
        schemaVersion: createSchemaVersion,
        targetLifecycleStateId: EpSdkStatesService.releasedId,
      });
    SchemaVersionId = createdSchemaVersion.id;

    const eventResponse_1: EventResponse = await EventsService.createEvent({
      requestBody: {
        applicationDomainId: ApplicationDomainId,
        name: EventName_1,
      },
    });
    EventId_1 = eventResponse_1.data.id;
    const epSdkEpEventVersionTask_1 = new EpSdkEpEventVersionTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: ApplicationDomainId,
      eventId: EventId_1,
      versionString: "1.1.1",
      topicString: "test/hello/world/event_1",
      eventVersionSettings: {
        stateId: EpSdkStatesService.releasedId,
        description: "description",
        displayName: "displayName",
        schemaVersionId: SchemaVersionId,
      },
      checkmode: false,
    });
    const epSdkEpEventVersionTask_ExecuteReturn_1: IEpSdkEpEventVersionTask_ExecuteReturn =
      await epSdkEpEventVersionTask_1.execute();
    EventVersionId_1 = epSdkEpEventVersionTask_ExecuteReturn_1.epObject.id;

    const eventResponse_2: EventResponse = await EventsService.createEvent({
      requestBody: {
        applicationDomainId: ApplicationDomainId,
        name: EventName_2,
      },
    });
    EventId_2 = eventResponse_2.data.id;
    const epSdkEpEventVersionTask_2 = new EpSdkEpEventVersionTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: ApplicationDomainId,
      eventId: EventId_2,
      versionString: "1.1.1",
      topicString: "test/hello/world/event_2",
      eventVersionSettings: {
        stateId: EpSdkStatesService.releasedId,
        description: "description",
        displayName: "displayName",
        schemaVersionId: SchemaVersionId,
      },
      checkmode: false,
    });
    const epSdkEpEventVersionTask_ExecuteReturn_2: IEpSdkEpEventVersionTask_ExecuteReturn =
      await epSdkEpEventVersionTask_2.execute();
    EventVersionId_2 = epSdkEpEventVersionTask_ExecuteReturn_2.epObject.id;

    const eventApiResponse: EventApiResponse =
      await EventApIsService.createEventApi({
        requestBody: {
          applicationDomainId: ApplicationDomainId,
          name: EventApiName,
          brokerType: EventApi.brokerType.SOLACE,
        },
      });
    EventApiId = eventApiResponse.data.id;
  });

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async () => {
    TestContext.newItId();
    try {
      await EpSdkApplicationDomainsService.deleteById({
        applicationDomainId: ApplicationDomainId,
      });
    } catch (e) {}
  });

  it(`${scriptName}: event api version present: checkmode create`, async () => {
    try {
      const epSdkEventApiVersionTask = new EpSdkEventApiVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventApiId: EventApiId,
        versionString: "1.2.0",
        eventApiVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: "description",
          displayName: "displayName",
          producedEventVersionIds: [EventVersionId_1, EventVersionId_2],
          consumedEventVersionIds: [EventVersionId_1, EventVersionId_2],
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: true,
      });
      const epSdkEventApiVersionTask_ExecuteReturn: IEpSdkEventApiVersionTask_ExecuteReturn =
        await epSdkEventApiVersionTask.execute();

      const message = TestLogger.createLogMessage(
        "epSdkEventApiVersionTask_ExecuteReturn",
        epSdkEventApiVersionTask_ExecuteReturn
      );

      expect(
        epSdkEventApiVersionTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.WOULD_CREATE_FIRST_VERSION);

      // // DEBUG
      // expect(false, message).to.be.true;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: event api version present: create`, async () => {
    try {
      const epSdkEventApiVersionTask = new EpSdkEventApiVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventApiId: EventApiId,
        versionString: "1.2.0",
        eventApiVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: "description",
          displayName: "displayName",
          producedEventVersionIds: [EventVersionId_1, EventVersionId_2],
          consumedEventVersionIds: [EventVersionId_1, EventVersionId_2],
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: false,
      });
      const epSdkEventApiVersionTask_ExecuteReturn: IEpSdkEventApiVersionTask_ExecuteReturn =
        await epSdkEventApiVersionTask.execute();

      const message = TestLogger.createLogMessage(
        "epSdkEventApiVersionTask_ExecuteReturn",
        epSdkEventApiVersionTask_ExecuteReturn
      );

      expect(
        epSdkEventApiVersionTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.CREATE_FIRST_VERSION);

      EventApiVersionId = epSdkEventApiVersionTask_ExecuteReturn.epObject.id;

      // // DEBUG
      // expect(false, message).to.be.true;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: event api version present: create idempotency`, async () => {
    try {
      const epSdkEventApiVersionTask = new EpSdkEventApiVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventApiId: EventApiId,
        versionString: "1.2.0",
        eventApiVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: "description",
          displayName: "displayName",
          producedEventVersionIds: [EventVersionId_2, EventVersionId_1],
          consumedEventVersionIds: [EventVersionId_2, EventVersionId_1],
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: false,
      });
      const epSdkEventApiVersionTask_ExecuteReturn: IEpSdkEventApiVersionTask_ExecuteReturn =
        await epSdkEventApiVersionTask.execute();

      const message = TestLogger.createLogMessage(
        "epSdkEventApiVersionTask_ExecuteReturn",
        epSdkEventApiVersionTask_ExecuteReturn
      );

      expect(
        epSdkEventApiVersionTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.NO_ACTION);
      expect(epSdkEventApiVersionTask_ExecuteReturn.epObject.id, message).to.eq(
        EventApiVersionId
      );

      // // DEBUG
      // expect(false, message).to.be.true;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: event api version present: checkmode update`, async () => {
    try {
      const epSdkEventApiVersionTask = new EpSdkEventApiVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventApiId: EventApiId,
        versionString: "1.2.0",
        eventApiVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: "updated description",
          displayName: "displayName",
          producedEventVersionIds: [EventVersionId_1, EventVersionId_2],
          consumedEventVersionIds: [EventVersionId_1, EventVersionId_2],
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: true,
      });
      const epSdkEventApiVersionTask_ExecuteReturn: IEpSdkEventApiVersionTask_ExecuteReturn =
        await epSdkEventApiVersionTask.execute();

      const message = TestLogger.createLogMessage(
        "epSdkEventApiVersionTask_ExecuteReturn",
        epSdkEventApiVersionTask_ExecuteReturn
      );

      expect(
        epSdkEventApiVersionTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.WOULD_CREATE_NEW_VERSION);
      expect(epSdkEventApiVersionTask_ExecuteReturn.epObject.id, message).to.eq(
        EventApiVersionId
      );

      // // DEBUG
      // expect(false, message).to.be.true;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: event api version present: update`, async () => {
    try {
      const epSdkEventApiVersionTask = new EpSdkEventApiVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventApiId: EventApiId,
        versionString: "1.2.0",
        eventApiVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: "updated description",
          displayName: "displayName",
          producedEventVersionIds: [EventVersionId_1, EventVersionId_2],
          consumedEventVersionIds: [EventVersionId_1, EventVersionId_2],
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: false,
      });
      const epSdkEventApiVersionTask_ExecuteReturn: IEpSdkEventApiVersionTask_ExecuteReturn =
        await epSdkEventApiVersionTask.execute();

      const message = TestLogger.createLogMessage(
        "epSdkEventApiVersionTask_ExecuteReturn",
        epSdkEventApiVersionTask_ExecuteReturn
      );

      expect(
        epSdkEventApiVersionTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.CREATE_NEW_VERSION);
      expect(
        epSdkEventApiVersionTask_ExecuteReturn.epObject.eventApiId,
        message
      ).to.eq(EventApiId);
      expect(
        epSdkEventApiVersionTask_ExecuteReturn.epObject.version,
        message
      ).to.eq("1.2.1");

      EventApiVersionId = epSdkEventApiVersionTask_ExecuteReturn.epObject.id;

      // // DEBUG
      // expect(false, message).to.be.true;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: event api version absent`, async () => {
    try {
      const epSdkEventApiVersionTask = new EpSdkEventApiVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        applicationDomainId: ApplicationDomainId,
        eventApiId: EventApiId,
        versionString: "1.2.0",
        eventApiVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: "updated description",
          displayName: "displayName",
          producedEventVersionIds: [EventVersionId_1, EventVersionId_2],
          consumedEventVersionIds: [EventVersionId_1, EventVersionId_2],
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: false,
      });
      const epSdkEventApiVersionTask_ExecuteReturn: IEpSdkEventApiVersionTask_ExecuteReturn =
        await epSdkEventApiVersionTask.execute();
      // // DEBUG
      // const message = TestLogger.createLogMessage('epSdkEventApiVersionTask_ExecuteReturn', epSdkEventApiVersionTask_ExecuteReturn);
      // expect(false, message).to.be.true;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(
        e instanceof EpSdkFeatureNotSupportedError,
        TestLogger.createNotEpSdkErrorMessage(e)
      ).to.be.true;
    }
  });

  it(`${scriptName}: event api version present: create exact version match`, async () => {
    const ExactVersionString = "2.0.0";
    try {
      const epSdkEventApiVersionTask = new EpSdkEventApiVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventApiId: EventApiId,
        versionString: ExactVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        eventApiVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: "description",
          displayName: "displayName",
          producedEventVersionIds: [EventVersionId_1, EventVersionId_2],
          consumedEventVersionIds: [EventVersionId_1, EventVersionId_2],
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: false,
      });
      const epSdkEventApiVersionTask_ExecuteReturn: IEpSdkEventApiVersionTask_ExecuteReturn =
        await epSdkEventApiVersionTask.execute();
      const message = TestLogger.createLogMessage(
        "epSdkEventApiVersionTask_ExecuteReturn",
        epSdkEventApiVersionTask_ExecuteReturn
      );
      expect(
        epSdkEventApiVersionTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.CREATE_NEW_VERSION);
      expect(
        epSdkEventApiVersionTask_ExecuteReturn.epObject.version,
        message
      ).to.eq(ExactVersionString);
      // // DEBUG
      // expect(false, message).to.be.true;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: event api version present: create exact version match: idempotency`, async () => {
    const ExactVersionString = "2.0.0";
    try {
      const epSdkEventApiVersionTask = new EpSdkEventApiVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventApiId: EventApiId,
        versionString: ExactVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        eventApiVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: "description",
          displayName: "displayName",
          producedEventVersionIds: [EventVersionId_1, EventVersionId_2],
          consumedEventVersionIds: [EventVersionId_1, EventVersionId_2],
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: false,
      });
      const epSdkEventApiVersionTask_ExecuteReturn: IEpSdkEventApiVersionTask_ExecuteReturn =
        await epSdkEventApiVersionTask.execute();
      const message = TestLogger.createLogMessage(
        "epSdkEventApiVersionTask_ExecuteReturn",
        epSdkEventApiVersionTask_ExecuteReturn
      );
      expect(
        epSdkEventApiVersionTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.NO_ACTION);
      expect(
        epSdkEventApiVersionTask_ExecuteReturn.epObject.version,
        message
      ).to.eq(ExactVersionString);
      // // DEBUG
      // expect(false, message).to.be.true;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: event api version present: create exact version match: should catch error`, async () => {
    const ExactVersionString = "2.0.0";
    try {
      const epSdkEventApiVersionTask = new EpSdkEventApiVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventApiId: EventApiId,
        versionString: ExactVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        eventApiVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: "update description",
          displayName: "displayName",
          producedEventVersionIds: [EventVersionId_1, EventVersionId_2],
          consumedEventVersionIds: [EventVersionId_1, EventVersionId_2],
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: false,
      });
      const epSdkEventApiVersionTask_ExecuteReturn: IEpSdkEventApiVersionTask_ExecuteReturn =
        await epSdkEventApiVersionTask.execute();
      const message = TestLogger.createLogMessage(
        "epSdkEventApiVersionTask_ExecuteReturn",
        epSdkEventApiVersionTask_ExecuteReturn
      );
      expect(false, message).to.be.true;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(
        e instanceof EpSdkVersionTaskStrategyValidationError,
        TestLogger.createNotEpSdkErrorMessage(e)
      ).to.be.true;
      const epSdkVersionTaskStrategyValidationError: EpSdkVersionTaskStrategyValidationError =
        e;
      const details: TEpSdkVersionTaskStrategyValidationError_Details =
        epSdkVersionTaskStrategyValidationError.details;
      expect(
        details.versionString,
        TestLogger.createEpSdkTestFailMessage("failed", e)
      ).to.eq(ExactVersionString);
      expect(
        details.existingVersionString,
        TestLogger.createEpSdkTestFailMessage("failed", e)
      ).to.eq(ExactVersionString);
      const transactionLogData: IEpSdkTask_TransactionLogData =
        epSdkVersionTaskStrategyValidationError.details.transactionLogData;
      expect(
        transactionLogData.epSdkTask_Action,
        TestLogger.createEpSdkTestFailMessage("failed", e)
      ).to.eq(EEpSdkTask_Action.NO_ACTION);
      expect(
        transactionLogData.epSdkTask_IsUpdateRequiredFuncReturn
          .isUpdateRequired,
        TestLogger.createEpSdkTestFailMessage("failed", e)
      ).to.be.true;
    }
  });

  it(`${scriptName}: event api version present: create exact version match with checkmode: should return would fail`, async () => {
    const ExactVersionString = "1.0.0";
    try {
      const epSdkEventApiVersionTask = new EpSdkEventApiVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventApiId: EventApiId,
        versionString: ExactVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        eventApiVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: "update description",
          displayName: "displayName",
          producedEventVersionIds: [EventVersionId_1, EventVersionId_2],
          consumedEventVersionIds: [EventVersionId_1, EventVersionId_2],
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: true,
      });
      const epSdkEventApiVersionTask_ExecuteReturn: IEpSdkEventApiVersionTask_ExecuteReturn =
        await epSdkEventApiVersionTask.execute();
      expect(
        epSdkEventApiVersionTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        TestLogger.createLogMessage(
          "wrong action",
          epSdkEventApiVersionTask_ExecuteReturn.epSdkTask_TransactionLogData
        )
      ).to.eq(
        EEpSdkTask_Action.WOULD_FAIL_CREATE_NEW_VERSION_ON_EXACT_VERSION_REQUIREMENT
      );
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: event api version present: create version without updates to settings`, async () => {
    const settings: TEpSdkEventApiVersionTask_Settings = {
      stateId: EpSdkStatesService.releasedId,
      description: "description",
      displayName: "displayName",
      producedEventVersionIds: [EventVersionId_1, EventVersionId_2],
      consumedEventVersionIds: [EventVersionId_1, EventVersionId_2],
    };
    try {
      // create a reference version
      const epSdkEventApiVersionTask_Ref = new EpSdkEventApiVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventApiId: EventApiId,
        // versionString: newVersion,
        // versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        eventApiVersionSettings: settings,
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: false,
      });
      const epSdkEventApiVersionTask_ExecuteReturn_Ref: IEpSdkEventApiVersionTask_ExecuteReturn =
        await epSdkEventApiVersionTask_Ref.execute();
      const referenceVersionString: string =
        epSdkEventApiVersionTask_ExecuteReturn_Ref.epObject.version
          ? epSdkEventApiVersionTask_ExecuteReturn_Ref.epObject.version
          : "not-a-version";
      // bump the version
      const newVersion = EpSdkSemVerUtils.createNextVersionByStrategy({
        fromVersionString: referenceVersionString,
        strategy: EEpSdk_VersionStrategy.BUMP_MINOR,
      });
      // create new version even no other updates to settings
      const epSdkEventApiVersionTask_New = new EpSdkEventApiVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventApiId: EventApiId,
        versionString: newVersion,
        // versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        eventApiVersionSettings: settings,
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: false,
      });
      let epSdkEventApiVersionTask_ExecuteReturn: IEpSdkEventApiVersionTask_ExecuteReturn =
        await epSdkEventApiVersionTask_New.execute();
      let message = TestLogger.createLogMessage(
        "epSdkEventApiVersionTask_ExecuteReturn",
        epSdkEventApiVersionTask_ExecuteReturn
      );
      // get the latest version to check
      let latestVersionString =
        await EpSdkEventApiVersionsService.getLatestVersionString({
          eventApiId: EventApiId,
        });
      // expect no change in version
      expect(latestVersionString, message).to.eq(referenceVersionString);
      expect(
        epSdkEventApiVersionTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.NO_ACTION);

      // now test exact match, checkmode=true for newVersion: should return Would create new version
      const epSdkEventApiVersionTask_NewCreatedCheck =
        new EpSdkEventApiVersionTask({
          epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
          applicationDomainId: ApplicationDomainId,
          eventApiId: EventApiId,
          versionString: newVersion,
          versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
          eventApiVersionSettings: settings,
          epSdkTask_TransactionConfig: {
            parentTransactionId: "parentTransactionId",
            groupTransactionId: "groupTransactionId",
          },
          checkmode: true,
        });
      epSdkEventApiVersionTask_ExecuteReturn =
        await epSdkEventApiVersionTask_NewCreatedCheck.execute();
      message = TestLogger.createLogMessage(
        "epSdkEventApiVersionTask_ExecuteReturn",
        epSdkEventApiVersionTask_ExecuteReturn
      );
      expect(
        epSdkEventApiVersionTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.WOULD_CREATE_NEW_VERSION);
      expect(
        epSdkEventApiVersionTask_ExecuteReturn.epObject.version,
        message
      ).to.eq(newVersion);

      // now test exact match, checkmode=false for newVersion: should create it
      const epSdkEventApiVersionTask_NewCreated = new EpSdkEventApiVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventApiId: EventApiId,
        versionString: newVersion,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        eventApiVersionSettings: settings,
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: false,
      });
      epSdkEventApiVersionTask_ExecuteReturn =
        await epSdkEventApiVersionTask_NewCreated.execute();
      message = TestLogger.createLogMessage(
        "epSdkEventApiVersionTask_ExecuteReturn",
        epSdkEventApiVersionTask_ExecuteReturn
      );
      expect(
        epSdkEventApiVersionTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.CREATE_NEW_VERSION);
      expect(
        epSdkEventApiVersionTask_ExecuteReturn.epObject.version,
        message
      ).to.eq(newVersion);
      latestVersionString =
        await EpSdkEventApiVersionsService.getLatestVersionString({
          eventApiId: EventApiId,
        });
      expect(latestVersionString, message).to.eq(newVersion);

      // now test exact match, checkmode=true going back to reference version: should return Would fail
      const epSdkEventApiVersionTask_RefCheck = new EpSdkEventApiVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventApiId: EventApiId,
        versionString: referenceVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        eventApiVersionSettings: settings,
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: true,
      });
      epSdkEventApiVersionTask_ExecuteReturn =
        await epSdkEventApiVersionTask_RefCheck.execute();
      message = TestLogger.createLogMessage(
        "epSdkEventApiVersionTask_ExecuteReturn",
        epSdkEventApiVersionTask_ExecuteReturn
      );
      expect(
        epSdkEventApiVersionTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(
        EEpSdkTask_Action.WOULD_FAIL_CREATE_NEW_VERSION_ON_EXACT_VERSION_REQUIREMENT
      );
      expect(
        epSdkEventApiVersionTask_ExecuteReturn.epObject.version,
        message
      ).to.eq(referenceVersionString);
      latestVersionString =
        await EpSdkEventApiVersionsService.getLatestVersionString({
          eventApiId: EventApiId,
        });
      expect(latestVersionString, message).to.eq(newVersion);

      // could also check the error for checkmode = false
      // DEBUG
      // expect(false, message).to.be.true;
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
