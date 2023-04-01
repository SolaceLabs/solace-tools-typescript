import 'mocha';
import { expect } from 'chai';
import path from 'path';
import {
  TestContext,
} from '@internal/tools/src';
import { 
  TestConfig,
  TestLogger
} from '../../lib';
import { 
  EpAsyncApiDocumentService,
  EpAsyncApiDocument,
  EpAsyncApiError,
  EpAsyncApiStateName2StateIdMap,
  EpAsyncApiStateName2StateIdMap_get,
  EpAsyncApiStateIds,
} from '../../../src';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

type MessageDocumentTestRecord = {
  epEventName: string;
  epAsyncApiMessageDocument_xEpSharedFlag: boolean;
  epStateId: EpAsyncApiStateIds;
}
type SchemaTestRecord = {
  epSchemaName: string;
  xEpSharedFlag: boolean;
  epStateId: EpAsyncApiStateIds;
}
type ParameterTestRecord = {
  epEnumName: string;
  xEpSharedFlag: boolean;
  epStateId: EpAsyncApiStateIds;
}
type AsyncApiSpecTestRecord = {
  asyncApiSpecFile: string;
  expected: {
    epAsyncApiDocument_xEpSharedFlag: boolean | undefined;
    epAsyncApiDocument_xEpStateId: EpAsyncApiStateIds;
    epAsyncApiMessageDocument_xEpSharedFlags: Array<MessageDocumentTestRecord>;
    epAsyncApiSchema_xEpSharedFlags: Array<SchemaTestRecord>;
    epAsyncApiParameter_xEpSharedFlags: Array<ParameterTestRecord>;
  }
};

const AsyncApiSpecFile_StateAndShared_App: AsyncApiSpecTestRecord = {
  asyncApiSpecFile: '',
  expected: {
    epAsyncApiDocument_xEpSharedFlag: undefined,
    epAsyncApiDocument_xEpStateId: '2',
    epAsyncApiMessageDocument_xEpSharedFlags: [
      {
        epEventName: "Consumed_Event_1_Name",
        epAsyncApiMessageDocument_xEpSharedFlag: true,
        epStateId: '2'
      },
      {
        epEventName: "Consumed_Event_2_Name",
        epAsyncApiMessageDocument_xEpSharedFlag: false,
        epStateId: '1'
      }
    ],
    epAsyncApiSchema_xEpSharedFlags: [
      {
        epSchemaName: "Consumed_Schema_1_Name",
        xEpSharedFlag: true,
        epStateId: '2'
      },
      {
        epSchemaName: "Consumed_Schema_2_Name",
        xEpSharedFlag: false,
        epStateId: '1'
      }
    ],
    epAsyncApiParameter_xEpSharedFlags: [
      {
        epEnumName: "Consumed_Enum_1_Name",
        xEpSharedFlag: true,
        epStateId: '2'
      },
      {
        epEnumName: "Consumed_Enum_2_Name",
        xEpSharedFlag: false,
        epStateId: '1'
      },
    ]
  }
};

// const AsyncApiSpecFile_StateAndShared_EventApi: AsyncApiSpecTestRecord = {
//   asyncApiSpecFile: '',
//   expected: {
//     epAsyncApiDocument_xEpSharedFlag: true,
//     epAsyncApiMessageDocument_xEpSharedFlag: true
//   }
// };

describe(`${scriptName}`, () => {
    
    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: should initialize globals`, async () => {
      try {
        AsyncApiSpecFile_StateAndShared_App.asyncApiSpecFile = `${TestConfig.getConfig().dataRootDir}/extensions/state+shared.app.spec.yml`;
        // AsyncApiSpecFile_StateAndShared_EventApi.asyncApiSpecFile = `${TestConfig.getConfig().dataRootDir}/extensions/state+shared.event-api.spec.yml`;
      } catch(e) {
        expect(e instanceof EpAsyncApiError, TestLogger.createNotEpAsyncApiErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpAsyncApiTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should parse and test AsyncApiSpecFile_StateAndShared_App spec for shared flag`, async () => {
      try {
        const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({
          filePath: AsyncApiSpecFile_StateAndShared_App.asyncApiSpecFile
        });
        // api
        const epAsyncApiDocument_IsSharedTrue = epAsyncApiDocument.getEpIsShared(true);
        expect(epAsyncApiDocument_IsSharedTrue, TestLogger.createLogMessage('epAsyncApiDocument_IsSharedTrue', { epAsyncApiDocument_IsSharedTrue, expected: true })).to.be.true;
        const epAsyncApiDocument_epIsSharedFalse = epAsyncApiDocument.getEpIsShared(false);
        expect(epAsyncApiDocument_epIsSharedFalse, TestLogger.createLogMessage('epAsyncApiDocument_epIsSharedFalse', { epAsyncApiDocument_epIsSharedFalse, expected: false })).to.be.false;
        const messageDocumentMap = epAsyncApiDocument.getEpAsyncApiMessageDocumentMap();
        for(const [key, epAsyncApiMessageDocument] of messageDocumentMap) {
          // messages
          const epAsyncApiMessageDocument_xEpSharedFlag = epAsyncApiMessageDocument.getMessageEpIsShared(true);
          const expectedMessageDocumentTestRecord = AsyncApiSpecFile_StateAndShared_App.expected.epAsyncApiMessageDocument_xEpSharedFlags.find( (x) => { return x.epEventName === epAsyncApiMessageDocument.getMessageName(); });
          expect(expectedMessageDocumentTestRecord, TestLogger.createLogMessage('expectedMessageDocumentTestRecord', {messageName: epAsyncApiMessageDocument.getMessageName()})).to.not.be.undefined;
          expect(epAsyncApiMessageDocument_xEpSharedFlag, TestLogger.createLogMessage('epAsyncApiMessageDocument_xEpSharedFlag', { epAsyncApiMessageDocument_xEpSharedFlag, expected: expectedMessageDocumentTestRecord?.epAsyncApiMessageDocument_xEpSharedFlag })).to.equal(expectedMessageDocumentTestRecord?.epAsyncApiMessageDocument_xEpSharedFlag);
          // schemas
          const schemaName = epAsyncApiMessageDocument.getPayloadSchemaName();
          const epAsyncApiSchema_xEpSharedFlag = epAsyncApiMessageDocument.getPayloadSchemaEpIsShared(true);
          const expectedSchemaTestRecord = AsyncApiSpecFile_StateAndShared_App.expected.epAsyncApiSchema_xEpSharedFlags.find( (x) => { return x.epSchemaName === schemaName; });
          expect(expectedSchemaTestRecord, TestLogger.createLogMessage('expectedSchemaTestRecord', {schemaName})).to.not.be.undefined;
          expect(epAsyncApiSchema_xEpSharedFlag, TestLogger.createLogMessage('epAsyncApiSchema_xEpSharedFlag', { schemaName, epAsyncApiSchema_xEpSharedFlag, expected: expectedSchemaTestRecord?.xEpSharedFlag })).to.equal(expectedSchemaTestRecord?.xEpSharedFlag);
        }
        // enums
        const epAsyncApiChannelDocumentMap = epAsyncApiDocument.getEpAsyncApiChannelDocumentMap();
        for(const [key, epAsyncApiChannelDocument] of epAsyncApiChannelDocumentMap) {
          const epAsyncApiChannelParameterDocumentMap = epAsyncApiChannelDocument.getEpAsyncApiChannelParameterDocumentMap();
          expect(epAsyncApiChannelParameterDocumentMap, TestLogger.createLogMessage('epAsyncApiChannelParameterDocumentMap', { key })).to.not.be.undefined;
          if(epAsyncApiChannelParameterDocumentMap === undefined) throw new Error('epAsyncApiChannelParameterDocumentMap === undefined');
          for(const [parameterName, epAsyncApiChannelParameterDocument] of epAsyncApiChannelParameterDocumentMap) {
            const parameterValueList = epAsyncApiChannelParameterDocument.getParameterEnumValueList();
            if(parameterValueList.length > 0) {
              // it's an enum
              const epAsyncApiEnum_xEpSharedFlag = epAsyncApiChannelParameterDocument.getEpIsShared(true);
              const expectedParameterTestRecord = AsyncApiSpecFile_StateAndShared_App.expected.epAsyncApiParameter_xEpSharedFlags.find( (x) => { return x.epEnumName === parameterName; });
              expect(expectedParameterTestRecord, TestLogger.createLogMessage('expectedParameterTestRecord', {parameterName})).to.not.be.undefined;
              expect(epAsyncApiEnum_xEpSharedFlag, TestLogger.createLogMessage('epAsyncApiEnum_xEpSharedFlag', { parameterName, epAsyncApiEnum_xEpSharedFlag, expected: expectedParameterTestRecord?.xEpSharedFlag })).to.equal(expectedParameterTestRecord?.xEpSharedFlag);
            }
          }
        }

      } catch(e) {
        expect(e instanceof EpAsyncApiError, TestLogger.createNotEpAsyncApiErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpAsyncApiTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should parse and test AsyncApiSpecFile_StateAndShared_App spec for state`, async () => {
      try {
        const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({
          filePath: AsyncApiSpecFile_StateAndShared_App.asyncApiSpecFile
        });
        // api
        const epAsyncApiDocument_StateId = epAsyncApiDocument.getEpStateId(EpAsyncApiStateName2StateIdMap_get("retired"));
        const expectedStateId = AsyncApiSpecFile_StateAndShared_App.expected.epAsyncApiDocument_xEpStateId;
        expect(epAsyncApiDocument_StateId, TestLogger.createLogMessage('epAsyncApiDocument_StateId', { epAsyncApiDocument_StateId, expectedStateId })).to.equal(expectedStateId);

        const messageDocumentMap = epAsyncApiDocument.getEpAsyncApiMessageDocumentMap();
        for(const [key, epAsyncApiMessageDocument] of messageDocumentMap) {
          // messages
          const epAsyncApiMessageDocument_StateId = epAsyncApiMessageDocument.getEpStateId(EpAsyncApiStateName2StateIdMap_get("retired"));           
          const messageName = epAsyncApiMessageDocument.getMessageName();
          const expectedMessageDocumentTestRecord = AsyncApiSpecFile_StateAndShared_App.expected.epAsyncApiMessageDocument_xEpSharedFlags.find( (x) => { return x.epEventName === messageName; });
          expect(expectedMessageDocumentTestRecord, TestLogger.createLogMessage('expectedMessageDocumentTestRecord', {messageName})).to.not.be.undefined;
          const expectedMessageStateId = expectedMessageDocumentTestRecord?.epStateId;
          expect(epAsyncApiMessageDocument_StateId, TestLogger.createLogMessage('epAsyncApiMessageDocument_StateId', { messageName, epAsyncApiMessageDocument_StateId, expectedMessageStateId })).to.equal(expectedMessageStateId);
          // schemas
          const schemaName = epAsyncApiMessageDocument.getPayloadSchemaName();
          const epAsyncApiSchema_StateId = epAsyncApiMessageDocument.getPayloadSchemaEpStateId(EpAsyncApiStateName2StateIdMap_get("retired"));
          const expectedSchemaTestRecord = AsyncApiSpecFile_StateAndShared_App.expected.epAsyncApiSchema_xEpSharedFlags.find( (x) => { return x.epSchemaName === schemaName; });
          expect(expectedSchemaTestRecord, TestLogger.createLogMessage('expectedSchemaTestRecord', {schemaName})).to.not.be.undefined;
          const expectedSchemaStateId = expectedSchemaTestRecord?.epStateId;
          expect(epAsyncApiSchema_StateId, TestLogger.createLogMessage('epAsyncApiSchema_StateId', { schemaName, epAsyncApiSchema_StateId, expectedSchemaStateId })).to.equal(expectedSchemaStateId);
        }
        // enums
        const epAsyncApiChannelDocumentMap = epAsyncApiDocument.getEpAsyncApiChannelDocumentMap();
        for(const [key, epAsyncApiChannelDocument] of epAsyncApiChannelDocumentMap) {
          const epAsyncApiChannelParameterDocumentMap = epAsyncApiChannelDocument.getEpAsyncApiChannelParameterDocumentMap();
          expect(epAsyncApiChannelParameterDocumentMap, TestLogger.createLogMessage('epAsyncApiChannelParameterDocumentMap', { key })).to.not.be.undefined;
          if(epAsyncApiChannelParameterDocumentMap === undefined) throw new Error('epAsyncApiChannelParameterDocumentMap === undefined');
          for(const [parameterName, epAsyncApiChannelParameterDocument] of epAsyncApiChannelParameterDocumentMap) {
            const parameterValueList = epAsyncApiChannelParameterDocument.getParameterEnumValueList();
            if(parameterValueList.length > 0) {
              // it's an enum
              const epAsyncApiEnum_StateId = epAsyncApiChannelParameterDocument.getEpStateId(EpAsyncApiStateName2StateIdMap_get("retired"));
              const expectedParameterTestRecord = AsyncApiSpecFile_StateAndShared_App.expected.epAsyncApiParameter_xEpSharedFlags.find( (x) => { return x.epEnumName === parameterName; });
              expect(expectedParameterTestRecord, TestLogger.createLogMessage('expectedParameterTestRecord', {parameterName})).to.not.be.undefined;
              const expectedEnumStateId = expectedParameterTestRecord?.epStateId;
              expect(epAsyncApiEnum_StateId, TestLogger.createLogMessage('epAsyncApiEnum_StateId', { parameterName, epAsyncApiEnum_StateId, expectedEnumStateId })).to.equal(expectedEnumStateId);
            }
          }
        }

      } catch(e) {
        expect(e instanceof EpAsyncApiError, TestLogger.createNotEpAsyncApiErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpAsyncApiTestFailMessage('failed', e)).to.be.true;
      }
    });

});

