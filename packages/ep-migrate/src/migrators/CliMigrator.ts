import {
  EEpSdk_VersionTaskStrategy,
  EpSdkTask,
  IEpSdkTask_ExecuteReturn,
  IEpSdkTask_TransactionConfig,
  EpSdkStatesService,
  EEpSdkStateDTONames,
} from "@solace-labs/ep-sdk";
import {
  CliInternalCodeInconsistencyError,
  CliRunExecuteReturnLog,
  CliUtils,
  ECliRunContext_RunMode,
} from "../cli-components";
import { 
  ECliMigrate_TargetStates, 
  ECliMigrate_TargetVersionStrategies 
} from "./types";


export interface ICliMigratorOptions {
  runId: string;
  applicationDomainPrefix?: string;
}
export interface ICliMigratorRunReturn {
  error: any;
}

export abstract class CliMigrator {
  protected options: ICliMigratorOptions;
  protected transactionId: string;
  protected runMode: ECliRunContext_RunMode;
 
  constructor(options: ICliMigratorOptions, runMode: ECliRunContext_RunMode) {
    this.options = options;
    this.transactionId = CliUtils.getUUID();
    this.runMode = runMode;
  }



  // /* istanbul ignore next */
  // protected async getApplicationDomainName(applicationDomainId: string): Promise<string> {
  //   const applicationDomainName: string | undefined = this.applicationDomainCache.get(applicationDomainId);
  //   if(applicationDomainName) return applicationDomainName;
  //   const applicationDomain = await EpSdkApplicationDomainsService.getById({ applicationDomainId });
  //   this.applicationDomainCache.set(applicationDomainId, applicationDomain.name);
  //   return applicationDomain.name;
  // }

  // /* istanbul ignore next */
  // protected getSourceApplicationDomainId({ epObjectCustomAttributes }:{
  //   epObjectCustomAttributes?: Array<CustomAttribute>;
  // }): string | undefined {
  //   if(epObjectCustomAttributes === undefined) return undefined;
  //   const sourceApplicationDomainIdAttribute = epObjectCustomAttributes.find( (x) => { return x.customAttributeDefinitionName === EpSdkCustomAttributeNameSourceApplicationDomainId; });
  //   if(sourceApplicationDomainIdAttribute === undefined) return undefined;
  //   const sourceApplicationDomainId = sourceApplicationDomainIdAttribute.value;
  //   return sourceApplicationDomainId;
  // }

  // /* istanbul ignore next */
  // protected async getSourceApplicationDomainName({ epObjectCustomAttributes }:{
  //   epObjectCustomAttributes?: Array<CustomAttribute>;
  // }): Promise<string | undefined> {
  //   const applicationDomainId = this.getSourceApplicationDomainId({ epObjectCustomAttributes });
  //   if(applicationDomainId === undefined) return undefined;
  //   return await this.getApplicationDomainName(applicationDomainId);
  // }

  // protected get_pub_sub_event_version_ids = async ({applicationDomainId, epAsyncApiDocument }: {
  //   applicationDomainId: string;
  //   epAsyncApiDocument: EpAsyncApiDocument;
  // }): Promise<ICliPubSubEventVersionIds> => {
  //   const funcName = "get_pub_sub_event_version_ids";
  //   const logName = `${CliImporter.name}.${funcName}()`;

  //   const publishEventVersionIdList: Array<string> = [];
  //   const subscribeEventVersionIdList: Array<string> = [];

  //   const channelDocumentMap = epAsyncApiDocument.getEpAsyncApiChannelDocumentMap();
  //   for(const [key, epAsyncApiChannelDocument] of channelDocumentMap) {
  //     key;
  //     const epEventName: string = epAsyncApiChannelDocument.getEpEventName();
  //     const epAsynApiChannelPublishOperation = epAsyncApiChannelDocument.getEpAsyncApiChannelPublishOperation();
  //     if(epAsynApiChannelPublishOperation) {
  //       const epAsyncApiMessageDocument = epAsynApiChannelPublishOperation.getEpAsyncApiMessageDocument();
  //       const eventApplicationDomainId = await this.getAssetApplicationDomainId({
  //         assetApplicationDomainId: applicationDomainId,
  //         overrideAssetApplicationDomainName: epAsyncApiMessageDocument.getMessageEpApplicationDomainName()
  //       });
  //       // console.log(`${logName}: ************************************`);
  //       // const log = {
  //       //   runMode: this.runMode,
  //       //   eventApplicationDomainId,
  //       //   epEventName,
  //       // }
  //       // console.log(`${logName}: log=${JSON.stringify(log, null, 2)}`);
  //       // console.log(`${logName}: ************************************`);
  //       const eventVersion: EventVersion | undefined = await EpSdkEpEventVersionsService.getLatestVersionForEventName({
  //         eventName: epEventName,
  //         applicationDomainId: eventApplicationDomainId,
  //       });
  //       if (eventVersion === undefined) throw new CliImporterError(logName, "eventVersion === undefined", {
  //         eventName: epEventName,
  //         applicationDomainId: eventApplicationDomainId,
  //       });
  //       /* istanbul ignore next */
  //       if (eventVersion.id === undefined) throw new CliEPApiContentError(logName, "eventVersion.id === undefined", {
  //         eventVersion: eventVersion,
  //       });
  //       publishEventVersionIdList.push(eventVersion.id);
  //     }
  //     const epAsynApiChannelSubscribeOperation = epAsyncApiChannelDocument.getEpAsyncApiChannelSubscribeOperation();
  //     if(epAsynApiChannelSubscribeOperation) {
  //       const epAsyncApiMessageDocument = epAsynApiChannelSubscribeOperation.getEpAsyncApiMessageDocument();
  //       const eventApplicationDomainId = await this.getAssetApplicationDomainId({
  //         assetApplicationDomainId: applicationDomainId,
  //         overrideAssetApplicationDomainName: epAsyncApiMessageDocument.getMessageEpApplicationDomainName()
  //       });
  //       const eventVersion: EventVersion | undefined = await EpSdkEpEventVersionsService.getLatestVersionForEventName({
  //         eventName: epEventName,
  //         applicationDomainId: eventApplicationDomainId,
  //       });
  //       if (eventVersion === undefined) throw new CliImporterError(logName, "eventVersion === undefined", {
  //         eventName: epEventName,
  //         applicationDomainId: eventApplicationDomainId,
  //       });
  //       /* istanbul ignore next */
  //       if (eventVersion.id === undefined) throw new CliEPApiContentError(logName, "eventVersion.id === undefined", {
  //         eventVersion: eventVersion,
  //       });
  //       subscribeEventVersionIdList.push(eventVersion.id);
  //     }
  //   }
  //   return {
  //     publishEventVersionIdList: publishEventVersionIdList,
  //     subscribeEventVersionIdList: subscribeEventVersionIdList,
  //   };
  // }

  protected get_EpSdk_StateId(cliMigrate_TargetState: ECliMigrate_TargetStates): string {
    return EpSdkStatesService.getEpStateIdByName({ epSdkStateDTOName: cliMigrate_TargetState as unknown as EEpSdkStateDTONames });
  }

  protected get_EEpSdk_VersionTaskStrategy(cliMigrate_TargetVersionStrategy: ECliMigrate_TargetVersionStrategies): EEpSdk_VersionTaskStrategy {
    const funcName = "get_EEpSdk_VersionTaskStrategy";
    const logName = `${CliMigrator.name}.${funcName}()`;
    switch(cliMigrate_TargetVersionStrategy) {
      case ECliMigrate_TargetVersionStrategies.BUMP_PATCH:
        return EEpSdk_VersionTaskStrategy.BUMP_PATCH;
      case ECliMigrate_TargetVersionStrategies.BUMP_MINOR:
        return EEpSdk_VersionTaskStrategy.BUMP_MINOR;
      default:
        throw new CliInternalCodeInconsistencyError(logName, { 
          message: "unable to map cliMigrate_TargetVersionStrategy to EEpSdk_VersionTaskStrategy",
          cliMigrate_TargetVersionStrategy: cliMigrate_TargetVersionStrategy ? cliMigrate_TargetVersionStrategy : 'undefined'
        });
    }
  }

  protected get_IEpSdkTask_TransactionConfig = (): IEpSdkTask_TransactionConfig => {
    return {
      groupTransactionId: this.options.runId,
      parentTransactionId: this.transactionId,
    };
  };

  protected async executeTask({ epSdkTask }: {
    epSdkTask: EpSdkTask;
  }): Promise<IEpSdkTask_ExecuteReturn> {
    const epSdkTask_ExecuteReturn: IEpSdkTask_ExecuteReturn = await epSdkTask.execute();
    CliRunExecuteReturnLog.add(epSdkTask_ExecuteReturn);
    return epSdkTask_ExecuteReturn;
  }

  protected abstract run(): Promise<ICliMigratorRunReturn>;
}
