import "mocha";
import { expect } from "chai";
import path from "path";
import { TestContext, TestUtils } from "@internal/tools/src";
import { TestLogger, TestConfig } from "../../lib";
import {
  ApiError,
  ApplicationDomainResponse,
  ApplicationDomainsService,
  SchemaResponse,
  SchemasService,
} from "@solace-labs/ep-openapi-node";
import {
  EpSdkError,
  EpSdkFeatureNotSupportedError,
  EpSdkVersionTaskStrategyValidationError,
  TEpSdkVersionTaskStrategyValidationError_Details,
  EpSdkApplicationDomainsService,
  EpSdkStatesService,
  EEpSdk_VersionTaskStrategy,
  IEpSdkTask_TransactionLogData,
  EpSdkSemVerUtils,
  EEpSdk_VersionStrategy,
  EEpSdkSchemaContentType,
  EEpSdkSchemaType,
  EpSdkSchemaVersionsService,
  EpSdkSchemaVersionTask,
  IEpSdkSchemaVersionTask_Config,
  IEpSdkSchemaVersionTask_ExecuteReturn,
  TEpSdkSchemaVersionTask_Settings,
  EEpSdkTask_Action,
  EEpSdkTask_TargetState,
  EpSdkInvalidSemVerStringError,
} from "../../../src";

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId = TestUtils.getUUID();

let ApplicationDomainName: string;
let ApplicationDomainId: string | undefined;

let SchemaName: string;
let SchemaId: string | undefined;

let SchemaVersionName: string;
let SchemaVersionId: string | undefined;

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

const initializeGlobals = () => {
  ApplicationDomainName = `${TestConfig.getAppId()}/tasks/${TestSpecName}`;
  SchemaName = `${TestConfig.getAppId()}-tasks-${TestSpecId}`;
  SchemaVersionName = `${TestSpecId}`;
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
        contentType: EEpSdkSchemaContentType.APPLICATION_JSON,
        schemaType: EEpSdkSchemaType.JSON_SCHEMA,
      },
    });
    SchemaId = schemaResponse.data.id;
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

  it(`${scriptName}: schema version present: checkmode create`, async () => {
    try {
      const epSdkSchemaVersionTask = new EpSdkSchemaVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        schemaId: SchemaId,
        versionString: "1.2.0",
        schemaVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: SchemaVersionName,
          description: "description",
          content: SchemaContent,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: true,
      });

      const epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn =
        await epSdkSchemaVersionTask.execute();

      const message = TestLogger.createLogMessage(
        "epSdkSchemaVersionTask_ExecuteReturn",
        epSdkSchemaVersionTask_ExecuteReturn
      );
      expect(
        epSdkSchemaVersionTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.WOULD_CREATE_FIRST_VERSION);

      // // DEBUG
      // expect(false, message).to.be.true;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: schema version present: create`, async () => {
    try {
      const epSdkSchemaVersionTask = new EpSdkSchemaVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        schemaId: SchemaId,
        versionString: "1.2.0",
        schemaVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: SchemaVersionName,
          description: "description",
          content: SchemaContent,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
      });

      const epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn =
        await epSdkSchemaVersionTask.execute();

      const message = TestLogger.createLogMessage(
        "epSdkSchemaVersionTask_ExecuteReturn",
        epSdkSchemaVersionTask_ExecuteReturn
      );
      expect(
        epSdkSchemaVersionTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.CREATE_FIRST_VERSION);

      SchemaVersionId = epSdkSchemaVersionTask_ExecuteReturn.epObject.id;

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

  it(`${scriptName}: schema version present: create idempotency`, async () => {
    try {
      const epSdkSchemaVersionTask = new EpSdkSchemaVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        schemaId: SchemaId,
        versionString: "1.2.0",
        schemaVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: SchemaVersionName,
          description: "description",
          content: SchemaContent,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
      });

      const epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn =
        await epSdkSchemaVersionTask.execute();

      const message = TestLogger.createLogMessage(
        "epSdkSchemaVersionTask_ExecuteReturn",
        epSdkSchemaVersionTask_ExecuteReturn
      );
      expect(
        epSdkSchemaVersionTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.NO_ACTION);
      expect(epSdkSchemaVersionTask_ExecuteReturn.epObject.id, message).to.eq(
        SchemaVersionId
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

  it(`${scriptName}: schema version present: checkmode update`, async () => {
    try {
      const epSdkSchemaVersionTask = new EpSdkSchemaVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        schemaId: SchemaId,
        versionString: "1.2.0",
        schemaVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: "updated display name",
          description: "updated description",
          content: SchemaContent,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: true,
      });
      const epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn = await epSdkSchemaVersionTask.execute();
      const message = TestLogger.createLogMessage("epSdkSchemaVersionTask_ExecuteReturn", epSdkSchemaVersionTask_ExecuteReturn);
      expect(epSdkSchemaVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_CREATE_NEW_VERSION);
      expect(epSdkSchemaVersionTask_ExecuteReturn.epObject.id, message).to.eq(SchemaVersionId);
      // // DEBUG
      // expect(false, message).to.be.true;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: schema version present: update`, async () => {
    try {
      const epSdkSchemaVersionTask = new EpSdkSchemaVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        schemaId: SchemaId,
        versionString: "1.2.0",
        schemaVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: "updated SchemaVersionName",
          description: "updated description",
          content: SchemaContent,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
      });
      const epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn = await epSdkSchemaVersionTask.execute();
      const message = TestLogger.createLogMessage("epSdkSchemaVersionTask_ExecuteReturn", epSdkSchemaVersionTask_ExecuteReturn);
      expect(epSdkSchemaVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.CREATE_NEW_VERSION);
      expect(epSdkSchemaVersionTask_ExecuteReturn.epObject.schemaId, message).to.eq(SchemaId);
      expect(epSdkSchemaVersionTask_ExecuteReturn.epObject.version, message).to.eq("1.2.1");
      SchemaVersionId = epSdkSchemaVersionTask_ExecuteReturn.epObject.id;
      // // DEBUG
      // expect(false, message).to.be.true;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: schema version present: update , catch not semver error`, async () => {
    try {
      const epSdkSchemaVersionTask = new EpSdkSchemaVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        schemaId: SchemaId,
        versionString: "not-semver",
        schemaVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: "updated SchemaVersionName again",
          description: "updated description again",
          content: SchemaContent,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
      });
      const epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn = await epSdkSchemaVersionTask.execute();
    } catch (e) {
      if (e instanceof ApiError)expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(e instanceof EpSdkInvalidSemVerStringError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
    }
  });

  it(`${scriptName}: schema version absent`, async () => {
    try {
      const epSdkSchemaVersionTask = new EpSdkSchemaVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        applicationDomainId: ApplicationDomainId,
        schemaId: SchemaId,
        versionString: "1.2.0",
        schemaVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: SchemaVersionName,
          description: "updated description",
          content: SchemaContent,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
      });
      const epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn = await epSdkSchemaVersionTask.execute();
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(e instanceof EpSdkFeatureNotSupportedError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
    }
  });

  it(`${scriptName}: schema version present: create exact version match`, async () => {
    const ExactVersionString = "2.0.0";
    try {
      const epSdkSchemaVersionTask = new EpSdkSchemaVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        schemaId: SchemaId,
        versionString: ExactVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        schemaVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: SchemaVersionName,
          description: "description",
          content: SchemaContent,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: false,
      });
      const epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn = await epSdkSchemaVersionTask.execute();
      const message = TestLogger.createLogMessage("epSdkSchemaVersionTask_ExecuteReturn", epSdkSchemaVersionTask_ExecuteReturn);
      expect(epSdkSchemaVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.CREATE_NEW_VERSION);
      expect(epSdkSchemaVersionTask_ExecuteReturn.epObject.version, message).to.eq(ExactVersionString);
      // // DEBUG
      // expect(false, message).to.be.true;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: schema version present: create exact version match: idempotency`, async () => {
    const ExactVersionString = "2.0.0";
    try {
      const epSdkSchemaVersionTask = new EpSdkSchemaVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        schemaId: SchemaId,
        versionString: ExactVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        schemaVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: SchemaVersionName,
          description: "description",
          content: SchemaContent,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: false,
      });
      const epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn =
        await epSdkSchemaVersionTask.execute();
      const message = TestLogger.createLogMessage(
        "epSdkSchemaVersionTask_ExecuteReturn",
        epSdkSchemaVersionTask_ExecuteReturn
      );
      expect(
        epSdkSchemaVersionTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.NO_ACTION);
      expect(
        epSdkSchemaVersionTask_ExecuteReturn.epObject.version,
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

  it(`${scriptName}: schema version present: create exact version match: should catch error`, async () => {
    const ExactVersionString = "2.0.0";
    try {
      const epSdkSchemaVersionTask = new EpSdkSchemaVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        schemaId: SchemaId,
        versionString: ExactVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        schemaVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: 'updated SchemaVersionName',
          description: "updated description",
          content: SchemaContent,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: false,
      });
      const epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn = await epSdkSchemaVersionTask.execute();
      expect(false, TestLogger.createApiTestFailMessage("must never get here")).to.be.true;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkVersionTaskStrategyValidationError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      const epSdkVersionTaskStrategyValidationError: EpSdkVersionTaskStrategyValidationError = e;
      const details: TEpSdkVersionTaskStrategyValidationError_Details = epSdkVersionTaskStrategyValidationError.details;
      expect(details.versionString, TestLogger.createEpSdkTestFailMessage("failed", e)).to.eq(ExactVersionString);
      expect(details.existingVersionString, TestLogger.createEpSdkTestFailMessage("failed", e)).to.eq(ExactVersionString);
      const transactionLogData: IEpSdkTask_TransactionLogData = epSdkVersionTaskStrategyValidationError.details.transactionLogData;
      expect(transactionLogData.epSdkTask_Action, TestLogger.createEpSdkTestFailMessage("failed", e)).to.eq(EEpSdkTask_Action.NO_ACTION);
      expect(transactionLogData.epSdkTask_IsUpdateRequiredFuncReturn.isUpdateRequired, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: schema version present: create exact version match with checkmode: should return would fail`, async () => {
    const ExactVersionString = "2.0.0";
    try {
      const epSdkSchemaVersionTask = new EpSdkSchemaVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        schemaId: SchemaId,
        versionString: ExactVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        schemaVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: 'updated SchemaVersionName',
          description: "updated description",
          content: SchemaContent,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: true,
      });
      const epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn = await epSdkSchemaVersionTask.execute();
      expect(epSdkSchemaVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, TestLogger.createLogMessage("wrong action", epSdkSchemaVersionTask_ExecuteReturn.epSdkTask_TransactionLogData)).to.eq(EEpSdkTask_Action.WOULD_FAIL_CREATE_NEW_VERSION_ON_EXACT_VERSION_REQUIREMENT);
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: schema version present: create version without updates to settings`, async () => {
    const settings: TEpSdkSchemaVersionTask_Settings = {
      stateId: EpSdkStatesService.releasedId,
      description: "description",
      displayName: "displayName",
      content: SchemaContent,
    };
    try {
      // create a reference version
      const epSdkSchemaVersionTask_Ref = new EpSdkSchemaVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        schemaId: SchemaId,
        // versionString: newVersion,
        // versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        schemaVersionSettings: settings,
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: false,
      });
      const epSdkSchemaVersionTask_ExecuteReturn_Ref: IEpSdkSchemaVersionTask_ExecuteReturn =
        await epSdkSchemaVersionTask_Ref.execute();
      const referenceVersionString: string =
        epSdkSchemaVersionTask_ExecuteReturn_Ref.epObject.version
          ? epSdkSchemaVersionTask_ExecuteReturn_Ref.epObject.version
          : "not-a-version";
      // bump the version
      const newVersion = EpSdkSemVerUtils.createNextVersionByStrategy({
        fromVersionString: referenceVersionString,
        strategy: EEpSdk_VersionStrategy.BUMP_MINOR,
      });
      // create new version even no other updates to settings
      const epSdkSchemaVersionTask_New = new EpSdkSchemaVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        schemaId: SchemaId,
        versionString: newVersion,
        // versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        schemaVersionSettings: settings,
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: false,
      });
      let epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn =
        await epSdkSchemaVersionTask_New.execute();
      let message = TestLogger.createLogMessage(
        "epSdkSchemaVersionTask_ExecuteReturn",
        epSdkSchemaVersionTask_ExecuteReturn
      );
      // get the latest version to check
      let latestVersionString =
        await EpSdkSchemaVersionsService.getLatestVersionString({
          schemaId: SchemaId,
        });
      // expect no change in version
      expect(latestVersionString, message).to.eq(referenceVersionString);
      expect(
        epSdkSchemaVersionTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.NO_ACTION);

      // now test exact match, checkmode=true for newVersion: should return Would create new version
      const epSdkSchemaVersionTask_NewCreatedCheck = new EpSdkSchemaVersionTask(
        {
          epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
          applicationDomainId: ApplicationDomainId,
          schemaId: SchemaId,
          versionString: newVersion,
          versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
          schemaVersionSettings: settings,
          epSdkTask_TransactionConfig: {
            parentTransactionId: "parentTransactionId",
            groupTransactionId: "groupTransactionId",
          },
          checkmode: true,
        }
      );
      epSdkSchemaVersionTask_ExecuteReturn =
        await epSdkSchemaVersionTask_NewCreatedCheck.execute();
      message = TestLogger.createLogMessage(
        "epSdkSchemaVersionTask_ExecuteReturn",
        epSdkSchemaVersionTask_ExecuteReturn
      );
      expect(
        epSdkSchemaVersionTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.WOULD_CREATE_NEW_VERSION);
      expect(
        epSdkSchemaVersionTask_ExecuteReturn.epObject.version,
        message
      ).to.eq(newVersion);

      // now test exact match, checkmode=false for newVersion: should create it
      const epSdkSchemaVersionTask_NewCreated = new EpSdkSchemaVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        schemaId: SchemaId,
        versionString: newVersion,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        schemaVersionSettings: settings,
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: false,
      });
      epSdkSchemaVersionTask_ExecuteReturn =
        await epSdkSchemaVersionTask_NewCreated.execute();
      message = TestLogger.createLogMessage(
        "epSdkSchemaVersionTask_ExecuteReturn",
        epSdkSchemaVersionTask_ExecuteReturn
      );
      expect(
        epSdkSchemaVersionTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.CREATE_NEW_VERSION);
      expect(
        epSdkSchemaVersionTask_ExecuteReturn.epObject.version,
        message
      ).to.eq(newVersion);
      latestVersionString =
        await EpSdkSchemaVersionsService.getLatestVersionString({
          schemaId: SchemaId,
        });
      expect(latestVersionString, message).to.eq(newVersion);

      // now test exact match, checkmode=true going back to reference version: should return Would fail
      const epSdkSchemaVersionTask_RefCheck = new EpSdkSchemaVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        schemaId: SchemaId,
        versionString: referenceVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        schemaVersionSettings: settings,
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: true,
      });
      epSdkSchemaVersionTask_ExecuteReturn =
        await epSdkSchemaVersionTask_RefCheck.execute();
      message = TestLogger.createLogMessage(
        "epSdkSchemaVersionTask_ExecuteReturn",
        epSdkSchemaVersionTask_ExecuteReturn
      );
      expect(
        epSdkSchemaVersionTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(
        EEpSdkTask_Action.WOULD_FAIL_CREATE_NEW_VERSION_ON_EXACT_VERSION_REQUIREMENT
      );
      expect(
        epSdkSchemaVersionTask_ExecuteReturn.epObject.version,
        message
      ).to.eq(referenceVersionString);
      latestVersionString =
        await EpSdkSchemaVersionsService.getLatestVersionString({
          schemaId: SchemaId,
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
    const settings: TEpSdkSchemaVersionTask_Settings = {
      stateId: EpSdkStatesService.releasedId,
      description: "description",
      displayName: VeryLongDisplayName,
      content: SchemaContent,
    };
    const config: IEpSdkSchemaVersionTask_Config = {
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: ApplicationDomainId,
      schemaId: SchemaId,
      schemaVersionSettings: settings,
      epSdkTask_TransactionConfig: {
        parentTransactionId: "parentTransactionId",
        groupTransactionId: "groupTransactionId",
      },
      checkmode: false,
    };
    try {
      // create a reference version
      const epSdkSchemaVersionTask_Ref = new EpSdkSchemaVersionTask(config);
      const expectedDisplayName =
        epSdkSchemaVersionTask_Ref.transform_EpSdkTask_Config(config)
          .schemaVersionSettings.displayName;

      const epSdkSchemaVersionTask_ExecuteReturn_Ref: IEpSdkSchemaVersionTask_ExecuteReturn =
        await epSdkSchemaVersionTask_Ref.execute();
      const createdDisplayName =
        epSdkSchemaVersionTask_ExecuteReturn_Ref.epObject.displayName;
      let message = TestLogger.createLogMessage(
        "epSdkSchemaVersionTask_ExecuteReturn_Ref",
        epSdkSchemaVersionTask_ExecuteReturn_Ref
      );
      expect(createdDisplayName, message).to.equal(expectedDisplayName);
      // check if update required
      config.checkmode = true;
      const epSdkSchemaVersionTask_Check = new EpSdkSchemaVersionTask(config);
      const epSdkSchemaVersionTask_ExecuteReturn_Check: IEpSdkSchemaVersionTask_ExecuteReturn =
        await epSdkSchemaVersionTask_Check.execute();
      message = TestLogger.createLogMessage(
        "epSdkSchemaVersionTask_ExecuteReturn_Check",
        epSdkSchemaVersionTask_ExecuteReturn_Check
      );
      expect(
        epSdkSchemaVersionTask_ExecuteReturn_Check.epSdkTask_TransactionLogData
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
});
