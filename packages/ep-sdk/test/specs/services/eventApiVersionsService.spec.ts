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
  TestHelpers,
} from '../../lib';
import { 
  ApiError, 
  ApplicationDomainResponse, 
  ApplicationDomainsService, 
  EventApi, 
  EventApiResponse, 
  EventApIsService, 
  EventApiVersion,
  EventApiVersionResponse,
  EventVersion,
} from '@rjgu/ep-openapi-node';
import { 
  EpSdkError,
  EpSdkServiceError,
  EpSdkValidationError,
  EpSdkApplicationDomainsService,
  EpSdkStatesService,
  EpSdkEventApiVersionsService,
  EpSdkEventApiAndVersion,
} from '../../../src';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId: string = TestUtils.getUUID();
let ApplicationDomainName: string;
let ApplicationDomainId: string | undefined;

const EventApiName = `${TestSpecId}`;
let EventApiId: string | undefined;
const EventApiVersionString = '1.1.1';
let EventApiVersionId: string | undefined;
const EventApiNextVersionString = '1.1.2';
let EventApiNextVersionId: string | undefined;

const initializeGlobals = () => {
  ApplicationDomainName = `${TestConfig.getAppId()}/services/${TestSpecName}`;
}

describe(`${scriptName}`, () => {

  before(async() => {
    initializeGlobals();
    TestContext.newItId();
    const applicationDomainResponse: ApplicationDomainResponse = await ApplicationDomainsService.createApplicationDomain({
      requestBody: {
        name: ApplicationDomainName,
      }
    });
    ApplicationDomainId = applicationDomainResponse.data.id;

    const eventApiResponse: EventApiResponse = await EventApIsService.createEventApi({ 
      requestBody: {
        applicationDomainId: ApplicationDomainId,
        name: EventApiName,
        brokerType: EventApi.brokerType.SOLACE
      }
    });
    EventApiId = eventApiResponse.data.id;
  });

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async() => {
    TestContext.newItId();
    // delete application domain
    await EpSdkApplicationDomainsService.deleteById({ applicationDomainId: ApplicationDomainId });
  });

  it(`${scriptName}: should create event api version`, async () => {
    try {
      const create: EventApiVersion = {
        eventApiId: EventApiId,
        description: `event api version for event = ${EventApiName}, id=${EventApiId}`,        
        version: EventApiVersionString,
        displayName: EventApiName,
      };
      const created: EventApiVersion = await EpSdkEventApiVersionsService.createEventApiVersion({
        applicationDomainId: ApplicationDomainId,
        eventApiId: EventApiId,
        eventApiVersion: create,
        targetLifecycleStateId: EpSdkStatesService.draftId,
      });
      EventApiVersionId = created.id;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should get event api version by version`, async () => {
    try {
      const eventApiVersion: EventApiVersion = await EpSdkEventApiVersionsService.getVersionByVersion({ 
        eventApiId: EventApiId,
        eventApiVersionString: EventApiVersionString,
      });
      expect(eventApiVersion.version, TestLogger.createApiTestFailMessage('version mismatch')).to.eq(EventApiVersionString);
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should get event api versions for event api id`, async () => {
    try {
      const eventApiVersionList: Array<EventApiVersion> = await EpSdkEventApiVersionsService.getVersionsForEventApiId({ eventApiId: EventApiId });
      expect(eventApiVersionList.length, TestLogger.createApiTestFailMessage('length not === 1')).to.eq(1);
      const eventApiVersion: EventApiVersion = eventApiVersionList[0];
      expect(eventApiVersion.id, TestLogger.createApiTestFailMessage('id mismatch')).to.eq(EventApiVersionId);
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should get event api versions for event api name`, async () => {
    try {
      const eventApiVersionList: Array<EventApiVersion> = await EpSdkEventApiVersionsService.getVersionsForEventApiName({ 
        applicationDomainId: ApplicationDomainId,
        eventApiName: EventApiName 
      });
      expect(eventApiVersionList.length, TestLogger.createApiTestFailMessage('length not === 1')).to.eq(1);
      const eventApiVersion: EventApiVersion = eventApiVersionList[0];
      expect(eventApiVersion.id, TestLogger.createApiTestFailMessage('id mismatch')).to.eq(EventApiVersionId);
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should create new event api version`, async () => {
    try {
      // create an event version
      const createdEventVersion: EventVersion = await TestHelpers.createEventVersion({
        applicationDomainId: ApplicationDomainId,
        stateId: EpSdkStatesService.releasedId
      });
      const create: EventApiVersion = {
        eventApiId: EventApiId,
        description: `event api version for event = ${EventApiName}, id=${EventApiId}`,        
        version: EventApiNextVersionString,
        displayName: EventApiName,
        consumedEventVersionIds: [createdEventVersion.id]
      };
      const created: EventApiVersion = await EpSdkEventApiVersionsService.createEventApiVersion({
        applicationDomainId: ApplicationDomainId,
        eventApiId: EventApiId,
        eventApiVersion: create,
        targetLifecycleStateId: EpSdkStatesService.releasedId
      });
      EventApiNextVersionId = created.id;
      expect(created.stateId, 'created.stateId failed').to.equal(EpSdkStatesService.releasedId);
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should get latest version string`, async () => {
    try {
      const latestVersionString: string = await EpSdkEventApiVersionsService.getLatestVersionString({ eventApiId: EventApiId });
      expect(latestVersionString, TestLogger.createApiTestFailMessage('version string mismatch')).to.eq(EventApiNextVersionString);
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should get latest version for event api id`, async () => {
    try {
      const eventApiVersion: EventApiVersion = await EpSdkEventApiVersionsService.getLatestVersionForEventApiId({ 
        applicationDomainId: ApplicationDomainId,
        eventApiId: EventApiId
      });
      expect(eventApiVersion.version, TestLogger.createApiTestFailMessage('version string mismatch')).to.eq(EventApiNextVersionString);
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should get latest version for event api name`, async () => {
    try {
      const eventApiVersion: EventApiVersion = await EpSdkEventApiVersionsService.getLatestVersionForEventApiName({ 
        applicationDomainId: ApplicationDomainId,
        eventApiName: EventApiName
      });
      expect(eventApiVersion, TestLogger.createApiTestFailMessage('eventApiVersion === undefined')).to.not.be.undefined;
      expect(eventApiVersion.version, TestLogger.createApiTestFailMessage('version string mismatch')).to.eq(EventApiNextVersionString);
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should get latest version for event api name that doesn't exist`, async () => {
    const NonExistentName = 'non-existent';
    try {
      const eventApiVersion: EventApiVersion = await EpSdkEventApiVersionsService.getLatestVersionForEventApiName({ 
        applicationDomainId: ApplicationDomainId,
        eventApiName: NonExistentName
      });
      expect(eventApiVersion, TestLogger.createApiTestFailMessage('eventApiVersion !== undefined')).to.be.undefined;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkServiceError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      const epSdkServiceError: EpSdkServiceError = e;
      expect(epSdkServiceError.toString(), TestLogger.createApiTestFailMessage(`error does not contain ${NonExistentName}`)).to.contain(NonExistentName);
    }
  });

  it(`${scriptName}: should catch displayName validation error`, async () => {
    const DisplayName = 'very, very, very, very, very, very, very, very, very, very, very, very, very long display name';
    try {
      const create: EventApiVersion = {
        eventApiId: EventApiId,
        description: `event api version for event = ${EventApiName}, id=${EventApiId}`,        
        version: EventApiNextVersionString,
        displayName: DisplayName,
      };
      const created: EventApiVersion = await EpSdkEventApiVersionsService.createEventApiVersion({
        applicationDomainId: ApplicationDomainId,
        eventApiId: EventApiId,
        eventApiVersion: create,
        targetLifecycleStateId: EpSdkStatesService.releasedId
      });
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkValidationError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      const epSdkValidationError: EpSdkValidationError = e;
      expect(epSdkValidationError.toString(), TestLogger.createEpSdkTestFailMessage(`error does not contain ${DisplayName}`, epSdkValidationError)).to.contain(DisplayName);
    }
  });

  it(`${scriptName}: should create 10 event api versions & get latest version string them using paging`, async () => {
    const PagingName = 'Paging-Object';
    const VersionQuantity = 10;
    const PageSize = 2;
    try {
      const response: EventApiResponse = await EventApIsService.createEventApi({
        requestBody: {
          applicationDomainId: ApplicationDomainId,
          name: PagingName,
          shared: false,
          brokerType: EventApi.brokerType.SOLACE
        }
      });
      EventApiId = response.data.id;

      let VersionString = '';
      for(let i=0; i<VersionQuantity; i++) {
        VersionString = `3.0.${i}`;
        const versionResponse: EventApiVersionResponse = await EventApIsService.createEventApiVersion({
          requestBody: {
            eventApiId: EventApiId,
            description: 'paging version',
            version: VersionString,
          }
        });
      }
      // // DEBUG
      // expect(false, 'check 1000 enum versions created').to.be.true;
      const versionList: Array<EventApiVersion> = await EpSdkEventApiVersionsService.getVersionsForEventApiId({ 
        eventApiId: EventApiId,
        pageSize: PageSize
      });
      expect(versionList.length, TestLogger.createApiTestFailMessage('failed')).to.eq(VersionQuantity);

      let latestObjectVersion: EventApiVersion = await EpSdkEventApiVersionsService.getLatestVersionForEventApiId({ eventApiId: EventApiId, applicationDomainId: ApplicationDomainId });
      expect(latestObjectVersion.version, TestLogger.createApiTestFailMessage('failed')).to.eq(VersionString);

      latestObjectVersion = await EpSdkEventApiVersionsService.getLatestVersionForEventApiName({ eventApiName: PagingName, applicationDomainId: ApplicationDomainId });
      expect(latestObjectVersion.version, TestLogger.createApiTestFailMessage('failed')).to.eq(VersionString);

      const latestObjectVersionString: string = await EpSdkEventApiVersionsService.getLatestVersionString({ eventApiId: EventApiId });
      expect(latestObjectVersionString, TestLogger.createApiTestFailMessage('failed')).to.eq(VersionString);

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should create 2 event apis with 1 version each & get event and version list`, async () => {
    let EventApiId_1: string | undefined;
    let EventApiVersionId_1: string | undefined;
    let EventApiId_2: string | undefined;
    let EventApiVersionId_2: string | undefined;

    try {
      {
        const eventApiResponse_1: EventApiResponse = await EventApIsService.createEventApi({
          requestBody: {
            applicationDomainId: ApplicationDomainId,
            name: 'EventApi_1',
            shared: false,
            brokerType: EventApi.brokerType.SOLACE
          }
        });
        EventApiId_1 = eventApiResponse_1.data.id;
        const eventApiVersionResponse_1: EventApiVersionResponse = await EventApIsService.createEventApiVersion({
          requestBody: {
            eventApiId: EventApiId_1,
            version: '1.0.0'
          }
        });
        EventApiVersionId_1 = eventApiVersionResponse_1.data.id;
      }
      {
        const eventApiResponse_2: EventApiResponse = await EventApIsService.createEventApi({
          requestBody: {
            applicationDomainId: ApplicationDomainId,
            name: 'EventApi_2',
            shared: false,
            brokerType: EventApi.brokerType.SOLACE
          }
        });
        EventApiId_2 = eventApiResponse_2.data.id;
        const eventApiVersionResponse_2: EventApiVersionResponse = await EventApIsService.createEventApiVersion({
          requestBody: {
            eventApiId: EventApiId_2,
            version: '1.0.0'
          }
        });
        EventApiVersionId_2 = eventApiVersionResponse_2.data.id;
      }

      // get the list
      const epSdkEventApiAndVersionList: Array<EpSdkEventApiAndVersion> = await EpSdkEventApiVersionsService.getObjectAndVersionListForEventApiVersionIds({
        eventApiVersionIds: [ EventApiVersionId_1, EventApiVersionId_2]
      });
      // // DEBUG
      // expect(false, `epSdkEventApiAndVersionList=${JSON.stringify(epSdkEventApiAndVersionList, null, 2)}`).to.be.true;

      expect(epSdkEventApiAndVersionList.length, 'wrong length').to.equal(2);
      expect(epSdkEventApiAndVersionList[0].eventApi.id, 'wrong event api id').to.equal(EventApiId_1);
      expect(epSdkEventApiAndVersionList[0].eventApiVersion.id, 'wrong event api version id').to.equal(EventApiVersionId_1);

      expect(epSdkEventApiAndVersionList[1].eventApi.id, 'wrong event api id').to.equal(EventApiId_2);
      expect(epSdkEventApiAndVersionList[1].eventApiVersion.id, 'wrong event api version id').to.equal(EventApiVersionId_2);

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

});

