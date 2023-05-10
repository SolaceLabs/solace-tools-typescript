import { CliEnumMigrator, ICliEnumMigratorRunReturn, ICliEnumsMigrateConfig } from "../migrators";
import { CliLogger, ECliStatusCodes } from "./CliLogger";
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
      runMode: ECliRunContext_RunMode.RELEASE,
    }});

    // cliMigratorOptions: ICliMigratorOptions, runMode: ECliRunContext_RunMode
    const cliEnumMigrator = new CliEnumMigrator({
        runId: this.cliMigrateManagerOptions.runId,
        applicationDomainPrefix: this.cliMigrateManagerOptions.epV2.applicationDomainPrefix,
        cliEnumsMigrateConfig: this.cliMigrateManagerOptions.enums,
      }, 
      ECliRunContext_RunMode.RELEASE,
    );
    const cliEnumMigratorRunReturn: ICliEnumMigratorRunReturn = await cliEnumMigrator.run();
    if(cliEnumMigratorRunReturn.error) throw cliEnumMigratorRunReturn.error;
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
