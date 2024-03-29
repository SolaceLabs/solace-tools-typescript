import { 
  EventVersion 
} from "@solace-labs/ep-openapi-node";
import { 
  EEpSdkTask_Action,
  EEpSdkTask_TargetState, 
  EpSdkBrokerTypes, 
  EpSdkEpEventTask, 
  EpSdkEpEventVersionTask, 
  EpSdkEpEventVersionsService, 
  EpSdkEpEventsService, 
  EpSdkEvent, 
  IEpSdkEpEventTask_ExecuteReturn, 
  IEpSdkEpEventVersionTask_EnumInfo, 
  IEpSdkEpEventVersionTask_ExecuteReturn 
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
  ICliEventRunContext,
  ICliRunIssueEvent,
  ICliRunIssueSchema,
  CliMigrateReferenceIssueError,
  CliInternalCodeInconsistencyError,
  CliEPMigrateTagsError,
  CliMigrateEventReferenceEnumIssueError,
  CliMigrateManager,
  CliConfig,
  CliMigrateEpV1IncompatibilityError,
  ICliRunIssueEnum,
} from "../cli-components";
import { 
  CliMigrator, 
  ICliMigratorOptions, 
  ICliMigratorRunReturn 
} from "./CliMigrator";
import { 
  EpV1ApiMeta,
  EpV1Event,
  EpV1EventsResponse, 
  EpV1EventsService,
  EpV1IdsResponse,
  EpV1Tag,
  EpV1TagResponse,
  EpV1TagsService,
  EpV1TopicNodeDTO, 
} from "../epV1";
import { 
  ICliConfigEp2Versions, 
  ICliMigratedApplicationDomain, 
  ICliMigratedEnum, 
  ICliMigratedEvent, 
  ICliMigratedSchema,
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
  private epSdkEnumInfoMap: Map<string, IEpSdkEpEventVersionTask_EnumInfo> = new Map<string, IEpSdkEpEventVersionTask_EnumInfo>();
  private cliMigratedEvents: Array<ICliMigratedEvent> = [];
  private epV2TopicDelimiter = '/';


  constructor(options: ICliEventsMigratorOptions, runMode: ECliRunContext_RunMode) {
    super(options, runMode);
  }

  private async presentEventCustomAttributes({ epSdkEpEventTask_ExecuteReturn }:{
    epSdkEpEventTask_ExecuteReturn: IEpSdkEpEventTask_ExecuteReturn;
  }): Promise<EpSdkEvent> {
    const funcName = 'presentEventCustomAttributes';
    const logName = `${CliEventsMigrator.name}.${funcName}()`;
    // runId
    if(epSdkEpEventTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action !== EEpSdkTask_Action.CREATE) return epSdkEpEventTask_ExecuteReturn.epObject;
    /* istanbul ignore next */
    if(epSdkEpEventTask_ExecuteReturn.epObject.id === undefined) throw new CliEPApiContentError(logName, "epSdkEpEventTask_ExecuteReturn.epObject.id === undefined", { epSdkEvent: epSdkEpEventTask_ExecuteReturn.epObject });    
    const newEpSdkEvent: EpSdkEvent = await EpSdkEpEventsService.setCustomAttributes({
      eventId: epSdkEpEventTask_ExecuteReturn.epObject.id,
      epSdkCustomAttributes: [
        { 
          name: CliMigrateManager.EpV2RunIdCustomAttributeDefinition.name,
          scope: CliMigrateManager.EpV2RunIdCustomAttributeDefinition.scope,
          valueType: CliMigrateManager.EpV2RunIdCustomAttributeDefinition.valueType,
          value: CliConfig.getRunId(),
        }
      ]
    });
    return newEpSdkEvent;
  }

  private async presentEventVersionCustomAttributes({ epSdkEpEventVersionTask_ExecuteReturn }:{
    epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn;
  }): Promise<EventVersion> {
    const funcName = 'presentEventVersionCustomAttributes';
    const logName = `${CliEventsMigrator.name}.${funcName}()`;
    // runId
    if(
      epSdkEpEventVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action !== EEpSdkTask_Action.CREATE_FIRST_VERSION &&
      epSdkEpEventVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action !== EEpSdkTask_Action.CREATE_NEW_VERSION
    ) return epSdkEpEventVersionTask_ExecuteReturn.epObject;
    /* istanbul ignore next */
    if(epSdkEpEventVersionTask_ExecuteReturn.epObject.id === undefined) throw new CliEPApiContentError(logName, "epSdkEpEventVersionTask_ExecuteReturn.epObject.id === undefined", { eventVersion: epSdkEpEventVersionTask_ExecuteReturn.epObject });    
    const newEventVersion: EventVersion = await EpSdkEpEventVersionsService.setCustomAttributes({
      eventVersionId: epSdkEpEventVersionTask_ExecuteReturn.epObject.id,
      epSdkCustomAttributes: [
        { 
          name: CliMigrateManager.EpV2RunIdCustomAttributeDefinition.name,
          scope: CliMigrateManager.EpV2RunIdCustomAttributeDefinition.scope,
          valueType: CliMigrateManager.EpV2RunIdCustomAttributeDefinition.valueType,
          value: CliConfig.getRunId(),
        }
      ]
    });
    return newEventVersion;
  }

  private async getTags({ id }:{
    id: string;
  }): Promise<Array<EpV1Tag>> {
    const funcName = 'getTags';
    const logName = `${CliEventsMigrator.name}.${funcName}()`;

    const epV1IdsResponse: EpV1IdsResponse = await EpV1EventsService.list6({ id });
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

  protected async migrateTags({ epV1Tags, epSdkEvent }:{
    epV1Tags: Array<EpV1Tag>;
    epSdkEvent: EpSdkEvent;
  }): Promise<EpSdkEvent> {
    const funcName = 'migrateTags';
    const logName = `${CliEventsMigrator.name}.${funcName}()`;
    if(epV1Tags.length === 0) return epSdkEvent;
    /* istanbul ignore next */
    if(epSdkEvent.id === undefined) throw new CliEPApiContentError(logName,"epSdkEvent.id === undefined", { epSdkEvent });
    try {
      const newEpSdkEvent: EpSdkEvent = await EpSdkEpEventsService.setCustomAttributes({
        eventId: epSdkEvent.id,
        epSdkCustomAttributes: [this.transformEpV1Tags2EpSdkCustomAttribute({ epV1Tags, applicationDomainId: epSdkEvent.applicationDomainId })]
      });
      return newEpSdkEvent;  
    } catch(e) {
      throw new CliEPMigrateTagsError(logName, e, {});
    }
  } 

  private transformTopicElement(topicElement: string): string {
    return topicElement.replaceAll(/[^A-Za-z_0-9{}]/g, '_');
  }

  private transformTopicString({ epV1TopicName, epV1TopicNodeDTOs }:{
    epV1TopicNodeDTOs?: Array<EpV1TopicNodeDTO>;
    epV1TopicName: string;
  }): string {
    if(epV1TopicNodeDTOs && epV1TopicNodeDTOs.length > 0) {
      let epV2TopicString = "";
      for(const epV1TopicNodeDTO of epV1TopicNodeDTOs) {
        if(epV1TopicNodeDTO.name) {
          if(epV2TopicString !== "") epV2TopicString += this.epV2TopicDelimiter;
          if(epV1TopicNodeDTO.topicNodeType === "variable") {
            epV2TopicString += `{${this.transformTopicElement(epV1TopicNodeDTO.name)}}`;  
          } else epV2TopicString += this.transformTopicElement(epV1TopicNodeDTO.name);
        }
      }
      return epV2TopicString;
    }
    return this.transformTopicElement(epV1TopicName);
  }

  private async migrateEvent({ cliMigratedApplicationDomain, epV1Event, epV1Tags }:{
    cliMigratedApplicationDomain: ICliMigratedApplicationDomain;
    epV1Event: EpV1Event;
    epV1Tags: Array<EpV1Tag>;
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
    // don't migrate events without a topic
    if(!epV1Event.topicAddress) throw new CliMigrateEpV1IncompatibilityError(logName, {
      message: "cannot migrate EpV1 Event without a topic",
    });
    // // DEBUG
    // if(!epV1Event.schemaId || !epV1Event.schemaVersionId) {
    //   console.log(`>>>>> ${logName}: !epV1Event.schemaId || !epV1Event.schemaVersionId, ${JSON.stringify({
    //     schemaId: JSON.stringify(epV1Event.schemaId),
    //     schemaVersionId: JSON.stringify(epV1Event.schemaVersionId)
    //   }, null, 2)}`);
    // }
    // check if referenced schema has issues
    const schemaIssues: Array<ICliRunIssueSchema> = CliRunIssues.get({ type: ECliRunIssueTypes.SchemaIssue, epV1Id: epV1Event.schemaId }) as Array<ICliRunIssueSchema>;
    if(schemaIssues.length > 0) throw new CliMigrateReferenceIssueError(logName, schemaIssues);
    // get the referenced schema info
    const cliMigratedSchema: ICliMigratedSchema | undefined = this.options.cliMigratedSchemas.find( x => x.epV1Schema.id === epV1Event.schemaId);
    if(cliMigratedSchema === undefined && epV1Event.schemaId) throw new CliInternalCodeInconsistencyError(logName, { message: 'unable to find referenced schema for event', epV1Event });
    // // DEBUG
    // const _epV1TopicName = epV1Event.topicName;
    // const _epV1TopicAddress: EpV1TopicAddress = epV1Event.topicAddress;
    // const _epV1TopicNodeDTOs: Array<EpV1TopicNodeDTO> | undefined = _epV1TopicAddress.topicAddressLevels;
    // const _filteredDTOs = _epV1TopicNodeDTOs?.filter( (x) => {
    //   if(x.name === undefined) return false;
    //   if(x.enumId === undefined) return false;
    //   return true;
    //   // return x.name.includes('-');
    // });
    // if(_filteredDTOs !== undefined && _filteredDTOs.length > 0) {
    //   const log = {
    //     _epV1TopicName,
    //     // epV1TopicAddress,
    //     // epV1TopicNodeDTOs,
    //     _filteredDTOs
    //   }
    //   console.log(`\n>>>>${logName}: filteredDTOs, with enumIds = ${JSON.stringify(log, null, 2)}\n`);
    // }
    // // END DEBUG
    // present event
    const epSdkEpEventTask = new EpSdkEpEventTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: cliMigratedApplicationDomain.epV2ApplicationDomain.id,
      eventName: epV1Event.name,
      eventObjectSettings: {
        shared: epV1Event.shared,
        brokerType: epV1Event.brokerType as unknown as EpSdkBrokerTypes,
      },
      epSdkTask_TransactionConfig: this.get_IEpSdkTask_TransactionConfig(),
    });
    const epSdkEpEventTask_ExecuteReturn: IEpSdkEpEventTask_ExecuteReturn = await this.executeTask({epSdkTask: epSdkEpEventTask });
    let epSdkEvent: EpSdkEvent = epSdkEpEventTask_ExecuteReturn.epObject;
    rctxt.epV2.epSdkEvent = epSdkEvent;
    /* istanbul ignore next */
    if (epSdkEvent.id === undefined) throw new CliEPApiContentError(logName,"epSdkEvent.id === undefined", { epSdkEvent });
    // set custom attributes
    epSdkEpEventTask_ExecuteReturn.epObject = await this.presentEventCustomAttributes({ epSdkEpEventTask_ExecuteReturn });
    CliLogger.trace(CliLogger.createLogEntry(logName, {code: ECliStatusCodes.PRESENT_EP_V2_EVENT, details: { epSdkEpEventTask_ExecuteReturn }}));
    CliRunSummary.presentEpV2Event({ applicationDomainName: cliMigratedApplicationDomain.epV2ApplicationDomain.name, epSdkEpEventTask_ExecuteReturn });
    // present the event version
    // add all the topic address variables with enumId to the enum info map
    const epV1TopicNodeDTOs: Array<EpV1TopicNodeDTO> | undefined = epV1Event.topicAddress ? epV1Event.topicAddress.topicAddressLevels : undefined;
    if(epV1TopicNodeDTOs && epV1TopicNodeDTOs.length > 0) {
      for(const epV1TopicNodeDTO of epV1TopicNodeDTOs) {
        /* istanbul ignore next */
        if(epV1TopicNodeDTO.name === undefined) throw new CliEPApiContentError(logName,"epV1TopicNodeDTO.name === undefined", { epV1TopicNodeDTO });
        if(epV1TopicNodeDTO.enumId && !this.epSdkEnumInfoMap.get(epV1TopicNodeDTO.name)) {
          // find the EpV2 record
          const cliMigratedEnum: ICliMigratedEnum | undefined = this.options.cliMigratedEnums.find( cliMigratedEnum => cliMigratedEnum.epV1Enum.id === epV1TopicNodeDTO.enumId );
          if(cliMigratedEnum === undefined) {
            // check if referenced enum has issues
            const ennumIssues: Array<ICliRunIssueEnum> = CliRunIssues.get({ type: ECliRunIssueTypes.EnumIssue, epV1Id: epV1TopicNodeDTO.enumId }) as Array<ICliRunIssueEnum>;
            if(ennumIssues.length > 0) throw new CliMigrateReferenceIssueError(logName, ennumIssues);
            /* istanbul ignore next */
            else throw new CliMigrateEventReferenceEnumIssueError(logName, { message: "enumId not found in cliMigratedEnums", epV1TopicNodeDTO, cliMigratedEnums: this.options.cliMigratedEnums });     
          }
          /* istanbul ignore next */
          if (cliMigratedEnum.epV2Enum.topicAddressEnum.id === undefined) throw new CliEPApiContentError(logName,"cliMigratedEnum.epV2Enum.topicAddressEnum.id", { epV2Enum: cliMigratedEnum.epV2Enum });
          /* istanbul ignore next */
          if (cliMigratedEnum.epV2Enum.topicAddressEnumVersion.id === undefined) throw new CliEPApiContentError(logName,"cliMigratedEnum.epV2Enum.topicAddressEnumVersion.id", { epV2Enum: cliMigratedEnum.epV2Enum });
          const epSdkEpEventVersionTask_EnumInfo: IEpSdkEpEventVersionTask_EnumInfo = {
            enumName: this.transformTopicElement(epV1TopicNodeDTO.name),
            enumId: cliMigratedEnum.epV2Enum.topicAddressEnum.id,
            applicationDomainId: cliMigratedEnum.epV2Enum.topicAddressEnum.applicationDomainId,
            enumVersionId: cliMigratedEnum.epV2Enum.topicAddressEnumVersion.id
          };
          this.epSdkEnumInfoMap.set(epSdkEpEventVersionTask_EnumInfo.enumName, epSdkEpEventVersionTask_EnumInfo);
          // console.log(`\n\n>>>>>>>>>${logName}: added epSdkEpEventVersionTask_EnumInfo = ${JSON.stringify(epSdkEpEventVersionTask_EnumInfo, null, 2)}\n\n`);
        }
      }
    }
    /* istanbul ignore next */
    if(cliMigratedSchema && cliMigratedSchema.epV2Schema.schemaVersion.id === undefined) throw new CliEPApiContentError(logName,"cliMigratedSchema.epV2Schema.schemaVersion.id", { schemaVersion: cliMigratedSchema.epV2Schema.schemaVersion });
    const transformedTopicString = this.transformTopicString({ epV1TopicName: epV1Event.topicName, epV1TopicNodeDTOs });
    // DEBUG
    // console.log(`\n\n>>>${logName}: ${JSON.stringify({
    //   epV1TopicName: epV1Event.topicName,
    //   epV1TopicNodeDTOs,
    //   transformedTopicString
    // }, null, 2)}\n\n`);
    const epSdkEpEventVersionTask = new EpSdkEpEventVersionTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: cliMigratedApplicationDomain.epV2ApplicationDomain.id,
      eventId: epSdkEvent.id,
      versionString: this.options.cliEventsMigrateConfig.epV2.versions.initialVersion,
      versionStrategy: this.get_EEpSdk_VersionTaskStrategy(this.options.cliEventsMigrateConfig.epV2.versions.versionStrategy),
      topicString: transformedTopicString,
      topicDelimiter: this.epV2TopicDelimiter,
      enumInfoMap: this.epSdkEnumInfoMap,
      eventVersionSettings: {
        description: epV1Event.description,
        schemaVersionId: cliMigratedSchema ? cliMigratedSchema.epV2Schema.schemaVersion.id : undefined,
        stateId: this.get_EpSdk_StateId(this.options.cliEventsMigrateConfig.epV2.versions.state),
      },
      epSdkTask_TransactionConfig: this.get_IEpSdkTask_TransactionConfig(),
    });
    const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn = await this.executeTask({ epSdkTask: epSdkEpEventVersionTask });
    rctxt.epV2.eventVersion = epSdkEpEventVersionTask_ExecuteReturn.epObject;
    // set custom attributes
    epSdkEpEventVersionTask_ExecuteReturn.epObject = await this.presentEventVersionCustomAttributes({ epSdkEpEventVersionTask_ExecuteReturn });
    // migrate tags
    epSdkEvent = await this.migrateTags({ epV1Tags, epSdkEvent });
    CliLogger.trace(CliLogger.createLogEntry(logName, {code: ECliStatusCodes.PRESENT_EP_V2_EVENT_VERSION, details: { epSdkEpEventVersionTask_ExecuteReturn }}));
    CliRunSummary.presentEpV2EventVersion({ applicationDomainName: cliMigratedApplicationDomain.epV2ApplicationDomain.name, epSdkEpEventVersionTask_ExecuteReturn });
    this.cliMigratedEvents.push({
      epV1Event,
      epV2Event: {
        eventObject: epSdkEvent,
        eventVersion: epSdkEpEventVersionTask_ExecuteReturn.epObject
      }
    });
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
              await this.migrateEvent({ 
                cliMigratedApplicationDomain, 
                epV1Event,
                epV1Tags: await this.getTags({id: epV1Event.id })
               });   
            } catch(e: any) {
              const error = CliErrorFactory.createCliError({ logName, error: e} );
              CliLogger.error(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.MIGRATE_EVENTS_ERROR, details: { error }}));
              // add to issues log  
              const rctxt: ICliEventRunContext | undefined = CliRunContext.pop() as ICliEventRunContext| undefined;
              const issue: ICliRunIssueEvent = {
                type: ECliRunIssueTypes.EventIssue,
                epV1Id: epV1Event.id,
                epV1Event,
                cliRunContext: rctxt,
                cause: error
              };
              CliRunIssues.add(issue);
              CliRunSummary.processingEpV1EventIssue({ rctxt });        
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
