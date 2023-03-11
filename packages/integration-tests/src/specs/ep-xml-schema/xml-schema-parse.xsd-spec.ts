import "mocha";
import { expect } from "chai";
import path from "path";
import fs from 'fs';
import { TestContext, TestUtils } from "@internal/tools/src";
import { TestLogger, TestConfig, TestService } from "../../lib";
import {
  ApiError,
  EventApIsService
} from "@solace-labs/ep-openapi-node";
import { 
  EEpSdkSchemaContentType,
  EEpSdkSchemaType,
  EEpSdkTask_TargetState, 
  EpSdkEpEventTask, 
  EpSdkEpEventVersionTask, 
  EpSdkSchemaTask,
  EpSdkSchemaVersionTask,
  EpSdkStatesService,
  IEpSdkEpEventTask_ExecuteReturn,
  IEpSdkEpEventVersionTask_ExecuteReturn,
  IEpSdkSchemaTask_ExecuteReturn,
  IEpSdkSchemaVersionTask_ExecuteReturn,
  EpSdkEventApiTask,
  IEpSdkEventApiTask_ExecuteReturn,
  EpSdkEventApiVersionTask,
  IEpSdkEventApiVersionTask_ExecuteReturn
} from "@solace-labs/ep-sdk";

import xsd from 'libxmljs2-xsd';
var libxmljs = xsd.libxmljs;

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId = TestUtils.getShortUUID();


const scriptDir: string = path.dirname(__filename);


const initializeGlobals = () => {
}

describe(`${scriptName}`, () => {
  
  before(async() => {
    TestContext.newItId();
    initializeGlobals();
  });

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async() => {
    TestContext.newItId();
  });

  it(`${scriptName}: should parse schema`, async () => {
    try {

      const schemaDir = `${scriptDir}/data/private/navcan.CAATS.xsd`;
      const schemaFilePath = TestUtils.validateFilePathWithReadPermission(`${schemaDir}/caats_external_flight_data.xsd`);

      process.chdir(schemaDir);

      console.log(`process.cwd = ${process.cwd()}`)
      const schema = xsd.parseFile(schemaFilePath);

      console.log(`schema = ${JSON.stringify(schema, null, 2)}`);


    } catch (e) {
      console.log(JSON.stringify(e, null, 2));
      expect(false, TestLogger.createTestFailMessageForError("failed", e)).to.be.true;
    }
  });


});
