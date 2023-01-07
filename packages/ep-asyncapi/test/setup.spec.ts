import "mocha";
import path from 'path';
import { expect } from 'chai';
import {
  TestContext,
} from '@internal/tools/src';
import { 
  TestConfig,
  TestLogger
} from "./lib";


// ensure any unhandled exception cause exit = 1
function onUncaught(err: any){
  console.log(err);
  process.exit(1);
}
process.on('unhandledRejection', onUncaught);

const scriptName: string = path.basename(__filename);
const scriptDir: string = path.dirname(__filename);

TestLogger.setLogging(true);
TestLogger.logMessage(scriptName, ">>> initializing ...");

before(async() => {
  TestContext.newItId();
});

after(async() => {
  TestContext.newItId();
  // put general cleanup code here if required
});

describe(`${scriptName}`, () => {
  context(`${scriptName}`, () => {

    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: should initialize test config & logger`, async () => {
      try {
        TestConfig.init( { scriptDir: scriptDir });
        console.log(TestLogger.createLogMessage('TestConfig', {
          TestConfig: TestConfig.getConfig()
        }));
        // expect(false, TestLogger.createLogMessage('TestConfig', {
        //   TestConfig: TestConfig.getConfig()
        // })).to.be.true;
      } catch (e) {
        expect(false, TestLogger.createTestFailMessageForError('intitializing test config failed', e)).to.be.true;
      }
    });

  });
});

