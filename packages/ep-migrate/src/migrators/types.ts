import {
  EEpSdkStateDTONames,
  EEpSdk_VersionTaskStrategy,
} from "@solace-labs/ep-sdk";
import { 
  ApplicationDomain, 
  SchemaObject, 
  SchemaVersion,
  TopicAddressEnum,
  TopicAddressEnumVersion,
  Event as EpEvent,
  EventVersion,
  Application,
  ApplicationVersion
} from "@solace-labs/ep-openapi-node";
import { 
  EpV1ApplicationDomain, 
  EpV1Enum, 
  EpV1EventSchema,
  EpV1Event,
  EpV1Application
} from "../epV1";

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

export interface ICliMigratedEnum {
  epV1Enum: EpV1Enum;
  epV2Enum: {
    topicAddressEnum: TopicAddressEnum;
    topicAddressEnumVersion: TopicAddressEnumVersion;
  }
}

export interface ICliMigratedApplicationDomain {
  epV1ApplicationDomain: EpV1ApplicationDomain;
  epV2ApplicationDomain: ApplicationDomain;  
}

export interface ICliMigratedSchema {
  epV1Schema: EpV1EventSchema;
  epV2Schema: {
    schemaObject: SchemaObject;
    schemaVersion: SchemaVersion;
  }
}

export interface ICliMigratedEvent {
  epV1Event: EpV1Event;
  epV2Event: {
    eventObject: EpEvent;
    eventVersion: EventVersion;
  }
}

export interface ICliMigratedApplication {
  epV1Application: EpV1Application;
  epV2Application: {
    applicationObject: Application;
    applicationVersion: ApplicationVersion;
  }
}
