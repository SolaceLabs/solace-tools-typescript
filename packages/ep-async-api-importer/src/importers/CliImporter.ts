import { 
  ApplicationDomain, 
  EventVersion 
} from "@solace-labs/ep-openapi-node";
import {
  EEpSdkTask_Action,
  EEpSdkTask_TargetState,
  EEpSdk_VersionTaskStrategy,
  EpSdkApplicationDomainsService,
  EpSdkApplicationDomainTask,
  EpSdkEpEventVersionsService,
  EpSdkTask,
  IEpSdkApplicationDomainTask_ExecuteReturn,
  IEpSdkTask_ExecuteReturn,
  IEpSdkTask_TransactionConfig,
} from "@solace-labs/ep-sdk";
import { 
  EBrokerTypes, 
  EChannelDelimiters,
  EpAsyncApiDocument, 
} from '@solace-labs/ep-asyncapi';
import {
  CliEPApiContentError,
  CliImporterError,
  CliImporterTestRunAssetsInconsistencyError,
  CliInternalCodeInconsistencyError,
  CliRunExecuteReturnLog,
  CliUtils,
  ECliRunContext_RunMode,
} from "../cli-components";
import {
  CliEPStatesService,
  ECliAssetImport_TargetLifecycleState,
  ICliPubSubEventVersionIds,
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
  protected runMode: ECliRunContext_RunMode;

  constructor(cliImporterOptions: ICliImporterOptions, runMode: ECliRunContext_RunMode) {
    this.cliImporterOptions = cliImporterOptions;
    this.importerTransactionId = CliUtils.getUUID();
    this.runMode = runMode;
  }

  // private isAllowedToChange({ targetApplicationDomainId, epObjectCustomAttributes }:{
  //   targetApplicationDomainId: string;
  //   epObjectCustomAttributes?: Array<CustomAttribute>;
  // }): boolean {
  //   if(epObjectCustomAttributes === undefined) return true;
  //   const sourceApplicationDomainIdAttribute = epObjectCustomAttributes.find( (x) => { return x.customAttributeDefinitionName === EpSdkCustomAttributeNameSourceApplicationDomainId; });
  //   if(sourceApplicationDomainIdAttribute === undefined) return true;
  //   const sourceApplicationDomainId = sourceApplicationDomainIdAttribute.value;
  //   if(sourceApplicationDomainId === undefined) return true;
  //   return sourceApplicationDomainId === targetApplicationDomainId;
  // }

  // protected getSourceApplicationDomainId({ epObjectCustomAttributes }:{
  //   epObjectCustomAttributes?: Array<CustomAttribute>;
  // }): string | undefined {
  //   if(epObjectCustomAttributes === undefined) return undefined;
  //   const sourceApplicationDomainIdAttribute = epObjectCustomAttributes.find( (x) => { return x.customAttributeDefinitionName === EpSdkCustomAttributeNameSourceApplicationDomainId; });
  //   if(sourceApplicationDomainIdAttribute === undefined) return undefined;
  //   const sourceApplicationDomainId = sourceApplicationDomainIdAttribute.value;
  //   return sourceApplicationDomainId;
  // }

  protected get_pub_sub_event_version_ids = async ({applicationDomainId, epAsyncApiDocument }: {
    applicationDomainId: string;
    epAsyncApiDocument: EpAsyncApiDocument;
  }): Promise<ICliPubSubEventVersionIds> => {
    const funcName = "get_pub_sub_event_version_ids";
    const logName = `${CliImporter.name}.${funcName}()`;

    const publishEventVersionIdList: Array<string> = [];
    const subscribeEventVersionIdList: Array<string> = [];

    const channelDocumentMap = epAsyncApiDocument.getEpAsyncApiChannelDocumentMap();
    for(const [key, epAsyncApiChannelDocument] of channelDocumentMap) {
      key;
      const epEventName: string = epAsyncApiChannelDocument.getEpEventName();
      const epAsynApiChannelPublishOperation = epAsyncApiChannelDocument.getEpAsyncApiChannelPublishOperation();
      if(epAsynApiChannelPublishOperation) {
        const epAsyncApiMessageDocument = epAsynApiChannelPublishOperation.getEpAsyncApiMessageDocument();
        const eventApplicationDomainId = await this.getAssetApplicationDomainId({
          assetApplicationDomainId: applicationDomainId,
          overrideAssetApplicationDomainName: epAsyncApiMessageDocument.getMessageEpApplicationDomainName()
        });
        // console.log(`${logName}: ************************************`);
        // const log = {
        //   runMode: this.runMode,
        //   eventApplicationDomainId,
        //   epEventName,
        // }
        // console.log(`${logName}: log=${JSON.stringify(log, null, 2)}`);
        // console.log(`${logName}: ************************************`);
        const eventVersion: EventVersion | undefined = await EpSdkEpEventVersionsService.getLatestVersionForEventName({
          eventName: epEventName,
          applicationDomainId: eventApplicationDomainId,
        });
        if (eventVersion === undefined) throw new CliImporterError(logName, "eventVersion === undefined", {
          eventName: epEventName,
          applicationDomainId: eventApplicationDomainId,
        });
        /* istanbul ignore next */
        if (eventVersion.id === undefined) throw new CliEPApiContentError(logName, "eventVersion.id === undefined", {
          eventVersion: eventVersion,
        });
        publishEventVersionIdList.push(eventVersion.id);
      }
      const epAsynApiChannelSubscribeOperation = epAsyncApiChannelDocument.getEpAsyncApiChannelSubscribeOperation();
      if(epAsynApiChannelSubscribeOperation) {
        const epAsyncApiMessageDocument = epAsynApiChannelSubscribeOperation.getEpAsyncApiMessageDocument();
        const eventApplicationDomainId = await this.getAssetApplicationDomainId({
          assetApplicationDomainId: applicationDomainId,
          overrideAssetApplicationDomainName: epAsyncApiMessageDocument.getMessageEpApplicationDomainName()
        });
        const eventVersion: EventVersion | undefined = await EpSdkEpEventVersionsService.getLatestVersionForEventName({
          eventName: epEventName,
          applicationDomainId: eventApplicationDomainId,
        });
        if (eventVersion === undefined) throw new CliImporterError(logName, "eventVersion === undefined", {
          eventName: epEventName,
          applicationDomainId: eventApplicationDomainId,
        });
        /* istanbul ignore next */
        if (eventVersion.id === undefined) throw new CliEPApiContentError(logName, "eventVersion.id === undefined", {
          eventVersion: eventVersion,
        });
        subscribeEventVersionIdList.push(eventVersion.id);
      }
    }
    return {
      publishEventVersionIdList: publishEventVersionIdList,
      subscribeEventVersionIdList: subscribeEventVersionIdList,
    };
  }

  protected getAssetApplicationDomainId = async({ assetApplicationDomainId, overrideAssetApplicationDomainName }: {
    assetApplicationDomainId: string; /** always exists */
    overrideAssetApplicationDomainName?: string; /** may not exist yet */
  }): Promise<string> => {
    const funcName = "getAssetApplicationDomainId";
    const logName = `${CliImporter.name}.${funcName}()`;

    // console.log(`${logName}: ************************************`);
    // const log = {
    //   runMode: this.runMode,
    //   assetApplicationDomainId,
    //   overrideAssetApplicationDomainName: overrideAssetApplicationDomainName ? overrideAssetApplicationDomainName : 'undefined'
    // }
    // console.log(`${logName}: log=${JSON.stringify(log, null, 2)}`);
    // console.log(`${logName}: ************************************`);
    

    if(this.runMode !== ECliRunContext_RunMode.RELEASE) return assetApplicationDomainId;
    if(overrideAssetApplicationDomainName) {
      try {
        return await this.get_ApplicationDomainId(overrideAssetApplicationDomainName);
      } catch(e) {
        if(e instanceof CliInternalCodeInconsistencyError) {
          // create it
          const task = new EpSdkApplicationDomainTask({
            applicationDomainName: overrideAssetApplicationDomainName,
            epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
          });
          const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await task.execute();
          /* istanbul ignore next */
          if(epSdkApplicationDomainTask_ExecuteReturn.epObject.id === undefined) throw new CliEPApiContentError(logName, "epSdkApplicationDomainTask_ExecuteReturn.epObject.id === undefined", {
            epSdkApplicationDomainTask_ExecuteReturn: epSdkApplicationDomainTask_ExecuteReturn,
          });
          return epSdkApplicationDomainTask_ExecuteReturn.epObject.id
        } else {
          throw e;
        }
      }
    }
    return assetApplicationDomainId;
  }

  protected get_ApplicationDomainId = async (applicationDomainName: string): Promise<string> => {
    const funcName = "get_ApplicationDomainId";
    const logName = `${CliImporter.name}.${funcName}()`;
    const applicationDomain: ApplicationDomain | undefined = await EpSdkApplicationDomainsService.getByName({
      applicationDomainName: applicationDomainName,
    });
    if (applicationDomain === undefined) throw new CliInternalCodeInconsistencyError(logName, {
      message: "applicationDomain not found",
      applicationDomainName: applicationDomainName,
    });
    /* istanbul ignore next */
    if (applicationDomain.id === undefined) throw new CliEPApiContentError(logName, "applicationDomain.id === undefined", {
      applicationDomain: applicationDomain,
    });
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

  protected async executeTask({ epSdkTask, expectNoAction }: {
    epSdkTask: EpSdkTask;
    expectNoAction: boolean;
  }): Promise<IEpSdkTask_ExecuteReturn> {
    const funcName = "executeTask";
    const logName = `${CliImporter.name}.${funcName}()`;

    const epSdkTask_ExecuteReturn: IEpSdkTask_ExecuteReturn = await epSdkTask.execute();
    // save in global log
    CliRunExecuteReturnLog.add(epSdkTask_ExecuteReturn);
    if (expectNoAction && epSdkTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action !== EEpSdkTask_Action.NO_ACTION) {
      throw new CliImporterTestRunAssetsInconsistencyError(logName, {
        message: `expect epSdkTask_TransactionLogData.epSdkTask_Action = '${EEpSdkTask_Action.NO_ACTION}', instead got '${epSdkTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action}'`,
        epSdkTask_TransactionLogData: epSdkTask_ExecuteReturn.epSdkTask_TransactionLogData,
      });
    }
    return epSdkTask_ExecuteReturn;
  }

  protected abstract generate_assets_ouput({ cliImporterGenerateAssetsOptions }: {
    cliImporterGenerateAssetsOptions: ICliImporterGenerateAssetsOptions;
  }): Promise<ICliImporterGenerateAssetsReturn>;

  protected abstract run_present({ cliImporterRunPresentOptions }: {
    cliImporterRunPresentOptions: ICliImporterRunPresentOptions;
  }): Promise<ICliImporterRunPresentReturn>;

  protected abstract run({ cliImporterRunOptions }: {
    cliImporterRunOptions: ICliImporterRunOptions;
  }): Promise<ICliImporterRunReturn>;
}
