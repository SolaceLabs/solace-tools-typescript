import { 
  Application, 
  ApplicationsService, 
  ApplicationVersion 
} from "@solace-labs/ep-openapi-node";
import { 
  EpAsynApiChannelPublishOperation, 
  EpAsyncApiChannelSubscribeOperation, 
  EpAsyncApiDocument, 
  EpAsyncApiDocumentService, 
  EpAsyncApiMessageDocument, 
  E_EpAsyncApiContentTypes, 
  T_EpAsyncApiChannelDocumentMap 
} from "@solace-labs/ep-asyncapi";
import {
  EEpSdkTask_Action,
  EEpSdkTask_TargetState,
  EEpSdk_VersionTaskStrategy,
  EpSdkApplicationDomainTask,
  EpSdkApplicationTask,
  EpSdkApplicationVersionsService,
  EpSdkApplicationVersionTask,
  IEpSdkApplicationDomainTask_ExecuteReturn,
  IEpSdkApplicationTask_ExecuteReturn,
  IEpSdkApplicationVersionTask_ExecuteReturn,
} from "@solace-labs/ep-sdk";
import {
  CliEPApiContentError,
  CliErrorFactory,
  CliInternalCodeInconsistencyError,
  CliLogger,
  ECliStatusCodes,
  ECliRunContext_RunMode,
  CliRunContext,
  CliRunSummary,
  ECliRunSummary_Type,
  ICliGenerateApiOutputRunContext,
  CliUtils,
  CliAsyncApiSpecFeatureNotSupportedError,
  ICliApiRunContext,
  CliRunExecuteReturnLog,
  CliImporterTestRunAssetsInconsistencyError,
} from "../cli-components";
import {
  CliAsyncApiDocumentService,
  CliEPStatesService,
  ICliPubSubEventVersionIds,
} from "../services";
import {
  ICliImporterGenerateAssetsOptions,
  ICliImporterGenerateAssetsReturn,
  ICliImporterOptions,
  ICliImporterRunPresentOptions,
} from "./CliImporter";
import { 
  CliAssetsImporter,
  ICliAssetsImporterRunOptions, 
  ICliAssetsImporterRunPresentReturn, 
  ICliAssetsImporterRunReturn 
} from "./CliAssetsImporter";

export interface ICliApplicationImporterOptions extends ICliImporterOptions {}
export interface ICliApplicationImporterGenerateAssetsOptions extends ICliImporterGenerateAssetsOptions {
  cliApplicationImporterRunOptions: ICliApplicationImporterRunOptions;
  applicationDomainId: string;
  applicationId: string;
  applicationVersionId: string;
  applicationDomainName?: string;
  apiTitle?: string;
}
export interface ICliApplicationImporterRunPresentOptions extends ICliImporterRunPresentOptions {
  epAsyncApiDocument: EpAsyncApiDocument;
  cliAssetsImporterRunPresentReturn: ICliAssetsImporterRunPresentReturn | undefined;
}
export interface ICliApplicationImporterRunPresentReturn extends ICliAssetsImporterRunPresentReturn {
  applicationDomainId: string;
  applicationId: string;
  applicationVersionId: string;
}
export interface ICliApplicationImporterRunOptions extends ICliAssetsImporterRunOptions {
  generateAssetsOutput: boolean;
  cliAssetsImporterRunPresentReturn: ICliAssetsImporterRunPresentReturn | undefined;
}
export interface ICliApplicationImporterGenerateAssetsReturn extends ICliImporterGenerateAssetsReturn {
  assetOutputRootDir: string | undefined;
  asyncApiSpecFileNameJson: string | undefined;
  asyncApiSpecFileNameYaml: string | undefined;
  schemasOutputDir: string | undefined;
}
export interface ICliApplicationImporterRunReturn extends ICliAssetsImporterRunReturn {
  cliApplicationImporterGenerateAssetsReturn: ICliApplicationImporterGenerateAssetsReturn;
}
export interface ICliApplicationImporterRunPresentApplicationReturn {
  applicationId: string;
  applicationVersionId: string;
}
export interface ICliApplicationImporterRunPresentApplicationVersionReturn {
  applicationVersionId: string;
}

export interface ICliApplicationImporterRunImportReturn extends ICliAssetsImporterRunReturn {
  apiTitle: string;
  applicationDomainId: string;
  applicationId: string;
  applicationVersionId: string;
}

export class CliApplicationImporter extends CliAssetsImporter {

  constructor(cliApplicationImporterOptions: ICliApplicationImporterOptions, runMode: ECliRunContext_RunMode) {
    super(cliApplicationImporterOptions, runMode);
  }

  protected generate_assets_ouput = async({ cliImporterGenerateAssetsOptions }: {
    cliImporterGenerateAssetsOptions: ICliApplicationImporterGenerateAssetsOptions;
  }): Promise<ICliApplicationImporterGenerateAssetsReturn> => {
    const funcName = "generate_assets_ouput";
    const logName = `${CliApplicationImporter.name}.${funcName}()`;

    cliImporterGenerateAssetsOptions
    const rctxt: ICliGenerateApiOutputRunContext = {
      apiFile: cliImporterGenerateAssetsOptions.cliApplicationImporterRunOptions.apiFile,
      applicationDomainName: cliImporterGenerateAssetsOptions.applicationDomainName,
      applicationDomainId: cliImporterGenerateAssetsOptions.applicationDomainId,
      eventApiId: cliImporterGenerateAssetsOptions.applicationId,
      eventApiVersionId: cliImporterGenerateAssetsOptions.applicationVersionId,
    };
    CliRunContext.push(rctxt);
    CliLogger.info(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.GENERATING_ASSETS_OUTPUT_START, details: {
      cliImporterGenerateAssetsOptions: cliImporterGenerateAssetsOptions,
    }}));

    const cliApplicationImporterGenerateAssetsReturn: ICliApplicationImporterGenerateAssetsReturn = {
      assetOutputRootDir: undefined,
      asyncApiSpecFileNameJson: undefined,
      asyncApiSpecFileNameYaml: undefined,
      schemasOutputDir: undefined,
      error: undefined,
    };
    try {
      // retrieve the imported application version
      const asyncApiJson: any = await ApplicationsService.getAsyncApiForApplicationVersion({
        applicationVersionId: cliImporterGenerateAssetsOptions.applicationVersionId,
        format: "json",
      });
      const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromAny({
        anySpec: asyncApiJson,
        overrideEpApplicationDomainName: cliImporterGenerateAssetsOptions.applicationDomainName,
        // overrideEpAssetApplicationDomainName: cliImporterGenerateAssetsOptions.assetApplicationDomainName,
        // prefixEpApplicationDomainName: cliImporterGenerateAssetsOptions.applicationDomainNamePrefix,
      });
      // calculate the asset output dir
      const applicationDomainNameAsFilePath: string = CliUtils.convertStringToFilePath(epAsyncApiDocument.getApplicationDomainName());
      const apiTitleAsFilePath = epAsyncApiDocument.getEpApiNameAsFilePath();
      const assetOutputRootDir: string = CliUtils.ensureDirExists(
        this.cliImporterOptions.assetOutputDir,
        applicationDomainNameAsFilePath + "/" + apiTitleAsFilePath
      );
      const schemasOutputDir = CliUtils.ensureDirExists(assetOutputRootDir, "schemas");
      const asyncApiSpecFileNameJson = assetOutputRootDir + "/" + epAsyncApiDocument.getEpApiNameAsFileName("json");
      const asyncApiSpecFileNameYaml = assetOutputRootDir + "/" + epAsyncApiDocument.getEpApiNameAsFileName("yml");
      CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.GENERATING_ASSETS_OUTPUT, details: {
        applicationDomainNameAsFilePath: applicationDomainNameAsFilePath,
        apiTitleAsFilePath: apiTitleAsFilePath,
        assetOutputRootDir: assetOutputRootDir,
        schemasOutputDir: schemasOutputDir,
        asyncApiSpecFileNameJson: asyncApiSpecFileNameJson,
        asyncApiSpecFileNameYaml: asyncApiSpecFileNameYaml,
      }}));

      cliApplicationImporterGenerateAssetsReturn.assetOutputRootDir = assetOutputRootDir;
      cliApplicationImporterGenerateAssetsReturn.asyncApiSpecFileNameJson = asyncApiSpecFileNameJson;
      cliApplicationImporterGenerateAssetsReturn.asyncApiSpecFileNameYaml = asyncApiSpecFileNameYaml;
      cliApplicationImporterGenerateAssetsReturn.schemasOutputDir = schemasOutputDir;

      CliRunSummary.generatingApiOutput({ cliRunSummary_GenerateApiOutput: {
        type: ECliRunSummary_Type.ApiOutput,
        apiName: epAsyncApiDocument.getEpApiName(),
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
            /* istanbul ignore next */
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
            /* istanbul ignore next */
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
        cliApplicationImporterGenerateAssetsReturn: cliApplicationImporterGenerateAssetsReturn,
      }}));
    } catch (e: any) {
      /* istanbul ignore next */
      cliApplicationImporterGenerateAssetsReturn.error = CliErrorFactory.createCliError({ logName: logName, error: e });
    } finally {
      if (cliApplicationImporterGenerateAssetsReturn.error !== undefined) {
        /* istanbul ignore next */
        CliLogger.error(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.GENERATING_ASSETS_OUTPUT_ERROR, details: {
          error: cliApplicationImporterGenerateAssetsReturn.error,
        }}));
      }
      CliRunContext.pop();
      //eslint-disable-next-line
      return cliApplicationImporterGenerateAssetsReturn;
    }
  };

  private run_present_application_version = async ({ applicationDomainId, assetApplicationDomainId, applicationId, epAsyncApiDocument, checkmode }: {
    applicationDomainId: string;
    assetApplicationDomainId: string;
    applicationId: string;
    epAsyncApiDocument: EpAsyncApiDocument;
    checkmode: boolean;
  }): Promise<ICliApplicationImporterRunPresentApplicationVersionReturn> => {
    const funcName = "run_present_application_version";
    const logName = `${CliApplicationImporter.name}.${funcName}()`;
    // get latest version as reference
    const latestExistingApplicationVersionObjectBefore: ApplicationVersion | undefined = await EpSdkApplicationVersionsService.getLatestVersionForApplicationName({
      applicationDomainId: applicationDomainId,
      applicationName: epAsyncApiDocument.getEpApiName(),
    });
    // const latestExistingApplicationVersionString: string | undefined = latestExistingApplicationVersionObjectBefore?.version;
    // get the list of pub and sub events
    const cliPubSubEventVersionIds: ICliPubSubEventVersionIds = await this.get_pub_sub_event_version_ids({
      applicationDomainId: assetApplicationDomainId,
      epAsyncApiDocument: epAsyncApiDocument,
    });
    // const rctxtVersion: ICliAsyncApiRunContext_ApplicationVersion = {
    //   epTargetApplicationVersion: epAsyncApiDocument.getVersion(),
    //   epLatestExistingApplicationVersion: latestExistingApplicationVersionString
    // };
    // CliRunContext.updateContext({ runContext: rctxtVersion });

    // because of exact version, test first and add to summary
    const epSdkApplicationVersionTask_Check = new EpSdkApplicationVersionTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: applicationDomainId,
      applicationId: applicationId,
      versionString: epAsyncApiDocument.getVersion(),
      versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
      applicationVersionSettings: {
        description: epAsyncApiDocument.getDescription(),
        displayName: epAsyncApiDocument.getEpApiVersionName(),
        stateId: epAsyncApiDocument.getEpStateId(CliEPStatesService.getEpAsyncApiStateId(this.cliImporterOptions.cliImport_DefaultStateName)),
        declaredConsumedEventVersionIds: cliPubSubEventVersionIds.publishEventVersionIdList,
        declaredProducedEventVersionIds: cliPubSubEventVersionIds.subscribeEventVersionIdList,
      },
      epSdkTask_TransactionConfig: this.get_IEpSdkTask_TransactionConfig(),
      checkmode: true,
    });
    const epSdkApplicationVersionTask_ExecuteReturn_Check: IEpSdkApplicationVersionTask_ExecuteReturn = await this.executeTask({
      epSdkTask: epSdkApplicationVersionTask_Check,
      expectNoAction: false,
    });
    CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_EP_APPLICATION_VERSION_CHECK, details: {
      epSdkApplicationVersionTask_ExecuteReturn_Check: epSdkApplicationVersionTask_ExecuteReturn_Check,
    }}));
    CliRunSummary.processingStartApplicationVersion({
      latestExistingApplicationVersionObjectBefore: latestExistingApplicationVersionObjectBefore,
      exactTargetVersion: epAsyncApiDocument.getVersion(),
      epSdkApplicationVersionTask_ExecuteReturn_Check: epSdkApplicationVersionTask_ExecuteReturn_Check,
    });

    let applicationVersionId: string;
    if(epSdkApplicationVersionTask_ExecuteReturn_Check.epSdkTask_TransactionLogData.epSdkTask_Action === EEpSdkTask_Action.WOULD_FAIL_CREATE_NEW_VERSION_ON_EXACT_VERSION_REQUIREMENT) {
      // different strategies for release mode and test mode
      // release_mode: warning
      // test_mode: error
      if(latestExistingApplicationVersionObjectBefore === undefined) throw new CliInternalCodeInconsistencyError(logName, {
        message: "latestExistingApplicationVersionObjectBefore === undefined",
        applicationDomainId: applicationDomainId,
        applicationName: epAsyncApiDocument.getEpApiName(),
      });
      if(CliRunContext.get().runMode === ECliRunContext_RunMode.RELEASE) {
        // create application version and issue warning
        const epSdkApplicationVersionTask = new EpSdkApplicationVersionTask({
          epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
          applicationDomainId: applicationDomainId,
          applicationId: applicationId,
          versionString: epAsyncApiDocument.getVersion(),
          versionStrategy: EEpSdk_VersionTaskStrategy.BUMP_PATCH,
          applicationVersionSettings: {
            description: epAsyncApiDocument.getDescription(),
            displayName: epAsyncApiDocument.getEpApiVersionName(),
            stateId: epAsyncApiDocument.getEpStateId(CliEPStatesService.getEpAsyncApiStateId(this.cliImporterOptions.cliImport_DefaultStateName)),
            declaredConsumedEventVersionIds: cliPubSubEventVersionIds.publishEventVersionIdList,
            declaredProducedEventVersionIds: cliPubSubEventVersionIds.subscribeEventVersionIdList,
          },
          epSdkTask_TransactionConfig: this.get_IEpSdkTask_TransactionConfig(),
          checkmode: checkmode,
        });
        const epSdkApplicationVersionTask_ExecuteReturn: IEpSdkApplicationVersionTask_ExecuteReturn = await this.executeTask({
          epSdkTask: epSdkApplicationVersionTask,
          expectNoAction: checkmode,
        });
        /* istanbul ignore next */
        if(epSdkApplicationVersionTask_ExecuteReturn.epObject.id === undefined) throw new CliEPApiContentError(logName, "epSdkApplicationVersionTask_ExecuteReturn.epObject.id === undefined", {
          epSdkApplicationVersionTask_ExecuteReturn: epSdkApplicationVersionTask_ExecuteReturn,
        });
        applicationVersionId = epSdkApplicationVersionTask_ExecuteReturn.epObject.id;
        CliLogger.warn(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_EP_EVENT_API_WITH_WARNING, details: {
          warning: [
            `expect epSdkTask_TransactionLogData.epSdkTask_Action = '${EEpSdkTask_Action.NO_ACTION}', instead got '${epSdkApplicationVersionTask_ExecuteReturn_Check.epSdkTask_TransactionLogData.epSdkTask_Action}'`,
            `created new application version`,
          ],
          targetEventApiVersion: epAsyncApiDocument.getVersion(),
          createdEventApiVersion: epSdkApplicationVersionTask_ExecuteReturn.epObject.version ? epSdkApplicationVersionTask_ExecuteReturn.epObject.version : "undefined",
          epSdkApplicationVersionTask_ExecuteReturn: epSdkApplicationVersionTask_ExecuteReturn,
        }}));
        // summary
        CliRunSummary.processedApplicationVersionWithWarning({
          targetApplicationVersion: epAsyncApiDocument.getVersion(),
          targetApplicationState: epAsyncApiDocument.getEpStateId(CliEPStatesService.getEpAsyncApiStateId(this.cliImporterOptions.cliImport_DefaultStateName)),
          latestExistingApplicationVersionObjectBefore: latestExistingApplicationVersionObjectBefore,
          epSdkApplicationVersionTask_ExecuteReturn: epSdkApplicationVersionTask_ExecuteReturn,
          requestedUpdates: epSdkApplicationVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_IsUpdateRequiredFuncReturn?.difference,
        })
      } else {
        // issue error
        const requestedUpdates: any = await CliRunExecuteReturnLog.getDeepRequestedUpdates(epSdkApplicationVersionTask_ExecuteReturn_Check);
        CliRunSummary.processedApplicationVersionWithError({
          targetApplicationVersion: epAsyncApiDocument.getVersion(),
          targetApplicationState: epAsyncApiDocument.getEpStateId(CliEPStatesService.getEpAsyncApiStateId(this.cliImporterOptions.cliImport_DefaultStateName)),
          latestExistingApplicationVersionObjectBefore: latestExistingApplicationVersionObjectBefore,
          epSdkApplicationVersionTask_ExecuteReturn: epSdkApplicationVersionTask_ExecuteReturn_Check,
          requestedUpdates: requestedUpdates,
        });
        throw new CliImporterTestRunAssetsInconsistencyError(logName, {
          applicationDomainName: epAsyncApiDocument.getApplicationDomainName(),
          eventApiName: epAsyncApiDocument.getEpApiName(),
          requestedUpdates: requestedUpdates,
          latestExistingApplicationVersionObjectBefore: latestExistingApplicationVersionObjectBefore,
          epSdkApplicationVersionTask_ExecuteReturn: epSdkApplicationVersionTask_ExecuteReturn_Check,
        });
      }
    } else {
      // create version
      const epSdkApplicationVersionTask = new EpSdkApplicationVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: applicationDomainId,
        applicationId: applicationId,
        versionString: epAsyncApiDocument.getVersion(),
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        applicationVersionSettings: {
          description: epAsyncApiDocument.getDescription(),
          displayName: epAsyncApiDocument.getEpApiVersionName(),
          stateId: epAsyncApiDocument.getEpStateId(CliEPStatesService.getEpAsyncApiStateId(this.cliImporterOptions.cliImport_DefaultStateName)),
          declaredConsumedEventVersionIds: cliPubSubEventVersionIds.publishEventVersionIdList,
          declaredProducedEventVersionIds: cliPubSubEventVersionIds.subscribeEventVersionIdList,
        },
        epSdkTask_TransactionConfig: this.get_IEpSdkTask_TransactionConfig(),
        checkmode: checkmode,
      });
      const epSdkApplicationVersionTask_ExecuteReturn: IEpSdkApplicationVersionTask_ExecuteReturn = await this.executeTask({
        epSdkTask: epSdkApplicationVersionTask,
        expectNoAction: checkmode,
      });
      /* istanbul ignore next */
      if (epSdkApplicationVersionTask_ExecuteReturn.epObject.id === undefined) throw new CliEPApiContentError(logName, "epSdkApplicationVersionTask_ExecuteReturn.epObject.id === undefined", {
        epSdkApplicationVersionTask_ExecuteReturn: epSdkApplicationVersionTask_ExecuteReturn,
      });
      applicationVersionId = epSdkApplicationVersionTask_ExecuteReturn.epObject.id;
      CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_EP_APPLICATION, details: {
        epSdkApplicationVersionTask_ExecuteReturn: epSdkApplicationVersionTask_ExecuteReturn,
      }}));
      // summary
      CliRunSummary.processedApplicationVersion({epSdkApplicationVersionTask_ExecuteReturn: epSdkApplicationVersionTask_ExecuteReturn });
    }
    return {
      applicationVersionId: applicationVersionId
    }
  };

  private run_present_application = async ({ applicationDomainId, assetApplicationDomainId, epAsyncApiDocument, checkmode }: {
    applicationDomainId: string;
    assetApplicationDomainId: string;
    epAsyncApiDocument: EpAsyncApiDocument;
    checkmode: boolean;
  }): Promise<ICliApplicationImporterRunPresentApplicationReturn> => {
    const funcName = "run_present_application";
    const logName = `${CliApplicationImporter.name}.${funcName}()`;

    CliLogger.debug(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_START_APPLICATION, details: {} }));

    // present application
    const epSdkApplicationTask = new EpSdkApplicationTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: applicationDomainId,
      applicationName: epAsyncApiDocument.getEpApiName(),
      applicationObjectSettings: {
        applicationType: "standard",
        brokerType: epAsyncApiDocument.getBrokerType() as unknown as Application.brokerType
      },
      epSdkTask_TransactionConfig: this.get_IEpSdkTask_TransactionConfig(),
      checkmode: checkmode,
    });
    const epSdkApplicationTask_ExecuteReturn: IEpSdkApplicationTask_ExecuteReturn = await this.executeTask({epSdkTask: epSdkApplicationTask, expectNoAction: checkmode });
    CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_EP_APPLICATION, details: { epSdkApplicationTask_ExecuteReturn: epSdkApplicationTask_ExecuteReturn }}));
    /* istanbul ignore next */
    if (epSdkApplicationTask_ExecuteReturn.epObject.id === undefined) throw new CliEPApiContentError(logName, "epSdkApplicationTask_ExecuteReturn.epObject.id === undefined", {
      epSdkApplicationTask_ExecuteReturn: epSdkApplicationTask_ExecuteReturn,
    });
    const applicationId: string = epSdkApplicationTask_ExecuteReturn.epObject.id;
    const cliApplicationImporterRunPresentApplicationVersionReturn: ICliApplicationImporterRunPresentApplicationVersionReturn = await this.run_present_application_version({
      applicationDomainId: applicationDomainId,
      assetApplicationDomainId: assetApplicationDomainId,
      applicationId: applicationId,
      epAsyncApiDocument: epAsyncApiDocument,
      checkmode: checkmode,
    });
    return {
      applicationId: applicationId,
      applicationVersionId: cliApplicationImporterRunPresentApplicationVersionReturn.applicationVersionId,
    };
  };

  protected async run_present({ cliImporterRunPresentOptions }: {
    cliImporterRunPresentOptions: ICliApplicationImporterRunPresentOptions;
  }): Promise<ICliApplicationImporterRunPresentReturn> {
    const funcName = "run_present";
    const logName = `${CliApplicationImporter.name}.${funcName}()`;

    const apiTitle: string = cliImporterRunPresentOptions.epAsyncApiDocument.getEpApiName();
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
    if(cliImporterRunPresentOptions.cliAssetsImporterRunPresentReturn === undefined) {
      cliImporterRunPresentOptions.cliAssetsImporterRunPresentReturn = await this.run_present_assets({ cliAssetsImporterRunPresentOptions: {
        epAsyncApiDocument: cliImporterRunPresentOptions.epAsyncApiDocument,
        checkmode: cliImporterRunPresentOptions.checkmode,
      }});  
    }
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
    CliRunSummary.processedApplicationDomain({ epSdkApplicationDomainTask_ExecuteReturn: epSdkApplicationDomainTask_ExecuteReturn });
    /* istanbul ignore next */
    if (epSdkApplicationDomainTask_ExecuteReturn.epObject.id === undefined) throw new CliEPApiContentError(logName, "epSdkApplicationDomainTask_ExecuteReturn.epObject.id === undefined", {
      applicationDomainObject: epSdkApplicationDomainTask_ExecuteReturn.epObject,
    });
    
    // present application
    const cliApplicationImporterRunPresentApplicationReturn: ICliApplicationImporterRunPresentApplicationReturn = await this.run_present_application({
      applicationDomainId: epSdkApplicationDomainTask_ExecuteReturn.epObject.id,
      assetApplicationDomainId: cliImporterRunPresentOptions.cliAssetsImporterRunPresentReturn.assetApplicationDomainId,
      epAsyncApiDocument: cliImporterRunPresentOptions.epAsyncApiDocument,
      checkmode: cliImporterRunPresentOptions.checkmode,
    });

    const cliApplicationImporterRunPresentReturn: ICliApplicationImporterRunPresentReturn = {
      assetApplicationDomainId: cliImporterRunPresentOptions.cliAssetsImporterRunPresentReturn.assetApplicationDomainId,
      applicationDomainId: epSdkApplicationDomainTask_ExecuteReturn.epObject.id,
      applicationId: cliApplicationImporterRunPresentApplicationReturn.applicationId,
      applicationVersionId: cliApplicationImporterRunPresentApplicationReturn.applicationVersionId,
    };
    CliRunContext.pop();
    return cliApplicationImporterRunPresentReturn;
}

  public async run_import({ cliImporterRunOptions, }: {
    cliImporterRunOptions: ICliApplicationImporterRunOptions;
  }): Promise<ICliApplicationImporterRunImportReturn> {
    const funcName = "run_import";
    const logName = `${CliApplicationImporter.name}.${funcName}()`;

    CliLogger.debug(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_START_API, details: {
      cliImporterRunOptions: cliImporterRunOptions,
    }}));

    const cliApplicationImporterRunImportReturn: ICliApplicationImporterRunImportReturn = {
      apiTitle: "undefined",
      applicationDomainId: "undefined",
      applicationId: "undefined",
      applicationVersionId: "undefined",
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
        overrideChannelDelimiter: cliImporterRunOptions.overrideChannelDelimiter,
        validateBestPractices: this.cliImporterOptions.cliValidateApiSpecBestPractices,
      });
      cliApplicationImporterRunImportReturn.apiTitle = epAsyncApiDocument.getEpApiName();
      cliApplicationImporterRunImportReturn.applicationDomainName = epAsyncApiDocument.getApplicationDomainName();
      cliApplicationImporterRunImportReturn.assetApplicationDomainName = epAsyncApiDocument.getAssetsApplicationDomainName();
      
      const cliApplicationImporterRunPresentReturn: ICliApplicationImporterRunPresentReturn = await this.run_present({ cliImporterRunPresentOptions: {
        epAsyncApiDocument: epAsyncApiDocument,
        checkmode: cliImporterRunOptions.checkmode,
        cliAssetsImporterRunPresentReturn: cliImporterRunOptions.cliAssetsImporterRunPresentReturn
      }});
      cliApplicationImporterRunImportReturn.applicationDomainId = cliApplicationImporterRunPresentReturn.applicationDomainId;
      cliApplicationImporterRunImportReturn.applicationId = cliApplicationImporterRunPresentReturn.applicationId;
      cliApplicationImporterRunImportReturn.applicationVersionId = cliApplicationImporterRunPresentReturn.applicationVersionId;

      CliLogger.debug(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_DONE_API, details: {
        cliApplicationImporterRunPresentReturn: cliApplicationImporterRunPresentReturn,
      }}));
    } catch (e: any) {
      cliApplicationImporterRunImportReturn.error = CliErrorFactory.createCliError({logName: logName, error: e,});
    } finally {
      if (cliApplicationImporterRunImportReturn.error !== undefined) {
        CliLogger.error(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_ERROR_API, details: { error: cliApplicationImporterRunImportReturn.error }}));
      }
      //eslint-disable-next-line
      return cliApplicationImporterRunImportReturn;
    }
  }

  public async run({cliImporterRunOptions}: {
    cliImporterRunOptions: ICliApplicationImporterRunOptions;
  }): Promise<ICliApplicationImporterRunReturn> {
    // const funcName = "run";
    // const logName = `${CliApplicationImporter.name}.${funcName}()`;

    cliImporterRunOptions.cliAssetsImporterRunPresentReturn?.assetApplicationDomainId

    const cliApplicationImporterRunImportReturn: ICliApplicationImporterRunImportReturn = await this.run_import({ cliImporterRunOptions: cliImporterRunOptions, });
    if(cliApplicationImporterRunImportReturn.error !== undefined) return {
      ...cliApplicationImporterRunImportReturn,
      cliApplicationImporterGenerateAssetsReturn: {
        assetOutputRootDir: undefined,
        asyncApiSpecFileNameJson: undefined,
        asyncApiSpecFileNameYaml: undefined,
        schemasOutputDir: undefined,
        error: undefined,
    }};
    if (cliImporterRunOptions.generateAssetsOutput) {
      const cliApplicationImporterGenerateAssetsReturn: ICliApplicationImporterGenerateAssetsReturn = await this.generate_assets_ouput({ cliImporterGenerateAssetsOptions: {
        cliApplicationImporterRunOptions: cliImporterRunOptions,
        applicationId: cliApplicationImporterRunImportReturn.applicationId,
        applicationVersionId: cliApplicationImporterRunImportReturn.applicationVersionId,
        applicationDomainId: cliApplicationImporterRunImportReturn.applicationDomainId,
        applicationDomainName: cliApplicationImporterRunImportReturn.applicationDomainName,
        apiTitle: cliApplicationImporterRunImportReturn.apiTitle,
      }});
      return {
        ...cliApplicationImporterRunImportReturn,
        error: cliApplicationImporterGenerateAssetsReturn.error,
        cliApplicationImporterGenerateAssetsReturn: cliApplicationImporterGenerateAssetsReturn,
      };
    }
    return {
      ...cliApplicationImporterRunImportReturn,
      cliApplicationImporterGenerateAssetsReturn: {
        assetOutputRootDir: undefined,
        asyncApiSpecFileNameJson: undefined,
        asyncApiSpecFileNameYaml: undefined,
        schemasOutputDir: undefined,
        error: undefined,
      },
    };
  }
}
