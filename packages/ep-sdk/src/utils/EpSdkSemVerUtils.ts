import { 
  SemVer, 
  // coerce as SemVerCoerce, 
  valid as SemVerValid 
} from "semver";
import { EpSdkUtils } from "./EpSdkUtils";

/** @category Utils */
export enum EEpSdk_VersionStrategy {
  BUMP_MINOR = "bump_minor",
  BUMP_PATCH = "bump_patch"
}

/** @category Utils */
export class EpSdkSemVerUtils {

  public static isSemVerFormat({ versionString }:{
    versionString: string;
  }): boolean {
    try {
      const s: string | null = SemVerValid(versionString);
      if(s === null) return false;
      return true;
    } catch(e) {
      return false;
    }
  }

  public static createNextVersionByStrategy({ fromVersionString, strategy }:{
    fromVersionString: string;
    strategy: EEpSdk_VersionStrategy;
  }): string {
    const funcName = 'createNextVersion';
    const logName = `${EpSdkSemVerUtils.name}.${funcName}()`;

    const versionSemVer = new SemVer(fromVersionString);
    switch(strategy) {
      case EEpSdk_VersionStrategy.BUMP_MINOR:
        versionSemVer.inc("minor");
        break;
      case EEpSdk_VersionStrategy.BUMP_PATCH:
        versionSemVer.inc("patch");
        break;
      default:
        /* istanbul ignore next */
        EpSdkUtils.assertNever(logName, strategy);
    }
    return versionSemVer.format();
  }

  public static is_NewVersion_GreaterThan_OldVersion({ newVersionString, oldVersionString }:{
    oldVersionString: string;
    newVersionString: string;
  }): boolean {
    const oldVersionSemVer = new SemVer(oldVersionString);
    if(oldVersionSemVer.compare(newVersionString) === -1) return true;
    return false;
  }

}
