import 'mocha';
import { expect } from 'chai';
import path from 'path';
import { 
  ApiError, 
  ApplicationDomain, 
  ApplicationDomainResponse, 
  ApplicationDomainsService 
} from '@rjgu/ep-openapi-node';
import {
  TestContext,
  TestUtils
} from '@internal/tools/src';
import { 
  TestLogger,
  TestConfig,
  EpSdkPinoLogger,
  TestHelpers
} from '../../lib';
import { 
  EpSdkError,
  EEpSdkLogLevel,
  EpSdkLogger,
  EpSdkApplicationDomainsService,
  IEpSdkLoggerInstance,
} from '../../../src';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId: string = TestUtils.getUUID();

let ApplicationDomainName: string;
let ApplicationDomainId: string | undefined;
let epExistingLoggerInstance: IEpSdkLoggerInstance;

const initializeGlobals = () => {
  ApplicationDomainName = `${TestConfig.getAppId()}/misc/${TestSpecName}`;
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

  it(`${scriptName}: should initialize logger with pino`, async () => {
    try {
      epExistingLoggerInstance = EpSdkLogger.getLoggerInstance();
      // DEBUG
      // console.log(`${scriptName}: epExistingLoggerInstance=${JSON.stringify({
      //   appId: epExistingLoggerInstance.appId,
      //   epSdkLogLevel: epExistingLoggerInstance.epSdkLogLevel
      // }, null, 2)}`)

      const epSdkPinoLogger: EpSdkPinoLogger = new EpSdkPinoLogger(TestConfig.getAppId(), EEpSdkLogLevel.Trace);
      EpSdkLogger.initialize({ epSdkLoggerInstance: epSdkPinoLogger });
      EpSdkLogger.info(EpSdkLogger.createLogEntry(scriptName, { code: 'TEST_INFO', module: scriptName, details: {
        hello: 'world'
      }}));
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
    // // DEBUG
    // expect(false, TestLogger.createLogMessage('check logging')).to.be.true;
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

  it(`${scriptName}: should get application domain by name`, async () => {
    try {
      const applicationDomain: ApplicationDomain | undefined = await EpSdkApplicationDomainsService.getByName({ applicationDomainName: ApplicationDomainName });
      // expect(false, TestLogger.createLogMessage('check logging')).to.be.true;
      expect(applicationDomain, TestLogger.createApiTestFailMessage('applicationDomain === undefined')).to.not.be.undefined;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should restore logger`, async () => {
    try {
      EpSdkLogger.initialize({ epSdkLoggerInstance: epExistingLoggerInstance });
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should get application domain by name`, async () => {
    try {
      const applicationDomain: ApplicationDomain | undefined = await EpSdkApplicationDomainsService.getByName({ applicationDomainName: ApplicationDomainName });
      // DEBUG
      // expect(false, TestLogger.createLogMessage('check logging with default logger')).to.be.true;
      expect(applicationDomain, TestLogger.createApiTestFailMessage('applicationDomain === undefined')).to.not.be.undefined;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

});

