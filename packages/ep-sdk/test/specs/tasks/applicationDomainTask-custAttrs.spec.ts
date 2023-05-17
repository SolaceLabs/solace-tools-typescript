import "mocha";
import { expect } from "chai";
import path from "path";
import { 
  TestContext, 
  TestUtils 
} from "@internal/tools/src";
import { 
  TestLogger, 
  TestConfig 
} from "../../lib";
import { 
  ApiError, 
  CustomAttributeDefinition, 
} from "@solace-labs/ep-openapi-node";
import {
  EpSdkError,
  EpSdkApplicationDomainTask,
  IEpSdkApplicationDomainTask_ExecuteReturn,
  EEpSdkTask_Action,
  EEpSdkTask_TargetState,
  TEpSdkCustomAttributeList,
  EpSdkCustomAttributeDefinitionTask,
} from "../../../src";

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId = TestUtils.getShortUUID();

let ApplicationDomainName: string;
let ApplicationDomainId: string | undefined;
const CustomAttributeList: TEpSdkCustomAttributeList = [
  {
    name: 'org-attr-simple-1',
    value: 'org-attr-simple-1',
    valueType: CustomAttributeDefinition.valueType.STRING,
    scope: CustomAttributeDefinition.scope.ORGANIZATION,
  },
  {
    name: 'org-attr-simple-2',
    value: 'org-attr-simple-2',
    valueType: CustomAttributeDefinition.valueType.STRING,
    scope: CustomAttributeDefinition.scope.ORGANIZATION,
  },
  {
    name: 'org-attr-complex-1',
    value: 'org-attr-complex-1-&^%%$%^',
    valueType: CustomAttributeDefinition.valueType.LONG_TEXT,
    scope: CustomAttributeDefinition.scope.ORGANIZATION,
  },
  {
    name: 'org-attr-complex-2',
    value: 'org-attr-complex-2-**&^^%$',
    valueType: CustomAttributeDefinition.valueType.LONG_TEXT,
    scope: CustomAttributeDefinition.scope.ORGANIZATION,
  },
  {
    name: 'app-domain-attr-simple-1',
    value: 'app-domain-attr-simple-1-value',
    valueType: CustomAttributeDefinition.valueType.STRING,
    scope: CustomAttributeDefinition.scope.APPLICATION_DOMAIN,
  },
  {
    name: 'app-domain-attr-simple-2',
    value: 'app-domain-attr-simple-2',
    valueType: CustomAttributeDefinition.valueType.STRING,
    scope: CustomAttributeDefinition.scope.APPLICATION_DOMAIN,
  },
  {
    name: 'app-domain-attr-complex-1',
    value: 'app-domain-attr-complex-1-&&(*&*%&%$',
    valueType: CustomAttributeDefinition.valueType.LONG_TEXT,
    scope: CustomAttributeDefinition.scope.APPLICATION_DOMAIN,
  },
  {
    name: 'app-domain-attr-complex-2',
    value: 'app-domain-attr-complex-2-(&*&^^%&^',
    valueType: CustomAttributeDefinition.valueType.LONG_TEXT,
    scope: CustomAttributeDefinition.scope.APPLICATION_DOMAIN,
  }
];

const CustomAttributeListUpdate: TEpSdkCustomAttributeList = [
  {
    name: 'app-domain-update-simple-1',
    value: 'app-domain-update-simple-1-value',
    valueType: CustomAttributeDefinition.valueType.STRING,
    scope: CustomAttributeDefinition.scope.APPLICATION_DOMAIN,
  },
];

const initializeGlobals = () => {
  ApplicationDomainName = `${TestConfig.getAppId()}/tasks/${TestSpecName}`;
};

const cleanTest = async() => {
  try {
    const epSdkApplicationDomainTask_1 = new EpSdkApplicationDomainTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
      applicationDomainName: ApplicationDomainName,
    });
    await epSdkApplicationDomainTask_1.execute('contextId');

    for(const epSdkCustomAttribute of CustomAttributeList) {
      const epSdkCustomAttributeDefinitionTask = new EpSdkCustomAttributeDefinitionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        attributeName: epSdkCustomAttribute.name,
        customAttributeDefinitionObjectSettings: {}
      });
      await epSdkCustomAttributeDefinitionTask.execute();
    }
  } catch (e) {
    if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
    expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
    expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
  }
}

describe(`${scriptName}`, () => {

  before(async() => {
    TestContext.newItId();
    initializeGlobals();
    await cleanTest();
  });

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async () => {
    TestContext.newItId();
    await cleanTest();
  });

  it(`${scriptName}: application domain: present: checkmode=true`, async () => {
    try {
      const epSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainName: ApplicationDomainName,
        applicationDomainSettings: {
          customAttributes: CustomAttributeList
        },
        checkmode: true
      });
      const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await epSdkApplicationDomainTask.execute('contextId');
      ApplicationDomainId = epSdkApplicationDomainTask_ExecuteReturn.epObject.id;
      const message = TestLogger.createLogMessage("epSdkApplicationDomainTask_ExecuteReturn", epSdkApplicationDomainTask_ExecuteReturn);
      expect(epSdkApplicationDomainTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_CREATE);
      // DEBUG
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
          customAttributes: CustomAttributeList
        }
      });
      const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await epSdkApplicationDomainTask.execute('contextId');
      ApplicationDomainId = epSdkApplicationDomainTask_ExecuteReturn.epObject.id;
      const message = TestLogger.createLogMessage("epSdkApplicationDomainTask_ExecuteReturn", epSdkApplicationDomainTask_ExecuteReturn);
      expect(epSdkApplicationDomainTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.CREATE);
      const applicationDomain = epSdkApplicationDomainTask_ExecuteReturn.epObject;
      for(const epSdkCustomAttribute of CustomAttributeList) {
        expect(JSON.stringify(applicationDomain.customAttributes), message).to.include(epSdkCustomAttribute.name);
        expect(JSON.stringify(applicationDomain.customAttributes), message).to.include(epSdkCustomAttribute.value);
      }
      // DEBUG
      // expect(false, message).to.be.true;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: application domain: present: checkmode=true`, async () => {
    try {
      const epSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainName: ApplicationDomainName,
        applicationDomainSettings: {
          customAttributes: CustomAttributeList
        },
        checkmode: true
      });
      const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await epSdkApplicationDomainTask.execute('contextId');
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

  it(`${scriptName}: application domain: present: idempotency`, async () => {
    try {
      const epSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainName: ApplicationDomainName,
        applicationDomainSettings: {
          customAttributes: CustomAttributeList
        }
      });
      const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await epSdkApplicationDomainTask.execute('contextId');
      ApplicationDomainId = epSdkApplicationDomainTask_ExecuteReturn.epObject.id;
      const message = TestLogger.createLogMessage("epSdkApplicationDomainTask_ExecuteReturn", epSdkApplicationDomainTask_ExecuteReturn);
      expect(epSdkApplicationDomainTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.NO_ACTION);
      const applicationDomain = epSdkApplicationDomainTask_ExecuteReturn.epObject;
      for(const epSdkCustomAttribute of CustomAttributeList) {
        expect(JSON.stringify(applicationDomain.customAttributes), message).to.include(epSdkCustomAttribute.name);
        expect(JSON.stringify(applicationDomain.customAttributes), message).to.include(epSdkCustomAttribute.value);
      }
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
          customAttributes: CustomAttributeListUpdate
        },
        checkmode: true
      });
      const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await epSdkApplicationDomainTask.execute('contextId');
      const message = TestLogger.createLogMessage("epSdkApplicationDomainTask_ExecuteReturn", epSdkApplicationDomainTask_ExecuteReturn);
      expect(epSdkApplicationDomainTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_UPDATE);
      const applicationDomain = epSdkApplicationDomainTask_ExecuteReturn.epObject;
      // new are present
      for(const epSdkCustomAttribute of CustomAttributeListUpdate) {
        expect(JSON.stringify(applicationDomain.customAttributes), message).to.include(epSdkCustomAttribute.name);
        expect(JSON.stringify(applicationDomain.customAttributes), message).to.include(epSdkCustomAttribute.value);
      }
      // old are gone
      for(const epSdkCustomAttribute of CustomAttributeList) {
        expect(JSON.stringify(applicationDomain.customAttributes), message).to.not.include(epSdkCustomAttribute.name);
        expect(JSON.stringify(applicationDomain.customAttributes), message).to.not.include(epSdkCustomAttribute.value);
      }
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
          customAttributes: CustomAttributeListUpdate
        },
      });
      const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await epSdkApplicationDomainTask.execute('contextId');
      const message = TestLogger.createLogMessage("epSdkApplicationDomainTask_ExecuteReturn", epSdkApplicationDomainTask_ExecuteReturn);
      expect(epSdkApplicationDomainTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.UPDATE);
      const applicationDomain = epSdkApplicationDomainTask_ExecuteReturn.epObject;
      // new are present
      for(const epSdkCustomAttribute of CustomAttributeListUpdate) {
        expect(JSON.stringify(applicationDomain.customAttributes), message).to.include(epSdkCustomAttribute.name);
        expect(JSON.stringify(applicationDomain.customAttributes), message).to.include(epSdkCustomAttribute.value);
      }
      // old are gone
      for(const epSdkCustomAttribute of CustomAttributeList) {
        expect(JSON.stringify(applicationDomain.customAttributes), message).to.not.include(epSdkCustomAttribute.name);
        expect(JSON.stringify(applicationDomain.customAttributes), message).to.not.include(epSdkCustomAttribute.value);
      }
      // DEBUG
      // expect(false, message).to.be.true;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: application domain: present: update: checkmode = true`, async () => {
    try {
      const epSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainName: ApplicationDomainName,
        applicationDomainSettings: {
          customAttributes: CustomAttributeListUpdate
        },
        checkmode: true
      });
      const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await epSdkApplicationDomainTask.execute('contextId');
      const message = TestLogger.createLogMessage("epSdkApplicationDomainTask_ExecuteReturn", epSdkApplicationDomainTask_ExecuteReturn);
      expect(epSdkApplicationDomainTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.NO_ACTION);
      const applicationDomain = epSdkApplicationDomainTask_ExecuteReturn.epObject;
      // new are present
      for(const epSdkCustomAttribute of CustomAttributeListUpdate) {
        expect(JSON.stringify(applicationDomain.customAttributes), message).to.include(epSdkCustomAttribute.name);
        expect(JSON.stringify(applicationDomain.customAttributes), message).to.include(epSdkCustomAttribute.value);
      }
      // old are gone
      for(const epSdkCustomAttribute of CustomAttributeList) {
        expect(JSON.stringify(applicationDomain.customAttributes), message).to.not.include(epSdkCustomAttribute.name);
        expect(JSON.stringify(applicationDomain.customAttributes), message).to.not.include(epSdkCustomAttribute.value);
      }
      // DEBUG
      // expect(false, message).to.be.true;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: application domain: present: update: idempotency`, async () => {
    try {
      const epSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainName: ApplicationDomainName,
        applicationDomainSettings: {
          customAttributes: CustomAttributeListUpdate
        },
      });
      const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await epSdkApplicationDomainTask.execute('contextId');
      const message = TestLogger.createLogMessage("epSdkApplicationDomainTask_ExecuteReturn", epSdkApplicationDomainTask_ExecuteReturn);
      expect(epSdkApplicationDomainTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.NO_ACTION);
      const applicationDomain = epSdkApplicationDomainTask_ExecuteReturn.epObject;
      // new are present
      for(const epSdkCustomAttribute of CustomAttributeListUpdate) {
        expect(JSON.stringify(applicationDomain.customAttributes), message).to.include(epSdkCustomAttribute.name);
        expect(JSON.stringify(applicationDomain.customAttributes), message).to.include(epSdkCustomAttribute.value);
      }
      // old are gone
      for(const epSdkCustomAttribute of CustomAttributeList) {
        expect(JSON.stringify(applicationDomain.customAttributes), message).to.not.include(epSdkCustomAttribute.name);
        expect(JSON.stringify(applicationDomain.customAttributes), message).to.not.include(epSdkCustomAttribute.value);
      }
      // DEBUG
      // expect(false, message).to.be.true;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: application domain: absent: checkmode=true`, async () => {
    try {
      const epSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        applicationDomainName: ApplicationDomainName,
        checkmode: true
      });
      const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await epSdkApplicationDomainTask.execute('contextId');
      const message = TestLogger.createLogMessage("epSdkApplicationDomainTask_ExecuteReturn", epSdkApplicationDomainTask_ExecuteReturn);
      expect(epSdkApplicationDomainTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_DELETE);
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
      const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await epSdkApplicationDomainTask.execute('contextId');
      const message = TestLogger.createLogMessage("epSdkApplicationDomainTask_ExecuteReturn", epSdkApplicationDomainTask_ExecuteReturn);
      expect(epSdkApplicationDomainTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.DELETE);
      // DEBUG
      // expect(false, message).to.be.true;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: application domain: absent: checkmode=true`, async () => {
    try {
      const epSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        applicationDomainName: ApplicationDomainName,
        checkmode: true
      });
      const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await epSdkApplicationDomainTask.execute('contextId');
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

});
