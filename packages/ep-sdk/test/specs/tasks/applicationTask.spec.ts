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
  Application, 
  ApplicationDomainResponse, 
  ApplicationDomainsService
} from '@rjgu/ep-openapi-node';
import { 
  EpSdkError,
  EpSdkEpApiError,
  EpSdkApplicationDomainsService,
  EpSdkApplicationTask,
  IEpSdkApplicationTask_ExecuteReturn,
  EEpSdkTask_Action,
  EEpSdkTask_TargetState,
} from '../../../src';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId = TestUtils.getUUID();

let ApplicationDomainName: string;
let ApplicationDomainId: string | undefined;
let ApplicationName: string;
let ApplicationId: string | undefined;

const initializeGlobals = () => {
  ApplicationDomainName = `${TestConfig.getAppId()}/tasks/${TestSpecName}`;
  ApplicationName = `${TestConfig.getAppId()}-tasks-${TestSpecName}`;
  // EpSdkLogger.getLoggerInstance().setLogLevel(EEpSdkLogLevel.Trace);
}

describe(`${scriptName}`, () => {

  before(async() => {
    TestContext.newItId();
    initializeGlobals();
    try {
      const applicationDomainResponse: ApplicationDomainResponse = await ApplicationDomainsService.createApplicationDomain({
        requestBody: {
          name: ApplicationDomainName,
        }
      });
      ApplicationDomainId = applicationDomainResponse.data.id;  
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async() => {
    TestContext.newItId();
    try {
      await EpSdkApplicationDomainsService.deleteByName({ applicationDomainName: ApplicationDomainName });
    } catch(e) {}
  });

  it(`${scriptName}: application present: checkmode create`, async () => {
    try {
      const epSdkApplicationTask = new EpSdkApplicationTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        applicationName: ApplicationName,
        applicationObjectSettings: {
          applicationType: "standard",
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true
      });

      const epSdkApplicationTask_ExecuteReturn: IEpSdkApplicationTask_ExecuteReturn = await epSdkApplicationTask.execute();

      const message = TestLogger.createLogMessage('epSdkApplicationTask_ExecuteReturn', epSdkApplicationTask_ExecuteReturn);
      expect(epSdkApplicationTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_CREATE);

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });
    
  it(`${scriptName}: application present: create`, async () => {
    try {

      const epSdkApplicationTask = new EpSdkApplicationTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        applicationName: ApplicationName,
        applicationObjectSettings: {
          applicationType: "standard",
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        }
      });

      const epSdkApplicationTask_ExecuteReturn: IEpSdkApplicationTask_ExecuteReturn = await epSdkApplicationTask.execute();

      const message = TestLogger.createLogMessage('epSdkApplicationTask_ExecuteReturn', epSdkApplicationTask_ExecuteReturn);
      expect(epSdkApplicationTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.CREATE);
      
      ApplicationId = epSdkApplicationTask_ExecuteReturn.epObject.id;

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: application present: create: nothing to do`, async () => {
    try {

      const epSdkApplicationTask = new EpSdkApplicationTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        applicationName: ApplicationName,
        applicationObjectSettings: {
          applicationType: "standard",
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        }
      });

      const epSdkApplicationTask_ExecuteReturn: IEpSdkApplicationTask_ExecuteReturn = await epSdkApplicationTask.execute();

      const message = TestLogger.createLogMessage('epSdkApplicationTask_ExecuteReturn', epSdkApplicationTask_ExecuteReturn);
      expect(epSdkApplicationTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.NO_ACTION);
      expect(epSdkApplicationTask_ExecuteReturn.epObject.id, message).to.eq(ApplicationId);

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: application present: checkmode update: no action`, async () => {
    try {

      const epSdkApplicationTask = new EpSdkApplicationTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        applicationName: ApplicationName,
        applicationObjectSettings: {
          applicationType: "standard",
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true
      });

      const epSdkApplicationTask_ExecuteReturn: IEpSdkApplicationTask_ExecuteReturn = await epSdkApplicationTask.execute();
      
      const message = TestLogger.createLogMessage('epSdkApplicationTask_ExecuteReturn', epSdkApplicationTask_ExecuteReturn);
      expect(epSdkApplicationTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.NO_ACTION);
      expect(epSdkApplicationTask_ExecuteReturn.epObject.id, message).to.eq(ApplicationId);

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: application present: checkmode update: would update`, async () => {
    try {

      const epSdkApplicationTask = new EpSdkApplicationTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        applicationName: ApplicationName,
        applicationObjectSettings: {
          applicationType: "standard",
          brokerType: Application.brokerType.KAFKA
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true
      });

      const epSdkApplicationTask_ExecuteReturn: IEpSdkApplicationTask_ExecuteReturn = await epSdkApplicationTask.execute();
      
      const message = TestLogger.createLogMessage('epSdkApplicationTask_ExecuteReturn', epSdkApplicationTask_ExecuteReturn);
      expect(epSdkApplicationTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_UPDATE);
      expect(epSdkApplicationTask_ExecuteReturn.epObject.id, message).to.eq(ApplicationId);

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: application present: update: should throw error`, async () => {
    try {

      const epSdkApplicationTask = new EpSdkApplicationTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        applicationName: ApplicationName,
        applicationObjectSettings: {
          applicationType: "standard",
          // "brokerType": [
          //   "Is an immutable field and cannot be updated"
          // ]
          brokerType: Application.brokerType.KAFKA
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
      });

      const epSdkApplicationTask_ExecuteReturn: IEpSdkApplicationTask_ExecuteReturn = await epSdkApplicationTask.execute();

      expect(false, 'should never get here').to.be.true;

    } catch(e) {
      expect(e instanceof EpSdkEpApiError, TestLogger.createNotApiErrorMessage(e)).to.be.true;
      const epSdkEpApiError: EpSdkEpApiError = e;
      expect(epSdkEpApiError.apiError.status, TestLogger.createApiTestFailMessage('failed')).to.eq(400);
      expect(JSON.stringify(epSdkEpApiError.apiError.body), TestLogger.createApiTestFailMessage('failed')).to.contain('immutable field');
    }
  });

  it(`${scriptName}: application present: no action`, async () => {
    try {

      const epSdkApplicationTask = new EpSdkApplicationTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        applicationName: ApplicationName,
        applicationObjectSettings: {
          applicationType: "standard",
          brokerType: Application.brokerType.SOLACE
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
      });

      const epSdkApplicationTask_ExecuteReturn: IEpSdkApplicationTask_ExecuteReturn = await epSdkApplicationTask.execute();
      
      const message = TestLogger.createLogMessage('epSdkApplicationTask_ExecuteReturn', epSdkApplicationTask_ExecuteReturn);
      expect(epSdkApplicationTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.NO_ACTION);
      expect(epSdkApplicationTask_ExecuteReturn.epObject.id, message).to.eq(ApplicationId);
      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: application absent: checkmode with existing`, async () => {
    try {

      const epSdkApplicationTask = new EpSdkApplicationTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        applicationDomainId: ApplicationDomainId,
        applicationName: ApplicationName,
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true
      });

      const epSdkApplicationTask_ExecuteReturn: IEpSdkApplicationTask_ExecuteReturn = await epSdkApplicationTask.execute();
      
      const message = TestLogger.createLogMessage('epSdkApplicationTask_ExecuteReturn', epSdkApplicationTask_ExecuteReturn);

      expect(epSdkApplicationTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_DELETE);
      expect(epSdkApplicationTask_ExecuteReturn.epObject.id, message).to.eq(ApplicationId);
      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: application absent`, async () => {
    try {

      const epSdkApplicationTask = new EpSdkApplicationTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        applicationDomainId: ApplicationDomainId,
        applicationName: ApplicationName,
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
      });

      const epSdkApplicationTask_ExecuteReturn: IEpSdkApplicationTask_ExecuteReturn = await epSdkApplicationTask.execute();
      
      const message = TestLogger.createLogMessage('epSdkApplicationTask_ExecuteReturn', epSdkApplicationTask_ExecuteReturn);
      expect(epSdkApplicationTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.DELETE);
      expect(epSdkApplicationTask_ExecuteReturn.epObject.id, message).to.eq(ApplicationId);
      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: application absent: checkmode with non-existing`, async () => {
    try {

      const NonExisting = 'non-existing';


      const epSdkApplicationTask = new EpSdkApplicationTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        applicationDomainId: ApplicationDomainId,
        applicationName: NonExisting,
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true
      });

      const epSdkApplicationTask_ExecuteReturn: IEpSdkApplicationTask_ExecuteReturn = await epSdkApplicationTask.execute();
      
      const message = TestLogger.createLogMessage('epSdkApplicationTask_ExecuteReturn', epSdkApplicationTask_ExecuteReturn);
      expect(epSdkApplicationTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.NO_ACTION);
      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: application present: create with brokerType = kafka`, async () => {
    try {

      const epSdkApplicationTask = new EpSdkApplicationTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        applicationName: ApplicationName,
        applicationObjectSettings: {
          applicationType: "standard",
          brokerType: Application.brokerType.KAFKA
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        }
      });

      const epSdkApplicationTask_ExecuteReturn: IEpSdkApplicationTask_ExecuteReturn = await epSdkApplicationTask.execute();

      const message = TestLogger.createLogMessage('epSdkApplicationTask_ExecuteReturn', epSdkApplicationTask_ExecuteReturn);
      expect(epSdkApplicationTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.CREATE);
      
      ApplicationId = epSdkApplicationTask_ExecuteReturn.epObject.id;

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

});

