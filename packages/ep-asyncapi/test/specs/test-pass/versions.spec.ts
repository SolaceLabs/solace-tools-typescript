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
} from '../../../src';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

describe(`${scriptName}`, () => {
    
    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: should test extensions on version 2.0.0`, async () => {
      try {
        const expectedApplicationDomainName = "x-ep-application-domain-name";
        const expectedAssetsApplicationDomainName = "x-ep-assets-application-domain-name";
        const asyncApiSpecFile: string = `${TestConfig.getConfig().dataRootDir}/test-pass/versions/version_2.0.0.yml`;
        const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({
          filePath: asyncApiSpecFile,
        });
        const parsedApplicationDomainName = epAsyncApiDocument.getApplicationDomainName();
        const parsedAssetsApplicationDomainName = epAsyncApiDocument.getAssetsApplicationDomainName();

        expect(expectedApplicationDomainName, 'failed application domain name').to.equal(parsedApplicationDomainName);
        expect(expectedAssetsApplicationDomainName, 'failed assets application domain name').to.equal(parsedAssetsApplicationDomainName);

      } catch(e) {
        expect(false, TestLogger.createEpAsyncApiTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should test extensions on version 2.5.0`, async () => {
      try {
        const expectedApplicationDomainName = "x-ep-application-domain-name";
        const expectedAssetsApplicationDomainName = "x-ep-assets-application-domain-name";
        const asyncApiSpecFile: string = `${TestConfig.getConfig().dataRootDir}/test-pass/versions/version_2.5.0.yml`;
        const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({
          filePath: asyncApiSpecFile,
        });
        const parsedApplicationDomainName = epAsyncApiDocument.getApplicationDomainName();
        const parsedAssetsApplicationDomainName = epAsyncApiDocument.getAssetsApplicationDomainName();

        expect(expectedApplicationDomainName, 'failed application domain name').to.equal(parsedApplicationDomainName);
        expect(expectedAssetsApplicationDomainName, 'failed assets application domain name').to.equal(parsedAssetsApplicationDomainName);

      } catch(e) {
        expect(false, TestLogger.createEpAsyncApiTestFailMessage('failed', e)).to.be.true;
      }
    });


});

