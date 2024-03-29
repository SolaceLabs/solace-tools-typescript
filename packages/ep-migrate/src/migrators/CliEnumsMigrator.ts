import {
  EEpSdkTask_TargetState,
  EpSdkApplicationDomainTask,
  IEpSdkApplicationDomainTask_ExecuteReturn,
  EpSdkEnumTask,
  IEpSdkEnumTask_ExecuteReturn,
  EpSdkEnumVersionTask,
  IEpSdkEnumVersionTask_ExecuteReturn,
  TEpSdkEnumValue,
  EEpSdkTask_Action,
  EpSdkEnumsService,
  EpSdkEnumVersionsService,
} from "@solace-labs/ep-sdk";
import {
  ApplicationDomain,
  TopicAddressEnum, TopicAddressEnumVersion,
} from "@solace-labs/ep-openapi-node";
import {
  CliEPApiContentError,
  CliErrorFactory,
  CliLogger,
  ECliStatusCodes,
  CliRunContext,
  ECliRunContext_RunMode,
  CliRunSummary,
  ICliEnumsRunContext,
  ICliEnumRunContext,
  CliMigrateManager,
  CliConfig,
  ECliRunIssueTypes,
  CliRunIssues,
  ICliRunIssueEnum,
} from "../cli-components";
import { 
  CliMigrator, 
  ICliMigratorOptions, 
  ICliMigratorRunReturn 
} from "./CliMigrator";
import { 
  EpV1ApiMeta,
  EpV1Enum,
  EpV1EnumsResponse,
  EpV1EnumsService,
  EpV1EnumValue
} from "../epV1";
import { 
  ICliConfigEp2Versions, 
  ICliMigratedEnum 
} from "./types";


export interface ICliEnumsMigrateConfig {
  epV2: {
    applicationDomainName: string;
    versions: ICliConfigEp2Versions;
  },
}
export interface ICliEnumsMigratorOptions extends ICliMigratorOptions {
  cliEnumsMigrateConfig: ICliEnumsMigrateConfig;
}
export interface ICliEnumsMigratorRunMigrateReturn {
  epV2EnumApplicationDomainName: string;
  epV2EnumApplicationDomainId: string;
  cliMigratedEnums: Array<ICliMigratedEnum>;
}
export interface ICliEnumsMigratorRunReturn extends ICliMigratorRunReturn {
  cliEnumsMigratorRunMigrateReturn: ICliEnumsMigratorRunMigrateReturn;
}

export class CliEnumsMigrator extends CliMigrator {
  protected options: ICliEnumsMigratorOptions;
  private cliMigratedEnums: Array<ICliMigratedEnum> = [];

  constructor(options: ICliEnumsMigratorOptions, runMode: ECliRunContext_RunMode) {
    super(options, runMode);
  }

  private async presentEnumCustomAttributes({ epSdkEnumTask_ExecuteReturn }:{
    epSdkEnumTask_ExecuteReturn: IEpSdkEnumTask_ExecuteReturn;
  }): Promise<TopicAddressEnum> {
    const funcName = 'presentEnumCustomAttributes';
    const logName = `${CliEnumsMigrator.name}.${funcName}()`;
    // runId
    if(epSdkEnumTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action !== EEpSdkTask_Action.CREATE) return epSdkEnumTask_ExecuteReturn.epObject;
    /* istanbul ignore next */
    if(epSdkEnumTask_ExecuteReturn.epObject.id === undefined) throw new CliEPApiContentError(logName, "epSdkEnumTask_ExecuteReturn.epObject.id === undefined", { topicAddressEnum: epSdkEnumTask_ExecuteReturn.epObject });    
    const newTopicAddressEnum: TopicAddressEnum = await EpSdkEnumsService.setCustomAttributes({
      enumId: epSdkEnumTask_ExecuteReturn.epObject.id,
      epSdkCustomAttributes: [
        { 
          name: CliMigrateManager.EpV2RunIdCustomAttributeDefinition.name,
          scope: CliMigrateManager.EpV2RunIdCustomAttributeDefinition.scope,
          valueType: CliMigrateManager.EpV2RunIdCustomAttributeDefinition.valueType,
          value: CliConfig.getRunId(),
        }
      ]
    });
    return newTopicAddressEnum;
  }

  private async presentEnumVersionCustomAttributes({ epSdkEnumVersionTask_ExecuteReturn }:{
    epSdkEnumVersionTask_ExecuteReturn: IEpSdkEnumVersionTask_ExecuteReturn;
  }): Promise<TopicAddressEnumVersion> {
    const funcName = 'presentEnumVersionCustomAttributes';
    const logName = `${CliEnumsMigrator.name}.${funcName}()`;
    // runId
    if(
      epSdkEnumVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action !== EEpSdkTask_Action.CREATE_FIRST_VERSION &&
      epSdkEnumVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action !== EEpSdkTask_Action.CREATE_NEW_VERSION
    ) return epSdkEnumVersionTask_ExecuteReturn.epObject;
    /* istanbul ignore next */
    if(epSdkEnumVersionTask_ExecuteReturn.epObject.id === undefined) throw new CliEPApiContentError(logName, "epSdkEnumVersionTask_ExecuteReturn.epObject.id === undefined", { topicAddressEnumVersion: epSdkEnumVersionTask_ExecuteReturn.epObject });    
    const newTopicAddressEnumVersion: TopicAddressEnumVersion = await EpSdkEnumVersionsService.setCustomAttributes({
      enumVersionId: epSdkEnumVersionTask_ExecuteReturn.epObject.id,
      epSdkCustomAttributes: [
        { 
          name: CliMigrateManager.EpV2RunIdCustomAttributeDefinition.name,
          scope: CliMigrateManager.EpV2RunIdCustomAttributeDefinition.scope,
          valueType: CliMigrateManager.EpV2RunIdCustomAttributeDefinition.valueType,
          value: CliConfig.getRunId(),
        }
      ]
    });
    return newTopicAddressEnumVersion;
  }

  private async migrateEnum({ epV1Enum, epV2ApplicationDomain }:{
    epV1Enum: EpV1Enum;
    epV2ApplicationDomain: ApplicationDomain;
  }): Promise<void> {
    const funcName = 'migrateEnum';
    const logName = `${CliEnumsMigrator.name}.${funcName}()`;
    /* istanbul ignore next */
    if(epV2ApplicationDomain.id === undefined) throw new CliEPApiContentError(logName, "epV2ApplicationDomain.id === undefined", { epV2ApplicationDomain });
    const rctxt: ICliEnumRunContext = {
      epV1: {
        epV1Enum,
      },
      epV2: {
        applicationDomain: epV2ApplicationDomain,        
      }
    };
    CliRunContext.push(rctxt);
    CliRunSummary.processingEpV1Enum({ enumName: epV1Enum.name });
    // present enum
    const epSdkEnumTask = new EpSdkEnumTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: epV2ApplicationDomain.id,
      enumName: epV1Enum.name,
      enumObjectSettings: {
        shared: true,
      },
      epSdkTask_TransactionConfig: this.get_IEpSdkTask_TransactionConfig(),
    });
    const epSdkEnumTask_ExecuteReturn: IEpSdkEnumTask_ExecuteReturn = await this.executeTask({epSdkTask: epSdkEnumTask });
    const enumObject: TopicAddressEnum = epSdkEnumTask_ExecuteReturn.epObject;
    /* istanbul ignore next */
    if(enumObject.id === undefined) throw new CliEPApiContentError(logName,"enumObject.id === undefined", { enumObject: enumObject });
    // set custom attributes
    epSdkEnumTask_ExecuteReturn.epObject = await this.presentEnumCustomAttributes({ epSdkEnumTask_ExecuteReturn });
    CliLogger.trace(CliLogger.createLogEntry(logName, {code: ECliStatusCodes.PRESENT_EP_V2_ENUM, details: { epSdkEnumTask_ExecuteReturn }}));
    CliRunSummary.presentEpV2Enum({ applicationDomainName: epV2ApplicationDomain.name, epSdkEnumTask_ExecuteReturn });
    // present the enum version
    const enumValues: Array<TEpSdkEnumValue> = epV1Enum.values.map( (epV1Enum: EpV1EnumValue): TEpSdkEnumValue => { 
      if(epV1Enum.value === undefined) throw new CliEPApiContentError(logName,"epV1Enum.value === undefined", { epV1Enum });
      return {
        value: epV1Enum.value,
        label: epV1Enum.displayName ? epV1Enum.displayName : epV1Enum.value
      }
    });
    const epSdkEnumVersionTask = new EpSdkEnumVersionTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: epV2ApplicationDomain.id,
      enumId: enumObject.id,
      versionString: this.options.cliEnumsMigrateConfig.epV2.versions.initialVersion,
      versionStrategy: this.get_EEpSdk_VersionTaskStrategy(this.options.cliEnumsMigrateConfig.epV2.versions.versionStrategy),
      enumValues: enumValues,
      enumVersionSettings: {
        description: epV1Enum.description,
        stateId: this.get_EpSdk_StateId(this.options.cliEnumsMigrateConfig.epV2.versions.state)
      },
      epSdkTask_TransactionConfig: this.get_IEpSdkTask_TransactionConfig(),
      checkmode: false,
    });
    const epSdkEnumVersionTask_ExecuteReturn: IEpSdkEnumVersionTask_ExecuteReturn = await this.executeTask({ epSdkTask: epSdkEnumVersionTask });
    // set custom attributes
    epSdkEnumVersionTask_ExecuteReturn.epObject = await this.presentEnumVersionCustomAttributes({ epSdkEnumVersionTask_ExecuteReturn });
    CliLogger.trace(CliLogger.createLogEntry(logName, {code: ECliStatusCodes.PRESENT_EP_V2_ENUM_VERSION, details: { epSdkEnumVersionTask_ExecuteReturn }}));
    CliRunSummary.presentEpV2EnumVersion({ applicationDomainName: epV2ApplicationDomain.name, epSdkEnumVersionTask_ExecuteReturn });
    this.cliMigratedEnums.push({
      epV1Enum: epV1Enum,
      epV2Enum: {
        topicAddressEnum: enumObject,
        topicAddressEnumVersion: epSdkEnumVersionTask_ExecuteReturn.epObject
      }
    });
    CliRunContext.pop();
  }

  private async run_migrate(): Promise<ICliEnumsMigratorRunMigrateReturn> {
    const funcName = 'run_migrate';
    const logName = `${CliEnumsMigrator.name}.${funcName}()`;
    
    const epV2ApplicationDomainName = this.options.applicationDomainPrefix ? `${this.options.applicationDomainPrefix}${this.options.cliEnumsMigrateConfig.epV2.applicationDomainName}` : this.options.cliEnumsMigrateConfig.epV2.applicationDomainName;
    const rctxt: ICliEnumsRunContext = {
      epV2ApplicationDomainName
    };
    CliRunContext.push(rctxt);
    CliRunSummary.processingEpV1Enums();

    // present application domain for enums
    const applicationDomainsTask = new EpSdkApplicationDomainTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainName: epV2ApplicationDomainName,
      applicationDomainSettings: {
      },
      epSdkTask_TransactionConfig: this.get_IEpSdkTask_TransactionConfig(),
      checkmode: false,
    });
    const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await this.executeTask({ epSdkTask: applicationDomainsTask });
    // set custom attributes
    epSdkApplicationDomainTask_ExecuteReturn.epObject = await this.presentApplicationDomainRunIdCustomAttribute({ epSdkApplicationDomainTask_ExecuteReturn });
    CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.MIGRATE_ENUMS_APPLICATION_DOMAIN, message: "application domain", details: { epSdkApplicationDomainTask_ExecuteReturn }}));
    /* istanbul ignore next */
    if(epSdkApplicationDomainTask_ExecuteReturn.epObject.id === undefined) throw new CliEPApiContentError(logName, "epSdkApplicationDomainTask_ExecuteReturn.epObject.id === undefined", {
      applicationDomainObject: epSdkApplicationDomainTask_ExecuteReturn.epObject,
    });    
    CliRunSummary.presentEpV2EnumApplicationDomain({ epSdkApplicationDomainTask_ExecuteReturn: epSdkApplicationDomainTask_ExecuteReturn });

    // get all the enums and walk the list
    let nextPage: number | null = 1;
    while (nextPage !== null) {
      const epV1EnumsResponse: EpV1EnumsResponse = await EpV1EnumsService.list8({ pageNumber: nextPage, pageSize: 100 });
      if(epV1EnumsResponse.data && epV1EnumsResponse.data.length > 0) {
        for(const epEnum of epV1EnumsResponse.data) {
          const epV1Enum: EpV1Enum = epEnum as EpV1Enum;
          try {
            await this.migrateEnum({ 
              epV1Enum: epV1Enum as EpV1Enum,
              epV2ApplicationDomain: epSdkApplicationDomainTask_ExecuteReturn.epObject
            });
          } catch(e: any) {
            const error = CliErrorFactory.createCliError({ logName, error: e} );
            CliLogger.error(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.MIGRATE_ENUMS_ERROR, details: { error }}));
            // add to issues log  
            const rctxt: ICliEnumRunContext | undefined = CliRunContext.pop() as ICliEnumRunContext | undefined;
            const issue: ICliRunIssueEnum = {
              type: ECliRunIssueTypes.EnumIssue,
              epV1Id: epV1Enum.id,
              epV1Enum,
              cliRunContext: rctxt,
              cause: error
            };
            CliRunIssues.add(issue);
            CliRunSummary.processingEpV1EnumIssue({ rctxt });
          }
        }
      } else {
        CliRunSummary.processingEpV1EnumsNoneFound();
      }
      if(epV1EnumsResponse.meta) {
        const apiMeta = epV1EnumsResponse.meta as EpV1ApiMeta;
        nextPage = apiMeta.pagination.nextPage;
      } else {
        nextPage = null;
      }
    }
    CliRunContext.pop();
    CliRunSummary.processingEpV1EnumsDone();
    return {
      epV2EnumApplicationDomainId: epSdkApplicationDomainTask_ExecuteReturn.epObject.id,
      epV2EnumApplicationDomainName: epSdkApplicationDomainTask_ExecuteReturn.epObject.name,
      cliMigratedEnums: this.cliMigratedEnums
    };
  } 

  public async run(): Promise<ICliEnumsMigratorRunReturn> {
    const funcName = 'run';
    const logName = `${CliEnumsMigrator.name}.${funcName}()`;
    CliLogger.debug(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.MIGRATE_ENUMS_START }));
    const cliEnumsMigratorRunReturn: ICliEnumsMigratorRunReturn = {
      cliEnumsMigratorRunMigrateReturn: {
        epV2EnumApplicationDomainName: "undefined",
        epV2EnumApplicationDomainId: "undefined",  
        cliMigratedEnums: []
      },
      error: undefined
    };
    try {
      cliEnumsMigratorRunReturn.cliEnumsMigratorRunMigrateReturn = await this.run_migrate();
      CliLogger.debug(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.MIGRATE_ENUMS_DONE, details: { cliEnumMigratorRunMigrateReturn: cliEnumsMigratorRunReturn.cliEnumsMigratorRunMigrateReturn }}));
    } catch (e: any) {
      cliEnumsMigratorRunReturn.error = CliErrorFactory.createCliError({logName: logName, error: e });
    } finally {
      if (cliEnumsMigratorRunReturn.error !== undefined) {
        CliLogger.error(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.MIGRATE_ENUMS_ERROR, details: { error: cliEnumsMigratorRunReturn.error }}));
      }
    }
    return cliEnumsMigratorRunReturn;
  }
}
