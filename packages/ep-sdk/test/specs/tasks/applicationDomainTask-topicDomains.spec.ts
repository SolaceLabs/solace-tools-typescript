import "mocha";
import { expect } from "chai";
import path from "path";
import { TestContext, TestUtils } from "@internal/tools/src";
import { TestLogger, TestConfig } from "../../lib";
import { 
  ApiError, 
  ApplicationDomain, 
  EnumsService, 
  TopicAddressEnumResponse 
} from "@solace-labs/ep-openapi-node";
import {
  EpSdkError,
  EpSdkApplicationDomainsService,
  EpSdkApplicationDomainTask,
  IEpSdkApplicationDomainTask_ExecuteReturn,
  EEpSdkTask_Action,
  EEpSdkTask_TargetState,
  EpSdkBrokerTypes,
  EpSdkEnumVersionTask,
  EEpSdk_VersionTaskStrategy,
  EpSdkStatesService,
  IEpSdkEnumVersionTask_ExecuteReturn,
  EpSdkEpApiError,
} from "../../../src";

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId = TestUtils.getUUID();

let ApplicationDomainName: string;
let ApplicationDomainId: string | undefined;
let ApplicationDomainName_Enum: string;
let ApplicationDomainId_Enum: string | undefined;
const EnumName = "EnumName"
let EnumId: string | undefined;
let EnumVersionId: string | undefined;

const TopicDomainString_Simple = "one/two";
const TopicDomainString_Enum_1 = "base/{EnumName}";
const TopicDomainString_NoEnum = "base/{NonExistentEnumName}";

const initializeGlobals = () => {
  ApplicationDomainName = `${TestConfig.getAppId()}/tasks/${TestSpecName}`;
  ApplicationDomainName_Enum = `${TestConfig.getAppId()}/tasks/${TestSpecName}/enums`;
};

describe(`${scriptName}`, () => {

  before(() => {
    TestContext.newItId();
    initializeGlobals();
  });

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async () => {
    TestContext.newItId();
    const epSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
      applicationDomainName: ApplicationDomainName,
    });
    await epSdkApplicationDomainTask.execute('contextId');
    const epSdkApplicationDomainTask_Enum = new EpSdkApplicationDomainTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
      applicationDomainName: ApplicationDomainName_Enum,
    });
    await epSdkApplicationDomainTask_Enum.execute('contextId');
  });

  it(`${scriptName}: ensure application domains are absent`, async () => {
    TestContext.newItId();
    const epSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
      applicationDomainName: ApplicationDomainName,
    });
    await epSdkApplicationDomainTask.execute('contextId');
    const epSdkApplicationDomainTask_Enum = new EpSdkApplicationDomainTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
      applicationDomainName: ApplicationDomainName_Enum,
    });
    await epSdkApplicationDomainTask_Enum.execute('contextId');
  });

  it(`${scriptName}: enum application domain: present`, async () => {
    try {
      const epSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainName: ApplicationDomainName_Enum,
      });
      const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await epSdkApplicationDomainTask.execute('contextId');
      ApplicationDomainId_Enum = epSdkApplicationDomainTask_ExecuteReturn.epObject.id;
      const message = TestLogger.createLogMessage("epSdkApplicationDomainTask_ExecuteReturn", epSdkApplicationDomainTask_ExecuteReturn);
      expect(epSdkApplicationDomainTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.CREATE);
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: enum version present`, async () => {
    try {
      const enumResponse: TopicAddressEnumResponse = await EnumsService.createEnum({
        requestBody: {
          applicationDomainId: ApplicationDomainId_Enum,
          name: EnumName,
          shared: true
        },
      });
      EnumId = enumResponse.data.id;
  
      const epSdkEnumVersionTask = new EpSdkEnumVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId_Enum,
        enumId: EnumId,
        versionString: "1.0.0",
        versionStrategy: EEpSdk_VersionTaskStrategy.BUMP_PATCH,
        enumVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
        },
        enumValues: ["one", "two"],
      });
      const epSdkEnumVersionTask_ExecuteReturn: IEpSdkEnumVersionTask_ExecuteReturn = await epSdkEnumVersionTask.execute();
      const message = TestLogger.createLogMessage("epSdkEnumVersionTask_ExecuteReturn", epSdkEnumVersionTask_ExecuteReturn);
      expect(epSdkEnumVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.CREATE_FIRST_VERSION);
      EnumVersionId = epSdkEnumVersionTask_ExecuteReturn.epObject.id;
      // // DEBUG
      // expect(false, message).to.be.true;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: application domain: present`, async () => {
    try {
      const epSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainName: ApplicationDomainName,
        applicationDomainSettings: {
          description: 'description',
          uniqueTopicAddressEnforcementEnabled: true,
          topicDomainEnforcementEnabled: true,
          topicDomains: [
            {
              brokerType: EpSdkBrokerTypes.Solace,
              topicString: TopicDomainString_Simple,
            },
            {
              brokerType: EpSdkBrokerTypes.Solace,
              topicString: TopicDomainString_Enum_1,
              enumApplicationDomainIds: [ApplicationDomainId_Enum]
            }
          ]
        }
      });
      const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await epSdkApplicationDomainTask.execute('contextId');
      ApplicationDomainId = epSdkApplicationDomainTask_ExecuteReturn.epObject.id;
      const message = TestLogger.createLogMessage("epSdkApplicationDomainTask_ExecuteReturn", epSdkApplicationDomainTask_ExecuteReturn);
      expect(epSdkApplicationDomainTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.CREATE);
      // // DEBUG
      // expect(false, message).to.be.true;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: application domain: present: idempotency`, async () => {
    try {
      const epSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainName: ApplicationDomainName,
        applicationDomainSettings: {
          description: 'description',
          uniqueTopicAddressEnforcementEnabled: true,
          topicDomainEnforcementEnabled: true,
          topicDomains: [
            {
              brokerType: EpSdkBrokerTypes.Solace,
              topicString: TopicDomainString_Simple,
            },
            {
              brokerType: EpSdkBrokerTypes.Solace,
              topicString: TopicDomainString_Enum_1,
              enumApplicationDomainIds: [ApplicationDomainId_Enum]
            }
          ]
        }
      });
      const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await epSdkApplicationDomainTask.execute('contextId');
      ApplicationDomainId = epSdkApplicationDomainTask_ExecuteReturn.epObject.id;
      const message = TestLogger.createLogMessage("epSdkApplicationDomainTask_ExecuteReturn", epSdkApplicationDomainTask_ExecuteReturn);
      expect(epSdkApplicationDomainTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.NO_ACTION);
      // DEBUG
      // expect(false, message).to.be.true;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: application domain: present: update: checkmode=true`, async () => {
    try {
      const epSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainName: ApplicationDomainName,
        applicationDomainSettings: {
          description: 'description',
          uniqueTopicAddressEnforcementEnabled: true,
          topicDomainEnforcementEnabled: true,
          topicDomains: [
            {
              brokerType: EpSdkBrokerTypes.Solace,
              topicString: TopicDomainString_Simple,
            },
          ]
        },
        checkmode: true
      });
      const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await epSdkApplicationDomainTask.execute('contextId');
      ApplicationDomainId = epSdkApplicationDomainTask_ExecuteReturn.epObject.id;
      const message = TestLogger.createLogMessage("epSdkApplicationDomainTask_ExecuteReturn", epSdkApplicationDomainTask_ExecuteReturn);
      expect(epSdkApplicationDomainTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_UPDATE);
      // DEBUG
      // expect(false, message).to.be.true;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: application domain: present: update`, async () => {
    try {
      const epSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainName: ApplicationDomainName,
        applicationDomainSettings: {
          description: 'description',
          uniqueTopicAddressEnforcementEnabled: true,
          topicDomainEnforcementEnabled: true,
          topicDomains: [
            {
              brokerType: EpSdkBrokerTypes.Solace,
              topicString: TopicDomainString_Simple,
            },
          ]
        },
      });
      const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await epSdkApplicationDomainTask.execute('contextId');
      ApplicationDomainId = epSdkApplicationDomainTask_ExecuteReturn.epObject.id;
      const message = TestLogger.createLogMessage("epSdkApplicationDomainTask_ExecuteReturn", epSdkApplicationDomainTask_ExecuteReturn);
      expect(epSdkApplicationDomainTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.UPDATE);
      // DEBUG
      // expect(false, message).to.be.true;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: application domain: absent`, async () => {
    try {
      const epSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        applicationDomainName: ApplicationDomainName,
      });
      await epSdkApplicationDomainTask.execute('contextId');
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: application domain: present: should fail with no enum found`, async () => {
    try {
      const epSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainName: ApplicationDomainName,
        applicationDomainSettings: {
          uniqueTopicAddressEnforcementEnabled: true,
          topicDomainEnforcementEnabled: true,
          topicDomains: [
            {
              brokerType: EpSdkBrokerTypes.Solace,
              topicString: TopicDomainString_Simple,
            },
            {
              brokerType: EpSdkBrokerTypes.Solace,
              topicString: TopicDomainString_NoEnum,
            }
          ]
        }
      });
      const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await epSdkApplicationDomainTask.execute('contextId');
      expect(false, 'should never get here').to.be.true;
    } catch (e) {
      if(e instanceof EpSdkEpApiError) {
        const epSdkEpApiError = e as EpSdkEpApiError;
        expect(JSON.stringify(epSdkEpApiError), TestLogger.createEpSdkTestFailMessage('wrong message', epSdkEpApiError)).to.include("Topic domains must not contain unbounded variable address levels");
        const applicationDomain: ApplicationDomain | undefined = await EpSdkApplicationDomainsService.getByName({ applicationDomainName: ApplicationDomainName });
        const message = TestLogger.createLogMessage("applicationDomain", applicationDomain);
        expect(applicationDomain, message).to.be.undefined;
      } else {
        if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;  
      }
    }
  });

});
