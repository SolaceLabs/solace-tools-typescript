import 'mocha';
import { expect } from 'chai';
import path from 'path';
import {
  TestContext,
  TestUtils
} from '@internal/tools/src';
import {
  TestLogger,
  TestConfig
} from '../../lib';
import { 
  ApiError, 
  ApplicationDomainResponse, 
  ApplicationDomainsService, 
  EventResponse, 
  EventsService, 
  Event as EpEvent,
  EventVersion,
  EventVersionResponse,
  CustomAttribute,
  CustomAttributeDefinitionsService,
  CustomAttributeDefinitionResponse,
  CustomAttributeDefinition
} from '../../../generated-src';



const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId = TestUtils.getUUID();

let ApplicationDomainName: string;
let ApplicationDomainId: string;

const EventName = `event-${TestUtils.getUUID()}`;
let EventId: string;
const EventVersionName = `${TestUtils.getUUID()}`;
let EventVersionId: string;

const CustomAttribtuteDefinitionName = `attr-${TestUtils.getUUID()}`;
let CustomAttribtuteDefinitionId: string;
const EventNameAttributes = 'attributes' + EventName;
let EventIdAttributes: string;
let EventVersionIdAttributes: string;

const initializeGlobals = () => {
  ApplicationDomainName = `${TestConfig.getAppId()}/${TestSpecName}`;
}

describe(`${scriptName}`, () => {

  before(async() => {
    TestContext.newItId();
    initializeGlobals();
  });

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async() => {
    TestContext.newItId();
    try {
      let xvoid: void = await ApplicationDomainsService.deleteApplicationDomain({
        xContextId: 'xContextId',
        id: ApplicationDomainId
      });
      xvoid = await CustomAttributeDefinitionsService.deleteCustomAttributeDefinition({
        xContextId: 'xContextId',
        id: CustomAttribtuteDefinitionId
      });
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should create application domain`, async () => {
    try {
      const applicationDomainResponse: ApplicationDomainResponse = await ApplicationDomainsService.createApplicationDomain({
        xContextId: 'xContextId',
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

  it(`${scriptName}: should create event`, async () => {
    try {

      const eventResponse: EventResponse = await EventsService.createEvent({
        xContextId: 'xContextId',
        requestBody: {
          applicationDomainId: ApplicationDomainId,
          name: EventName,
        }
      });
      const data: EpEvent | undefined = eventResponse.data;
      expect(data, TestLogger.createApiTestFailMessage('failed')).to.not.be.undefined;
      expect(data.id, TestLogger.createApiTestFailMessage('failed')).to.not.be.undefined;
      EventId = data.id;
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should create event version (deprecated)`, async () => {
    try {
      const requestBody: EventVersion = {
        eventId: EventId,
        version: '1.0.0',
      };
      const eventVersionResponse: EventVersionResponse = await EventsService.createEventVersionForEvent({
        xContextId: 'xContextId',
        eventId: EventId,
        requestBody: requestBody
      });
      const data: EventVersion | undefined = eventVersionResponse.data;
      expect(data, TestLogger.createApiTestFailMessage('failed')).to.not.be.undefined;
      expect(data.id, TestLogger.createApiTestFailMessage('failed')).to.not.be.undefined;
      EventVersionId = data.id;
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should create event version`, async () => {
    try {
      const requestBody: EventVersion = {
        eventId: EventId,
        version: '1.1.0',
      };
      const eventVersionResponse: EventVersionResponse = await EventsService.createEventVersion({
        xContextId: 'xContextId',
        requestBody: requestBody
      });
      const data: EventVersion | undefined = eventVersionResponse.data;
      expect(data, TestLogger.createApiTestFailMessage('failed')).to.not.be.undefined;
      expect(data.id, TestLogger.createApiTestFailMessage('failed')).to.not.be.undefined;
      EventVersionId = data.id;
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should create attribute definition`, async () => {
    try {
      const customAttributeDefinitionResponse: CustomAttributeDefinitionResponse = await CustomAttributeDefinitionsService.createCustomAttributeDefinition({
        xContextId: 'xContextId',
        requestBody: {
          name: CustomAttribtuteDefinitionName,
          valueType: CustomAttributeDefinition.valueType.STRING,
          associatedEntityTypes: ['event', 'eventVersion'],
          scope: CustomAttributeDefinition.scope.ORGANIZATION
        }
      });
      const data: CustomAttributeDefinition | undefined = customAttributeDefinitionResponse.data;
      expect(data, TestLogger.createApiTestFailMessage('failed')).to.not.be.undefined;
      expect(data.id, TestLogger.createApiTestFailMessage('failed')).to.not.be.undefined;
      CustomAttribtuteDefinitionId = data.id;
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should create event with attributes`, async () => {
    try {
      const customAttribute: CustomAttribute = {
        // customAttributeDefinitionName: CustomAttribtuteDefinitionName,
        value: 'attribute_1-value',
        customAttributeDefinitionId: CustomAttribtuteDefinitionId
      };
      const eventResponse: EventResponse = await EventsService.createEvent({
        xContextId: 'xContextId',
        requestBody: {
          applicationDomainId: ApplicationDomainId,
          name: EventNameAttributes,
          customAttributes: [ customAttribute ]
        }
      });
      const data: EpEvent | undefined = eventResponse.data;
      expect(data, TestLogger.createApiTestFailMessage('failed')).to.not.be.undefined;
      expect(data.id, TestLogger.createApiTestFailMessage('failed')).to.not.be.undefined;
      EventIdAttributes = data.id;
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should create event version with attributes`, async () => {
    try {
      const requestBody: EventVersion = {
        eventId: EventIdAttributes,
        version: '1.0.0',
      };        
      const eventVersionResponse: EventVersionResponse = await EventsService.createEventVersionForEvent({
        xContextId: 'xContextId',
        eventId: EventIdAttributes,
        requestBody: requestBody
      });
      const data: EventVersion | undefined = eventVersionResponse.data;
      expect(data, TestLogger.createApiTestFailMessage('failed')).to.not.be.undefined;
      expect(data.id, TestLogger.createApiTestFailMessage('failed')).to.not.be.undefined;
      EventVersionIdAttributes = data.id;
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
    }
  });

});

