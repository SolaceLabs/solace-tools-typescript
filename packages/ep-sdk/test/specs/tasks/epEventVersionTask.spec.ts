import "mocha";
import { expect } from "chai";
import path from "path";
import { TestContext, TestUtils } from "@internal/tools/src";
import { TestLogger, TestConfig, TestHelpers } from "../../lib";
import {
  ApiError,
  ApplicationDomainResponse,
  ApplicationDomainsService,
  EventResponse,
  EventsService,
  EventVersion,
  SchemaResponse,
  SchemasService,
  SchemaVersion,
} from "@solace-labs/ep-openapi-node";
import {
  EpSdkError,
  EpSdkFeatureNotSupportedError,
  EpSdkInvalidSemVerStringError,
  EpSdkVersionTaskStrategyValidationError,
  TEpSdkVersionTaskStrategyValidationError_Details,
  EpSdkApplicationDomainsService,
  EpSdkEpEventVersionTask,
  IEpSdkEpEventVersionTask_Config,
  IEpSdkEpEventVersionTask_ExecuteReturn,
  TEpSdkEpEventVersionTask_Settings,
  EpSdkStatesService,
  EEpSdk_VersionTaskStrategy,
  IEpSdkTask_TransactionLogData,
  EpSdkSemVerUtils,
  EEpSdk_VersionStrategy,
  EEpSdkSchemaType,
  EpSdkSchemaVersionsService,
  EpSdkEpEventVersionsService,
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

let EventName: string;
let EventId: string | undefined;
let EventVersionId: string | undefined;

const initializeGlobals = () => {
  ApplicationDomainName = `${TestConfig.getAppId()}/tasks/${TestSpecName}/${TestSpecId}`;
  SchemaName = `${TestConfig.getAppId()}-tasks-${TestSpecName}`;
  EventName = `${TestConfig.getAppId()}-tasks-${TestSpecName}`;
  // EpSdkLogger.getLoggerInstance().setLogLevel(EEpSdkLogLevel.Trace);
};

describe(`${scriptName}`, () => {
  before(async () => {
    initializeGlobals();
    TestContext.newItId();
    const xvoid: void = await TestHelpers.applicationDomainAbsent({applicationDomainName: ApplicationDomainName,});
    TestContext.newItId();
    try {
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

      const eventResponse: EventResponse = await EventsService.createEvent({
        requestBody: {
          applicationDomainId: ApplicationDomainId,
          name: EventName,
        },
      });
      EventId = eventResponse.data.id;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed", e)).to.be
          .true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async () => {
    TestContext.newItId();
    try {
      await EpSdkApplicationDomainsService.deleteByName({
        applicationDomainName: ApplicationDomainName,
      });
    } catch (e) {}
  });

  it(`${scriptName}: event version present: checkmode create`, async () => {
    try {
      const epSdkEpEventVersionTask = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        versionString: "1.2.0",
        topicString: "test/hello/world",
        eventVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: "description",
          displayName: "displayName",
          schemaVersionId: SchemaVersionId,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: true,
      });

      const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn =
        await epSdkEpEventVersionTask.execute();

      const message = TestLogger.createLogMessage(
        "epSdkEpEventVersionTask_ExecuteReturn",
        epSdkEpEventVersionTask_ExecuteReturn
      );

      expect(
        epSdkEpEventVersionTask_ExecuteReturn.epSdkTask_TransactionLogData
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

  it(`${scriptName}: event version present: create`, async () => {
    try {
      const epSdkEpEventVersionTask = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        versionString: "1.2.0",
        topicString: "test/hello/world",
        eventVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: "description",
          displayName: "displayName",
          schemaVersionId: SchemaVersionId,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
      });

      const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn =
        await epSdkEpEventVersionTask.execute();

      const message = TestLogger.createLogMessage(
        "epSdkEpEventVersionTask_ExecuteReturn",
        epSdkEpEventVersionTask_ExecuteReturn
      );
      expect(
        epSdkEpEventVersionTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.CREATE_FIRST_VERSION);

      EventVersionId = epSdkEpEventVersionTask_ExecuteReturn.epObject.id;

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

  it(`${scriptName}: event version present: create idempotency`, async () => {
    try {
      const epSdkEpEventVersionTask = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        versionString: "1.2.0",
        topicString: "test/hello/world",
        eventVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: "description",
          displayName: "displayName",
          schemaVersionId: SchemaVersionId,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
      });

      const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn =
        await epSdkEpEventVersionTask.execute();

      const message = TestLogger.createLogMessage(
        "epSdkEpEventVersionTask_ExecuteReturn",
        epSdkEpEventVersionTask_ExecuteReturn
      );

      expect(
        epSdkEpEventVersionTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.NO_ACTION);
      expect(epSdkEpEventVersionTask_ExecuteReturn.epObject.id, message).to.eq(
        EventVersionId
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

  it(`${scriptName}: event version present: checkmode update`, async () => {
    try {
      const epSdkEpEventVersionTask = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        versionString: "1.2.0",
        topicString: "test/hello/world",
        eventVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: "updated description",
          displayName: "displayName",
          schemaVersionId: SchemaVersionId,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: true,
      });

      const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn =
        await epSdkEpEventVersionTask.execute();

      const message = TestLogger.createLogMessage(
        "epSdkEpEventVersionTask_ExecuteReturn",
        epSdkEpEventVersionTask_ExecuteReturn
      );

      expect(
        epSdkEpEventVersionTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.WOULD_CREATE_NEW_VERSION);
      expect(epSdkEpEventVersionTask_ExecuteReturn.epObject.id, message).to.eq(
        EventVersionId
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

  it(`${scriptName}: event version present: update`, async () => {
    try {
      const epSdkEpEventVersionTask = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        versionString: "1.2.0",
        topicString: "test/hello/world",
        eventVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: "updated description",
          displayName: "displayName",
          schemaVersionId: SchemaVersionId,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: false,
      });

      const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn =
        await epSdkEpEventVersionTask.execute();

      const message = TestLogger.createLogMessage(
        "epSdkEpEventVersionTask_ExecuteReturn",
        epSdkEpEventVersionTask_ExecuteReturn
      );

      expect(
        epSdkEpEventVersionTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.CREATE_NEW_VERSION);
      expect(
        epSdkEpEventVersionTask_ExecuteReturn.epObject.eventId,
        message
      ).to.eq(EventId);
      expect(
        epSdkEpEventVersionTask_ExecuteReturn.epObject.version,
        message
      ).to.eq("1.2.1");

      EventVersionId = epSdkEpEventVersionTask_ExecuteReturn.epObject.id;

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

  it(`${scriptName}: event version present: update , catch not semver error`, async () => {
    try {
      const epSdkEpEventVersionTask = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        versionString: "not-semver",
        topicString: "test/hello/world",
        eventVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: "updated description",
          displayName: "displayName",
          schemaVersionId: SchemaVersionId,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: false,
      });

      const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn =
        await epSdkEpEventVersionTask.execute();
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(
        e instanceof EpSdkInvalidSemVerStringError,
        TestLogger.createNotEpSdkErrorMessage(e)
      ).to.be.true;
    }
  });

  it(`${scriptName}: event version absent`, async () => {
    try {
      const epSdkEpEventVersionTask = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        versionString: "1.2.0",
        topicString: "test/hello/world",
        eventVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: "updated description",
          displayName: "displayName",
          schemaVersionId: SchemaVersionId,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: false,
      });
      const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn =
        await epSdkEpEventVersionTask.execute();
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

  it(`${scriptName}: event version present: create exact version match`, async () => {
    const ExactVersionString = "2.0.0";
    try {
      const epSdkEpEventVersionTask = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        versionString: ExactVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        topicString: "test/hello/world",
        eventVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: "description",
          displayName: "displayName",
          schemaVersionId: SchemaVersionId,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: false,
      });
      const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn =
        await epSdkEpEventVersionTask.execute();
      const message = TestLogger.createLogMessage(
        "epSdkEpEventVersionTask_ExecuteReturn",
        epSdkEpEventVersionTask_ExecuteReturn
      );
      expect(
        epSdkEpEventVersionTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.CREATE_NEW_VERSION);
      expect(
        epSdkEpEventVersionTask_ExecuteReturn.epObject.version,
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

  it(`${scriptName}: event version present: create exact version match: idempotency`, async () => {
    const ExactVersionString = "2.0.0";
    try {
      const epSdkEpEventVersionTask = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        versionString: ExactVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        topicString: "test/hello/world",
        eventVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: "description",
          displayName: "displayName",
          schemaVersionId: SchemaVersionId,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: false,
      });
      const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn =
        await epSdkEpEventVersionTask.execute();
      const message = TestLogger.createLogMessage(
        "epSdkEpEventVersionTask_ExecuteReturn",
        epSdkEpEventVersionTask_ExecuteReturn
      );
      expect(
        epSdkEpEventVersionTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.NO_ACTION);
      expect(
        epSdkEpEventVersionTask_ExecuteReturn.epObject.version,
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

  it(`${scriptName}: event version present: create exact version match: should catch error`, async () => {
    const ExactVersionString = "2.0.0";
    try {
      const epSdkEpEventVersionTask = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        versionString: ExactVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        topicString: "test/hello/world",
        eventVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: "updated description",
          displayName: "displayName",
          schemaVersionId: SchemaVersionId,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: false,
      });
      const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn =
        await epSdkEpEventVersionTask.execute();
      expect(false, TestLogger.createApiTestFailMessage("must never get here"))
        .to.be.true;
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

  it(`${scriptName}: event version present: create exact version match with checkmode: should return would fail`, async () => {
    const ExactVersionString = "2.0.0";
    try {
      const epSdkEpEventVersionTask = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        versionString: ExactVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        topicString: "test/hello/world",
        eventVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: "updated description",
          displayName: "displayName",
          schemaVersionId: SchemaVersionId,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: true,
      });
      const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn =
        await epSdkEpEventVersionTask.execute();
      expect(
        epSdkEpEventVersionTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        TestLogger.createLogMessage(
          "wrong action",
          epSdkEpEventVersionTask_ExecuteReturn.epSdkTask_TransactionLogData
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

  it(`${scriptName}: event version present: create version without updates to settings`, async () => {
    const settings: TEpSdkEpEventVersionTask_Settings = {
      stateId: EpSdkStatesService.releasedId,
      description: "description",
      displayName: "displayName",
      schemaVersionId: SchemaVersionId,
    };
    try {
      // create a reference version
      const epSdkEpEventVersionTask_Ref = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        // versionString: newVersion,
        // versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        eventVersionSettings: settings,
        topicString: "test/hello/world",
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: false,
      });
      const epSdkEpEventVersionTask_ExecuteReturn_Ref: IEpSdkEpEventVersionTask_ExecuteReturn =
        await epSdkEpEventVersionTask_Ref.execute();
      const referenceVersionString: string =
        epSdkEpEventVersionTask_ExecuteReturn_Ref.epObject.version
          ? epSdkEpEventVersionTask_ExecuteReturn_Ref.epObject.version
          : "not-a-version";
      // bump the version
      const newVersion = EpSdkSemVerUtils.createNextVersionByStrategy({
        fromVersionString: referenceVersionString,
        strategy: EEpSdk_VersionStrategy.BUMP_MINOR,
      });
      // create new version even no other updates to settings
      const epSdkEpEventVersionTask_New = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        versionString: newVersion,
        // versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        eventVersionSettings: settings,
        topicString: "test/hello/world",
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: false,
      });
      let epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn =
        await epSdkEpEventVersionTask_New.execute();
      let message = TestLogger.createLogMessage(
        "epSdkEpEventVersionTask_ExecuteReturn",
        epSdkEpEventVersionTask_ExecuteReturn
      );
      // get the latest version to check
      let latestVersionString =
        await EpSdkEpEventVersionsService.getLatestVersionString({
          eventId: EventId,
        });
      // expect no change in version
      expect(latestVersionString, message).to.eq(referenceVersionString);
      expect(
        epSdkEpEventVersionTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.NO_ACTION);

      // now test exact match, checkmode=true for newVersion: should return Would create new version
      const epSdkEpEventVersionTask_NewCreatedCheck =
        new EpSdkEpEventVersionTask({
          epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
          applicationDomainId: ApplicationDomainId,
          eventId: EventId,
          versionString: newVersion,
          versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
          eventVersionSettings: settings,
          topicString: "test/hello/world",
          epSdkTask_TransactionConfig: {
            parentTransactionId: "parentTransactionId",
            groupTransactionId: "groupTransactionId",
          },
          checkmode: true,
        });
      epSdkEpEventVersionTask_ExecuteReturn =
        await epSdkEpEventVersionTask_NewCreatedCheck.execute();
      message = TestLogger.createLogMessage(
        "epSdkEpEventVersionTask_ExecuteReturn",
        epSdkEpEventVersionTask_ExecuteReturn
      );
      expect(
        epSdkEpEventVersionTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.WOULD_CREATE_NEW_VERSION);
      expect(
        epSdkEpEventVersionTask_ExecuteReturn.epObject.version,
        message
      ).to.eq(newVersion);

      // now test exact match, checkmode=false for newVersion: should create it
      const epSdkEpEventVersionTask_NewCreated = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        versionString: newVersion,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        eventVersionSettings: settings,
        topicString: "test/hello/world",
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: false,
      });
      epSdkEpEventVersionTask_ExecuteReturn =
        await epSdkEpEventVersionTask_NewCreated.execute();
      message = TestLogger.createLogMessage(
        "epSdkEpEventVersionTask_ExecuteReturn",
        epSdkEpEventVersionTask_ExecuteReturn
      );
      expect(
        epSdkEpEventVersionTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.CREATE_NEW_VERSION);
      expect(
        epSdkEpEventVersionTask_ExecuteReturn.epObject.version,
        message
      ).to.eq(newVersion);
      latestVersionString =
        await EpSdkEpEventVersionsService.getLatestVersionString({
          eventId: EventId,
        });
      expect(latestVersionString, message).to.eq(newVersion);

      // now test exact match, checkmode=true going back to reference version: should return Would fail
      const epSdkEpEventVersionTask_RefCheck = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        versionString: referenceVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        eventVersionSettings: settings,
        topicString: "test/hello/world",
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: true,
      });
      epSdkEpEventVersionTask_ExecuteReturn =
        await epSdkEpEventVersionTask_RefCheck.execute();
      message = TestLogger.createLogMessage(
        "epSdkEpEventVersionTask_ExecuteReturn",
        epSdkEpEventVersionTask_ExecuteReturn
      );
      expect(
        epSdkEpEventVersionTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(
        EEpSdkTask_Action.WOULD_FAIL_CREATE_NEW_VERSION_ON_EXACT_VERSION_REQUIREMENT
      );
      expect(
        epSdkEpEventVersionTask_ExecuteReturn.epObject.version,
        message
      ).to.eq(referenceVersionString);
      latestVersionString =
        await EpSdkEpEventVersionsService.getLatestVersionString({
          eventId: EventId,
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

  it(`${scriptName}: should use truncated version display name`, async () => {
    const VeryLongDisplayName =
      "123456789_123456789_123456789_123456789_123456789_123456789_123456789_123456789_";
    const settings: TEpSdkEpEventVersionTask_Settings = {
      stateId: EpSdkStatesService.releasedId,
      description: "description",
      displayName: VeryLongDisplayName,
      schemaVersionId: SchemaVersionId,
    };
    const config: IEpSdkEpEventVersionTask_Config = {
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: ApplicationDomainId,
      eventId: EventId,
      eventVersionSettings: settings,
      topicString: "test/hello/world",
      epSdkTask_TransactionConfig: {
        parentTransactionId: "parentTransactionId",
        groupTransactionId: "groupTransactionId",
      },
      checkmode: false,
    };
    try {
      // create a reference version
      const epSdkEpEventVersionTask_Ref = new EpSdkEpEventVersionTask(config);
      const expectedDisplayName =
        epSdkEpEventVersionTask_Ref.transform_EpSdkTask_Config(config)
          .eventVersionSettings.displayName;
      const epSdkEpEventVersionTask_ExecuteReturn_Ref: IEpSdkEpEventVersionTask_ExecuteReturn =
        await epSdkEpEventVersionTask_Ref.execute();
      const createdDisplayName =
        epSdkEpEventVersionTask_ExecuteReturn_Ref.epObject.displayName;
      let message = TestLogger.createLogMessage(
        "epSdkEpEventVersionTask_ExecuteReturn_Ref",
        epSdkEpEventVersionTask_ExecuteReturn_Ref
      );
      expect(createdDisplayName, message).to.equal(expectedDisplayName);
      // check if update required
      config.checkmode = true;
      const epSdkEpEventVersionTask_Check = new EpSdkEpEventVersionTask(config);
      const epSdkEpEventVersionTask_ExecuteReturn_Check: IEpSdkEpEventVersionTask_ExecuteReturn =
        await epSdkEpEventVersionTask_Check.execute();
      message = TestLogger.createLogMessage(
        "epSdkEpEventVersionTask_ExecuteReturn_Check",
        epSdkEpEventVersionTask_ExecuteReturn_Check
      );
      expect(
        epSdkEpEventVersionTask_ExecuteReturn_Check.epSdkTask_TransactionLogData
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

  it(`${scriptName}: should delete all event version`, async () => {
    try {
      const eventVersionList: Array<EventVersion> =
        await EpSdkEpEventVersionsService.getVersionsForEventId({
          eventId: EventId,
        });
      for (const eventVersion of eventVersionList) {
        const x: void = await EventsService.deleteEventVersionForEvent({
          eventId: EventId,
          id: eventVersion.id,
        });
      }
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

  xit(`${scriptName}: event version present: create with brokerType = kafka`, async () => {
    try {
      const epSdkEpEventVersionTask = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        versionString: "1.2.0",
        topicString: "test/hello/world",
        eventVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: "description",
          displayName: "displayName",
          schemaVersionId: SchemaVersionId,
          brokerType: "kafka",
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
      });

      const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn =
        await epSdkEpEventVersionTask.execute();

      const message = TestLogger.createLogMessage(
        "epSdkEpEventVersionTask_ExecuteReturn",
        epSdkEpEventVersionTask_ExecuteReturn
      );
      expect(
        epSdkEpEventVersionTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.CREATE_FIRST_VERSION);

      EventVersionId = epSdkEpEventVersionTask_ExecuteReturn.epObject.id;

      // DEBUG
      expect(false, message).to.be.true;
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
