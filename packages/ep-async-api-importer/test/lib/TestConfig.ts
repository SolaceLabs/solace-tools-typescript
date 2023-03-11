import { EEpSdkLogLevel } from "@solace-labs/ep-sdk";
import {
  ITestSolaceCloudApiConfigBase,
  TestSolaceCloudApiConfigBase,
} from "@internal/tools/src";

enum EEnvVarPartials {
  EP_SDK_LOG_LEVEL = "EP_SDK_LOG_LEVEL",
}

export interface ITestConfig extends ITestSolaceCloudApiConfigBase {
  dataRootDir: string;
  tmpDir: string;
  epSdkLogLevel: EEpSdkLogLevel;
}

class TestConfig extends TestSolaceCloudApiConfigBase {
  public init({ scriptDir }: { scriptDir: string }): void {
    super.initialize({
      appId: "TEST_EP_ASYNC_API_IMPORTER",
    });
    const _testConfig: ITestConfig = {
      ...(this.testConfig as ITestSolaceCloudApiConfigBase),
      dataRootDir: this.getValidatedReadDir(`${scriptDir}/data`),
      tmpDir: this.createReadWriteDir(`${scriptDir}/tmp`),
      epSdkLogLevel: this.getMandatoryEnvVarValueAsNumber(
        this.createEnvVar({ envVarPartial: EEnvVarPartials.EP_SDK_LOG_LEVEL })
      ),
    };
    this.testConfig = _testConfig;
  }

  public getConfig(): ITestConfig {
    return super.getConfig() as ITestConfig;
  }
}

export default new TestConfig();
