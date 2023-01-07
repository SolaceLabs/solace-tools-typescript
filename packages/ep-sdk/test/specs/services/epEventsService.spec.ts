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
} from '../../lib';
import { 
  ApiError, 
  ApplicationDomainResponse, 
  ApplicationDomainsService, 
  EventResponse, 
  EventsService, 
  Event as EPEvent,
} from '@rjgu/ep-openapi-node';
import { 
  EpSdkError,
  EpSdkServiceError,
  EpSdkApplicationDomainsService,
  EpSdkEpEventsService,
  TEpSdkCustomAttributeList,
} from '../../../src';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId: string = TestUtils.getUUID();
let ApplicationDomainName: string;
let ApplicationDomainId: string | undefined;
let EpEventName: string;
let EpEventId: string | undefined;

const CustomAttributeList: TEpSdkCustomAttributeList = [
  {
    name: "event_1",
    value: "event_1 value"
  },
  {
    name: "event_2",
    value: "event_2 value"
  }
];
const AdditionalCustomAttributeList: TEpSdkCustomAttributeList = [
  {
    name: "event_3",
    value: "event_3 value"
  },
  {
    name: "event_4",
    value: "event_4 value"
  }
];

const initializeGlobals = () => {
  ApplicationDomainName = `${TestConfig.getAppId()}/services/${TestSpecName}`;
  EpEventName = `${TestConfig.getAppId()}-services-${TestSpecId}`;
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
  });

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async() => {
    TestContext.newItId();
    // delete application domain
    await EpSdkApplicationDomainsService.deleteById({ applicationDomainId: ApplicationDomainId });
    // remove all attribute definitions
    const customAttributeList = CustomAttributeList.concat(AdditionalCustomAttributeList);
    const xvoid: void = await EpSdkEpEventsService.removeAssociatedEntityTypeFromCustomAttributeDefinitions({
      customAttributeNames: customAttributeList.map( (x) => {
        return x.name;
      })
    });      
  });

  it(`${scriptName}: should create epEvent`, async () => {
    try {
      const eventResponse: EventResponse = await EventsService.createEvent({ 
        requestBody: {
          applicationDomainId: ApplicationDomainId,
          name: EpEventName,
        }
      });
      EpEventId = eventResponse.data.id;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should get epEvent by name`, async () => {
    try {
      const epEvent: EPEvent | undefined = await EpSdkEpEventsService.getByName({
        applicationDomainId: ApplicationDomainId,
        eventName: EpEventName
      })
      expect(epEvent, TestLogger.createApiTestFailMessage('epEvent === undefined')).to.not.be.undefined;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should get epEvent by id`, async () => {
    try {
      const epEvent: EPEvent | undefined = await EpSdkEpEventsService.getById({
        eventId: EpEventId
      });
      expect(epEvent.id, TestLogger.createApiTestFailMessage('failed')).to.eq(EpEventId);
      expect(epEvent.applicationDomainId, TestLogger.createApiTestFailMessage('failed')).to.eq(ApplicationDomainId);
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should delete epEvent by id`, async () => {
    try {
      const epEvent: EPEvent | undefined = await EpSdkEpEventsService.deleteById({
        eventId: EpEventId
      });
      expect(epEvent.id, TestLogger.createApiTestFailMessage('failed')).to.eq(EpEventId);
      expect(epEvent.applicationDomainId, TestLogger.createApiTestFailMessage('failed')).to.eq(ApplicationDomainId);
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should create epEvent`, async () => {
    try {
      const eventResponse: EventResponse = await EventsService.createEvent({ 
        requestBody: {
          applicationDomainId: ApplicationDomainId,
          name: EpEventName,
        }
      });
      EpEventId = eventResponse.data.id;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should set custom attributes on event`, async () => {
    try {
      const epEvent: EPEvent = await EpSdkEpEventsService.setCustomAttributes({
        eventId: EpEventId,
        epSdkCustomAttributeList: CustomAttributeList,
      });
      expect(epEvent.customAttributes).to.not.be.undefined;
      if(epEvent.customAttributes === undefined) throw new Error('epEvent.customAttributes === undefined');
      for(const customAttribute of CustomAttributeList) {
        const found = epEvent.customAttributes.find( (x) => {
          return x.customAttributeDefinitionName === customAttribute.name;
        });
        expect(found).to.not.be.undefined;
        expect(found.value).to.equal(customAttribute.value);
      }
      // // DEBUG
      // expect(false, `application.customAttributes=${JSON.stringify(application.customAttributes, null, 2)}`).to.be.true;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should set custom attributes on event: idempotency`, async () => {
    try {
      const epEvent: EPEvent = await EpSdkEpEventsService.setCustomAttributes({
        eventId: EpEventId,
        epSdkCustomAttributeList: CustomAttributeList,
      });
      expect(epEvent.customAttributes).to.not.be.undefined;
      if(epEvent.customAttributes === undefined) throw new Error('epEvent.customAttributes === undefined');
      for(const customAttribute of CustomAttributeList) {
        const found = epEvent.customAttributes.find( (x) => {
          return x.customAttributeDefinitionName === customAttribute.name;
        });
        expect(found).to.not.be.undefined;
        expect(found.value).to.equal(customAttribute.value);
      }
      // // DEBUG
      // expect(false, `application.customAttributes=${JSON.stringify(application.customAttributes, null, 2)}`).to.be.true;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should set additional custom attributes on event leaving original attributes as-is`, async () => {
    try {
      const epEvent: EPEvent = await EpSdkEpEventsService.setCustomAttributes({
        eventId: EpEventId,
        epSdkCustomAttributeList: AdditionalCustomAttributeList,
      });
      expect(epEvent.customAttributes).to.not.be.undefined;
      if(epEvent.customAttributes === undefined) throw new Error('epEvent.customAttributes === undefined');
      expect(epEvent.customAttributes.length, `wrong number of attributes`).to.equal(AdditionalCustomAttributeList.length + CustomAttributeList.length);
      for(const customAttribute of CustomAttributeList) {
        const found = epEvent.customAttributes.find( (x) => {
          return x.customAttributeDefinitionName === customAttribute.name;
        });
        expect(found).to.not.be.undefined;
        expect(found.value).to.equal(customAttribute.value);
      }
      for(const customAttribute of AdditionalCustomAttributeList) {
        const found = epEvent.customAttributes.find( (x) => {
          return x.customAttributeDefinitionName === customAttribute.name;
        });
        expect(found).to.not.be.undefined;
        expect(found.value).to.equal(customAttribute.value);
      }
      // // DEBUG
      // expect(false, `application.customAttributes=${JSON.stringify(application.customAttributes, null, 2)}`).to.be.true;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should unset additional custom attributes on event leaving only original attributes`, async () => {
    try {
      const epEvent: EPEvent = await EpSdkEpEventsService.unsetCustomAttributes({
        eventId: EpEventId,
        epSdkCustomAttributeList: AdditionalCustomAttributeList,
      });
      expect(epEvent.customAttributes).to.not.be.undefined;
      if(epEvent.customAttributes === undefined) throw new Error('epEvent.customAttributes === undefined');
      expect(epEvent.customAttributes.length, `wrong number of attributes`).to.equal(CustomAttributeList.length);
      for(const customAttribute of CustomAttributeList) {
        const found = epEvent.customAttributes.find( (x) => {
          return x.customAttributeDefinitionName === customAttribute.name;
        });
        expect(found).to.not.be.undefined;
        expect(found.value).to.equal(customAttribute.value);
      }
      for(const customAttribute of AdditionalCustomAttributeList) {
        const found = epEvent.customAttributes.find( (x) => {
          return x.customAttributeDefinitionName === customAttribute.name;
        });
        expect(found).to.be.undefined;
      }
      // // DEBUG
      // expect(false, `application.customAttributes=${JSON.stringify(application.customAttributes, null, 2)}`).to.be.true;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should delete epEvent by name`, async () => {
    try {
      const epEvent: EPEvent | undefined = await EpSdkEpEventsService.deleteByName({
        applicationDomainId: ApplicationDomainId,
        eventName: EpEventName
      });
      expect(epEvent.name, TestLogger.createApiTestFailMessage('failed')).to.eq(EpEventName);
      expect(epEvent.id, TestLogger.createApiTestFailMessage('failed')).to.eq(EpEventId);
      expect(epEvent.applicationDomainId, TestLogger.createApiTestFailMessage('failed')).to.eq(ApplicationDomainId);
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should catch delete epEvent by name that doesn't exist`, async () => {
    const NonExistentName = 'non-existent';
    try {
      const epEvent: EPEvent | undefined = await EpSdkEpEventsService.deleteByName({
        applicationDomainId: ApplicationDomainId,
        eventName: NonExistentName
      });
      expect(false, TestLogger.createApiTestFailMessage('must never get here')).to.be.true;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkServiceError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      const epSdkServiceError: EpSdkServiceError = e;
      expect(epSdkServiceError.toString(), TestLogger.createApiTestFailMessage(`error does not contain ${NonExistentName}`)).to.contain(NonExistentName);
    }
  });

  it(`${scriptName}: should catch delete epEvent by id that doesn't exist`, async () => {
    const NonExistentId = 'non-existent';
    try {
      const epEvent: EPEvent | undefined = await EpSdkEpEventsService.deleteById({
        eventId: NonExistentId
      });
      expect(false, TestLogger.createApiTestFailMessage('must never get here')).to.be.true;
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createApiTestFailMessage('not ApiError')).to.be.true;
      const apiError: ApiError = e;
      expect(apiError.status, TestLogger.createApiTestFailMessage('wrong status')).to.eq(404);
    }
  });

});

