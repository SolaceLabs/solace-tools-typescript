import { ApplicationDomain } from "@solace-labs/ep-openapi-node";
import {
  EEpSdkTask_Action,
  EEpSdk_VersionTaskStrategy,
  EpSdkApplicationDomainsService,
  EpSdkTask,
  IEpSdkTask_ExecuteReturn,
  IEpSdkTask_TransactionConfig,
} from "@solace-labs/ep-sdk";
import { 
  EBrokerTypes, 
  EChannelDelimiters, 
} from '@solace-labs/ep-asyncapi';
import {
  CliEPApiContentError,
  CliImporterTestRunAssetsInconsistencyError,
  CliInternalCodeInconsistencyError,
  CliRunExecuteReturnLog,
  CliUtils,
} from "../cli-components";
import {
  CliEPStatesService,
  ECliAssetImport_TargetLifecycleState,
} from "../services";

export enum ECliAssetImport_TargetVersionStrategy {
  BUMP_PATCH = EEpSdk_VersionTaskStrategy.BUMP_PATCH,
  BUMP_MINOR = EEpSdk_VersionTaskStrategy.BUMP_MINOR,
}

export interface ICliImporterOptions {
  runId: string;
  assetOutputDir: string;
  cliAssetImport_TargetLifecycleState: ECliAssetImport_TargetLifecycleState;
  cliAssetImport_TargetVersionStrategy: ECliAssetImport_TargetVersionStrategy;
  cliAssetImport_BrokerType?: EBrokerTypes;
  cliAssetImport_ChannelDelimiter?: EChannelDelimiters;
  cliValidateApiSpecBestPractices: boolean;
}
export interface ICliImporterGenerateAssetsOptions {}
export interface ICliImporterGenerateAssetsReturn {
  error: any;
}
export interface ICliImporterRunPresentOptions {
  checkmode: boolean;
}
export interface ICliImporterRunPresentReturn {}
export interface ICliImporterRunOptions {
  apiFile: string;
  applicationDomainName: string | undefined;
  assetApplicationDomainName: string | undefined;
  applicationDomainNamePrefix: string | undefined;
  overrideBrokerType: string | undefined;
  overrideChannelDelimiter: string | undefined;
  checkmode: boolean;
}
export interface ICliImporterRunReturn {
  applicationDomainName: string | undefined;
  assetApplicationDomainName: string | undefined;
  error: any;
}

export abstract class CliImporter {
  protected cliImporterOptions: ICliImporterOptions;
  protected importerTransactionId: string;

  constructor(cliImporterOptions: ICliImporterOptions) {
    this.cliImporterOptions = cliImporterOptions;
    this.importerTransactionId = CliUtils.getUUID();
  }

  protected get_ApplicationDomainId = async (
    applicationDomainName: string
  ): Promise<string> => {
    const funcName = "get_ApplicationDomainId";
    const logName = `${CliImporter.name}.${funcName}()`;
    const applicationDomain: ApplicationDomain | undefined =
      await EpSdkApplicationDomainsService.getByName({
        applicationDomainName: applicationDomainName,
      });
    if (applicationDomain === undefined)
      throw new CliInternalCodeInconsistencyError(logName, {
        message: "applicationDomain === undefined",
        applicationDomainName: applicationDomainName,
      });
    /* istanbul ignore next */
    if (applicationDomain.id === undefined)
      throw new CliEPApiContentError(
        logName,
        "applicationDomain.id === undefined",
        {
          applicationDomain: applicationDomain,
        }
      );
    return applicationDomain.id;
  };

  protected get_EpSdkTask_StateId = (): string => {
    return CliEPStatesService.getTargetLifecycleState({
      cliAssetImport_TargetLifecycleState:
        this.cliImporterOptions.cliAssetImport_TargetLifecycleState,
    });
  };
  protected get_EEpSdk_VersionTaskStrategy = (): EEpSdk_VersionTaskStrategy => {
    const funcName = "get_EEpSdk_VersionTaskStrategy";
    const logName = `${CliImporter.name}.${funcName}()`;
    switch (this.cliImporterOptions.cliAssetImport_TargetVersionStrategy) {
      case ECliAssetImport_TargetVersionStrategy.BUMP_PATCH:
        return EEpSdk_VersionTaskStrategy.BUMP_PATCH;
      case ECliAssetImport_TargetVersionStrategy.BUMP_MINOR:
        return EEpSdk_VersionTaskStrategy.BUMP_MINOR;
      default:
        throw new CliInternalCodeInconsistencyError(logName, {
          cliAssetImport_TargetVersionStrategy:
            this.cliImporterOptions.cliAssetImport_TargetVersionStrategy,
        });
    }
  };

  protected get_IEpSdkTask_TransactionConfig = (): IEpSdkTask_TransactionConfig => {
    return {
      groupTransactionId: this.cliImporterOptions.runId,
      parentTransactionId: this.importerTransactionId,
    };
  };

  protected async executeTask({
    epSdkTask,
    expectNoAction,
  }: {
    epSdkTask: EpSdkTask;
    expectNoAction: boolean;
  }): Promise<IEpSdkTask_ExecuteReturn> {
    const funcName = "executeTask";
    const logName = `${CliImporter.name}.${funcName}()`;

    const epSdkTask_ExecuteReturn: IEpSdkTask_ExecuteReturn =
      await epSdkTask.execute();
    // save in global log
    CliRunExecuteReturnLog.add(epSdkTask_ExecuteReturn);

    if (
      expectNoAction &&
      epSdkTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action !==
        EEpSdkTask_Action.NO_ACTION
    ) {
      throw new CliImporterTestRunAssetsInconsistencyError(logName, {
        message: `expect epSdkTask_TransactionLogData.epSdkTask_Action = '${EEpSdkTask_Action.NO_ACTION}', instead got '${epSdkTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action}'`,
        epSdkTask_TransactionLogData:
          epSdkTask_ExecuteReturn.epSdkTask_TransactionLogData,
      });
    }
    return epSdkTask_ExecuteReturn;
  }

  protected abstract generate_assets_ouput({
    cliImporterGenerateAssetsOptions,
  }: {
    cliImporterGenerateAssetsOptions: ICliImporterGenerateAssetsOptions;
  }): Promise<ICliImporterGenerateAssetsReturn>;

  protected abstract run_present({
    cliImporterRunPresentOptions,
  }: {
    cliImporterRunPresentOptions: ICliImporterRunPresentOptions;
  }): Promise<ICliImporterRunPresentReturn>;

  protected abstract run({
    cliImporterRunOptions,
  }: {
    cliImporterRunOptions: ICliImporterRunOptions;
  }): Promise<ICliImporterRunReturn>;
}
