import 'mocha';
import { expect } from 'chai';
import path from 'path';
import { 
  ApiError, 
  ApplicationDomainResponse, 
  ApplicationDomainsService, 
  EnumsService, 
  TopicAddressEnum, 
  TopicAddressEnumResponse
} from '@rjgu/ep-openapi-node';
import {
  TestContext,
  TestUtils
} from '@internal/tools/src';
import { 
  TestLogger,
  TestConfig,
} from '../../lib';
import { 
  EpSdkError,
  EpSdkServiceError,
  EpSdkEnumsService,
  EpSdkApplicationDomainsService,
} from '../../../src';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId: string = TestUtils.getUUID();
let ApplicationDomainName: string;
let ApplicationDomainId: string | undefined;
let EnumName: string;
let EnumId: string | undefined;

const initializeGlobals = () => {
  ApplicationDomainName = `${TestConfig.getAppId()}/services/${TestSpecName}`;
  EnumName = `${TestConfig.getAppId()}-services-${TestSpecId}`;
}

describe(`${scriptName}`, () => {

  before(() => {
    initializeGlobals();
  });

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async() => {
    TestContext.newItId();
    // delete application domain
    await EpSdkApplicationDomainsService.deleteById({ applicationDomainId: ApplicationDomainId });
  });

  it(`${scriptName}: should create application domain`, async () => {
    try {
      const applicationDomainResponse: ApplicationDomainResponse = await ApplicationDomainsService.createApplicationDomain({
        requestBody: {
          name: ApplicationDomainName,
        }
      });
      ApplicationDomainId = applicationDomainResponse.data.id;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should create enum`, async () => {
    try {
      const enumResponse: TopicAddressEnumResponse = await EnumsService.createEnum({
        requestBody: {
          applicationDomainId: ApplicationDomainId,
          name: EnumName,
          shared: false
        }
      });
      EnumId = enumResponse.data.id;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should get enum by name`, async () => {
    try {
      const epEnum: TopicAddressEnum | undefined = await EpSdkEnumsService.getByName({ applicationDomainId: ApplicationDomainId, enumName: EnumName });
      expect(epEnum, TestLogger.createApiTestFailMessage('epEnum === undefined')).to.not.be.undefined;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should get enum by id`, async () => {
    try {
      const epEnum: TopicAddressEnum = await EpSdkEnumsService.getById({ applicationDomainId: ApplicationDomainId, enumId: EnumId });
      expect(epEnum.id, TestLogger.createApiTestFailMessage(`epEnum.id !== ${EnumId}`)).to.eq(EnumId);
      expect(epEnum.applicationDomainId, TestLogger.createApiTestFailMessage(`applicationDomainId !== ${ApplicationDomainId}`)).to.eq(ApplicationDomainId);
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should delete enum by id`, async () => {
    try {
      const epEnum: TopicAddressEnum = await EpSdkEnumsService.deleteById({ applicationDomainId: ApplicationDomainId, enumId: EnumId });
      expect(epEnum.id, TestLogger.createApiTestFailMessage(`epEnum.id !== ${EnumId}`)).to.eq(EnumId);
      expect(epEnum.applicationDomainId, TestLogger.createApiTestFailMessage(`applicationDomainId !== ${ApplicationDomainId}`)).to.eq(ApplicationDomainId);
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should create enum`, async () => {
    try {
      const enumResponse: TopicAddressEnumResponse = await EnumsService.createEnum({
        requestBody: {
          applicationDomainId: ApplicationDomainId,
          name: EnumName,
          shared: false
        }
      });
      EnumId = enumResponse.data.id;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should delete enum by name`, async () => {
    try {
      const epEnum: TopicAddressEnum = await EpSdkEnumsService.deleteByName({ applicationDomainId: ApplicationDomainId, enumName: EnumName });
      expect(epEnum.name, TestLogger.createApiTestFailMessage(`epEnum.name !== ${EnumName}`)).to.eq(EnumName);
      expect(epEnum.id, TestLogger.createApiTestFailMessage(`epEnum.id !== ${EnumId}`)).to.eq(EnumId);
      expect(epEnum.applicationDomainId, TestLogger.createApiTestFailMessage(`applicationDomainId !== ${ApplicationDomainId}`)).to.eq(ApplicationDomainId);
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should catch delete enum by name that doesn't exist`, async () => {
    const NonExistentName = 'non-existent';
    try {
      const epEnum: TopicAddressEnum = await EpSdkEnumsService.deleteByName({ applicationDomainId: ApplicationDomainId, enumName: NonExistentName });
      expect(false, TestLogger.createApiTestFailMessage('must never get here')).to.be.true;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkServiceError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      const epSdkServiceError: EpSdkServiceError = e;
      expect(epSdkServiceError.toString(), TestLogger.createApiTestFailMessage(`error does not contain ${NonExistentName}`)).to.contain(NonExistentName);
    }
  });

});

