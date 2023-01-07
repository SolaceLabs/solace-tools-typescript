
import {
  ITestSolaceCloudApiConfigBase,
  TestSolaceCloudApiConfigBase,
} from '@internal/tools/src/testLib';
import { EEpSdkLogLevel } from '../../src';

enum EEnvVarPartials {
  LOG_LEVEL = "LOG_LEVEL",
};

export interface ITestConfig extends ITestSolaceCloudApiConfigBase {
  logLevel: EEpSdkLogLevel;
};

class TestConfig extends TestSolaceCloudApiConfigBase {

  public initialize(): void {
    super.initialize({
      appId: 'TEST_EP_SDK',
    });    
    this.getConfig().logLevel = this.getMandatoryEnvVarValueAsNumber(this.createEnvVar({ envVarPartial: EEnvVarPartials.LOG_LEVEL }));
  }

  public getConfig(): ITestConfig { return super.getConfig() as ITestConfig; }

}

export default new TestConfig();