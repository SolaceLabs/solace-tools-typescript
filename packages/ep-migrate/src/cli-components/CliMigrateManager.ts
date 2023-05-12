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
} from "../migrators";
import CliConfig from "./CliConfig";
import { 
  CliLogger, 
  ECliStatusCodes 
} from "./CliLogger";
import CliRunContext, {
  ECliRunContext_RunMode,
  ICliRunContext,
} from "./CliRunContext";
import CliRunExecuteReturnLog from "./CliRunExecuteReturnLog";
import CliRunSummary, { ECliRunSummary_Type } from "./CliRunSummary";

export enum ECliMigrateManagerMode {
  RELEASE_MODE = "release_mode",
  // TEST_MODE = "test_mode",
  // TEST_MODE_KEEP = "test_mode_keep",
}
export interface ICliMigrateManagerOptions {
  appName: string;
  runId: string;
  cliMigrateManagerMode: ECliMigrateManagerMode;
  epV2: {
    applicationDomainPrefix?: string;
  },
  enums: ICliEnumsMigrateConfig;
  applicationDomains: ICliApplicationDomainsMigrateConfig;
  schemas: ICliSchemasMigrateConfig;
}

export class CliMigrateManager {
  private cliMigrateManagerOptions: ICliMigrateManagerOptions;

  constructor(cliMigrateManagerOptions: ICliMigrateManagerOptions) {
    this.cliMigrateManagerOptions = cliMigrateManagerOptions;
  }

  private run_release_mode = async(): Promise<void> => {
    // const funcName = "run_release_mode";
    // const logName = `${CliMigrateManager.name}.${funcName}()`;

    const rctxt: ICliRunContext = {
      runId: this.cliMigrateManagerOptions.runId,
      runMode: ECliRunContext_RunMode.RELEASE,
    };
    CliRunContext.push(rctxt);
    CliRunSummary.startRun({cliRunSummary_StartRun: {
      type: ECliRunSummary_Type.StartRun,
      epV1OrganizationInfo: CliConfig.getCliConfig().epV1Config.organizationInfo,
      epV2OrganizationInfo: CliConfig.getCliConfig().epV2Config.organizationInfo,
      runMode: ECliRunContext_RunMode.RELEASE,
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

    CliRunContext.pop();
  }

  public run = async (): Promise<void> => {
    const funcName = "run";
    const logName = `${CliMigrateManager.name}.${funcName}()`;

    CliRunExecuteReturnLog.reset();
    CliRunSummary.reset();

    try {
      await this.run_release_mode();
      CliRunSummary.processedMigration(logName, this.cliMigrateManagerOptions);
    } catch (e) {
      CliRunSummary.processedMigration(logName, this.cliMigrateManagerOptions);
      CliLogger.info(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.TRANSACTION_LOG, details: { transactionLog: CliRunExecuteReturnLog.get() }}));
      throw e;
    }
  };
}
