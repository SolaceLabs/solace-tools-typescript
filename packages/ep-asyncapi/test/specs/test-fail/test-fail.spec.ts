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
  EpAsyncApiMessageError,
  EpAsyncApiMessageDocument
} from '../../../src';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

let Global_AsyncApiSpecFile: string;
let Global_EpAsyncApiDocument: EpAsyncApiDocument;

describe(`${scriptName}`, () => {
    
    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: title-too-long: should catch error`, async () => {
      try {
        Global_AsyncApiSpecFile = `${TestConfig.getConfig().dataRootDir}/test-fail/title-too-long.spec.yml`;
        Global_EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({
          filePath: Global_AsyncApiSpecFile,
        });
        expect(false, 'should never get here').to.be.true;
      } catch(e) {
        expect(e instanceof EpAsyncApiError, TestLogger.createNotEpAsyncApiErrorMessage(e)).to.be.true;
        expect(e instanceof EpAsyncApiValidationError, TestLogger.createTestFailMessageForError('e instanceof EpAsyncApiValidationError', e)).to.be.true;
        const epAsyncApiValidationError: EpAsyncApiValidationError = e;
        expect(JSON.stringify(epAsyncApiValidationError.details), TestLogger.createTestFailMessage(JSON.stringify(epAsyncApiValidationError.details, null, 2))).to.contain('epApiName');
      }
    });

    it(`${scriptName}: version-not-semver: should catch error`, async () => {
      try {
        Global_AsyncApiSpecFile = `${TestConfig.getConfig().dataRootDir}/test-fail/version-not-semver.spec.yml`;
        Global_EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({
          filePath: Global_AsyncApiSpecFile,
        });
        expect(false, 'should never get here').to.be.true;
      } catch(e) {
        expect(e instanceof EpAsyncApiError, TestLogger.createNotEpAsyncApiErrorMessage(e)).to.be.true;
        expect(e instanceof EpAsyncApiValidationError, TestLogger.createTestFailMessageForError('e instanceof EpAsyncApiValidationError', e)).to.be.true;
        const epAsyncApiValidationError: EpAsyncApiValidationError = e;
        expect(epAsyncApiValidationError.details.issues, TestLogger.createTestFailMessage(JSON.stringify(epAsyncApiValidationError.details, null, 2))).to.eq(EpAsyncApiDocument.NotSemVerIssue);
      }
    });

/*     it(`${scriptName}: no-content-type: should catch error`, async () => {
      try {
        Global_AsyncApiSpecFile = `${TestConfig.getConfig().dataRootDir}/test-fail/no-content-type.spec.yml`;
        Global_EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({
          filePath: Global_AsyncApiSpecFile,
        });
        expect(false, 'should never get here').to.be.true;
      } catch(e) {
        expect(e instanceof EpAsyncApiError, TestLogger.createNotEpAsyncApiErrorMessage(e)).to.be.true;
        expect(e instanceof EpAsyncApiMessageError, TestLogger.createTestFailMessageForError('e instanceof EpAsyncApiMessageError', e)).to.be.true;
        const epAsyncApiMessageError: EpAsyncApiMessageError = e;
        expect(epAsyncApiMessageError.details.issue, TestLogger.createTestFailMessage(epAsyncApiMessageError.details.issue)).to.eq(EpAsyncApiMessageDocument.ContentTypeIssue);
      }
    }); */

    it(`${scriptName}: very-long-event-name.spec: should catch error`, async () => {
      try {
        Global_AsyncApiSpecFile = `${TestConfig.getConfig().dataRootDir}/test-fail/very-long-event-name.spec.yml`;
        Global_EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({
          filePath: Global_AsyncApiSpecFile,
        });
        //expect(false, 'should never get here').to.be.true;
      } catch(e) {
        expect(e instanceof EpAsyncApiError, TestLogger.createNotEpAsyncApiErrorMessage(e)).to.be.true;
        expect(e instanceof EpAsyncApiValidationError, TestLogger.createTestFailMessageForError('e instanceof EpAsyncApiValidationError', e)).to.be.true;
        const epAsyncApiValidationError: EpAsyncApiValidationError = e;
        expect(JSON.stringify(epAsyncApiValidationError.details), TestLogger.createTestFailMessage(JSON.stringify(epAsyncApiValidationError.details, null, 2))).to.contain('epEventName');
      }
    });

});

