/** extensions used by EP when exporting spec */

import { EpAsyncApiInternalError } from "../utils";

export enum EpGeneralExtensions {
  xEpApplicationDomainName = "x-ep-application-domain-name",
  // xEpApplicationDomainId = "x-ep-application-domain-id"
  xEpCustomAttributeNamePrefix = "x-ep-custom-attr-"
}

export enum EpParameterExtensions {
  xEpEnumName = "x-ep-enum-name",
  xEpParameterName = "x-ep-parameter-name",
  xEpEnumVersionDisplayName = "x-ep-enum-version-displayname",
  xEpStateName = "x-ep-enum-state-name",
  xEpStateId = "x-ep-enum-state-id",
  xEpSharedFlag = "x-ep-shared",
}
/** extensions used by EP when exporting spec */
export enum EpMessageExtensions {
  xEpEventName = "x-ep-event-name",
  xEpEventVersionDisplayName = "x-ep-event-version-displayname",
  xEpStateName = "x-ep-event-state-name",
  xEpStateId = "x-ep-event-state-id",
  xEpSharedFlag = "x-ep-shared",
}
/** extensions used by EP when exporting spec */
export enum EpSchemaExtensions {
  xEpSchemaName = "x-ep-schema-name",
  xEpSchemaVersionDisplayName = "x-ep-schema-version-displayname",
  xEpStateName = "x-ep-schema-state-name",
  xEpStateId = "x-ep-schema-state-id",
  xEpSharedFlag = "x-ep-shared",
  xEpSchemaId = "x-ep-schema-id",
  xEpSchemaVersionId = "x-ep-schema-version-id"
}
/** extensions used by EP when exporting spec */
export enum EpApiInfoExtensions {
  xEpApiInfoVersionDisplayName = "x-ep-displayname",
  xEpApiInfoStateName = "x-ep-state-name",
  xEpApiInfoStateId = "x-ep-state-id",
  xEpApiInfoSharedFlag = "x-ep-shared",
}

/** extensions used by this module when reading spec */
export enum EpAsyncApiChannelExtensions {
  xEpEventName = "x-ep-event-name",
}

export type EpAsyncApiStateIds = "1" | "2" | "3" | "4";
export type EpAsyncApiStateNames = "draft" | "released" | "deprecated" | "retired";
export const EpAsyncApiStateId2StateNameMap = new Map<EpAsyncApiStateIds, EpAsyncApiStateNames>([
  [ "1", "draft"],
  [ "2", "released"],
  [ "3", "deprecated"],
  [ "4", "retired"]
]);

export const EpAsyncApiStateName2StateIdMap = new Map<EpAsyncApiStateNames, EpAsyncApiStateIds>([
  [ "draft", "1"],
  [ "released", "2"],
  [ "deprecated", "3"],
  [ "retired", "4"]
]);

export const EpAsyncApiStateName2StateIdMap_get = (stateName: EpAsyncApiStateNames): EpAsyncApiStateIds => {
  const stateId = EpAsyncApiStateName2StateIdMap.get(stateName);
  if(stateId === undefined) throw new EpAsyncApiInternalError('EpAsyncApiStateName2StateIdMap_get', 'EpAsyncApiStateName2StateIdMap_get', {
    message: 'cannot find stateId for stateName', stateId, stateName
  });
  return stateId;
}

export const EpAsyncApiStateId2StateNameMap_get = (stateId: EpAsyncApiStateIds): EpAsyncApiStateNames => {
  const stateName = EpAsyncApiStateId2StateNameMap.get(stateId);
  if(stateName === undefined) throw new EpAsyncApiInternalError('EpAsyncApiStateId2StateNameMap_get', 'EpAsyncApiStateId2StateNameMap_get', {
    message: 'cannot find stateName for stateId', stateName, stateId
  });
  return stateName;
}

