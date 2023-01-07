import fs from 'fs';
import path from 'path';

enum EEnvVars {
  CI = 'CI',
};

export interface ITestConfigBase {
  isCi: boolean;
};

export class TestConfigBase {

  private appId: string;
  protected testConfig: ITestConfigBase;

  protected createEnvVar({ envVarPartial }: {
    envVarPartial: string;
  }): string {
    return `${this.appId}_${envVarPartial}`;
  }

  protected getValidatedReadDir = (dir: string): string => {
    const absoluteDir = path.resolve(dir);
    if(!fs.existsSync(absoluteDir)) throw new Error(`directory does not exist: ${dir}`);
    fs.accessSync(absoluteDir, fs.constants.R_OK);
    return absoluteDir;
  }

  protected getMandatoryEnvVarValueAsString = (envVarName: string): string => {
    const value: string | undefined = process.env[envVarName];
    if (!value) throw new Error(`mandatory env var missing: ${envVarName}`);    
    return value;
  };

  protected getOptionalEnvVarValueAsString = (envVarName: string, defaultValue: string): string => {
    const value: string | undefined = process.env[envVarName];
    if (!value) return defaultValue;
    return value;
  };

  protected getOptionalEnvVarValueAsUrlWithDefault = (envVarName: string, defaultValue: string): string => {
    const value: string | undefined = process.env[envVarName];
    if(!value) return defaultValue;
    // check if value is a valid Url
    const valueUrl: URL = new URL(value);
    return value;
  }

  protected getMandatoryEnvVarValueAsNumber = (envVarName: string): number => {
    const value: string = this.getMandatoryEnvVarValueAsString(envVarName);
    const valueAsNumber: number = parseInt(value);
    if (Number.isNaN(valueAsNumber)) throw new Error(`env var type is not a number: ${envVarName}=${value}`);
    return valueAsNumber;
  };

  protected getOptionalEnvVarValueAsNumber = (envVarName: string, defaultValue: number): number => {
    const value: string | undefined = process.env[envVarName];
    if (!value) return defaultValue;
    const valueAsNumber: number = parseInt(value);
    if (Number.isNaN(valueAsNumber)) throw new Error(`env var type is not a number: ${envVarName}=${value}`);
    return valueAsNumber;
  };

  protected getOptionalEnvVarValueAsBoolean = (envVarName: string, defaultValue: boolean): boolean => {
    const value: string | undefined = process.env[envVarName];
    if(!value) return defaultValue;
    return value.toLowerCase() === 'true';
  };

  public initialize({ appId }:{
    appId: string;
  }): void {
    this.appId = appId;
    this.testConfig = {
      isCi: this.getOptionalEnvVarValueAsBoolean(EEnvVars.CI, false),
    };
  }

  public isCi(): boolean { return this.testConfig.isCi; }

  public getAppId(): string { return this.appId; }

  public getConfig(): ITestConfigBase { return this.testConfig; };

}
