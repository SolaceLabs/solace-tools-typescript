import "mocha";
import { expect } from "chai";
import path from "path";
import { TestContext, TestUtils } from "@internal/tools/src";
import { TestLogger, TestConfig } from "../../lib";
import {
  ApiError,
  ApplicationDomainResponse,
  ApplicationDomainsService,
  SchemaResponse,
  SchemasService,
  SchemaVersion,
  SchemaVersionResponse,
} from "@solace-labs/ep-openapi-node";
import {
  EpSdkError,
  EpSdkServiceError,
  EpSdkApplicationDomainsService,
  EEpSdkSchemaContentType,
  EEpSdkSchemaType,
  EpSdkStatesService,
  EpSdkSchemaVersionsService,
} from "../../../src";

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId: string = TestUtils.getUUID();
let ApplicationDomainName: string;
let ApplicationDomainId: string | undefined;
let SchemaName: string;
let SchemaId: string | undefined;
const SchemaVersionString = "1.0.0";
let SchemaVersionId: string | undefined;
const SchemaNextVersionString = "1.0.1";
let SchemaNextVersionId: string | undefined;

const initializeGlobals = () => {
  ApplicationDomainName = `${TestConfig.getAppId()}/services/${TestSpecName}`;
  SchemaName = `${TestConfig.getAppId()}-services-${TestSpecName}`;
};

describe(`${scriptName}`, () => {
  before(async () => {
    initializeGlobals();
    TestContext.newItId();
    const applicationDomainResponse: ApplicationDomainResponse =
      await ApplicationDomainsService.createApplicationDomain({
        requestBody: {
          name: ApplicationDomainName,
        },
      });
    ApplicationDomainId = applicationDomainResponse.data.id;

    const schemaResponse: SchemaResponse = await SchemasService.createSchema({
      requestBody: {
        applicationDomainId: ApplicationDomainId,
        name: SchemaName,
        schemaType: EEpSdkSchemaType.JSON_SCHEMA,
        contentType: EEpSdkSchemaContentType.APPLICATION_JSON,
      },
    });
    SchemaId = schemaResponse.data.id;
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

  it(`${scriptName}: should create schema version`, async () => {
    try {
      const create: SchemaVersion = {
        schemaId: SchemaId,
        description: `schema version for schema = ${SchemaName}, id=${SchemaId}`,
        version: SchemaVersionString,
      };

      const created: SchemaVersion =
        await EpSdkSchemaVersionsService.createSchemaVersion({
          applicationDomainId: ApplicationDomainId,
          schemaId: SchemaId,
          schemaVersion: create,
          targetLifecycleStateId: EpSdkStatesService.releasedId,
        });
      SchemaVersionId = created.id;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should get schema version by version`, async () => {
    try {
      const schemaVersion: SchemaVersion =
        await EpSdkSchemaVersionsService.getVersionByVersion({
          schemaId: SchemaId,
          schemaVersionString: SchemaVersionString,
        });
      expect(
        schemaVersion.version,
        TestLogger.createApiTestFailMessage("version mismatch")
      ).to.eq(SchemaVersionString);
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should get schema versions for schema id`, async () => {
    try {
      const schemaVersionList: Array<SchemaVersion> =
        await EpSdkSchemaVersionsService.getVersionsForSchemaId({
          schemaId: SchemaId,
        });
      expect(
        schemaVersionList.length,
        TestLogger.createApiTestFailMessage("length not === 1")
      ).to.eq(1);
      const schemaVersion: SchemaVersion = schemaVersionList[0];
      expect(
        schemaVersion.id,
        TestLogger.createApiTestFailMessage("id mismatch")
      ).to.eq(SchemaVersionId);
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should get schema versions for schema name`, async () => {
    try {
      const schemaVersionList: Array<SchemaVersion> =
        await EpSdkSchemaVersionsService.getVersionsForSchemaName({
          applicationDomainId: ApplicationDomainId,
          schemaName: SchemaName,
        });
      expect(
        schemaVersionList.length,
        TestLogger.createApiTestFailMessage("length not === 1")
      ).to.eq(1);
      const schemaVersion: SchemaVersion = schemaVersionList[0];
      expect(
        schemaVersion.id,
        TestLogger.createApiTestFailMessage("id mismatch")
      ).to.eq(SchemaVersionId);
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should create new schema version`, async () => {
    try {
      const create: SchemaVersion = {
        schemaId: SchemaId,
        description: `schema version for schema = ${SchemaName}, id=${SchemaId}`,
        version: SchemaNextVersionString,
      };
      const created: SchemaVersion =
        await EpSdkSchemaVersionsService.createSchemaVersion({
          applicationDomainId: ApplicationDomainId,
          schemaId: SchemaId,
          schemaVersion: create,
          targetLifecycleStateId: EpSdkStatesService.releasedId,
        });
      SchemaNextVersionId = created.id;
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
        await EpSdkSchemaVersionsService.getLatestVersionString({
          schemaId: SchemaId,
        });
      expect(
        latestVersionString,
        TestLogger.createApiTestFailMessage("version string mismatch")
      ).to.eq(SchemaNextVersionString);
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should get latest version for schema id`, async () => {
    try {
      const schemaVersion: SchemaVersion =
        await EpSdkSchemaVersionsService.getLatestVersionForSchemaId({
          applicationDomainId: ApplicationDomainId,
          schemaId: SchemaId,
        });
      expect(
        schemaVersion.version,
        TestLogger.createApiTestFailMessage("version string mismatch")
      ).to.eq(SchemaNextVersionString);
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should get latest version for schema name`, async () => {
    try {
      const schemaVersion: SchemaVersion | undefined =
        await EpSdkSchemaVersionsService.getLatestVersionForSchemaName({
          applicationDomainId: ApplicationDomainId,
          schemaName: SchemaName,
        });
      expect(
        schemaVersion,
        TestLogger.createApiTestFailMessage("schemaVersion === undefined")
      ).to.not.be.undefined;
      expect(
        schemaVersion.version,
        TestLogger.createApiTestFailMessage("version string mismatch")
      ).to.eq(SchemaNextVersionString);
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should get latest version for schema name that doesn't exist`, async () => {
    const NonExistentName = "non-existent";
    try {
      const schemaVersion: SchemaVersion | undefined =
        await EpSdkSchemaVersionsService.getLatestVersionForSchemaName({
          applicationDomainId: ApplicationDomainId,
          schemaName: NonExistentName,
        });
      expect(
        schemaVersion,
        TestLogger.createApiTestFailMessage("schemaVersion !== undefined")
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

  it(`${scriptName}: should create 10 schema versions & get latest version string them using paging`, async () => {
    const PagingName = "Paging-Object";
    const VersionQuantity = 10;
    const PageSize = 2;
    try {
      const response: SchemaResponse = await SchemasService.createSchema({
        requestBody: {
          applicationDomainId: ApplicationDomainId,
          name: PagingName,
          shared: false,
          schemaType: EEpSdkSchemaType.JSON_SCHEMA,
          contentType: EEpSdkSchemaContentType.APPLICATION_JSON,
        },
      });
      SchemaId = response.data.id;

      let VersionString = "";
      for (let i = 0; i < VersionQuantity; i++) {
        VersionString = `3.0.${i}`;
        const versionResponse: SchemaVersionResponse =
          await SchemasService.createSchemaVersionForSchema({
            schemaId: SchemaId,
            requestBody: {
              schemaId: SchemaId,
              description: "paging version",
              version: VersionString,
            },
          });
      }
      // // DEBUG
      // expect(false, 'check 1000 enum versions created').to.be.true;
      const versionList: Array<SchemaVersion> =
        await EpSdkSchemaVersionsService.getVersionsForSchemaId({
          schemaId: SchemaId,
          pageSize: PageSize,
        });
      expect(
        versionList.length,
        TestLogger.createApiTestFailMessage("failed")
      ).to.eq(VersionQuantity);

      let latestObjectVersion: SchemaVersion =
        await EpSdkSchemaVersionsService.getLatestVersionForSchemaId({
          schemaId: SchemaId,
          applicationDomainId: ApplicationDomainId,
        });
      expect(
        latestObjectVersion.version,
        TestLogger.createApiTestFailMessage("failed")
      ).to.eq(VersionString);

      latestObjectVersion =
        await EpSdkSchemaVersionsService.getLatestVersionForSchemaName({
          schemaName: PagingName,
          applicationDomainId: ApplicationDomainId,
        });
      expect(
        latestObjectVersion.version,
        TestLogger.createApiTestFailMessage("failed")
      ).to.eq(VersionString);

      const latestObjectVersionString: string =
        await EpSdkSchemaVersionsService.getLatestVersionString({
          schemaId: SchemaId,
        });
      expect(
        latestObjectVersionString,
        TestLogger.createApiTestFailMessage("failed")
      ).to.eq(VersionString);
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
