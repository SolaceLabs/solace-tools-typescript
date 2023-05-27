import { 
  ApplicationDomain,
  CustomAttributeDefinition 
} from "@solace-labs/ep-openapi-node";
import {
  EEpSdk_VersionTaskStrategy,
  EpSdkTask,
  IEpSdkTask_ExecuteReturn,
  IEpSdkTask_TransactionConfig,
  EpSdkStatesService,
  EEpSdkStateDTONames,
  EEpSdkCustomAttributeEntityTypes,
  TEpSdkCustomAttribute,
  IEpSdkApplicationDomainTask_ExecuteReturn,
  EEpSdkTask_Action,
  EpSdkApplicationDomainsService,
} from "@solace-labs/ep-sdk";
import {
  CliConfig,
  CliEPApiContentError,
  CliInternalCodeInconsistencyError,
  CliMigrateManager,
  CliRunExecuteReturnLog,
  CliUtils,
  ECliRunContext_RunMode,
} from "../cli-components";
import { 
  ECliMigrate_TargetStates, 
  ECliMigrate_TargetVersionStrategies 
} from "./types";
import { 
  EpV1Tag 
} from "../epV1";


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
 
  protected static EpV2TagCustomAttributeDefinition = {
    name: "tags",
    scope: CustomAttributeDefinition.scope.APPLICATION_DOMAIN,
    valueType: CustomAttributeDefinition.valueType.STRING,
    associatedEntityTypes: [ 
      EEpSdkCustomAttributeEntityTypes.APPLICATION_DOMAIN,
      EEpSdkCustomAttributeEntityTypes.APPLICATION,
      EEpSdkCustomAttributeEntityTypes.SCHEMA_OBJECT,
      EEpSdkCustomAttributeEntityTypes.EVENT
    ],
  }
  
  protected transformEpV1TagNames2EpV2CustomAttributeValue(epV1Tags: Array<EpV1Tag>): string {
    return epV1Tags.map( x => x.name).join(' - ').replaceAll(',','').trim();
  }
  protected transformEpV1Tags2EpSdkCustomAttribute({ epV1Tags, applicationDomainId }:{
    epV1Tags: Array<EpV1Tag>;
    applicationDomainId: string;
  }): TEpSdkCustomAttribute {
    return {
      name: CliMigrator.EpV2TagCustomAttributeDefinition.name,
      value: this.transformEpV1TagNames2EpV2CustomAttributeValue(epV1Tags),
      scope: CliMigrator.EpV2TagCustomAttributeDefinition.scope,
      valueType: CliMigrator.EpV2TagCustomAttributeDefinition.valueType,
      applicationDomainId,
    };
  }

  constructor(options: ICliMigratorOptions, runMode: ECliRunContext_RunMode) {
    this.options = options;
    this.transactionId = CliUtils.getUUID();
    this.runMode = runMode;
  }

  protected async presentApplicationDomainRunIdCustomAttribute({ epSdkApplicationDomainTask_ExecuteReturn }:{
    epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn;
  }): Promise<ApplicationDomain> {
    const funcName = 'presentApplicationDomainRunIdCustomAttribute';
    const logName = `${CliMigrator.name}.${funcName}()`;
    // runId
    if(epSdkApplicationDomainTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action !== EEpSdkTask_Action.CREATE) return epSdkApplicationDomainTask_ExecuteReturn.epObject;
    /* istanbul ignore next */
    if(epSdkApplicationDomainTask_ExecuteReturn.epObject.id === undefined) throw new CliEPApiContentError(logName, "epSdkApplicationDomainTask_ExecuteReturn.epObject.id === undefined", {
      applicationDomain: epSdkApplicationDomainTask_ExecuteReturn.epObject,
    });
    const newApplicationDomain: ApplicationDomain = await EpSdkApplicationDomainsService.setCustomAttributes({
      applicationDomainId: epSdkApplicationDomainTask_ExecuteReturn.epObject.id,
      epSdkCustomAttributes: [
        { 
          name: CliMigrateManager.EpV2RunIdCustomAttributeDefinition.name,
          scope: CliMigrateManager.EpV2RunIdCustomAttributeDefinition.scope,
          valueType: CliMigrateManager.EpV2RunIdCustomAttributeDefinition.valueType,
          value: CliConfig.getRunId(),
        }
      ]
    });
    return newApplicationDomain;
  }

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
