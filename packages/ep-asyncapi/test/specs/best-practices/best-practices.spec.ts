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
  EpAsyncApiValidationError,
  EpAsyncApiMessageDocument,
  EpAsyncApiBestPracticesError
} from '../../../src';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

let Global_AsyncApiSpecFile: string;
let Global_EpAsyncApiDocument: EpAsyncApiDocument;

describe(`${scriptName}`, () => {
    
    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: message-no-schema.spec.yml`, async () => {
      try {
        Global_AsyncApiSpecFile = `${TestConfig.getConfig().dataRootDir}/best-practices/message-no-schema.spec.yml`;
        Global_EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({
          filePath: Global_AsyncApiSpecFile,
        });
        Global_EpAsyncApiDocument.validate_BestPractices();
        expect(false, 'should never get here').to.be.true;
      } catch(e) {
        expect(e instanceof EpAsyncApiError, TestLogger.createNotEpAsyncApiErrorMessage(e)).to.be.true;
        expect(e instanceof EpAsyncApiBestPracticesError, TestLogger.createTestFailMessageForError('e is not instanceof EpAsyncApiBestPracticesError', e)).to.be.true;
        const epAsyncApiValidationError: EpAsyncApiValidationError = e;
        const details = epAsyncApiValidationError.details;
        expect(details.issues, TestLogger.createTestFailMessage(JSON.stringify(epAsyncApiValidationError.details, null, 2))).to.equal(EpAsyncApiMessageDocument.MissingMessagePayloadSchemaIssue);
        expect(details.value.channel, TestLogger.createTestFailMessage(JSON.stringify(epAsyncApiValidationError.details, null, 2))).to.not.be.undefined;
        expect(details.value.message, TestLogger.createTestFailMessage(JSON.stringify(epAsyncApiValidationError.details, null, 2))).to.not.be.undefined;
      }
    });

});

