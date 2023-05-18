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
  CustomAttributeDefinitionResponse,
  CustomAttributeDefinitionsResponse,
  CustomAttributeDefinitionsService,
} from "@solace-labs/ep-openapi-node";
import {
  EpSdkError,
  EEpSdkTask_TargetState,
  EEpSdkCustomAttributeEntityTypes,
  EpSdkCustomAttributeDefinitionTask,
  EpSdkApplicationDomainTask,
  IEpSdkApplicationDomainTask_ExecuteReturn,
  EEpSdkObjectTypes,
} from "../../../src";

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId = TestUtils.getShortUUID();

let ApplicationDomainName_1: string;
let ApplicationDomainId_1: string;

let CustomAttributeDefinition_1: CustomAttributeDefinition = {
  name: "CustomAttributeDefinition_1",
  scope: CustomAttributeDefinition.scope.APPLICATION_DOMAIN,
  valueType: CustomAttributeDefinition.valueType.STRING,
  associatedEntityTypes: [EEpSdkObjectTypes.APPLICATION_DOMAIN]
}

let CustomAttributeDefinition_2: CustomAttributeDefinition = {
  name: "CustomAttributeDefinition_2",
  scope: CustomAttributeDefinition.scope.APPLICATION_DOMAIN,
  valueType: CustomAttributeDefinition.valueType.STRING,
  associatedEntityTypes: [EEpSdkObjectTypes.APPLICATION_DOMAIN]
}


const initializeGlobals = () => {
  ApplicationDomainName_1 = `${TestConfig.getAppId()}/${TestSpecName}`;
  TestConfig.getConfig().enableApiLogging = true;
};

const cleanTest = async() => {
  try {
    const epSdkApplicationDomainTask_1 = new EpSdkApplicationDomainTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
      applicationDomainName: ApplicationDomainName_1,
    });
    await epSdkApplicationDomainTask_1.execute('contextId');

    const epSdkCustomAttributeDefinitionTask_1 = new EpSdkCustomAttributeDefinitionTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
      attributeName: CustomAttributeDefinition_1.name,
      customAttributeDefinitionObjectSettings: {}
    });
    await epSdkCustomAttributeDefinitionTask_1.execute();

    const epSdkCustomAttributeDefinitionTask_2 = new EpSdkCustomAttributeDefinitionTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
      attributeName: CustomAttributeDefinition_2.name,
      customAttributeDefinitionObjectSettings: {}
    });
    await epSdkCustomAttributeDefinitionTask_2.execute();

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

  it(`${scriptName}: setup application domain`, async () => {
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

  it(`${scriptName}: create custom attribute definitions`, async () => {
    TestContext.newItId();
    try {
      const customAttributeDefinitionResponse_1: CustomAttributeDefinitionResponse = await CustomAttributeDefinitionsService.createCustomAttributeDefinitionByApplicationDomain({
        applicationDomainId: ApplicationDomainId_1,
        requestBody: CustomAttributeDefinition_1
      });
      CustomAttributeDefinition_1 = customAttributeDefinitionResponse_1.data;

      const customAttributeDefinitionResponse_2: CustomAttributeDefinitionResponse = await CustomAttributeDefinitionsService.createCustomAttributeDefinitionByApplicationDomain({
        applicationDomainId: ApplicationDomainId_1,
        requestBody: CustomAttributeDefinition_2
      });
      CustomAttributeDefinition_2 = customAttributeDefinitionResponse_2.data;

    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: patch custom attribute definition 1`, async () => {
    TestContext.newItId();
    try {
      const update: CustomAttributeDefinition = {
        scope: CustomAttributeDefinition_1.scope,
        name: CustomAttributeDefinition_1.name,
        associatedEntityTypes: [EEpSdkCustomAttributeEntityTypes.APPLICATION_DOMAIN, EEpSdkCustomAttributeEntityTypes.APPLICATION, EEpSdkCustomAttributeEntityTypes.ENUM],
      }
      const customAttributeDefinitionResponse_1: CustomAttributeDefinitionResponse = await CustomAttributeDefinitionsService.updateCustomAttributeDefinitionByApplicationDomain({
        applicationDomainId: ApplicationDomainId_1,
        customAttributeId: CustomAttributeDefinition_1.id,
        requestBody: update,
      });

    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: get all custom attribute definitions`, async () => {
    TestContext.newItId();
    try {
      const customAttributeDefinitionsResponse: CustomAttributeDefinitionsResponse = await CustomAttributeDefinitionsService.getCustomAttributeDefinitions({
        pageSize: 100
      });
      const log = {
        customAttributeDefintions: customAttributeDefinitionsResponse.data.filter(x => x.name === CustomAttributeDefinition_1.name || x.name === CustomAttributeDefinition_2.name )
      };
      const message = TestLogger.createLogMessage("customAttributeDefintions", log);
      expect(false, message).to.be.true;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

});
