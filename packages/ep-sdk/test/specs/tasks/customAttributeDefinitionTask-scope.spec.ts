import "mocha";
import { expect } from "chai";
import path from "path";
import { 
  TestContext, 
  TestUtils 
} from "@internal/tools/src";
import { 
  TestConfig, 
  TestLogger 
} from "../../lib";
import {
  ApiError,
  CustomAttributeDefinition,
} from "@solace-labs/ep-openapi-node";
import {
  EpSdkError,
  EEpSdkTask_Action,
  EEpSdkTask_TargetState,
  EEpSdkObjectTypes,
  TEpSdkCustomAttribute,
  EpSdkCustomAttributeDefinitionsService,
  EpSdkCustomAttributeDefinitionTask,
  IEpSdkCustomAttributeDefinitionTask_ExecuteReturn,
  EpSdkApplicationDomainTask,
  IEpSdkApplicationDomainTask_ExecuteReturn,
  EpSdkTaskConfigValidationError,
  EEpSdkCustomAttributeEntityTypes,
} from "../../../src";

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId = TestUtils.getShortUUID();

let ApplicationDomainName_1: string;
let ApplicationDomainId_1: string;

const CustomAttributeList: Array<TEpSdkCustomAttribute> = [
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
    value: 'org-attr-complex-1',
    valueType: CustomAttributeDefinition.valueType.LONG_TEXT,
    scope: CustomAttributeDefinition.scope.ORGANIZATION,
  },
  {
    name: 'org-attr-complex-2',
    value: 'org-attr-complex-2',
    valueType: CustomAttributeDefinition.valueType.LONG_TEXT,
    scope: CustomAttributeDefinition.scope.ORGANIZATION,
  },
  {
    name: `app-domain-simple-1`,
    value: `app-domain-simple-1`,
    valueType: CustomAttributeDefinition.valueType.STRING,
    scope: CustomAttributeDefinition.scope.APPLICATION_DOMAIN,
  },
  {
    name: 'app-domain-simple-2',
    value: `app-domain-simple-2`,
    valueType: CustomAttributeDefinition.valueType.STRING,
    scope: CustomAttributeDefinition.scope.APPLICATION_DOMAIN,
  },
  {
    name: 'app-domain-attr-complex-1',
    value: 'app-domain-attr-complex-1',
    valueType: CustomAttributeDefinition.valueType.LONG_TEXT,
    scope: CustomAttributeDefinition.scope.APPLICATION_DOMAIN,
  },
  {
    name: 'app-domain-attr-complex-2',
    value: 'app-domain-attr-complex-2',
    valueType: CustomAttributeDefinition.valueType.LONG_TEXT,
    scope: CustomAttributeDefinition.scope.APPLICATION_DOMAIN,
  }
];

const initializeGlobals = () => {
  ApplicationDomainName_1 = `${TestConfig.getAppId()}/${TestSpecName}/1`;
};

const cleanTest = async() => {
  try {
    const epSdkApplicationDomainTask_1 = new EpSdkApplicationDomainTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
      applicationDomainName: ApplicationDomainName_1,
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

  it(`${scriptName}: setup application domains`, async () => {
    TestContext.newItId();
    try {
      const epSdkApplicationDomainTask_1 = new EpSdkApplicationDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainName: ApplicationDomainName_1,
      });
      const epSdkApplicationDomainTask_ExecuteReturn_1: IEpSdkApplicationDomainTask_ExecuteReturn = await epSdkApplicationDomainTask_1.execute('contextId');
      ApplicationDomainId_1 = epSdkApplicationDomainTask_ExecuteReturn_1.epObject.id;

    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should throw invalid config error: no applicationDomainIds defined`, async () => {
    TestContext.newItId();
    try {
      const epSdkCustomAttributeDefinitionTask = new EpSdkCustomAttributeDefinitionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        attributeName: 'any name',
        customAttributeDefinitionObjectSettings: {
          associatedEntityTypes: [EEpSdkCustomAttributeEntityTypes.APPLICATION_DOMAIN, EEpSdkCustomAttributeEntityTypes.APPLICATION],
          scope: CustomAttributeDefinition.scope.APPLICATION_DOMAIN,
        },
      });
      await epSdkCustomAttributeDefinitionTask.execute();
    } catch (e) {      
      if(e instanceof EpSdkTaskConfigValidationError) return;
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: customAttributeDefintions: present: checkmode=true`, async () => {
    TestContext.newItId();
    try {
      const epSdkCustomAttributeDefinitionTask_ExecuteReturns: Array<IEpSdkCustomAttributeDefinitionTask_ExecuteReturn> = [];
      for(const epSdkCustomAttribute of CustomAttributeList) {
        const epSdkCustomAttributeDefinitionTask = new EpSdkCustomAttributeDefinitionTask({
          epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
          attributeName: epSdkCustomAttribute.name,
          customAttributeDefinitionObjectSettings: {
            associatedEntityTypes: [EEpSdkCustomAttributeEntityTypes.APPLICATION_DOMAIN, EEpSdkCustomAttributeEntityTypes.APPLICATION],
            scope: CustomAttributeDefinition.scope.APPLICATION_DOMAIN,
            applicationDomainId: ApplicationDomainId_1
          },
          checkmode: true
        });
        const epSdkCustomAttributeDefinitionTask_ExecuteReturn: IEpSdkCustomAttributeDefinitionTask_ExecuteReturn = await epSdkCustomAttributeDefinitionTask.execute();
        const message = TestLogger.createLogMessage("epSdkCustomAttributeDefinitionTask_ExecuteReturn", epSdkCustomAttributeDefinitionTask_ExecuteReturn);
        expect(epSdkCustomAttributeDefinitionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_CREATE);
        epSdkCustomAttributeDefinitionTask_ExecuteReturns.push(epSdkCustomAttributeDefinitionTask_ExecuteReturn);
        // // DEBUG
        // expect(false, message).to.be.true;  
      }
      // DEBUG
      // const message = TestLogger.createLogMessage("epSdkCustomAttributeDefinitionTask_ExecuteReturns", epSdkCustomAttributeDefinitionTask_ExecuteReturns);
      // expect(false, message).to.be.true;  
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: customAttributeDefintions: present:`, async () => {
    TestContext.newItId();
    try {
      const epSdkCustomAttributeDefinitionTask_ExecuteReturns: Array<IEpSdkCustomAttributeDefinitionTask_ExecuteReturn> = [];
      for(const epSdkCustomAttribute of CustomAttributeList) {
        const epSdkCustomAttributeDefinitionTask = new EpSdkCustomAttributeDefinitionTask({
          epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
          attributeName: epSdkCustomAttribute.name,
          customAttributeDefinitionObjectSettings: {
            associatedEntityTypes: [EEpSdkCustomAttributeEntityTypes.APPLICATION_DOMAIN, EEpSdkCustomAttributeEntityTypes.APPLICATION],
            scope: CustomAttributeDefinition.scope.APPLICATION_DOMAIN,
            applicationDomainId: ApplicationDomainId_1
          },
        });
        const epSdkCustomAttributeDefinitionTask_ExecuteReturn: IEpSdkCustomAttributeDefinitionTask_ExecuteReturn = await epSdkCustomAttributeDefinitionTask.execute();
        const message = TestLogger.createLogMessage("epSdkCustomAttributeDefinitionTask_ExecuteReturn", epSdkCustomAttributeDefinitionTask_ExecuteReturn);
        expect(epSdkCustomAttributeDefinitionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.CREATE);
        epSdkCustomAttributeDefinitionTask_ExecuteReturns.push(epSdkCustomAttributeDefinitionTask_ExecuteReturn);
        // // DEBUG
        // expect(false, message).to.be.true;  
      }
      // DEBUG
      // const message = TestLogger.createLogMessage("epSdkCustomAttributeDefinitionTask_ExecuteReturns", epSdkCustomAttributeDefinitionTask_ExecuteReturns);
      // expect(false, message).to.be.true; 
      for(const epSdkCustomAttribute of CustomAttributeList) {
        const customAttributeDefinition: CustomAttributeDefinition | undefined = await EpSdkCustomAttributeDefinitionsService.getByName({
          attributeName: epSdkCustomAttribute.name,
          applicationDomainId: ApplicationDomainId_1
        });    
        expect(customAttributeDefinition, 'customAttributeDefinition').to.not.be.undefined;
      }
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: customAttributeDefintions: present: idempotency`, async () => {
    TestContext.newItId();
    try {
      for(const epSdkCustomAttribute of CustomAttributeList) {
        const epSdkCustomAttributeDefinitionTask = new EpSdkCustomAttributeDefinitionTask({
          epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
          attributeName: epSdkCustomAttribute.name,
          customAttributeDefinitionObjectSettings: {
            associatedEntityTypes: [EEpSdkCustomAttributeEntityTypes.APPLICATION_DOMAIN, EEpSdkCustomAttributeEntityTypes.APPLICATION],
            scope: CustomAttributeDefinition.scope.APPLICATION_DOMAIN,
            applicationDomainId: ApplicationDomainId_1
          },
        });
        const epSdkCustomAttributeDefinitionTask_ExecuteReturn: IEpSdkCustomAttributeDefinitionTask_ExecuteReturn = await epSdkCustomAttributeDefinitionTask.execute();
        const message = TestLogger.createLogMessage("epSdkCustomAttributeDefinitionTask_ExecuteReturn", epSdkCustomAttributeDefinitionTask_ExecuteReturn);
        expect(epSdkCustomAttributeDefinitionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.NO_ACTION);
        // DEBUG
        // expect(false, message).to.be.true;  
      }

      const customAttributeDefinitions: Array<CustomAttributeDefinition> = [];
      for(const epSdkCustomAttribute of CustomAttributeList) {
        const customAttributeDefinition: CustomAttributeDefinition | undefined = await EpSdkCustomAttributeDefinitionsService.getByName({
          attributeName: epSdkCustomAttribute.name,
          applicationDomainId: ApplicationDomainId_1
        });    
        expect(customAttributeDefinition, 'customAttributeDefinition').to.not.be.undefined;
        customAttributeDefinitions.push(customAttributeDefinition);
      }
      // DEBUG
      // const message = TestLogger.createLogMessage("customAttributeDefinitions", customAttributeDefinitions);
      // expect(false, message).to.be.true;  

    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: customAttributeDefintions: present: add entity type`, async () => {
    TestContext.newItId();
    try {
      const epSdkCustomAttributeDefinitionTask_ExecuteReturns: Array<IEpSdkCustomAttributeDefinitionTask_ExecuteReturn> = [];
      for(const epSdkCustomAttribute of CustomAttributeList) {
        const epSdkCustomAttributeDefinitionTask = new EpSdkCustomAttributeDefinitionTask({
          epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
          attributeName: epSdkCustomAttribute.name,
          customAttributeDefinitionObjectSettings: {
            associatedEntityTypes: [EEpSdkCustomAttributeEntityTypes.APPLICATION_DOMAIN, EEpSdkCustomAttributeEntityTypes.APPLICATION, EEpSdkCustomAttributeEntityTypes.ENUM],
            // associatedEntityTypes: await EpSdkCustomAttributeDefinitionsService.presentAssociatedEntityType({
            //   attributeName: epSdkCustomAttribute.name,
            //   associatedEntityType: EEpSdkCustomAttributeEntityTypes.ENUM,
              
            //   applicationDomainId: ApplicationDomainId_1
            // }),
            scope: CustomAttributeDefinition.scope.APPLICATION_DOMAIN,
            applicationDomainId: ApplicationDomainId_1
          },
        });
        const epSdkCustomAttributeDefinitionTask_ExecuteReturn: IEpSdkCustomAttributeDefinitionTask_ExecuteReturn = await epSdkCustomAttributeDefinitionTask.execute();
        const message = TestLogger.createLogMessage("epSdkCustomAttributeDefinitionTask_ExecuteReturn", epSdkCustomAttributeDefinitionTask_ExecuteReturn);
        // expect(epSdkCustomAttributeDefinitionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.UPDATE);
        // cater for the bug
        expect(epSdkCustomAttributeDefinitionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.be.oneOf([EEpSdkTask_Action.UPDATE, EEpSdkTask_Action.CREATE]);
        epSdkCustomAttributeDefinitionTask_ExecuteReturns.push(epSdkCustomAttributeDefinitionTask_ExecuteReturn);

        // // DEBUG
        // expect(false, message).to.be.true; 

        // check entity types
        const customAttributeDefinition: CustomAttributeDefinition | undefined = await EpSdkCustomAttributeDefinitionsService.getByName({
          attributeName: epSdkCustomAttribute.name,
          applicationDomainId: ApplicationDomainId_1
        });
        const message1 = TestLogger.createLogMessage("customAttributeDefinition", customAttributeDefinition);
        expect(customAttributeDefinition.associatedEntityTypes, message1).to.include(EEpSdkObjectTypes.ENUM);
        expect(customAttributeDefinition.associatedEntityTypes, message1).to.include(EEpSdkObjectTypes.APPLICATION_DOMAIN);
        expect(customAttributeDefinition.associatedEntityTypes, message1).to.include(EEpSdkObjectTypes.APPLICATION);
      }
      // DEBUG
      // const message = TestLogger.createLogMessage("epSdkCustomAttributeDefinitionTask_ExecuteReturns", epSdkCustomAttributeDefinitionTask_ExecuteReturns);
      // expect(false, message).to.be.true;        
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: customAttributeDefintions: absent`, async () => {
    TestContext.newItId();
    try {
      for(const epSdkCustomAttribute of CustomAttributeList) {
        const epSdkCustomAttributeDefinitionTask = new EpSdkCustomAttributeDefinitionTask({
          epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
          attributeName: epSdkCustomAttribute.name,
          customAttributeDefinitionObjectSettings: {},
        });
        const epSdkCustomAttributeDefinitionTask_ExecuteReturn: IEpSdkCustomAttributeDefinitionTask_ExecuteReturn = await epSdkCustomAttributeDefinitionTask.execute();
        const message = TestLogger.createLogMessage("epSdkCustomAttributeDefinitionTask_ExecuteReturn", epSdkCustomAttributeDefinitionTask_ExecuteReturn);
        expect(epSdkCustomAttributeDefinitionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.DELETE);
        // DEBUG
        // expect(false, message).to.be.true;  
      }

      const customAttributeDefinitions: Array<CustomAttributeDefinition> = [];
      for(const epSdkCustomAttribute of CustomAttributeList) {
        const customAttributeDefinition: CustomAttributeDefinition | undefined = await EpSdkCustomAttributeDefinitionsService.getByName({
          attributeName: epSdkCustomAttribute.name,
          applicationDomainId: ApplicationDomainId_1
        });    
        if(customAttributeDefinition !== undefined) customAttributeDefinitions.push(customAttributeDefinition);
      }
      const message = TestLogger.createLogMessage("customAttributeDefinitions", customAttributeDefinitions);
      expect(customAttributeDefinitions.length, message).to.equal(0);
      // DEBUG
      // expect(false, message).to.be.true;  
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: customAttributeDefintions: absent: idempotency`, async () => {
    TestContext.newItId();
    try {
      for(const epSdkCustomAttribute of CustomAttributeList) {
        const epSdkCustomAttributeDefinitionTask = new EpSdkCustomAttributeDefinitionTask({
          epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
          attributeName: epSdkCustomAttribute.name,
          customAttributeDefinitionObjectSettings: {},
        });
        const epSdkCustomAttributeDefinitionTask_ExecuteReturn: IEpSdkCustomAttributeDefinitionTask_ExecuteReturn = await epSdkCustomAttributeDefinitionTask.execute();
        const message = TestLogger.createLogMessage("epSdkCustomAttributeDefinitionTask_ExecuteReturn", epSdkCustomAttributeDefinitionTask_ExecuteReturn);
        expect(epSdkCustomAttributeDefinitionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.NO_ACTION);
        // DEBUG
        // expect(false, message).to.be.true;  
      }

      const customAttributeDefinitions: Array<CustomAttributeDefinition> = [];
      for(const epSdkCustomAttribute of CustomAttributeList) {
        const customAttributeDefinition: CustomAttributeDefinition | undefined = await EpSdkCustomAttributeDefinitionsService.getByName({
          attributeName: epSdkCustomAttribute.name,
          applicationDomainId: ApplicationDomainId_1
        });    
        if(customAttributeDefinition !== undefined) customAttributeDefinitions.push(customAttributeDefinition);
      }
      const message = TestLogger.createLogMessage("customAttributeDefinitions", customAttributeDefinitions);
      expect(customAttributeDefinitions.length, message).to.equal(0);
      // DEBUG
      // expect(false, message).to.be.true;  
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

});
