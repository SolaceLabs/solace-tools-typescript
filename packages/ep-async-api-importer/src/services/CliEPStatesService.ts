import { EpSdkStatesService } from "@solace-labs/ep-sdk";
import { EpAsyncApiStateIds } from "@solace-labs/ep-asyncapi";
import { CliError, CliUtils } from "../cli-components";

export enum ECliImport_TargetLifecycleState {
  RELEASED = "released",
  DRAFT = "draft",
  DEPRECATED = "deprecated",
  RETIRED = "retired"
}

class CliEPStatesService {

  public getEpAsyncApiStateId(cliImportStateName: ECliImport_TargetLifecycleState): EpAsyncApiStateIds {
    const funcName = "getEpAsyncApiStateId";
    const logName = `${CliEPStatesService.name}.${funcName}()`;

    switch (cliImportStateName) {
      case ECliImport_TargetLifecycleState.DRAFT:
        return '1';
      case ECliImport_TargetLifecycleState.RELEASED:
        return '2';
      case ECliImport_TargetLifecycleState.DEPRECATED:
        return '3';
      case ECliImport_TargetLifecycleState.RETIRED:
        return '4';
      default:
        CliUtils.assertNever(logName, cliImportStateName);
    }
    throw new CliError(logName, "should never get here");
  }
  
  public getTargetLifecycleState({cliImport_TargetLifecycleState }: {
    cliImport_TargetLifecycleState: ECliImport_TargetLifecycleState;
  }): string {
    const funcName = "getTargetLifecycleState";
    const logName = `${CliEPStatesService.name}.${funcName}()`;

    switch (cliImport_TargetLifecycleState) {
      case ECliImport_TargetLifecycleState.DRAFT:
        return EpSdkStatesService.draftId;
      case ECliImport_TargetLifecycleState.RELEASED:
        return EpSdkStatesService.releasedId;
      case ECliImport_TargetLifecycleState.DEPRECATED:
        return EpSdkStatesService.deprecatedId;
      case ECliImport_TargetLifecycleState.RETIRED:
        return EpSdkStatesService.retiredId;
      default:
        CliUtils.assertNever(logName, cliImport_TargetLifecycleState);
    }
    throw new CliError(logName, "should never get here");
  }
}

export default new CliEPStatesService();
