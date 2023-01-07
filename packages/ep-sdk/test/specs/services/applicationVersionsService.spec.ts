import 'mocha';
import { expect } from 'chai';
import path from 'path';
import { 
  ApiError, 
  Application, 
  ApplicationDomainResponse, 
  ApplicationDomainsService, 
  ApplicationResponse, 
  ApplicationsService,
  ApplicationVersion,
  ApplicationVersionResponse
} from '@rjgu/ep-openapi-node';
import {
  TestContext,
  TestUtils
} from '@internal/tools/src';
import { 
  TestLogger,
  TestConfig,
  TestHelpers,
} from '../../lib';
import { 
  EpSdkError,
  EpSdkServiceError,
  EpSdkApplicationVersionsService,
  EpSdkApplicationDomainsService,
  EpSdkStatesService
} from '../../../src';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
// const TestSpecId: string = TestUtils.getUUID();
let ApplicationDomainName: string;
let ApplicationDomainId: string | undefined;
let ApplicationName: string;
let ApplicationId: string | undefined;
const ApplicationVersionString = '1.0.0';
let ApplicationVersionId: string | undefined;
const ApplicationNextVersionString = '1.0.1';
let ApplicationNextVersionId: string | undefined;

const initializeGlobals = () => {
  ApplicationDomainName = `${TestConfig.getAppId()}/services/${TestSpecName}`;
  ApplicationName = `${TestConfig.getAppId()}-services-${TestSpecName}`;
}

describe(`${scriptName}`, () => {

  before(async() => {
    initializeGlobals();
    TestContext.newItId();
    await TestHelpers.applicationDomainAbsent({ applicationDomainName: ApplicationDomainName });
    const applicationDomainResponse: ApplicationDomainResponse = await ApplicationDomainsService.createApplicationDomain({
      requestBody: {
        name: ApplicationDomainName,
      }
    });
    ApplicationDomainId = applicationDomainResponse.data.id;

    const applicationResponse: ApplicationResponse = await ApplicationsService.createApplication({
      requestBody: {
        applicationDomainId: ApplicationDomainId,
        name: ApplicationName,
        applicationType: "standard",
        brokerType: Application.brokerType.SOLACE
      }
    });
    ApplicationId = applicationResponse.data.id;
  });

  beforeEach(() => {
    TestContext.newItId();
  });


  after(async() => {
    // delete application domain
    await EpSdkApplicationDomainsService.deleteById({ applicationDomainId: ApplicationDomainId });
  });

  it(`${scriptName}: should create application version`, async () => {
    try {

      const create: ApplicationVersion = {
        description: `application version for application = ${ApplicationName}, id=${ApplicationId}`,        
        version: ApplicationVersionString,
        applicationId: ApplicationId,
      };

      const created: ApplicationVersion = await EpSdkApplicationVersionsService.createApplicationVersion({
        applicationDomainId: ApplicationDomainId,
        applicationId: ApplicationId,
        applicationVersion: create,
        targetLifecycleStateId: EpSdkStatesService.releasedId
      });
      ApplicationVersionId = created.id;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should get application version by version`, async () => {
    try {
      const applicationVersion: ApplicationVersion = await EpSdkApplicationVersionsService.getVersionByVersion({ 
        applicationId: ApplicationId,
        applicationVersionString: ApplicationVersionString,
      });
      expect(applicationVersion.version, TestLogger.createApiTestFailMessage('version mismatch')).to.eq(ApplicationVersionString);
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should get application versions for application id`, async () => {
    try {
      const applicationVersionList: Array<ApplicationVersion> = await EpSdkApplicationVersionsService.getVersionsForApplicationId({ 
        applicationId: ApplicationId,
        stateId: EpSdkStatesService.releasedId
      });
      expect(applicationVersionList.length, TestLogger.createApiTestFailMessage('length not === 1')).to.eq(1);
      const applicationVersion: ApplicationVersion = applicationVersionList[0];
      expect(applicationVersion.id, TestLogger.createApiTestFailMessage('id mismatch')).to.eq(ApplicationVersionId);
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should get application versions for application name`, async () => {
    try {
      const applicationVersionList: Array<ApplicationVersion> = await EpSdkApplicationVersionsService.getVersionsForApplicationName({ 
        applicationDomainId: ApplicationDomainId,
        applicationName: ApplicationName 
      });
      expect(applicationVersionList.length, TestLogger.createApiTestFailMessage('length not === 1')).to.eq(1);
      const applicationVersion: ApplicationVersion = applicationVersionList[0];
      expect(applicationVersion.id, TestLogger.createApiTestFailMessage('id mismatch')).to.eq(ApplicationVersionId);
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should create new application version`, async () => {
    try {
      const create: ApplicationVersion = {
        description: `application version for application = ${ApplicationName}, id=${ApplicationId}`,        
        version: ApplicationNextVersionString,
        applicationId: ApplicationId
      };
      const created: ApplicationVersion = await EpSdkApplicationVersionsService.createApplicationVersion({
        applicationDomainId: ApplicationDomainId,
        applicationId: ApplicationId,
        applicationVersion: create,
        targetLifecycleStateId: EpSdkStatesService.releasedId
      });
      ApplicationNextVersionId = created.id;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should get latest version string`, async () => {
    try {
      const latestVersionString: string = await EpSdkApplicationVersionsService.getLatestVersionString({ applicationId: ApplicationId });
      expect(latestVersionString, TestLogger.createApiTestFailMessage('version string mismatch')).to.eq(ApplicationNextVersionString);
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should get latest version for application id`, async () => {
    try {
      const applicationVersion: ApplicationVersion = await EpSdkApplicationVersionsService.getLatestVersionForApplicationId({ 
        applicationDomainId: ApplicationDomainId,
        applicationId: ApplicationId 
      });
      expect(applicationVersion.version, TestLogger.createApiTestFailMessage('version string mismatch')).to.eq(ApplicationNextVersionString);
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should get latest version for application name`, async () => {
    try {
      const applicationVersion: ApplicationVersion | undefined = await EpSdkApplicationVersionsService.getLatestVersionForApplicationName({ 
        applicationDomainId: ApplicationDomainId,
        applicationName: ApplicationName
      });
      expect(applicationVersion, TestLogger.createApiTestFailMessage('applicationVersion === undefined')).to.not.be.undefined;
      expect(applicationVersion.version, TestLogger.createApiTestFailMessage('version string mismatch')).to.eq(ApplicationNextVersionString);
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should get latest version for application name that doesn't exist`, async () => {
    const NonExistentName = 'non-existent';
    try {
      const applicationVersion: ApplicationVersion | undefined = await EpSdkApplicationVersionsService.getLatestVersionForApplicationName({ 
        applicationDomainId: ApplicationDomainId,
        applicationName: NonExistentName
      });
      expect(applicationVersion, TestLogger.createApiTestFailMessage('applicationVersion !== undefined')).to.be.undefined;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkServiceError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      const epSdkServiceError: EpSdkServiceError = e;
      expect(epSdkServiceError.toString(), TestLogger.createApiTestFailMessage(`error does not contain ${NonExistentName}`)).to.contain(NonExistentName);
    }
  });

  it(`${scriptName}: should create 10 application versions & get latest version string them using paging`, async () => {
    const PagingName = 'Paging-Object';
    const VersionQuantity = 10;
    const PageSize = 2;
    try {
      const response: ApplicationResponse = await ApplicationsService.createApplication({
        requestBody: {
          applicationDomainId: ApplicationDomainId,
          name: PagingName,
          applicationType: "standard",
          brokerType: Application.brokerType.SOLACE
        }
      });
      ApplicationId = response.data.id;

      let VersionString = '';
      for(let i=0; i<VersionQuantity; i++) {
        VersionString = `3.0.${i}`;
        const versionResponse: ApplicationVersionResponse = await ApplicationsService.createApplicationVersionForApplication({
          applicationId: ApplicationId,
          requestBody: {
            description: 'paging version',
            version: VersionString,
            applicationId: ApplicationId
          }
        });
      }
      // // DEBUG
      // expect(false, 'check 1000 enum versions created').to.be.true;
      const versionList: Array<ApplicationVersion> = await EpSdkApplicationVersionsService.getVersionsForApplicationId({ 
        applicationId: ApplicationId,
      });
      expect(versionList.length, TestLogger.createApiTestFailMessage('failed')).to.eq(VersionQuantity);

      let latestObjectVersion: ApplicationVersion = await EpSdkApplicationVersionsService.getLatestVersionForApplicationId({ applicationId: ApplicationId, applicationDomainId: ApplicationDomainId });
      expect(latestObjectVersion.version, TestLogger.createApiTestFailMessage('failed')).to.eq(VersionString);

      latestObjectVersion = await EpSdkApplicationVersionsService.getLatestVersionForApplicationName({ applicationName: PagingName, applicationDomainId: ApplicationDomainId });
      expect(latestObjectVersion.version, TestLogger.createApiTestFailMessage('failed')).to.eq(VersionString);

      const latestObjectVersionString: string = await EpSdkApplicationVersionsService.getLatestVersionString({ applicationId: ApplicationId });
      expect(latestObjectVersionString, TestLogger.createApiTestFailMessage('failed')).to.eq(VersionString);

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

});

