import {
  EEpSdkTask_Action,
  EEpSdkTask_TargetState,
  EpSdkApplication,
  EpSdkApplicationTask,
  EpSdkApplicationsService,
  EpSdkApplicationVersionTask,
  EpSdkApplicationVersionsService,
  EpSdkEnvironmentsService,
  IEpSdkApplicationTask_ExecuteReturn,
  IEpSdkApplicationVersionTask_ExecuteReturn,
  EpSdkMessagingService,
} from "@solace-labs/ep-sdk";
import {
  Application,
  ApplicationVersion,
  ApplicationsService,
  Environment,
  EventMesh,
  EventMeshesResponse,
  MessagingService,
} from "@solace-labs/ep-openapi-node";
import {
  EventMeshesService,
} from "@solace-labs/ep-rt-openapi-node";
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
  ICliRunIssueEvent,
  CliMigrateReferenceIssueError,
  CliMigrateManager,
  CliConfig,
  CliInternalCodeInconsistencyError,
  CliEPMigrateTagsError,
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
  EpV1IdsResponse,
  EpV1Tag,
  EpV1TagResponse,
  EpV1TagsService,
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
  eventMeshName: string;
  eventBrokerName: string;
}
export interface ICliApplicationsMigrateConfig {
  epV2: {
    environment?: ICliConfigApplicationsEnvironment;
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
  private messagingServiceIds: Array<string> = [];

  constructor(options: ICliApplicationsMigratorOptions, runMode: ECliRunContext_RunMode) {
    super(options, runMode);
  }

  private async getEnvironmentId({ environmentName }:{ environmentName: string }): Promise<string> {
    const funcName = 'getEnvironmentId';
    const logName = `${CliApplicationsMigrator.name}.${funcName}()`;
    const environment: Environment | undefined = await EpSdkEnvironmentsService.getByName({ environmentName });
    /* istanbul ignore next */
    if(environment === undefined) throw new CliInternalCodeInconsistencyError(logName, { message: 'unable to find environment', environmentName });
    /* istanbul ignore next */
    if(environment.id === undefined) throw new CliEPApiContentError(logName, "environment.id === undefined", { environment });
    return environment.id;
  }

  private async getEventMeshId({ environmentId, eventMeshName }:{
    environmentId: string;
    eventMeshName: string;
  }): Promise<string> {
    const funcName = 'getEventMeshId';
    const logName = `${CliApplicationsMigrator.name}.${funcName}()`;
    let eventMesh: EventMesh | undefined = undefined;
    // search list of event meshes for a match
    let nextPage: number | null = 1;
    while(eventMesh === undefined && nextPage !== null) {
      const eventMeshesResponse: EventMeshesResponse = await EventMeshesService.getEventMeshes({ pageNumber: nextPage, pageSize: 10, environmentId });
      if(eventMeshesResponse.data && eventMeshesResponse.data.length > 0) {
        eventMesh = eventMeshesResponse.data.find( x => x.name === eventMeshName);
      }
      nextPage = eventMeshesResponse.meta?.pagination?.nextPage ?? null;
    }
    /* istanbul ignore next */
    if(eventMesh === undefined) throw new CliInternalCodeInconsistencyError(logName, { message: 'unable to find event mesh', environmentId, eventMeshName });
    /* istanbul ignore next */
    if(eventMesh.id === undefined) throw new CliEPApiContentError(logName, "eventMesh.id === undefined", { eventMesh });
    return eventMesh.id;
  }

  private async getMessagingServiceId({ eventMeshId, eventBrokerName }:{
    eventMeshId: string;
    eventBrokerName: string;
  }): Promise<string> {
    const funcName = 'getMessagingServiceId';
    const logName = `${CliApplicationsMigrator.name}.${funcName}()`;
    const messagingServices: MessagingService[] = await EpSdkMessagingService.listAll({});
    const messagingService = messagingServices.find( x => x.name === eventBrokerName && x.eventMeshId === eventMeshId);
    /* istanbul ignore next */
    if(messagingService === undefined) throw new CliInternalCodeInconsistencyError(logName, { message: 'unable to find messaging service', eventMeshId, eventBrokerName });
    /* istanbul ignore next */
    if(messagingService.id === undefined) throw new CliEPApiContentError(logName, "messagingService.id === undefined", { messagingService });
    return messagingService.id;
  }

  private async lookupMessagingServiceIds(): Promise<void> {
    const environment = this.options.cliApplicationsMigrateConfig.epV2.environment;
    if(environment) {
      const { environmentName, eventMeshName, eventBrokerName } = environment;
      const environmentId = await this.getEnvironmentId({ environmentName });
      const eventMeshId = await this.getEventMeshId({ environmentId, eventMeshName });
      const messagingServiceId = await this.getMessagingServiceId({ eventMeshId, eventBrokerName });
      this.messagingServiceIds = [messagingServiceId];
    } else {
      this.messagingServiceIds = [];
    }
  }

  private async presentApplicationCustomAttributes({ epSdkApplicationTask_ExecuteReturn }:{
    epSdkApplicationTask_ExecuteReturn: IEpSdkApplicationTask_ExecuteReturn;
  }): Promise<Application> {
    const funcName = 'presentApplicationCustomAttributes';
    const logName = `${CliApplicationsMigrator.name}.${funcName}()`;
    // runId
    if(epSdkApplicationTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action !== EEpSdkTask_Action.CREATE) return epSdkApplicationTask_ExecuteReturn.epObject;
    /* istanbul ignore next */
    if(epSdkApplicationTask_ExecuteReturn.epObject.id === undefined) throw new CliEPApiContentError(logName, "epSdkApplicationTask_ExecuteReturn.epObject.id === undefined", { epSdkEvent: epSdkApplicationTask_ExecuteReturn.epObject });    
    const newEpSdkApplication: Application = await EpSdkApplicationsService.setCustomAttributes({
      applicationId: epSdkApplicationTask_ExecuteReturn.epObject.id,
      epSdkCustomAttributes: [
        { 
          name: CliMigrateManager.EpV2RunIdCustomAttributeDefinition.name,
          scope: CliMigrateManager.EpV2RunIdCustomAttributeDefinition.scope,
          valueType: CliMigrateManager.EpV2RunIdCustomAttributeDefinition.valueType,
          value: CliConfig.getRunId(),
        }
      ]
    });
    return newEpSdkApplication;
  }

  private async presentApplicationVersionCustomAttributes({ epSdkApplicationVersionTask_ExecuteReturn }:{
    epSdkApplicationVersionTask_ExecuteReturn: IEpSdkApplicationVersionTask_ExecuteReturn;
  }): Promise<ApplicationVersion> {
    const funcName = 'presentApplicationVersionCustomAttributes';
    const logName = `${CliApplicationsMigrator.name}.${funcName}()`;
    // runId
    if(
      epSdkApplicationVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action !== EEpSdkTask_Action.CREATE_FIRST_VERSION &&
      epSdkApplicationVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action !== EEpSdkTask_Action.CREATE_NEW_VERSION
    ) return epSdkApplicationVersionTask_ExecuteReturn.epObject;
    /* istanbul ignore next */
    if(epSdkApplicationVersionTask_ExecuteReturn.epObject.id === undefined) throw new CliEPApiContentError(logName, "epSdkApplicationVersionTask_ExecuteReturn.epObject.id === undefined", { applicationVersion: epSdkApplicationVersionTask_ExecuteReturn.epObject });    
    const newApplicationVersion: ApplicationVersion = await EpSdkApplicationVersionsService.setCustomAttributes({
      applicationVersionId: epSdkApplicationVersionTask_ExecuteReturn.epObject.id,
      epSdkCustomAttributes: [
        { 
          name: CliMigrateManager.EpV2RunIdCustomAttributeDefinition.name,
          scope: CliMigrateManager.EpV2RunIdCustomAttributeDefinition.scope,
          valueType: CliMigrateManager.EpV2RunIdCustomAttributeDefinition.valueType,
          value: CliConfig.getRunId(),
        }
      ]
    });
    return newApplicationVersion;
  }

  private async migrateTags({ epV1Application, epSdkApplicationTask_ExecuteReturn }:{
    epV1Application: EpV1Application;
    epSdkApplicationTask_ExecuteReturn: IEpSdkApplicationTask_ExecuteReturn;
  }): Promise<Application> {
    const funcName = 'migrateTags';
    const logName = `${CliApplicationsMigrator.name}.${funcName}()`;

    const epV1IdsResponse: EpV1IdsResponse = await EpV1ApplicationsService.list10({ id: epV1Application.id });
    if(epV1IdsResponse.data === undefined || epV1IdsResponse.data.length === 0) return epSdkApplicationTask_ExecuteReturn.epObject;
    const epV1Tags: Array<EpV1Tag> = [];
    for(const id of epV1IdsResponse.data) {
      const epV1TagResponse: EpV1TagResponse = await EpV1TagsService.get1({ id });
      /* istanbul ignore next */
      if(epV1TagResponse.data === undefined) throw new CliEPApiContentError(logName,"epV1TagResponse.data === undefined", { epV1TagResponse });
      epV1Tags.push(epV1TagResponse.data);
    }
    /* istanbul ignore next */
    if(epSdkApplicationTask_ExecuteReturn.epObject.id === undefined) throw new CliEPApiContentError(logName, "epSdkApplicationTask_ExecuteReturn.epObject.id === undefined", { epSdkEvent: epSdkApplicationTask_ExecuteReturn.epObject });   
    try {
      const newEpSdkApplication: Application = await EpSdkApplicationsService.setCustomAttributes({
        applicationId: epSdkApplicationTask_ExecuteReturn.epObject.id,
        epSdkCustomAttributes: [this.transformEpV1Tags2EpSdkCustomAttribute({ epV1Tags, applicationDomainId: epSdkApplicationTask_ExecuteReturn.epObject.applicationDomainId })],
      });
      return newEpSdkApplication;
    } catch(e) {
      throw new CliEPMigrateTagsError(logName, e, {});
    }
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

    // create a list of all referenced events (no duplicates)
    const consumedEventIds = epV1Application.consumedEventIds as unknown as string[];
    const producedEventIds = epV1Application.producedEventIds as unknown as string[];
    const eventIds = new Set<string>([...consumedEventIds, ...producedEventIds]);
    // check if referenced events have issues
    const eventIssues: Array<ICliRunIssueEvent> = [];
    for (const eventId of eventIds) {
      const issues = CliRunIssues.get({ type: ECliRunIssueTypes.EventIssue, epV1Id: eventId }) as Array<ICliRunIssueEvent>;
      eventIssues.push(...issues);
    }
    if(eventIssues.length > 0) throw new CliMigrateReferenceIssueError(logName, eventIssues); 
    // present application
    const epSdkEpApplicationTask = new EpSdkApplicationTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: cliMigratedApplicationDomain.epV2ApplicationDomain.id,
      applicationName: epV1Application.name,
      applicationObjectSettings: {},
      epSdkTask_TransactionConfig: this.get_IEpSdkTask_TransactionConfig(),
    });
    const epSdkApplicationTask_ExecuteReturn: IEpSdkApplicationTask_ExecuteReturn = await this.executeTask({ epSdkTask: epSdkEpApplicationTask });
    const epSdkApplication: EpSdkApplication = epSdkApplicationTask_ExecuteReturn.epObject as EpSdkApplication;
    rctxt.epV2.epSdkApplication = epSdkApplication;
    // set custom attributes for application
    epSdkApplicationTask_ExecuteReturn.epObject = await this.presentApplicationCustomAttributes({ epSdkApplicationTask_ExecuteReturn });
    // migrate tags
    epSdkApplicationTask_ExecuteReturn.epObject = await this.migrateTags({ epV1Application, epSdkApplicationTask_ExecuteReturn });
    // update summary
    CliLogger.trace(CliLogger.createLogEntry(logName, {code: ECliStatusCodes.PRESENT_EP_V2_APPLICATION, details: { epSdkApplicationTask_ExecuteReturn }}));
    CliRunSummary.presentEpV2Application({ applicationDomainName: cliMigratedApplicationDomain.epV2ApplicationDomain.name, epSdkApplicationTask_ExecuteReturn });
    // present application version
    const declaredConsumedEventVersionIds = consumedEventIds.map(eventId => {
      const cliMigratedEvent: ICliMigratedEvent | undefined = this.options.cliMigratedEvents.find( x => x.epV1Event.id === eventId);
      if(cliMigratedEvent === undefined) throw new CliInternalCodeInconsistencyError(logName, { message: 'unable to find referenced consumed event for application', epV1Application });
      /* istanbul ignore next */
      if(cliMigratedEvent.epV2Event.eventVersion.id === undefined) throw new CliEPApiContentError(logName,"cliMigratedEvent.epV2Event.eventVersion.id === undefined", { epV2Event: cliMigratedEvent.epV2Event });
      return cliMigratedEvent.epV2Event.eventVersion.id;
    });
    const declaredProducedEventVersionIds = producedEventIds.map(eventId => {
      const cliMigratedEvent: ICliMigratedEvent | undefined = this.options.cliMigratedEvents.find( x => x.epV1Event.id === eventId);
      if(cliMigratedEvent === undefined) throw new CliInternalCodeInconsistencyError(logName, { message: 'unable to find referenced produced event for application', epV1Application });
      /* istanbul ignore next */
      if(cliMigratedEvent.epV2Event.eventVersion.id === undefined) throw new CliEPApiContentError(logName,"cliMigratedEvent.epV2Event.eventVersion.id === undefined", { epV2Event: cliMigratedEvent.epV2Event });
      return cliMigratedEvent.epV2Event.eventVersion.id;
    });
    const epSdkApplicationVersionTask = new EpSdkApplicationVersionTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: cliMigratedApplicationDomain.epV2ApplicationDomain.id,
      applicationId: epSdkApplication.id,
      versionString: this.options.cliApplicationsMigrateConfig.epV2.versions.initialVersion,
      versionStrategy: this.get_EEpSdk_VersionTaskStrategy(this.options.cliApplicationsMigrateConfig.epV2.versions.versionStrategy),
      applicationVersionSettings: {
        description: epV1Application.description,
        displayName: '',
        stateId: this.get_EpSdk_StateId(this.options.cliApplicationsMigrateConfig.epV2.versions.state),
        declaredConsumedEventVersionIds,
        declaredProducedEventVersionIds,
      },
      epSdkTask_TransactionConfig: this.get_IEpSdkTask_TransactionConfig(),
    });
    const epSdkApplicationVersionTask_ExecuteReturn: IEpSdkApplicationVersionTask_ExecuteReturn = await this.executeTask({ epSdkTask: epSdkApplicationVersionTask });
    rctxt.epV2.applicationVersion = epSdkApplicationVersionTask_ExecuteReturn.epObject;
    // set custom attributes for application version
    epSdkApplicationVersionTask_ExecuteReturn.epObject = await this.presentApplicationVersionCustomAttributes({ epSdkApplicationVersionTask_ExecuteReturn });
    // associate application version with messaging service
    /* istanbul ignore next */
    if(epSdkApplicationVersionTask_ExecuteReturn.epObject.id === undefined) throw new CliEPApiContentError(logName, "epSdkApplicationVersionTask_ExecuteReturn.epObject.id === undefined", { applicationVersion: epSdkApplicationVersionTask_ExecuteReturn.epObject });
    await ApplicationsService.updateMsgSvcAssociationForAppVersion({
      versionId: epSdkApplicationVersionTask_ExecuteReturn.epObject.id,
      requestBody: {
        messagingServiceIds: this.messagingServiceIds,
      },
    });
    // update summary
    CliLogger.trace(CliLogger.createLogEntry(logName, {code: ECliStatusCodes.PRESENT_EP_V2_APPLICATION_VERSION, details: { epSdkApplicationVersionTask_ExecuteReturn }}));
    CliRunSummary.presentEpV2ApplicationVersion({ applicationDomainName: cliMigratedApplicationDomain.epV2ApplicationDomain.name, epSdkApplicationVersionTask_ExecuteReturn });
    // finalize
    this.cliMigratedApplications.push({
      epV1Application,
      epV2Application: {
        applicationObject: epSdkApplicationTask_ExecuteReturn.epObject,
        applicationVersion: epSdkApplicationVersionTask_ExecuteReturn.epObject
      }
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
      await this.lookupMessagingServiceIds();
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
