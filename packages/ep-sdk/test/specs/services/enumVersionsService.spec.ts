import "mocha";
import { expect } from "chai";
import path from "path";
import {
  ApiError,
  ApplicationDomainResponse,
  ApplicationDomainsService,
  EnumsService,
  TopicAddressEnumResponse,
  TopicAddressEnumValue,
  TopicAddressEnumVersion,
} from "@solace-labs/ep-openapi-node";
import { TestContext, TestUtils } from "@internal/tools/src";
import { TestLogger, TestConfig } from "../../lib";
import {
  EpSdkError,
  EpSdkServiceError,
  EpSdkApplicationDomainsService,
  EpSdkEnumVersionsService,
  EpSdkStatesService,
} from "../../../src";

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId: string = TestUtils.getUUID();
let ApplicationDomainName: string;
let ApplicationDomainId: string | undefined;
let EnumName: string;
let EnumId: string | undefined;
const EnumVersionString = "1.0.0";
let EnumVersionId: string | undefined;
const EnumValues: Array<TopicAddressEnumValue> = [
  { label: "one", value: "one" },
  { label: "two", value: "two" },
];
const EnumNextVersionString = "1.0.1";
let EnumNextVersionId: string | undefined;

const initializeGlobals = () => {
  ApplicationDomainName = `${TestConfig.getAppId()}/services/${TestSpecName}`;
  EnumName = `${TestConfig.getAppId()}-services-${TestSpecId}`;
};

describe(`${scriptName}`, () => {
  before(() => {
    initializeGlobals();
  });

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async () => {
    TestContext.newItId();
    // delete application domain
    await EpSdkApplicationDomainsService.deleteById({
      applicationDomainId: ApplicationDomainId,
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

  it(`${scriptName}: should create enum`, async () => {
    try {
      const enumResponse: TopicAddressEnumResponse =
        await EnumsService.createEnum({
          requestBody: {
            applicationDomainId: ApplicationDomainId,
            name: EnumName,
            shared: false,
          },
        });
      EnumId = enumResponse.data.id;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should create enum version`, async () => {
    try {
      const create: TopicAddressEnumVersion = {
        enumId: EnumId,
        description: `enum version for enum = ${EnumName}, id=${EnumId}`,
        values: EnumValues,
        version: EnumVersionString,
      };
      const topicAddressEnumVersion: TopicAddressEnumVersion =
        await EpSdkEnumVersionsService.createEnumVersion({
          enumId: EnumId,
          topicAddressEnumVersion: create,
          targetLifecycleStateId: EpSdkStatesService.releasedId,
        });
      EnumVersionId = topicAddressEnumVersion.id;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should get enum version by version`, async () => {
    try {
      const enumVersion: TopicAddressEnumVersion =
        await EpSdkEnumVersionsService.getVersionByVersion({
          enumId: EnumId,
          enumVersionString: EnumVersionString,
        });
      expect(
        enumVersion.version,
        TestLogger.createApiTestFailMessage("version mismatch")
      ).to.eq(EnumVersionString);
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should get enum versions for enum id`, async () => {
    try {
      const enumVersionList: Array<TopicAddressEnumVersion> =
        await EpSdkEnumVersionsService.getVersionsForEnumId({ enumId: EnumId });
      expect(
        enumVersionList.length,
        TestLogger.createApiTestFailMessage("length not === 1")
      ).to.eq(1);
      const enumVersion: TopicAddressEnumVersion = enumVersionList[0];
      expect(
        enumVersion.id,
        TestLogger.createApiTestFailMessage("id mismatch")
      ).to.eq(EnumVersionId);
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should get enum versions for enum name`, async () => {
    try {
      const enumVersionList: Array<TopicAddressEnumVersion> =
        await EpSdkEnumVersionsService.getVersionsForEnumName({
          applicationDomainId: ApplicationDomainId,
          enumName: EnumName,
        });
      expect(
        enumVersionList.length,
        TestLogger.createApiTestFailMessage("length not === 1")
      ).to.eq(1);
      const enumVersion: TopicAddressEnumVersion = enumVersionList[0];
      expect(
        enumVersion.id,
        TestLogger.createApiTestFailMessage("id mismatch")
      ).to.eq(EnumVersionId);
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should create new enum version`, async () => {
    try {
      const topicAddressEnumVersion: TopicAddressEnumVersion =
        await EpSdkEnumVersionsService.createEnumVersion({
          enumId: EnumId,
          topicAddressEnumVersion: {
            enumId: EnumId,
            description: `enum version for enum = ${EnumName}, id=${EnumId}`,
            values: EnumValues,
            version: EnumNextVersionString,
          },
          targetLifecycleStateId: EpSdkStatesService.releasedId,
        });
      EnumNextVersionId = topicAddressEnumVersion.id;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should get latest version string`, async () => {
    try {
      const latestVersionString: string =
        await EpSdkEnumVersionsService.getLatestVersionString({
          enumId: EnumId,
        });
      expect(
        latestVersionString,
        TestLogger.createApiTestFailMessage("version string mismatch")
      ).to.eq(EnumNextVersionString);
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should get latest version for enum id`, async () => {
    try {
      const enumVersion: TopicAddressEnumVersion =
        await EpSdkEnumVersionsService.getLatestVersionForEnumId({
          applicationDomainId: ApplicationDomainId,
          enumId: EnumId,
        });
      expect(
        enumVersion.version,
        TestLogger.createApiTestFailMessage("version string mismatch")
      ).to.eq(EnumNextVersionString);
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should get latest version for enum name`, async () => {
    try {
      const enumVersion: TopicAddressEnumVersion | undefined =
        await EpSdkEnumVersionsService.getLatestVersionForEnumName({
          applicationDomainId: ApplicationDomainId,
          enumName: EnumName,
        });
      expect(
        enumVersion,
        TestLogger.createApiTestFailMessage("enumVersion === undefined")
      ).to.not.be.undefined;
      expect(
        enumVersion.version,
        TestLogger.createApiTestFailMessage("version string mismatch")
      ).to.eq(EnumNextVersionString);
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should get latest version for enum name that doesn't exist`, async () => {
    const NonExistentName = "non-existent";
    try {
      const enumVersion: TopicAddressEnumVersion | undefined =
        await EpSdkEnumVersionsService.getLatestVersionForEnumName({
          applicationDomainId: ApplicationDomainId,
          enumName: NonExistentName,
        });
      expect(
        enumVersion,
        TestLogger.createApiTestFailMessage("enumVersion === undefined")
      ).to.be.undefined;
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

  it(`${scriptName}: should create 10 enum versions & get latest version string them using paging`, async () => {
    const PagingEnumName = "Paging-Enum";
    const EnumVersionQuantity = 10;
    const PageSize = 2;
    try {
      const enumResponse: TopicAddressEnumResponse =
        await EnumsService.createEnum({
          requestBody: {
            applicationDomainId: ApplicationDomainId,
            name: PagingEnumName,
            shared: false,
          },
        });
      EnumId = enumResponse.data.id;

      let EnumVersionString = "";
      for (let i = 0; i < EnumVersionQuantity; i++) {
        EnumVersionString = `3.0.${i}`;
        const topicAddressEnumVersion: TopicAddressEnumVersion =
          await EpSdkEnumVersionsService.createEnumVersion({
            enumId: EnumId,
            topicAddressEnumVersion: {
              enumId: EnumId,
              description: `enum version for enum = ${EnumName}, id=${EnumId}`,
              values: EnumValues,
              version: EnumVersionString,
            },
            targetLifecycleStateId: EpSdkStatesService.releasedId,
          });
      }
      // // DEBUG
      // expect(false, 'check 1000 enum versions created').to.be.true;
      const enumVersionList: Array<TopicAddressEnumVersion> =
        await EpSdkEnumVersionsService.getVersionsForEnumId({
          enumId: EnumId,
          pageSize: PageSize,
        });
      expect(
        enumVersionList.length,
        TestLogger.createApiTestFailMessage("failed")
      ).to.eq(EnumVersionQuantity);

      let latestEnumVersion: TopicAddressEnumVersion =
        await EpSdkEnumVersionsService.getLatestVersionForEnumId({
          enumId: EnumId,
          applicationDomainId: ApplicationDomainId,
        });
      expect(
        latestEnumVersion.version,
        TestLogger.createApiTestFailMessage("failed")
      ).to.eq(EnumVersionString);

      latestEnumVersion =
        await EpSdkEnumVersionsService.getLatestVersionForEnumName({
          enumName: PagingEnumName,
          applicationDomainId: ApplicationDomainId,
        });
      expect(
        latestEnumVersion.version,
        TestLogger.createApiTestFailMessage("failed")
      ).to.eq(EnumVersionString);

      const latestEnumVersionString: string =
        await EpSdkEnumVersionsService.getLatestVersionString({
          enumId: EnumId,
        });
      expect(
        latestEnumVersionString,
        TestLogger.createApiTestFailMessage("failed")
      ).to.eq(EnumVersionString);
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });
});
