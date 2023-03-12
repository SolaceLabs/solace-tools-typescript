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

const ExpectedApplicationDomainName = "TEST_EP_ASYNC_API_IMPORTER/multi-domain.x-spec.ts/ApplicationDomain_Main_Name";

const ExpectedTopic1 = "topic/{Enum_1_Name}/_1_";
const ExpectedEventName1 = "Event_1_Name";
const ExpectedEventVersionName1 = "Event_1_Version_Name";
const ExpectedEventDescription1 = "Event_1_Name description";
const ExpectedSchemaName1 = "Schema_1_Name";
const ExpectedSchemaDisplayName1 = "Schema_1_Version_Name";
const ExpectedSchemaDescription1 = "Schema_1_Name description";

const ExpectedTopic2 = "topic/{Enum_2_Name}/_2_";
const ExpectedEventName2 = "Event_2_Name";
const ExpectedEventVersionName2 = "Event_2_Version_Name";
const ExpectedEventDescription2 = "Event_2_Name description";
const ExpectedSchemaName2 = "Schema_2_Name";
const ExpectedSchemaDisplayName2 = "Schema_2_Version_Name";
const ExpectedSchemaDescription2 = "Schema_2_Name description";

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
        epAsyncApiDocument.validate();
        epAsyncApiDocument.validate_BestPractices();
        const appDomainName = epAsyncApiDocument.getApplicationDomainName();
        expect(appDomainName, 'failed').to.eq(ExpectedApplicationDomainName);
        // walk the document
        const epAsyncApiChannelDocumentMap: T_EpAsyncApiChannelDocumentMap = epAsyncApiDocument.getEpAsyncApiChannelDocumentMap();
        for(const [topic, epAsyncApiChannelDocument] of epAsyncApiChannelDocumentMap) {
          const epEventName = epAsyncApiChannelDocument.getEpEventName();
          const epEventVersionName = epAsyncApiChannelDocument.getEpEventVersionName();
          const epEventDescription = epAsyncApiChannelDocument.getEpEventDescription();
          let epSchemaName: string | undefined = undefined;
          let epSchemaDisplayName: string | undefined = undefined;
          let epSchemaDescription: string | undefined = undefined;
          if(epAsyncApiChannelDocument.getEpAsyncApiChannelPublishOperation()) {
            epSchemaName = epAsyncApiChannelDocument.getEpAsyncApiChannelPublishOperation().getEpAsyncApiMessageDocument().getPayloadSchemaName();
            epSchemaDisplayName = epAsyncApiChannelDocument.getEpAsyncApiChannelPublishOperation().getEpAsyncApiMessageDocument().getPayloadSchemaDisplayName();
            epSchemaDescription = epAsyncApiChannelDocument.getEpAsyncApiChannelPublishOperation().getEpAsyncApiMessageDocument().getPayloadSchemaDescription();
          } else if(epAsyncApiChannelDocument.getEpAsyncApiChannelSubscribeOperation()) {
            epSchemaName = epAsyncApiChannelDocument.getEpAsyncApiChannelSubscribeOperation().getEpAsyncApiMessageDocument().getPayloadSchemaName();
            epSchemaDisplayName = epAsyncApiChannelDocument.getEpAsyncApiChannelSubscribeOperation().getEpAsyncApiMessageDocument().getPayloadSchemaDisplayName();
            epSchemaDescription = epAsyncApiChannelDocument.getEpAsyncApiChannelSubscribeOperation().getEpAsyncApiMessageDocument().getPayloadSchemaDescription();
          }
          if(topic === ExpectedTopic1) {
            expect(epEventName, 'wrong event name').to.equal(ExpectedEventName1);
            expect(epEventVersionName, 'wrong event version name').to.equal(ExpectedEventVersionName1);
            expect(epEventDescription, 'wrong event descrption').to.equal(ExpectedEventDescription1);
            expect(epSchemaName, 'wrong schema name').to.equal(ExpectedSchemaName1);
            expect(epSchemaDisplayName, 'wrong schema display name').to.equal(ExpectedSchemaDisplayName1);
            expect(epSchemaDescription, 'wrong schema description').to.equal(ExpectedSchemaDescription1);
          } else if (topic === ExpectedTopic2) {
            expect(epEventName, 'wrong event name').to.equal(ExpectedEventName2);
            expect(epEventVersionName, 'wrong event version name').to.equal(ExpectedEventVersionName2);
            expect(epEventDescription, 'wrong event descrption').to.equal(ExpectedEventDescription2);
            expect(epSchemaName, 'wrong schema name').to.equal(ExpectedSchemaName2);
            expect(epSchemaDisplayName, 'wrong schema display name').to.equal(ExpectedSchemaDisplayName2);
            expect(epSchemaDescription, 'wrong schema description').to.equal(ExpectedSchemaDescription2);
          } else expect(topic, 'unknonw topic').to.be.false;

          const epAsyncApiChannelParameterDocumentMap = epAsyncApiChannelDocument.getEpAsyncApiChannelParameterDocumentMap();
          for(const [parameter, epAsyncApiChannelParameterDocument] of epAsyncApiChannelParameterDocumentMap) {
            const parameterDisplayName = epAsyncApiChannelParameterDocument.getDisplayName();
            const parameterDescription = epAsyncApiChannelParameterDocument.getDescription();
            const debug = {
              topic, 
              epEventName, 
              epEventVersionName,
              epEventDescription,
              parameter,
              parameterDisplayName,
              parameterDescription,
              epSchemaName,
              epSchemaDisplayName,
              epSchemaDescription
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

