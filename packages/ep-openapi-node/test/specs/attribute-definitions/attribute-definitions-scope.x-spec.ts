import "mocha";
import { expect } from "chai";
import path from "path";
import { 
  TestContext, 
  TestUtils 
} from "@internal/tools/src";
import { 
  ECustomAttributeEntityTypes,
  TestConfig, 
  TestHelpers, 
  TestLogger 
} from "../../lib";
import {
  ApiError,
  ApplicationDomainResponse,
  ApplicationDomainsService,
  CustomAttributeDefinition,
  CustomAttributeDefinitionResponse,
  CustomAttributeDefinitionsResponse,
  CustomAttributeDefinitionsService,
} from '../../../generated-src';

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
  associatedEntityTypes: [ECustomAttributeEntityTypes.APPLICATION_DOMAIN]
}

let CustomAttributeDefinition_2: CustomAttributeDefinition = {
  name: "CustomAttributeDefinition_2",
  scope: CustomAttributeDefinition.scope.APPLICATION_DOMAIN,
  valueType: CustomAttributeDefinition.valueType.STRING,
  associatedEntityTypes: [ECustomAttributeEntityTypes.APPLICATION_DOMAIN]
}


const initializeGlobals = () => {
  ApplicationDomainName_1 = `${TestConfig.getAppId()}/${TestSpecName}`;
  TestConfig.getConfig().enableApiLogging = true;
};

const cleanTest = async() => {
  try {
    await TestHelpers.applicationDomainAbsent({ applicationDomainName: ApplicationDomainName_1 });
    await TestHelpers.customAttributeDefinitionAbsent({ customAttributeDefinitionName: CustomAttributeDefinition_1.name });
    await TestHelpers.customAttributeDefinitionAbsent({ customAttributeDefinitionName: CustomAttributeDefinition_2.name });
  } catch (e) {
    expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
    expect(false, TestLogger.createApiTestFailMessage('cleanTest failed', e)).to.be.true;
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

  it(`${scriptName}: should create application domain`, async () => {
    TestContext.newItId();
    try {
      const applicationDomainResponse: ApplicationDomainResponse = await ApplicationDomainsService.createApplicationDomain({
        xContextId: 'xContextId',
        requestBody: {
          name: ApplicationDomainName_1,
        }
      });
      if(applicationDomainResponse.data === undefined) throw new Error('applicationDomainResponse.data === undefined');
      if(applicationDomainResponse.data.id === undefined) throw new Error('applicationDomainResponse.data.id === undefined');
      ApplicationDomainId_1 = applicationDomainResponse.data.id;
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: create custom attribute definitions`, async () => {
    TestContext.newItId();
    try {
      const customAttributeDefinitionResponse_1: CustomAttributeDefinitionResponse = await CustomAttributeDefinitionsService.createCustomAttributeDefinitionByApplicationDomain({
        applicationDomainId: ApplicationDomainId_1,
        requestBody: CustomAttributeDefinition_1
      });
      if(customAttributeDefinitionResponse_1.data === undefined) throw new Error('customAttributeDefinitionResponse_1.data === undefined');
      CustomAttributeDefinition_1 = customAttributeDefinitionResponse_1.data;

      const customAttributeDefinitionResponse_2: CustomAttributeDefinitionResponse = await CustomAttributeDefinitionsService.createCustomAttributeDefinitionByApplicationDomain({
        applicationDomainId: ApplicationDomainId_1,
        requestBody: CustomAttributeDefinition_2
      });
      if(customAttributeDefinitionResponse_2.data === undefined) throw new Error('customAttributeDefinitionResponse_2.data === undefined');
      CustomAttributeDefinition_2 = customAttributeDefinitionResponse_2.data;

    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: patch custom attribute definition 1`, async () => {
    TestContext.newItId();
    try {
      const update: CustomAttributeDefinition = {
        scope: CustomAttributeDefinition_1.scope,
        name: CustomAttributeDefinition_1.name,
        associatedEntityTypes: [ECustomAttributeEntityTypes.APPLICATION_DOMAIN, ECustomAttributeEntityTypes.APPLICATION, ECustomAttributeEntityTypes.ENUM],
      }
      if(CustomAttributeDefinition_1.id === undefined) throw new Error('CustomAttributeDefinition_1.id === undefined');
      const customAttributeDefinitionResponse_1: CustomAttributeDefinitionResponse = await CustomAttributeDefinitionsService.updateCustomAttributeDefinitionByApplicationDomain({
        applicationDomainId: ApplicationDomainId_1,
        customAttributeId: CustomAttributeDefinition_1.id,
        requestBody: update,
      });
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: test custom attribute definitions`, async () => {
    TestContext.newItId();
    try {
      const customAttributeDefinitionsResponse: CustomAttributeDefinitionsResponse = await CustomAttributeDefinitionsService.getCustomAttributeDefinitions({
        pageSize: 100
      });
      if(customAttributeDefinitionsResponse.data === undefined) throw new Error('customAttributeDefinitionsResponse.data === undefined');
      const filteredCustomAttributeDefinitions: Array<CustomAttributeDefinition> = customAttributeDefinitionsResponse.data.filter(x => x.name === CustomAttributeDefinition_1.name || x.name === CustomAttributeDefinition_2.name );
      const message = TestLogger.createLogMessage("filteredCustomAttributeDefinitions", filteredCustomAttributeDefinitions);
      for(const customAttributeDefinition of filteredCustomAttributeDefinitions) {
        expect(customAttributeDefinition.associatedEntities, message).to.not.be.undefined;
        expect(customAttributeDefinition.associatedEntityTypes, message).to.not.be.undefined;
      }
      // expect(false, message).to.be.true;
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
    }
  });

});
