/** @category Utils */
export class EpSdkConfig {
  private static appName = "EP SDK";

  public static initialize(appName: string) {
    EpSdkConfig.appName = appName;
  }
  public static getAppName(): string { return EpSdkConfig.appName; }

}