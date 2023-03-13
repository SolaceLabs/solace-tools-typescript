import { Application, ApplicationVersion } from "@solace-labs/ep-openapi-node";
import { EpAsyncApiDocument } from "@solace-labs/ep-asyncapi";
import {
  EEpSdkTask_Action,
  EEpSdkTask_TargetState,
  EEpSdk_VersionTaskStrategy,
  EpSdkApplicationTask,
  EpSdkApplicationVersionsService,
  EpSdkApplicationVersionTask,
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
} from "../cli-components";
import {
  CliAsyncApiDocumentService,
  ICliPubSubEventVersionIds,
} from "../services";
import {
  CliImporter,
  ICliImporterGenerateAssetsOptions,
  ICliImporterGenerateAssetsReturn,
  ICliImporterOptions,
  ICliImporterRunOptions,
  ICliImporterRunPresentOptions,
  ICliImporterRunPresentReturn,
  ICliImporterRunReturn,
} from "./CliImporter";

export interface ICliApplicationImporterOptions extends ICliImporterOptions {
  applicationDomainName: string;
}
export interface ICliApplicationImporterGenerateAssetsOptions extends ICliImporterGenerateAssetsOptions {}
export interface ICliApplicationImporterRunPresentOptions extends ICliImporterRunPresentOptions {
  epAsyncApiDocument: EpAsyncApiDocument;
}
export interface ICliApplicationImporterRunPresentReturn extends ICliImporterRunPresentReturn {}
export interface ICliApplicationImporterRunOptions extends ICliImporterRunOptions {}
export interface ICliApplicationImporterRunReturn extends ICliImporterRunReturn {}

export class CliApplicationImporter extends CliImporter {
  constructor(cliApplicationImporterOptions: ICliApplicationImporterOptions) {
    super(cliApplicationImporterOptions);
  }

  protected generate_assets_ouput = async ({cliImporterGenerateAssetsOptions}: {
    cliImporterGenerateAssetsOptions: ICliImporterGenerateAssetsOptions;
  }): Promise<ICliImporterGenerateAssetsReturn> => {
    const funcName = "generate_assets_ouput";
    const logName = `${CliApplicationImporter.name}.${funcName}()`;
    cliImporterGenerateAssetsOptions;
    return {
      error: `${logName}: not implemented`,
    };
  };

  private run_present_application_version = async ({
    applicationDomainId,
    assetApplicationDomainId,
    applicationId,
    epAsyncApiDocument,
    checkmode,
  }: {
    applicationDomainId: string;
    assetApplicationDomainId: string;
    applicationId: string;
    epAsyncApiDocument: EpAsyncApiDocument;
    checkmode: boolean;
  }): Promise<void> => {
    const funcName = "run_present_application_version";
    const logName = `${CliApplicationImporter.name}.${funcName}()`;

    // get latest version as reference
    const latestExistingApplicationVersionObjectBefore: ApplicationVersion | undefined = await EpSdkApplicationVersionsService.getLatestVersionForApplicationName({
      applicationDomainId: applicationDomainId,
      applicationName: epAsyncApiDocument.getEpApiName(),
    });
    // const latestExistingApplicationVersionString: string | undefined = latestExistingApplicationVersionObjectBefore?.version;

    // get the list of pub and sub events
    const cliPubSubEventVersionIds: ICliPubSubEventVersionIds =
      await CliAsyncApiDocumentService.get_pub_sub_event_version_ids({
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
        stateId: this.get_EpSdkTask_StateId(),
        declaredConsumedEventVersionIds:
          cliPubSubEventVersionIds.publishEventVersionIdList,
        declaredProducedEventVersionIds:
          cliPubSubEventVersionIds.subscribeEventVersionIdList,
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
      latestExistingApplicationVersionObjectBefore:
        latestExistingApplicationVersionObjectBefore,
      exactTargetVersion: epAsyncApiDocument.getVersion(),
      epSdkApplicationVersionTask_ExecuteReturn_Check:
        epSdkApplicationVersionTask_ExecuteReturn_Check,
    });

    // different strategies for release mode and test mode
    if (
      CliRunContext.get().runMode === ECliRunContext_RunMode.RELEASE && epSdkApplicationVersionTask_ExecuteReturn_Check.epSdkTask_TransactionLogData.epSdkTask_Action ===
        EEpSdkTask_Action.WOULD_FAIL_CREATE_NEW_VERSION_ON_EXACT_VERSION_REQUIREMENT
    ) {
      if (latestExistingApplicationVersionObjectBefore === undefined) throw new CliInternalCodeInconsistencyError(logName, {
          message: "latestExistingApplicationVersionObjectBefore === undefined",
          applicationDomainId: applicationDomainId,
          applicationName: epAsyncApiDocument.getEpApiName(),
        });

      // create a new application version and issue warning
      const epSdkApplicationVersionTask = new EpSdkApplicationVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: applicationDomainId,
        applicationId: applicationId,
        versionString: epAsyncApiDocument.getVersion(),
        versionStrategy: EEpSdk_VersionTaskStrategy.BUMP_PATCH,
        applicationVersionSettings: {
          description: epAsyncApiDocument.getDescription(),
          displayName: epAsyncApiDocument.getEpApiVersionName(),
          stateId: this.get_EpSdkTask_StateId(),
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
      CliLogger.warn(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_EP_APPLICATION_WITH_WARNING, details: {
        warning: [
          `expect epSdkTask_TransactionLogData.epSdkTask_Action = '${EEpSdkTask_Action.NO_ACTION}', instead got '${epSdkApplicationVersionTask_ExecuteReturn_Check.epSdkTask_TransactionLogData.epSdkTask_Action}'`,
          `created new application version`,
        ],
        targetApplicationVersion: epAsyncApiDocument.getVersion(),
        createdApplicationVersion: epSdkApplicationVersionTask_ExecuteReturn
          .epObject.version
          ? epSdkApplicationVersionTask_ExecuteReturn.epObject.version
          : "undefined",
        epSdkApplicationVersionTask_ExecuteReturn: epSdkApplicationVersionTask_ExecuteReturn,
      }}));
      // summary
      CliRunSummary.processedApplicationVersionWithWarning({
        targetApplicationVersion: epAsyncApiDocument.getVersion(),
        targetApplicationState: this.get_EpSdkTask_StateId(),
        latestExistingApplicationVersionObjectBefore: latestExistingApplicationVersionObjectBefore,
        epSdkApplicationVersionTask_ExecuteReturn: epSdkApplicationVersionTask_ExecuteReturn,
        requestedUpdates: undefined,
      });
    } else {
      // create the target version in release state as intended
      const epSdkApplicationVersionTask = new EpSdkApplicationVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: applicationDomainId,
        applicationId: applicationId,
        versionString: epAsyncApiDocument.getVersion(),
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        applicationVersionSettings: {
          description: epAsyncApiDocument.getDescription(),
          displayName: epAsyncApiDocument.getEpApiVersionName(),
          stateId: this.get_EpSdkTask_StateId(),
          declaredConsumedEventVersionIds: cliPubSubEventVersionIds.publishEventVersionIdList,
          declaredProducedEventVersionIds: cliPubSubEventVersionIds.subscribeEventVersionIdList,
        },
        epSdkTask_TransactionConfig: this.get_IEpSdkTask_TransactionConfig(),
        checkmode: checkmode,
      });
      const epSdkApplicationVersionTask_ExecuteReturn: IEpSdkApplicationVersionTask_ExecuteReturn =
        await this.executeTask({
          epSdkTask: epSdkApplicationVersionTask,
          expectNoAction: checkmode,
        });
      CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_EP_APPLICATION, details: {
        epSdkApplicationVersionTask_ExecuteReturn: epSdkApplicationVersionTask_ExecuteReturn,
      }}));
      // summary
      CliRunSummary.processedApplicationVersion({
        epSdkApplicationVersionTask_ExecuteReturn: epSdkApplicationVersionTask_ExecuteReturn,
      });
    }
  };

  private run_present_application = async ({
    applicationDomainId,
    assetApplicationDomainId,
    epAsyncApiDocument,
    checkmode,
  }: {
    applicationDomainId: string;
    assetApplicationDomainId: string;
    epAsyncApiDocument: EpAsyncApiDocument;
    checkmode: boolean;
  }): Promise<void> => {
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
    const epSdkApplicationTask_ExecuteReturn: IEpSdkApplicationTask_ExecuteReturn = await this.executeTask({
      epSdkTask: epSdkApplicationTask,
      expectNoAction: checkmode,
    });
    CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_EP_EVENT_API, details: {
      epSdkApplicationTask_ExecuteReturn: epSdkApplicationTask_ExecuteReturn,
    }}));
    /* istanbul ignore next */
    if (epSdkApplicationTask_ExecuteReturn.epObject.id === undefined) throw new CliEPApiContentError(logName, "epSdkApplicationTask_ExecuteReturn.epObject.id === undefined", {
      epSdkApplicationTask_ExecuteReturn: epSdkApplicationTask_ExecuteReturn,
    });
    const applicationId: string = epSdkApplicationTask_ExecuteReturn.epObject.id;
    await this.run_present_application_version({
      applicationDomainId: applicationDomainId,
      assetApplicationDomainId: assetApplicationDomainId,
      applicationId: applicationId,
      epAsyncApiDocument: epAsyncApiDocument,
      checkmode: checkmode,
    });
  };

  protected async run_present({ cliImporterRunPresentOptions }: {
    cliImporterRunPresentOptions: ICliApplicationImporterRunPresentOptions;
  }): Promise<ICliApplicationImporterRunPresentReturn> {
    const applicationDomainName = cliImporterRunPresentOptions.epAsyncApiDocument.getApplicationDomainName();
    const assetApplicationDomainName = cliImporterRunPresentOptions.epAsyncApiDocument.getAssetsApplicationDomainName();
    const applicationDomainId: string = await this.get_ApplicationDomainId( applicationDomainName );
    const assetApplicationDomainId: string = await this.get_ApplicationDomainId( assetApplicationDomainName);

    // present application
    const xvoid: void = await this.run_present_application({
      applicationDomainId: applicationDomainId,
      assetApplicationDomainId: assetApplicationDomainId,
      epAsyncApiDocument: cliImporterRunPresentOptions.epAsyncApiDocument,
      checkmode: cliImporterRunPresentOptions.checkmode,
    });
    /* istanbul ignore next */
    xvoid;
    const cliApplicationImporterRunPresentReturn: ICliApplicationImporterRunPresentReturn = {
      applicationDomainId: "todo-applicationDomainId",
      assetApplicationDomainId: "todo-assetApplicationDomainId",
    };
    return cliApplicationImporterRunPresentReturn;
  }

  public async run({cliImporterRunOptions}: {
    cliImporterRunOptions: ICliApplicationImporterRunOptions;
  }): Promise<ICliApplicationImporterRunReturn> {
    const funcName = "run";
    const logName = `${CliApplicationImporter.name}.${funcName}()`;

    // const rctxt: ICliAsyncApiRunContext = {
    //   apiFile: cliImporterRunOptions.apiFile
    // };
    // CliRunContext.updateContext({ runContext: rctxt });
    CliRunSummary.processingApiFileApplication({
      cliRunSummary_ApiFileApplication: {
        type: ECliRunSummary_Type.ApiFileApplication,
        apiFile: cliImporterRunOptions.apiFile,
      },
    });
    CliLogger.debug(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_START_APPLICATION, details: {
      cliImporterRunOptions: cliImporterRunOptions,
    }}));

    const cliApplicationImporterRunReturn: ICliApplicationImporterRunReturn = {
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
        validateBestPractices: this.cliImporterOptions.cliValidateApiSpecBestPractices
      });
      cliApplicationImporterRunReturn.applicationDomainName = epAsyncApiDocument.getApplicationDomainName();
      cliApplicationImporterRunReturn.assetApplicationDomainName = epAsyncApiDocument.getAssetsApplicationDomainName();

      const cliApplicationImporterRunPresentReturn: ICliApplicationImporterRunPresentReturn = await this.run_present({ cliImporterRunPresentOptions: {
        epAsyncApiDocument: epAsyncApiDocument,
        checkmode: cliImporterRunOptions.checkmode,
      }});
      /* istanbul ignore next */
      cliApplicationImporterRunPresentReturn;

      this.generate_assets_ouput({
        cliImporterGenerateAssetsOptions: {
          epAsyncApiDocument: epAsyncApiDocument,
        },
      });

      CliLogger.debug(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_DONE_APPLICATION, details: {} }));
    } catch (e: any) {
      cliApplicationImporterRunReturn.error = CliErrorFactory.createCliError({ logName: logName, error: e });
    } finally {
      if (cliApplicationImporterRunReturn.error !== undefined) {
        CliLogger.error( CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_ERROR_APPLICATION, details: {
          error: cliApplicationImporterRunReturn.error,
        }}));
      }
      //eslint-disable-next-line
      return cliApplicationImporterRunReturn;
    }
  }
}
