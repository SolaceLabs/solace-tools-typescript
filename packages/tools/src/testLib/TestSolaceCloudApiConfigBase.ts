import { 
  ITestApiConfigBase, 
  TestApiConfigBase 
} from "./TestApiConfigBase";

enum EEnvVarPartials {
  SOLACE_CLOUD_TOKEN = 'SOLACE_CLOUD_TOKEN',
  SOLACE_CLOUD_API_BASE_URL = "SOLACE_CLOUD_API_BASE_URL",
};

export interface ITestSolaceCloudApiConfigBase extends ITestApiConfigBase {
  apiBaseUrl: string;
};

export class TestSolaceCloudApiConfigBase extends TestApiConfigBase {

  private DEFAULT_SOLACE_CLOUD_API_BASE_URL = "https://api.solace.cloud";
  private solaceCloudToken: string;

  public initialize({ appId }:{
    appId: string;
  }): void {
    super.initialize({ appId: appId });
    const _testConfig: ITestSolaceCloudApiConfigBase = {
      ...(this.testConfig as ITestApiConfigBase),
      apiBaseUrl: this.getOptionalEnvVarValueAsUrlWithDefault(this.createEnvVar({ envVarPartial: EEnvVarPartials.SOLACE_CLOUD_API_BASE_URL }), this.DEFAULT_SOLACE_CLOUD_API_BASE_URL),
    };
    this.testConfig = _testConfig;
    // handle solace cloud token separately
    this.solaceCloudToken = this.getMandatoryEnvVarValueAsString(this.createEnvVar({ envVarPartial: EEnvVarPartials.SOLACE_CLOUD_TOKEN }));
  }

  public getSolaceCloudToken(): string { return this.solaceCloudToken; }
  
  public getConfig(): ITestSolaceCloudApiConfigBase { return super.getConfig() as ITestSolaceCloudApiConfigBase; };

}
