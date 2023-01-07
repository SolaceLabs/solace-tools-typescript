import 'mocha';
import { expect } from 'chai';
import path from 'path';
import {
  TestContext,
} from '@internal/tools/src';
import { 
  TestLogger,
} from '../../lib';
import { 
  EpSdkUtils,
} from '../../../src';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

enum TestEnum {
  one = "one",
  two = "two"
};
let EnumValue: TestEnum;


describe(`${scriptName}`, () => {
    
    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: should assertNever`, async () => {
      try {
        switch(EnumValue) {
          case TestEnum.one:
            break;
          case TestEnum.two:
            break;  
          default:
            EpSdkUtils.assertNever(scriptName, EnumValue);    
        }
        expect(false, "should never get here").to.be.true;
      } catch(e) {
        expect(e.message, 'wrong error').to.include(scriptName);
      }
    });

});

