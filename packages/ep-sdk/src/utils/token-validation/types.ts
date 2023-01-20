/** @category Utils */
export enum EEpSdkPermissions {
  WRITE = "WRITE",
  READ = "READ",
  DELETE = "DELETE",
}
/** @category Utils */
export type TEpSdkPermissionResult = {
  permission: EEpSdkPermissions;
  access: boolean;
}
/** @category Utils */
export enum TEpSdkPermissionResources {
  ApplicationDomains = "ApplicationDomains",
  Events = "Events",
  EventApis = "EventApis",
  Applications = "Applications",
  EventApiProducts = "EventApiProducts",
}
/** @category Utils */
export type TEpSdkPermissionValidationLogEntry = {
  resource: string;
  permissions: Array<TEpSdkPermissionResult>;
}

