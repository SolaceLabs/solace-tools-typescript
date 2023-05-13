import "mocha";
import { expect } from "chai";
import path from "path";
import {
  AddressLevel,
  ApiError,
  ApplicationDomainResponse,
  ApplicationDomainsService,
  TopicDomain,
  TopicDomainResponse,
  TopicDomainsService,
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
  EpSdkTopicDomainsService,
  EpSdkApplicationDomainTask,
} from "../../../src";

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId: string = TestUtils.getUUID();

// test globals
let ApplicationDomainName: string;
let ApplicationDomainId: string | undefined;
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
let ApplicationDomainName_2: string;
let ApplicationDomainId_2: string | undefined;

const initializeGlobals = () => {
  ApplicationDomainName = `${TestConfig.getAppId()}/services/${TestSpecName}`;
  ApplicationDomainName_2 = `${TestConfig.getAppId()}/services/${TestSpecName}/2`;
};

describe(`${scriptName}`, () => {
  before(async () => {
    TestContext.newItId();
    initializeGlobals();
    await TestHelpers.applicationDomainAbsent({ applicationDomainName: ApplicationDomainName });
    await TestHelpers.applicationDomainAbsent({ applicationDomainName: ApplicationDomainName_2 });
  });

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async () => {
    TestContext.newItId();
    await TestHelpers.applicationDomainAbsent({applicationDomainName: ApplicationDomainName });
    await TestHelpers.applicationDomainAbsent({ applicationDomainName: ApplicationDomainName_2 });
  });

  it(`${scriptName}: should create application domains`, async () => {
    try {
      const applicationDomainResponse: ApplicationDomainResponse = await ApplicationDomainsService.createApplicationDomain({
        requestBody: { name: ApplicationDomainName }
      });
      ApplicationDomainId = applicationDomainResponse.data.id;
      const applicationDomainResponse_2: ApplicationDomainResponse = await ApplicationDomainsService.createApplicationDomain({
        requestBody: { name: ApplicationDomainName_2 }
      });
      ApplicationDomainId_2 = applicationDomainResponse_2.data.id;
      // // DEBUG
      // expect(false, `ApplicationDomainId=${ApplicationDomainId}`).to.be.true;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed", e)).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should create topic domain`, async () => {
    try {
      const topicDomainResponse: TopicDomainResponse = await TopicDomainsService.createTopicDomain({
        requestBody: {
          applicationDomainId: ApplicationDomainId,
          brokerType: EpSdkBrokerTypes.Solace,
          addressLevels: AddressLevels_1
        }
      });
      // // DEBUG
      // expect(false, `topicDomainResponse=${JSON.stringify(topicDomainResponse, null, 2)}`).to.be.true;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed", e)).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should get topic domain for applicationDomainId`, async () => {
    try {
      const topicDomain: TopicDomain | undefined = await EpSdkTopicDomainsService.getByApplicationDomainId({
        applicationDomainId: ApplicationDomainId
      });
      // // DEBUG
      // expect(false, `topicDomain=${JSON.stringify(topicDomain, null, 2)}`).to.be.true;
      expect(topicDomain, TestLogger.createLogMessage('topicDomain is undefined')).to.not.be.undefined;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed", e)).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should not find topic domain for unknown applicationDomainId`, async () => {
    try {
      const topicDomain: TopicDomain | undefined = await EpSdkTopicDomainsService.getByApplicationDomainId({
        applicationDomainId: ApplicationDomainId_2
      });
      // DEBUG
      // expect(false, `topicDomain=${JSON.stringify(topicDomain, null, 2)}`).to.be.true;
      expect(topicDomain, TestLogger.createLogMessage('topicDomain is not undefined')).to.be.undefined;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed", e)).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });


});
