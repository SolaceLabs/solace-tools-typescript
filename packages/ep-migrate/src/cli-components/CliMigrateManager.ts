import { 
  EEpSdkCustomAttributeEntityTypes, 
  EEpSdkTask_TargetState, 
  EpSdkCustomAttributeDefinitionTask, 
} from "@solace-labs/ep-sdk";
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
  CliApplicationsMigrator,
  ICliApplicationsMigratorRunReturn,
  ICliApplicationsMigrateConfig,
} from "../migrators";
import { 
  CliAbsentService,
} from "../services";
import CliConfig, { 
} from "./CliConfig";
import { 
  CliInternalCodeInconsistencyError,
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
import { CustomAttributeDefinition } from "@solace-labs/ep-openapi-node";

export enum ECliMigrateManagerRunState {
  PRESENT = "present",
  ABSENT = "absent",
}

export enum ECliMigrateManagerMode {
  RELEASE_MODE = "release_mode",
  // TEST_MODE = "test_mode",
  // TEST_MODE_KEEP = "test_mode_keep",
}
export interface ICliMigrateManagerOptionsEpV1 {
  applicationDomainNames?: {
    include?: Array<string>;
    exclude?: Array<string>;
  }
}
export interface ICliMigrateManagerOptions {
  appName: string;
  runId: string;
  absentRunId?: string;
  cliMigrateManagerMode: ECliMigrateManagerMode;
  cliMigrateManagerRunState: ECliMigrateManagerRunState;
  epV1?: ICliMigrateManagerOptionsEpV1;
  epV2: {
    applicationDomainPrefix?: string;
  },
  enums: ICliEnumsMigrateConfig;
  applicationDomains: ICliApplicationDomainsMigrateConfig;
  schemas: ICliSchemasMigrateConfig;
  events: ICliEventsMigrateConfig;
  applications: ICliApplicationsMigrateConfig;
}

export class CliMigrateManager {
  private cliMigrateManagerOptions: ICliMigrateManagerOptions;
  private startTimestamp: number;

  private getDurationSecs(): number {
    const endTimestamp = Date.now();
    return (endTimestamp - this.startTimestamp) / 1000;
  }

  public static EpV2RunIdCustomAttributeDefinition = {
    name: "ep-migrate-run-id",
    scope: CustomAttributeDefinition.scope.ORGANIZATION,
    valueType: CustomAttributeDefinition.valueType.STRING,
    associatedEntityTypes: [ 
      EEpSdkCustomAttributeEntityTypes.APPLICATION_DOMAIN,
      EEpSdkCustomAttributeEntityTypes.APPLICATION,
      EEpSdkCustomAttributeEntityTypes.APPLICATION_VERSION,
      EEpSdkCustomAttributeEntityTypes.EVENT,
      EEpSdkCustomAttributeEntityTypes.EVENT_VERSION,
      EEpSdkCustomAttributeEntityTypes.SCHEMA_OBJECT,
      EEpSdkCustomAttributeEntityTypes.SCHEMA_VERSION,
      EEpSdkCustomAttributeEntityTypes.ENUM,
      EEpSdkCustomAttributeEntityTypes.ENUM_VERSION,
    ],
  }

  constructor(cliMigrateManagerOptions: ICliMigrateManagerOptions) {
    this.cliMigrateManagerOptions = cliMigrateManagerOptions;
  }

  private async absentGlobalCustomAttributeDefinitions(): Promise<void> {
    // runId
    // if we delete it, then no info left on run ids, skip
    const deleteRunId = false;
    if(deleteRunId) {
      const epSdkCustomAttributeDefinitionTask = new EpSdkCustomAttributeDefinitionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        attributeName: CliMigrateManager.EpV2RunIdCustomAttributeDefinition.name,
        customAttributeDefinitionObjectSettings: {
          associatedEntityTypes: CliMigrateManager.EpV2RunIdCustomAttributeDefinition.associatedEntityTypes,
          scope: CliMigrateManager.EpV2RunIdCustomAttributeDefinition.scope,
          valueType: CliMigrateManager.EpV2RunIdCustomAttributeDefinition.valueType,
        },
      });
      await epSdkCustomAttributeDefinitionTask.execute();  
    }
  }

  private run_absent = async(): Promise<void> => {
    const funcName = "run_absent";
    const logName = `${CliMigrateManager.name}.${funcName}()`;

    try {
      await CliConfig.validateAbsent();
    } catch(e) {
      CliLogger.error(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.CONFIG_ERROR, details: { error: e }}));
      throw e;
    }

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

    if(this.cliMigrateManagerOptions.absentRunId !== undefined) {
      await CliAbsentService.absent_EpV2_ByRunId(this.cliMigrateManagerOptions.absentRunId);
    } else if(this.cliMigrateManagerOptions.epV2.applicationDomainPrefix !== undefined) {
      await CliAbsentService.absent_EpV2_PrefixedApplicationDomains(this.cliMigrateManagerOptions.epV2.applicationDomainPrefix);
    } else throw new CliInternalCodeInconsistencyError(logName, {
      message: 'one of must be defined',
      absentRunId: `${CliUtils.nameOf<ICliMigrateManagerOptions>("absentRunId")}`,
      applicationDomainPrefix: `${CliUtils.nameOf<ICliMigrateManagerOptions>("epV2.applicationDomainPrefix")}`
    });

    await this.absentGlobalCustomAttributeDefinitions();

    CliRunContext.pop();
  }

  private async presentGlobalCustomAttributeDefinitions(): Promise<void> {
    // const funcName = "presentGlobalCustomAttributeDefinitions";
    // const logName = `${CliMigrateManager.name}.${funcName}()`;
    // runId
    const epSdkCustomAttributeDefinitionTask = new EpSdkCustomAttributeDefinitionTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      attributeName: CliMigrateManager.EpV2RunIdCustomAttributeDefinition.name,
      customAttributeDefinitionObjectSettings: {
        associatedEntityTypes: CliMigrateManager.EpV2RunIdCustomAttributeDefinition.associatedEntityTypes,
        scope: CliMigrateManager.EpV2RunIdCustomAttributeDefinition.scope,
        valueType: CliMigrateManager.EpV2RunIdCustomAttributeDefinition.valueType,
      },
    });
    await epSdkCustomAttributeDefinitionTask.execute();
  }

  private run_present = async(): Promise<void> => {
    const funcName = "run_present";
    const logName = `${CliMigrateManager.name}.${funcName}()`;

    try {
      await CliConfig.validatePresent();
    } catch(e) {
      CliLogger.error(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.CONFIG_ERROR, details: { error: e }}));
      throw e;
    }

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
    // create global custom attribute definitions
    await this.presentGlobalCustomAttributeDefinitions();
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
    // migrate applications
    const cliApplicationsMigrator = new CliApplicationsMigrator({
        runId: this.cliMigrateManagerOptions.runId,
        cliMigratedApplicationDomains: cliApplicationDomainsMigratorRunReturn.cliApplicationDomainsMigratorRunMigrateReturn.cliMigratedApplicationDomains,
        cliMigratedSchemas: cliSchemasMigratorRunReturn.cliSchemasMigratorRunMigrateReturn.cliMigratedSchemas,
        cliMigratedEnums: cliEnumsMigratorRunReturn.cliEnumsMigratorRunMigrateReturn.cliMigratedEnums,
        cliMigratedEvents: cliEventsMigratorRunReturn.cliEventsMigratorRunMigrateReturn.cliMigratedEvents,
        cliApplicationsMigrateConfig: this.cliMigrateManagerOptions.applications,
      }, 
      ECliRunContext_RunMode.RELEASE,
    );
    const cliApplicationsMigratorRunReturn: ICliApplicationsMigratorRunReturn = await cliApplicationsMigrator.run();
    if(cliApplicationsMigratorRunReturn.error) throw cliApplicationsMigratorRunReturn.error;

    CliRunContext.pop();
  }

  public run = async (): Promise<void> => {
    const funcName = "run";
    const logName = `${CliMigrateManager.name}.${funcName}()`;

    CliRunExecuteReturnLog.reset();
    CliRunSummary.reset();
    CliRunIssues.reset();
    this.startTimestamp = Date.now();
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
          /* istanbul ignore next */
          CliUtils.assertNever(logName, this.cliMigrateManagerOptions.cliMigrateManagerRunState);
      }
      CliRunSummary.processedMigration(logName, this.cliMigrateManagerOptions, this.getDurationSecs());
    } catch (e) {
      CliRunSummary.processedMigration(logName, this.cliMigrateManagerOptions, this.getDurationSecs());
      CliLogger.info(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.TRANSACTION_LOG, details: { transactionLog: CliRunExecuteReturnLog.get() }}));
      throw e;
    }
  };
}
