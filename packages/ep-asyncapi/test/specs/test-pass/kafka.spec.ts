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
  EBrokerTypes,
  EChannelDelimiters,
  EpAsyncApiValidationError
} from '../../../src';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

let AsyncApiSpecFile: string;
let AsyncApiSpecFile_X_EpApplicationDomainName: string;


// TODO:
// test exception for channel delimiter > length 1 or length 0

describe(`${scriptName}`, () => {
    
    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: should parse and test: kafka.combined.spec.yml`, async () => {
      try {
        AsyncApiSpecFile = `${TestConfig.getConfig().dataRootDir}/test-pass/kafka/kafka.combined.spec.yml`;
        const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({
          filePath: AsyncApiSpecFile,
        });
        expect(epAsyncApiDocument.getBrokerType(), 'failed').to.eq('kafka');
        expect(epAsyncApiDocument.getChannelDelimiter(), 'failed').to.eq('.');
      } catch(e) {
        expect(e instanceof EpAsyncApiError, TestLogger.createNotEpAsyncApiErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpAsyncApiTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should parse and test with valid overrides: kafka.combined.spec.yml`, async () => {
      try {
        AsyncApiSpecFile = `${TestConfig.getConfig().dataRootDir}/test-pass/kafka/kafka.combined.spec.yml`;
        const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({
          filePath: AsyncApiSpecFile,
          overrideBrokerType: EBrokerTypes.SOLACE,
          overrideChannelDelimiter: EChannelDelimiters.SLASH,
        });
        expect(epAsyncApiDocument.getBrokerType(), 'failed').to.eq(EBrokerTypes.SOLACE);
        expect(epAsyncApiDocument.getChannelDelimiter(), 'failed').to.eq(EChannelDelimiters.SLASH);
      } catch(e) {
        expect(e instanceof EpAsyncApiError, TestLogger.createNotEpAsyncApiErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpAsyncApiTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should parse and test with invalid broker type override: kafka.combined.spec.yml`, async () => {
      const invalidBrokerType = 'unknown broker type';
      try {
        AsyncApiSpecFile = `${TestConfig.getConfig().dataRootDir}/test-pass/kafka/kafka.combined.spec.yml`;
        const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({
          filePath: AsyncApiSpecFile,
          overrideBrokerType: invalidBrokerType,
          overrideChannelDelimiter: EChannelDelimiters.SLASH,
        });
        expect(false, 'should never get here').to.be.true;
      } catch(e) {
        expect(e instanceof EpAsyncApiValidationError, TestLogger.createNotEpAsyncApiErrorMessage(e)).to.be.true;
        const epAsyncApiValidationError: EpAsyncApiValidationError = e;
        const detailsStr = JSON.stringify(epAsyncApiValidationError.details);
        expect(detailsStr, TestLogger.createTestFailMessageForError('failed', e)).to.include(invalidBrokerType);
      }
    });

    it(`${scriptName}: should parse and test with invalid channel delimiter override: kafka.combined.spec.yml`, async () => {
      const invalidChannelDelimiter = '&';
      try {
        AsyncApiSpecFile = `${TestConfig.getConfig().dataRootDir}/test-pass/kafka/kafka.combined.spec.yml`;
        const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({
          filePath: AsyncApiSpecFile,
          overrideChannelDelimiter: invalidChannelDelimiter,
        });
        expect(false, 'should never get here').to.be.true;
      } catch(e) {
        expect(e instanceof EpAsyncApiValidationError, TestLogger.createNotEpAsyncApiErrorMessage(e)).to.be.true;
        const epAsyncApiValidationError: EpAsyncApiValidationError = e;
        const detailsStr = JSON.stringify(epAsyncApiValidationError.details);
        expect(detailsStr, TestLogger.createTestFailMessageForError('failed', e)).to.include(invalidChannelDelimiter);
      }
    });

    // Confluent.json

    it(`${scriptName}: should parse and test: Confluent.json`, async () => {
      try {
        AsyncApiSpecFile = `${TestConfig.getConfig().dataRootDir}/test-pass/kafka/Confluent.json`;
        const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({
          filePath: AsyncApiSpecFile,
          overrideBrokerType: EBrokerTypes.KAFKA,
          overrideChannelDelimiter: EChannelDelimiters.UNDERSCORE
        });
        // DEBUG
        expect(epAsyncApiDocument.getBrokerType(), 'failed').to.eq('kafka');
        expect(epAsyncApiDocument.getChannelDelimiter(), 'failed').to.eq('_');
      } catch(e) {
        expect(e instanceof EpAsyncApiError, TestLogger.createNotEpAsyncApiErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpAsyncApiTestFailMessage('failed', e)).to.be.true;
      }
    });

    // avro+json-schema.spec

    it(`${scriptName}: should parse and test: avro+json-schema.spec`, async () => {
      try {
        AsyncApiSpecFile = `${TestConfig.getConfig().dataRootDir}/test-pass/kafka/avro+json-schema.spec.yml`;
        const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({
          filePath: AsyncApiSpecFile,
          overrideBrokerType: EBrokerTypes.KAFKA,
          overrideChannelDelimiter: EChannelDelimiters.UNDERSCORE
        });
        // DEBUG
        expect(epAsyncApiDocument.getBrokerType(), 'failed').to.eq('kafka');
        expect(epAsyncApiDocument.getChannelDelimiter(), 'failed').to.eq('_');
      } catch(e) {
        expect(e instanceof EpAsyncApiError, TestLogger.createNotEpAsyncApiErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpAsyncApiTestFailMessage('failed', e)).to.be.true;
      }
    });


    // discovery-agent-scan

    it(`${scriptName}: should parse and test: discovery-agent-scan.spec`, async () => {
      try {
        AsyncApiSpecFile = `${TestConfig.getConfig().dataRootDir}/test-pass/kafka/discovery-agent-scan.spec.yml`;
        const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({
          filePath: AsyncApiSpecFile,
          overrideBrokerType: EBrokerTypes.KAFKA,
          overrideChannelDelimiter: EChannelDelimiters.UNDERSCORE
        });
        // DEBUG
        expect(epAsyncApiDocument.getBrokerType(), 'failed').to.eq('kafka');
        expect(epAsyncApiDocument.getChannelDelimiter(), 'failed').to.eq('_');
      } catch(e) {
        expect(e instanceof EpAsyncApiError, TestLogger.createNotEpAsyncApiErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpAsyncApiTestFailMessage('failed', e)).to.be.true;
      }
    });


});

