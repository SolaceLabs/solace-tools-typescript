
import {
  ITestSolaceCloudApiConfigBase,
  TestSolaceCloudApiConfigBase,
} from '@internal/tools/src';

export interface ITestConfig extends ITestSolaceCloudApiConfigBase {
  // placeholder
};

class TestConfig extends TestSolaceCloudApiConfigBase {

  public initialize(): void {
    super.initialize({
      appId: 'TEST_EP_RT_OPEN_API_NODE',
    });
  }

  public getConfig(): ITestConfig { return super.getConfig(); }

}

export default new TestConfig();