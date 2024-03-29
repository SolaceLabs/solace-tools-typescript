import { EpAsyncApiDocument } from "@solace-labs/ep-asyncapi";
import { EEpSdkTask_TargetState, EpSdkApplicationDomainsService, EpSdkApplicationDomainTask, IEpSdkApplicationDomainTask_ExecuteReturn } from "@solace-labs/ep-sdk";
import { CliUtils } from "../../src/cli-components";
import {
  CliApplicationDomainsService,
  CliAsyncApiDocumentService,
} from "../../src/services";

export type TTestApiSpecRecord = {
  apiFile: string;
  epAsyncApiDocument: EpAsyncApiDocument;
};

export class TestService {
  private static testApiSpecRecordList: Array<TTestApiSpecRecord> = [];

  public static validateFilePathWithReadPermission = (filePath: string) => {
    const fp: string | undefined =
      CliUtils.validateFilePathWithReadPermission(filePath);
    if (fp === undefined) throw new Error(`filePath is invalid: ${filePath}`);
    return fp;
  };

  public static createTestApiSpecRecordList = async ({
    apiFileList,
    overrideApplicationDomainName,
    overrideAssetApplicationDomainName,
    overrideBrokerType,
    overrideChannelDelimiter,
    validateBestPractices
  }: {
    apiFileList: Array<string>;
    overrideApplicationDomainName?: string;
    overrideAssetApplicationDomainName?: string;
    overrideBrokerType: string | undefined;
    overrideChannelDelimiter: string | undefined;
    validateBestPractices: boolean;
  }): Promise<Array<TTestApiSpecRecord>> => {
    const funcName = "createTestApiSpecRecordList";
    const logName = `${TestService.name}.${funcName}()`;

    // // DEBUG:
    // throw new Error(`${logName}: input=${JSON.stringify({
    //   apiFileList: apiFileList,
    //   overrideApplicationDomainName: overrideApplicationDomainName ? overrideApplicationDomainName : 'undefined',
    //   overrideAssetApplicationDomainName: overrideAssetApplicationDomainName ? overrideAssetApplicationDomainName : 'undefined'
    // }, null, 2)}`);

    TestService.testApiSpecRecordList = [];
    for (const apiFile of apiFileList) {
      const epAsyncApiDocument: EpAsyncApiDocument = await CliAsyncApiDocumentService.parse_and_validate({
        apiFile: apiFile,
        applicationDomainName: overrideApplicationDomainName,
        assetApplicationDomainName: overrideAssetApplicationDomainName,
        applicationDomainNamePrefix: undefined,
        overrideBrokerType: overrideBrokerType,
        overrideChannelDelimiter: overrideChannelDelimiter,
        validateBestPractices: validateBestPractices
      });
      TestService.testApiSpecRecordList.push({
        apiFile: apiFile,
        epAsyncApiDocument: epAsyncApiDocument,
      });
    }
    return TestService.testApiSpecRecordList;
  };

  public static absent_ApplicationDomains = async (
    keep: boolean
  ): Promise<void> => {
    if (keep) return;
    const xvoid: void =
      await CliApplicationDomainsService.absent_ApplicationDomains({
        applicationDomainNameList: TestService.testApiSpecRecordList.map((testApiSpecRecord: TTestApiSpecRecord) => {
            return testApiSpecRecord.epAsyncApiDocument.getApplicationDomainName();
          }).concat(TestService.testApiSpecRecordList.map((testApiSpecRecord: TTestApiSpecRecord) => {
            return testApiSpecRecord.epAsyncApiDocument.getAssetsApplicationDomainName();
          })),
      });
  };

  public static absent_ApplicationDomain = async (applicationDomainId: string): Promise<void> => {
    try { 
      const x = await EpSdkApplicationDomainsService.deleteById({ applicationDomainId });
    } catch(e) {}
  };

  public static getTestApiSpecRecordList(): Array<TTestApiSpecRecord> {
    return TestService.testApiSpecRecordList;
  }

  /**
   * Placeholder only
   * @returns
   */
  public static checkAssetsCreatedAsExpected = async (): Promise<boolean> => {
    const funcName = "checkAssetsCreatedAsExpected";
    const logName = `${TestService.name}.${funcName}()`;

    // run through all specs, check assets in EP?
    // does that really make sense?

    return true;
  };

  public static applicationDomainTask = async({ scriptName, applicationDomainName, epSdkTask_TargetState}:{
    scriptName: string;
    applicationDomainName: string;
    epSdkTask_TargetState: EEpSdkTask_TargetState;
  }): Promise<void> => {
    try {
      const task = new EpSdkApplicationDomainTask({
        applicationDomainName: applicationDomainName,
        epSdkTask_TargetState: epSdkTask_TargetState
      });
      const task_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await task.execute('xContextId');
    } catch(e) {
      console.log(`${scriptName}: e = ${JSON.stringify(e, null, 2)}`);
    }
  }
  
}
