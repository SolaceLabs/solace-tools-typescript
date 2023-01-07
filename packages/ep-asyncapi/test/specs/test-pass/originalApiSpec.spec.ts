import 'mocha';
import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import isEqual from 'lodash.isequal';
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
} from '../../../src';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

describe(`${scriptName}`, () => {
    
    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: should test original json spec from file`, async () => {
      try {
        const asyncApiSpecFile: string = `${TestConfig.getConfig().dataRootDir}/test-pass/originalApiSpec/originalApiSpec.json`;
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
        const isJsonEqual = isEqual(inputApiSpecAny, outputApiSpecJson);
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
        const asyncApiSpecFile: string = `${TestConfig.getConfig().dataRootDir}/test-pass/originalApiSpec/originalApiSpec.json`;
        const inputApiSpecAny: string = JSON.parse(fs.readFileSync(asyncApiSpecFile).toString());

        // // DEBUG
        // const debugMessage = `debugMessage: \n inputApiSpecAny=\n${inputApiSpecAny}`;
        // console.log(debugMessage);

        const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromAny({
          anySpec: JSON.parse(JSON.stringify(inputApiSpecAny)),
          overrideEpApplicationDomainName: scriptName
        });

        const outputApiSpecJson: any = epAsyncApiDocument.getOriginalSpecAsJson();
        const outputApiSpecYamlString: string = epAsyncApiDocument.getOriginalSpecAsYamlString();

        const jsonFailedMessage = `jsonFailedMessage: \n inputApiSpecAny=\n${JSON.stringify(inputApiSpecAny)}, \n outputApiSpecJson=\n${JSON.stringify(outputApiSpecJson)}`;
        // // DEBUG
        // expect(false, jsonFailedMessage).to.be.true;
        const isJsonEqual = isEqual(inputApiSpecAny, outputApiSpecJson);
        expect(isJsonEqual, jsonFailedMessage).to.be.true;
        expect(JSON.stringify(inputApiSpecAny).length, 'lengths are different').to.equal(JSON.stringify(outputApiSpecJson).length);

        const inputAsYamlString = yaml.dump(inputApiSpecAny);
        const yamlFailedMessage = `yamlFailedMessage: \n inputAsYamlString=\n${inputAsYamlString}, \n outputApiSpecYamlString=\n${outputApiSpecYamlString}`;
        expect(inputAsYamlString, yamlFailedMessage).to.equal(outputApiSpecYamlString);
      } catch(e) {
        expect(false, TestLogger.createEpAsyncApiTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should test original yaml spec`, async () => {
      try {
        const asyncApiSpecFile: string = `${TestConfig.getConfig().dataRootDir}/test-pass/originalApiSpec/originalApiSpec.yml`;
        const inputApiSpecYamlString: string = fs.readFileSync(asyncApiSpecFile).toString();

        const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({
          filePath: asyncApiSpecFile,
          overrideEpApplicationDomainName: scriptName
        });

        const outputApiSpecJson: any = epAsyncApiDocument.getOriginalSpecAsJson();
        const outputApiSpecYamlString: string = epAsyncApiDocument.getOriginalSpecAsYamlString();

        const inputAsJson: any = yaml.load(inputApiSpecYamlString);
        const jsonFailedMessage = `jsonFailedMessage: \inputAsJson=\n${JSON.stringify(inputAsJson)}, \noutputApiSpecJson=\n${JSON.stringify(outputApiSpecJson)}`;
        const isJsonEqual = isEqual(inputAsJson, outputApiSpecJson);
        expect(isJsonEqual, jsonFailedMessage).to.be.true;

        const yamlFailedMessage = `yamlFailedMessage: \n inputApiSpecYamlString=\n${inputApiSpecYamlString}, \n outputApiSpecYamlString=\n${outputApiSpecYamlString}`;         
        expect(inputApiSpecYamlString, yamlFailedMessage).to.equal(outputApiSpecYamlString);
      } catch(e) {
        expect(false, TestLogger.createEpAsyncApiTestFailMessage('failed', e)).to.be.true;
      }
    });

});

