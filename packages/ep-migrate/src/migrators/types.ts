import {
  EEpSdkStateDTONames,
  EEpSdk_VersionTaskStrategy,
} from "@solace-labs/ep-sdk";

export enum ECliMigrate_TargetVersionStrategies {
  BUMP_PATCH = EEpSdk_VersionTaskStrategy.BUMP_PATCH,
  BUMP_MINOR = EEpSdk_VersionTaskStrategy.BUMP_MINOR,
}

export enum ECliMigrate_TargetStates {
  RELEASED = EEpSdkStateDTONames.RELEASED,
  DRAFT = EEpSdkStateDTONames.DRAFT,
}

export interface ICliConfigEp2Versions {
  initialVersion: string;
  versionStrategy: ECliMigrate_TargetVersionStrategies;
  state: ECliMigrate_TargetStates;
}
