import "mocha";
import { expect } from "chai";
import path from "path";
import { TestContext, TestUtils } from "@internal/tools/src";
import { TestLogger, TestConfig, TestService } from "../../lib";
import {
  ApiError,
  ApplicationDomainResponse,
  ApplicationDomainsService,
  EnumsService,
  TopicAddressEnumResponse,
} from "@solace-labs/ep-openapi-node";
import {
  EpSdkError,
  EpSdkFeatureNotSupportedError,
  EpSdkInvalidSemVerStringError,
  EpSdkVersionTaskStrategyValidationError,
  TEpSdkVersionTaskStrategyValidationError_Details,
  EpSdkApplicationDomainsService,
  EpSdkEnumVersionTask,
  IEpSdkEnumVersionTask_ExecuteReturn,
  TEpSdkEnumVersionTask_Settings,
  EpSdkStatesService,
  EEpSdk_VersionTaskStrategy,
  IEpSdkTask_TransactionLogData,
  EpSdkSemVerUtils,
  EEpSdk_VersionStrategy,
  EpSdkEnumVersionsService,
  EEpSdkTask_Action,
  EEpSdkTask_TargetState,
  TEpSdkEnumValue,
} from "../../../src";

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId = TestUtils.getUUID();

let ApplicationDomainName: string;
let ApplicationDomainId: string | undefined;

let EnumName: string;
let EnumId: string | undefined;

let EnumVersionName: string;
let EnumVersionId: string | undefined;

const EnumValues: Array<TEpSdkEnumValue> = [
  { value: 'one', label: 'one_label'},
  { value: 'two', label: 'two_label'},
]

const initializeGlobals = () => {
  ApplicationDomainName = `${TestConfig.getAppId()}/tasks/${TestSpecName}`;
  EnumName = `${TestConfig.getAppId()}-tasks-${TestSpecName}`;
  EnumVersionName = `${TestSpecName}`;
  // EpSdkLogger.getLoggerInstance().setLogLevel(EEpSdkLogLevel.Trace);
};

describe(`${scriptName}`, () => {
  before(async () => {
    TestContext.newItId();
    initializeGlobals();
    await TestService.absentApplicationDomain({ applicationDomainName: ApplicationDomainName });
    const applicationDomainResponse: ApplicationDomainResponse = await ApplicationDomainsService.createApplicationDomain({
      requestBody: {
        name: ApplicationDomainName,
      },
    });
    ApplicationDomainId = applicationDomainResponse.data.id;
    const enumResponse: TopicAddressEnumResponse = await EnumsService.createEnum({
      requestBody: {
        applicationDomainId: ApplicationDomainId,
        name: EnumName,
      },
    });
    EnumId = enumResponse.data.id;
  });

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async () => {
    TestContext.newItId();
    try {
      await TestService.absentApplicationDomain({ applicationDomainName: ApplicationDomainName });
    } catch (e) {}
  });

  it(`${scriptName}: enum version: present`, async () => {
    try {
      const epSdkEnumVersionTask = new EpSdkEnumVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        enumId: EnumId,
        versionString: "1.2.0",
        versionStrategy: EEpSdk_VersionTaskStrategy.BUMP_PATCH,
        enumVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: EnumVersionName,
        },
        // enumValues: ["one", "two"],
        enumValues: EnumValues,
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
      });
      const epSdkEnumVersionTask_ExecuteReturn: IEpSdkEnumVersionTask_ExecuteReturn = await epSdkEnumVersionTask.execute();
      const message = TestLogger.createLogMessage("epSdkEnumVersionTask_ExecuteReturn", epSdkEnumVersionTask_ExecuteReturn);
      expect(epSdkEnumVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.CREATE_FIRST_VERSION);

      // DEBUG
      // expect(false, message).to.be.true;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

});
