import { 
  AddressLevel,
  ApplicationDomain, 
} from "@solace-labs/ep-openapi-node";
import {
  EEpSdkTask_TargetState,
  EpSdkApplicationDomainTask,
  EpSdkBrokerTypes,
  EpSdkCustomAttributeDefinitionTask,
  EpSdkDefaultTopicDelimitors,
  EpSdkTopicAddressLevelService,
  IEpSdkApplicationDomainTask_ExecuteReturn,
  TEpSdkApplicationDomainTask_TopicDomainSettings,
} from "@solace-labs/ep-sdk";
import {
  CliEPApiContentError,
  CliErrorFactory,
  CliLogger,
  ECliStatusCodes,
  CliRunContext,
  ECliRunContext_RunMode,
  CliRunSummary,
  ICliApplicationDomainRunContext,
  ICliMigrateManagerOptionsEpV1,
  ICliRunIssueApplicationDomain,
  ECliRunIssueTypes,
  CliRunIssues,
  ICliRunIssueEnum,
  CliMigrateReferenceIssueError,
  CliMigrateTopicDomainAddressLevelEnumVersionReferenceIssueError,
} from "../cli-components";
import { 
  CliMigrator, 
  ICliMigratorOptions, 
  ICliMigratorRunReturn 
} from "./CliMigrator";
import { 
  EpV1ApiMeta,
  EpV1ApplicationDomain,
  EpV1ApplicationDomainsResponse,
  EpV1ApplicationDomainsService,
} from "../epV1";
import { 
  ICliMigratedApplicationDomain, 
} from "./types";
import { 
  ICliEnumsMigratorRunMigrateReturn 
} from "./CliEnumsMigrator";


export interface ICliApplicationDomainsMigrateConfig {
  epV1?: ICliMigrateManagerOptionsEpV1;
  epV2: {
    // placeholder
  },
}
export interface ICliApplicationDomainsMigratorOptions extends ICliMigratorOptions {
  cliApplicationDomainsMigrateConfig: ICliApplicationDomainsMigrateConfig;
  cliEnumsMigratorRunMigrateReturn: ICliEnumsMigratorRunMigrateReturn;
}
interface ICliApplicationDomainsMigratorRunMigrateReturn {
  cliMigratedApplicationDomains: Array<ICliMigratedApplicationDomain>;
}
export interface ICliApplicationDomainsMigratorRunReturn extends ICliMigratorRunReturn {
  cliApplicationDomainsMigratorRunMigrateReturn: ICliApplicationDomainsMigratorRunMigrateReturn;
}

export class CliApplicationDomainsMigrator extends CliMigrator {
  protected options: ICliApplicationDomainsMigratorOptions;
  private cliMigratedApplicationDomains: Array<ICliMigratedApplicationDomain> = [];

  constructor(options: ICliApplicationDomainsMigratorOptions, runMode: ECliRunContext_RunMode) {
    super(options, runMode);
  }

  private async presentCustomAttributes({ epSdkApplicationDomainTask_ExecuteReturn }:{
    epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn;
  }): Promise<ApplicationDomain> {
    return this.presentApplicationDomainRunIdCustomAttribute({ epSdkApplicationDomainTask_ExecuteReturn });
  }

  private async presentCustomAttributeDefinitions({ applicationDomainId }:{
    applicationDomainId: string;
  }): Promise<void> {
    // tags
    const epSdkCustomAttributeDefinitionTask = new EpSdkCustomAttributeDefinitionTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      attributeName: CliMigrator.EpV2TagCustomAttributeDefinition.name,
      customAttributeDefinitionObjectSettings: {
        associatedEntityTypes: CliMigrator.EpV2TagCustomAttributeDefinition.associatedEntityTypes,
        scope: CliMigrator.EpV2TagCustomAttributeDefinition.scope,
        valueType: CliMigrator.EpV2TagCustomAttributeDefinition.valueType,
        applicationDomainId
      },
    });
    await epSdkCustomAttributeDefinitionTask.execute();
  }

  private async migrateApplicationDomain({ epV1ApplicationDomain }:{
    epV1ApplicationDomain: EpV1ApplicationDomain;
  }): Promise<void> {
    const funcName = 'migrateApplicationDomain';
    const logName = `${CliApplicationDomainsMigrator.name}.${funcName}()`;
    const epV2ApplicationDomainName = this.options.applicationDomainPrefix ? `${this.options.applicationDomainPrefix}${epV1ApplicationDomain.name}` : epV1ApplicationDomain.name;
    const rctxt: ICliApplicationDomainRunContext = {
      epV1: {
        applicationDomain: epV1ApplicationDomain
      },
      epV2: {
        applicationDomainName: epV2ApplicationDomainName
      }
    };
    CliRunContext.push(rctxt);
    CliRunSummary.processingEpV1ApplicationDomain({ applicationDomainName: epV1ApplicationDomain.name });
    // present epv2 application domain
    const addressLevels = await EpSdkTopicAddressLevelService.createTopicAddressLevels({
      topicString: epV1ApplicationDomain.topicDomain,
      enumApplicationDomainIds: [ this.options.cliEnumsMigratorRunMigrateReturn.epV2EnumApplicationDomainId ]
    });
    let topicDomainSettings: TEpSdkApplicationDomainTask_TopicDomainSettings | undefined;
    // let topicDomainEnforcementEnabled = false;
    if(addressLevels !== undefined) {
      let setTopicDomainSettings = true;
      // check if addressLevels contain variables AND an enum is defined
      for(const addressLevel of addressLevels) {
        if(addressLevel.addressLevelType === AddressLevel.addressLevelType.VARIABLE && addressLevel.enumVersionId === undefined) {
          setTopicDomainSettings = false;
          // find the issue for epV1 enum by name
          const allEnumIssues: Array<ICliRunIssueEnum> = CliRunIssues.get({ type: ECliRunIssueTypes.EnumIssue }) as Array<ICliRunIssueEnum>;
          const enumIssue: ICliRunIssueEnum | undefined = allEnumIssues.find( x => x.epV1Enum.name === addressLevel.name );
          if(enumIssue) {
            // log the issue, but continue
            const error = new CliMigrateReferenceIssueError(logName, [enumIssue]);
            CliLogger.error(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.MIGRATE_APPLICATION_DOMAINS_ERROR, details: { error }}));
            // add to issues log  
            const rctxt: ICliApplicationDomainRunContext | undefined = CliRunContext.get() as ICliApplicationDomainRunContext | undefined;
            const issue: ICliRunIssueApplicationDomain = {
              type: ECliRunIssueTypes.ApplicationDomainIssue,
              epV1Id: epV1ApplicationDomain.id,
              epV1ApplicationDomain,
              cliRunContext: rctxt,
              cause: error
            };
            CliRunIssues.add(issue);
            CliRunSummary.processingEpV1ApplicationDomainIssue({ rctxt });
          } else {
            // log the issue, but continue
            // could not find an issue, most likely enum is missing altogether
            const error = new CliMigrateTopicDomainAddressLevelEnumVersionReferenceIssueError(logName, {
              message: 'missing EpV1 topicDomain enum',
              addressLevel
            });
            CliLogger.error(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.MIGRATE_APPLICATION_DOMAINS_ERROR, details: { error }}));
            // add to issues log  
            const rctxt: ICliApplicationDomainRunContext | undefined = CliRunContext.get() as ICliApplicationDomainRunContext | undefined;
            const issue: ICliRunIssueApplicationDomain = {
              type: ECliRunIssueTypes.ApplicationDomainIssue,
              epV1Id: epV1ApplicationDomain.id,
              epV1ApplicationDomain,
              cliRunContext: rctxt,
              cause: error
            };
            CliRunIssues.add(issue);
            CliRunSummary.processingEpV1ApplicationDomainIssue({ rctxt });
          }
        }
      }
      if(setTopicDomainSettings) {
        // create the topic domain settings for the task
        topicDomainSettings = {
          brokerType: EpSdkBrokerTypes.Solace,
          topicString: epV1ApplicationDomain.topicDomain,
          enumApplicationDomainIds: [ this.options.cliEnumsMigratorRunMigrateReturn.epV2EnumApplicationDomainId ],
          topicDelimiter: EpSdkDefaultTopicDelimitors.Solace
        };
        //topicDomainEnforcementEnabled = true;
      }
    }
    const applicationDomainTask = new EpSdkApplicationDomainTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainName: epV2ApplicationDomainName,
      applicationDomainSettings: {
        description: epV1ApplicationDomain.description,
        uniqueTopicAddressEnforcementEnabled: epV1ApplicationDomain.enforceUniqueTopicNames,
        // EP V1 does not enforce it, so enabling it would fail to migrate
        // topicDomainEnforcementEnabled: topicDomainEnforcementEnabled,
        topicDomainEnforcementEnabled: false,
        topicDomains: topicDomainSettings ? [topicDomainSettings] : undefined,
      },
      epSdkTask_TransactionConfig: this.get_IEpSdkTask_TransactionConfig(),
      checkmode: false,
    });
    const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await this.executeTask({ epSdkTask: applicationDomainTask });
    /* istanbul ignore next */
    if(epSdkApplicationDomainTask_ExecuteReturn.epObject.id === undefined) throw new CliEPApiContentError(logName, "epSdkApplicationDomainTask_ExecuteReturn.epObject.id === undefined", {
      applicationDomainObject: epSdkApplicationDomainTask_ExecuteReturn.epObject,
    });
    // create the custom attribute definitions
    await this.presentCustomAttributeDefinitions({ 
      applicationDomainId: epSdkApplicationDomainTask_ExecuteReturn.epObject.id
    });
    // set custom attributes
    epSdkApplicationDomainTask_ExecuteReturn.epObject = await this.presentCustomAttributes({ epSdkApplicationDomainTask_ExecuteReturn });
    // summary & log
    CliRunSummary.presentEpV2ApplicationDomain({ epSdkApplicationDomainTask_ExecuteReturn });
    CliLogger.trace(CliLogger.createLogEntry(logName, {code: ECliStatusCodes.PRESENT_EP_V2_APPLICATION_DOMAIN, details: { 
      epSdkApplicationDomainTask_ExecuteReturn,
     }}));
    this.cliMigratedApplicationDomains.push({
      epV1ApplicationDomain: epV1ApplicationDomain,
      epV2ApplicationDomain: epSdkApplicationDomainTask_ExecuteReturn.epObject,
    });
    CliRunContext.pop();
  }

  private async run_migrate(): Promise<ICliApplicationDomainsMigratorRunMigrateReturn> {
    const funcName = 'run_migrate';
    const logName = `${CliApplicationDomainsMigrator.name}.${funcName}()`;

    CliRunSummary.processingEpV1ApplicationDomains();

    // get all the application domains and walk the list
    let nextPage: number | null = 1;
    while (nextPage !== null) {
      const epV1ApplicationDomainsResponse: EpV1ApplicationDomainsResponse = await EpV1ApplicationDomainsService.list12({ pageNumber: nextPage, pageSize: 100 });
      if(epV1ApplicationDomainsResponse.data && epV1ApplicationDomainsResponse.data.length > 0) {
        for(const applicationDomain of epV1ApplicationDomainsResponse.data) {
          const epV1ApplicationDomain: EpV1ApplicationDomain = applicationDomain as EpV1ApplicationDomain;
          let doInclude = true;
          if(
            this.options.cliApplicationDomainsMigrateConfig.epV1 && 
            this.options.cliApplicationDomainsMigrateConfig.epV1.applicationDomainNames
          ) {
            if(
              this.options.cliApplicationDomainsMigrateConfig.epV1.applicationDomainNames.include && 
              this.options.cliApplicationDomainsMigrateConfig.epV1.applicationDomainNames.include.length > 0
            ) {
              doInclude = this.options.cliApplicationDomainsMigrateConfig.epV1.applicationDomainNames.include.includes(epV1ApplicationDomain.name);
            }
            if(
              this.options.cliApplicationDomainsMigrateConfig.epV1.applicationDomainNames.exclude && 
              this.options.cliApplicationDomainsMigrateConfig.epV1.applicationDomainNames.exclude.length > 0 &&
              doInclude
            ) {
              doInclude = !this.options.cliApplicationDomainsMigrateConfig.epV1.applicationDomainNames.exclude.includes(epV1ApplicationDomain.name);
            }
          }
          if(doInclude) {
            try {
              await this.migrateApplicationDomain({ epV1ApplicationDomain: epV1ApplicationDomain as EpV1ApplicationDomain });          
            } catch(e: any) {
              const error = CliErrorFactory.createCliError({ logName, error: e} );
              CliLogger.error(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.MIGRATE_APPLICATION_DOMAINS_ERROR, details: { error }}));
              // add to issues log  
              const rctxt: ICliApplicationDomainRunContext | undefined = CliRunContext.pop() as ICliApplicationDomainRunContext | undefined;
              const issue: ICliRunIssueApplicationDomain = {
                type: ECliRunIssueTypes.ApplicationDomainIssue,
                epV1Id: epV1ApplicationDomain.id,
                epV1ApplicationDomain,
                cliRunContext: rctxt,
                cause: error
              };
              CliRunIssues.add(issue);
              CliRunSummary.processingEpV1ApplicationDomainIssue({ rctxt });
            }
          }
        }
      } else {
        /* istanbul ignore next */
        CliRunSummary.processingEpV1ApplicationDomainsNoneFound();
      }
      if(epV1ApplicationDomainsResponse.meta) {
        const apiMeta = epV1ApplicationDomainsResponse.meta as EpV1ApiMeta;
        nextPage = apiMeta.pagination.nextPage;
      } else {
        /* istanbul ignore next */
        nextPage = null;
      }
    }
    CliRunSummary.processedEpV1ApplicationDomains();
    return {
      cliMigratedApplicationDomains: this.cliMigratedApplicationDomains
    };
  } 

  public async run(): Promise<ICliApplicationDomainsMigratorRunReturn> {
    const funcName = 'run';
    const logName = `${CliApplicationDomainsMigrator.name}.${funcName}()`;
    CliLogger.debug(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.MIGRATE_APPLICATION_DOMAINS_START }));
    const cliApplicationDomainsMigratorRunReturn: ICliApplicationDomainsMigratorRunReturn = {
      cliApplicationDomainsMigratorRunMigrateReturn: {
        cliMigratedApplicationDomains: [],
      },
      error: undefined
    };
    try {
      cliApplicationDomainsMigratorRunReturn.cliApplicationDomainsMigratorRunMigrateReturn = await this.run_migrate();
      /* istanbul ignore next */
      CliLogger.debug(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.MIGRATE_APPLICATION_DOMAINS_DONE, details: { cliApplicationDomainsMigratorRunMigrateReturn: cliApplicationDomainsMigratorRunReturn.cliApplicationDomainsMigratorRunMigrateReturn }}));
    } catch (e: any) {
      cliApplicationDomainsMigratorRunReturn.error = CliErrorFactory.createCliError({logName: logName, error: e });
    } finally {
      if (cliApplicationDomainsMigratorRunReturn.error !== undefined) {
        CliLogger.error(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.MIGRATE_APPLICATION_DOMAINS_ERROR, details: { error: cliApplicationDomainsMigratorRunReturn.error }}));
      }
    }
    return cliApplicationDomainsMigratorRunReturn;
  }
}
