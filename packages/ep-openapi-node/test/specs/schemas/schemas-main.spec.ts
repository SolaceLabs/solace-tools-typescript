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
  SchemaObject,
  SchemaResponse,
  SchemasService,
  SchemaVersion,
  SchemaVersionResponse,
} from '../../../generated-src';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId = TestUtils.getUUID();

let ApplicationDomainName: string;
let ApplicationDomainId: string;

const SchemaName = `schema-${TestUtils.getUUID()}`;
let SchemaId: string;

const SchemaVersionName = `${TestUtils.getUUID()}`;
let SchemaVersionId: string;

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
      const xvoid: void = await ApplicationDomainsService.deleteApplicationDomain({
        id: ApplicationDomainId
      });
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
    }
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

  it(`${scriptName}: should create schema`, async () => {
    try {

      const schemaResponse: SchemaResponse = await SchemasService.createSchema({
        requestBody: {
          applicationDomainId: ApplicationDomainId,
          contentType: 'json',
          name: SchemaName,
          schemaType: 'jsonSchema',
          shared: false
        }
      });
      const data: SchemaObject | undefined = schemaResponse.data;
      expect(data, TestLogger.createApiTestFailMessage('failed')).to.not.be.undefined;
      expect(data.id, TestLogger.createApiTestFailMessage('failed')).to.not.be.undefined;
      SchemaId = data.id;
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should create schema version`, async () => {
    try {
      const requestBody: SchemaVersion = {
        schemaId: SchemaId,
        version: '1.0.0',
      };
      const schemaVersionResponse: SchemaVersionResponse = await SchemasService.createSchemaVersionForSchema({
        schemaId: SchemaId,
        requestBody: requestBody
      });
      const data: SchemaVersion | undefined = schemaVersionResponse.data;
      expect(data, TestLogger.createApiTestFailMessage('failed')).to.not.be.undefined;
      expect(data.id, TestLogger.createApiTestFailMessage('failed')).to.not.be.undefined;
      SchemaVersionId = data.id;
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
    }
  });

});

