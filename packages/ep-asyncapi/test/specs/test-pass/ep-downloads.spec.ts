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
  T_EpAsyncApiChannelDocumentMap
} from '../../../src';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

let AsyncApiSpecFile: string;

const expectedApplicationDomainName = "TEST_EP_ASYNC_API_IMPORTER/multi-domain.x-spec.ts/ApplicationDomain_Main_Name";


describe(`${scriptName}`, () => {
    
    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: should initialize globals`, async () => {
      try {
        AsyncApiSpecFile = `${TestConfig.getConfig().dataRootDir}/ep-downloads/EventApi-Name.json`;
      } catch(e) {
        expect(e instanceof EpAsyncApiError, TestLogger.createNotEpAsyncApiErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpAsyncApiTestFailMessage('failed', e)).to.be.true;
      }
    });


    it(`${scriptName}: should parse spec`, async () => {
      try {
        const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({
          filePath: AsyncApiSpecFile,
        });
        const appDomainName = epAsyncApiDocument.getApplicationDomainName();
        expect(appDomainName, 'failed').to.eq(expectedApplicationDomainName);
        // walk the document
        const epAsyncApiChannelDocumentMap: T_EpAsyncApiChannelDocumentMap = epAsyncApiDocument.getEpAsyncApiChannelDocumentMap();
        for(const [topic, epAsyncApiChannelDocument] of epAsyncApiChannelDocumentMap) {
          const epEventName = epAsyncApiChannelDocument.getEpEventName();
          const epEventVersionName = epAsyncApiChannelDocument.getEpEventVersionName();
          const epAsyncApiChannelParameterDocumentMap = epAsyncApiChannelDocument.getEpAsyncApiChannelParameterDocumentMap();
          for(const [parameter, epAsyncApiChannelParameterDocument] of epAsyncApiChannelParameterDocumentMap) {
            const parameterDisplayName = epAsyncApiChannelParameterDocument.getDisplayName();
            const parameterDescription = epAsyncApiChannelParameterDocument.getDescription();
            const debug = {
              topic, 
              epEventName, 
              epEventVersionName,
              parameter,
              parameterDisplayName,
              parameterDescription
            }
            console.log(`debug = ${JSON.stringify(debug, null, 2)}`);  
          }
        }
      } catch(e) {
        expect(e instanceof EpAsyncApiError, TestLogger.createNotEpAsyncApiErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpAsyncApiTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should validate best practices`, async () => {
      try {
        const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({
          filePath: AsyncApiSpecFile,
        });
        epAsyncApiDocument.validate_BestPractices();
      } catch(e) {
        expect(e instanceof EpAsyncApiError, TestLogger.createNotEpAsyncApiErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpAsyncApiTestFailMessage('failed', e)).to.be.true;
      }
    });

});

