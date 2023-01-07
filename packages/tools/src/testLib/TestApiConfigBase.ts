import { 
  ITestConfigBase, 
  TestConfigBase 
} from "./TestConfigBase";

enum EEnvVarPartials {
  ENABLE_API_CALL_LOGGING = "ENABLE_API_CALL_LOGGING"
};

export interface ITestApiConfigBase extends ITestConfigBase {
  enableApiLogging: boolean;
};

export class TestApiConfigBase extends TestConfigBase {

  public initialize({ appId }:{
    appId: string;
  }): void {
    super.initialize({
      appId: appId,
    });
    const _testConfig: ITestApiConfigBase = {
      ...this.testConfig,
      enableApiLogging: this.getConfig().enableApiLogging = this.getOptionalEnvVarValueAsBoolean(this.createEnvVar({ envVarPartial: EEnvVarPartials.ENABLE_API_CALL_LOGGING}), false),
    };
    if(this.isCi()) _testConfig.enableApiLogging = false;
    this.testConfig = _testConfig;
  }

  public getConfig(): ITestApiConfigBase { return super.getConfig() as ITestApiConfigBase; };

}
