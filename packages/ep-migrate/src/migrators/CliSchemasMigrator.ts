import {
  EEpSdkTask_TargetState,
  EpSdkSchemaTask,
  IEpSdkSchemaTask_ExecuteReturn,
  EpSdkSchemaVersionTask,
  IEpSdkSchemaVersionTask_ExecuteReturn,
  EpSdkError,
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
} from "../cli-components";
import { 
  CliMigrator, 
  ICliMigratorOptions, 
  ICliMigratorRunReturn 
} from "./CliMigrator";
import { 
  EpV1ApiMeta,
  EpV1EventSchema, 
  EpV1SchemasResponse, 
  EpV1SchemasService
} from "../epV1";
import { 
  ICliConfigEp2Versions, 
  ICliMigratedApplicationDomain, 
  ICliMigratedSchema
} from "./types";


export interface ICliSchemasMigrateConfig {
  epV2: {
    versions: ICliConfigEp2Versions;
  },
}
export interface ICliSchemasMigratorOptions extends ICliMigratorOptions {
  cliMigratedApplicationDomains: Array<ICliMigratedApplicationDomain>;
  cliSchemasMigrateConfig: ICliSchemasMigrateConfig;
}
interface ICliSchemasMigratorRunMigrateReturn {
  cliMigratedSchemas: Array<ICliMigratedSchema>;
}
export interface ICliSchemasMigratorRunReturn extends ICliMigratorRunReturn {
  cliSchemasMigratorRunMigrateReturn: ICliSchemasMigratorRunMigrateReturn;
}

export class CliSchemasMigrator extends CliMigrator {
  protected options: ICliSchemasMigratorOptions;
  private cliMigratedSchemas: Array<ICliMigratedSchema> = [];

  constructor(options: ICliSchemasMigratorOptions, runMode: ECliRunContext_RunMode) {
    super(options, runMode);
  }

  private async migrateSchema({ cliMigratedApplicationDomain, epV1EventSchema }:{
    cliMigratedApplicationDomain: ICliMigratedApplicationDomain;
    epV1EventSchema: EpV1EventSchema;
  }): Promise<void> {
    const funcName = 'migrateSchema';
    const logName = `${CliSchemasMigrator.name}.${funcName}()`;
    /* istanbul ignore next */
    if(cliMigratedApplicationDomain.epV2ApplicationDomain.id === undefined) throw new CliEPApiContentError(logName,"cliMigratedApplicationDomain.epV2ApplicationDomain.id === undefined", { epV2ApplicationDomain: cliMigratedApplicationDomain.epV2ApplicationDomain });

    const rctxt: ICliSchemaRunContext = {
      epV1: {
        applicationDomain: cliMigratedApplicationDomain.epV1ApplicationDomain,
        epV1EventSchema
      },
      epV2: {
        applicationDomain: cliMigratedApplicationDomain.epV2ApplicationDomain,
      }
    };
    CliRunContext.push(rctxt);
    CliRunSummary.processingEpV1Schema({ schemaName: epV1EventSchema.name });
    // present schema
    const epSdkSchemaTask = new EpSdkSchemaTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: cliMigratedApplicationDomain.epV2ApplicationDomain.id,
      schemaName: epV1EventSchema.name,
      schemaObjectSettings: {
        shared: true,
        contentType: epV1EventSchema.contentType.toLowerCase()
      },
      epSdkTask_TransactionConfig: this.get_IEpSdkTask_TransactionConfig(),
    });
    const epSdkSchemaTask_ExecuteReturn: IEpSdkSchemaTask_ExecuteReturn = await this.executeTask({epSdkTask: epSdkSchemaTask });
    const schemaObject: SchemaObject = epSdkSchemaTask_ExecuteReturn.epObject;
    /* istanbul ignore next */
    if (schemaObject.id === undefined) throw new CliEPApiContentError(logName,"schemaObject.id === undefined", { schemaObject });
    CliLogger.trace(CliLogger.createLogEntry(logName, {code: ECliStatusCodes.PRESENT_EP_V2_SCHEMA, details: { epSdkSchemaTask_ExecuteReturn }}));
    CliRunSummary.presentEpV2Schema({ applicationDomainName: cliMigratedApplicationDomain.epV2ApplicationDomain.name, epSdkSchemaTask_ExecuteReturn });
    // present the schema version
    const epSdkSchemaVersionTask = new EpSdkSchemaVersionTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: cliMigratedApplicationDomain.epV2ApplicationDomain.id,
      schemaId: schemaObject.id,
      versionString: this.options.cliSchemasMigrateConfig.epV2.versions.initialVersion,
      versionStrategy: this.get_EEpSdk_VersionTaskStrategy(this.options.cliSchemasMigrateConfig.epV2.versions.versionStrategy),
      schemaVersionSettings: {
        description: epV1EventSchema.description,
        stateId: this.get_EpSdk_StateId(this.options.cliSchemasMigrateConfig.epV2.versions.state),
        content: epV1EventSchema.content,
      },
      epSdkTask_TransactionConfig: this.get_IEpSdkTask_TransactionConfig(),
      checkmode: false,
    });
    const epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn = await this.executeTask({ epSdkTask: epSdkSchemaVersionTask });
    CliLogger.trace(CliLogger.createLogEntry(logName, {code: ECliStatusCodes.PRESENT_EP_V2_SCHEMA_VERSION, details: { epSdkSchemaVersionTask_ExecuteReturn }}));
    CliRunSummary.presentEpV2SchemaVersion({ applicationDomainName: cliMigratedApplicationDomain.epV2ApplicationDomain.name, epSdkSchemaVersionTask_ExecuteReturn });
    this.cliMigratedSchemas.push({
      epV1Schema: epV1EventSchema,
      epV2Schema: {
        schemaObject: schemaObject,
        schemaVersion: epSdkSchemaVersionTask_ExecuteReturn.epObject
      }
    })
    CliRunContext.pop();
  }

  private async run_migrate(): Promise<ICliSchemasMigratorRunMigrateReturn> {
    const funcName = 'run_migrate';
    const logName = `${CliSchemasMigrator.name}.${funcName}()`;
    
    for(const cliMigratedApplicationDomain of this.options.cliMigratedApplicationDomains) {
      CliRunSummary.processingEpV1Schemas(cliMigratedApplicationDomain.epV1ApplicationDomain.name);
      /* istanbul ignore next */
      if(cliMigratedApplicationDomain.epV2ApplicationDomain.id === undefined) throw new CliEPApiContentError(logName, "cliMigratedApplicationDomain.epV2ApplicationDomain.id", { epV2ApplicationDomain: cliMigratedApplicationDomain.epV2ApplicationDomain });
      // get all the epv1 schemas in application domain and walk the list
      let nextPage: number | null = 1;
      while (nextPage !== null) {
        const epV1SchemasResponse: EpV1SchemasResponse = await EpV1SchemasService.list2({ pageNumber: nextPage, pageSize: 100, applicationDomainId: cliMigratedApplicationDomain.epV1ApplicationDomain.id });
        if(epV1SchemasResponse.data && epV1SchemasResponse.data.length > 0) {
          for(const eventSchema of epV1SchemasResponse.data) {
            const epV1EventSchema: EpV1EventSchema = eventSchema as EpV1EventSchema;
            try {
              await this.migrateSchema({ cliMigratedApplicationDomain, epV1EventSchema });   
            } catch(e: any) {
              if(e instanceof EpSdkError) {
                CliLogger.error(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.MIGRATE_SCHEMAS_ERROR, details: { error: e }}));
                // add to issues log  
                const rctxt: ICliSchemaRunContext | undefined = CliRunContext.pop() as ICliSchemaRunContext| undefined;
                const issue: ICliRunIssueSchema = {
                  type: ECliRunIssueTypes.SchemaIssue,
                  epV1Id: epV1EventSchema.id,
                  epV1EventSchema,
                  cliRunContext: rctxt,
                  cause: e
                };
                CliRunIssues.add(issue);
                CliRunSummary.processingEpV1SchemaIssue({ rctxt });
              } else throw e;
            }
          }
        } else {
          CliRunSummary.processingEpV1SchemasNoneFound();
        }
        if(epV1SchemasResponse.meta) {
          const apiMeta = epV1SchemasResponse.meta as EpV1ApiMeta;
          nextPage = apiMeta.pagination.nextPage;
        } else {
          nextPage = null;
        }
      }
      CliRunSummary.processingEpV1SchemasDone(cliMigratedApplicationDomain.epV1ApplicationDomain.name);
    }
    return {
      cliMigratedSchemas: this.cliMigratedSchemas
    };
  } 

  public async run(): Promise<ICliSchemasMigratorRunReturn> {
    const funcName = 'run';
    const logName = `${CliSchemasMigrator.name}.${funcName}()`;
    CliLogger.debug(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.MIGRATE_SCHEMAS_START }));
    const cliSchemasMigratorRunReturn: ICliSchemasMigratorRunReturn = {
      cliSchemasMigratorRunMigrateReturn: {
        cliMigratedSchemas: [],
      },
      error: undefined
    };
    try {
      cliSchemasMigratorRunReturn.cliSchemasMigratorRunMigrateReturn = await this.run_migrate();
      CliLogger.debug(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.MIGRATE_SCHEMAS_DONE, details: { cliSchemasMigratorRunMigrateReturn: cliSchemasMigratorRunReturn.cliSchemasMigratorRunMigrateReturn }}));
    } catch (e: any) {
      cliSchemasMigratorRunReturn.error = CliErrorFactory.createCliError({logName: logName, error: e });
    } finally {
      if (cliSchemasMigratorRunReturn.error !== undefined) {
        CliLogger.error(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.MIGRATE_SCHEMAS_ERROR, details: { error: cliSchemasMigratorRunReturn.error }}));
      }
    }
    return cliSchemasMigratorRunReturn;
  }
}
