import { 
  EEpSdkPermissions, 
  TEpSdkPermissionResources, 
  TEpSdkPermissionResult, 
  TEpSdkPermissionValidationLogEntry 
} from "./types";

/** @category Utils */
export class EpSdkValidationLogClass {
  private validationLog: Array<TEpSdkPermissionValidationLogEntry> = [];

  public resetValidationLog = (): void => {
    this.validationLog = [];
  }

  public getValidationLog = (): Array<TEpSdkPermissionValidationLogEntry> => {
    return this.validationLog;
  }

  public getValidationLogEntry = (resource: TEpSdkPermissionResources): TEpSdkPermissionValidationLogEntry | undefined => {
    return this.validationLog.find( (x) => x.resource === resource );
  }

  public getValidationPermissionResult = (resource: TEpSdkPermissionResources, permission: EEpSdkPermissions): TEpSdkPermissionResult | undefined => {
    const entry: TEpSdkPermissionValidationLogEntry | undefined = this.validationLog.find( (x) => x.resource === resource );
    if(entry === undefined) return undefined;
    return entry.permissions.find( (x) => x.permission === permission);
  }

  /**
   * Returns access for the resource in the log.
   * @param resource 
   * @param permission 
   * @returns access for the resource in the log. if resource is not found, returns false.
   */
  public getValidationPermissionResultAccess = (resource: TEpSdkPermissionResources, permission: EEpSdkPermissions): boolean => {
    const epSdkPermissionResult: TEpSdkPermissionResult | undefined = this.getValidationPermissionResult(resource, permission);
    if(epSdkPermissionResult) return epSdkPermissionResult.access;
    return false;
  }

  public addValidationToLog = ({ resource, permissionResult }:{
    resource: TEpSdkPermissionResources;
    permissionResult: TEpSdkPermissionResult;
  }): void => {
    const idx = this.validationLog.findIndex( (x) => x.resource === resource);
    if(idx === -1) this.validationLog.push({ resource: resource, permissions: [permissionResult] });
    else {
      const pIdx = this.validationLog[idx].permissions.findIndex( (x) => x.permission === permissionResult.permission );
      if(pIdx === -1) this.validationLog[idx].permissions.push(permissionResult);
      else this.validationLog[idx].permissions[pIdx] = permissionResult;
    }
  }
}
/** @category Utils */
export default new EpSdkValidationLogClass();

