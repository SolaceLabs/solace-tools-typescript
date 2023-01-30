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
  EBrokerTypes
} from '../../../src';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

type AsyncApiSpecTestRecord = {
  asyncApiSpecFile: string;
  expected: {
    appDomainName: string;
    assetAppDomainName: string;
    brokerType: EBrokerTypes;
    channelDelimiter: string;
  }
};

const InfoAsyncApiSpec: AsyncApiSpecTestRecord = {
  asyncApiSpecFile: '',
  expected: {
    appDomainName: "info/x-ep-application-domain-name",
    assetAppDomainName:  "info/x-ep-assets-application-domain-name",
    brokerType: EBrokerTypes.KAFKA,
    channelDelimiter: '.'
  }
};
const MixedAsyncApiSpec: AsyncApiSpecTestRecord = {
  asyncApiSpecFile: '',
  expected: {
    appDomainName: "info/x-ep-application-domain-name",
    assetAppDomainName:  "top/x-ep-assets-application-domain-name",
    brokerType: EBrokerTypes.KAFKA,
    channelDelimiter: '.'
  }
}

describe(`${scriptName}`, () => {
    
    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: should initialize globals`, async () => {
      try {
        InfoAsyncApiSpec.asyncApiSpecFile = `${TestConfig.getConfig().dataRootDir}/extensions/info.spec.yml`;
        MixedAsyncApiSpec.asyncApiSpecFile = `${TestConfig.getConfig().dataRootDir}/extensions/mixed.spec.yml`;
      } catch(e) {
        expect(e instanceof EpAsyncApiError, TestLogger.createNotEpAsyncApiErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpAsyncApiTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should parse and test info spec`, async () => {
      try {
        const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({
          filePath: InfoAsyncApiSpec.asyncApiSpecFile,
        });
        const appDomainName = epAsyncApiDocument.getApplicationDomainName();
        const assetAppDomainName = epAsyncApiDocument.getAssetsApplicationDomainName();
        const brokerType = epAsyncApiDocument.getBrokerType();
        const channelDelimiter = epAsyncApiDocument.getChannelDelimiter();

        expect(appDomainName, TestLogger.createLogMessage('appDomainName', { appDomainName: appDomainName, expected: InfoAsyncApiSpec.expected.appDomainName })).to.equal(InfoAsyncApiSpec.expected.appDomainName);
        expect(assetAppDomainName, TestLogger.createLogMessage('assetAppDomainName', { assetAppDomainName: assetAppDomainName, expected: InfoAsyncApiSpec.expected.assetAppDomainName })).to.equal(InfoAsyncApiSpec.expected.assetAppDomainName);
        expect(brokerType, TestLogger.createLogMessage('brokerType', { brokerType: brokerType, expected: InfoAsyncApiSpec.expected.brokerType })).to.equal(InfoAsyncApiSpec.expected.brokerType);
        expect(channelDelimiter, TestLogger.createLogMessage('channelDelimiter', { channelDelimiter: channelDelimiter, expected: InfoAsyncApiSpec.expected.channelDelimiter })).to.equal(InfoAsyncApiSpec.expected.channelDelimiter);
      } catch(e) {
        expect(e instanceof EpAsyncApiError, TestLogger.createNotEpAsyncApiErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpAsyncApiTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should parse and test mixed spec`, async () => {
      try {
        const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({
          filePath: MixedAsyncApiSpec.asyncApiSpecFile,
        });
        const appDomainName = epAsyncApiDocument.getApplicationDomainName();
        const assetAppDomainName = epAsyncApiDocument.getAssetsApplicationDomainName();
        const brokerType = epAsyncApiDocument.getBrokerType();
        const channelDelimiter = epAsyncApiDocument.getChannelDelimiter();

        expect(appDomainName, TestLogger.createLogMessage('appDomainName', { appDomainName: appDomainName, expected: MixedAsyncApiSpec.expected.appDomainName })).to.equal(MixedAsyncApiSpec.expected.appDomainName);
        expect(assetAppDomainName, TestLogger.createLogMessage('assetAppDomainName', { assetAppDomainName: assetAppDomainName, expected: MixedAsyncApiSpec.expected.assetAppDomainName })).to.equal(MixedAsyncApiSpec.expected.assetAppDomainName);
        expect(brokerType, TestLogger.createLogMessage('brokerType', { brokerType: brokerType, expected: MixedAsyncApiSpec.expected.brokerType })).to.equal(MixedAsyncApiSpec.expected.brokerType);
        expect(channelDelimiter, TestLogger.createLogMessage('channelDelimiter', { channelDelimiter: channelDelimiter, expected: MixedAsyncApiSpec.expected.channelDelimiter })).to.equal(MixedAsyncApiSpec.expected.channelDelimiter);
      } catch(e) {
        expect(e instanceof EpAsyncApiError, TestLogger.createNotEpAsyncApiErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpAsyncApiTestFailMessage('failed', e)).to.be.true;
      }
    });

  
});

