import {
  EEpSdkTask_TargetState,
  EpSdkApplicationDomainTask,
  IEpSdkApplicationDomainTask_ExecuteReturn,
} from "@solace-labs/ep-sdk";
import {
  ApplicationDomain,
  TopicAddressEnum,
} from "@solace-labs/ep-openapi-node";
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
  CliSchemasMigrator, 
  ICliSchemasMigrateConfig, 
  ICliSchemasMigratorRunReturn 
} from "./CliSchemasMigrator";


export interface ICliApplicationDomainsMigrateConfig {
  epV2: {
  },
}
export interface ICliApplicationDomainsMigratorOptions extends ICliMigratorOptions {
  cliApplicationDomainsMigrateConfig: ICliApplicationDomainsMigrateConfig;
  cliSchemasMigrateConfig: ICliSchemasMigrateConfig;
}
interface ICliApplicationDomainsMigratorRunMigrateReturn {
  // should return from, to info cache for subsequent migrators
  // applicationDomainCache: Map<string, string> = new Map<string, string>();
}
export interface ICliApplicationDomainsMigratorRunReturn extends ICliMigratorRunReturn {
  cliApplicationDomainsMigratorRunMigrateReturn: ICliApplicationDomainsMigratorRunMigrateReturn;
}

export class CliApplicationDomainsMigrator extends CliMigrator {
  protected options: ICliApplicationDomainsMigratorOptions;

  constructor(options: ICliApplicationDomainsMigratorOptions, runMode: ECliRunContext_RunMode) {
    super(options, runMode);
  }

  private async migrateSchemas({ epV1ApplicationDomain, epV2ApplicationDomain }:{
    epV1ApplicationDomain: EpV1ApplicationDomain;
    epV2ApplicationDomain: ApplicationDomain;
  }): Promise<void> {
    // const funcName = 'migrateSchemas';
    // const logName = `${CliApplicationDomainsMigrator.name}.${funcName}()`;

    const cliSchemasMigrator = new CliSchemasMigrator({
      runId: this.options.runId,
      epV1ApplicationDomain,
      epV2ApplicationDomain,
      cliSchemasMigrateConfig: this.options.cliSchemasMigrateConfig,
      }, 
      ECliRunContext_RunMode.RELEASE,
    );
    const cliSchemasMigratorRunReturn: ICliSchemasMigratorRunReturn = await cliSchemasMigrator.run();
    if(cliSchemasMigratorRunReturn.error) throw cliSchemasMigratorRunReturn.error;
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

    // present epv2 application domain
    const epV2ApplicationDomainName = this.options.applicationDomainPrefix ? `${this.options.applicationDomainPrefix}${epV1ApplicationDomain.name}` : epV1ApplicationDomain.name;
    const applicationDomainsTask = new EpSdkApplicationDomainTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainName: epV2ApplicationDomainName,
      applicationDomainSettings: {
        description: epV1ApplicationDomain.description,
        uniqueTopicAddressEnforcementEnabled: epV1ApplicationDomain.enforceUniqueTopicNames,
        topicDomainEnforcementEnabled: epV1ApplicationDomain.enforceUniqueTopicNames,
        // TODO: enhance task
        // x: epV1ApplicationDomain.topicDomain
      },
      epSdkTask_TransactionConfig: this.get_IEpSdkTask_TransactionConfig(),
      checkmode: false,
    });
    const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await this.executeTask({ epSdkTask: applicationDomainsTask });
    CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.MIGRATE_APPLICATION_DOMAIN, message: "application domain", details: {
      epSdkApplicationDomainTask_ExecuteReturn: epSdkApplicationDomainTask_ExecuteReturn,
    }}));
    /* istanbul ignore next */
    if(epSdkApplicationDomainTask_ExecuteReturn.epObject.id === undefined) throw new CliEPApiContentError(logName, "epSdkApplicationDomainTask_ExecuteReturn.epObject.id === undefined", {
      applicationDomainObject: epSdkApplicationDomainTask_ExecuteReturn.epObject,
    });    
    CliRunSummary.presentEpV2ApplicationDomain({ epSdkApplicationDomainTask_ExecuteReturn });
    CliLogger.trace(CliLogger.createLogEntry(logName, {code: ECliStatusCodes.PRESENT_EP_V2_APPLICATION_DOMAIN, details: { epSdkApplicationDomainTask_ExecuteReturn }}));

    // schemas
    await this.migrateSchemas({
      epV1ApplicationDomain,
      epV2ApplicationDomain: epSdkApplicationDomainTask_ExecuteReturn.epObject
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

    return {
    };
  } 

  public async run(): Promise<ICliApplicationDomainsMigratorRunReturn> {
    const funcName = 'run';
    const logName = `${CliApplicationDomainsMigrator.name}.${funcName}()`;
    CliLogger.debug(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.MIGRATE_APPLICATION_DOMAINS_START }));
    const cliApplicationDomainsMigratorRunReturn: ICliApplicationDomainsMigratorRunReturn = {
      cliApplicationDomainsMigratorRunMigrateReturn: {},
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
