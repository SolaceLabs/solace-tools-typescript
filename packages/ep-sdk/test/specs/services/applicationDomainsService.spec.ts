import "mocha";
import { expect } from "chai";
import path from "path";
import {
  ApiError,
  ApplicationDomain,
  ApplicationDomainResponse,
  ApplicationDomainsResponse,
  ApplicationDomainsService,
  CustomAttribute,
} from "@solace-labs/ep-openapi-node";
import { TestContext, TestUtils } from "@internal/tools/src";
import { TestLogger, TestConfig, TestHelpers } from "../../lib";
import {
  EpSdkError,
  EpSdkServiceError,
  EpSdkApplicationDomainsService,
  TEpSdkCustomAttribute,
  IEpSdkAttributesQuery,
  EEpSdkComparisonOps,
} from "../../../src";

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId: string = TestUtils.getUUID();

// test globals
let ApplicationDomainName: string;
let ApplicationDomainId: string | undefined;
let ApplicationDomainIdList: Array<string> = [];

const CorrectAttribute: TEpSdkCustomAttribute = {
  name: `${TestSpecName}.APPS`,
  value: "ep-developer-portal",
};
const AnotherAttribute: TEpSdkCustomAttribute = {
  name: `${TestSpecName}.another`,
  value: "another value",
};

const CorrectAttributesQuery: IEpSdkAttributesQuery = {
  AND: {
    queryList: [
      {
        attributeName: CorrectAttribute.name,
        comparisonOp: EEpSdkComparisonOps.CONTAINS,
        value: CorrectAttribute.value,
      },
    ],
  },
};

const recordApplicationDomainId = (applicationDomainId: string) => {
  ApplicationDomainId = applicationDomainId;
  ApplicationDomainIdList.push(applicationDomainId);
};

const initializeGlobals = () => {
  ApplicationDomainName = `${TestConfig.getAppId()}/services/${TestSpecName}`;
};

describe(`${scriptName}`, () => {
  before(async () => {
    TestContext.newItId();
    initializeGlobals();
    const xvoid: void = await TestHelpers.applicationDomainAbsent({
      applicationDomainName: ApplicationDomainName,
    });
  });

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async () => {
    TestContext.newItId();
    // delete all recorded application domains
    for (const applicationDomainId of ApplicationDomainIdList) {
      try {
        await EpSdkApplicationDomainsService.deleteById({
          applicationDomainId: applicationDomainId,
        });
      } catch (e) {}
    }
    const xvoid: void = await TestHelpers.applicationDomainAbsent({
      applicationDomainName: ApplicationDomainName,
    });
  });

  it(`${scriptName}: should create application domain`, async () => {
    try {
      const applicationDomainResponse: ApplicationDomainResponse =
        await ApplicationDomainsService.createApplicationDomain({
          requestBody: {
            name: ApplicationDomainName,
          },
        });
      recordApplicationDomainId(applicationDomainResponse.data.id);      
      // // DEBUG
      // expect(false, `ApplicationDomainId=${ApplicationDomainId}`).to.be.true;
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

  it(`${scriptName}: should create custom attribute for the application domain`, async () => {
    try {
      const applicationDomain: ApplicationDomain = await EpSdkApplicationDomainsService.setCustomAttributes({ 
        applicationDomainId: ApplicationDomainId,
        epSdkCustomAttributeList: [
          CorrectAttribute,
          AnotherAttribute,
        ],
      });
      // test it is set
      expect(applicationDomain.customAttributes).to.not.be.undefined;
      const found: CustomAttribute | undefined = applicationDomain.customAttributes.find( (customAttribute: CustomAttribute) => {
        return ( customAttribute.customAttributeDefinitionName === CorrectAttribute.name );
      });
      expect(found, `applicationDomain=${JSON.stringify(applicationDomain, null, 2)}`).to.not.be.undefined;
      // // DEBUG
      // expect(false, `ApplicationDomainId=${ApplicationDomainId}`).to.be.true;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed", e)).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should list all application domains`, async () => {
    try {
      const applicationDomainsResponse: ApplicationDomainsResponse = await EpSdkApplicationDomainsService.listAll({ pageSize: 5 });
      const message = `applicationDomainsResponse=\n${JSON.stringify(applicationDomainsResponse, null, 2 )}`;
      expect(applicationDomainsResponse.meta.pagination.count, TestLogger.createApiTestFailMessage(message)).to.be.greaterThanOrEqual(1);
      expect(applicationDomainsResponse.data, TestLogger.createApiTestFailMessage(message)).to.not.be.undefined;
      expect(applicationDomainsResponse.data.length, TestLogger.createApiTestFailMessage(message)).to.be.greaterThanOrEqual(1);
      const found = applicationDomainsResponse.data.find((x) => { return x.id === ApplicationDomainId; });
      expect(found, TestLogger.createApiTestFailMessage(message)).to.not.be.undefined;
      const firstCount = applicationDomainsResponse.meta.pagination.count;
      const secondApplicationDomainsResponse: ApplicationDomainsResponse = await EpSdkApplicationDomainsService.listAll({});
      expect(secondApplicationDomainsResponse.meta.pagination.count, TestLogger.createApiTestFailMessage(`secondApplicationDomainsResponse=\n${JSON.stringify(secondApplicationDomainsResponse, null, 2 )}`)).to.equal(firstCount);
      // // DEBUG
      // expect(false, TestLogger.createApiTestFailMessage(message)).to.be.true;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should list all application domains filtering by custom attribute`, async () => {
    try {
      const applicationDomainsResponse: ApplicationDomainsResponse = await EpSdkApplicationDomainsService.listAll({ attributesQuery: CorrectAttributesQuery });
      const message = `applicationDomainsResponse=\n${JSON.stringify(applicationDomainsResponse, null, 2 )}`;
      expect(applicationDomainsResponse.meta.pagination.count, TestLogger.createApiTestFailMessage(message)).to.be.equal(1);
      expect(applicationDomainsResponse.data, TestLogger.createApiTestFailMessage(message)).to.not.be.undefined;
      expect(applicationDomainsResponse.data.length, TestLogger.createApiTestFailMessage(message)).to.be.equal(1);
      const found = applicationDomainsResponse.data.find((x) => { return x.id === ApplicationDomainId; });
      expect(found, TestLogger.createApiTestFailMessage(message)).to.not.be.undefined;
      // // DEBUG
      // expect(false, TestLogger.createApiTestFailMessage(message)).to.be.true;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should unset custom attributes from application domain`, async () => {
    try {
      const applicationDomain: ApplicationDomain = await EpSdkApplicationDomainsService.unsetCustomAttributes({ 
        applicationDomainId: ApplicationDomainId,
        epSdkCustomAttributeList: [
          CorrectAttribute,
          AnotherAttribute,
        ],
      });
      // test no custom attributes left
      expect(applicationDomain.customAttributes.length, 'wrong length').to.equal(0);
      // remove association
      await EpSdkApplicationDomainsService.removeAssociatedEntityTypeFromCustomAttributeDefinitions({
        customAttributeNames: [
          CorrectAttribute.name,
          AnotherAttribute.name
        ]
      });
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should get application domain by name`, async () => {
    try {
      const applicationDomain: ApplicationDomain | undefined =
        await EpSdkApplicationDomainsService.getByName({
          applicationDomainName: ApplicationDomainName,
        });
      // expect(false, TestLogger.createLogMessage('check logging')).to.be.true;
      expect(
        applicationDomain,
        TestLogger.createApiTestFailMessage("applicationDomain === undefined")
      ).to.not.be.undefined;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should get application domain by id`, async () => {
    try {
      const applicationDomain: ApplicationDomain =
        await EpSdkApplicationDomainsService.getById({
          applicationDomainId: ApplicationDomainId,
        });
      expect(
        applicationDomain.id,
        TestLogger.createApiTestFailMessage(
          `applicationDomain.id !== ${ApplicationDomainId}`
        )
      ).to.eq(ApplicationDomainId);
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should delete application domain by id`, async () => {
    try {
      const applicationDomain: ApplicationDomain =
        await EpSdkApplicationDomainsService.deleteById({
          applicationDomainId: ApplicationDomainId,
        });
      expect(
        applicationDomain,
        TestLogger.createApiTestFailMessage("applicationDomain === undefined")
      ).to.not.be.undefined;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should create application domain`, async () => {
    try {
      const applicationDomainResponse: ApplicationDomainResponse =
        await ApplicationDomainsService.createApplicationDomain({
          requestBody: {
            name: ApplicationDomainName,
          },
        });
      recordApplicationDomainId(applicationDomainResponse.data.id);
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should delete application domain by name`, async () => {
    try {
      const applicationDomain: ApplicationDomain =
        await EpSdkApplicationDomainsService.deleteByName({
          applicationDomainName: ApplicationDomainName,
        });
      expect(
        applicationDomain,
        TestLogger.createApiTestFailMessage("applicationDomain === undefined")
      ).to.not.be.undefined;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should catch delete application domain by name that doesn't exist`, async () => {
    const NonExistentName = "non-existent-application-domain";
    try {
      const applicationDomain: ApplicationDomain =
        await EpSdkApplicationDomainsService.deleteByName({
          applicationDomainName: NonExistentName,
        });
      expect(false, TestLogger.createApiTestFailMessage("must never get here"))
        .to.be.true;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      const epSdkServiceError: EpSdkServiceError = e;
      expect(
        epSdkServiceError.toString(),
        TestLogger.createApiTestFailMessage(
          `error does not contain ${NonExistentName}`
        )
      ).to.contain(NonExistentName);
    }
  });
});
