import "mocha";
import { expect } from "chai";
import path from "path";
import { TestContext, TestUtils } from "@internal/tools/src";
import { TestLogger, TestConfig, TestHelpers } from "../../lib";
import {
  ApiError,
  ApplicationDomainResponse,
  ApplicationDomainsService,
  SchemaResponse,
  SchemasService,
  SchemaVersion,
} from "@solace-labs/ep-openapi-node";
import {
  EpSdkError,
  EpSdkApplicationDomainsService,
  EpSdkEpEventTask,
  IEpSdkEpEventTask_ExecuteReturn,
  EEpSdkTask_Action,
  EEpSdkTask_TargetState,
  EpSdkBrokerTypes,
  EEpSdkSchemaType,
  EEpSdkSchemaContentType,
  EpSdkSchemaVersionsService,
  EpSdkStatesService,
  EpSdkEpEventVersionTask,
  IEpSdkEpEventVersionTask_ExecuteReturn,
  IEpSdkEpEventVersionTask_CreateFuncReturn,
  EpSdkEpApiError,
  EpSdkTaskConfigValidationError,
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

let EventName: string;
let EventId: string | undefined;
let EventVersionId: string | undefined;
let EventVersionId2: string | undefined;
const EventObjectSettings = {
  shared: true,
  brokerType: EpSdkBrokerTypes.Kafka
};

const initializeGlobals = () => {
  ApplicationDomainName = `${TestConfig.getAppId()}/tasks/${TestSpecName}`;
  SchemaName = `${TestConfig.getAppId()}-tasks-kafka-${TestSpecName}`;
  EventName = `${TestConfig.getAppId()}-tasks-kafka-${TestSpecName}`;
};

describe(`${scriptName}`, () => {
  before(async () => {
    initializeGlobals();
    TestContext.newItId();
    const xvoid: void = await TestHelpers.applicationDomainAbsent({applicationDomainName: ApplicationDomainName,});
    TestContext.newItId();
    const applicationDomainResponse: ApplicationDomainResponse =
      await ApplicationDomainsService.createApplicationDomain({
        requestBody: {
          name: ApplicationDomainName,
        },
      });
    ApplicationDomainId = applicationDomainResponse.data.id;
    TestContext.newItId();
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
    TestContext.newItId();
    const createSchemaVersion: SchemaVersion = {
      schemaId: SchemaId,
      displayName: "displayName",
      description: `schema version for schema = ${SchemaName}, id=${SchemaId}`,
      version: "1.0.0",
    };
    TestContext.newItId();
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
    const xvoid: void = await TestHelpers.applicationDomainAbsent({applicationDomainName: ApplicationDomainName,});
  });

  it(`${scriptName}: epEvent present: checkmode create`, async () => {
    try {
      const epSdkEpEventTask = new EpSdkEpEventTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventName: EventName,
        eventObjectSettings: EventObjectSettings,
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: true,
      });

      const epSdkEpEventTask_ExecuteReturn: IEpSdkEpEventTask_ExecuteReturn =
        await epSdkEpEventTask.execute();

      const message = TestLogger.createLogMessage(
        "epSdkEpEventTask_ExecuteReturn",
        epSdkEpEventTask_ExecuteReturn
      );
      expect(
        epSdkEpEventTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.WOULD_CREATE);

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

  it(`${scriptName}: epEvent present: create`, async () => {
    try {
      const epSdkEpEventTask = new EpSdkEpEventTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventName: EventName,
        eventObjectSettings: EventObjectSettings,
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
      });

      const epSdkEpEventTask_ExecuteReturn: IEpSdkEpEventTask_ExecuteReturn =
        await epSdkEpEventTask.execute();

      const message = TestLogger.createLogMessage(
        "epSdkEpEventTask_ExecuteReturn",
        epSdkEpEventTask_ExecuteReturn
      );
      expect(
        epSdkEpEventTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.CREATE);

      EventId = epSdkEpEventTask_ExecuteReturn.epObject.id;

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

  it(`${scriptName}: epEvent present: create: idempotency`, async () => {
    try {
      const epSdkEpEventTask = new EpSdkEpEventTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventName: EventName,
        eventObjectSettings: EventObjectSettings,
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
      });

      const epSdkEpEventTask_ExecuteReturn: IEpSdkEpEventTask_ExecuteReturn =
        await epSdkEpEventTask.execute();

      const message = TestLogger.createLogMessage(
        "epSdkEpEventTask_ExecuteReturn",
        epSdkEpEventTask_ExecuteReturn
      );
      expect(
        epSdkEpEventTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.NO_ACTION);
      expect(epSdkEpEventTask_ExecuteReturn.epObject.id, message).to.eq(
        EventId
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

  it(`${scriptName}: epEvent present: checkmode update`, async () => {
    try {
      const epSdkEpEventTask = new EpSdkEpEventTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventName: EventName,
        eventObjectSettings: {
          ...EventObjectSettings,
          shared: false
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: true,
      });

      const epSdkEpEventTask_ExecuteReturn: IEpSdkEpEventTask_ExecuteReturn =
        await epSdkEpEventTask.execute();

      const message = TestLogger.createLogMessage(
        "epSdkEpEventTask_ExecuteReturn",
        epSdkEpEventTask_ExecuteReturn
      );

      expect(
        epSdkEpEventTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.WOULD_UPDATE);
      expect(epSdkEpEventTask_ExecuteReturn.epObject.id, message).to.eq(
        EventId
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

  it(`${scriptName}: epEvent present: update`, async () => {
    try {
      const epSdkEpEventTask = new EpSdkEpEventTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventName: EventName,
        eventObjectSettings: {
          ...EventObjectSettings,
          shared: false
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: false,
      });

      const epSdkEpEventTask_ExecuteReturn: IEpSdkEpEventTask_ExecuteReturn =
        await epSdkEpEventTask.execute();

      const message = TestLogger.createLogMessage(
        "epSdkEpEventTask_ExecuteReturn",
        epSdkEpEventTask_ExecuteReturn
      );

      expect(
        epSdkEpEventTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.UPDATE);
      expect(epSdkEpEventTask_ExecuteReturn.epObject.id, message).to.eq(
        EventId
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

  it(`${scriptName}: epEvent present: idempotency`, async () => {
    try {
      const epSdkEpEventTask = new EpSdkEpEventTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventName: EventName,
        eventObjectSettings: {
          ...EventObjectSettings,
          shared: false
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: false,
      });

      const epSdkEpEventTask_ExecuteReturn: IEpSdkEpEventTask_ExecuteReturn =
        await epSdkEpEventTask.execute();

      const message = TestLogger.createLogMessage(
        "epSdkEpEventTask_ExecuteReturn",
        epSdkEpEventTask_ExecuteReturn
      );
      expect(
        epSdkEpEventTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.NO_ACTION);
      expect(epSdkEpEventTask_ExecuteReturn.epObject.id, message).to.eq(
        EventId
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

  it(`${scriptName}: epEvent absent: checkmode with existing`, async () => {
    try {
      const epSdkEpEventTask = new EpSdkEpEventTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        applicationDomainId: ApplicationDomainId,
        eventName: EventName,
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: true,
      });

      const epSdkEpEventTask_ExecuteReturn: IEpSdkEpEventTask_ExecuteReturn =
        await epSdkEpEventTask.execute();

      const message = TestLogger.createLogMessage(
        "epSdkEpEventTask_ExecuteReturn",
        epSdkEpEventTask_ExecuteReturn
      );

      expect(
        epSdkEpEventTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.WOULD_DELETE);
      expect(epSdkEpEventTask_ExecuteReturn.epObject.id, message).to.eq(
        EventId
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

  it(`${scriptName}: epEvent absent`, async () => {
    try {
      const epSdkEpEventTask = new EpSdkEpEventTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        applicationDomainId: ApplicationDomainId,
        eventName: EventName,
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
      });

      const epSdkEpEventTask_ExecuteReturn: IEpSdkEpEventTask_ExecuteReturn =
        await epSdkEpEventTask.execute();

      const message = TestLogger.createLogMessage(
        "epSdkEpEventTask_ExecuteReturn",
        epSdkEpEventTask_ExecuteReturn
      );

      expect(
        epSdkEpEventTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.DELETE);
      expect(epSdkEpEventTask_ExecuteReturn.epObject.id, message).to.eq(
        EventId
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

  it(`${scriptName}: epEvent absent: checkmode with non-existing`, async () => {
    try {
      const NonExisting = "non-existing";

      const epSdkEpEventTask = new EpSdkEpEventTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        applicationDomainId: ApplicationDomainId,
        eventName: NonExisting,
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: true,
      });

      const epSdkEpEventTask_ExecuteReturn: IEpSdkEpEventTask_ExecuteReturn =
        await epSdkEpEventTask.execute();

      const message = TestLogger.createLogMessage(
        "epSdkEpEventTask_ExecuteReturn",
        epSdkEpEventTask_ExecuteReturn
      );

      expect(
        epSdkEpEventTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.NO_ACTION);
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

  it(`${scriptName}: epEvent present: create`, async () => {
    try {
      const epSdkEpEventTask = new EpSdkEpEventTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventName: EventName,
        eventObjectSettings: EventObjectSettings,
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
      });

      const epSdkEpEventTask_ExecuteReturn: IEpSdkEpEventTask_ExecuteReturn =
        await epSdkEpEventTask.execute();

      const message = TestLogger.createLogMessage(
        "epSdkEpEventTask_ExecuteReturn",
        epSdkEpEventTask_ExecuteReturn
      );
      expect(
        epSdkEpEventTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.CREATE);

      EventId = epSdkEpEventTask_ExecuteReturn.epObject.id;

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

  it(`${scriptName}: event version present: test topic delimiter validation error`, async () => {
    try {
      const epSdkEpEventVersionTask = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        versionString: "1.2.0",
        topicString: "test/hello/world",
        topicDelimiter: "more than 1 char",
        eventVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: "description",
          displayName: "displayName",
          schemaVersionId: SchemaVersionId,
          brokerType: EpSdkBrokerTypes.Kafka,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: true,
      });
      const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn = await epSdkEpEventVersionTask.execute();
      expect(false, TestLogger.createLogMessage('should never get here')).to.be.true;
    } catch (e) {
      if(e instanceof EpSdkTaskConfigValidationError) {
        expect(JSON.stringify(e), TestLogger.createLogMessage('error', e)).to.include('topicDelimiter');
      } else {
        if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
      }
    }
  });

  it(`${scriptName}: event version present: checkmode create`, async () => {
    try {
      const epSdkEpEventVersionTask = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        versionString: "1.2.0",
        topicString: "test_hello_world",
        topicDelimiter: "_",
        eventVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: "description",
          displayName: "displayName",
          schemaVersionId: SchemaVersionId,
          brokerType: EpSdkBrokerTypes.Kafka,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: true,
      });

      const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn = await epSdkEpEventVersionTask.execute();
      const message = TestLogger.createLogMessage("epSdkEpEventVersionTask_ExecuteReturn", epSdkEpEventVersionTask_ExecuteReturn);

      expect(epSdkEpEventVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_CREATE_FIRST_VERSION);

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

  it(`${scriptName}: event version present: create with kafka`, async () => {
    try {
      const epSdkEpEventVersionTask = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        versionString: "1.0.0",
        topicString: "test_hello_world",
        topicDelimiter: "_",
        eventVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: "description",
          displayName: "displayName",
          schemaVersionId: SchemaVersionId,
          brokerType: EpSdkBrokerTypes.Kafka,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
      });

      const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn = await epSdkEpEventVersionTask.execute();

      const message = TestLogger.createLogMessage("epSdkEpEventVersionTask_ExecuteReturn", epSdkEpEventVersionTask_ExecuteReturn);
      expect(epSdkEpEventVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message ).to.eq(EEpSdkTask_Action.CREATE_FIRST_VERSION);
      const epSdkEpEventVersionTask_CreateFuncReturn: IEpSdkEpEventVersionTask_CreateFuncReturn = epSdkEpEventVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_CreateFuncReturn;
      const deliveryDescriptor = epSdkEpEventVersionTask_CreateFuncReturn.epObject.deliveryDescriptor;
      expect(deliveryDescriptor.brokerType, message ).to.eq(EpSdkBrokerTypes.Kafka);
      expect(deliveryDescriptor.address, message).to.not.be.undefined;
      expect(deliveryDescriptor.address.addressLevels, message).to.not.be.undefined;
      expect(deliveryDescriptor.address.addressLevels.length, message).to.eq(3);

      EventVersionId = epSdkEpEventVersionTask_ExecuteReturn.epObject.id;

      // // DEBUG
      // expect(false, message).to.be.true;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: new event version present: create with solace`, async () => {
    try {
      const epSdkEpEventVersionTask = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        versionString: "2.0.0",
        topicString: "test_hello_world",
        topicDelimiter: "_",
        eventVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: "description",
          displayName: "displayName",
          schemaVersionId: SchemaVersionId,
          brokerType: EpSdkBrokerTypes.Solace,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
      });
      const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn = await epSdkEpEventVersionTask.execute();
      expect(false, TestLogger.createLogMessage('should never get here')).to.be.true;
    } catch (e) {
      if(e instanceof EpSdkEpApiError) {
        expect(e.apiError.status, TestLogger.createApiTestFailMessage("wrong status code")).to.equal(400);
      } else {
        if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;  
      }
    }
  });

});
