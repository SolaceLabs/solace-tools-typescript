import { EpAsyncApiDocument } from "@solace-labs/ep-asyncapi";
import {
  CliApplicationImporter,
  ICliApplicationImporterRunReturn,
  CliEventApiImporter,
  ICliEventApiImporterRunReturn,
  ICliImporterOptions,
  ICliAssetsImporterRunOptions,
} from "../importers";
import {
  CliApplicationDomainsService,
  CliAsyncApiDocumentService,
  CliEventApisService,
} from "../services";
import CliAppsService from "../services/CliAppsService";
import { CliInternalCodeInconsistencyError } from "./CliError";
import { CliLogger, ECliStatusCodes } from "./CliLogger";
import CliRunContext, {
  ECliRunContext_RunMode,
  ICliApiFileRunContext,
  ICliRunContext,
  ICliSetupTestApiRunContext,
  ICliSetupTestDomainsContext,
} from "./CliRunContext";
import CliRunExecuteReturnLog from "./CliRunExecuteReturnLog";
import CliRunSummary, { ECliRunSummary_Type } from "./CliRunSummary";
import { CliUtils } from "./CliUtils";

export enum ECliImporterManagerMode {
  RELEASE_MODE = "release_mode",
  TEST_MODE = "test_mode",
  TEST_MODE_KEEP = "test_mode_keep",
}
export const getCliImporterManagerModeObjectValues4Config = (): Array<string> => {
  return [
    ECliImporterManagerMode.RELEASE_MODE,
    ECliImporterManagerMode.TEST_MODE,
  ];
};

export interface ICliImporterManagerOptions {
  appName: string;
  runId: string;
  cliImporterManagerMode: ECliImporterManagerMode;
  asyncApiFileList: Array<string>;
  applicationDomainName?: string;
  assetApplicationDomainName?: string;
  cliImporterOptions: ICliImporterOptions;
  createApiApplication: boolean;
  createApiEventApi: boolean;
  cliTestSetupDomainsForApis: boolean;
}

export class CliImporterManager {
  private cliImporterManagerOptions: ICliImporterManagerOptions;

  constructor(cliImporterManagerOptions: ICliImporterManagerOptions) {
    this.cliImporterManagerOptions = cliImporterManagerOptions;
  }

  private static createApplicationDomainPrefix4TestMode({appName, runId }: {
    appName: string;
    runId: string;
  }): string {
    return `${appName}/test/${runId}`;
  }

  private setup_test_domains = async ({ applicationDomainNameList, assetApplicationDomainNameList, epAsyncApiDocumentList }: {
    applicationDomainNameList: Array<string>;
    assetApplicationDomainNameList: Array<string>;
    epAsyncApiDocumentList: Array<EpAsyncApiDocument>;
  }): Promise<void> => {
    const funcName = "setup_test_domains";
    const logName = `${CliImporterManager.name}.${funcName}()`;

    const rctxt: ICliSetupTestDomainsContext = { runProcess: "setUpTestDomains" };
    CliRunContext.push(rctxt);
    CliRunSummary.setUpTestDomains({cliRunSummary_SetupTestDomains: { type: ECliRunSummary_Type.SetupTestDomains }});
    // clean application domains before test
    await CliApplicationDomainsService.absent_ApplicationDomains({ applicationDomainNameList: applicationDomainNameList });
    await CliApplicationDomainsService.absent_ApplicationDomains({ applicationDomainNameList: assetApplicationDomainNameList });

    // set up asset test domain for all assets

    // set up api test domain for apis (application & event api)
    if(this.cliImporterManagerOptions.cliTestSetupDomainsForApis) {
      // walk all api documents
      for (const epAsyncApiDocument of epAsyncApiDocumentList) {
        const fromApplicationDomainName = epAsyncApiDocument.getUnprefixedApplicationDomainName();
        const toApplicationDomainName = epAsyncApiDocument.getApplicationDomainName();
        const fromAssetsApplicationDomainName = epAsyncApiDocument.getUnprefixedAssetsApplicationDomainName();
        const toAssetsApplicationDomainName = epAsyncApiDocument.getAssetsApplicationDomainName();

        const rctxt: ICliSetupTestApiRunContext = {
          apiTitle: epAsyncApiDocument.getTitle(),
          fromApplicationDomainName: fromApplicationDomainName,
          toApplicationDomainName: toApplicationDomainName,
          fromAssetsApplicationDomainName: fromAssetsApplicationDomainName,
          toAssetsApplicationDomainName: toAssetsApplicationDomainName,
        };
        CliRunContext.push(rctxt);
        CliRunSummary.setUpTestApi({cliRunSummary_SetupTestApi: {
          type: ECliRunSummary_Type.SetupTestApi,
          apiTitle: epAsyncApiDocument.getTitle(),
        }});

        if(this.cliImporterManagerOptions.createApiEventApi) {
          let loggerCode = "";
          const copied: boolean = await CliEventApisService.deepCopyLatestEventApiVersion({ epAsyncApiDocument: epAsyncApiDocument });
          if (copied) {
            loggerCode = ECliStatusCodes.SETUP_TEST_DOMAIN_EVENT_API_VERSION_COPIED;
          } else {
            loggerCode = ECliStatusCodes.SETUP_TEST_DOMAIN_EVENT_API_VERSION_COPY_SKIPPED;
          }
          CliLogger.info(CliLogger.createLogEntry(logName, {code: loggerCode, details: {
            apiTitle: epAsyncApiDocument.getTitle(),
            fromApplicationDomainName: fromApplicationDomainName,
            toApplicationDomainName: toApplicationDomainName,
            fromAssetsApplicationDomainName: fromAssetsApplicationDomainName,
            toAssetsApplicationDomainName: toAssetsApplicationDomainName,
          }}));    
        }
        if(this.cliImporterManagerOptions.createApiApplication) {
          let loggerCode = "";
          const copied: boolean = await CliAppsService.deepCopyLatestAppVersion({ epAsyncApiDocument: epAsyncApiDocument });
          if (copied) {
            loggerCode = ECliStatusCodes.SETUP_TEST_DOMAIN_APP_VERSION_COPIED;
          } else {
            loggerCode = ECliStatusCodes.SETUP_TEST_DOMAIN_APP_VERSION_COPY_SKIPPED;
          }
          CliLogger.info(CliLogger.createLogEntry(logName, {code: loggerCode, details: {
            apiTitle: epAsyncApiDocument.getTitle(),
            fromApplicationDomainName: fromApplicationDomainName,
            toApplicationDomainName: toApplicationDomainName,
            fromAssetsApplicationDomainName: fromAssetsApplicationDomainName,
            toAssetsApplicationDomainName: toAssetsApplicationDomainName,
          }}));    
        }
        CliRunContext.pop();
      }
    }
    CliRunContext.pop();
  };

  private run_test_mode = async ({ cleanUp }: {
    cleanUp: boolean;
  }): Promise<void> => {
    const funcName = "run_test_mode";
    const logName = `${CliImporterManager.name}.${funcName}()`;

    const applicationDomainNamePrefix = CliImporterManager.createApplicationDomainPrefix4TestMode({
      appName: this.cliImporterManagerOptions.appName,
      runId: this.cliImporterManagerOptions.runId,
    });

    const applicationDomainNameList: Array<string> = [];
    const assetApplicationDomainNameList: Array<string> = [];
    try {
      // test first pass
      let rctxt: ICliRunContext = {
        runId: this.cliImporterManagerOptions.runId,
        runMode: ECliRunContext_RunMode.TEST_PASS_1,
      };
      CliRunContext.push(rctxt);
      CliRunSummary.startRun({cliRunSummary_StartRun: {
        type: ECliRunSummary_Type.StartRun,
        runMode: ECliRunContext_RunMode.TEST_PASS_1,
      }});
      // validate each api first
      const epAsyncApiDocumentList: Array<EpAsyncApiDocument> = [];
      for (const asyncApiFile of this.cliImporterManagerOptions.asyncApiFileList) {
        CliRunExecuteReturnLog.reset();
        const rctxt: ICliApiFileRunContext = { apiFile: asyncApiFile };
        CliRunContext.push(rctxt);
        CliRunSummary.processingApiFile({cliRunSummary_ApiFile: {
          type: ECliRunSummary_Type.ApiFile,
          apiFile: asyncApiFile,
        }});
        CliRunSummary.validatingApi({cliRunSummary_ValidatingApi: {
          type: ECliRunSummary_Type.ValidatingApi,
          apiFile: asyncApiFile,
        }});
        // validate api
        const epAsyncApiDocument: EpAsyncApiDocument = await CliAsyncApiDocumentService.parse_and_validate({
          apiFile: asyncApiFile,
          applicationDomainName: this.cliImporterManagerOptions.applicationDomainName,
          assetApplicationDomainName: this.cliImporterManagerOptions.assetApplicationDomainName,
          applicationDomainNamePrefix: applicationDomainNamePrefix,
          overrideBrokerType: this.cliImporterManagerOptions.cliImporterOptions.cliAssetImport_BrokerType,
          overrideChannelDelimiter: this.cliImporterManagerOptions.cliImporterOptions.cliAssetImport_ChannelDelimiter,
          validateBestPractices: this.cliImporterManagerOptions.cliImporterOptions.cliValidateApiSpecBestPractices
        });
        applicationDomainNameList.push(epAsyncApiDocument.getApplicationDomainName());
        assetApplicationDomainNameList.push(epAsyncApiDocument.getAssetsApplicationDomainName());
        epAsyncApiDocumentList.push(epAsyncApiDocument);
        CliRunContext.pop();
      }
      // set up test domains
      await this.setup_test_domains({
        applicationDomainNameList: applicationDomainNameList,
        assetApplicationDomainNameList: assetApplicationDomainNameList,
        epAsyncApiDocumentList: epAsyncApiDocumentList,
      });
      // walk each api file
      for (const asyncApiFile of this.cliImporterManagerOptions.asyncApiFileList) {
        CliRunExecuteReturnLog.reset();
        const rctxt: ICliApiFileRunContext = {apiFile: asyncApiFile };
        CliRunContext.push(rctxt);

        const cliAssetsImporterRunOptions: ICliAssetsImporterRunOptions = {
          apiFile: asyncApiFile,
          applicationDomainName: this.cliImporterManagerOptions.applicationDomainName,
          assetApplicationDomainName: this.cliImporterManagerOptions.assetApplicationDomainName,
          applicationDomainNamePrefix: applicationDomainNamePrefix,
          checkmode: false,
          overrideBrokerType: this.cliImporterManagerOptions.cliImporterOptions.cliAssetImport_BrokerType,
          overrideChannelDelimiter: this.cliImporterManagerOptions.cliImporterOptions.cliAssetImport_ChannelDelimiter,
        };

        if(this.cliImporterManagerOptions.createApiEventApi) {
          const cliEventApiImporter = new CliEventApiImporter(this.cliImporterManagerOptions.cliImporterOptions, ECliRunContext_RunMode.TEST_PASS_1);
          const cliEventApiImporterRunReturn: ICliEventApiImporterRunReturn = await cliEventApiImporter.run({ cliImporterRunOptions: {
            ...cliAssetsImporterRunOptions,
            generateAssetsOutput: false,
          }});
          if (cliEventApiImporterRunReturn.error !== undefined) throw cliEventApiImporterRunReturn.error;
          if (cliEventApiImporterRunReturn.applicationDomainName === undefined) throw new CliInternalCodeInconsistencyError(logName, "cliEventApiImporterRunReturn.applicationDomainName === undefined");  
          // create application as well
          if(this.cliImporterManagerOptions.createApiApplication) {
            const cliApplicationImporter = new CliApplicationImporter(this.cliImporterManagerOptions.cliImporterOptions, ECliRunContext_RunMode.TEST_PASS_1);
            const cliApplicationImporterRunReturn: ICliApplicationImporterRunReturn = await cliApplicationImporter.run({ cliImporterRunOptions: {
              ...cliAssetsImporterRunOptions,   
              cliAssetsImporterRunPresentReturn: cliEventApiImporterRunReturn.cliAssetsImporterRunPresentReturn,
              generateAssetsOutput: false
            }});
            if (cliApplicationImporterRunReturn.error !== undefined) throw cliApplicationImporterRunReturn.error;
          }
        } else if(this.cliImporterManagerOptions.createApiApplication) {
          const cliApplicationImporter = new CliApplicationImporter(this.cliImporterManagerOptions.cliImporterOptions, ECliRunContext_RunMode.TEST_PASS_1);
          const cliApplicationImporterRunReturn: ICliApplicationImporterRunReturn = await cliApplicationImporter.run({ cliImporterRunOptions: {
            ...cliAssetsImporterRunOptions,
            cliAssetsImporterRunPresentReturn: undefined,
            generateAssetsOutput: false
          }});
          if(cliApplicationImporterRunReturn.error !== undefined) throw cliApplicationImporterRunReturn.error;
        }
        CliRunContext.pop();
      }
      CliRunContext.pop();

      // test second pass
      rctxt = {
        runId: this.cliImporterManagerOptions.runId,
        runMode: ECliRunContext_RunMode.TEST_PASS_2,
      };
      CliRunContext.push(rctxt);
      CliRunSummary.startRun({cliRunSummary_StartRun: {
        type: ECliRunSummary_Type.StartRun,
        runMode: ECliRunContext_RunMode.TEST_PASS_2,
      }});

      for (const asyncApiFile of this.cliImporterManagerOptions.asyncApiFileList) {
        CliRunExecuteReturnLog.reset();
        const rctxt: ICliApiFileRunContext = { apiFile: asyncApiFile };
        CliRunContext.push(rctxt);
        CliRunSummary.processingApiFile({cliRunSummary_ApiFile: {
          type: ECliRunSummary_Type.ApiFile,
          apiFile: asyncApiFile,
        }});
        const cliAssetsImporterRunOptions: ICliAssetsImporterRunOptions = {
          apiFile: asyncApiFile,
          applicationDomainName: this.cliImporterManagerOptions.applicationDomainName,
          assetApplicationDomainName: this.cliImporterManagerOptions.assetApplicationDomainName,
          applicationDomainNamePrefix: applicationDomainNamePrefix,
          checkmode: true,
          overrideBrokerType: this.cliImporterManagerOptions.cliImporterOptions.cliAssetImport_BrokerType,
          overrideChannelDelimiter: this.cliImporterManagerOptions.cliImporterOptions.cliAssetImport_ChannelDelimiter,
        };
        if(this.cliImporterManagerOptions.createApiEventApi) {
          const cliEventApiImporter = new CliEventApiImporter(this.cliImporterManagerOptions.cliImporterOptions, ECliRunContext_RunMode.TEST_PASS_1);
          const cliEventApiImporterRunReturn: ICliEventApiImporterRunReturn = await cliEventApiImporter.run({ cliImporterRunOptions: {
            ...cliAssetsImporterRunOptions,
            generateAssetsOutput: false,
          }});
          if (cliEventApiImporterRunReturn.error !== undefined) throw cliEventApiImporterRunReturn.error;
          if(this.cliImporterManagerOptions.createApiApplication) {
            const cliApplicationImporter = new CliApplicationImporter(this.cliImporterManagerOptions.cliImporterOptions, ECliRunContext_RunMode.TEST_PASS_1);
            const cliApplicationImporterRunReturn: ICliApplicationImporterRunReturn = await cliApplicationImporter.run({ cliImporterRunOptions: {
              ...cliAssetsImporterRunOptions,
              cliAssetsImporterRunPresentReturn: cliEventApiImporterRunReturn.cliAssetsImporterRunPresentReturn, 
              generateAssetsOutput: false
            }});
            if (cliApplicationImporterRunReturn.error !== undefined) throw cliApplicationImporterRunReturn.error;
          }
        } else if(this.cliImporterManagerOptions.createApiApplication) {
          const cliApplicationImporter = new CliApplicationImporter(this.cliImporterManagerOptions.cliImporterOptions, ECliRunContext_RunMode.TEST_PASS_1);
          const cliApplicationImporterRunReturn: ICliApplicationImporterRunReturn = await cliApplicationImporter.run({ cliImporterRunOptions: {
            ...cliAssetsImporterRunOptions,              
            cliAssetsImporterRunPresentReturn: undefined,
            generateAssetsOutput: false
          }});
          if(cliApplicationImporterRunReturn.error !== undefined) throw cliApplicationImporterRunReturn.error;
        }
        CliRunContext.pop();
      }
      // clean up if specified
      if (cleanUp) {
        let xvoid: void = await CliApplicationDomainsService.absent_ApplicationDomains({applicationDomainNameList: applicationDomainNameList });
        xvoid = await CliApplicationDomainsService.absent_ApplicationDomains({ applicationDomainNameList: assetApplicationDomainNameList });
        /* istanbul ignore next */
        xvoid;
      }
      CliRunContext.pop();
    } catch (e) {
      if (cleanUp) {
        let xvoid: void = await CliApplicationDomainsService.absent_ApplicationDomains({ applicationDomainNameList: applicationDomainNameList });
        xvoid = await CliApplicationDomainsService.absent_ApplicationDomains({ applicationDomainNameList: assetApplicationDomainNameList });
        /* istanbul ignore next */
        xvoid;
      }
      CliRunContext.pop();
      // already logged
      // CliLogger.error(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_ERROR, details: {
      //   error: e
      // }}));
      throw e;
    }
  };

  private run_release_mode = async (): Promise<void> => {
    const funcName = "run_release_mode";
    const logName = `${CliImporterManager.name}.${funcName}()`;

    await this.run_test_mode({ cleanUp: true });

    const rctxt: ICliRunContext = {
      runId: this.cliImporterManagerOptions.runId,
      runMode: ECliRunContext_RunMode.RELEASE,
    };
    CliRunContext.push(rctxt);
    CliRunSummary.startRun({cliRunSummary_StartRun: {
      type: ECliRunSummary_Type.StartRun,
      runMode: ECliRunContext_RunMode.RELEASE,
    }});

    for (const asyncApiFile of this.cliImporterManagerOptions.asyncApiFileList) {
      CliRunExecuteReturnLog.reset();
      const rctxt: ICliApiFileRunContext = { apiFile: asyncApiFile };
      CliRunContext.push(rctxt);
      CliRunSummary.processingApiFile({cliRunSummary_ApiFile: { type: ECliRunSummary_Type.ApiFile, apiFile: asyncApiFile }});

      const cliAssetsImporterRunOptions: ICliAssetsImporterRunOptions = {
        apiFile: asyncApiFile,
        applicationDomainName: this.cliImporterManagerOptions.applicationDomainName,
        assetApplicationDomainName: this.cliImporterManagerOptions.assetApplicationDomainName,
        applicationDomainNamePrefix: undefined,
        checkmode: false,
        overrideBrokerType: this.cliImporterManagerOptions.cliImporterOptions.cliAssetImport_BrokerType,
        overrideChannelDelimiter: this.cliImporterManagerOptions.cliImporterOptions.cliAssetImport_ChannelDelimiter,
      };

      if(this.cliImporterManagerOptions.createApiEventApi) {
        const cliEventApiImporter = new CliEventApiImporter(this.cliImporterManagerOptions.cliImporterOptions, ECliRunContext_RunMode.RELEASE);
        const cliEventApiImporterRunReturn: ICliEventApiImporterRunReturn = await cliEventApiImporter.run({ cliImporterRunOptions: {
          ...cliAssetsImporterRunOptions,
          generateAssetsOutput: true,
        }});  
        if (cliEventApiImporterRunReturn.error !== undefined) throw cliEventApiImporterRunReturn.error;
        if (cliEventApiImporterRunReturn.applicationDomainName === undefined) throw new CliInternalCodeInconsistencyError(logName, "cliEventApiImporterRunReturn.applicationDomainName === undefined");
        // create application as well
        if(this.cliImporterManagerOptions.createApiApplication) {
          const cliApplicationImporter = new CliApplicationImporter(this.cliImporterManagerOptions.cliImporterOptions, ECliRunContext_RunMode.TEST_PASS_1);
          const cliApplicationImporterRunReturn: ICliApplicationImporterRunReturn = await cliApplicationImporter.run({ cliImporterRunOptions: {
            ...cliAssetsImporterRunOptions,   
            cliAssetsImporterRunPresentReturn: cliEventApiImporterRunReturn.cliAssetsImporterRunPresentReturn,
            generateAssetsOutput: false
          }});
          if (cliApplicationImporterRunReturn.error !== undefined) throw cliApplicationImporterRunReturn.error;
        }
      } else if(this.cliImporterManagerOptions.createApiApplication) {
        // create application
        const cliApplicationImporter = new CliApplicationImporter(this.cliImporterManagerOptions.cliImporterOptions, ECliRunContext_RunMode.RELEASE);
        const cliApplicationImporterRunReturn: ICliApplicationImporterRunReturn = await cliApplicationImporter.run({ cliImporterRunOptions: {
          ...cliAssetsImporterRunOptions,
          cliAssetsImporterRunPresentReturn: undefined,
          generateAssetsOutput: true
        }});
        if (cliApplicationImporterRunReturn.error !== undefined) throw cliApplicationImporterRunReturn.error;
      }
      CliRunContext.pop();
    }
    CliRunContext.pop();
  };

  public run = async (): Promise<void> => {
    const funcName = "run";
    const logName = `${CliImporterManager.name}.${funcName}()`;

    CliRunExecuteReturnLog.reset();

    try {
      switch (this.cliImporterManagerOptions.cliImporterManagerMode) {
        case ECliImporterManagerMode.TEST_MODE:
        case ECliImporterManagerMode.TEST_MODE_KEEP:
          await this.run_test_mode({ cleanUp: this.cliImporterManagerOptions.cliImporterManagerMode === ECliImporterManagerMode.TEST_MODE });
          break;
        case ECliImporterManagerMode.RELEASE_MODE:
          await this.run_release_mode();
          break;
        default:
          CliUtils.assertNever(logName, this.cliImporterManagerOptions.cliImporterManagerMode);
      }
      CliRunSummary.processedImport(logName, this.cliImporterManagerOptions);
    } catch (e) {
      CliRunSummary.processedImport(logName, this.cliImporterManagerOptions);
      CliLogger.info(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.TRANSACTION_LOG, details: { transactionLog: CliRunExecuteReturnLog.get() }}));
      throw e;
    }
  };
}
