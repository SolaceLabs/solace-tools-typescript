import "mocha";
import { expect } from "chai";
import path from "path";
import {
  ApiError,
  ApplicationDomain,
  ApplicationDomainResponse,
  ApplicationDomainsResponse,
  ApplicationDomainsService,
  EventsService,
  OpenAPI
} from "@solace-labs/ep-openapi-node";
import { TestContext, TestUtils } from "@internal/tools/src";
import { TestLogger, TestConfig, TestHelpers } from "../../lib";
import {
  EpSdkError,
  EpSdkValidateApplicationDomains,
  TEpSdkPermissionResources,
  TEpSdkPermissionValidationLogEntry,
  EEpSdkPermissions,
  TEpSdkPermissionResult,
  EpSdkValidationLog,
  EpSdkValidateEvents
} from "../../../src";

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId: string = TestUtils.getUUID();

// test globals
// let ApplicationDomainName: string;
// let ApplicationDomainId: string | undefined;
// let ApplicationDomainIdList: Array<string> = [];

// const recordApplicationDomainId = (applicationDomainId: string) => {
//   ApplicationDomainId = applicationDomainId;
//   ApplicationDomainIdList.push(applicationDomainId);
// };

const initializeGlobals = () => {
  // ApplicationDomainName = `${TestConfig.getAppId()}/services/${TestSpecName}`;
};

describe(`${scriptName}`, () => {
  before(async () => {
    TestContext.newItId();
    initializeGlobals();
    // const xvoid: void = await TestHelpers.applicationDomainAbsent({
    //   applicationDomainName: ApplicationDomainName,
    // });
  });

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async () => {
    TestContext.newItId();
    // // delete all recorded application domains
    // for (const applicationDomainId of ApplicationDomainIdList) {
    //   try {
    //     await EpSdkApplicationDomainsService.deleteById({
    //       applicationDomainId: applicationDomainId,
    //     });
    //   } catch (e) {}
    // }
    // const xvoid: void = await TestHelpers.applicationDomainAbsent({
    //   applicationDomainName: ApplicationDomainName,
    // });
  });

  it(`${scriptName}: should reset validation log`, async () => {
    EpSdkValidationLog.resetValidationLog();
    expect(EpSdkValidationLog.getValidationLog().length, 'not empty validation log').to.equal(0);
  });

  it(`${scriptName}: should validate application domains READ`, async () => {
    try {
      // no access
      await EpSdkValidateApplicationDomains.validateReadPermissions({
        globalOpenAPI: OpenAPI,
        token: TestConfig.getConfig().tokens.noPermissions,
      });
      const logEntry: TEpSdkPermissionValidationLogEntry | undefined = EpSdkValidationLog.getValidationLogEntry(TEpSdkPermissionResources.ApplicationDomains);
      expect(logEntry, TestLogger.createLogMessage('logEntry', logEntry)).to.not.be.undefined;
      const permissionResult: TEpSdkPermissionResult | undefined = EpSdkValidationLog.getValidationPermissionResult(TEpSdkPermissionResources.ApplicationDomains, EEpSdkPermissions.READ);
      expect(permissionResult, TestLogger.createLogMessage('permissionResult', logEntry)).to.not.be.undefined;
      expect(permissionResult.access, TestLogger.createLogMessage('permissionResult.access', logEntry)).to.be.false;
      // // DEBUG
      // expect(false, TestLogger.createLogMessage('debug', { validationLog: EpSdkValidateTokenPermissionsService.getValidationLog()})).to.be.true;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed", e)).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
    try {
      //  yes access
      await EpSdkValidateApplicationDomains.validateReadPermissions({
        globalOpenAPI: OpenAPI,
        token: TestConfig.getConfig().tokens.allPermissions,
      });
      const logEntry: TEpSdkPermissionValidationLogEntry | undefined = EpSdkValidationLog.getValidationLogEntry(TEpSdkPermissionResources.ApplicationDomains);
      expect(logEntry, TestLogger.createLogMessage('logEntry', logEntry)).to.not.be.undefined;
      const permissionResult: TEpSdkPermissionResult | undefined = EpSdkValidationLog.getValidationPermissionResult(TEpSdkPermissionResources.ApplicationDomains, EEpSdkPermissions.READ);
      expect(permissionResult, TestLogger.createLogMessage('permissionResult', logEntry)).to.not.be.undefined;
      expect(permissionResult.access, TestLogger.createLogMessage('permissionResult.access', logEntry)).to.be.true;
      // // DEBUG
      // expect(false, TestLogger.createLogMessage('debug', { validationLog: EpSdkValidateTokenPermissionsService.getValidationLog()})).to.be.true;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed", e)).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should validate application domains WRITE & DELETE`, async () => {
    try {
      // no access
      await EpSdkValidateApplicationDomains.validateWriteDeletePermissions({
        globalOpenAPI: OpenAPI,
        token: TestConfig.getConfig().tokens.noApplicationDomains,
      });
      const logEntry: TEpSdkPermissionValidationLogEntry | undefined = EpSdkValidationLog.getValidationLogEntry(TEpSdkPermissionResources.ApplicationDomains);
      expect(logEntry, TestLogger.createLogMessage('logEntry', logEntry)).to.not.be.undefined;

      const writePermissionResult: TEpSdkPermissionResult | undefined = EpSdkValidationLog.getValidationPermissionResult(TEpSdkPermissionResources.ApplicationDomains, EEpSdkPermissions.WRITE);
      expect(writePermissionResult, TestLogger.createLogMessage('writePermissionResult', writePermissionResult)).to.not.be.undefined;
      expect(writePermissionResult.access, TestLogger.createLogMessage('writePermissionResult.access', writePermissionResult)).to.be.false;

      const deletePermissionResult: TEpSdkPermissionResult | undefined = EpSdkValidationLog.getValidationPermissionResult(TEpSdkPermissionResources.ApplicationDomains, EEpSdkPermissions.DELETE);
      expect(deletePermissionResult, TestLogger.createLogMessage('deletePermissionResult', deletePermissionResult)).to.not.be.undefined;
      expect(deletePermissionResult.access, TestLogger.createLogMessage('deletePermissionResult.access', deletePermissionResult)).to.be.false;
      // // DEBUG
      // expect(false, TestLogger.createLogMessage('debug', { validationLog: EpSdkValidateTokenPermissionsService.getValidationLog()})).to.be.true;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed", e)).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
    try {
      // yes access
      await EpSdkValidateApplicationDomains.validateWriteDeletePermissions({
        globalOpenAPI: OpenAPI,
        token: TestConfig.getConfig().tokens.allPermissions,
      });
      const logEntry: TEpSdkPermissionValidationLogEntry | undefined = EpSdkValidationLog.getValidationLogEntry(TEpSdkPermissionResources.ApplicationDomains);
      expect(logEntry, TestLogger.createLogMessage('logEntry', logEntry)).to.not.be.undefined;

      const writePermissionResult: TEpSdkPermissionResult | undefined = EpSdkValidationLog.getValidationPermissionResult(TEpSdkPermissionResources.ApplicationDomains, EEpSdkPermissions.WRITE);
      expect(writePermissionResult, TestLogger.createLogMessage('writePermissionResult', writePermissionResult)).to.not.be.undefined;
      expect(writePermissionResult.access, TestLogger.createLogMessage('writePermissionResult.access', writePermissionResult)).to.be.true;

      const deletePermissionResult: TEpSdkPermissionResult | undefined = EpSdkValidationLog.getValidationPermissionResult(TEpSdkPermissionResources.ApplicationDomains, EEpSdkPermissions.DELETE);
      expect(deletePermissionResult, TestLogger.createLogMessage('deletePermissionResult', deletePermissionResult)).to.not.be.undefined;
      expect(deletePermissionResult.access, TestLogger.createLogMessage('deletePermissionResult.access', deletePermissionResult)).to.be.true;
      // // DEBUG
      // expect(false, TestLogger.createLogMessage('debug', { validationLog: EpSdkValidateTokenPermissionsService.getValidationLog()})).to.be.true;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed", e)).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should validate events READ: no access`, async () => {
    const resource = TEpSdkPermissionResources.Events;
    try {
      // no access
      await EpSdkValidateEvents.validateReadPermissions({
        globalOpenAPI: OpenAPI,
        token: TestConfig.getConfig().tokens.noPermissions,
      });
      const logEntry: TEpSdkPermissionValidationLogEntry | undefined = EpSdkValidationLog.getValidationLogEntry(resource);
      expect(logEntry, TestLogger.createLogMessage('logEntry', logEntry)).to.not.be.undefined;
      const permissionResult: TEpSdkPermissionResult | undefined = EpSdkValidationLog.getValidationPermissionResult(resource, EEpSdkPermissions.READ);
      expect(permissionResult, TestLogger.createLogMessage('permissionResult', logEntry)).to.not.be.undefined;
      expect(permissionResult.access, TestLogger.createLogMessage('permissionResult.access', logEntry)).to.be.false;
      // // DEBUG
      // expect(false, TestLogger.createLogMessage('debug', { validationLog: EpSdkValidateTokenPermissionsService.getValidationLog()})).to.be.true;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed", e)).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should read events - test token reset`, async () => {
    try {
      await EventsService.getEvents({ pageSize: 1 });
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed", e)).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should validate events READ: yes access`, async () => {
    const resource = TEpSdkPermissionResources.Events;
    try {
      //  yes access
      await EpSdkValidateEvents.validateReadPermissions({
        globalOpenAPI: OpenAPI,
        token: TestConfig.getConfig().tokens.allPermissions,
      });
      const logEntry: TEpSdkPermissionValidationLogEntry | undefined = EpSdkValidationLog.getValidationLogEntry(resource);
      expect(logEntry, TestLogger.createLogMessage('logEntry', logEntry)).to.not.be.undefined;
      const permissionResult: TEpSdkPermissionResult | undefined = EpSdkValidationLog.getValidationPermissionResult(resource, EEpSdkPermissions.READ);
      expect(permissionResult, TestLogger.createLogMessage('permissionResult', logEntry)).to.not.be.undefined;
      expect(permissionResult.access, TestLogger.createLogMessage('permissionResult.access', logEntry)).to.be.true;
      // // DEBUG
      // expect(false, TestLogger.createLogMessage('debug', { validationLog: EpSdkValidateTokenPermissionsService.getValidationLog()})).to.be.true;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed", e)).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

});
