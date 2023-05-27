import {
  EEpSdkTask_TargetState,
  EpSdkSchemaTask,
  IEpSdkSchemaTask_ExecuteReturn,
  EpSdkSchemaVersionTask,
  IEpSdkSchemaVersionTask_ExecuteReturn,
  EpSdkSchemasService,
  EEpSdkTask_Action,
  EpSdkSchemaVersionsService,
  EEpSdkSchemaContentType,
  EEpSdkSchemaType,
} from "@solace-labs/ep-sdk";
import {
  SchemaObject, SchemaVersion,
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
  CliEPMigrateTagsError,
  CliMigrateManager,
  CliConfig,
  CliUtils,
  CliInternalCodeInconsistencyError,
} from "../cli-components";
import { 
  CliMigrator, 
  ICliMigratorOptions, 
  ICliMigratorRunReturn 
} from "./CliMigrator";
import { 
  EpV1ApiMeta,
  EpV1EventSchema, 
  EpV1IdsResponse, 
  EpV1SchemasResponse, 
  EpV1SchemasService,
  EpV1Tag,
  EpV1TagResponse,
  EpV1TagsService
} from "../epV1";
import { 
  ICliConfigEp2Versions, 
  ICliMigratedApplicationDomain, 
  ICliMigratedSchema
} from "./types";
import { EventSchema } from "@solace-labs/ep-v1-openapi-node";


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

  private async presentSchemaCustomAttributes({ epSdkSchemaTask_ExecuteReturn }:{
    epSdkSchemaTask_ExecuteReturn: IEpSdkSchemaTask_ExecuteReturn;
  }): Promise<SchemaObject> {
    const funcName = 'presentSchemaCustomAttributes';
    const logName = `${CliSchemasMigrator.name}.${funcName}()`;
    // runId
    if(epSdkSchemaTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action !== EEpSdkTask_Action.CREATE) return epSdkSchemaTask_ExecuteReturn.epObject;
    /* istanbul ignore next */
    if(epSdkSchemaTask_ExecuteReturn.epObject.id === undefined) throw new CliEPApiContentError(logName, "epSdkSchemaTask_ExecuteReturn.epObject.id === undefined", { schemaObject: epSdkSchemaTask_ExecuteReturn.epObject });    
    const newSchemaObject: SchemaObject = await EpSdkSchemasService.setCustomAttributes({
      schemaId: epSdkSchemaTask_ExecuteReturn.epObject.id,
      epSdkCustomAttributes: [
        { 
          name: CliMigrateManager.EpV2RunIdCustomAttributeDefinition.name,
          scope: CliMigrateManager.EpV2RunIdCustomAttributeDefinition.scope,
          valueType: CliMigrateManager.EpV2RunIdCustomAttributeDefinition.valueType,
          value: CliConfig.getRunId(),
        }
      ]
    });
    return newSchemaObject;
  }

  private async presentSchemaVersionCustomAttributes({ epSdkSchemaVersionTask_ExecuteReturn }:{
    epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn;
  }): Promise<SchemaVersion> {
    const funcName = 'presentSchemaVersionCustomAttributes';
    const logName = `${CliSchemasMigrator.name}.${funcName}()`;
    // runId
    if(
      epSdkSchemaVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action !== EEpSdkTask_Action.CREATE_FIRST_VERSION &&
      epSdkSchemaVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action !== EEpSdkTask_Action.CREATE_NEW_VERSION
    ) return epSdkSchemaVersionTask_ExecuteReturn.epObject;
    /* istanbul ignore next */
    if(epSdkSchemaVersionTask_ExecuteReturn.epObject.id === undefined) throw new CliEPApiContentError(logName, "epSdkSchemaVersionTask_ExecuteReturn.epObject.id === undefined", { schemaVersion: epSdkSchemaVersionTask_ExecuteReturn.epObject });    
    const newSchemaVersion: SchemaVersion = await EpSdkSchemaVersionsService.setCustomAttributes({
      schemaVersionId: epSdkSchemaVersionTask_ExecuteReturn.epObject.id,
      epSdkCustomAttributes: [
        { 
          name: CliMigrateManager.EpV2RunIdCustomAttributeDefinition.name,
          scope: CliMigrateManager.EpV2RunIdCustomAttributeDefinition.scope,
          valueType: CliMigrateManager.EpV2RunIdCustomAttributeDefinition.valueType,
          value: CliConfig.getRunId(),
        }
      ]
    });
    return newSchemaVersion;
  }

  private async getTags({ id }:{
    id: string;
  }): Promise<Array<EpV1Tag>> {
    const funcName = 'getTags';
    const logName = `${CliSchemasMigrator.name}.${funcName}()`;

    const epV1IdsResponse: EpV1IdsResponse = await EpV1SchemasService.list3({ id });
    if(epV1IdsResponse.data === undefined || epV1IdsResponse.data.length === 0) return [];
    const epV1Tags: Array<EpV1Tag> = [];
    for(const id of epV1IdsResponse.data) {
      const epV1TagResponse: EpV1TagResponse = await EpV1TagsService.get1({ id });
      /* istanbul ignore next */
      if(epV1TagResponse.data === undefined) throw new CliEPApiContentError(logName,"epV1TagResponse.data === undefined", { epV1TagResponse });
      epV1Tags.push(epV1TagResponse.data);
    }
    return epV1Tags;
  }

  protected async migrateTags({ epV1Tags, schemaObject }:{
    epV1Tags: Array<EpV1Tag>;
    schemaObject: SchemaObject;
  }): Promise<SchemaObject> {
    const funcName = 'migrateTags';
    const logName = `${CliSchemasMigrator.name}.${funcName}()`;
    if(epV1Tags.length === 0) return schemaObject;
    /* istanbul ignore next */
    if(schemaObject.id === undefined) throw new CliEPApiContentError(logName,"schemaObject.id === undefined", { schemaObject });
    try {
      const newSchemaObject: SchemaObject = await EpSdkSchemasService.setCustomAttributes({
        schemaId: schemaObject.id,
        epSdkCustomAttributes: [this.transformEpV1Tags2EpSdkCustomAttribute({ epV1Tags, applicationDomainId: schemaObject.applicationDomainId })]
      });
      return newSchemaObject;  
    } catch(e) {
      throw new CliEPMigrateTagsError(logName, e, {});
    }
  } 

  private transformEpV2SchemaType({ epV1ContentType }:{
    epV1ContentType: EventSchema.contentType;
  }): EEpSdkSchemaType {
    const funcName = 'transformEpV2SchemaType';
    const logName = `${CliSchemasMigrator.name}.${funcName}()`;
    switch(epV1ContentType) {
      case EventSchema.contentType.JSON:
        return EEpSdkSchemaType.JSON_SCHEMA;
      case EventSchema.contentType.AVRO:
        return EEpSdkSchemaType.AVRO;
      case EventSchema.contentType.XML:
        return EEpSdkSchemaType.XSD;
      case EventSchema.contentType.TEXT:
      case EventSchema.contentType.BINARY:
        return EEpSdkSchemaType.PROTOBUF;
        // throw new CliMigrateEpV1IncompatibilityError(logName, {
        //   message: "Unable to map epV1ContentType to EpV2 Schema Type for Schema. This Schema cannot be migrated.",
        //   epV1ContentType,
        // });
      default:
        /* istanbul ignore next */
        CliUtils.assertNever(logName, epV1ContentType);
    }
    throw new CliInternalCodeInconsistencyError(logName, "should never get here");
  }

  private transformEpV2ContentType({ epV1ContentType }:{
    epV1ContentType: EventSchema.contentType;
  }): EEpSdkSchemaContentType {
    const funcName = 'transformEpV2ContentType';
    const logName = `${CliSchemasMigrator.name}.${funcName}()`;
    switch(epV1ContentType) {
      case EventSchema.contentType.JSON:
      case EventSchema.contentType.AVRO:
        return EEpSdkSchemaContentType.APPLICATION_JSON;
      case EventSchema.contentType.XML:
        return EEpSdkSchemaContentType.APPLICATION_XML;
      case EventSchema.contentType.TEXT:
      case EventSchema.contentType.BINARY:
        return EEpSdkSchemaContentType.APPLICATION_PROTOBUF;
      // case EventSchema.contentType.TEXT:
      // case EventSchema.contentType.BINARY:
      //   throw new CliMigrateEpV1IncompatibilityError(logName, {
      //     message: "Unable to map epV1ContentType to EpV2 Schema Type for Schema. This Schema cannot be migrated.",
      //     epV1ContentType,
      //   });
      default:
        /* istanbul ignore next */
        CliUtils.assertNever(logName, epV1ContentType);
    }
    throw new CliInternalCodeInconsistencyError(logName, "should never get here");  
  }


  private async migrateSchema({ cliMigratedApplicationDomain, epV1EventSchema, epV1Tags }:{
    cliMigratedApplicationDomain: ICliMigratedApplicationDomain;
    epV1EventSchema: EpV1EventSchema;
    epV1Tags: Array<EpV1Tag>;
  }): Promise<void> {
    const funcName = 'migrateSchema';
    const logName = `${CliSchemasMigrator.name}.${funcName}()`;
    /* istanbul ignore next */
    if(cliMigratedApplicationDomain.epV2ApplicationDomain.id === undefined) throw new CliEPApiContentError(logName,"cliMigratedApplicationDomain.epV2ApplicationDomain.id === undefined", { epV2ApplicationDomain: cliMigratedApplicationDomain.epV2ApplicationDomain });

    const rctxt: ICliSchemaRunContext = {
      epV1: {
        applicationDomain: cliMigratedApplicationDomain.epV1ApplicationDomain,
        epV1EventSchema,
        epV1Tags,
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
        shared: epV1EventSchema.shared,
        schemaType: this.transformEpV2SchemaType({ epV1ContentType: epV1EventSchema.contentType}),
        contentType: this.transformEpV2ContentType({ epV1ContentType: epV1EventSchema.contentType}),
      },
      epSdkTask_TransactionConfig: this.get_IEpSdkTask_TransactionConfig(),
    });
    const epSdkSchemaTask_ExecuteReturn: IEpSdkSchemaTask_ExecuteReturn = await this.executeTask({epSdkTask: epSdkSchemaTask });
    let schemaObject: SchemaObject = epSdkSchemaTask_ExecuteReturn.epObject;
    rctxt.epV2.schemaObject = schemaObject;
    /* istanbul ignore next */
    if (schemaObject.id === undefined) throw new CliEPApiContentError(logName,"schemaObject.id === undefined", { schemaObject });
    // set custom attributes
    epSdkSchemaTask_ExecuteReturn.epObject = await this.presentSchemaCustomAttributes({ epSdkSchemaTask_ExecuteReturn });
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
    rctxt.epV2.schemaVersion = epSdkSchemaVersionTask_ExecuteReturn.epObject;
    // set custom attributes
    epSdkSchemaVersionTask_ExecuteReturn.epObject = await this.presentSchemaVersionCustomAttributes({ epSdkSchemaVersionTask_ExecuteReturn });
    // migrate tags
    schemaObject = await this.migrateTags({ epV1Tags, schemaObject });

    CliLogger.trace(CliLogger.createLogEntry(logName, {code: ECliStatusCodes.PRESENT_EP_V2_SCHEMA_VERSION, details: { epSdkSchemaVersionTask_ExecuteReturn }}));
    CliRunSummary.presentEpV2SchemaVersion({ applicationDomainName: cliMigratedApplicationDomain.epV2ApplicationDomain.name, epSdkSchemaVersionTask_ExecuteReturn });
    this.cliMigratedSchemas.push({
      epV1Schema: epV1EventSchema,
      epV2Schema: {
        schemaObject: schemaObject,
        schemaVersion: epSdkSchemaVersionTask_ExecuteReturn.epObject
      }
    });
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
              await this.migrateSchema({ 
                cliMigratedApplicationDomain, 
                epV1EventSchema,
                epV1Tags: await this.getTags({id: epV1EventSchema.id })
              });   
            } catch(e: any) {
              const error = CliErrorFactory.createCliError({ logName, error: e} );
              CliLogger.error(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.MIGRATE_SCHEMAS_ERROR, details: { error }}));
              // add to issues log  
              const rctxt: ICliSchemaRunContext | undefined = CliRunContext.pop() as ICliSchemaRunContext | undefined;
              const issue: ICliRunIssueSchema = {
                type: ECliRunIssueTypes.SchemaIssue,
                epV1Id: epV1EventSchema.id,
                epV1EventSchema,
                cliRunContext: rctxt,
                cause: error
              };
              CliRunIssues.add(issue);
              CliRunSummary.processingEpV1SchemaIssue({ rctxt });
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
