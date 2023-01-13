import {
  EpAsynApiChannelPublishOperation,
  EpAsyncApiChannelSubscribeOperation,
  EpAsyncApiDocument,
  EpAsyncApiDocumentService,
  EpAsyncApiMessageDocument,
  E_EpAsyncApiContentTypes,
  T_EpAsyncApiChannelDocumentMap,
} from "@solace-labs/ep-asyncapi";
import {
  EventApi,
  EventApIsService,
  EventApiVersion,
} from "@solace-labs/ep-openapi-node";
import {
  EEpSdkTask_Action,
  EEpSdkTask_TargetState,
  EEpSdk_VersionTaskStrategy,
  EpSdkApplicationDomainTask,
  EpSdkEventApiTask,
  EpSdkEventApiVersionsService,
  EpSdkEventApiVersionTask,
  IEpSdkApplicationDomainTask_ExecuteReturn,
  IEpSdkEventApiTask_ExecuteReturn,
  IEpSdkEventApiVersionTask_ExecuteReturn,
} from "@solace-labs/ep-sdk";
import {
  CliAsyncApiSpecFeatureNotSupportedError,
  CliEPApiContentError,
  CliErrorFactory,
  CliImporterTestRunAssetsInconsistencyError,
  CliInternalCodeInconsistencyError,
  CliLogger,
  ECliStatusCodes,
  CliRunContext,
  ECliRunContext_RunMode,
  ICliApiRunContext,
  ICliGenerateApiOutputRunContext,
  CliRunSummary,
  ECliRunSummary_Type,
  CliUtils,
  CliRunExecuteReturnLog,
} from "../cli-components";
import {
  ICliPubSubEventVersionIds,
  CliAsyncApiDocumentService,
} from "../services";
import {
  ICliImporterGenerateAssetsOptions,
  ICliImporterGenerateAssetsReturn,
  ICliImporterRunPresentOptions,
} from "./CliImporter";
import {
  CliAssetsImporter,
  ICliAssetsImporterOptions,
  ICliAssetsImporterRunOptions,
  ICliAssetsImporterRunPresentReturn,
  ICliAssetsImporterRunReturn,
} from "./CliAssetsImporter";

export interface ICliEventApiImporterOptions
  extends ICliAssetsImporterOptions {}
export interface ICliEventApiImporterGenerateAssetsOptions
  extends ICliImporterGenerateAssetsOptions {
  cliEventApiImporterRunOptions: ICliEventApiImporterRunOptions;
  applicationDomainId: string;
  eventApiId: string;
  eventApiVersionId: string;
  applicationDomainName?: string;
  apiTitle?: string;
}
export interface ICliEventApiImporterGenerateAssetsReturn
  extends ICliImporterGenerateAssetsReturn {
  assetOutputRootDir: string | undefined;
  asyncApiSpecFileNameJson: string | undefined;
  asyncApiSpecFileNameYaml: string | undefined;
  schemasOutputDir: string | undefined;
}
export interface ICliEventApiImporterRunPresentOptions
  extends ICliImporterRunPresentOptions {
  epAsyncApiDocument: EpAsyncApiDocument;
}
export interface ICliEventApiImporterRunPresentReturn
  extends ICliAssetsImporterRunPresentReturn {
  applicationDomainId: string;
  eventApiId: string;
  eventApiVersionId: string;
}
export interface ICliEventApiImporterRunPresentEventApiReturn {
  eventApiId: string;
  eventApiVersionId: string;
}
export interface ICliEventApiImporterRunPresentEventApiVersionReturn {
  eventApiVersionId: string;
}
export interface ICliEventApiImporterRunImportReturn extends ICliAssetsImporterRunReturn {
  apiTitle: string;
  applicationDomainId: string;
  eventApiId: string;
  eventApiVersionId: string;
}
export interface ICliEventApiImporterRunOptions extends ICliAssetsImporterRunOptions {
  generateAssetsOutput: boolean;
}
export interface ICliEventApiImporterRunReturn extends ICliAssetsImporterRunReturn {
  cliEventApiImporterGenerateAssetsReturn: ICliEventApiImporterGenerateAssetsReturn;
}

export class CliEventApiImporter extends CliAssetsImporter {
  constructor(cliEventApiImporterOptions: ICliEventApiImporterOptions) {
    super(cliEventApiImporterOptions);
  }

  private run_present_event_api_version = async ({
    applicationDomainId,
    assetApplicationDomainId,
    eventApiId,
    epAsyncApiDocument,
    checkmode,
  }: {
    applicationDomainId: string;
    assetApplicationDomainId: string;
    eventApiId: string;
    epAsyncApiDocument: EpAsyncApiDocument;
    checkmode: boolean;
  }): Promise<ICliEventApiImporterRunPresentEventApiVersionReturn> => {
    const funcName = "run_present_event_api_version";
    const logName = `${CliEventApiImporter.name}.${funcName}()`;
    // get latest version as reference
    const latestExistingEventApiVersionObjectBefore: EventApiVersion | undefined = await EpSdkEventApiVersionsService.getLatestVersionForEventApiName({
      applicationDomainId: applicationDomainId,
      eventApiName: epAsyncApiDocument.getTitle(),
    });
    // const latestExistingEventApiVersionString: string | undefined = latestExistingEventApiVersionObjectBefore?.version;
    // get the list of pub and sub events
    const cliPubSubEventVersionIds: ICliPubSubEventVersionIds = await CliAsyncApiDocumentService.get_pub_sub_event_version_ids({
      applicationDomainId: assetApplicationDomainId,
      epAsyncApiDocument: epAsyncApiDocument,
    });
    // const rctxtVersion: ICliAsyncApiRunContext_EventApiVersion = {
    //   epTargetEventApiVersion: epAsyncApiDocument.getVersion(),
    //   epLatestExistingEventApiVersion: latestExistingEventApiVersionString
    // };
    // CliRunContext.updateContext({ runContext: rctxtVersion });

    // because of exact version, test first and add to summary
    const epSdkEventApiVersionTask_Check = new EpSdkEventApiVersionTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: applicationDomainId,
      eventApiId: eventApiId,
      versionString: epAsyncApiDocument.getVersion(),
      versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
      eventApiVersionSettings: {
        description: epAsyncApiDocument.getDescription(),
        displayName: epAsyncApiDocument.getTitle(),
        producedEventVersionIds: cliPubSubEventVersionIds.publishEventVersionIdList,
        consumedEventVersionIds: cliPubSubEventVersionIds.subscribeEventVersionIdList,
        stateId: this.get_EpSdkTask_StateId(),
      },
      epSdkTask_TransactionConfig: this.get_IEpSdkTask_TransactionConfig(),
      checkmode: true,
    });
    const epSdkEventApiVersionTask_ExecuteReturn_Check: IEpSdkEventApiVersionTask_ExecuteReturn = await this.executeTask({
      epSdkTask: epSdkEventApiVersionTask_Check,
      expectNoAction: false,
    });
    CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_EP_EVENT_API_VERSION_CHECK, details: {
      epSdkEventApiVersionTask_ExecuteReturn_Check: epSdkEventApiVersionTask_ExecuteReturn_Check,
    }}));
    CliRunSummary.processingStartEventApiVersion({
      latestExistingEventApiVersionObjectBefore: latestExistingEventApiVersionObjectBefore,
      exactTargetVersion: epAsyncApiDocument.getVersion(),
      epSdkEventApiVersionTask_ExecuteReturn_Check: epSdkEventApiVersionTask_ExecuteReturn_Check,
    });

    // returned later
    let eventApiVersionId: string;
    if (epSdkEventApiVersionTask_ExecuteReturn_Check.epSdkTask_TransactionLogData.epSdkTask_Action === EEpSdkTask_Action.WOULD_FAIL_CREATE_NEW_VERSION_ON_EXACT_VERSION_REQUIREMENT) {
      // different strategies for release mode and test mode
      // release_mode: warning
      // test_mode: error
      if (latestExistingEventApiVersionObjectBefore === undefined) throw new CliInternalCodeInconsistencyError(logName, {
          message: "latestExistingEventApiVersionObjectBefore === undefined",
          applicationDomainId: applicationDomainId,
          applicationName: epAsyncApiDocument.getTitle(),
        });
      if (CliRunContext.get().runMode === ECliRunContext_RunMode.RELEASE) {
        // create event api version and issue warning
        const epSdkEventApiVersionTask = new EpSdkEventApiVersionTask({
          epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
          applicationDomainId: applicationDomainId,
          eventApiId: eventApiId,
          versionString: epAsyncApiDocument.getVersion(),
          versionStrategy: EEpSdk_VersionTaskStrategy.BUMP_PATCH,
          eventApiVersionSettings: {
            description: epAsyncApiDocument.getDescription(),
            displayName: epAsyncApiDocument.getTitle(),
            producedEventVersionIds: cliPubSubEventVersionIds.publishEventVersionIdList,
            consumedEventVersionIds: cliPubSubEventVersionIds.subscribeEventVersionIdList,
            // stateId: CliEPStatesService.getTargetLifecycleState({cliAssetImport_TargetLifecycleState: ECliAssetImport_TargetLifecycleState.DRAFT }),
            // still create it in requested state
            stateId: this.get_EpSdkTask_StateId(),
          },
          epSdkTask_TransactionConfig: this.get_IEpSdkTask_TransactionConfig(),
          checkmode: checkmode,
        });
        const epSdkEventApiVersionTask_ExecuteReturn: IEpSdkEventApiVersionTask_ExecuteReturn = await this.executeTask({
          epSdkTask: epSdkEventApiVersionTask,
          expectNoAction: checkmode,
        });
        /* istanbul ignore next */
        if (epSdkEventApiVersionTask_ExecuteReturn.epObject.id === undefined) throw new CliEPApiContentError(logName, "epSdkEventApiVersionTask_ExecuteReturn.epObject.id === undefined", {
          epSdkEventApiVersionTask_ExecuteReturn: epSdkEventApiVersionTask_ExecuteReturn,
        });
        eventApiVersionId = epSdkEventApiVersionTask_ExecuteReturn.epObject.id;
        CliLogger.warn(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_EP_EVENT_API_WITH_WARNING, details: {
          warning: [
            `expect epSdkTask_TransactionLogData.epSdkTask_Action = '${EEpSdkTask_Action.NO_ACTION}', instead got '${epSdkEventApiVersionTask_ExecuteReturn_Check.epSdkTask_TransactionLogData.epSdkTask_Action}'`,
            `created new event api version`,
          ],
          targetEventApiVersion: epAsyncApiDocument.getVersion(),
          createdEventApiVersion: epSdkEventApiVersionTask_ExecuteReturn
            .epObject.version
            ? epSdkEventApiVersionTask_ExecuteReturn.epObject.version
            : "undefined",
          epSdkEventApiVersionTask_ExecuteReturn:
            epSdkEventApiVersionTask_ExecuteReturn,
        }}));
        // summary
        CliRunSummary.processedEventApiVersionWithWarning({
          targetEventApiVersion: epAsyncApiDocument.getVersion(),
          targetEventApiState: this.get_EpSdkTask_StateId(),
          latestExistingEventApiVersionObjectBefore: latestExistingEventApiVersionObjectBefore,
          epSdkEventApiVersionTask_ExecuteReturn: epSdkEventApiVersionTask_ExecuteReturn,
          requestedUpdates: epSdkEventApiVersionTask_ExecuteReturn_Check.epSdkTask_TransactionLogData.epSdkTask_IsUpdateRequiredFuncReturn?.difference,
        });
      } else {
        // issue error
        const requestedUpdates: any = await CliRunExecuteReturnLog.getDeepRequestedUpdates(
          epSdkEventApiVersionTask_ExecuteReturn_Check
        );
        CliRunSummary.processedEventApiVersionWithError({
          targetEventApiVersion: epAsyncApiDocument.getVersion(),
          targetEventApiState: this.get_EpSdkTask_StateId(),
          latestExistingEventApiVersionObjectBefore: latestExistingEventApiVersionObjectBefore,
          epSdkEventApiVersionTask_ExecuteReturn: epSdkEventApiVersionTask_ExecuteReturn_Check,
          requestedUpdates: requestedUpdates,
        });
        throw new CliImporterTestRunAssetsInconsistencyError(logName, {
          requestedUpdates: requestedUpdates,
          latestExistingEventApiVersionObjectBefore: latestExistingEventApiVersionObjectBefore,
          epSdkEventApiVersionTask_ExecuteReturn: epSdkEventApiVersionTask_ExecuteReturn_Check,
        });
      }
    } else {
      // create it
      const epSdkEventApiVersionTask = new EpSdkEventApiVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: applicationDomainId,
        eventApiId: eventApiId,
        versionString: epAsyncApiDocument.getVersion(),
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        eventApiVersionSettings: {
          description: epAsyncApiDocument.getDescription(),
          displayName: epAsyncApiDocument.getTitle(),
          producedEventVersionIds: cliPubSubEventVersionIds.publishEventVersionIdList,
          consumedEventVersionIds: cliPubSubEventVersionIds.subscribeEventVersionIdList,
          stateId: this.get_EpSdkTask_StateId(),
        },
        epSdkTask_TransactionConfig: this.get_IEpSdkTask_TransactionConfig(),
        checkmode: checkmode,
      });
      const epSdkEventApiVersionTask_ExecuteReturn: IEpSdkEventApiVersionTask_ExecuteReturn = await this.executeTask({
        epSdkTask: epSdkEventApiVersionTask,
        expectNoAction: checkmode,
      });
      /* istanbul ignore next */
      if (epSdkEventApiVersionTask_ExecuteReturn.epObject.id === undefined) throw new CliEPApiContentError(logName, "epSdkEventApiVersionTask_ExecuteReturn.epObject.id === undefined", {
        epSdkEventApiVersionTask_ExecuteReturn: epSdkEventApiVersionTask_ExecuteReturn,
      });
      eventApiVersionId = epSdkEventApiVersionTask_ExecuteReturn.epObject.id;
      CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_EP_EVENT_API, details: {
        epSdkEventApiVersionTask_ExecuteReturn: epSdkEventApiVersionTask_ExecuteReturn,
      }}));
      // summary
      CliRunSummary.processedEventApiVersion({
        epSdkEventApiVersionTask_ExecuteReturn: epSdkEventApiVersionTask_ExecuteReturn,
      });
    }
    return {
      eventApiVersionId: eventApiVersionId,
    };
  };

  private run_present_event_api = async ({
    applicationDomainId,
    assetApplicationDomainId,
    epAsyncApiDocument,
    checkmode,
  }: {
    applicationDomainId: string;
    assetApplicationDomainId: string;
    epAsyncApiDocument: EpAsyncApiDocument;
    checkmode: boolean;
  }): Promise<ICliEventApiImporterRunPresentEventApiReturn> => {
    const funcName = "run_present_event_api";
    const logName = `${CliEventApiImporter.name}.${funcName}()`;

    CliLogger.debug( CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_START_API, details: {},}));

    // present event api
    const epSdkEventApiTask = new EpSdkEventApiTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: applicationDomainId,
      eventApiName: epAsyncApiDocument.getTitle(),
      eventApiObjectSettings: {
        shared: true,
        brokerType: epAsyncApiDocument.getBrokerType() as unknown as EventApi.brokerType,
      },
      epSdkTask_TransactionConfig: this.get_IEpSdkTask_TransactionConfig(),
      checkmode: checkmode,
    });
    const epSdkEventApiTask_ExecuteReturn: IEpSdkEventApiTask_ExecuteReturn = await this.executeTask({
      epSdkTask: epSdkEventApiTask,
      expectNoAction: checkmode,
    });
    CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_EP_EVENT_API, details: {
      epSdkEventApiTask_ExecuteReturn: epSdkEventApiTask_ExecuteReturn,
    }}));
    /* istanbul ignore next */
    if (epSdkEventApiTask_ExecuteReturn.epObject.id === undefined) throw new CliEPApiContentError(logName, "epSdkEventApiTask_ExecuteReturn.epObject.id === undefined", {
      epSdkEventApiTask_ExecuteReturn: epSdkEventApiTask_ExecuteReturn,
    });
    const eventApiId: string = epSdkEventApiTask_ExecuteReturn.epObject.id;

    const cliEventApiImporterRunPresentEventApiVersionReturn: ICliEventApiImporterRunPresentEventApiVersionReturn = await this.run_present_event_api_version({
      applicationDomainId: applicationDomainId,
      assetApplicationDomainId: assetApplicationDomainId,
      eventApiId: eventApiId,
      epAsyncApiDocument: epAsyncApiDocument,
      checkmode: checkmode,
    });

    return {
      eventApiId: eventApiId,
      eventApiVersionId:
        cliEventApiImporterRunPresentEventApiVersionReturn.eventApiVersionId,
    };
  };

  protected async run_present({ cliImporterRunPresentOptions, }: {
    cliImporterRunPresentOptions: ICliEventApiImporterRunPresentOptions;
  }): Promise<ICliEventApiImporterRunPresentReturn> {
    const funcName = "run_present";
    const logName = `${CliEventApiImporter.name}.${funcName}()`;

    const apiTitle: string = cliImporterRunPresentOptions.epAsyncApiDocument.getTitle();
    const apiVersion: string = cliImporterRunPresentOptions.epAsyncApiDocument.getVersion();
    const apiBrokerType: string = cliImporterRunPresentOptions.epAsyncApiDocument.getBrokerType();
    const epApplicationDomainName: string = cliImporterRunPresentOptions.epAsyncApiDocument.getApplicationDomainName();
    const epAssetApplicationDomainName: string = cliImporterRunPresentOptions.epAsyncApiDocument.getAssetsApplicationDomainName();

    const rctxt: ICliApiRunContext = {
      apiTitle: apiTitle,
      apiVersion: apiVersion,
      apiBrokerType: apiBrokerType,
      applicationDomainName: epApplicationDomainName,
      assetApplicationDomainName: epAssetApplicationDomainName,
    };
    CliRunContext.push(rctxt);
    CliRunSummary.processingApi({cliRunSummary_Api: {
      type: ECliRunSummary_Type.Api,
      apiName: apiTitle,
      apiVersion: apiVersion,
      apiBrokerType: apiBrokerType,
      applicationDomainName: epApplicationDomainName,
      assetApplicationDomain: epAssetApplicationDomainName,
    }});

    // import the assets
    const cliAssetsImporterRunPresentReturn: ICliAssetsImporterRunPresentReturn = await this.run_present_assets({ cliAssetsImporterRunPresentOptions: {
      epAsyncApiDocument: cliImporterRunPresentOptions.epAsyncApiDocument,
      checkmode: cliImporterRunPresentOptions.checkmode,
    }});

    // api application domain present
    const applicationDomainsTask = new EpSdkApplicationDomainTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainName: cliImporterRunPresentOptions.epAsyncApiDocument.getApplicationDomainName(),
      applicationDomainSettings: {
        // description: "a new description x"
      },
      epSdkTask_TransactionConfig: this.get_IEpSdkTask_TransactionConfig(),
      checkmode: cliImporterRunPresentOptions.checkmode,
    });
    const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await this.executeTask({
      epSdkTask: applicationDomainsTask,
      expectNoAction: cliImporterRunPresentOptions.checkmode,
    });
    CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_EP_APPLICATION_DOMAIN, message: "application domain", details: {
      epSdkApplicationDomainTask_ExecuteReturn: epSdkApplicationDomainTask_ExecuteReturn,
    }}));
    // create summary log
    CliRunSummary.processedApplicationDomain({
      epSdkApplicationDomainTask_ExecuteReturn: epSdkApplicationDomainTask_ExecuteReturn,
    });

    /* istanbul ignore next */
    if (epSdkApplicationDomainTask_ExecuteReturn.epObject.id === undefined) throw new CliEPApiContentError(logName, "epSdkApplicationDomainTask_ExecuteReturn.epObject.id === undefined", {
      applicationDomainObject: epSdkApplicationDomainTask_ExecuteReturn.epObject,
    });

    // present event api
    const cliEventApiImporterRunPresentEventApiReturn: ICliEventApiImporterRunPresentEventApiReturn = await this.run_present_event_api({
      applicationDomainId: epSdkApplicationDomainTask_ExecuteReturn.epObject.id,
      assetApplicationDomainId: cliAssetsImporterRunPresentReturn.assetApplicationDomainId,
      epAsyncApiDocument: cliImporterRunPresentOptions.epAsyncApiDocument,
      checkmode: cliImporterRunPresentOptions.checkmode,
    });

    const cliEventApiImporterRunPresentReturn: ICliEventApiImporterRunPresentReturn = {
      assetApplicationDomainId: cliAssetsImporterRunPresentReturn.assetApplicationDomainId,
      applicationDomainId: epSdkApplicationDomainTask_ExecuteReturn.epObject.id,
      eventApiId: cliEventApiImporterRunPresentEventApiReturn.eventApiId,
      eventApiVersionId: cliEventApiImporterRunPresentEventApiReturn.eventApiVersionId,
    };
    CliRunContext.pop();
    return cliEventApiImporterRunPresentReturn;
  }

  protected generate_assets_ouput = async ({
    cliImporterGenerateAssetsOptions,
  }: {
    cliImporterGenerateAssetsOptions: ICliEventApiImporterGenerateAssetsOptions;
  }): Promise<ICliEventApiImporterGenerateAssetsReturn> => {
    const funcName = "generate_assets_ouput";
    const logName = `${CliEventApiImporter.name}.${funcName}()`;

    const rctxt: ICliGenerateApiOutputRunContext = {
      apiFile:
        cliImporterGenerateAssetsOptions.cliEventApiImporterRunOptions.apiFile,
      applicationDomainName:
        cliImporterGenerateAssetsOptions.applicationDomainName,
      applicationDomainId: cliImporterGenerateAssetsOptions.applicationDomainId,
      eventApiId: cliImporterGenerateAssetsOptions.eventApiId,
      eventApiVersionId: cliImporterGenerateAssetsOptions.eventApiVersionId,
    };
    CliRunContext.push(rctxt);

    CliLogger.info(
      CliLogger.createLogEntry(logName, {
        code: ECliStatusCodes.GENERATING_ASSETS_OUTPUT_START,
        details: {
          cliImporterGenerateAssetsOptions: cliImporterGenerateAssetsOptions,
        },
      })
    );

    const cliEventApiImporterGenerateAssetsReturn: ICliEventApiImporterGenerateAssetsReturn =
      {
        assetOutputRootDir: undefined,
        asyncApiSpecFileNameJson: undefined,
        asyncApiSpecFileNameYaml: undefined,
        schemasOutputDir: undefined,
        error: undefined,
      };

    try {
      // retrieve the imported event api version
      const asyncApiJson: any =
        await EventApIsService.getAsyncApiForEventApiVersion({
          eventApiVersionId: cliImporterGenerateAssetsOptions.eventApiVersionId,
          format: "json",
        });
      const epAsyncApiDocument: EpAsyncApiDocument =
        await EpAsyncApiDocumentService.createFromAny({
          anySpec: asyncApiJson,
          overrideEpApplicationDomainName:
            cliImporterGenerateAssetsOptions.applicationDomainName,
          // overrideEpAssetApplicationDomainName: cliImporterGenerateAssetsOptions.assetApplicationDomainName,
          // prefixEpApplicationDomainName: cliImporterGenerateAssetsOptions.applicationDomainNamePrefix,
        });
      // calculate the asset output dir
      const applicationDomainNameAsFilePath: string =
        CliUtils.convertStringToFilePath(
          epAsyncApiDocument.getApplicationDomainName()
        );
      const apiTitleAsFilePath = epAsyncApiDocument.getTitleAsFilePath();
      const assetOutputRootDir: string = CliUtils.ensureDirExists(
        this.cliImporterOptions.assetOutputDir,
        applicationDomainNameAsFilePath + "/" + apiTitleAsFilePath
      );
      const schemasOutputDir = CliUtils.ensureDirExists(
        assetOutputRootDir,
        "schemas"
      );
      const asyncApiSpecFileNameJson =
        assetOutputRootDir +
        "/" +
        epAsyncApiDocument.getTitleAsFileName("json");
      const asyncApiSpecFileNameYaml =
        assetOutputRootDir + "/" + epAsyncApiDocument.getTitleAsFileName("yml");
      CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.GENERATING_ASSETS_OUTPUT, details: {
        applicationDomainNameAsFilePath: applicationDomainNameAsFilePath,
        apiTitleAsFilePath: apiTitleAsFilePath,
        assetOutputRootDir: assetOutputRootDir,
        schemasOutputDir: schemasOutputDir,
        asyncApiSpecFileNameJson: asyncApiSpecFileNameJson,
        asyncApiSpecFileNameYaml: asyncApiSpecFileNameYaml,
      }}));

      cliEventApiImporterGenerateAssetsReturn.assetOutputRootDir = assetOutputRootDir;
      cliEventApiImporterGenerateAssetsReturn.asyncApiSpecFileNameJson = asyncApiSpecFileNameJson;
      cliEventApiImporterGenerateAssetsReturn.asyncApiSpecFileNameYaml = asyncApiSpecFileNameYaml;
      cliEventApiImporterGenerateAssetsReturn.schemasOutputDir = schemasOutputDir;

      CliRunSummary.generatingApiOutput({ cliRunSummary_GenerateApiOutput: {
        type: ECliRunSummary_Type.ApiOutput,
        apiName: epAsyncApiDocument.getTitle(),
        apiVersion: epAsyncApiDocument.getVersion(),
        outputDir: assetOutputRootDir,
      }});

      CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.GENERATING_ASSETS_OUTPUT, details: {
        asyncApiSpecFileNameJson: asyncApiSpecFileNameJson,
        asyncApiSpecFileNameYaml: asyncApiSpecFileNameYaml,
        schemasOutputDir: schemasOutputDir,
      }}));

      CliUtils.saveContents2File({
        filePath: asyncApiSpecFileNameJson,
        content: JSON.stringify(epAsyncApiDocument.getOriginalSpecAsJson(), null, 2 ),
      });
      // save spec as yaml file
      CliUtils.saveContents2File({
        filePath: asyncApiSpecFileNameYaml,
        content: epAsyncApiDocument.getOriginalSpecAsYamlString(),
      });

      // save all channel message schemas to files
      const epAsyncApiChannelDocumentMap: T_EpAsyncApiChannelDocumentMap = epAsyncApiDocument.getEpAsyncApiChannelDocumentMap();
      for (const [topic, epAsyncApiChannelDocument ] of epAsyncApiChannelDocumentMap) {
        /* istanbul ignore next */
        topic;
        const epAsynApiChannelPublishOperation: EpAsynApiChannelPublishOperation | undefined = epAsyncApiChannelDocument.getEpAsyncApiChannelPublishOperation();
        if (epAsynApiChannelPublishOperation !== undefined) {
          const epAsyncApiMessageDocument: EpAsyncApiMessageDocument = epAsynApiChannelPublishOperation.getEpAsyncApiMessageDocument();
          if(epAsyncApiMessageDocument.getContentType() !== E_EpAsyncApiContentTypes.APPLICATION_JSON)
            throw new CliAsyncApiSpecFeatureNotSupportedError(logName, "unsupported message content type", {
              messageName: epAsyncApiMessageDocument.getMessageName(),
              contentType: epAsyncApiMessageDocument.getContentType(),
              supportedContentTypes:
                epAsyncApiDocument.getSupportedContentTypes(),
            });

          const schemaFilePath = schemasOutputDir + "/" + CliUtils.convertStringToFilePath(epAsyncApiMessageDocument.getSchemaFileName());
          CliUtils.saveContents2File({
            filePath: schemaFilePath,
            content: JSON.stringify(epAsyncApiMessageDocument.getSchemaAsSanitizedJson(), null, 2),
          });
        }
        const epAsyncApiChannelSubscribeOperation: EpAsyncApiChannelSubscribeOperation | undefined = epAsyncApiChannelDocument.getEpAsyncApiChannelSubscribeOperation();
        if (epAsyncApiChannelSubscribeOperation !== undefined) {
          const epAsyncApiMessageDocument: EpAsyncApiMessageDocument = epAsyncApiChannelSubscribeOperation.getEpAsyncApiMessageDocument();
          if (epAsyncApiMessageDocument.getContentType() !== E_EpAsyncApiContentTypes.APPLICATION_JSON)
            throw new CliAsyncApiSpecFeatureNotSupportedError(logName, "unsupported message content type", {
              messageName: epAsyncApiMessageDocument.getMessageName(),
              contentType: epAsyncApiMessageDocument.getContentType(),
              supportedContentTypes:
                epAsyncApiDocument.getSupportedContentTypes(),
            });

          const schemaFilePath = schemasOutputDir + "/" + CliUtils.convertStringToFilePath(epAsyncApiMessageDocument.getSchemaFileName());
          CliUtils.saveContents2File({
            filePath: schemaFilePath,
            content: JSON.stringify(epAsyncApiMessageDocument.getSchemaAsSanitizedJson(), null, 2),
          });
        }
      }

      CliLogger.info(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.GENERATING_ASSETS_OUTPUT_DONE, details: {
        cliEventApiImporterGenerateAssetsReturn: cliEventApiImporterGenerateAssetsReturn,
      }}));
    } catch (e: any) {
      cliEventApiImporterGenerateAssetsReturn.error =
        CliErrorFactory.createCliError({
          logName: logName,
          e: e,
        });
    } finally {
      if (cliEventApiImporterGenerateAssetsReturn.error !== undefined) {
        CliLogger.error(
          CliLogger.createLogEntry(logName, {
            code: ECliStatusCodes.GENERATING_ASSETS_OUTPUT_ERROR,
            details: {
              error: cliEventApiImporterGenerateAssetsReturn.error,
            },
          })
        );
      }
      CliRunContext.pop();
      //eslint-disable-next-line
      return cliEventApiImporterGenerateAssetsReturn;
    }
  };

  public async run_import({ cliImporterRunOptions, }: {
    cliImporterRunOptions: ICliEventApiImporterRunOptions;
  }): Promise<ICliEventApiImporterRunImportReturn> {
    const funcName = "run_import";
    const logName = `${CliEventApiImporter.name}.${funcName}()`;

    CliLogger.debug(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_START_API, details: {
      cliImporterRunOptions: cliImporterRunOptions,
    }}));

    const cliEventApiImporterRunImportReturn: ICliEventApiImporterRunImportReturn = {
      apiTitle: "undefined",
      applicationDomainId: "undefined",
      eventApiId: "undefined",
      eventApiVersionId: "undefined",
      applicationDomainName: undefined,
      assetApplicationDomainName: undefined,
      error: undefined,
    };

    try {
      const epAsyncApiDocument: EpAsyncApiDocument = await CliAsyncApiDocumentService.parse_and_validate({
        apiFile: cliImporterRunOptions.apiFile,
        applicationDomainName: cliImporterRunOptions.applicationDomainName,
        assetApplicationDomainName: cliImporterRunOptions.assetApplicationDomainName,
        applicationDomainNamePrefix: cliImporterRunOptions.applicationDomainNamePrefix,
        overrideBrokerType: cliImporterRunOptions.overrideBrokerType,
        overrideChannelDelimiter: cliImporterRunOptions.overrideChannelDelimiter
      });
      cliEventApiImporterRunImportReturn.apiTitle = epAsyncApiDocument.getTitle();
      cliEventApiImporterRunImportReturn.applicationDomainName = epAsyncApiDocument.getApplicationDomainName();
      cliEventApiImporterRunImportReturn.assetApplicationDomainName = epAsyncApiDocument.getAssetsApplicationDomainName();

      const cliEventApiImporterRunPresentReturn: ICliEventApiImporterRunPresentReturn = await this.run_present({ cliImporterRunPresentOptions: {
        epAsyncApiDocument: epAsyncApiDocument,
        checkmode: cliImporterRunOptions.checkmode,
      }});
      cliEventApiImporterRunImportReturn.applicationDomainId = cliEventApiImporterRunPresentReturn.applicationDomainId;
      cliEventApiImporterRunImportReturn.eventApiId = cliEventApiImporterRunPresentReturn.eventApiId;
      cliEventApiImporterRunImportReturn.eventApiVersionId = cliEventApiImporterRunPresentReturn.eventApiVersionId;

      CliLogger.debug(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_DONE_API, details: {
        cliEventApiImporterRunPresentReturn: cliEventApiImporterRunPresentReturn,
      }}));
    } catch (e: any) {
      cliEventApiImporterRunImportReturn.error = CliErrorFactory.createCliError({logName: logName, e: e,});
    } finally {
      if (cliEventApiImporterRunImportReturn.error !== undefined) {
        CliLogger.error(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_ERROR_API, details: {
          error: cliEventApiImporterRunImportReturn.error,
        }}));
      }
      //eslint-disable-next-line
      return cliEventApiImporterRunImportReturn;
    }
  }

  public async run({ cliImporterRunOptions, }: {
    cliImporterRunOptions: ICliEventApiImporterRunOptions;
  }): Promise<ICliEventApiImporterRunReturn> {
    // const funcName = 'run';
    // const logName = `${CliEventApiImporter.name}.${funcName}()`;

    const cliEventApiImporterRunImportReturn: ICliEventApiImporterRunImportReturn = await this.run_import({ cliImporterRunOptions: cliImporterRunOptions, });

    if (cliEventApiImporterRunImportReturn.error !== undefined) return {
        ...cliEventApiImporterRunImportReturn,
        cliEventApiImporterGenerateAssetsReturn: {
          assetOutputRootDir: undefined,
          asyncApiSpecFileNameJson: undefined,
          asyncApiSpecFileNameYaml: undefined,
          schemasOutputDir: undefined,
          error: undefined,
        },
      };
    if (cliImporterRunOptions.generateAssetsOutput) {
      const cliEventApiImporterGenerateAssetsReturn: ICliEventApiImporterGenerateAssetsReturn =
        await this.generate_assets_ouput({ cliImporterGenerateAssetsOptions: {
            cliEventApiImporterRunOptions: cliImporterRunOptions,
            eventApiId: cliEventApiImporterRunImportReturn.eventApiId,
            eventApiVersionId:
              cliEventApiImporterRunImportReturn.eventApiVersionId,
            applicationDomainId:
              cliEventApiImporterRunImportReturn.applicationDomainId,
            applicationDomainName:
              cliEventApiImporterRunImportReturn.applicationDomainName,
            apiTitle: cliEventApiImporterRunImportReturn.apiTitle,
          },
        });
      return {
        ...cliEventApiImporterRunImportReturn,
        error: cliEventApiImporterGenerateAssetsReturn.error,
        cliEventApiImporterGenerateAssetsReturn:
          cliEventApiImporterGenerateAssetsReturn,
      };
    }
    return {
      ...cliEventApiImporterRunImportReturn,
      cliEventApiImporterGenerateAssetsReturn: {
        assetOutputRootDir: undefined,
        asyncApiSpecFileNameJson: undefined,
        asyncApiSpecFileNameYaml: undefined,
        schemasOutputDir: undefined,
        error: undefined,
      },
    };
  }
}
