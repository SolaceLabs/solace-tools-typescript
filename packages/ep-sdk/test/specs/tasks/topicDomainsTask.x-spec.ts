import "mocha";
import { expect } from "chai";
import path from "path";
import {
  AddressLevel,
  ApiError,
} from "@solace-labs/ep-openapi-node";
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
  EpSdkError,
  EpSdkBrokerTypes,
  EpSdkTopicDomainTask,
  EEpSdkTask_TargetState,
  IEpSdkTopicDomainTask_ExecuteReturn,
  EEpSdkTask_Action,
  EpSdkApplicationDomainTask,
  IEpSdkApplicationDomainTask_ExecuteReturn,
  EpSdkTaskUpdateNotSupportedError,
} from "../../../src";

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId: string = TestUtils.getUUID();

// test globals
let ApplicationDomainName_1: string;
let ApplicationDomainId_1: string | undefined;
let TopicDomainId_1: string | undefined;
const AddressLevels_1: Array<AddressLevel> = [
  { 
    name: 'one',
    addressLevelType: AddressLevel.addressLevelType.LITERAL
  },
  { 
    name: 'two',
    addressLevelType: AddressLevel.addressLevelType.LITERAL
  }
];
const AddressLevels_1_update: Array<AddressLevel> = [
  { 
    name: 'one',
    addressLevelType: AddressLevel.addressLevelType.LITERAL
  },
  { 
    name: 'two',
    addressLevelType: AddressLevel.addressLevelType.LITERAL
  },
  { 
    name: 'three',
    addressLevelType: AddressLevel.addressLevelType.LITERAL
  }
];
const AddressLevels_1_2: Array<AddressLevel> = [
  { 
    name: '1_2_one',
    addressLevelType: AddressLevel.addressLevelType.LITERAL
  },
  { 
    name: '1_2_two',
    addressLevelType: AddressLevel.addressLevelType.LITERAL
  },
];
let ApplicationDomainName_2: string;
let ApplicationDomainId_2: string | undefined;

const initializeGlobals = () => {
  ApplicationDomainName_1 = `${TestConfig.getAppId()}/services/${TestSpecName}/1`;
  ApplicationDomainName_2 = `${TestConfig.getAppId()}/services/${TestSpecName}/2`;
};

describe(`${scriptName}`, () => {
  before(async () => {
    TestContext.newItId();
    initializeGlobals();
    await TestHelpers.applicationDomainAbsent({ applicationDomainName: ApplicationDomainName_1 });
    await TestHelpers.applicationDomainAbsent({ applicationDomainName: ApplicationDomainName_2 });
  });

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async () => {
    TestContext.newItId();
    await TestHelpers.applicationDomainAbsent({applicationDomainName: ApplicationDomainName_1 });
    await TestHelpers.applicationDomainAbsent({ applicationDomainName: ApplicationDomainName_2 });
  });

  it(`${scriptName}: should create application domains`, async () => {
    try {
      const epSdkApplicationDomainTask_1 = new EpSdkApplicationDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainName: ApplicationDomainName_1,
        applicationDomainSettings: {
          uniqueTopicAddressEnforcementEnabled: true,
          topicDomainEnforcementEnabled: true
        }
      });
      const epSdkApplicationDomainTask_ExecuteReturn_1: IEpSdkApplicationDomainTask_ExecuteReturn = await epSdkApplicationDomainTask_1.execute('contextId');
      ApplicationDomainId_1 = epSdkApplicationDomainTask_ExecuteReturn_1.epObject.id;

      const epSdkApplicationDomainTask_2 = new EpSdkApplicationDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainName: ApplicationDomainName_2,
        applicationDomainSettings: {
          uniqueTopicAddressEnforcementEnabled: false,
          topicDomainEnforcementEnabled: false
        }
      });
      const epSdkApplicationDomainTask_ExecuteReturn_2: IEpSdkApplicationDomainTask_ExecuteReturn = await epSdkApplicationDomainTask_2.execute('contextId');
      ApplicationDomainId_2 = epSdkApplicationDomainTask_ExecuteReturn_2.epObject.id;
      // // DEBUG
      // expect(false, `ApplicationDomainId=${ApplicationDomainId}`).to.be.true;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed", e)).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: topic domain present: checkmode true`, async () => {
    try {
      const epSdkTopicDomainTask: EpSdkTopicDomainTask = new EpSdkTopicDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId_1,
        topicDomainSettings: {
          brokerType: EpSdkBrokerTypes.Solace,
          addressLevels: AddressLevels_1
        },
        checkmode: true
      });
      const epSdkTopicDomainTask_ExecuteReturn: IEpSdkTopicDomainTask_ExecuteReturn = await epSdkTopicDomainTask.execute('contextId');
      const message = TestLogger.createLogMessage("epSdkTopicDomainTask_ExecuteReturn", epSdkTopicDomainTask_ExecuteReturn);
      expect(epSdkTopicDomainTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_CREATE);
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed", e)).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: topic domain present`, async () => {
    try {
      const epSdkTopicDomainTask: EpSdkTopicDomainTask = new EpSdkTopicDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId_1,
        topicDomainSettings: {
          brokerType: EpSdkBrokerTypes.Solace,
          addressLevels: AddressLevels_1
        }
      });
      const epSdkTopicDomainTask_ExecuteReturn: IEpSdkTopicDomainTask_ExecuteReturn = await epSdkTopicDomainTask.execute('contextId');
      TopicDomainId_1 = epSdkTopicDomainTask_ExecuteReturn.epObject.id;
      const message = TestLogger.createLogMessage("epSdkTopicDomainTask_ExecuteReturn", epSdkTopicDomainTask_ExecuteReturn);
      expect(epSdkTopicDomainTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.CREATE);
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed", e)).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: topic domain present: checkmode true`, async () => {
    try {
      const epSdkTopicDomainTask: EpSdkTopicDomainTask = new EpSdkTopicDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId_1,
        topicDomainSettings: {
          brokerType: EpSdkBrokerTypes.Solace,
          addressLevels: AddressLevels_1
        },
        checkmode: true
      });
      const epSdkTopicDomainTask_ExecuteReturn: IEpSdkTopicDomainTask_ExecuteReturn = await epSdkTopicDomainTask.execute('contextId');
      const message = TestLogger.createLogMessage("epSdkTopicDomainTask_ExecuteReturn", epSdkTopicDomainTask_ExecuteReturn);
      expect(epSdkTopicDomainTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.NO_ACTION);
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed", e)).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: topic domain 2 present`, async () => {
    try {
      const epSdkTopicDomainTask: EpSdkTopicDomainTask = new EpSdkTopicDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId_1,
        topicDomainSettings: {
          brokerType: EpSdkBrokerTypes.Solace,
          addressLevels: AddressLevels_1_2
        }
      });
      const epSdkTopicDomainTask_ExecuteReturn: IEpSdkTopicDomainTask_ExecuteReturn = await epSdkTopicDomainTask.execute('contextId');
      TopicDomainId_1 = epSdkTopicDomainTask_ExecuteReturn.epObject.id;
      const message = TestLogger.createLogMessage("epSdkTopicDomainTask_ExecuteReturn", epSdkTopicDomainTask_ExecuteReturn);
      expect(epSdkTopicDomainTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.CREATE);
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed", e)).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: topic domain present: update with checkmode true`, async () => {
    try {
      const epSdkTopicDomainTask: EpSdkTopicDomainTask = new EpSdkTopicDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId_1,
        topicDomainSettings: {
          brokerType: EpSdkBrokerTypes.Solace,
          addressLevels: AddressLevels_1_update
        },
        checkmode: true
      });
      const epSdkTopicDomainTask_ExecuteReturn: IEpSdkTopicDomainTask_ExecuteReturn = await epSdkTopicDomainTask.execute('contextId');
      const message = TestLogger.createLogMessage("epSdkTopicDomainTask_ExecuteReturn", epSdkTopicDomainTask_ExecuteReturn);
      expect(epSdkTopicDomainTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_FAIL_TO_UPDATE);
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed", e)).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: topic domain present: update with checkmode false`, async () => {
    try {
      const epSdkTopicDomainTask: EpSdkTopicDomainTask = new EpSdkTopicDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId_1,
        topicDomainSettings: {
          brokerType: EpSdkBrokerTypes.Solace,
          addressLevels: AddressLevels_1_update
        },
        checkmode: false
      });
      try {
        const epSdkTopicDomainTask_ExecuteReturn: IEpSdkTopicDomainTask_ExecuteReturn = await epSdkTopicDomainTask.execute('contextId');
      } catch(e) {
        expect(e instanceof EpSdkTaskUpdateNotSupportedError, TestLogger.createTestFailMessageForError('wrong error', e)).to.be.true;
      }
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed", e)).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: topic domain absent: checkmode true`, async () => {
    try {
      const epSdkTopicDomainTask: EpSdkTopicDomainTask = new EpSdkTopicDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        applicationDomainId: ApplicationDomainId_1,
        topicDomainSettings: {},
        checkmode: true
      });
      const epSdkTopicDomainTask_ExecuteReturn: IEpSdkTopicDomainTask_ExecuteReturn = await epSdkTopicDomainTask.execute('contextId');
      const message = TestLogger.createLogMessage("epSdkTopicDomainTask_ExecuteReturn", epSdkTopicDomainTask_ExecuteReturn);
      expect(epSdkTopicDomainTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_DELETE);
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed", e)).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: topic domain absent: checkmode false`, async () => {
    try {
      const epSdkTopicDomainTask: EpSdkTopicDomainTask = new EpSdkTopicDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        applicationDomainId: ApplicationDomainId_1,
        topicDomainSettings: {},
      });
      const epSdkTopicDomainTask_ExecuteReturn: IEpSdkTopicDomainTask_ExecuteReturn = await epSdkTopicDomainTask.execute('contextId');
      const message = TestLogger.createLogMessage("epSdkTopicDomainTask_ExecuteReturn", epSdkTopicDomainTask_ExecuteReturn);
      expect(epSdkTopicDomainTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.DELETE);
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed", e)).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });


});
