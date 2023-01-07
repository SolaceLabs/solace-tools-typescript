
import {
  ITestApiConfigBase,
  TestApiConfigBase,
} from '@internal/tools/src';

enum EEnvVarPartials {
  PROTOCOL = 'PROTOCOL',
  HOST = 'HOST',
  PORT = 'PORT',
  MSG_VPN_NAME = 'MSG_VPN_NAME',
  USERNAME = 'USERNAME',
  PASSWORD = 'PASSWORD',
  ENABLE_API_CALL_LOGGING = "ENABLE_API_CALL_LOGGING",
};

export interface ITestConfig extends ITestApiConfigBase {
  protocol: "http" | "https";
  host: string;
  port: number;
  apiBaseUrl: string;
  msgVpnName: string;
  username: string;
  password: string;
};

class TestConfig extends TestApiConfigBase {

  private SEMPV2_CONFIG_PATH = "SEMP/v2/config";

  public initialize(): void {
    super.initialize({
      appId: 'TEST_SEMPV2_CONFIG_OPEN_API_NODE',
    });
    const _testConfig: Omit<ITestConfig, "apiBaseUrl"> = {
      ...(this.testConfig as ITestApiConfigBase),
      protocol: this.getOptionalEnvVarValueAsString(this.createEnvVar({ envVarPartial: EEnvVarPartials.PROTOCOL }), "https") as "http" | "https",
      host: this.getMandatoryEnvVarValueAsString(this.createEnvVar({ envVarPartial: EEnvVarPartials.HOST })),
      port: this.getOptionalEnvVarValueAsNumber(this.createEnvVar({ envVarPartial: EEnvVarPartials.PORT }), 943),
      msgVpnName: this.getMandatoryEnvVarValueAsString(this.createEnvVar({ envVarPartial: EEnvVarPartials.MSG_VPN_NAME })),
      username: this.getMandatoryEnvVarValueAsString(this.createEnvVar({ envVarPartial: EEnvVarPartials.USERNAME })),
      password: this.getMandatoryEnvVarValueAsString(this.createEnvVar({ envVarPartial: EEnvVarPartials.PASSWORD })),
    };
    (this.testConfig as ITestConfig) = {
      ..._testConfig,
      apiBaseUrl: `${_testConfig.protocol}://${_testConfig.host}:${_testConfig.port}/${this.SEMPV2_CONFIG_PATH}`,
    };
  }

  public getConfig(): ITestConfig { return super.getConfig() as ITestConfig; }

}

export default new TestConfig();