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
  TopicAddressEnumVersionsResponse, 
} from '../../../generated-src';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId = TestUtils.getUUID();

let ApplicationDomainName: string;
let ApplicationDomainId: string;

let EnumName: string;
let EnumId: string;

const EnumVersionNameBase = TestUtils.getUUID();
const topicAddressEnumValueList: Array<TopicAddressEnumValue> = [
  { label: 'one', value: 'one' },
  { label: 'two', value: 'two' }
];
const EnumVersionStringBase = '1.0.0';
const EnumVersionQuantity = 10;
const generateEnumVersionName = (i: number): string => {
  const iStr: string = String(i).padStart(3, '0');
  const enumVersionName = `${EnumVersionNameBase}-${iStr}`;
  return enumVersionName;
}
const generateEnumVersionString = (i: number): string => {
  const enumVersionString: string = `1.0.${i}`;
  return enumVersionString;
}

const initializeGlobals = () => {
  ApplicationDomainName = `${TestConfig.getAppId()}/${TestSpecName}`;
  EnumName = `${TestConfig.getAppId()}/${TestSpecName}`;
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

  it(`${scriptName}: should create enum versions`, async () => {
    try {
      for(let i=0; i<EnumVersionQuantity; i++) {
        const enumVersionName = generateEnumVersionName(i);
        const enumVersionString = generateEnumVersionString(i);
        const requestBody: TopicAddressEnumVersion = {
          enumId: EnumId,
          version: enumVersionString,
          displayName: 'displayName',
          values: topicAddressEnumValueList
        };
        const topicAddressEnumVersionResponse: TopicAddressEnumVersionResponse = await EnumsService.createEnumVersionForEnum({
          enumId: EnumId,
          requestBody: requestBody,
        });
        expect(topicAddressEnumVersionResponse.data.id, TestLogger.createApiTestFailMessage('failed')).to.not.be.undefined;
        expect(topicAddressEnumVersionResponse.data.version, TestLogger.createApiTestFailMessage('failed')).to.eq(enumVersionString);
        // EnumVersionId = enumVersionResponse.data.id;    
      }
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should get all enum versions with paging`, async () => {
    const PageSize = 2;
    try {
      const topicAddressEnumVersionList: Array<TopicAddressEnumVersion> = [];
      let nextPage: number | null = 1;
      while(nextPage !== null) {

        const topicAddressEnumVersionsResponse: TopicAddressEnumVersionsResponse = await EnumsService.getEnumVersionsForEnum({
          enumId: EnumId,
          pageSize: PageSize,
          pageNumber: nextPage
        });
        expect(topicAddressEnumVersionsResponse.data, TestLogger.createApiTestFailMessage('failed')).to.not.be.undefined;
        topicAddressEnumVersionList.push(...topicAddressEnumVersionsResponse.data);
        if(PageSize <= EnumVersionQuantity) expect(topicAddressEnumVersionsResponse.data.length, TestLogger.createApiTestFailMessage('failed')).to.eq(PageSize);
        else expect(topicAddressEnumVersionsResponse.data.length, TestLogger.createApiTestFailMessage('failed')).to.eq(EnumVersionQuantity);
        if(topicAddressEnumVersionsResponse.meta === undefined) throw new Error('enumVersionsResponse.meta === undefined');
        // const meta: T_EpMeta = topicAddressEnumVersionsResponse.meta as T_EpMeta;
        // console.log(`meta=${JSON.stringify(meta, null, 2)}`);
        // TestEpApiHelpers.validateMeta(meta);
        const meta = topicAddressEnumVersionsResponse.meta;
        expect(meta.pagination.count, TestLogger.createApiTestFailMessage('failed')).to.eq(EnumVersionQuantity);
        
        nextPage = meta.pagination.nextPage;
      }

      expect(topicAddressEnumVersionList.length, 'failed').to.eq(EnumVersionQuantity);
      
      // DEBUG
      // expect(false, 'check meta response').to.be.true;

    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
    }
  });

});

