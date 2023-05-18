import {
  EEpSdkTask_TargetState,
  EpSdkSchemaTask,
  IEpSdkSchemaTask_ExecuteReturn,
  EpSdkSchemaVersionTask,
  IEpSdkSchemaVersionTask_ExecuteReturn,
  EpSdkError,
  EpSdkFeatureNotSupportedError,
} from "@solace-labs/ep-sdk";
import {
  SchemaObject,
} from "@solace-labs/ep-openapi-node";
import {
  CliEPApiContentError,
  CliErrorFactory,
  CliLogger,
  ECliStatusCodes,
  CliRunContext,
  ECliRunContext_RunMode,
  CliRunSummary,
  ICliSchemaRunContext,
  CliRunIssues,
  ICliRunIssueSchema,
  ECliRunIssueTypes,
  ICliEventRunContext,
  ICliRunIssueEvent,
} from "../cli-components";
import { 
  CliMigrator, 
  ICliMigratorOptions, 
  ICliMigratorRunReturn 
} from "./CliMigrator";
import { 
  EpV1ApiMeta,
  EpV1Event,
  EpV1EventSchema, 
  EpV1EventsResponse, 
  EpV1EventsService, 
  EpV1SchemasResponse, 
  EpV1SchemasService
} from "../epV1";
import { 
  ICliConfigEp2Versions, 
  ICliMigratedApplicationDomain, 
  ICliMigratedEnum, 
  ICliMigratedEvent, 
  ICliMigratedSchema
} from "./types";


export interface ICliEventsMigrateConfig {
  epV2: {
    versions: ICliConfigEp2Versions;
  },
}
export interface ICliEventsMigratorOptions extends ICliMigratorOptions {
  cliMigratedApplicationDomains: Array<ICliMigratedApplicationDomain>;
  cliMigratedEnums: Array<ICliMigratedEnum>;
  cliMigratedSchemas: Array<ICliMigratedSchema>;
  cliEventsMigrateConfig: ICliEventsMigrateConfig;
}
interface ICliEventsMigratorRunMigrateReturn {
  cliMigratedEvents: Array<ICliMigratedEvent>;
}
export interface ICliEventsMigratorRunReturn extends ICliMigratorRunReturn {
  cliEventsMigratorRunMigrateReturn: ICliEventsMigratorRunMigrateReturn;
}

export class CliEventsMigrator extends CliMigrator {
  protected options: ICliEventsMigratorOptions;
  private cliMigratedEvents: Array<ICliMigratedEvent> = [];

  constructor(options: ICliEventsMigratorOptions, runMode: ECliRunContext_RunMode) {
    super(options, runMode);
  }

  private async migrateEvent({ cliMigratedApplicationDomain, epV1Event }:{
    cliMigratedApplicationDomain: ICliMigratedApplicationDomain;
    epV1Event: EpV1Event;
  }): Promise<void> {
    const funcName = 'migrateEvent';
    const logName = `${CliEventsMigrator.name}.${funcName}()`;
    /* istanbul ignore next */
    if(cliMigratedApplicationDomain.epV2ApplicationDomain.id === undefined) throw new CliEPApiContentError(logName,"cliMigratedApplicationDomain.epV2ApplicationDomain.id === undefined", { epV2ApplicationDomain: cliMigratedApplicationDomain.epV2ApplicationDomain });

    const rctxt: ICliEventRunContext = {
      epV1: {
        applicationDomain: cliMigratedApplicationDomain.epV1ApplicationDomain,
        epV1Event
      },
      epV2: {
        applicationDomain: cliMigratedApplicationDomain.epV2ApplicationDomain,
      }
    };
    CliRunContext.push(rctxt);
    CliRunSummary.processingEpV1Event({ eventName: epV1Event.name });

    throw new EpSdkFeatureNotSupportedError(logName, this.constructor.name, 'implement processing event', {
      todo: 'implement me'
    });

    // TODO: implement me

    // // present schema
    // const epSdkSchemaTask = new EpSdkSchemaTask({
    //   epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
    //   applicationDomainId: cliMigratedApplicationDomain.epV2ApplicationDomain.id,
    //   schemaName: epV1EventSchema.name,
    //   schemaObjectSettings: {
    //     shared: true,
    //     contentType: epV1EventSchema.contentType.toLowerCase()
    //   },
    //   epSdkTask_TransactionConfig: this.get_IEpSdkTask_TransactionConfig(),
    // });
    // const epSdkSchemaTask_ExecuteReturn: IEpSdkSchemaTask_ExecuteReturn = await this.executeTask({epSdkTask: epSdkSchemaTask });
    // const schemaObject: SchemaObject = epSdkSchemaTask_ExecuteReturn.epObject;
    // /* istanbul ignore next */
    // if (schemaObject.id === undefined) throw new CliEPApiContentError(logName,"schemaObject.id === undefined", { schemaObject });
    // CliLogger.trace(CliLogger.createLogEntry(logName, {code: ECliStatusCodes.PRESENT_EP_V2_SCHEMA, details: { epSdkSchemaTask_ExecuteReturn }}));
    // CliRunSummary.presentEpV2Schema({ applicationDomainName: cliMigratedApplicationDomain.epV2ApplicationDomain.name, epSdkSchemaTask_ExecuteReturn });
    // // present the schema version
    // const epSdkSchemaVersionTask = new EpSdkSchemaVersionTask({
    //   epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
    //   applicationDomainId: cliMigratedApplicationDomain.epV2ApplicationDomain.id,
    //   schemaId: schemaObject.id,
    //   versionString: this.options.cliSchemasMigrateConfig.epV2.versions.initialVersion,
    //   versionStrategy: this.get_EEpSdk_VersionTaskStrategy(this.options.cliSchemasMigrateConfig.epV2.versions.versionStrategy),
    //   schemaVersionSettings: {
    //     description: epV1EventSchema.description,
    //     stateId: this.get_EpSdk_StateId(this.options.cliSchemasMigrateConfig.epV2.versions.state),
    //     content: epV1EventSchema.content,
    //   },
    //   epSdkTask_TransactionConfig: this.get_IEpSdkTask_TransactionConfig(),
    //   checkmode: false,
    // });
    // const epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn = await this.executeTask({ epSdkTask: epSdkSchemaVersionTask });
    // CliLogger.trace(CliLogger.createLogEntry(logName, {code: ECliStatusCodes.PRESENT_EP_V2_SCHEMA_VERSION, details: { epSdkSchemaVersionTask_ExecuteReturn }}));
    // CliRunSummary.presentEpV2SchemaVersion({ applicationDomainName: cliMigratedApplicationDomain.epV2ApplicationDomain.name, epSdkSchemaVersionTask_ExecuteReturn });
    // this.cliMigratedSchemas.push({
    //   epV1Schema: epV1EventSchema,
    //   epV2Schema: {
    //     schemaObject: schemaObject,
    //     schemaVersion: epSdkSchemaVersionTask_ExecuteReturn.epObject
    //   }
    // })
    CliRunContext.pop();
  }

  private async run_migrate(): Promise<ICliEventsMigratorRunMigrateReturn> {
    const funcName = 'run_migrate';
    const logName = `${CliEventsMigrator.name}.${funcName}()`;
    
    for(const cliMigratedApplicationDomain of this.options.cliMigratedApplicationDomains) {
      CliRunSummary.processingEpV1Events(cliMigratedApplicationDomain.epV1ApplicationDomain.name);
      /* istanbul ignore next */
      if(cliMigratedApplicationDomain.epV2ApplicationDomain.id === undefined) throw new CliEPApiContentError(logName, "cliMigratedApplicationDomain.epV2ApplicationDomain.id", { epV2ApplicationDomain: cliMigratedApplicationDomain.epV2ApplicationDomain });
      // get all the epv1 events in application domain and walk the list
      let nextPage: number | null = 1;
      while (nextPage !== null) {
        const epV1EventsResponse: EpV1EventsResponse = await EpV1EventsService.list5({ pageNumber: nextPage, pageSize: 100, applicationDomainId: cliMigratedApplicationDomain.epV1ApplicationDomain.id });
        if(epV1EventsResponse.data && epV1EventsResponse.data.length > 0) {
          for(const event of epV1EventsResponse.data) {
            const epV1Event: EpV1Event = event as EpV1Event;
            try {
              await this.migrateEvent({ cliMigratedApplicationDomain, epV1Event });   
            } catch(e: any) {
              if(e instanceof EpSdkError) {
                CliLogger.error(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.MIGRATE_EVENTS_ERROR, details: { error: e }}));
                // add to issues log  
                const rctxt: ICliEventRunContext | undefined = CliRunContext.pop() as ICliEventRunContext| undefined;
                const issue: ICliRunIssueEvent = {
                  type: ECliRunIssueTypes.EventIssue,
                  epV1Id: epV1Event.id,
                  epV1Event,
                  cliRunContext: rctxt,
                  cause: e
                };
                CliRunIssues.add(issue);
                CliRunSummary.processingEpV1EventIssue({ rctxt });        
              } else throw e;
            }
          }
        } else {
          CliRunSummary.processingEpV1EventsNoneFound();
        }
        if(epV1EventsResponse.meta) {
          const apiMeta = epV1EventsResponse.meta as EpV1ApiMeta;
          nextPage = apiMeta.pagination.nextPage;
        } else {
          nextPage = null;
        }
      }
      CliRunSummary.processingEpV1EventsDone(cliMigratedApplicationDomain.epV1ApplicationDomain.name);
    }
    return {
      cliMigratedEvents: this.cliMigratedEvents
    };
  } 

  public async run(): Promise<ICliEventsMigratorRunReturn> {
    const funcName = 'run';
    const logName = `${CliEventsMigrator.name}.${funcName}()`;
    CliLogger.debug(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.MIGRATE_EVENTS_START }));
    const cliEventsMigratorRunReturn: ICliEventsMigratorRunReturn = {
      cliEventsMigratorRunMigrateReturn: {
        cliMigratedEvents: [],
      },
      error: undefined
    };
    try {
      cliEventsMigratorRunReturn.cliEventsMigratorRunMigrateReturn = await this.run_migrate();
      CliLogger.debug(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.MIGRATE_EVENTS_DONE, details: { cliEventsMigratorRunMigrateReturn: cliEventsMigratorRunReturn.cliEventsMigratorRunMigrateReturn }}));
    } catch (e: any) {
      cliEventsMigratorRunReturn.error = CliErrorFactory.createCliError({logName: logName, error: e });
    } finally {
      if (cliEventsMigratorRunReturn.error !== undefined) {
        CliLogger.error(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.MIGRATE_EVENTS_ERROR, details: { error: cliEventsMigratorRunReturn.error }}));
      }
    }
    return cliEventsMigratorRunReturn;
  }
}
