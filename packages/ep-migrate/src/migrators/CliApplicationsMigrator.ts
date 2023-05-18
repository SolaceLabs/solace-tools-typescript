import {
  // EEpSdkTask_TargetState,
  // EpSdkSchemaTask,
  // IEpSdkSchemaTask_ExecuteReturn,
  // EpSdkSchemaVersionTask,
  // IEpSdkSchemaVersionTask_ExecuteReturn,
  EpSdkError,
  EpSdkFeatureNotSupportedError,
} from "@solace-labs/ep-sdk";
import {
  CliEPApiContentError,
  CliErrorFactory,
  CliLogger,
  ECliStatusCodes,
  CliRunContext,
  ECliRunContext_RunMode,
  CliRunSummary,
  CliRunIssues,
  ECliRunIssueTypes,
  ICliApplicationRunContext,
  ICliRunIssueApplication,
} from "../cli-components";
import { 
  CliMigrator, 
  ICliMigratorOptions, 
  ICliMigratorRunReturn 
} from "./CliMigrator";
import { 
  EpV1ApiMeta,
  EpV1Application,
  EpV1ApplicationsResponse,
  EpV1ApplicationsService,
} from "../epV1";
import { 
  ICliConfigEp2Versions, 
  ICliMigratedApplication, 
  ICliMigratedApplicationDomain, 
  ICliMigratedEnum, 
  ICliMigratedEvent, 
  ICliMigratedSchema
} from "./types";

export interface ICliConfigApplicationsEnvironment {
  environmentName: string;
}
export interface ICliApplicationsMigrateConfig {
  epV2: {
    environment: ICliConfigApplicationsEnvironment;
    versions: ICliConfigEp2Versions;
  },
}
export interface ICliApplicationsMigratorOptions extends ICliMigratorOptions {
  cliMigratedApplicationDomains: Array<ICliMigratedApplicationDomain>;
  cliMigratedEnums: Array<ICliMigratedEnum>;
  cliMigratedSchemas: Array<ICliMigratedSchema>;
  cliMigratedEvents: Array<ICliMigratedEvent>;
  cliApplicationsMigrateConfig: ICliApplicationsMigrateConfig;
}
interface ICliApplicationsMigratorRunMigrateReturn {
  cliMigratedApplications: Array<ICliMigratedApplication>;
}
export interface ICliApplicationsMigratorRunReturn extends ICliMigratorRunReturn {
  cliApplicationsMigratorRunMigrateReturn: ICliApplicationsMigratorRunMigrateReturn;
}

export class CliApplicationsMigrator extends CliMigrator {
  protected options: ICliApplicationsMigratorOptions;
  private cliMigratedApplications: Array<ICliMigratedApplication> = [];

  constructor(options: ICliApplicationsMigratorOptions, runMode: ECliRunContext_RunMode) {
    super(options, runMode);
  }

  private async setupApplicationEnvironment(): Promise<void> {
    const funcName = 'setupApplicationEnvironment';
    const logName = `${CliApplicationsMigrator.name}.${funcName}()`;

    // environName from config
    // set-up mem
    // set up dummy service

    console.log(`>>>>>>>>>>> ${logName}: set up application environment ...`);

  }

  private async migrateApplication({ cliMigratedApplicationDomain, epV1Application }:{
    cliMigratedApplicationDomain: ICliMigratedApplicationDomain;
    epV1Application: EpV1Application;
  }): Promise<void> {
    const funcName = 'migrateApplication';
    const logName = `${CliApplicationsMigrator.name}.${funcName}()`;
    /* istanbul ignore next */
    if(cliMigratedApplicationDomain.epV2ApplicationDomain.id === undefined) throw new CliEPApiContentError(logName,"cliMigratedApplicationDomain.epV2ApplicationDomain.id === undefined", { epV2ApplicationDomain: cliMigratedApplicationDomain.epV2ApplicationDomain });

    const rctxt: ICliApplicationRunContext = {
      epV1: {
        applicationDomain: cliMigratedApplicationDomain.epV1ApplicationDomain,
        epV1Application
      },
      epV2: {
        applicationDomain: cliMigratedApplicationDomain.epV2ApplicationDomain,
      }
    };
    CliRunContext.push(rctxt);
    CliRunSummary.processingEpV1Application({ applicationName: epV1Application.name });

    throw new EpSdkFeatureNotSupportedError(logName, this.constructor.name, 'implement processing application', {
      todo: 'implement me'
    });

    CliRunContext.pop();
  }

  private async run_migrate(): Promise<ICliApplicationsMigratorRunMigrateReturn> {
    const funcName = 'run_migrate';
    const logName = `${CliApplicationsMigrator.name}.${funcName}()`;
    
    for(const cliMigratedApplicationDomain of this.options.cliMigratedApplicationDomains) {
      CliRunSummary.processingEpV1Applications(cliMigratedApplicationDomain.epV1ApplicationDomain.name);
      /* istanbul ignore next */
      if(cliMigratedApplicationDomain.epV2ApplicationDomain.id === undefined) throw new CliEPApiContentError(logName, "cliMigratedApplicationDomain.epV2ApplicationDomain.id", { epV2ApplicationDomain: cliMigratedApplicationDomain.epV2ApplicationDomain });
      // get all the epv1 events in application domain and walk the list
      let nextPage: number | null = 1;
      while (nextPage !== null) {
        const epV1ApplicationsResponse: EpV1ApplicationsResponse = await EpV1ApplicationsService.list9({ pageNumber: nextPage, pageSize: 100, applicationDomainId: cliMigratedApplicationDomain.epV1ApplicationDomain.id });
        if(epV1ApplicationsResponse.data && epV1ApplicationsResponse.data.length > 0) {
          for(const application of epV1ApplicationsResponse.data) {
            const epV1Application: EpV1Application = application as EpV1Application;
            try {
              await this.migrateApplication({ cliMigratedApplicationDomain, epV1Application });   
            } catch(e: any) {
              if(e instanceof EpSdkError) {
                CliLogger.error(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.MIGRATE_APPLICATIONS_ERROR, details: { error: e }}));
                // add to issues log  
                const rctxt: ICliApplicationRunContext | undefined = CliRunContext.pop() as ICliApplicationRunContext| undefined;
                const issue: ICliRunIssueApplication = {
                  type: ECliRunIssueTypes.ApplicationIssue,
                  epV1Id: epV1Application.id,
                  epV1Application,
                  cliRunContext: rctxt,
                  cause: e
                };
                CliRunIssues.add(issue);
                CliRunSummary.processingEpV1ApplicationIssue({ rctxt });        
              } else throw e;
            }
          }
        } else {
          CliRunSummary.processingEpV1ApplicationsNoneFound();
        }
        if(epV1ApplicationsResponse.meta) {
          const apiMeta = epV1ApplicationsResponse.meta as EpV1ApiMeta;
          nextPage = apiMeta.pagination.nextPage;
        } else {
          nextPage = null;
        }
      }
      CliRunSummary.processingEpV1ApplicationsDone(cliMigratedApplicationDomain.epV1ApplicationDomain.name);
    }
    return {
      cliMigratedApplications: this.cliMigratedApplications
    };
  } 

  public async run(): Promise<ICliApplicationsMigratorRunReturn> {
    const funcName = 'run';
    const logName = `${CliApplicationsMigrator.name}.${funcName}()`;
    CliLogger.debug(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.MIGRATE_APPLICATIONS_START }));
    const cliApplicationsMigratorRunReturn: ICliApplicationsMigratorRunReturn = {
      cliApplicationsMigratorRunMigrateReturn: {
        cliMigratedApplications: [],
      },
      error: undefined
    };
    try {
      await this.setupApplicationEnvironment();
      cliApplicationsMigratorRunReturn.cliApplicationsMigratorRunMigrateReturn = await this.run_migrate();
      CliLogger.debug(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.MIGRATE_APPLICATIONS_DONE, details: { cliApplicationsMigratorRunMigrateReturn: cliApplicationsMigratorRunReturn.cliApplicationsMigratorRunMigrateReturn }}));
    } catch (e: any) {
      cliApplicationsMigratorRunReturn.error = CliErrorFactory.createCliError({logName: logName, error: e });
    } finally {
      if (cliApplicationsMigratorRunReturn.error !== undefined) {
        CliLogger.error(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.MIGRATE_EVENTS_ERROR, details: { error: cliApplicationsMigratorRunReturn.error }}));
      }
    }
    return cliApplicationsMigratorRunReturn;
  }
}
