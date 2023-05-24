import { 
  EEpSdkTask_TargetState,
  EpSdkApplicationDomainTask,
  EpSdkApplicationDomainsService, 
  EpSdkApplicationVersionsService, 
  EpSdkApplicationsService, 
  EpSdkEnumVersionsService, 
  EpSdkEpEventVersionsService, 
  EpSdkEpEventsService, 
  EpSdkEventsResponse, 
  EpSdkSchemaVersionsService, 
  EpSdkTopicDomainsService, 
  IEpSdkApplicationDomainTask_ExecuteReturn,
} from "@solace-labs/ep-sdk";
import { 
  ApplicationDomain, 
  ApplicationDomainStats, 
  ApplicationDomainsResponse, 
  ApplicationDomainsService, 
  ApplicationVersion, 
  ApplicationsResponse, 
  ApplicationsService, 
  EnumsService, 
  EventVersion,
  EventsService,
  Pagination,
  SchemaObject,
  SchemaVersion,
  SchemasResponse,
  SchemasService,
  TopicAddressEnum,
  TopicAddressEnumVersion,
  TopicAddressEnumsResponse,
  TopicDomain,
  TopicDomainsResponse,
  TopicDomainsService
} from "@solace-labs/ep-openapi-node";
import { 
  CliEPApiContentError,
  CliInternalCodeInconsistencyError, 
  CliLogger, 
  CliMigrateManager, 
  CliRunContext, 
  CliRunIssues, 
  CliRunSummary, 
  ECliRunIssueTypes, 
  ECliStatusCodes, 
  ICliApplicationDomainRunAbsentContext, 
  ICliRunAbsentApplicationByRunIdContext, 
  ICliRunAbsentApplicationDomainByRunIdContext, 
  ICliRunAbsentApplicationDomainsByRunIdContext, 
  ICliRunAbsentApplicationsByRunIdContext, 
  ICliRunAbsentByRunIdContext,
  ICliRunAbsentEnumByRunIdContext,
  ICliRunAbsentEnumsByRunIdContext,
  ICliRunAbsentEventByRunIdContext,
  ICliRunAbsentEventsByRunIdContext,
  ICliRunAbsentSchemaByRunIdContext,
  ICliRunAbsentSchemasByRunIdContext,
  ICliRunIssueAbsentById
} from "../cli-components";


class CliAbsentService {

  private ApplicationDomainCache: Array<ApplicationDomain> = [];
  private TopicDomainCache: Array<TopicDomain> = [];

  private async populateTopicDomainCache(): Promise<void> {
    const topicDomainsResponse: TopicDomainsResponse = await EpSdkTopicDomainsService.listAll({});
    if(topicDomainsResponse.data !== undefined) {
      this.TopicDomainCache = topicDomainsResponse.data;
    } else {
      this.TopicDomainCache = [];
    }
  }

  private async absentTopicDomainForEnumVersionId(enumVersionId: string): Promise<void> {
    const funcName = "absentTopicDomainForEnumVersionId";
    const logName = `${CliAbsentService.name}.${funcName}()`;
    for(const topicDomain of this.TopicDomainCache) {
      /* istanbul ignore next */
      if(topicDomain.id === undefined) throw new CliEPApiContentError(logName, "topicDomain.id === undefined", { topicDomain });
      const found = topicDomain.addressLevels.find( x => x.enumVersionId === enumVersionId );
      if(found) {
        await TopicDomainsService.deleteTopicDomain({ id: topicDomain.id });
        await this.populateTopicDomainCache();
      }
    }
  }
              
  private async populateApplicationDomainCache(): Promise<void> {
    const applicationDomainsResponse: ApplicationDomainsResponse = await EpSdkApplicationDomainsService.listAll({});
    if(applicationDomainsResponse.data !== undefined) {
      this.ApplicationDomainCache = applicationDomainsResponse.data;
    } else {
      this.ApplicationDomainCache = [];
    }
  }

  private async getApplicationDomain(applicationDomainId: string): Promise<ApplicationDomain> {
    const funcName = "getApplicationDomain";
    const logName = `${CliAbsentService.name}.${funcName}()`;
    let found = this.ApplicationDomainCache.find( x => x.id === applicationDomainId );
    // could be that while tool is running new application domains with objects are being created
    // try to find the application domain again
    if(found === undefined) {
      await this.populateApplicationDomainCache();
    }
    found = this.ApplicationDomainCache.find( x => x.id === applicationDomainId );
    if(found === undefined) {
      throw new CliInternalCodeInconsistencyError(logName, {
        message: "could not find applicationDomainId in cache",
        applicationDomainId,
        // ApplicationDomainCache: CliAbsentService.ApplicationDomainCache
      });
    }
    return found;
  }

  private async listAllSchemaObjects(): Promise<Array<SchemaObject>> {
    const funcName = "listAllSchemaObjects";
    const logName = `${CliAbsentService.name}.${funcName}()`;
    const schemaList: Array<SchemaObject> = [];
    let nextPage: number | undefined | null = 1;
    while(nextPage !== undefined && nextPage !== null) {
      const schemasResponse: SchemasResponse = await SchemasService.getSchemas({ pageSize: 100, pageNumber: nextPage });
      if(schemasResponse.data === undefined || schemasResponse.data.length === 0) nextPage = undefined;
      else {
        schemaList.push(...schemasResponse.data);
        /* istanbul ignore next */
        if(schemasResponse.meta === undefined) throw new CliEPApiContentError(logName,'schemasResponse.meta === undefined', { schemasResponse });
        /* istanbul ignore next */
        if(schemasResponse.meta.pagination === undefined) throw new CliEPApiContentError(logName, 'schemasResponse.meta.pagination === undefined', { schemasResponse });
        const pagination: Pagination = schemasResponse.meta.pagination;
        nextPage = pagination.nextPage;  
      }
    }
    return schemaList;
  }

  private async listAllEnums(): Promise<Array<TopicAddressEnum>> {
    const funcName = "listAllEnums";
    const logName = `${CliAbsentService.name}.${funcName}()`;
    const enumList: Array<TopicAddressEnum> = [];
    let nextPage: number | undefined | null = 1;
    while(nextPage !== undefined && nextPage !== null) {
      const topicAddressEnumsResponse: TopicAddressEnumsResponse = await EnumsService.getEnums({ pageSize: 100, pageNumber: nextPage });
      if(topicAddressEnumsResponse.data === undefined || topicAddressEnumsResponse.data.length === 0) nextPage = undefined;
      else {
        enumList.push(...topicAddressEnumsResponse.data);
        /* istanbul ignore next */
        if(topicAddressEnumsResponse.meta === undefined) throw new CliEPApiContentError(logName,'topicAddressEnumsResponse.meta === undefined', { topicAddressEnumsResponse });
        /* istanbul ignore next */
        if(topicAddressEnumsResponse.meta.pagination === undefined) throw new CliEPApiContentError(logName, 'topicAddressEnumsResponse.meta.pagination === undefined', { topicAddressEnumsResponse });
        const pagination: Pagination = topicAddressEnumsResponse.meta.pagination;
        nextPage = pagination.nextPage;  
      }
    }
    return enumList;
  }

  private isApplicationDomainEmpty(stats: ApplicationDomainStats): boolean {
    let count = 0;
    for(const [key, value] of Object.entries(stats)) {
      key;
      count += value;
    }
    return count === 0;
  }

  private async absentApplicationDomains(runId: string): Promise<void> {
    const funcName = "absentApplicationDomains";
    const logName = `${CliAbsentService.name}.${funcName}()`;

    const rctxt: ICliRunAbsentApplicationDomainsByRunIdContext = {
      runId
    };
    CliRunContext.push(rctxt);  
    CliRunSummary.processingEpV2ApplicationsAbsentStart({ runId });

    // get a fresh list of all application domains
    const applicationDomainsResponse: ApplicationDomainsResponse = await EpSdkApplicationDomainsService.listAll({});
    if(applicationDomainsResponse.data === undefined || applicationDomainsResponse.data.length === 0) {
      CliRunSummary.processingEpV2ApplicationsAbsentNoneFound({ runId });
      CliRunContext.pop();
      return;
    }
    for(const applicationDomain of applicationDomainsResponse.data) {
      /* istanbul ignore next */
      if(applicationDomain.id === undefined) throw new CliEPApiContentError(logName, "applicationDomain.id === undefined", { applicationDomain });
      /* istanbul ignore next */
      if(applicationDomain.stats === undefined) throw new CliEPApiContentError(logName, "applicationDomain.stats === undefined", { applicationDomain });
      try {
        const rctxt: ICliRunAbsentApplicationDomainByRunIdContext = {
          runId,
          applicationDomainName: applicationDomain.name,
        };
        CliRunContext.push(rctxt);  
        CliRunSummary.processingEpV2ApplicationDomainAbsentStart({ runId, rctxt });
        // check for runId
        if(applicationDomain.customAttributes) {
          const found = applicationDomain.customAttributes.find( x => x.customAttributeDefinitionName === CliMigrateManager.EpV2RunIdCustomAttributeDefinition.name && x.value === runId );
          if(found) {
            if(this.isApplicationDomainEmpty(applicationDomain.stats)) {
              await ApplicationDomainsService.deleteApplicationDomain({ id: applicationDomain.id });
              CliRunSummary.absentEpV2ApplicationByRunId({ runId, rctxt, applicationDomain });
            }
          }
        }

        CliRunSummary.processingEpV2ApplicationDomainAbsentDone({ runId, rctxt });

      } catch(e: any) {
        CliLogger.error(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.ABSENT_BY_ID_APPLICATION_DOMAINS_ERROR, details: { error: e }}));
        // add to issues log  
        const rctxt: ICliRunAbsentApplicationDomainByRunIdContext | undefined = CliRunContext.pop() as ICliRunAbsentApplicationDomainByRunIdContext | undefined;
        const issue: ICliRunIssueAbsentById = {
          type: ECliRunIssueTypes.ApplicationDomainIssue,
          runId,
          cliRunContext: rctxt,
          cause: {
            message: e.message,
            error: e
          }
        };
        CliRunIssues.add(issue);
        CliRunSummary.processingEpV2ApplicationDomainAbsentIssue({ issue });    
      }
      CliRunContext.pop();  
    }
    CliRunSummary.processingEpV2ApplicationDomainsAbsentDone({ runId });
    CliRunContext.pop();
  }

  private async absentApplications(runId: string): Promise<void> {
    const funcName = "absentApplications";
    const logName = `${CliAbsentService.name}.${funcName}()`;

    const rctxt: ICliRunAbsentApplicationsByRunIdContext = {
      runId
    };
    CliRunContext.push(rctxt);  
    CliRunSummary.processingEpV2ApplicationsAbsentStart({ runId });

    // get all applications
    const applicationsResponse: ApplicationsResponse = await EpSdkApplicationsService.listAll({});
    if(applicationsResponse.data === undefined || applicationsResponse.data.length === 0) {
      CliRunSummary.processingEpV2ApplicationsAbsentNoneFound({ runId });
      CliRunContext.pop();
      return;
    }
    for(const application of applicationsResponse.data) {
      /* istanbul ignore next */
      if(application.id === undefined) throw new CliEPApiContentError(logName, "application.id === undefined", { application });
      try {
        const rctxt: ICliRunAbsentApplicationByRunIdContext = {
          runId,
          applicationName: application.name,
        };
        CliRunContext.push(rctxt);  
        const applicationDomain = await this.getApplicationDomain(application.applicationDomainId);
        rctxt.applicationDomainName = applicationDomain.name;
        CliRunContext.pop(); 
        CliRunContext.push(rctxt);
        CliRunSummary.processingEpV2ApplicationAbsentStart({ runId, rctxt });
        // get all versions
        const applicationVersions: Array<ApplicationVersion> = await EpSdkApplicationVersionsService.getVersionsForApplicationId({ applicationId: application.id });
        for(const applicationVersion of applicationVersions) {
          /* istanbul ignore next */
          if(applicationVersion.id === undefined) throw new CliEPApiContentError(logName, "applicationVersion.id === undefined", { applicationVersion });
          if(applicationVersion.customAttributes) {
            const found = applicationVersion.customAttributes.find( x => x.customAttributeDefinitionName === CliMigrateManager.EpV2RunIdCustomAttributeDefinition.name && x.value === runId );
            if(found) {
              await ApplicationsService.deleteApplicationVersion({ versionId: applicationVersion.id });
              CliRunSummary.absentEpV2ApplicationVersion({ runId, rctxt, applicationVersion });
            }
          }
        }
        // delete application as well if runId matches and no more versions
        if(application.customAttributes) {
          const found = application.customAttributes.find( x => x.customAttributeDefinitionName === CliMigrateManager.EpV2RunIdCustomAttributeDefinition.name && x.value === runId );
          if(found) {
            const applicationVersions: Array<ApplicationVersion> = await EpSdkApplicationVersionsService.getVersionsForApplicationId({ applicationId: application.id });
            if(applicationVersions.length === 0) {
              await ApplicationsService.deleteApplication({ id: application.id });
              CliRunSummary.absentEpV2Application({ runId, rctxt, application });
            }
          }
        }

        CliRunSummary.processingEpV2ApplicationAbsentDone({ runId, rctxt });

      } catch(e: any) {
        CliLogger.error(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.ABSENT_BY_ID_APPLICATIONS_ERROR, details: { error: e }}));
        // add to issues log  
        const rctxt: ICliRunAbsentApplicationByRunIdContext | undefined = CliRunContext.pop() as ICliRunAbsentApplicationByRunIdContext | undefined;
        const issue: ICliRunIssueAbsentById = {
          type: ECliRunIssueTypes.ApplicationIssue,
          runId,
          cliRunContext: rctxt,
          cause: {
            message: e.message,
            error: e
          }
        };
        CliRunIssues.add(issue);
        CliRunSummary.processingEpV2ApplicationAbsentIssue({ issue });    
      }
      CliRunContext.pop();  
    }
    CliRunSummary.processingEpV2ApplicationsAbsentDone({ runId });
    CliRunContext.pop();
  }

  private async absentEvents(runId: string): Promise<void> {
    const funcName = "absentEvents";
    const logName = `${CliAbsentService.name}.${funcName}()`;

    const rctxt: ICliRunAbsentEventsByRunIdContext = {
      runId
    };
    CliRunContext.push(rctxt);  
    CliRunSummary.processingEpV2EventsAbsentStart({ runId });

    // get all events
    const epSdkEventsResponse: EpSdkEventsResponse = await EpSdkEpEventsService.listAll({});
    if(epSdkEventsResponse.data === undefined || epSdkEventsResponse.data.length === 0) {
      CliRunSummary.processingEpV2EventsAbsentNoneFound({ runId });
      CliRunContext.pop();
      return;
    }
    for(const event of epSdkEventsResponse.data) {
      /* istanbul ignore next */
      if(event.id === undefined) throw new CliEPApiContentError(logName, "event.id === undefined", { event });
      try {
        const rctxt: ICliRunAbsentEventByRunIdContext = {
          runId,
          eventName: event.name,
        };
        CliRunContext.push(rctxt);  
        const applicationDomain = await this.getApplicationDomain(event.applicationDomainId);
        rctxt.applicationDomainName = applicationDomain.name;
        CliRunContext.pop(); 
        CliRunContext.push(rctxt);
        CliRunSummary.processingEpV2EventAbsentStart({ runId, rctxt });
        // get all versions
        const eventVersions: Array<EventVersion> = await EpSdkEpEventVersionsService.getVersionsForEventId({ eventId: event.id });
        for(const eventVersion of eventVersions) {
          /* istanbul ignore next */
          if(eventVersion.id === undefined) throw new CliEPApiContentError(logName, "eventVersion.id === undefined", { eventVersion });
          if(eventVersion.customAttributes) {
            const found = eventVersion.customAttributes.find( x => x.customAttributeDefinitionName === CliMigrateManager.EpV2RunIdCustomAttributeDefinition.name && x.value === runId );
            if(found) {
              await EventsService.deleteEventVersion({ id: eventVersion.id });
              CliRunSummary.absentEpV2EventVersion({ runId, rctxt, eventVersion });
            }
          }
        }
        // delete event as well if runId matches and no more versions
        if(event.customAttributes) {
          const found = event.customAttributes.find( x => x.customAttributeDefinitionName === CliMigrateManager.EpV2RunIdCustomAttributeDefinition.name && x.value === runId );
          if(found) {
            const eventVersions: Array<EventVersion> = await EpSdkEpEventVersionsService.getVersionsForEventId({ eventId: event.id });
            if(eventVersions.length === 0) {
              await EventsService.deleteEvent({ id: event.id });
              CliRunSummary.absentEpV2Event({ runId, rctxt, event });
            }
          }
        }

        CliRunSummary.processingEpV2EventAbsentDone({ runId, rctxt });

      } catch(e: any) {
        CliLogger.error(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.ABSENT_BY_ID_EVENTS_ERROR, details: { error: e }}));
        // add to issues log  
        const rctxt: ICliRunAbsentEventByRunIdContext | undefined = CliRunContext.pop() as ICliRunAbsentEventByRunIdContext | undefined;
        const issue: ICliRunIssueAbsentById = {
          type: ECliRunIssueTypes.EventIssue,
          runId,
          cliRunContext: rctxt,
          cause: {
            message: e.message,
            error: e
          }
        };
        CliRunIssues.add(issue);
        CliRunSummary.processingEpV2EventAbsentIssue({ issue });    
      }
      CliRunContext.pop();  
    }
    CliRunSummary.processingEpV2EventsAbsentDone({ runId });
    CliRunContext.pop();
  }

  private async absentSchemas(runId: string): Promise<void> {
    const funcName = "absentSchemas";
    const logName = `${CliAbsentService.name}.${funcName}()`;

    const rctxt: ICliRunAbsentSchemasByRunIdContext = {
      runId
    };
    CliRunContext.push(rctxt);  
    CliRunSummary.processingEpV2SchemasAbsentStart({ runId });

    // get all schemas
    const schemaObjects: Array<SchemaObject> = await this.listAllSchemaObjects();
    if(schemaObjects.length === 0) {
      CliRunSummary.processingEpV2SchemasAbsentNoneFound({ runId });
      CliRunContext.pop();
      return;
    }
    for(const schemaObject of schemaObjects) {
      /* istanbul ignore next */
      if(schemaObject.id === undefined) throw new CliEPApiContentError(logName, "schemaObject.id === undefined", { schemaObject });
      try {
        const rctxt: ICliRunAbsentSchemaByRunIdContext = {
          runId,
          schemaName: schemaObject.name,
        };
        CliRunContext.push(rctxt);  
        const applicationDomain = await this.getApplicationDomain(schemaObject.applicationDomainId);
        rctxt.applicationDomainName = applicationDomain.name;
        CliRunContext.pop(); 
        CliRunContext.push(rctxt);
        CliRunSummary.processingEpV2SchemaAbsentStart({ runId, rctxt });  
        // get all versions
        const schemaVersions: Array<SchemaVersion> = await EpSdkSchemaVersionsService.getVersionsForSchemaId({ schemaId: schemaObject.id });
        for(const schemaVersion of schemaVersions) {
          /* istanbul ignore next */
          if(schemaVersion.id === undefined) throw new CliEPApiContentError(logName, "schemaVersion.id === undefined", { schemaVersion });
          if(schemaVersion.customAttributes) {
            const found = schemaVersion.customAttributes.find( x => x.customAttributeDefinitionName === CliMigrateManager.EpV2RunIdCustomAttributeDefinition.name && x.value === runId );
            if(found) {
              await SchemasService.deleteSchemaVersion({ id: schemaVersion.id });
              CliRunSummary.absentEpV2SchemaVersion({ runId, rctxt, schemaVersion });
            }
          }
        }
        // delete schema as well if runId matches and no more versions
        if(schemaObject.customAttributes) {
          const found = schemaObject.customAttributes.find( x => x.customAttributeDefinitionName === CliMigrateManager.EpV2RunIdCustomAttributeDefinition.name && x.value === runId );
          if(found) {
            const schemaVersions: Array<SchemaVersion> = await EpSdkSchemaVersionsService.getVersionsForSchemaId({ schemaId: schemaObject.id });
            if(schemaVersions.length === 0) {
              await SchemasService.deleteSchema({ id: schemaObject.id });
              CliRunSummary.absentEpV2Schema({ runId, rctxt, schemaObject });
            }
          }
        }

        CliRunSummary.processingEpV2SchemaAbsentDone({ runId, rctxt });

      } catch(e: any) {
        CliLogger.error(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.ABSENT_BY_ID_SCHEMAS_ERROR, details: { error: e }}));
        // add to issues log  
        const rctxt: ICliRunAbsentSchemaByRunIdContext | undefined = CliRunContext.pop() as ICliRunAbsentSchemaByRunIdContext | undefined;
        const issue: ICliRunIssueAbsentById = {
          type: ECliRunIssueTypes.SchemaIssue,
          runId,
          cliRunContext: rctxt,
          cause: {
            message: e.message,
            error: e
          }
        };
        CliRunIssues.add(issue);
        CliRunSummary.processingEpV2SchemaAbsentIssue({ issue });    
      }
      CliRunContext.pop();  
    }
    CliRunSummary.processingEpV2SchemasAbsentDone({ runId });
    CliRunContext.pop();
  }

  private async absentEnums(runId: string): Promise<void> {
    const funcName = "absentEnums";
    const logName = `${CliAbsentService.name}.${funcName}()`;

    const rctxt: ICliRunAbsentEnumsByRunIdContext = {
      runId
    };
    CliRunContext.push(rctxt);  
    CliRunSummary.processingEpV2EnumsAbsentStart({ runId });

    // get all enums
    const topicAddressEnums: Array<TopicAddressEnum> = await this.listAllEnums();
    if(topicAddressEnums.length === 0) {
      CliRunSummary.processingEpV2EnumsAbsentNoneFound({ runId });
      CliRunContext.pop();
      return;
    }
    for(const topicAddressEnum of topicAddressEnums) {
      /* istanbul ignore next */
      if(topicAddressEnum.id === undefined) throw new CliEPApiContentError(logName, "topicAddressEnum.id === undefined", { topicAddressEnum });
      try {
        const rctxt: ICliRunAbsentEnumByRunIdContext = {
          runId,
          enumName: topicAddressEnum.name,
        };
        CliRunContext.push(rctxt);  
        const applicationDomain = await this.getApplicationDomain(topicAddressEnum.applicationDomainId);
        rctxt.applicationDomainName = applicationDomain.name;
        CliRunContext.pop(); 
        CliRunContext.push(rctxt);
        CliRunSummary.processingEpV2EnumAbsentStart({ runId, rctxt }); 
        // get all versions
        const topicAddressEnumVersions: Array<TopicAddressEnumVersion> = await EpSdkEnumVersionsService.getVersionsForEnumId({ enumId: topicAddressEnum.id });
        for(const topicAddressEnumVersion of topicAddressEnumVersions) {
          /* istanbul ignore next */
          if(topicAddressEnumVersion.id === undefined) throw new CliEPApiContentError(logName, "topicAddressEnumVersion.id === undefined", { topicAddressEnumVersion });
          if(topicAddressEnumVersion.customAttributes) {
            const found = topicAddressEnumVersion.customAttributes.find( x => x.customAttributeDefinitionName === CliMigrateManager.EpV2RunIdCustomAttributeDefinition.name && x.value === runId );
            if(found) {
              // delete any topic domains that reference the enum version
              await this.absentTopicDomainForEnumVersionId(topicAddressEnumVersion.id);
              // delete enum  version
              await EnumsService.deleteEnumVersion({ id: topicAddressEnumVersion.id });
              CliRunSummary.absentEpV2EnumVersion({ runId, rctxt, topicAddressEnumVersion });
            }
          }
        }
        // delete enum as well if runId matches and no more versions
        if(topicAddressEnum.customAttributes) {
          const found = topicAddressEnum.customAttributes.find( x => x.customAttributeDefinitionName === CliMigrateManager.EpV2RunIdCustomAttributeDefinition.name && x.value === runId );
          if(found) {
            const topicAddressEnumVersions: Array<TopicAddressEnumVersion> = await EpSdkEnumVersionsService.getVersionsForEnumId({ enumId: topicAddressEnum.id });
            if(topicAddressEnumVersions.length === 0) {
              await EnumsService.deleteEnum({ id: topicAddressEnum.id });
              CliRunSummary.absentEpV2Enum({ runId, rctxt, topicAddressEnum });
            }
          }
        }

        CliRunSummary.processingEpV2EnumAbsentDone({ runId, rctxt });

      } catch(e: any) {
        CliLogger.error(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.ABSENT_BY_ID_EVENTS_ERROR, details: { error: e }}));
        // add to issues log  
        const rctxt: ICliRunAbsentEnumByRunIdContext | undefined = CliRunContext.pop() as ICliRunAbsentEnumByRunIdContext | undefined;
        const issue: ICliRunIssueAbsentById = {
          type: ECliRunIssueTypes.EnumIssue,
          runId,
          cliRunContext: rctxt,
          cause: {
            message: e.message,
            error: e
          }
        };
        CliRunIssues.add(issue);
        CliRunSummary.processingEpV2EnumAbsentIssue({ issue });    
      }
      CliRunContext.pop();  
    }
    CliRunSummary.processingEpV2EnumsAbsentDone({ runId });
    CliRunContext.pop();
  }

  public async absent_EpV2_ByRunId(runId: string): Promise<void> {
    // const funcName = "absent_EpV2_ByRunId";
    // const logName = `${CliAbsentService.name}.${funcName}()`;

    const rctxt: ICliRunAbsentByRunIdContext = {
      runId
    };
    CliRunContext.push(rctxt);  

    await this.populateApplicationDomainCache();
    await this.populateTopicDomainCache();

    await this.absentApplications(runId);
    await this.absentEvents(runId);
    await this.absentSchemas(runId);
    await this.absentEnums(runId);
    await this.absentApplicationDomains(runId);

    CliRunContext.pop();
  }

  private async absentApplicationDomain(applicationDomainName: string): Promise<boolean> {
    try {
      const epSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        applicationDomainName,
      });
      const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await epSdkApplicationDomainTask.execute();
      // console.log(`${logName}: deleted applicationDomainName = ${applicationDomainName}`);
      CliRunSummary.absentEpV2ApplicationDomain({ epSdkApplicationDomainTask_ExecuteReturn})
      return true;
    } catch(e) {
      return false;
    }
  }

  public async absent_EpV2_PrefixedApplicationDomains(prefix: string): Promise<void> {
    const funcName = "absent_EpV2_PrefixedApplicationDomains";
    const logName = `${CliAbsentService.name}.${funcName}()`;
    /* istanbul ignore next */
    if(prefix === undefined || prefix.length < 2) {
      throw new CliInternalCodeInconsistencyError(logName, { message: "invalid prefix",
        prefix: prefix ? prefix : 'undefined' 
      });
    }
    const rctxt: ICliApplicationDomainRunAbsentContext = {
      epV2ApplicationDomainPrefix: prefix
    };
    CliRunContext.push(rctxt);

    const applicationDomainsResponse: ApplicationDomainsResponse = await EpSdkApplicationDomainsService.listAll({});
    const absentApplicationDomains: Array<ApplicationDomain> = [];
    if(applicationDomainsResponse.data) {
      for(const applicationDomain of applicationDomainsResponse.data) {
        if(applicationDomain.name.startsWith(prefix)) {
          absentApplicationDomains.push(applicationDomain);
        }
      }
    }
    CliRunSummary.processingEpV2ApplicationDomainsAbsent({ absentApplicationDomainNames: absentApplicationDomains.map(x => x.name) });

    const applicationDomainNames: Array<string> = absentApplicationDomains.map( x => x.name );
    if(applicationDomainNames.length === 0) {
      CliRunSummary.processingEpV2ApplicationDomainsByPrefixAbsentNoneFound();
    }
    let pass = 0;
    while(applicationDomainNames.length > 0 && pass < 10) {
      // console.log(`${logName}: pass=${pass}, applicationDomainNames=${JSON.stringify(applicationDomainNames)}`);
      for(let i=0; i < applicationDomainNames.length; i++) {
        const success = await this.absentApplicationDomain(applicationDomainNames[i]);
        if(success) {
          applicationDomainNames.splice(i, 1);
          i--;
        }
      }
      pass++;
    }
    CliRunSummary.processedEpV2ApplicationDomainsAbsent();
    CliRunContext.pop();
  }

}

export default new CliAbsentService();
