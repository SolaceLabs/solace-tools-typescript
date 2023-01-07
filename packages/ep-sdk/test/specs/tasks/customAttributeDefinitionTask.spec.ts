import 'mocha';
import { expect } from 'chai';
import path from 'path';
import {
  TestContext,
  TestUtils
} from '@internal/tools/src';
import { 
  TestLogger,
} from '../../lib';
import { 
  ApiError, 
  CustomAttributeDefinition, 
} from '@rjgu/ep-openapi-node';
import { 
  EpSdkError,
  EEpSdkTask_Action,
  EEpSdkTask_TargetState,
  EEpSdkCustomAttributeEntityTypes,
  EpSdkCustomAttributeDefinitionsService,
  EpSdkCustomAttributeDefinitionTask,
  IEpSdkCustomAttributeDefinitionTask_ExecuteReturn,
} from '../../../src';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId = TestUtils.getUUID();

const CustomAttributeDefinition_1_Name = 'CustomAttributeDefinition_1_Name';
let CustomAttributeDefinition_1_Id: string | undefined;
const CustomAttributeDefinition_1_EntityTypeList_1: Array<EEpSdkCustomAttributeEntityTypes> = [
  EEpSdkCustomAttributeEntityTypes.APPLICATION_DOMAIN
];
const CustomAttributeDefinition_1_EntityTypeList_2: Array<EEpSdkCustomAttributeEntityTypes> = [
  EEpSdkCustomAttributeEntityTypes.APPLICATION_DOMAIN,
  EEpSdkCustomAttributeEntityTypes.APPLICATION
];
const CustomAttributeDefinition_1_EntityTypeList_3: Array<EEpSdkCustomAttributeEntityTypes> = Object.values(EEpSdkCustomAttributeEntityTypes);
let CustomAttributeDefinition_IdList = [];

const initializeGlobals = () => {
  // EpSdkLogger.getLoggerInstance().setLogLevel(EEpSdkLogLevel.Trace);
}

describe(`${scriptName}`, () => {

  before(() => {
    TestContext.newItId();
    initializeGlobals();
  });

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async() => {
    TestContext.newItId();
    try {
      // delete custom attribute definition
      await EpSdkCustomAttributeDefinitionsService.deleteById({
        customAttributeDefinitionId: CustomAttributeDefinition_1_Id
      });      
      for(const id of CustomAttributeDefinition_IdList) {
        await EpSdkCustomAttributeDefinitionsService.deleteById({
          customAttributeDefinitionId: id
        });  
      }
    } catch(e) {}
  });

  it(`${scriptName}: setup`, async () => {
    // EpSdkLogger.getLoggerInstance().setLogLevel(EEpSdkLogLevel.Trace);
  });

  it(`${scriptName}: customAttributeDefintion present: checkmode create`, async () => {
    try {
      const epSdkCustomAttributeDefinitionTask = new EpSdkCustomAttributeDefinitionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        attributeName: CustomAttributeDefinition_1_Name,
        customAttributeDefinitionObjectSettings: {
          associatedEntityTypes: CustomAttributeDefinition_1_EntityTypeList_1
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true
      });
      const epSdkCustomAttributeDefinitionTask_ExecuteReturn: IEpSdkCustomAttributeDefinitionTask_ExecuteReturn = await epSdkCustomAttributeDefinitionTask.execute();

      const message = TestLogger.createLogMessage('epSdkCustomAttributeDefinitionTask_ExecuteReturn', epSdkCustomAttributeDefinitionTask_ExecuteReturn);
      expect(epSdkCustomAttributeDefinitionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_CREATE);

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });
    
  it(`${scriptName}: customAttributeDefintion present: create`, async () => {
    try {

      const epSdkCustomAttributeDefinitionTask = new EpSdkCustomAttributeDefinitionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        attributeName: CustomAttributeDefinition_1_Name,
        customAttributeDefinitionObjectSettings: {
          associatedEntityTypes: CustomAttributeDefinition_1_EntityTypeList_1
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
      });
      const epSdkCustomAttributeDefinitionTask_ExecuteReturn: IEpSdkCustomAttributeDefinitionTask_ExecuteReturn = await epSdkCustomAttributeDefinitionTask.execute();

      const message = TestLogger.createLogMessage('epSdkCustomAttributeDefinitionTask_ExecuteReturn', epSdkCustomAttributeDefinitionTask_ExecuteReturn);
      expect(epSdkCustomAttributeDefinitionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.CREATE);
      CustomAttributeDefinition_1_Id = epSdkCustomAttributeDefinitionTask_ExecuteReturn.epObject.id;

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: customAttributeDefintion present: create: nothing to do`, async () => {
    try {

      const epSdkCustomAttributeDefinitionTask = new EpSdkCustomAttributeDefinitionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        attributeName: CustomAttributeDefinition_1_Name,
        customAttributeDefinitionObjectSettings: {
          associatedEntityTypes: CustomAttributeDefinition_1_EntityTypeList_1
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
      });
      const epSdkCustomAttributeDefinitionTask_ExecuteReturn: IEpSdkCustomAttributeDefinitionTask_ExecuteReturn = await epSdkCustomAttributeDefinitionTask.execute();

      const message = TestLogger.createLogMessage('epSdkCustomAttributeDefinitionTask_ExecuteReturn', epSdkCustomAttributeDefinitionTask_ExecuteReturn);
      expect(epSdkCustomAttributeDefinitionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.NO_ACTION);
      expect(epSdkCustomAttributeDefinitionTask_ExecuteReturn.epObject.id, message).to.eq(CustomAttributeDefinition_1_Id);

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: customAttributeDefintion present: checkmode update`, async () => {
    try {

      const epSdkCustomAttributeDefinitionTask = new EpSdkCustomAttributeDefinitionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        attributeName: CustomAttributeDefinition_1_Name,
        customAttributeDefinitionObjectSettings: {
          associatedEntityTypes: CustomAttributeDefinition_1_EntityTypeList_2
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true
      });
      const epSdkCustomAttributeDefinitionTask_ExecuteReturn: IEpSdkCustomAttributeDefinitionTask_ExecuteReturn = await epSdkCustomAttributeDefinitionTask.execute();
      
      const message = TestLogger.createLogMessage('epSdkCustomAttributeDefinitionTask_ExecuteReturn', epSdkCustomAttributeDefinitionTask_ExecuteReturn);
      expect(epSdkCustomAttributeDefinitionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_UPDATE);
      expect(epSdkCustomAttributeDefinitionTask_ExecuteReturn.epObject.id, message).to.eq(CustomAttributeDefinition_1_Id);

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: customAttributeDefintion present: update to CustomAttributeDefinition_1_EntityTypeList_2`, async () => {
    try {

      const epSdkCustomAttributeDefinitionTask = new EpSdkCustomAttributeDefinitionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        attributeName: CustomAttributeDefinition_1_Name,
        customAttributeDefinitionObjectSettings: {
          associatedEntityTypes: CustomAttributeDefinition_1_EntityTypeList_2
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false
      });
      const epSdkCustomAttributeDefinitionTask_ExecuteReturn: IEpSdkCustomAttributeDefinitionTask_ExecuteReturn = await epSdkCustomAttributeDefinitionTask.execute()
      
      const message = TestLogger.createLogMessage('epSdkCustomAttributeDefinitionTask_ExecuteReturn', epSdkCustomAttributeDefinitionTask_ExecuteReturn);
      expect(epSdkCustomAttributeDefinitionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.UPDATE);
      expect(epSdkCustomAttributeDefinitionTask_ExecuteReturn.epObject.id, message).to.eq(CustomAttributeDefinition_1_Id);

      // get the customAttributeDefintion and check entities
      const customAttributeDefinition: CustomAttributeDefinition = await EpSdkCustomAttributeDefinitionsService.getById({
        customAttributeDefinitionId: CustomAttributeDefinition_1_Id
      });
      const associatedEntityTypesString = JSON.stringify(customAttributeDefinition.associatedEntityTypes);
      const failMessage = TestLogger.createLogMessage('customAttributeDefinition.associatedEntityTypes', customAttributeDefinition.associatedEntityTypes);
      for(const associatedEntityType of CustomAttributeDefinition_1_EntityTypeList_2) {
        expect(associatedEntityTypesString, failMessage).to.include(associatedEntityType);
      }

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: customAttributeDefintion present: update to CustomAttributeDefinition_1_EntityTypeList_3`, async () => {
    try {

      const epSdkCustomAttributeDefinitionTask = new EpSdkCustomAttributeDefinitionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        attributeName: CustomAttributeDefinition_1_Name,
        customAttributeDefinitionObjectSettings: {
          associatedEntityTypes: CustomAttributeDefinition_1_EntityTypeList_3
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false
      });
      const epSdkCustomAttributeDefinitionTask_ExecuteReturn: IEpSdkCustomAttributeDefinitionTask_ExecuteReturn = await epSdkCustomAttributeDefinitionTask.execute()
      
      const message = TestLogger.createLogMessage('epSdkCustomAttributeDefinitionTask_ExecuteReturn', epSdkCustomAttributeDefinitionTask_ExecuteReturn);
      expect(epSdkCustomAttributeDefinitionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.UPDATE);
      expect(epSdkCustomAttributeDefinitionTask_ExecuteReturn.epObject.id, message).to.eq(CustomAttributeDefinition_1_Id);

      // get the customAttributeDefintion and check entities
      const customAttributeDefinition: CustomAttributeDefinition = await EpSdkCustomAttributeDefinitionsService.getById({
        customAttributeDefinitionId: CustomAttributeDefinition_1_Id
      });
      const associatedEntityTypesString = JSON.stringify(customAttributeDefinition.associatedEntityTypes);
      const failMessage = TestLogger.createLogMessage('customAttributeDefinition.associatedEntityTypes', customAttributeDefinition.associatedEntityTypes);
      for(const associatedEntityType of CustomAttributeDefinition_1_EntityTypeList_3) {
        expect(associatedEntityTypesString, failMessage).to.include(associatedEntityType);
      }

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: customAttributeDefintion present: update to CustomAttributeDefinition_1_EntityTypeList_1`, async () => {
    try {

      const epSdkCustomAttributeDefinitionTask = new EpSdkCustomAttributeDefinitionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        attributeName: CustomAttributeDefinition_1_Name,
        customAttributeDefinitionObjectSettings: {
          associatedEntityTypes: CustomAttributeDefinition_1_EntityTypeList_1
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false
      });
      const epSdkCustomAttributeDefinitionTask_ExecuteReturn: IEpSdkCustomAttributeDefinitionTask_ExecuteReturn = await epSdkCustomAttributeDefinitionTask.execute()
      
      const message = TestLogger.createLogMessage('epSdkCustomAttributeDefinitionTask_ExecuteReturn', epSdkCustomAttributeDefinitionTask_ExecuteReturn);
      expect(epSdkCustomAttributeDefinitionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.UPDATE);
      expect(epSdkCustomAttributeDefinitionTask_ExecuteReturn.epObject.id, message).to.eq(CustomAttributeDefinition_1_Id);

      // get the customAttributeDefintion and check entities
      const customAttributeDefinition: CustomAttributeDefinition = await EpSdkCustomAttributeDefinitionsService.getById({
        customAttributeDefinitionId: CustomAttributeDefinition_1_Id
      });
      const associatedEntityTypesString = JSON.stringify(customAttributeDefinition.associatedEntityTypes);
      const failMessage = TestLogger.createLogMessage('customAttributeDefinition.associatedEntityTypes', customAttributeDefinition.associatedEntityTypes);
      for(const associatedEntityType of CustomAttributeDefinition_1_EntityTypeList_1) {
        expect(associatedEntityTypesString, failMessage).to.include(associatedEntityType);
      }

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: customAttributeDefintion absent: checkmode with existing`, async () => {
    try {

      const epSdkCustomAttributeDefinitionTask = new EpSdkCustomAttributeDefinitionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        attributeName: CustomAttributeDefinition_1_Name,
        customAttributeDefinitionObjectSettings: {
          associatedEntityTypes: []
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true
      });
      const epSdkCustomAttributeDefinitionTask_ExecuteReturn: IEpSdkCustomAttributeDefinitionTask_ExecuteReturn = await epSdkCustomAttributeDefinitionTask.execute()
      
      const message = TestLogger.createLogMessage('epSdkCustomAttributeDefinitionTask_ExecuteReturn', epSdkCustomAttributeDefinitionTask_ExecuteReturn);

      expect(epSdkCustomAttributeDefinitionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_DELETE);
      expect(epSdkCustomAttributeDefinitionTask_ExecuteReturn.epObject.id, message).to.eq(CustomAttributeDefinition_1_Id);

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: customAttributeDefintion absent`, async () => {
    try {

      const epSdkCustomAttributeDefinitionTask = new EpSdkCustomAttributeDefinitionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        attributeName: CustomAttributeDefinition_1_Name,
        customAttributeDefinitionObjectSettings: {
          associatedEntityTypes: []
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false
      });
      const epSdkCustomAttributeDefinitionTask_ExecuteReturn: IEpSdkCustomAttributeDefinitionTask_ExecuteReturn = await epSdkCustomAttributeDefinitionTask.execute()
      
      const message = TestLogger.createLogMessage('epSdkCustomAttributeDefinitionTask_ExecuteReturn', epSdkCustomAttributeDefinitionTask_ExecuteReturn);
      expect(epSdkCustomAttributeDefinitionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.DELETE);
      expect(epSdkCustomAttributeDefinitionTask_ExecuteReturn.epObject.id, message).to.eq(CustomAttributeDefinition_1_Id);
      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: customAttributeDefintion absent: checkmode with non-existing`, async () => {
    try {

      const NonExisting = 'non-existing';

      const epSdkCustomAttributeDefinitionTask = new EpSdkCustomAttributeDefinitionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        attributeName: NonExisting,
        customAttributeDefinitionObjectSettings: {
          associatedEntityTypes: []
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true
      });
      const epSdkCustomAttributeDefinitionTask_ExecuteReturn: IEpSdkCustomAttributeDefinitionTask_ExecuteReturn = await epSdkCustomAttributeDefinitionTask.execute()
      
      const message = TestLogger.createLogMessage('epSdkCustomAttributeDefinitionTask_ExecuteReturn', epSdkCustomAttributeDefinitionTask_ExecuteReturn);
      expect(epSdkCustomAttributeDefinitionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.NO_ACTION);
      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

});

