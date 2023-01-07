import "mocha";
import { expect } from "chai";
import path from "path";
import {
  ApiError,
  ApplicationDomainResponse,
  ApplicationDomainsService,
  Application,
  ApplicationResponse,
  ApplicationsService,
} from "@solace-labs/ep-openapi-node";
import { TestContext, TestUtils } from "@internal/tools/src";
import { TestLogger, TestConfig, TestHelpers } from "../../lib";
import {
  EpSdkError,
  EpSdkServiceError,
  EpSdkApplicationsService,
  TEpSdkCustomAttributeList,
  EpSdkApplicationDomainsService,
} from "../../../src";

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId: string = TestUtils.getUUID();
let ApplicationDomainName: string;
let ApplicationDomainId: string | undefined;
let ApplicationName: string;
let ApplicationId: string | undefined;

const ApplicationCustomAttributeList: TEpSdkCustomAttributeList = [
  {
    name: "applicationAttribute_1",
    value: "applicationAttribute_1 value",
  },
  {
    name: "applicationAttribute_2",
    value: "applicationAttribute_2 value",
  },
];
const ApplicationAdditionalCustomAttributeList: TEpSdkCustomAttributeList = [
  {
    name: "applicationAttribute_3",
    value: "applicationAttribute_3 value",
  },
  {
    name: "applicationAttribute_4",
    value: "applicationAttribute_4 value",
  },
];

const initializeGlobals = () => {
  ApplicationDomainName = `${TestConfig.getAppId()}/services/${TestSpecName}`;
  ApplicationName = `${TestConfig.getAppId()}-services-${TestSpecName}`;
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
    let xvoid: void = await TestHelpers.applicationDomainAbsent({
      applicationDomainName: ApplicationDomainName,
    });
    // remove all attribute definitions
    const customAttributeList = ApplicationCustomAttributeList.concat(
      ApplicationAdditionalCustomAttributeList
    );
    xvoid =
      await EpSdkApplicationsService.removeAssociatedEntityTypeFromCustomAttributeDefinitions(
        {
          customAttributeNames: customAttributeList.map((x) => {
            return x.name;
          }),
        }
      );
  });

  it(`${scriptName}: should create application domain`, async () => {
    try {
      const applicationDomainResponse: ApplicationDomainResponse =
        await ApplicationDomainsService.createApplicationDomain({
          requestBody: {
            name: ApplicationDomainName,
          },
        });
      ApplicationDomainId = applicationDomainResponse.data.id;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should create application`, async () => {
    try {
      const applicationResponse: ApplicationResponse =
        await ApplicationsService.createApplication({
          requestBody: {
            applicationDomainId: ApplicationDomainId,
            name: ApplicationName,
            applicationType: "standard",
            brokerType: Application.brokerType.SOLACE,
          },
        });
      ApplicationId = applicationResponse.data.id;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should get application by name`, async () => {
    try {
      const epApplication: Application | ApplicationResponse =
        await EpSdkApplicationsService.getByName({
          applicationDomainId: ApplicationDomainId,
          applicationName: ApplicationName,
        });
      expect(
        epApplication,
        TestLogger.createApiTestFailMessage("epApplication === undefined")
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

  it(`${scriptName}: should get application by id`, async () => {
    try {
      const epApplication: Application = await EpSdkApplicationsService.getById(
        {
          applicationDomainId: ApplicationDomainId,
          applicationId: ApplicationId,
        }
      );
      expect(
        epApplication.id,
        TestLogger.createApiTestFailMessage(
          `epApplication.id !== ${ApplicationId}`
        )
      ).to.eq(ApplicationId);
      expect(
        epApplication.applicationDomainId,
        TestLogger.createApiTestFailMessage(
          `applicationDomainId !== ${ApplicationDomainId}`
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

  it(`${scriptName}: should delete application by id`, async () => {
    try {
      const epApplication: Application =
        await EpSdkApplicationsService.deleteById({
          applicationDomainId: ApplicationDomainId,
          applicationId: ApplicationId,
        });
      expect(
        epApplication.id,
        TestLogger.createApiTestFailMessage(
          `epApplication.id !== ${ApplicationId}`
        )
      ).to.eq(ApplicationId);
      expect(
        epApplication.applicationDomainId,
        TestLogger.createApiTestFailMessage(
          `applicationDomainId !== ${ApplicationDomainId}`
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

  it(`${scriptName}: should create application`, async () => {
    try {
      const applicationResponse: ApplicationResponse =
        await ApplicationsService.createApplication({
          requestBody: {
            applicationDomainId: ApplicationDomainId,
            name: ApplicationName,
            applicationType: "standard",
            brokerType: Application.brokerType.SOLACE,
          },
        });
      ApplicationId = applicationResponse.data.id;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should set custom attributes on application`, async () => {
    try {
      const application: Application =
        await EpSdkApplicationsService.setCustomAttributes({
          applicationId: ApplicationId,
          epSdkCustomAttributeList: ApplicationCustomAttributeList,
        });
      expect(application.customAttributes).to.not.be.undefined;
      if (application.customAttributes === undefined)
        throw new Error("application.customAttributes === undefined");
      for (const customAttribute of ApplicationCustomAttributeList) {
        const found = application.customAttributes.find((x) => {
          return x.customAttributeDefinitionName === customAttribute.name;
        });
        expect(found).to.not.be.undefined;
        expect(found.value).to.equal(customAttribute.value);
      }
      // // DEBUG
      // expect(false, `application.customAttributes=${JSON.stringify(application.customAttributes, null, 2)}`).to.be.true;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should set custom attributes on application: idempotency`, async () => {
    try {
      const application: Application =
        await EpSdkApplicationsService.setCustomAttributes({
          applicationId: ApplicationId,
          epSdkCustomAttributeList: ApplicationCustomAttributeList,
        });
      expect(application.customAttributes).to.not.be.undefined;
      if (application.customAttributes === undefined)
        throw new Error("application.customAttributes === undefined");
      for (const customAttribute of ApplicationCustomAttributeList) {
        const found = application.customAttributes.find((x) => {
          return x.customAttributeDefinitionName === customAttribute.name;
        });
        expect(found).to.not.be.undefined;
        expect(found.value).to.equal(customAttribute.value);
      }
      // // DEBUG
      // expect(false, `application.customAttributes=${JSON.stringify(application.customAttributes, null, 2)}`).to.be.true;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should set additional custom attributes on application leaving original attributes as-is`, async () => {
    try {
      const application: Application =
        await EpSdkApplicationsService.setCustomAttributes({
          applicationId: ApplicationId,
          epSdkCustomAttributeList: ApplicationAdditionalCustomAttributeList,
        });
      expect(application.customAttributes).to.not.be.undefined;
      if (application.customAttributes === undefined)
        throw new Error("application.customAttributes === undefined");
      expect(
        application.customAttributes.length,
        `wrong number of attributes`
      ).to.equal(
        ApplicationAdditionalCustomAttributeList.length +
          ApplicationCustomAttributeList.length
      );
      for (const customAttribute of ApplicationCustomAttributeList) {
        const found = application.customAttributes.find((x) => {
          return x.customAttributeDefinitionName === customAttribute.name;
        });
        expect(found).to.not.be.undefined;
        expect(found.value).to.equal(customAttribute.value);
      }
      for (const customAttribute of ApplicationAdditionalCustomAttributeList) {
        const found = application.customAttributes.find((x) => {
          return x.customAttributeDefinitionName === customAttribute.name;
        });
        expect(found).to.not.be.undefined;
        expect(found.value).to.equal(customAttribute.value);
      }
      // // DEBUG
      // expect(false, `application.customAttributes=${JSON.stringify(application.customAttributes, null, 2)}`).to.be.true;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should unset additional custom attributes on application leaving only original attributes`, async () => {
    try {
      const application: Application =
        await EpSdkApplicationsService.unsetCustomAttributes({
          applicationId: ApplicationId,
          epSdkCustomAttributeList: ApplicationAdditionalCustomAttributeList,
        });
      expect(application.customAttributes).to.not.be.undefined;
      if (application.customAttributes === undefined)
        throw new Error("application.customAttributes === undefined");
      expect(
        application.customAttributes.length,
        `wrong number of attributes`
      ).to.equal(ApplicationCustomAttributeList.length);
      for (const customAttribute of ApplicationCustomAttributeList) {
        const found = application.customAttributes.find((x) => {
          return x.customAttributeDefinitionName === customAttribute.name;
        });
        expect(found).to.not.be.undefined;
        expect(found.value).to.equal(customAttribute.value);
      }
      for (const customAttribute of ApplicationAdditionalCustomAttributeList) {
        const found = application.customAttributes.find((x) => {
          return x.customAttributeDefinitionName === customAttribute.name;
        });
        expect(found).to.be.undefined;
      }
      // // DEBUG
      // expect(false, `application.customAttributes=${JSON.stringify(application.customAttributes, null, 2)}`).to.be.true;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should delete application by name`, async () => {
    try {
      const epApplication: Application =
        await EpSdkApplicationsService.deleteByName({
          applicationDomainId: ApplicationDomainId,
          applicationName: ApplicationName,
        });
      expect(
        epApplication.name,
        TestLogger.createApiTestFailMessage(
          `epApplication.name !== ${ApplicationName}`
        )
      ).to.eq(ApplicationName);
      expect(
        epApplication.id,
        TestLogger.createApiTestFailMessage(
          `epApplication.id !== ${ApplicationId}`
        )
      ).to.eq(ApplicationId);
      expect(
        epApplication.applicationDomainId,
        TestLogger.createApiTestFailMessage(
          `applicationDomainId !== ${ApplicationDomainId}`
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

  it(`${scriptName}: should catch delete application by name that doesn't exist`, async () => {
    const NonExistentName = "non-existent";
    try {
      const epApplication: Application =
        await EpSdkApplicationsService.deleteByName({
          applicationDomainId: ApplicationDomainId,
          applicationName: NonExistentName,
        });
      expect(false, TestLogger.createApiTestFailMessage("must never get here"))
        .to.be.true;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(
        e instanceof EpSdkServiceError,
        TestLogger.createNotEpSdkErrorMessage(e)
      ).to.be.true;
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
