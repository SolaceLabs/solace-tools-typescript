
import {
  ITestSolaceCloudApiConfigBase,
  TestSolaceCloudApiConfigBase,
} from '@internal/tools/src';

export interface ITestConfig extends ITestSolaceCloudApiConfigBase {
  // placeholder
};

class TestConfig extends TestSolaceCloudApiConfigBase {

  public initialize = (): void => {
    // add more settings if required
    super.initialize({
      appId: 'TEST_SC_OPEN_API_NODE',
    });
  }

  public getConfig(): ITestConfig { return super.getConfig(); }

}

export default new TestConfig();