import { 
  EpSdkFeatureNotSupportedError, 
  EpSdkInvalidSemVerStringError, 
  EpSdkVersionTaskStrategyValidationError, 
  EpSdkSemVerUtils,
  EEpSdk_VersionStrategy
} from "../utils";
import { 
  EEpSdkTask_Action, 
  EpSdkTask, 
  IEpSdkTask_Config, 
  IEpSdkTask_DeleteFuncReturn, 
  IEpSdkTask_EpObjectKeys, 
  IEpSdkTask_GetFuncReturn 
} from "./EpSdkTask";


/** @category Tasks */
export enum EEpSdk_VersionTaskStrategy {
  BUMP_MINOR = "bump_minor",
  BUMP_PATCH = "bump_patch",
  EXACT_VERSION = "exact_version"
}

/** @category Tasks */
export interface IEpSdkVersionTask_Config extends IEpSdkTask_Config {
  versionString?: string;
  versionStrategy?: EEpSdk_VersionTaskStrategy;
}
/** @category Tasks */
export interface IEpSdkVersionTask_EpObjectKeys extends IEpSdkTask_EpObjectKeys {
  epVersionObjectId: string;
}

/** @category Tasks */
export abstract class EpSdkVersionTask extends EpSdkTask {
  protected versionString = '1.0.0';
  protected versionStrategy: EEpSdk_VersionTaskStrategy = EEpSdk_VersionTaskStrategy.BUMP_PATCH;

  protected abstract transform_EpSdkTask_Config(epSdkTask_Config: IEpSdkTask_Config): IEpSdkTask_Config;
  
  constructor(epSdkVersionTask_Config: IEpSdkVersionTask_Config) {
    super(epSdkVersionTask_Config);
    if(epSdkVersionTask_Config.versionString !== undefined) this.versionString = epSdkVersionTask_Config.versionString;
    if(epSdkVersionTask_Config.versionStrategy !== undefined) this.versionStrategy = epSdkVersionTask_Config.versionStrategy;
  }

  protected async validateTaskConfig(): Promise<void> {
    const funcName = 'validateTaskConfig';
    const logName = `${EpSdkVersionTask.name}.${funcName}()`;
    const xvoid: void = await super.validateTaskConfig();
    xvoid;
    if(!EpSdkSemVerUtils.isSemVerFormat({ versionString: this.versionString })) throw new EpSdkInvalidSemVerStringError(logName, this.constructor.name, undefined, this.versionString);
  }

  protected createNextVersionWithStrategyValidation({ existingObjectVersionString }:{
    existingObjectVersionString: string;
  }): string {
    const funcName = 'createNextVersionWithStrategyValidation';
    const logName = `${EpSdkVersionTask.name}.${funcName}()`;

    if(this.versionStrategy === EEpSdk_VersionTaskStrategy.EXACT_VERSION) {
      // check if requested versionString > existingObjectVersionString
      if(!EpSdkSemVerUtils.is_NewVersion_GreaterThan_OldVersion({
        newVersionString: this.versionString,
        oldVersionString: existingObjectVersionString
      })) {
        throw new EpSdkVersionTaskStrategyValidationError(logName, this.constructor.name, undefined, {
          versionString: this.versionString,
          versionStrategy: this.versionStrategy,
          existingVersionString: existingObjectVersionString,
          transactionLogData: this.epSdkTask_TransactionLog.getData(),
        });  
      }
      // return requested versionString
      return this.versionString;
    }
    // return requested versionString or a bumped one
    if(EpSdkSemVerUtils.is_NewVersion_GreaterThan_OldVersion({
      newVersionString: this.versionString,
      oldVersionString: existingObjectVersionString
    })) return this.versionString;
    else return EpSdkSemVerUtils.createNextVersionByStrategy({
      fromVersionString: existingObjectVersionString,
      strategy: (this.versionStrategy as unknown) as EEpSdk_VersionStrategy,
    });
  }

  protected getCreateFuncAction(): EEpSdkTask_Action {
    if(this.isCheckmode()) return EEpSdkTask_Action.WOULD_CREATE_FIRST_VERSION;
    return EEpSdkTask_Action.CREATE_FIRST_VERSION;
  }

  protected getUpdateFuncAction(wouldFailOnExactVersionRequirement?: boolean): EEpSdkTask_Action {
    if(this.isCheckmode()) {
      if(!wouldFailOnExactVersionRequirement) return EEpSdkTask_Action.WOULD_CREATE_NEW_VERSION;
      else return EEpSdkTask_Action.WOULD_FAIL_CREATE_NEW_VERSION_ON_EXACT_VERSION_REQUIREMENT;
    }
    return EEpSdkTask_Action.CREATE_NEW_VERSION;
  }

  protected getDeleteFuncAction(): EEpSdkTask_Action {
    if(this.isCheckmode()) return EEpSdkTask_Action.WOULD_DELETE_VERSION;
    return EEpSdkTask_Action.DELETE_VERSION;
  }

  protected async deleteFunc(epSdkTask_GetFuncReturn: IEpSdkTask_GetFuncReturn): Promise<IEpSdkTask_DeleteFuncReturn> {
    const funcName = 'deleteFunc';
    const logName = `${EpSdkVersionTask.name}.${funcName}()`;
    epSdkTask_GetFuncReturn;
    throw new EpSdkFeatureNotSupportedError(logName, this.constructor.name, undefined, 'deleting a version object is not supported');
  }

}
