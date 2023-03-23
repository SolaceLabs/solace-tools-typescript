import {
  EpAsynApiChannelPublishOperation,
  EpAsyncApiChannelDocument,
  EpAsyncApiChannelParameterDocument,
  EpAsyncApiChannelSubscribeOperation,
  EpAsyncApiDocument,
  EpAsyncApiMessageDocument,
  T_EpAsyncApiChannelDocumentMap,
  T_EpAsyncApiChannelParameterDocumentMap,
} from "@solace-labs/ep-asyncapi";
import {
  SchemaObject,
  SchemaVersion,
  Event as EPEvent,
  TopicAddressEnum,
  CustomAttribute,
} from "@solace-labs/ep-openapi-node";
import {
  EEpSdkTask_Action,
  EEpSdkTask_TargetState,
  EpSdkApplicationDomainTask,
  EpSdkEnumTask,
  EpSdkEnumVersionTask,
  EpSdkEpEventTask,
  EpSdkEpEventVersionTask,
  EpSdkSchemaTask,
  EpSdkSchemaVersionTask,
  IEpSdkApplicationDomainTask_ExecuteReturn,
  IEpSdkEnumTask_ExecuteReturn,
  IEpSdkEnumVersionTask_ExecuteReturn,
  IEpSdkEpEventTask_ExecuteReturn,
  IEpSdkEpEventVersionTask_EnumInfo,
  IEpSdkEpEventVersionTask_ExecuteReturn,
  IEpSdkSchemaTask_ExecuteReturn,
  IEpSdkSchemaVersionTask_ExecuteReturn,
  IEpSdkTask_ExecuteReturn,
} from "@solace-labs/ep-sdk";
import {
  CliEPApiContentError,
  CliLogger,
  ECliStatusCodes,
  ECliChannelOperation,
  ICliApiRunContext_Channel,
  ICliApiRunContext_Channel_Operation,
  ICliApiRunContext_Channel_Operation_Message,
  ICliApiRunContext_Channel_Parameter,
  CliRunContext,
  ECliChannelOperationType,
  ECliRunSummary_Type,
  CliRunSummary,
  ECliRunContext_RunMode,
  CliImporterTestRunAssetsApplicationDomainPolicyViolationError,
  ECliAssetsApplicationDomainEnforcementPolicies,
} from "../cli-components";
import { CliAsyncApiDocumentService } from "../services";
import {
  CliImporter,
  ICliImporterGenerateAssetsOptions,
  ICliImporterOptions,
  ICliImporterRunOptions,
  ICliImporterRunPresentOptions,
  ICliImporterRunPresentReturn,
  ICliImporterRunReturn,
} from "./CliImporter";

export interface ICliAssetsImporterOptions extends ICliImporterOptions {}
export interface ICliAssetsImporterGenerateAssetsOptions
  extends ICliImporterGenerateAssetsOptions {
  epAsyncApiDocument: EpAsyncApiDocument;
}
export interface ICliAssetsImporterRunPresentOptions
  extends ICliImporterRunPresentOptions {
  epAsyncApiDocument: EpAsyncApiDocument;
}
export interface ICliAssetsImporterRunPresentReturn extends ICliImporterRunPresentReturn {
  assetApplicationDomainId: string;
}
export interface ICliAssetsImporterRunOptions extends ICliImporterRunOptions {}
export interface ICliAssetsImporterRunReturn extends ICliImporterRunReturn {}

export abstract class CliAssetsImporter extends CliImporter {

  private enumInfoMap: Map<string, IEpSdkEpEventVersionTask_EnumInfo> = new Map<string, IEpSdkEpEventVersionTask_EnumInfo>();

  constructor(cliAssetImporterOptions: ICliAssetsImporterOptions, runMode: ECliRunContext_RunMode) {
    super(cliAssetImporterOptions, runMode);
  }

  private async assertModifyPermission({ logName, targetApplicationDomainName, allowedApplicationDomainName, epSdkTask_ExecuteReturn, epObjectCustomAttributes, epObjectName }:{
    logName: string;
    targetApplicationDomainName: string;
    allowedApplicationDomainName: string;
    epSdkTask_ExecuteReturn: IEpSdkTask_ExecuteReturn;
    epObjectCustomAttributes: Array<CustomAttribute>;
    epObjectName: string;
  }): Promise<void> {
    if(this.cliImporterOptions.cliAssetsApplicationDomainEnforcementPolicy === ECliAssetsApplicationDomainEnforcementPolicies.OFF) return;
    epObjectCustomAttributes;
    // DEBUG
    const assertModifyPermissionLog = {
      logName,
      cliRunContext: CliRunContext.get(),
      runMode: this.runMode,
      cliAssetsApplicationDomainEnforcementPolicy: this.cliImporterOptions.cliAssetsApplicationDomainEnforcementPolicy,
      epObjectName,
      epObjectType: epSdkTask_ExecuteReturn.epObjectKeys.epObjectType,
      epSdkTask_Action: epSdkTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action,
      epObjectCustomAttributes: epObjectCustomAttributes || 'undefined',
      // sourceApplicationDomainName: await this.getSourceApplicationDomainName({ epObjectCustomAttributes }) || 'unknown',
      targetApplicationDomainName,
      allowedApplicationDomainName
    }
    console.log(`assertModifyPermissionLog = ${JSON.stringify(assertModifyPermissionLog, null, 2)}`);
    // end DEBUG
    if(epSdkTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action !== EEpSdkTask_Action.NO_ACTION) {
      if(this.cliImporterOptions.cliAssetsApplicationDomainEnforcementPolicy === ECliAssetsApplicationDomainEnforcementPolicies.LAX && epSdkTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action === EEpSdkTask_Action.CREATE_FIRST_VERSION) return;
      // const sourceApplicationDomainName = await this.getSourceApplicationDomainName({ epObjectCustomAttributes }) || 'unknown';
      if(targetApplicationDomainName !== allowedApplicationDomainName) {
        throw new CliImporterTestRunAssetsApplicationDomainPolicyViolationError(logName, {
          cliAssetsApplicationDomainEnforcementPolicy: this.cliImporterOptions.cliAssetsApplicationDomainEnforcementPolicy,
          runMode: this.runMode,
          epObjectName: epObjectName,
          // sourceApplicationDomainName: sourceApplicationDomainName,
          targetApplicationDomainName,
          allowedApplicationDomainName,
          epSdkTask_TransactionLogData: epSdkTask_ExecuteReturn.epSdkTask_TransactionLogData,
        });
      }
    }
  }
  
  
  private run_present_event_version = async ({ epAsyncApiChannelDocument, eventObject, specVersion, epAsyncApiMessageDocument, schemaVersionId, applicationDomainId, checkmode }: {
    epAsyncApiChannelDocument: EpAsyncApiChannelDocument;
    epAsyncApiMessageDocument: EpAsyncApiMessageDocument;
    eventObject: EPEvent;
    specVersion: string;
    schemaVersionId: string;
    applicationDomainId: string;
    checkmode: boolean;
  }): Promise<void> => {
    const funcName = "run_present_event_version";
    const logName = `${CliAssetsImporter.name}.${funcName}()`;

    CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_API_CHANNEL_MESSAGE, details: {
      eventObject: eventObject,
      specVersion: specVersion,
      epAsyncApiMessageDocument: epAsyncApiMessageDocument,
    }}));

    /* istanbul ignore next */
    if (eventObject.id === undefined) throw new CliEPApiContentError(logName, "eventObject.id === undefined", { eventObject: eventObject });

    const eventId: string = eventObject.id;
    const channelTopic: string = epAsyncApiChannelDocument.getAsyncApiChannelKey();

    const epSdkEpEventVersionTask = new EpSdkEpEventVersionTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: applicationDomainId,
      eventId: eventId,
      versionString: specVersion,
      versionStrategy: this.get_EEpSdk_VersionTaskStrategy(),
      topicString: channelTopic,
      topicDelimiter: epAsyncApiChannelDocument.getChannelDelimiter(),
      enumInfoMap: this.enumInfoMap,
      eventVersionSettings: {
        description: epAsyncApiChannelDocument.getEpEventDescription(),
        displayName: epAsyncApiChannelDocument.getEpEventVersionName(),
        schemaVersionId: schemaVersionId,
        stateId: this.get_EpSdkTask_StateId(),
        brokerType: epAsyncApiChannelDocument.getBrokerType()
      },
      epSdkTask_TransactionConfig: this.get_IEpSdkTask_TransactionConfig(),
      checkmode: checkmode,
    });
    const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn = await this.executeTask({
      epSdkTask: epSdkEpEventVersionTask,
      expectNoAction: checkmode,
    });
    // check if changes allowed
    await this.assertModifyPermission({
      logName,
      targetApplicationDomainName: epAsyncApiMessageDocument.getMessageEpApplicationDomainName(),
      allowedApplicationDomainName: epAsyncApiMessageDocument.epAsyncApiDocument.getUnprefixedAssetsApplicationDomainName(),
      epSdkTask_ExecuteReturn: epSdkEpEventVersionTask_ExecuteReturn,
      epObjectCustomAttributes: eventObject.customAttributes || [],
      epObjectName: eventObject.name,
    });
    
    CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_EP_EVENT_VERSION, details: {
      epSdkEpEventVersionTask_ExecuteReturn: epSdkEpEventVersionTask_ExecuteReturn,
    }}));
    // summary
    CliRunSummary.processedEventVersion({
      epSdkEpEventVersionTask_ExecuteReturn: epSdkEpEventVersionTask_ExecuteReturn,
    });
  };

  private run_present_channel_event = async ({
    assetApplicationDomainId,
    epAsyncApiChannelDocument,
    epAsyncApiMessageDocument,
    specVersion,
    schemaVersionId,
    checkmode,
  }: {
    assetApplicationDomainId: string;
    epAsyncApiChannelDocument: EpAsyncApiChannelDocument;
    epAsyncApiMessageDocument: EpAsyncApiMessageDocument;
    specVersion: string;
    schemaVersionId: string;
    checkmode: boolean;
  }): Promise<void> => {
    const funcName = "run_present_channel_event";
    const logName = `${CliAssetsImporter.name}.${funcName}()`;

    const epEventName: string = epAsyncApiChannelDocument.getEpEventName();
    const channelTopic: string = epAsyncApiChannelDocument.getAsyncApiChannelKey();

    CliLogger.debug(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_API_CHANNEL_MESSAGE, details: {
      epEventName: epEventName,
      channelTopic: channelTopic,
    }}));
    CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_API_CHANNEL_MESSAGE, details: {
      epAsyncApiMessageDocument: epAsyncApiMessageDocument,
    }}));

    const eventApplicationDomainId = await this.getAssetApplicationDomainId({
      assetApplicationDomainId: assetApplicationDomainId,
      overrideAssetApplicationDomainName: epAsyncApiMessageDocument.getMessageEpApplicationDomainName()
    });

    // present event
    const epSdkEpEventTask = new EpSdkEpEventTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: eventApplicationDomainId,
      eventName: epEventName,
      eventObjectSettings: {
        shared: true,
      },
      epSdkTask_TransactionConfig: this.get_IEpSdkTask_TransactionConfig(),
      checkmode: checkmode,
    });
    const epSdkEpEventTask_ExecuteReturn: IEpSdkEpEventTask_ExecuteReturn = await this.executeTask({
      epSdkTask: epSdkEpEventTask,
      expectNoAction: checkmode,
    });

    CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_EP_EVENT, details: {
      epSdkEpEventTask_ExecuteReturn: epSdkEpEventTask_ExecuteReturn,
    }}));

    // present the event version
    const xvoid: void = await this.run_present_event_version({
      applicationDomainId: eventApplicationDomainId,
      eventObject: epSdkEpEventTask_ExecuteReturn.epObject,
      specVersion: specVersion,
      epAsyncApiChannelDocument: epAsyncApiChannelDocument,
      epAsyncApiMessageDocument: epAsyncApiMessageDocument,
      schemaVersionId: schemaVersionId,
      checkmode: checkmode,
    });
    /* istanbul ignore next */
    xvoid;
  };

  private run_present_schema_version = async ({ applicationDomainId, schemaObject, specVersion, epAsyncApiMessageDocument, checkmode }: {
    applicationDomainId: string;
    schemaObject: SchemaObject;
    specVersion: string;
    epAsyncApiMessageDocument: EpAsyncApiMessageDocument;
    checkmode: boolean;
  }): Promise<IEpSdkSchemaVersionTask_ExecuteReturn> => {
    const funcName = "run_present_schema_version";
    const logName = `${CliAssetsImporter.name}.${funcName}()`;

    CliLogger.debug(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_API_CHANNEL_MESSAGE, details: {}}));
    CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_API_CHANNEL_MESSAGE, details: {
      schemaObject: schemaObject,
      specVersion: specVersion,
      epAsyncApiMessageDocument: epAsyncApiMessageDocument,
    }}));

    /* istanbul ignore next */
    if (schemaObject.id === undefined) throw new CliEPApiContentError(logName, "schemaObject.id === undefined", {
      schemaObject: schemaObject,
    });

    const epSdkSchemaVersionTask = new EpSdkSchemaVersionTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: applicationDomainId,
      schemaId: schemaObject.id,
      versionString: specVersion,
      versionStrategy: this.get_EEpSdk_VersionTaskStrategy(),
      schemaVersionSettings: { 
        content: JSON.stringify(epAsyncApiMessageDocument.getSchemaAsSanitizedJson(), null, 2),
        // don't set the description, it remains in the schema
        // otherwise no idempotency 
        // description: epAsyncApiMessageDocument.getPayloadSchemaDescription(),
        description: '',
        displayName: epAsyncApiMessageDocument.getPayloadSchemaDisplayName(),
        stateId: this.get_EpSdkTask_StateId(),
      },
      epSdkTask_TransactionConfig: this.get_IEpSdkTask_TransactionConfig(),
      checkmode: checkmode,
    });
    const epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn = await this.executeTask({
      epSdkTask: epSdkSchemaVersionTask,
      expectNoAction: checkmode,
    });
    // check if changes allowed
    await this.assertModifyPermission({
      logName,
      targetApplicationDomainName: epAsyncApiMessageDocument.getPayloadSchemaEpApplicationDomainName(),
      allowedApplicationDomainName: epAsyncApiMessageDocument.epAsyncApiDocument.getUnprefixedAssetsApplicationDomainName(),
      epSdkTask_ExecuteReturn: epSdkSchemaVersionTask_ExecuteReturn,
      epObjectCustomAttributes: schemaObject.customAttributes || [],
      epObjectName: schemaObject.name,
    });
    
    CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_EP_SCHEMA_VERSION, details: {
      epSdkSchemaVersionTask_ExecuteReturn: epSdkSchemaVersionTask_ExecuteReturn,
    }}));
    // summary
    CliRunSummary.processedSchemaVersion({ epSdkSchemaVersionTask_ExecuteReturn: epSdkSchemaVersionTask_ExecuteReturn });
    return epSdkSchemaVersionTask_ExecuteReturn;
  };

  private run_present_channel_message = async ({ assetApplicationDomainId, epAsyncApiMessageDocument, specVersion, checkmode }: {
    assetApplicationDomainId: string;
    epAsyncApiMessageDocument: EpAsyncApiMessageDocument;
    specVersion: string;
    checkmode: boolean;
  }): Promise<SchemaVersion> => {
    const funcName = "run_present_channel_message";
    const logName = `${CliAssetsImporter.name}.${funcName}()`;

    const rctxt: ICliApiRunContext_Channel_Operation_Message = { messageName: epAsyncApiMessageDocument.getMessageName() };
    CliRunContext.push(rctxt);

    CliLogger.debug(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_API_CHANNEL_MESSAGE, details: {} }));
    CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_API_CHANNEL_MESSAGE, details: {
      epAsyncApiMessageDocument: epAsyncApiMessageDocument,
    }}));

    const schemaApplicationDomainId = await this.getAssetApplicationDomainId({
      assetApplicationDomainId: assetApplicationDomainId,
      overrideAssetApplicationDomainName: epAsyncApiMessageDocument.getPayloadSchemaEpApplicationDomainName()
    });
    // present schema
    const epSdkSchemaTask = new EpSdkSchemaTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: schemaApplicationDomainId,
      schemaName: epAsyncApiMessageDocument.getPayloadSchemaName(),
      schemaObjectSettings: {
        contentType: CliAsyncApiDocumentService.map_MessageDocumentContentType_To_EpSchemaContentType(epAsyncApiMessageDocument.getContentType()),
        schemaType: CliAsyncApiDocumentService.map_MessageDocumentSchemaFormatType_To_EpSchemaFormatType(epAsyncApiMessageDocument.getSchemaFormatType()),
        shared: true,
      },
      epSdkTask_TransactionConfig: this.get_IEpSdkTask_TransactionConfig(),
      checkmode: checkmode,
    });
    const epSdkSchemaTask_ExecuteReturn: IEpSdkSchemaTask_ExecuteReturn = await this.executeTask({
      epSdkTask: epSdkSchemaTask,
      expectNoAction: checkmode,
    });
    CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_EP_SCHEMA, details: {
      epSdkSchemaTask_ExecuteReturn: epSdkSchemaTask_ExecuteReturn,
    }}));
    // present the schema version
    const epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn = await this.run_present_schema_version({
      schemaObject: epSdkSchemaTask_ExecuteReturn.epObject,
      specVersion: specVersion,
      epAsyncApiMessageDocument: epAsyncApiMessageDocument,
      applicationDomainId: schemaApplicationDomainId,
      checkmode: checkmode,
    });
    CliRunContext.pop();
    return epSdkSchemaVersionTask_ExecuteReturn.epObject;
  };

  private run_present_enum_version = async ({assetApplicationDomainId, enumObject, specVersion, epAsyncApiChannelParameterDocument, checkmode }: {
    assetApplicationDomainId: string;
    enumObject: TopicAddressEnum;
    specVersion: string;
    epAsyncApiChannelParameterDocument: EpAsyncApiChannelParameterDocument;
    checkmode: boolean;
  }): Promise<void> => {
    const funcName = "run_present_enum_version";
    const logName = `${CliAssetsImporter.name}.${funcName}()`;
    CliLogger.debug(CliLogger.createLogEntry(logName, {code: ECliStatusCodes.IMPORTING_API_CHANNEL_PARAMETER,details: {}}));
    CliLogger.trace(CliLogger.createLogEntry(logName, {code: ECliStatusCodes.IMPORTING_API_CHANNEL_PARAMETER, details: {
      enumObject: enumObject,
      specVersion: specVersion,
      epAsyncApiChannelParameterDocument: epAsyncApiChannelParameterDocument,
      checkmode: checkmode,
    }}));
    /* istanbul ignore next */
    if (enumObject.id === undefined) throw new CliEPApiContentError(logName, "enumObject.id === undefined", {
      enumObject: enumObject,
    });

    const epSdkEnumVersionTask = new EpSdkEnumVersionTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: assetApplicationDomainId,
      enumId: enumObject.id,
      versionString: specVersion,
      versionStrategy: this.get_EEpSdk_VersionTaskStrategy(),
      enumValues: epAsyncApiChannelParameterDocument.getParameterEnumValueList(),
      enumVersionSettings: {
        description: epAsyncApiChannelParameterDocument.getDescription(),
        displayName: epAsyncApiChannelParameterDocument.getDisplayName(),
        stateId: this.get_EpSdkTask_StateId(),
      },
      epSdkTask_TransactionConfig: this.get_IEpSdkTask_TransactionConfig(),
      checkmode: checkmode,
    });
    const epSdkEnumVersionTask_ExecuteReturn: IEpSdkEnumVersionTask_ExecuteReturn = await this.executeTask({
      epSdkTask: epSdkEnumVersionTask,
      expectNoAction: checkmode,
    });
    // check if changes allowed
    await this.assertModifyPermission({
      logName,
      targetApplicationDomainName: epAsyncApiChannelParameterDocument.getEpApplicationDomainName(),
      allowedApplicationDomainName: epAsyncApiChannelParameterDocument.epAsyncApiDocument.getUnprefixedAssetsApplicationDomainName(),
      epSdkTask_ExecuteReturn: epSdkEnumVersionTask_ExecuteReturn,
      epObjectCustomAttributes: enumObject.customAttributes || [],
      epObjectName: enumObject.name
    });
    // collect enum version info for event version task
    /* istanbul ignore next */
    if (epSdkEnumVersionTask_ExecuteReturn.epObject.id === undefined) throw new CliEPApiContentError(logName, "epSdkEnumVersionTask_ExecuteReturn.epObject.id", {
      epSdkEnumVersionTask_ExecuteReturn: epSdkEnumVersionTask_ExecuteReturn,
    });
    const enumInfo: IEpSdkEpEventVersionTask_EnumInfo = {
      enumId: enumObject.id,
      enumName: enumObject.name,
      applicationDomainId: enumObject.applicationDomainId,
      enumVersionId: epSdkEnumVersionTask_ExecuteReturn.epObject.id
    };
    this.enumInfoMap.set(enumInfo.enumName, enumInfo);

    CliLogger.trace(CliLogger.createLogEntry(logName, {code: ECliStatusCodes.IMPORTING_EP_ENUM_VERSION, details: {
      epSdkEnumVersionTask_ExecuteReturn: epSdkEnumVersionTask_ExecuteReturn,
    }}));
    // summary
    CliRunSummary.processedEnumVersion({ epSdkEnumVersionTask_ExecuteReturn: epSdkEnumVersionTask_ExecuteReturn });
  };

  private run_present_channel_parameters = async ({assetApplicationDomainId, epAsyncApiChannelParameterDocumentMap, specVersion, checkmode }: {
    assetApplicationDomainId: string;
    epAsyncApiChannelParameterDocumentMap?: T_EpAsyncApiChannelParameterDocumentMap;
    specVersion: string;
    checkmode: boolean;
  }): Promise<void> => {
    const funcName = "run_present_channel_parameters";
    const logName = `${CliAssetsImporter.name}.${funcName}()`;

    if (epAsyncApiChannelParameterDocumentMap === undefined) {
      CliLogger.debug(CliLogger.createLogEntry(logName, {code: ECliStatusCodes.IMPORTING_API_CHANNEL_PARAMETERS, details: {
        channelParameters: [],
      }}));
      return;
    }

    for (const [parameterName, epAsyncApiChannelParameterDocument] of epAsyncApiChannelParameterDocumentMap) {
      const parameterEnumList: Array<string> = epAsyncApiChannelParameterDocument.getParameterEnumValueList();

      const rctxt: ICliApiRunContext_Channel_Parameter = {
        parameter: parameterName,
        parameterEnumList: parameterEnumList.length > 0 ? parameterEnumList : undefined,
      };
      CliRunContext.push(rctxt);
      CliLogger.debug(CliLogger.createLogEntry(logName, {code: ECliStatusCodes.IMPORTING_API_CHANNEL_PARAMETER, details: {}}));
      CliLogger.trace(CliLogger.createLogEntry(logName, {code: ECliStatusCodes.IMPORTING_API_CHANNEL_PARAMETER, details: {
        epAsyncApiChannelParameterDocument: epAsyncApiChannelParameterDocument,
      }}));
      // only create the enum if there are any values in the list
      if (parameterEnumList.length > 0) {
        const enumApplicationDomainId = await this.getAssetApplicationDomainId({
          assetApplicationDomainId: assetApplicationDomainId,
          overrideAssetApplicationDomainName: epAsyncApiChannelParameterDocument.getEpApplicationDomainName()
        });
        // present enum
        const epSdkEnumTask = new EpSdkEnumTask({
          epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
          applicationDomainId: enumApplicationDomainId,
          enumName: parameterName,
          enumObjectSettings: {
            shared: true,
          },
          epSdkTask_TransactionConfig: this.get_IEpSdkTask_TransactionConfig(),
          // TODO: checkmode?
        });
        const epSdkEnumTask_ExecuteReturn: IEpSdkEnumTask_ExecuteReturn = await this.executeTask({epSdkTask: epSdkEnumTask, expectNoAction: checkmode });
        const enumObject: TopicAddressEnum = epSdkEnumTask_ExecuteReturn.epObject;
        /* istanbul ignore next */
        if (enumObject.id === undefined) throw new CliEPApiContentError(logName,"enumObject.id === undefined", {
          enumObject: enumObject,
        });

        CliLogger.trace(CliLogger.createLogEntry(logName, {code: ECliStatusCodes.IMPORTING_EP_ENUM,details: {
          epSdkEnumTask_ExecuteReturn: epSdkEnumTask_ExecuteReturn,
        }}));
        CliRunSummary.processedEnum({epSdkEnumTask_ExecuteReturn: epSdkEnumTask_ExecuteReturn });
        // present the enum version
        const xvoid: void = await this.run_present_enum_version({
          assetApplicationDomainId: enumApplicationDomainId,
          enumObject: enumObject,
          specVersion: specVersion,
          epAsyncApiChannelParameterDocument: epAsyncApiChannelParameterDocument,
          checkmode: checkmode,
        });
        /* istanbul ignore next */
        xvoid;
      }
      CliRunContext.pop();
    }
  };

  private run_present_channel = async ({assetApplicationDomainId, epAsyncApiChannelDocument, specVersion, checkmode }: {
    assetApplicationDomainId: string;
    epAsyncApiChannelDocument: EpAsyncApiChannelDocument;
    specVersion: string;
    checkmode: boolean;
  }): Promise<void> => {
    const funcName = "run_present_channel";
    const logName = `${CliAssetsImporter.name}.${funcName}()`;

    const channelTopic: string = epAsyncApiChannelDocument.getAsyncApiChannelKey();
    const epEventName: string = epAsyncApiChannelDocument.getEpEventName();

    const rctxt: ICliApiRunContext_Channel = {
      channelTopic: channelTopic,
      epEventName: epEventName,
      applicationDomainName: assetApplicationDomainId,
    };
    CliRunContext.push(rctxt);
    CliRunSummary.processingApiChannel({ cliRunSummary_ApiChannel: {
      type: ECliRunSummary_Type.ApiChannel,
      channelTopic: channelTopic,
      // applicationDomainName: epAsyncApiChannelDocument.getApplicationDomainName(),
    }});
    CliLogger.trace(CliLogger.createLogEntry(logName, {code: ECliStatusCodes.IMPORTING_API_CHANNEL,details: {
      epAsyncApiChannelDocument: epAsyncApiChannelDocument,
    }}));

    let xvoid: void;

    // present channel parameters
    xvoid = await this.run_present_channel_parameters({
      assetApplicationDomainId: assetApplicationDomainId,
      epAsyncApiChannelParameterDocumentMap: epAsyncApiChannelDocument.getEpAsyncApiChannelParameterDocumentMap(),
      specVersion: specVersion,
      checkmode: checkmode,
    });
    // publish operations
    const epAsynApiChannelPublishOperation: EpAsynApiChannelPublishOperation | undefined = epAsyncApiChannelDocument.getEpAsyncApiChannelPublishOperation();
    if (epAsynApiChannelPublishOperation !== undefined) {
      const rctxt: ICliApiRunContext_Channel_Operation = {
        type: ECliChannelOperation.Publish,
      };
      CliRunContext.push(rctxt);
      CliRunSummary.processingApiChannelOperation({ cliRunSummary_ApiChannel_Operation: {
        type: ECliRunSummary_Type.ApiChannelOperation,
        operationType: ECliChannelOperationType.PUBLISH,
      }});
      CliLogger.debug(CliLogger.createLogEntry(logName, {code: ECliStatusCodes.IMPORTING_API_CHANNEL_PUBLISH_OPERATION,details: {}}));

      const epAsyncApiMessageDocument: EpAsyncApiMessageDocument = epAsynApiChannelPublishOperation.getEpAsyncApiMessageDocument();

      // present message
      const schemaVersionObject: SchemaVersion = await this.run_present_channel_message({
        assetApplicationDomainId: assetApplicationDomainId,
        epAsyncApiMessageDocument: epAsyncApiMessageDocument,
        specVersion: specVersion,
        checkmode: checkmode,
      });
      /* istanbul ignore next */
      if (schemaVersionObject.id === undefined) throw new CliEPApiContentError(logName, "schemaVersionObject.id === undefined", {
        schemaVersionObject: schemaVersionObject,
      });
      // present event
      xvoid = await this.run_present_channel_event({
        assetApplicationDomainId: assetApplicationDomainId,
        epAsyncApiChannelDocument: epAsyncApiChannelDocument,
        epAsyncApiMessageDocument: epAsyncApiMessageDocument,
        specVersion: specVersion,
        schemaVersionId: schemaVersionObject.id,
        checkmode: checkmode,
      });
      CliRunContext.pop();
    }

    const epAsyncApiChannelSubscribeOperation:
      | EpAsyncApiChannelSubscribeOperation
      | undefined =
      epAsyncApiChannelDocument.getEpAsyncApiChannelSubscribeOperation();
    if (epAsyncApiChannelSubscribeOperation !== undefined) {
      const rctxt: ICliApiRunContext_Channel_Operation = {
        type: ECliChannelOperation.Subscribe,
      };
      CliRunContext.push(rctxt);
      CliRunSummary.processingApiChannelOperation({
        cliRunSummary_ApiChannel_Operation: {
          type: ECliRunSummary_Type.ApiChannelOperation,
          operationType: ECliChannelOperationType.SUBSCRIBE,
        },
      });
      CliLogger.debug(
        CliLogger.createLogEntry(logName, {
          code: ECliStatusCodes.IMPORTING_API_CHANNEL_SUBSCRIBE_OPERATION,
          details: {},
        })
      );

      const epAsyncApiMessageDocument: EpAsyncApiMessageDocument =
        epAsyncApiChannelSubscribeOperation.getEpAsyncApiMessageDocument();

      // present message
      const schemaVersionObject: SchemaVersion =
        await this.run_present_channel_message({
          assetApplicationDomainId: assetApplicationDomainId,
          epAsyncApiMessageDocument: epAsyncApiMessageDocument,
          specVersion: specVersion,
          checkmode: checkmode,
        });
      /* istanbul ignore next */
      if (schemaVersionObject.id === undefined)
        throw new CliEPApiContentError(
          logName,
          "schemaVersionObject.id === undefined",
          {
            schemaVersionObject: schemaVersionObject,
          }
        );
      // present event
      xvoid = await this.run_present_channel_event({
        assetApplicationDomainId: assetApplicationDomainId,
        epAsyncApiChannelDocument: epAsyncApiChannelDocument,
        epAsyncApiMessageDocument: epAsyncApiMessageDocument,
        specVersion: specVersion,
        schemaVersionId: schemaVersionObject.id,
        checkmode: checkmode,
      });
      /* istanbul ignore next */
      xvoid;
      CliRunContext.pop();
    }
    CliRunContext.pop();
  };

  protected async run_present_assets({ cliAssetsImporterRunPresentOptions }: {
    cliAssetsImporterRunPresentOptions: ICliAssetsImporterRunPresentOptions;
  }): Promise<ICliAssetsImporterRunPresentReturn> {
    const funcName = "run_present_assets";
    const logName = `${CliAssetsImporter.name}.${funcName}()`;

    CliLogger.debug(CliLogger.createLogEntry(logName, {code: ECliStatusCodes.IMPORTING_START_API_ASSETS,details: {
      cliAssetsImporterRunPresentOptions: cliAssetsImporterRunPresentOptions,
    }}));

    // asset application domain present
    const assetApplicationDomainsTask = new EpSdkApplicationDomainTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainName: cliAssetsImporterRunPresentOptions.epAsyncApiDocument.getAssetsApplicationDomainName(),
      applicationDomainSettings: {
        // description: "a new description x"
      },
      epSdkTask_TransactionConfig: this.get_IEpSdkTask_TransactionConfig(),
      checkmode: cliAssetsImporterRunPresentOptions.checkmode,
    });
    const epSdkAssetApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await this.executeTask({
      epSdkTask: assetApplicationDomainsTask,
      expectNoAction: cliAssetsImporterRunPresentOptions.checkmode,
    });
    CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_EP_ASSET_APPLICATION_DOMAIN, message: "asset application domain", details: {
      epSdkAssetApplicationDomainTask_ExecuteReturn: epSdkAssetApplicationDomainTask_ExecuteReturn,
    }}));
    // create summary log
    CliRunSummary.processedAssetApplicationDomain({ epSdkAssetApplicationDomainTask_ExecuteReturn: epSdkAssetApplicationDomainTask_ExecuteReturn });

    // we need the ids in subsequent calls
    /* istanbul ignore next */
    if (epSdkAssetApplicationDomainTask_ExecuteReturn.epObject.id === undefined) throw new CliEPApiContentError(logName, "epSdkAssetApplicationDomainTask_ExecuteReturn.epObject.id === undefined", {
      applicationDomainObject: epSdkAssetApplicationDomainTask_ExecuteReturn.epObject,
    });
    const cliAssetsImporterRunPresentReturn: ICliAssetsImporterRunPresentReturn = { assetApplicationDomainId: epSdkAssetApplicationDomainTask_ExecuteReturn.epObject.id };
    // present all channels
    const epAsyncApiChannelDocumentMap: T_EpAsyncApiChannelDocumentMap = cliAssetsImporterRunPresentOptions.epAsyncApiDocument.getEpAsyncApiChannelDocumentMap();
    for (const [topic, epAsyncApiChannelDocument] of epAsyncApiChannelDocumentMap) {
      // CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING, details: {
      //   topic: topic,
      //   channelDocument: channelDocument
      // }}));
      /* istanbul ignore next */
      topic;
      const xvoid: void = await this.run_present_channel({
        assetApplicationDomainId: cliAssetsImporterRunPresentReturn.assetApplicationDomainId,
        epAsyncApiChannelDocument: epAsyncApiChannelDocument,
        specVersion: cliAssetsImporterRunPresentOptions.epAsyncApiDocument.getVersion(),
        checkmode: cliAssetsImporterRunPresentOptions.checkmode,
      });
      /* istanbul ignore next */
      xvoid;
    }
    // throw new Error(`${logName}: test error handling in test_mode`);
    return cliAssetsImporterRunPresentReturn;
  }
}
