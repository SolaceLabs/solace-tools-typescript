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

const MultiDomainAsyncApiSpec: AsyncApiSpecTestRecord = {
  asyncApiSpecFile: '',
  expected: {
    appDomainName: "domain/api",
    assetAppDomainName:  "domain/assets",
    brokerType: EBrokerTypes.SOLACE,
    channelDelimiter: '/'
  },
}

describe(`${scriptName}`, () => {
    
    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: should initialize globals`, async () => {
      try {
        InfoAsyncApiSpec.asyncApiSpecFile = `${TestConfig.getConfig().dataRootDir}/extensions/info.spec.yml`;
        MixedAsyncApiSpec.asyncApiSpecFile = `${TestConfig.getConfig().dataRootDir}/extensions/mixed.spec.yml`;
        MultiDomainAsyncApiSpec.asyncApiSpecFile = `${TestConfig.getConfig().dataRootDir}/extensions/multi-domain.spec.yml`;
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

    it(`${scriptName}: should parse and test multi domain spec`, async () => {
      try {
        const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({
          filePath: MultiDomainAsyncApiSpec.asyncApiSpecFile,
        });
        const appDomainName = epAsyncApiDocument.getApplicationDomainName();
        const assetAppDomainName = epAsyncApiDocument.getAssetsApplicationDomainName();
        const brokerType = epAsyncApiDocument.getBrokerType();
        const channelDelimiter = epAsyncApiDocument.getChannelDelimiter();

        expect(appDomainName, TestLogger.createLogMessage('appDomainName', { appDomainName: appDomainName, expected: MultiDomainAsyncApiSpec.expected.appDomainName })).to.equal(MultiDomainAsyncApiSpec.expected.appDomainName);
        expect(assetAppDomainName, TestLogger.createLogMessage('assetAppDomainName', { assetAppDomainName: assetAppDomainName, expected: MultiDomainAsyncApiSpec.expected.assetAppDomainName })).to.equal(MultiDomainAsyncApiSpec.expected.assetAppDomainName);
        expect(brokerType, TestLogger.createLogMessage('brokerType', { brokerType: brokerType, expected: MultiDomainAsyncApiSpec.expected.brokerType })).to.equal(MultiDomainAsyncApiSpec.expected.brokerType);
        expect(channelDelimiter, TestLogger.createLogMessage('channelDelimiter', { channelDelimiter: channelDelimiter, expected: MultiDomainAsyncApiSpec.expected.channelDelimiter })).to.equal(MultiDomainAsyncApiSpec.expected.channelDelimiter);

        const epApiName = epAsyncApiDocument.getEpApiName();
        expect(epApiName, TestLogger.createLogMessage('failed',{ epApiName })).to.equal('Multi_Domain_Api_Name');
        const getEpApiVersionName = epAsyncApiDocument.getEpApiVersionName();
        expect(getEpApiVersionName, TestLogger.createLogMessage('failed', { getEpApiVersionName })).to.equal('Multi_Domain_Api_DisplayName');

        const getEpAsyncApiChannelDocumentMap = epAsyncApiDocument.getEpAsyncApiChannelDocumentMap();
        for(const [key, epAsyncApiChannelDocument] of getEpAsyncApiChannelDocumentMap) {
          {
            const getEpAsyncApiChannelParameterDocumentMap = epAsyncApiChannelDocument.getEpAsyncApiChannelParameterDocumentMap();
            if(getEpAsyncApiChannelParameterDocumentMap) {
              for(const [key, epAsyncApiChannelParameterDocument] of getEpAsyncApiChannelParameterDocumentMap) {
                const parameterName = key;
                const isParameterShared = epAsyncApiChannelParameterDocument.isParameterShared()
                const parameterDisplayName = epAsyncApiChannelParameterDocument.getDisplayName();
                const parameterAppDomainName = epAsyncApiChannelParameterDocument.getEpApplicationDomainName();
                expect(isParameterShared).to.be.false
                expect(parameterDisplayName, TestLogger.createLogMessage('failed', { parameterDisplayName })).to.equal(`${parameterName}_displayName`);
                expect(parameterAppDomainName, TestLogger.createLogMessage('failed', { parameterAppDomainName })).to.equal(`domain/${parameterName}`);
              }
            }
            const getEpAsyncApiChannelPublishOperation = epAsyncApiChannelDocument.getEpAsyncApiChannelPublishOperation();
            if(getEpAsyncApiChannelPublishOperation) {
              const getEpAsyncApiMessageDocument = getEpAsyncApiChannelPublishOperation.getEpAsyncApiMessageDocument();

              const messageName = getEpAsyncApiMessageDocument.getMessageName();
              const messageDisplayName = getEpAsyncApiMessageDocument.getMessageDisplayName();
              const messageAppDomainName = getEpAsyncApiMessageDocument.getMessageEpApplicationDomainName();
              const isSchemaShared = getEpAsyncApiMessageDocument.isSchemaShared()
              expect(messageDisplayName, TestLogger.createLogMessage('failed', { messageDisplayName })).to.equal(`${messageName}_displayName`);
              expect(messageAppDomainName, TestLogger.createLogMessage('failed', { messageAppDomainName })).to.equal(`domain/${messageName}`);
              expect(isSchemaShared).to.be.false
  
              const schemaName = getEpAsyncApiMessageDocument.getPayloadSchemaName();
              const schemaDisplayName = getEpAsyncApiMessageDocument.getPayloadSchemaDisplayName();
              const schemaAppDomainName = getEpAsyncApiMessageDocument.getPayloadSchemaEpApplicationDomainName();
              expect(schemaDisplayName, TestLogger.createLogMessage('failed', { schemaDisplayName })).to.equal(`${schemaName}_displayName`);
              expect(schemaAppDomainName, TestLogger.createLogMessage('failed', { schemaAppDomainName })).to.equal(`domain/${schemaName}`);
            }
            const getEpAsyncApiChannelSubscribeOperation = epAsyncApiChannelDocument.getEpAsyncApiChannelSubscribeOperation();
            if(getEpAsyncApiChannelSubscribeOperation) {
              const getEpAsyncApiMessageDocument = getEpAsyncApiChannelSubscribeOperation.getEpAsyncApiMessageDocument();

              const messageName = getEpAsyncApiMessageDocument.getMessageName();
              const messageDisplayName = getEpAsyncApiMessageDocument.getMessageDisplayName();
              const messageAppDomainName = getEpAsyncApiMessageDocument.getMessageEpApplicationDomainName();
              expect(messageDisplayName, TestLogger.createLogMessage('failed', { messageDisplayName })).to.equal(`${messageName}_displayName`);
              expect(messageAppDomainName, TestLogger.createLogMessage('failed', { messageAppDomainName })).to.equal(`domain/${messageName}`);
  
              const schemaName = getEpAsyncApiMessageDocument.getPayloadSchemaName();
              const schemaDisplayName = getEpAsyncApiMessageDocument.getPayloadSchemaDisplayName();
              const schemaAppDomainName = getEpAsyncApiMessageDocument.getPayloadSchemaEpApplicationDomainName();
              expect(schemaDisplayName, TestLogger.createLogMessage('failed', { schemaDisplayName })).to.equal(`${schemaName}_displayName`);
              expect(schemaAppDomainName, TestLogger.createLogMessage('failed', { schemaAppDomainName })).to.equal(`domain/${schemaName}`);
            }
          }
        }


      } catch(e) {
        expect(e instanceof EpAsyncApiError, TestLogger.createNotEpAsyncApiErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpAsyncApiTestFailMessage('failed', e)).to.be.true;
      }
    });


  
});

