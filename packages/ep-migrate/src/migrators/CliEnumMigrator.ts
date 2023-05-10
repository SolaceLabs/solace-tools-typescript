import {
  EEpSdkTask_Action,
  EEpSdkTask_TargetState,
  EEpSdk_VersionTaskStrategy,
  EpSdkApplicationDomainTask,
  IEpSdkApplicationDomainTask_ExecuteReturn,
  EpSdkEnumTask,
  IEpSdkEnumTask_ExecuteReturn,
  EpSdkEnumVersionTask,
  IEpSdkEnumVersionTask_ExecuteReturn,
} from "@solace-labs/ep-sdk";
import {
  TopicAddressEnum,
} from "@solace-labs/ep-openapi-node";
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
  ICliEnumsRunContext,
  ICliEnumRunContext,
} from "../cli-components";
import { 
  CliMigrator, 
  ICliMigratorOptions, 
  ICliMigratorRunReturn 
} from "./CliMigrator";
import { 
  EpV1ApiMeta,
  EpV1Enum,
  EpV1EnumsResponse,
  EpV1EnumsService 
} from "../epV1";
import { ICliConfigEp2Versions } from "./types";

// export interface ICliEventApiImporterOptions extends ICliAssetsImporterOptions {}
// export interface ICliEventApiImporterGenerateAssetsOptions extends ICliImporterGenerateAssetsOptions {
//   cliEventApiImporterRunOptions: ICliEventApiImporterRunOptions;
//   applicationDomainId: string;
//   eventApiId: string;
//   eventApiVersionId: string;
//   applicationDomainName?: string;
//   apiTitle?: string;
// }
// export interface ICliEventApiImporterGenerateAssetsReturn extends ICliImporterGenerateAssetsReturn {
//   assetOutputRootDir: string | undefined;
//   asyncApiSpecFileNameJson: string | undefined;
//   asyncApiSpecFileNameYaml: string | undefined;
//   schemasOutputDir: string | undefined;
// }
// export interface ICliEventApiImporterRunPresentOptions extends ICliImporterRunPresentOptions {
//   epAsyncApiDocument: EpAsyncApiDocument;
// }
// export interface ICliEventApiImporterRunPresentReturn extends ICliAssetsImporterRunPresentReturn {
//   applicationDomainId: string;
//   eventApiId: string;
//   eventApiVersionId: string;
//   cliAssetsImporterRunPresentReturn: ICliAssetsImporterRunPresentReturn;
// }
// export interface ICliEventApiImporterRunPresentEventApiReturn {
//   eventApiId: string;
//   eventApiVersionId: string;
// }
// export interface ICliEventApiImporterRunPresentEventApiVersionReturn {
//   eventApiVersionId: string;
// }
// export interface ICliEventApiImporterRunImportReturn extends ICliAssetsImporterRunReturn {
//   apiTitle: string;
//   applicationDomainId: string;
//   eventApiId: string;
//   eventApiVersionId: string;
//   cliAssetsImporterRunPresentReturn: ICliAssetsImporterRunPresentReturn;
// }
// export interface ICliEventApiImporterRunOptions extends ICliAssetsImporterRunOptions {
//   generateAssetsOutput: boolean;
// }
// export interface ICliEventApiImporterRunReturn extends ICliAssetsImporterRunReturn {
//   cliEventApiImporterGenerateAssetsReturn: ICliEventApiImporterGenerateAssetsReturn;
//   cliAssetsImporterRunPresentReturn: ICliAssetsImporterRunPresentReturn;
// }


export interface ICliEnumsMigrateConfig {
  epV2: {
    applicationDomainName: string;
    versions: ICliConfigEp2Versions;
  },
}
export interface ICliEnumMigratorOptions extends ICliMigratorOptions {
  cliEnumsMigrateConfig: ICliEnumsMigrateConfig;
}
interface ICliEnumMigratorRunMigrateReturn {
  enumApplicationDomainName: string;
  enumApplicationDomainId: string;
}
export interface ICliEnumMigratorRunReturn extends ICliMigratorRunReturn {
  cliEnumMigratorRunMigrateReturn: ICliEnumMigratorRunMigrateReturn;
}

export class CliEnumMigrator extends CliMigrator {
  protected options: ICliEnumMigratorOptions;

  constructor(options: ICliEnumMigratorOptions, runMode: ECliRunContext_RunMode) {
    super(options, runMode);
  }

  // protected async run_present({ cliImporterRunPresentOptions, }: {
  //   cliImporterRunPresentOptions: ICliEventApiImporterRunPresentOptions;
  // }): Promise<ICliEventApiImporterRunPresentReturn> {
  //   const funcName = "run_present";
  //   const logName = `${CliEventApiImporter.name}.${funcName}()`;

  //   const apiTitle: string = cliImporterRunPresentOptions.epAsyncApiDocument.getEpApiName();
  //   const apiVersion: string = cliImporterRunPresentOptions.epAsyncApiDocument.getVersion();
  //   const apiBrokerType: string = cliImporterRunPresentOptions.epAsyncApiDocument.getBrokerType();
  //   const epApplicationDomainName: string = cliImporterRunPresentOptions.epAsyncApiDocument.getApplicationDomainName();
  //   const epAssetApplicationDomainName: string = cliImporterRunPresentOptions.epAsyncApiDocument.getAssetsApplicationDomainName();

  //   const rctxt: ICliApiRunContext = {
  //     apiTitle: apiTitle,
  //     apiVersion: apiVersion,
  //     apiBrokerType: apiBrokerType,
  //     applicationDomainName: epApplicationDomainName,
  //     assetApplicationDomainName: epAssetApplicationDomainName,
  //   };
  //   CliRunContext.push(rctxt);
  //   CliRunSummary.processingApi({cliRunSummary_Api: {
  //     type: ECliRunSummary_Type.Api,
  //     apiName: apiTitle,
  //     apiVersion: apiVersion,
  //     apiBrokerType: apiBrokerType,
  //     applicationDomainName: epApplicationDomainName,
  //     assetApplicationDomain: epAssetApplicationDomainName,
  //   }});

  //   // import the assets
  //   const cliAssetsImporterRunPresentReturn: ICliAssetsImporterRunPresentReturn = await this.run_present_assets({ cliAssetsImporterRunPresentOptions: {
  //     epAsyncApiDocument: cliImporterRunPresentOptions.epAsyncApiDocument,
  //     checkmode: cliImporterRunPresentOptions.checkmode,
  //   }});

  //   // api application domain present
  //   const applicationDomainsTask = new EpSdkApplicationDomainTask({
  //     epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
  //     applicationDomainName: cliImporterRunPresentOptions.epAsyncApiDocument.getApplicationDomainName(),
  //     applicationDomainSettings: {
  //       // description: "a new description x"
  //     },
  //     epSdkTask_TransactionConfig: this.get_IEpSdkTask_TransactionConfig(),
  //     checkmode: cliImporterRunPresentOptions.checkmode,
  //   });
  //   const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await this.executeTask({
  //     epSdkTask: applicationDomainsTask,
  //     expectNoAction: cliImporterRunPresentOptions.checkmode,
  //   });
  //   CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_EP_APPLICATION_DOMAIN, message: "application domain", details: {
  //     epSdkApplicationDomainTask_ExecuteReturn: epSdkApplicationDomainTask_ExecuteReturn,
  //   }}));
  //   // create summary log
  //   CliRunSummary.processedApplicationDomain({ epSdkApplicationDomainTask_ExecuteReturn: epSdkApplicationDomainTask_ExecuteReturn });

  //   /* istanbul ignore next */
  //   if (epSdkApplicationDomainTask_ExecuteReturn.epObject.id === undefined) throw new CliEPApiContentError(logName, "epSdkApplicationDomainTask_ExecuteReturn.epObject.id === undefined", {
  //     applicationDomainObject: epSdkApplicationDomainTask_ExecuteReturn.epObject,
  //   });

  //   // present event api
  //   const cliEventApiImporterRunPresentEventApiReturn: ICliEventApiImporterRunPresentEventApiReturn = await this.run_present_event_api({
  //     applicationDomainId: epSdkApplicationDomainTask_ExecuteReturn.epObject.id,
  //     assetApplicationDomainId: cliAssetsImporterRunPresentReturn.assetApplicationDomainId,
  //     epAsyncApiDocument: cliImporterRunPresentOptions.epAsyncApiDocument,
  //     checkmode: cliImporterRunPresentOptions.checkmode,
  //   });

  //   const cliEventApiImporterRunPresentReturn: ICliEventApiImporterRunPresentReturn = {
  //     assetApplicationDomainId: cliAssetsImporterRunPresentReturn.assetApplicationDomainId,
  //     applicationDomainId: epSdkApplicationDomainTask_ExecuteReturn.epObject.id,
  //     eventApiId: cliEventApiImporterRunPresentEventApiReturn.eventApiId,
  //     eventApiVersionId: cliEventApiImporterRunPresentEventApiReturn.eventApiVersionId,
  //     cliAssetsImporterRunPresentReturn: cliAssetsImporterRunPresentReturn
  //   };
  //   CliRunContext.pop();
  //   return cliEventApiImporterRunPresentReturn;
  // }

  private async migrateEnum({ epV1Enum, epV2ApplicationDomainName, epV2ApplicationDomainId }:{
    epV1Enum: EpV1Enum;
    epV2ApplicationDomainName: string;
    epV2ApplicationDomainId: string;
  }): Promise<void> {
    const funcName = 'migrateEnum';
    const logName = `${CliEnumMigrator.name}.${funcName}()`;
    const rctxt: ICliEnumRunContext = {
      epV2ApplicationDomainName,
      enumName: epV1Enum.name
    };
    CliRunContext.push(rctxt);
    CliRunSummary.processingEpV1Enum({ enumName: epV1Enum.name });
    // present enum
    const epSdkEnumTask = new EpSdkEnumTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: epV2ApplicationDomainId,
      enumName: epV1Enum.name,
      enumObjectSettings: {
        shared: true,
      },
      epSdkTask_TransactionConfig: this.get_IEpSdkTask_TransactionConfig(),
    });
    const epSdkEnumTask_ExecuteReturn: IEpSdkEnumTask_ExecuteReturn = await this.executeTask({epSdkTask: epSdkEnumTask, expectNoAction: false });
    const enumObject: TopicAddressEnum = epSdkEnumTask_ExecuteReturn.epObject;
    /* istanbul ignore next */
    if (enumObject.id === undefined) throw new CliEPApiContentError(logName,"enumObject.id === undefined", { enumObject: enumObject });
    CliLogger.trace(CliLogger.createLogEntry(logName, {code: ECliStatusCodes.PRESENT_EP_V2_ENUM, details: { epSdkEnumTask_ExecuteReturn }}));
    CliRunSummary.presentEpV2Enum({ applicationDomainName: epV2ApplicationDomainName, epSdkEnumTask_ExecuteReturn });
    // present the enum version

    // console.log(`\n\n${logName}: TODO: displayName, epV1Enum.values = ${JSON.stringify(epV1Enum.values, null, 2)}\n\n`);

    const enumValues: Array<string> = epV1Enum.values.map( (epV1Enum) => { 
      if(epV1Enum.value === undefined) throw new CliEPApiContentError(logName,"epV1Enum.value === undefined", { epV1Enum });
      return epV1Enum.value;
    });
    const epSdkEnumVersionTask = new EpSdkEnumVersionTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: epV2ApplicationDomainId,
      enumId: enumObject.id,
      versionString: this.options.cliEnumsMigrateConfig.epV2.versions.initialVersion,
      versionStrategy: this.get_EEpSdk_VersionTaskStrategy(this.options.cliEnumsMigrateConfig.epV2.versions.versionStrategy),
      enumValues: enumValues,
      enumVersionSettings: {
        description: epV1Enum.description,
        stateId: this.get_EpSdk_StateId(this.options.cliEnumsMigrateConfig.epV2.versions.state)
      },
      epSdkTask_TransactionConfig: this.get_IEpSdkTask_TransactionConfig(),
      checkmode: false,
    });
    const epSdkEnumVersionTask_ExecuteReturn: IEpSdkEnumVersionTask_ExecuteReturn = await this.executeTask({ epSdkTask: epSdkEnumVersionTask, expectNoAction: false });
    CliLogger.trace(CliLogger.createLogEntry(logName, {code: ECliStatusCodes.PRESENT_EP_V2_ENUM_VERSION, details: { epSdkEnumVersionTask_ExecuteReturn }}));
    CliRunSummary.presentEpV2EnumVersion({ applicationDomainName: epV2ApplicationDomainName, epSdkEnumVersionTask_ExecuteReturn });
    CliRunContext.pop();
  }

  private async run_migrate(): Promise<ICliEnumMigratorRunMigrateReturn> {
    const funcName = 'run_migrate';
    const logName = `${CliEnumMigrator.name}.${funcName}()`;
    
    const epV2ApplicationDomainName = this.options.applicationDomainPrefix ? `${this.options.applicationDomainPrefix}${this.options.cliEnumsMigrateConfig.epV2.applicationDomainName}` : this.options.cliEnumsMigrateConfig.epV2.applicationDomainName;
    const rctxt: ICliEnumsRunContext = {
      epV2ApplicationDomainName
    };
    CliRunContext.push(rctxt);
    CliRunSummary.processingEpV1Enums();

    // present application domain for enums
    const applicationDomainsTask = new EpSdkApplicationDomainTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainName: epV2ApplicationDomainName,
      applicationDomainSettings: {
        // description: "a new description x"
      },
      epSdkTask_TransactionConfig: this.get_IEpSdkTask_TransactionConfig(),
      checkmode: false,
    });
    const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await this.executeTask({ epSdkTask: applicationDomainsTask, expectNoAction: false });
    CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.MIGRATE_ENUMS_APPLICATION_DOMAIN, message: "application domain", details: {
      epSdkApplicationDomainTask_ExecuteReturn: epSdkApplicationDomainTask_ExecuteReturn,
    }}));
    /* istanbul ignore next */
    if(epSdkApplicationDomainTask_ExecuteReturn.epObject.id === undefined) throw new CliEPApiContentError(logName, "epSdkApplicationDomainTask_ExecuteReturn.epObject.id === undefined", {
      applicationDomainObject: epSdkApplicationDomainTask_ExecuteReturn.epObject,
    });    
    CliRunSummary.presentEpV2ApplicationDomain({ epSdkApplicationDomainTask_ExecuteReturn: epSdkApplicationDomainTask_ExecuteReturn });

    // get all the enums and walk the list
    let nextPage: number | null = 1;
    while (nextPage !== null) {
      const epV1EnumsResponse: EpV1EnumsResponse = await EpV1EnumsService.list8({ pageNumber: nextPage, pageSize: 10 });
      if(epV1EnumsResponse.data) {
        for(const epV1Enum of epV1EnumsResponse.data) {
          await this.migrateEnum({ epV1Enum: epV1Enum as EpV1Enum, epV2ApplicationDomainId: epSdkApplicationDomainTask_ExecuteReturn.epObject.id, epV2ApplicationDomainName });
        }
      }
      if(epV1EnumsResponse.meta) {
        const apiMeta = epV1EnumsResponse.meta as EpV1ApiMeta;
        nextPage = apiMeta.pagination.nextPage;
      } else {
        nextPage = null;
      }
    }
    CliRunContext.pop();
    return {
      enumApplicationDomainId: epSdkApplicationDomainTask_ExecuteReturn.epObject.id,
      enumApplicationDomainName: epSdkApplicationDomainTask_ExecuteReturn.epObject.name,
    };
  } 

  public async run(): Promise<ICliEnumMigratorRunReturn> {
    const funcName = 'run';
    const logName = `${CliEnumMigrator.name}.${funcName}()`;
    CliLogger.debug(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.MIGRATE_ENUMS_START }));
    const cliEnumMigratorRunReturn: ICliEnumMigratorRunReturn = {
      cliEnumMigratorRunMigrateReturn: {
        enumApplicationDomainName: "undefined",
        enumApplicationDomainId: "undefined",  
      },
      error: undefined
    };
    try {
      cliEnumMigratorRunReturn.cliEnumMigratorRunMigrateReturn = await this.run_migrate();
      CliLogger.debug(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.MIGRATE_ENUMS_DONE, details: { cliEnumMigratorRunMigrateReturn: cliEnumMigratorRunReturn.cliEnumMigratorRunMigrateReturn }}));
    } catch (e: any) {
      cliEnumMigratorRunReturn.error = CliErrorFactory.createCliError({logName: logName, error: e });
    } finally {
      if (cliEnumMigratorRunReturn.error !== undefined) {
        CliLogger.error(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.MIGRATE_ENUMS_ERROR, details: { error: cliEnumMigratorRunReturn.error }}));
      }
      // //eslint-disable-next-line
      // return cliEventApiImporterRunImportReturn;
    }
    return cliEnumMigratorRunReturn;
  }
}
