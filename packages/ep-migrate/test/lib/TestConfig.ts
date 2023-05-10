import {
  ITestApiConfigBase,
  TestApiConfigBase,
} from "@internal/tools/src";

enum EEnvVarPartials {
  EP_SDK_LOG_LEVEL = "EP_SDK_LOG_LEVEL",
}

export interface ITestConfig extends ITestApiConfigBase {
  configFile: string;
  // logFile: string;
}

class TestConfig extends TestApiConfigBase {
  public init({ scriptDir }: { scriptDir: string }): void {
    super.initialize({
      appId: "TEST_EP_MIGRATE_",
    });
    const _testConfig: ITestConfig = {
      ...(this.testConfig as ITestApiConfigBase),
      configFile: `${scriptDir}/test-ep-migrate-config.yaml`,
      // logFile: `${scriptDir}/logs/${this.getAppId()}.log`,
    };
    this.testConfig = _testConfig;
  }

  public getConfig(): ITestConfig {
    return super.getConfig() as ITestConfig;
  }
}

export default new TestConfig();
