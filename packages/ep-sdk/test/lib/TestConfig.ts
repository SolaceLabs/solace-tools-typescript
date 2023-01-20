
import {
  ITestSolaceCloudApiConfigBase,
  TestSolaceCloudApiConfigBase,
} from '@internal/tools/src/testLib';
import { EEpSdkLogLevel } from '../../src';

enum EEnvVarPartials {
  LOG_LEVEL = "LOG_LEVEL",
  TOKEN_NO_APPLICATION_DOMAINS_PERMISSIONS = "TOKEN_NO_APPLICATION_DOMAINS_PERMISSIONS",
};

export interface ITestConfig extends ITestSolaceCloudApiConfigBase {
  logLevel: EEpSdkLogLevel;
  tokens: {
    allPermissions: string;
    noPermissions: string;
    noApplicationDomains: string;
  }
};

class TestConfig extends TestSolaceCloudApiConfigBase {

  public initialize(): void {
    super.initialize({
      appId: 'TEST_EP_SDK',
    });    
    this.getConfig().logLevel = this.getMandatoryEnvVarValueAsNumber(this.createEnvVar({ envVarPartial: EEnvVarPartials.LOG_LEVEL }));
    this.getConfig().tokens = {
      allPermissions: this.getSolaceCloudToken(),
      noPermissions: 'noPermissions',
      noApplicationDomains: this.getMandatoryEnvVarValueAsString(this.createEnvVar({ envVarPartial: EEnvVarPartials.TOKEN_NO_APPLICATION_DOMAINS_PERMISSIONS }))
    };
  }

  public getConfig(): ITestConfig { return super.getConfig() as ITestConfig; }

}

export default new TestConfig();