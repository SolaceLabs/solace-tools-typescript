
import {
  ITestSolaceCloudApiConfigBase,
  TestSolaceCloudApiConfigBase,
} from '@internal/tools/src/testLib';
import { EEpSdkLogLevel } from '@solace-labs/ep-sdk';

enum EEnvVarPartials {
  EP_SDK_LOG_LEVEL = "EP_SDK_LOG_LEVEL",
};

export interface ITestConfig extends ITestSolaceCloudApiConfigBase {
  dataRootDir: string;
  epSdkLogLevel: EEpSdkLogLevel;
};

class TestConfig extends TestSolaceCloudApiConfigBase {

  public init({ scriptDir }: { scriptDir: string }): void {
    super.initialize({
      appId: 'INTEGRATION_TESTS',
    });
    const _testConfig: ITestConfig = {
      ...(this.testConfig as ITestSolaceCloudApiConfigBase),
      dataRootDir: this.getValidatedReadDir(`${scriptDir}/data`),
      epSdkLogLevel: this.getMandatoryEnvVarValueAsNumber(this.createEnvVar({ envVarPartial: EEnvVarPartials.EP_SDK_LOG_LEVEL })
      ),
    };
    this.testConfig = _testConfig;
  }

  public getConfig(): ITestConfig { return super.getConfig() as ITestConfig; }

}

export default new TestConfig();