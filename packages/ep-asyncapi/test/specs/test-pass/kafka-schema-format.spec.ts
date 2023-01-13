import 'mocha';
import { expect } from 'chai';
import path from 'path';
import { Validator } from 'jsonschema';
import avro from "avsc";
import {
  TestContext, 
  TestUtils,
} from '@internal/tools/src';
import { 
  TestConfig,
  TestLogger
} from '../../lib';
import { 
  EpAsyncApiDocumentService,
  EpAsyncApiDocument,
  EpAsyncApiError,
  E_EpAsyncApiSchemaFormatType,
  T_EpAsyncApiMessageDocumentMap
} from '../../../src';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

let AsyncApiSpecFile: string;
// let AsyncApiSpecFile_X_EpApplicationDomainName: string;
let AsyncApiDocument: EpAsyncApiDocument;
describe(`${scriptName}`, () => {
    
    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: should initialize globals`, async () => {
      try {
        AsyncApiSpecFile = `${TestConfig.getConfig().dataRootDir}/test-pass/kafka/avro+json-schema.spec.yml`;
        // AsyncApiSpecFile_X_EpApplicationDomainName = "Discovery";
      } catch(e) {
        expect(e instanceof EpAsyncApiError, TestLogger.createNotEpAsyncApiErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpAsyncApiTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should parse spec`, async () => {
      try {
        AsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({
          filePath: AsyncApiSpecFile,
        });
      } catch(e) {
        expect(e instanceof EpAsyncApiError, TestLogger.createNotEpAsyncApiErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpAsyncApiTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should validate best practices`, async () => {
      try {
        AsyncApiDocument.validate_BestPractices();
      } catch(e) {
        expect(e instanceof EpAsyncApiError, TestLogger.createNotEpAsyncApiErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpAsyncApiTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should validate schema format of messages`, async () => {
      try {
        const epAsyncApiMessageDocumentMap: T_EpAsyncApiMessageDocumentMap = AsyncApiDocument.getEpAsyncApiMessageDocumentMap();
        for(const [key, epAsyncApiMessageDocument] of epAsyncApiMessageDocumentMap) {
          const epAsyncApiSchemaFormatType: E_EpAsyncApiSchemaFormatType = epAsyncApiMessageDocument.getSchemaFormatType();
          let expectedSchemaFormatType: E_EpAsyncApiSchemaFormatType;
          if(key.includes('json')) expectedSchemaFormatType = E_EpAsyncApiSchemaFormatType.APPLICATION_JSON;
          else if(key.includes('avro')) expectedSchemaFormatType = E_EpAsyncApiSchemaFormatType.APPLICATION_AVRO;
          const message = `\nkey=${key}, \nexpectedSchemaFormatType=${expectedSchemaFormatType}, \nepAsyncApiSchemaFormatType=${epAsyncApiSchemaFormatType}`;
          expect(epAsyncApiSchemaFormatType, message).to.eq(expectedSchemaFormatType);
        }
      } catch(e) {
        expect(false, TestLogger.createTestFailMessageForError('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get correct schema payload`, async () => {
      try {
        const epAsyncApiMessageDocumentMap: T_EpAsyncApiMessageDocumentMap = AsyncApiDocument.getEpAsyncApiMessageDocumentMap();
        for(const [key, epAsyncApiMessageDocument] of epAsyncApiMessageDocumentMap) {
          const epAsyncApiSchemaFormatType: E_EpAsyncApiSchemaFormatType = epAsyncApiMessageDocument.getSchemaFormatType();
          const payloadAnySchema: any = epAsyncApiMessageDocument.getSchemaAsSanitizedJson();
          const message = `\nepAsyncApiSchemaFormatType=${epAsyncApiSchemaFormatType},\n payloadAnySchema=${JSON.stringify(payloadAnySchema, null, 2)}`;
          switch(epAsyncApiSchemaFormatType) {
            case E_EpAsyncApiSchemaFormatType.APPLICATION_AVRO:
              // not really necessary, already validated in async api parser
              const at: avro.Type = avro.Type.forSchema(payloadAnySchema);
              // at.typeName
              // expect(false, message).to.be.true;
              expect(at.typeName, 'typeName mismatch').to.equal('record');
              break;
            case E_EpAsyncApiSchemaFormatType.APPLICATION_JSON:
              // not really necessary, already validated in async api parser

              // validate schema
              const v: Validator = new Validator();
              v.addSchema(payloadAnySchema);
              // expect(false, message).to.be.true;
              break;
            default:
              TestUtils.assertNever(scriptName, epAsyncApiSchemaFormatType);
          }
        }
      } catch(e) {
        expect(false, TestLogger.createTestFailMessageForError('failed', e)).to.be.true;
      }
    });

});

