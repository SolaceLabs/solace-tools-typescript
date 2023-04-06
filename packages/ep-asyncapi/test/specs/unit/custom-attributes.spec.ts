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
} from '../../../src';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

type CustomAttributeTestRecord = {
  name: string;
  value: string;
}
type ObjectCustomAttributeTestRecord = {
  objectName: string;
  customAttributes: Array<CustomAttributeTestRecord>;
}
type AsyncApiSpecTestRecord = {
  asyncApiSpecFile: string;
  expected: {
    api: Array<CustomAttributeTestRecord>;
    events: Array<ObjectCustomAttributeTestRecord>;
    schemas: Array<ObjectCustomAttributeTestRecord>;
    enums: Array<ObjectCustomAttributeTestRecord>;
  }
};
const AsyncApiSpecFile_1: AsyncApiSpecTestRecord = {
  asyncApiSpecFile: '',
  expected: {
    api: [
      { name: "eventApiComplex_1", value: "eventApiComplex_1" },
      { name: "eventApiSimple_1", value: "eventApiSimple_1" },
    ],
    events: [
      {
        objectName: "EventWithCustomAttributes",
        customAttributes: [
          { name: "eventSimple_1", value: "eventSimple_1" },
          { name: "eventComplex_1", value: "eventComplex_197sdf987asf97(&%&^&(*&\neventComplex_197sdf987asf97(&%&^&(*&\n\
eventComplex_197sdf987asf97(&%&^&(*&" },    
        ]
      }
    ],
    schemas: [
      {
        objectName: "schemaWithCustomAttributes",
        customAttributes: [
          { name: "schemaSimple_1", value: "schemaSimple_1" },
          { name: "schemaComplex_1", value: "schemaComplex_1^Y*^%^&$^£$$^%$^$^%$^%schemaComplex_1^Y*^%^&$^£" },    
        ]
      }
    ],
    enums: [
      {
        objectName: "EnumWithCustomAttributes",
        customAttributes: [
          { name: "enumSimple_1", value: "simple_1_value" },
          { name: "enumComplex_1", value: "complex_1_value" },    
        ]
      }
    ]
  }
};

describe(`${scriptName}`, () => {
    
    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: should initialize globals`, async () => {
      try {
        AsyncApiSpecFile_1.asyncApiSpecFile = `${TestConfig.getConfig().dataRootDir}/extensions/customattributes.spec.yml`;
      } catch(e) {
        expect(e instanceof EpAsyncApiError, TestLogger.createNotEpAsyncApiErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpAsyncApiTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should parse and test AsyncApiSpecFile_1 spec for custom attributes`, async () => {
      try {
        const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({
          filePath: AsyncApiSpecFile_1.asyncApiSpecFile
        });
        // api
        for(const customAttributeTestRecord of AsyncApiSpecFile_1.expected.api) {
          const value = epAsyncApiDocument.getEpCustomAttributeValue(customAttributeTestRecord.name);
          expect(value, TestLogger.createLogMessage('customAttributeTestRecord', { customAttributeTestRecord })).to.equal(customAttributeTestRecord.value);
        }        
        const messageDocumentMap = epAsyncApiDocument.getEpAsyncApiMessageDocumentMap();
        for(const [key, epAsyncApiMessageDocument] of messageDocumentMap) {
          // messages
          const foundEventTestRecord = AsyncApiSpecFile_1.expected.events.find( (x) => { return x.objectName === key });
          if(foundEventTestRecord === undefined) throw new Error(`foundEventTestRecord === undefined, key=${key}`);
          for(const customAttributeTestRecord of foundEventTestRecord.customAttributes) {
            const value = epAsyncApiMessageDocument.getEpCustomAttributeValue(customAttributeTestRecord.name);
            expect(value, TestLogger.createLogMessage('customAttributeTestRecord', { customAttributeTestRecord })).to.equal(customAttributeTestRecord.value);
          }        
          // schemas
          const schemaName = epAsyncApiMessageDocument.getPayloadSchemaName();
          const foundSchemaTestRecord = AsyncApiSpecFile_1.expected.schemas.find( (x) => { return x.objectName === schemaName });
          if(foundSchemaTestRecord === undefined) throw new Error(`foundSchemaTestRecord === undefined, key=${schemaName}`);
          for(const customAttributeTestRecord of foundSchemaTestRecord.customAttributes) {
            const value = epAsyncApiMessageDocument.getPayloadSchemaEpCustomAttributeValue(customAttributeTestRecord.name);
            expect(value, TestLogger.createLogMessage('customAttributeTestRecord', { customAttributeTestRecord })).to.equal(customAttributeTestRecord.value);
          }        
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
              const foundEnumTestRecord = AsyncApiSpecFile_1.expected.enums.find( (x) => { return x.objectName === parameterName });
              if(foundEnumTestRecord === undefined) throw new Error(`foundEnumTestRecord === undefined, key=${parameterName}`);
              for(const customAttributeTestRecord of foundEnumTestRecord.customAttributes) {
                const value = epAsyncApiChannelParameterDocument.getEpCustomAttributeValue(customAttributeTestRecord.name);
                expect(value, TestLogger.createLogMessage('customAttributeTestRecord', { customAttributeTestRecord })).to.equal(customAttributeTestRecord.value);
              }        
            }
          }
        }

      } catch(e) {
        expect(e instanceof EpAsyncApiError, TestLogger.createNotEpAsyncApiErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpAsyncApiTestFailMessage('failed', e)).to.be.true;
      }
    });

});

