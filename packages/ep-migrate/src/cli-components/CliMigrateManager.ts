import { 
  CliEnumsMigrator, 
  ICliEnumsMigratorRunReturn, 
  ICliEnumsMigrateConfig, 
  CliApplicationDomainsMigrator,
  ICliApplicationDomainsMigratorRunReturn,
  ICliApplicationDomainsMigrateConfig,
  ICliSchemasMigrateConfig,
  CliSchemasMigrator,
  ICliSchemasMigratorRunReturn,
  CliEventsMigrator,
  ICliEventsMigratorRunReturn,
  ICliEventsMigrateConfig,
} from "../migrators";
import { 
  CliApplicationDomainsService 
} from "../services";
import CliConfig, { 
  ICliConfigFile 
} from "./CliConfig";
import { 
  CliUsageError 
} from "./CliError";
import { 
  CliLogger, 
  ECliStatusCodes 
} from "./CliLogger";
import CliRunContext, {
  ECliRunContext_RunMode,
  ICliRunContext,
} from "./CliRunContext";
import CliRunExecuteReturnLog from "./CliRunExecuteReturnLog";
import CliRunIssues from "./CliRunIssues";
import CliRunSummary, { 
  ECliRunSummary_Type 
} from "./CliRunSummary";
import { 
  CliUtils 
} from "./CliUtils";

export enum ECliMigrateManagerRunState {
  PRESENT = "present",
  ABSENT = "absent",
}

export enum ECliMigrateManagerMode {
  RELEASE_MODE = "release_mode",
  // TEST_MODE = "test_mode",
  // TEST_MODE_KEEP = "test_mode_keep",
}
export interface ICliMigrateManagerOptions {
  appName: string;
  runId: string;
  cliMigrateManagerMode: ECliMigrateManagerMode;
  cliMigrateManagerRunState: ECliMigrateManagerRunState;
  epV2: {
    applicationDomainPrefix?: string;
  },
  enums: ICliEnumsMigrateConfig;
  applicationDomains: ICliApplicationDomainsMigrateConfig;
  schemas: ICliSchemasMigrateConfig;
  events: ICliEventsMigrateConfig;
}

export class CliMigrateManager {
  private cliMigrateManagerOptions: ICliMigrateManagerOptions;

  constructor(cliMigrateManagerOptions: ICliMigrateManagerOptions) {
    this.cliMigrateManagerOptions = cliMigrateManagerOptions;
  }

  private run_absent = async(): Promise<void> => {
    const funcName = "run_absent";
    const logName = `${CliMigrateManager.name}.${funcName}()`;

    const rctxt: ICliRunContext = {
      runId: this.cliMigrateManagerOptions.runId,
      runState: this.cliMigrateManagerOptions.cliMigrateManagerRunState,
      runMode: ECliRunContext_RunMode.RELEASE,
    };
    CliRunContext.push(rctxt);
    CliRunSummary.startRunAbsent({cliRunSummary_StartRun: {
      type: ECliRunSummary_Type.StartRunAbsent,
      epV1OrganizationInfo: CliConfig.getCliConfig().epV1Config.organizationInfo,
      epV2OrganizationInfo: CliConfig.getCliConfig().epV2Config.organizationInfo,
      runMode: ECliRunContext_RunMode.RELEASE,
      runState: this.cliMigrateManagerOptions.cliMigrateManagerRunState,
      epV2ApplicationDomainPrefix: this.cliMigrateManagerOptions.epV2.applicationDomainPrefix ? this.cliMigrateManagerOptions.epV2.applicationDomainPrefix : "none"
    }});

    if(this.cliMigrateManagerOptions.epV2.applicationDomainPrefix === undefined) {
      throw new CliUsageError(
        logName, 
        `Run state '${this.cliMigrateManagerOptions.cliMigrateManagerRunState}' currently only supported with '${CliUtils.nameOf<ICliConfigFile>("migrate.epV2.applicationDomainPrefix")}' defined.`,
        undefined
        );
    }

    await CliApplicationDomainsService.absent_EpV2_PrefixedApplicationDomains(this.cliMigrateManagerOptions.epV2.applicationDomainPrefix);

    CliRunContext.pop();
  }

  private run_present = async(): Promise<void> => {
    // const funcName = "run_present";
    // const logName = `${CliMigrateManager.name}.${funcName}()`;

    const rctxt: ICliRunContext = {
      runId: this.cliMigrateManagerOptions.runId,
      runState: this.cliMigrateManagerOptions.cliMigrateManagerRunState,
      runMode: ECliRunContext_RunMode.RELEASE,
    };
    CliRunContext.push(rctxt);
    CliRunSummary.startRunPresent({cliRunSummary_StartRun: {
      type: ECliRunSummary_Type.StartRunPresent,
      epV1OrganizationInfo: CliConfig.getCliConfig().epV1Config.organizationInfo,
      epV2OrganizationInfo: CliConfig.getCliConfig().epV2Config.organizationInfo,
      epV2ApplicationDomainPrefix: this.cliMigrateManagerOptions.epV2.applicationDomainPrefix ? this.cliMigrateManagerOptions.epV2.applicationDomainPrefix : "none",
      runMode: ECliRunContext_RunMode.RELEASE,
      runState: this.cliMigrateManagerOptions.cliMigrateManagerRunState,
    }});
    // migrate enums
    const cliEnumsMigrator = new CliEnumsMigrator({
        runId: this.cliMigrateManagerOptions.runId,
        applicationDomainPrefix: this.cliMigrateManagerOptions.epV2.applicationDomainPrefix,
        cliEnumsMigrateConfig: this.cliMigrateManagerOptions.enums,
      }, 
      ECliRunContext_RunMode.RELEASE,
    );
    const cliEnumsMigratorRunReturn: ICliEnumsMigratorRunReturn = await cliEnumsMigrator.run();
    if(cliEnumsMigratorRunReturn.error) throw cliEnumsMigratorRunReturn.error;
    // migrate application domains
    const cliApplicationDomainsMigrator = new CliApplicationDomainsMigrator({
        runId: this.cliMigrateManagerOptions.runId,
        applicationDomainPrefix: this.cliMigrateManagerOptions.epV2.applicationDomainPrefix,
        cliApplicationDomainsMigrateConfig: this.cliMigrateManagerOptions.applicationDomains,
        cliEnumsMigratorRunMigrateReturn: cliEnumsMigratorRunReturn.cliEnumsMigratorRunMigrateReturn
      }, 
      ECliRunContext_RunMode.RELEASE,
    );
    const cliApplicationDomainsMigratorRunReturn: ICliApplicationDomainsMigratorRunReturn = await cliApplicationDomainsMigrator.run();
    if(cliApplicationDomainsMigratorRunReturn.error) throw cliApplicationDomainsMigratorRunReturn.error;
    // migrate schemas
    const cliSchemasMigrator = new CliSchemasMigrator({
        runId: this.cliMigrateManagerOptions.runId,
        cliMigratedApplicationDomains: cliApplicationDomainsMigratorRunReturn.cliApplicationDomainsMigratorRunMigrateReturn.cliMigratedApplicationDomains,
        cliSchemasMigrateConfig: this.cliMigrateManagerOptions.schemas,
      }, 
      ECliRunContext_RunMode.RELEASE,
    );
    const cliSchemasMigratorRunReturn: ICliSchemasMigratorRunReturn = await cliSchemasMigrator.run();
    if(cliSchemasMigratorRunReturn.error) throw cliSchemasMigratorRunReturn.error;
    // migrate events
    const cliEventsMigrator = new CliEventsMigrator({
        runId: this.cliMigrateManagerOptions.runId,
        cliMigratedApplicationDomains: cliApplicationDomainsMigratorRunReturn.cliApplicationDomainsMigratorRunMigrateReturn.cliMigratedApplicationDomains,
        cliMigratedSchemas: cliSchemasMigratorRunReturn.cliSchemasMigratorRunMigrateReturn.cliMigratedSchemas,
        cliMigratedEnums: cliEnumsMigratorRunReturn.cliEnumsMigratorRunMigrateReturn.cliMigratedEnums,
        cliEventsMigrateConfig: this.cliMigrateManagerOptions.events,
      }, 
      ECliRunContext_RunMode.RELEASE,
    );
    const cliEventsMigratorRunReturn: ICliEventsMigratorRunReturn = await cliEventsMigrator.run();
    if(cliEventsMigratorRunReturn.error) throw cliEventsMigratorRunReturn.error;
    // // migrate applications
    // const cliApplicationsMigrator = new CliApplicationsMigrator({
    //     runId: this.cliMigrateManagerOptions.runId,
    //     cliMigratedApplicationDomains: cliApplicationDomainsMigratorRunReturn.cliApplicationDomainsMigratorRunMigrateReturn.cliMigratedApplicationDomains,
    //     cliMigratedSchemas: cliSchemasMigratorRunReturn.cliSchemasMigratorRunMigrateReturn.cliMigratedSchemas,
    //     cliMigratedEnums: cliEnumsMigratorRunReturn.cliEnumsMigratorRunMigrateReturn.cliMigratedEnums,
    //     cliMigratedEvents: cliEventsMigratorRunReturn.
    //     cliApplicationsMigrateConfig: this.cliMigrateManagerOptions.applications,
    //   }, 
    //   ECliRunContext_RunMode.RELEASE,
    // );
    // const cliApplicationsMigratorRunReturn: ICliApplicationsMigratorRunReturn = await cliApplicationsMigrator.run();
    // if(cliApplicationsMigratorRunReturn.error) throw cliApplicationsMigratorRunReturn.error;

    CliRunContext.pop();
  }

  public run = async (): Promise<void> => {
    const funcName = "run";
    const logName = `${CliMigrateManager.name}.${funcName}()`;

    CliRunExecuteReturnLog.reset();
    CliRunSummary.reset();
    CliRunIssues.reset();
    // DEBUG
    // console.log(`\n${logName}: \nthis.cliMigrateManagerOptions=\n${JSON.stringify(this.cliMigrateManagerOptions, null, 2)}\n`);
    // process.exit(1);

    try {
      switch(this.cliMigrateManagerOptions.cliMigrateManagerRunState) {
        case ECliMigrateManagerRunState.PRESENT:
          await this.run_present();
          break;
        case ECliMigrateManagerRunState.ABSENT:
          await this.run_absent();
          break;
        default:
          CliUtils.assertNever(logName, this.cliMigrateManagerOptions.cliMigrateManagerRunState);
      }
      CliRunSummary.processedMigration(logName, this.cliMigrateManagerOptions);
    } catch (e) {
      CliRunSummary.processedMigration(logName, this.cliMigrateManagerOptions);
      CliLogger.info(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.TRANSACTION_LOG, details: { transactionLog: CliRunExecuteReturnLog.get() }}));
      throw e;
    }
  };
}
