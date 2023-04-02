import { EpSdkStatesService } from "@solace-labs/ep-sdk";
import { CliError, CliUtils } from "../cli-components";

export enum ECliAssetImport_TargetLifecycleState {
  RELEASED = "released",
  DRAFT = "draft",
}

class CliEPStatesService {
  public getTargetLifecycleState({cliAssetImport_TargetLifecycleState }: {
    cliAssetImport_TargetLifecycleState: ECliAssetImport_TargetLifecycleState;
  }): string {
    const funcName = "getTargetLifecycleState";
    const logName = `${CliEPStatesService.name}.${funcName}()`;

    switch (cliAssetImport_TargetLifecycleState) {
      case ECliAssetImport_TargetLifecycleState.DRAFT:
        return EpSdkStatesService.draftId;
      case ECliAssetImport_TargetLifecycleState.RELEASED:
        return EpSdkStatesService.releasedId;
      default:
        CliUtils.assertNever(logName, cliAssetImport_TargetLifecycleState);
    }
    throw new CliError(logName, "should never get here");
  }
}

export default new CliEPStatesService();
