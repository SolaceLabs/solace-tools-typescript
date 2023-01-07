import 'mocha';
import { expect } from 'chai';
import path from 'path';
import {
  TestContext,
  TestUtils
} from '@internal/tools/src';
import {
  TestLogger,
  TestConfig,
  TestHelpers
} from '../../lib';
import { 
  ApiError, 
  ApplicationDomainResponse, 
  ApplicationDomainsService, 
  EnumsService,
  TopicAddressEnum,
  TopicAddressEnumResponse,
  TopicAddressEnumValue,
  TopicAddressEnumVersion,
  TopicAddressEnumVersionResponse, 
} from '../../../generated-src';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId = TestUtils.getUUID();

let ApplicationDomainName: string;
let ApplicationDomainId: string;

let EnumName: string;
let EnumId: string;

let EnumVersionName: string;
let EnumVersionId: string;

const initializeGlobals = () => {
  ApplicationDomainName = `${TestConfig.getAppId()}/${TestSpecName}`;
  EnumName = `${TestConfig.getAppId()}/${TestSpecName}`;
  EnumVersionName = `${TestConfig.getAppId()}/${TestSpecName}`;
}

describe(`${scriptName}`, () => {

  before(async() => {
    TestContext.newItId();
    initializeGlobals();
    const xvoid: void = await TestHelpers.applicationDomainAbsent({ applicationDomainName: ApplicationDomainName });
  });

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async() => {
    TestContext.newItId();
    const xvoid: void = await TestHelpers.applicationDomainAbsent({ applicationDomainName: ApplicationDomainName });
  });

  it(`${scriptName}: should create application domain`, async () => {
    try {
      const applicationDomainResponse: ApplicationDomainResponse = await ApplicationDomainsService.createApplicationDomain({
        requestBody: {
          name: ApplicationDomainName,
        }
      });
      expect(applicationDomainResponse.data.id, TestLogger.createApiTestFailMessage('failed')).to.not.be.undefined;
      ApplicationDomainId = applicationDomainResponse.data.id;
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should create enum`, async () => {
    try {

      const topicAddressEnumResponse: TopicAddressEnumResponse = await EnumsService.createEnum({
          requestBody: {
            applicationDomainId: ApplicationDomainId,
            name: EnumName,
            shared: false
          }
      });
      const data: TopicAddressEnum | undefined = topicAddressEnumResponse.data;
      expect(data, TestLogger.createApiTestFailMessage('failed')).to.not.be.undefined;
      expect(data.id, TestLogger.createApiTestFailMessage('failed')).to.not.be.undefined;
      EnumId = data.id;
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should create enum version`, async () => {
    try {
      const values: Array<TopicAddressEnumValue> = [
        { label: 'one', value: 'one' },
        { label: 'two', value: 'two' }
      ];
      const requestBody: TopicAddressEnumVersion = {
        enumId: EnumId,
        version: '1.0.0',
        displayName: 'displayName',
        values: values
      };
      const topicAddressEnumVersionResponse: TopicAddressEnumVersionResponse = await EnumsService.createEnumVersionForEnum({
        enumId: EnumId,
        requestBody: requestBody,
      });
      const data: TopicAddressEnumVersion | undefined = topicAddressEnumVersionResponse.data;
      expect(data, TestLogger.createApiTestFailMessage('failed')).to.not.be.undefined;
      expect(data.id, TestLogger.createApiTestFailMessage('failed')).to.not.be.undefined;
      EnumVersionId = data.id;
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
    }
  });

});

