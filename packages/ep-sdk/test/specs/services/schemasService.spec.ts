import "mocha";
import { expect } from "chai";
import path from "path";
import { TestContext, TestUtils } from "@internal/tools/src";
import { TestLogger, TestConfig, TestHelpers } from "../../lib";
import {
  ApiError,
  ApplicationDomainResponse,
  ApplicationDomainsService,
  SchemaObject,
  SchemaResponse,
  SchemasService,
} from "@solace-labs/ep-openapi-node";
import {
  EpSdkError,
  EpSdkServiceError,
  EpSdkApplicationDomainsService,
  EpSdkSchemasService,
  EEpSdkSchemaContentType,
  EEpSdkSchemaType,
} from "../../../src";

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId: string = TestUtils.getUUID();
let ApplicationDomainName: string;
let ApplicationDomainId: string | undefined;
let SchemaName: string;
let SchemaId: string | undefined;

const initializeGlobals = () => {
  ApplicationDomainName = `${TestConfig.getAppId()}/services/${TestSpecName}`;
  SchemaName = `${TestConfig.getAppId()}-services-${TestSpecName}`;
};

describe(`${scriptName}`, () => {
  before(async () => {
    initializeGlobals();
    TestContext.newItId();
    await TestHelpers.applicationDomainAbsent({ applicationDomainName: ApplicationDomainName });
    const applicationDomainResponse: ApplicationDomainResponse = await ApplicationDomainsService.createApplicationDomain({
    requestBody: {
      name: ApplicationDomainName,
    }});
    ApplicationDomainId = applicationDomainResponse.data.id;
  });

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async () => {
    TestContext.newItId();
    // delete application domain
    await EpSdkApplicationDomainsService.deleteById({applicationDomainId: ApplicationDomainId });
  });

  it(`${scriptName}: should create schema`, async () => {
    try {
      const schemaResponse: SchemaResponse = await SchemasService.createSchema({
        requestBody: {
          applicationDomainId: ApplicationDomainId,
          name: SchemaName,
          schemaType: EEpSdkSchemaType.JSON_SCHEMA,
          contentType: EEpSdkSchemaContentType.APPLICATION_JSON,
        },
      });
      SchemaId = schemaResponse.data.id;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should get schema by name`, async () => {
    try {
      const schemaObject: SchemaObject | undefined =
        await EpSdkSchemasService.getByName({
          applicationDomainId: ApplicationDomainId,
          schemaName: SchemaName,
        });
      expect(
        schemaObject,
        TestLogger.createApiTestFailMessage("schemaObject === undefined")
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

  it(`${scriptName}: should get schema by id`, async () => {
    try {
      const schemaObject: SchemaObject | undefined = await EpSdkSchemasService.getById({ schemaId: SchemaId });
      expect(schemaObject.id, TestLogger.createApiTestFailMessage("failed")).to.eq(SchemaId);
      expect(schemaObject.applicationDomainId, TestLogger.createApiTestFailMessage("failed")).to.eq(ApplicationDomainId);
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should delete schema by id`, async () => {
    try {
      const schemaObject: SchemaObject | undefined = await EpSdkSchemasService.deleteById({
        applicationDomainId: ApplicationDomainId,
        schemaId: SchemaId,
      });
      expect(
        schemaObject.id,
        TestLogger.createApiTestFailMessage("failed")
      ).to.eq(SchemaId);
      expect(
        schemaObject.applicationDomainId,
        TestLogger.createApiTestFailMessage("failed")
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

  it(`${scriptName}: should create schema`, async () => {
    try {
      const schemaResponse: SchemaResponse = await SchemasService.createSchema({
        requestBody: {
          applicationDomainId: ApplicationDomainId,
          name: SchemaName,
          schemaType: EEpSdkSchemaType.JSON_SCHEMA,
          contentType: EEpSdkSchemaContentType.APPLICATION_JSON,
        },
      });
      SchemaId = schemaResponse.data.id;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should delete schema by name`, async () => {
    try {
      const schemaObject: SchemaObject | undefined =
        await EpSdkSchemasService.deleteByName({
          applicationDomainId: ApplicationDomainId,
          schemaName: SchemaName,
        });
      expect(
        schemaObject.name,
        TestLogger.createApiTestFailMessage("failed")
      ).to.eq(SchemaName);
      expect(
        schemaObject.id,
        TestLogger.createApiTestFailMessage("failed")
      ).to.eq(SchemaId);
      expect(
        schemaObject.applicationDomainId,
        TestLogger.createApiTestFailMessage("failed")
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

  it(`${scriptName}: should catch delete schema by name that doesn't exist`, async () => {
    const NonExistentName = "non-existent";
    try {
      const schemaObject: SchemaObject | undefined =
        await EpSdkSchemasService.deleteByName({
          applicationDomainId: ApplicationDomainId,
          schemaName: NonExistentName,
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

  it(`${scriptName}: should catch delete schema by id that doesn't exist`, async () => {
    const NonExistentId = "non-existent";
    try {
      const schemaObject: SchemaObject | undefined =
        await EpSdkSchemasService.deleteById({
          applicationDomainId: ApplicationDomainId,
          schemaId: NonExistentId,
        });
      expect(false, TestLogger.createApiTestFailMessage("must never get here"))
        .to.be.true;
    } catch (e) {
      expect(
        e instanceof ApiError,
        TestLogger.createApiTestFailMessage("not ApiError")
      ).to.be.true;
      const apiError: ApiError = e;
      expect(
        apiError.status,
        TestLogger.createApiTestFailMessage("wrong status")
      ).to.eq(404);
    }
  });
});
