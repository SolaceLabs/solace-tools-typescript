import 'mocha';
import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import yaml from "js-yaml";
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
          overrideChannelDelimiter: EChannelDelimiters.DOT,
          overrideEpApplicationDomainName: 'kafa+avro+json'
        });
        // DEBUG
        expect(epAsyncApiDocument.getBrokerType(), 'failed').to.eq('kafka');
        expect(epAsyncApiDocument.getChannelDelimiter(), 'failed').to.eq('.');
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
          overrideChannelDelimiter: EChannelDelimiters.UNDERSCORE,
          overrideEpApplicationDomainName: 'kafa+avro+json'
        });
        // DEBUG
        expect(epAsyncApiDocument.getBrokerType(), 'failed').to.eq('kafka');
        expect(epAsyncApiDocument.getChannelDelimiter(), 'failed').to.eq('_');
      } catch(e) {
        expect(e instanceof EpAsyncApiError, TestLogger.createNotEpAsyncApiErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpAsyncApiTestFailMessage('failed', e)).to.be.true;
      }
    });

    // original spec
    it(`${scriptName}: should test original json spec from file`, async () => {
      try {
        const asyncApiSpecFile: string = `${TestConfig.getConfig().dataRootDir}/test-pass/kafka/original-spec/original.spec.json`;
        const inputApiSpecAny = JSON.parse(fs.readFileSync(asyncApiSpecFile).toString());

        const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({
          filePath: asyncApiSpecFile,
          overrideEpApplicationDomainName: scriptName
        });

        const outputApiSpecJson: any = epAsyncApiDocument.getOriginalSpecAsJson();
        const outputApiSpecYamlString: string = epAsyncApiDocument.getOriginalSpecAsYamlString();

        const jsonFailedMessage = `jsonFailedMessage: \n inputApiSpecAny=\n${JSON.stringify(inputApiSpecAny)}, \n outputApiSpecJson=\n${JSON.stringify(outputApiSpecJson)}`;
        // // DEBUG
        // expect(false, jsonFailedMessage).to.be.true;
        const isJsonEqual = _.isEqual(inputApiSpecAny, outputApiSpecJson);
        expect(isJsonEqual, jsonFailedMessage).to.be.true;

        const inputAsYamlString = yaml.dump(inputApiSpecAny);
        const yamlFailedMessage = `yamlFailedMessage: \n inputAsYamlString=\n${inputAsYamlString}, \n outputApiSpecYamlString=\n${outputApiSpecYamlString}`;
        expect(inputAsYamlString, yamlFailedMessage).to.equal(outputApiSpecYamlString);
      } catch(e) {
        expect(false, TestLogger.createEpAsyncApiTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should test original json spec from any`, async () => {
      try {
        const asyncApiSpecFile: string = `${TestConfig.getConfig().dataRootDir}/test-pass/kafka/original-spec/original.spec.json`;
        const inputApiSpecAny: string = JSON.parse(fs.readFileSync(asyncApiSpecFile).toString());

        // // DEBUG
        // const debugMessage = `debugMessage: \n inputApiSpecAny=\n${inputApiSpecAny}`;
        // console.log(debugMessage);

        const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromAny({
          anySpec: JSON.parse(JSON.stringify(inputApiSpecAny)),
          overrideEpApplicationDomainName: scriptName
        });

        const outputApiSpecJson: any = epAsyncApiDocument.getOriginalSpecAsJson();
        const _outputApiSpecYamlString: string = epAsyncApiDocument.getOriginalSpecAsYamlString();

        const jsonFailedMessage = `jsonFailedMessage: \n inputApiSpecAny=\n${JSON.stringify(inputApiSpecAny)}, \n outputApiSpecJson=\n${JSON.stringify(outputApiSpecJson)}`;
        // // DEBUG
        // expect(false, jsonFailedMessage).to.be.true;
        const isJsonEqual = _.isEqual(inputApiSpecAny, outputApiSpecJson);
        expect(isJsonEqual, jsonFailedMessage).to.be.true;
        expect(JSON.stringify(inputApiSpecAny).length, 'lengths are different').to.equal(JSON.stringify(outputApiSpecJson).length);

        const _inputAsYamlString = yaml.dump(inputApiSpecAny);
        // there seems to be a blank at the end
        const inputAsYamlString = _inputAsYamlString.slice(0, -1);
        const outputApiSpecYamlString = _outputApiSpecYamlString.slice(0, -1);

        const yamlFailedMessage = `yamlFailedMessage: \n inputAsYamlString=\n>${inputAsYamlString}<\n outputApiSpecYamlString=\n>${outputApiSpecYamlString}<`;
        const isYamlEqual = _.isEqual(inputAsYamlString, outputApiSpecYamlString);
        expect(isYamlEqual, yamlFailedMessage).to.be.true;
      } catch(e) {
        expect(false, TestLogger.createEpAsyncApiTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should test original yaml spec`, async () => {
      try {
        const asyncApiSpecFile: string = `${TestConfig.getConfig().dataRootDir}/test-pass/kafka/original-spec/original.spec.yml`;
        const inputApiSpecYamlString: string = fs.readFileSync(asyncApiSpecFile).toString();

        const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({
          filePath: asyncApiSpecFile,
          overrideEpApplicationDomainName: scriptName
        });

        const outputApiSpecJson: any = epAsyncApiDocument.getOriginalSpecAsJson();
        const outputApiSpecYamlString: string = epAsyncApiDocument.getOriginalSpecAsYamlString();

        const inputAsJson: any = yaml.load(inputApiSpecYamlString);

        const jsonFailedMessage = `jsonFailedMessage: \inputAsJson=\n>${JSON.stringify(inputAsJson)}<\noutputApiSpecJson=\n>${JSON.stringify(outputApiSpecJson)}<`;
        const isJsonEqual = _.isEqual(inputAsJson, outputApiSpecJson);
        expect(isJsonEqual, jsonFailedMessage).to.be.true;

        const _inputApiSpecYamlString = inputApiSpecYamlString;
        const _outputApiSpecYamlString = outputApiSpecYamlString.slice(0, -1);
        const yamlFailedMessage = `yamlFailedMessage: \n inputApiSpecYamlString=\n>${_inputApiSpecYamlString}<\noutputApiSpecYamlString=\n>${_outputApiSpecYamlString}<`;         
        const isYamlEqual = _.isEqual(_inputApiSpecYamlString, _outputApiSpecYamlString);
        expect(isYamlEqual, yamlFailedMessage).to.be.true;
      } catch(e) {
        expect(false, TestLogger.createEpAsyncApiTestFailMessage('failed', e)).to.be.true;
      }
    });

});

