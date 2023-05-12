import {
  EEpSdkTask_TargetState,
  EpSdkApplicationDomainTask,
  EpSdkApplicationDomainsService,
  EpSdkBrokerTypes,
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
import { ICliEnumsMigratorRunMigrateReturn } from "./CliEnumsMigrator";


export interface ICliApplicationDomainsMigrateConfig {
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

  private async migrateApplicationDomain({ epV1ApplicationDomain }:{
    epV1ApplicationDomain: EpV1ApplicationDomain;
  }): Promise<void> {
    const funcName = 'migrateApplicationDomain';
    const logName = `${CliApplicationDomainsMigrator.name}.${funcName}()`;
    const rctxt: ICliApplicationDomainRunContext = {
      epV1ApplicationDomainName: epV1ApplicationDomain.name,
    };
    CliRunContext.push(rctxt);
    CliRunSummary.processingEpV1ApplicationDomain({ applicationDomainName: epV1ApplicationDomain.name });

    // console.log(`\n\n\n${logName}: epV1ApplicationDomain.topicDomain = ${JSON.stringify(epV1ApplicationDomain.topicDomain)}`);
    // const topicAddressLevels: Array<AddressLevel> | undefined = await EpSdkTopicAddressLevelService.createTopicAddressLevels({
    //   topicString: epV1ApplicationDomain.topicDomain,
    //   enumApplicationDomainIds: [ this.options.cliEnumsMigratorRunMigrateReturn.epV2EnumApplicationDomainId]
    // });
    // console.log(`${logName}: topicAddressLevels = ${JSON.stringify(topicAddressLevels, null, 2)}\n\n\n\n`);

    // present epv2 application domain
    const epV2ApplicationDomainName = this.options.applicationDomainPrefix ? `${this.options.applicationDomainPrefix}${epV1ApplicationDomain.name}` : epV1ApplicationDomain.name;
    const addressLevels = await EpSdkTopicAddressLevelService.createTopicAddressLevels({
      topicString: epV1ApplicationDomain.topicDomain,
      enumApplicationDomainIds: [ this.options.cliEnumsMigratorRunMigrateReturn.epV2EnumApplicationDomainId ]
    });
    let topicDomainSettings: TEpSdkApplicationDomainTask_TopicDomainSettings | undefined;
    let topicDomainEnforcementEnabled = false;
    if(addressLevels !== undefined) {
      topicDomainSettings = {
        brokerType: EpSdkBrokerTypes.Solace,
        topicString: epV1ApplicationDomain.topicDomain,
        enumApplicationDomainIds: [ this.options.cliEnumsMigratorRunMigrateReturn.epV2EnumApplicationDomainId],
        topicDelimiter: EpSdkDefaultTopicDelimitors.Solace
      };
      topicDomainEnforcementEnabled = true;
    }
    const applicationDomainsTask = new EpSdkApplicationDomainTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainName: epV2ApplicationDomainName,
      applicationDomainSettings: {
        description: epV1ApplicationDomain.description,
        uniqueTopicAddressEnforcementEnabled: epV1ApplicationDomain.enforceUniqueTopicNames,
        topicDomainEnforcementEnabled: topicDomainEnforcementEnabled,
        topicDomains: topicDomainSettings ? [topicDomainSettings] : undefined,
      },
      epSdkTask_TransactionConfig: this.get_IEpSdkTask_TransactionConfig(),
      checkmode: false,
    });
    const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await this.executeTask({ epSdkTask: applicationDomainsTask });
    /* istanbul ignore next */
    if(epSdkApplicationDomainTask_ExecuteReturn.epObject.id === undefined) throw new CliEPApiContentError(logName, "epSdkApplicationDomainTask_ExecuteReturn.epObject.id === undefined", {
      applicationDomainObject: epSdkApplicationDomainTask_ExecuteReturn.epObject,
    });    
    // // present topic domain
    // let epSdkTopicDomainTask_ExecuteReturn: IEpSdkTopicDomainTask_ExecuteReturn | undefined = undefined;
    // if(addressLevels !== undefined) {
    //   const epSdkTopicDomainTask: EpSdkTopicDomainTask = new EpSdkTopicDomainTask({
    //     epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
    //     applicationDomainId: epSdkApplicationDomainTask_ExecuteReturn.epObject.id,
    //     topicDomainSettings: {
    //       brokerType: EpSdkBrokerTypes.Solace,
    //       addressLevels
    //     },
    //   });
    //   epSdkTopicDomainTask_ExecuteReturn = await this.executeTask({ epSdkTask: epSdkTopicDomainTask });  
    // }
    CliRunSummary.presentEpV2ApplicationDomain({ epSdkApplicationDomainTask_ExecuteReturn });
    CliLogger.trace(CliLogger.createLogEntry(logName, {code: ECliStatusCodes.PRESENT_EP_V2_APPLICATION_DOMAIN, details: { 
      epSdkApplicationDomainTask_ExecuteReturn,
      // epSdkTopicDomainTask_ExecuteReturn
     }}));
    this.cliMigratedApplicationDomains.push({
      epV1ApplicationDomain: epV1ApplicationDomain,
      // get the new application domain - topic domain might have been added
      epV2ApplicationDomain: await EpSdkApplicationDomainsService.getById({ applicationDomainId: epSdkApplicationDomainTask_ExecuteReturn.epObject.id }),
    });
    CliRunContext.pop();
  }

  private async run_migrate(): Promise<ICliApplicationDomainsMigratorRunMigrateReturn> {

    CliRunSummary.processingEpV1ApplicationDomains();

    // get all the application domains and walk the list
    let nextPage: number | null = 1;
    while (nextPage !== null) {
      const epV1ApplicationDomainsResponse: EpV1ApplicationDomainsResponse = await EpV1ApplicationDomainsService.list12({ pageNumber: nextPage, pageSize: 10 });
      if(epV1ApplicationDomainsResponse.data && epV1ApplicationDomainsResponse.data.length > 0) {
        for(const epV1ApplicationDomain of epV1ApplicationDomainsResponse.data) {
          await this.migrateApplicationDomain({ epV1ApplicationDomain: epV1ApplicationDomain as EpV1ApplicationDomain });          
        }
      } else {
        CliRunSummary.processingEpV1ApplicationDomainsNoneFound();
      }
      if(epV1ApplicationDomainsResponse.meta) {
        const apiMeta = epV1ApplicationDomainsResponse.meta as EpV1ApiMeta;
        nextPage = apiMeta.pagination.nextPage;
      } else {
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
