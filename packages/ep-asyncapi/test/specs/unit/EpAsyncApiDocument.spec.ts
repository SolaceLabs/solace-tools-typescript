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
  EpAsyncApiError
} from '../../../src';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

let Global_AsyncApiSpecFile: string;
let Global_AsyncApiSpecFile_X_EpApplicationDomainName: string;
let Global_AsyncApiSpecFile_X_EpAssetsApplicationDomainName: string;
let Global_Title: string;
let Global_EpAsyncApiDocument: EpAsyncApiDocument;

describe(`${scriptName}`, () => {
    
    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: should initialize globals`, async () => {
      try {
        Global_AsyncApiSpecFile = `${TestConfig.getConfig().dataRootDir}/test-pass/01.title-special-chars.spec.yml`;
        Global_AsyncApiSpecFile_X_EpApplicationDomainName = "solace-labs/ep-asyncapi/test";
        Global_AsyncApiSpecFile_X_EpAssetsApplicationDomainName = 
        Global_Title = "slash=/,amp;=&,star=*,quotes=''";
      } catch(e) {
        expect(e instanceof EpAsyncApiError, TestLogger.createNotEpAsyncApiErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpAsyncApiTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should parse spec`, async () => {
      try {
        Global_EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({
          filePath: Global_AsyncApiSpecFile,
        });
        const appDomainName = Global_EpAsyncApiDocument.getApplicationDomainName();
        expect(appDomainName, 'failed').to.eq(Global_AsyncApiSpecFile_X_EpApplicationDomainName);
      } catch(e) {
        expect(e instanceof EpAsyncApiError, TestLogger.createNotEpAsyncApiErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpAsyncApiTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get title as file path and file name`, async () => {
        
        const title = Global_EpAsyncApiDocument.getTitle();
        expect(title, 'failed').to.eq(Global_Title);
        
        const expected_titleAsFilePath = "slash-amp-star-quotes-";
        const titleAsFilePath = Global_EpAsyncApiDocument.getEpEventApiNameAsFilePath();
        expect(titleAsFilePath, 'failed').to.eq(expected_titleAsFilePath);
        
        const expected_titleAsFileName = expected_titleAsFilePath + ".yml";
        const titleAsFileName = Global_EpAsyncApiDocument.getEpEventApiNameAsFileName('yml');
        expect(titleAsFileName, 'failed').to.eq(expected_titleAsFileName);
        
    });

    it(`${scriptName}: should get prefixed and unprefixed application domain names`, async () => {

      const originalApplicationDomainName = "originalApplicationDomainName";
      const originalAssetsApplicationDomainName = "originalAssetsApplicationDomainName";
      const prefix = "prefix";

      const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({
        filePath: Global_AsyncApiSpecFile,
        overrideEpApplicationDomainName: originalApplicationDomainName,
        overrideEpAssetApplicationDomainName: originalAssetsApplicationDomainName,
        prefixEpApplicationDomainName: prefix
      });

      const prefixedApplicationDomainName = epAsyncApiDocument.getApplicationDomainName();
      const unprefixedApplicationDomainName = epAsyncApiDocument.getUnprefixedApplicationDomainName();
      const prefixedAssetApplicationDomainName = epAsyncApiDocument.getAssetsApplicationDomainName();
      const unprefixedAssetsApplicationDomainName = epAsyncApiDocument.getUnprefixedAssetsApplicationDomainName();

      expect(prefixedApplicationDomainName, 'prefixedApplicationDomainName failed').to.include(prefix);
      expect(prefixedAssetApplicationDomainName, 'prefixedAssetApplicationDomainName failed').to.include(prefix);
      expect(unprefixedApplicationDomainName, 'unprefixedApplicationDomainName failed').to.equal(originalApplicationDomainName);
      expect(unprefixedAssetsApplicationDomainName, 'unprefixedAssetsApplicationDomainName failed').to.equal(originalAssetsApplicationDomainName);
      
  });

  
});

