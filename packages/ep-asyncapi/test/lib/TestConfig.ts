
import {
  ITestConfigBase,
  TestConfigBase,
} from '@internal/tools/src';

export interface ITestConfig extends ITestConfigBase {
  dataRootDir: string;
};

class TestConfig extends TestConfigBase {

  public init({ scriptDir }:{
    scriptDir: string;
  }): void {
    super.initialize({
      appId: 'EP_ASYNCAPI',
    });
    const _testConfig: ITestConfig = {
      ...this.testConfig,
      dataRootDir: `${scriptDir}/data`,
    };
    this.testConfig = _testConfig;
  }

  public getConfig(): ITestConfig { return super.getConfig() as ITestConfig; }

}

export default new TestConfig();