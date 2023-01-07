import { SemVer } from "semver";
import { 
  EpSdkApiContentError 
} from "../utils";
import { EpSdkServiceClass } from "./EpSdkService";

/** @category Services */
export class EpSdkVersionServiceClass extends EpSdkServiceClass {

  public getLatestEpObjectVersionFromList = ({ epObjectVersionList }: {
    epObjectVersionList: Array<any>;
  }): any | undefined => {
    if(epObjectVersionList.length === 0) return undefined;
    // sort the list
    const sortedList = this.sortEpObjectVersionListByVersion({ epObjectVersionList: epObjectVersionList });
    // get the latest
    return sortedList[0];
  }

  /**
   * Returns sorted list by version in semVer format. 
   * Sorts descending, i.e. latest version is the first element in the returned list.
   */
  public sortEpObjectVersionListByVersion = ({ epObjectVersionList }: {
    epObjectVersionList: Array<any>;
  }): any | undefined => {
    const funcName = 'sortEpObjectVersionListByVersion';
    const logName = `${EpSdkVersionServiceClass.name}.${funcName}()`;
    return epObjectVersionList.sort( (e1, e2) => {
      /* istanbul ignore next */
      if(e1.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'e1.version === undefined', {
        epObjectVersion: e1
      });
      /* istanbul ignore next */
      if(e2.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'e2.version === undefined', {
        epObjectVersion: e2
      });
      const e1SemVer = new SemVer(e1.version);
      const e2SemVer = new SemVer(e2.version);
      return e2SemVer.compare(e1SemVer);
    });
  }

  protected getEpObjectVersionFromList = ({ epObjectVersionList, versionString }: {
    epObjectVersionList: Array<any>;
    versionString: string;
  }): any | undefined => {
    const funcName = 'getEpObjectVersionFromList';
    const logName = `${EpSdkVersionServiceClass.name}.${funcName}()`;
    const found = epObjectVersionList.find( (epObjectVersion) => {
      /* istanbul ignore next */
      if(epObjectVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epObjectVersion.version === undefined', {
        epObjectVersion: epObjectVersion
      });
      return epObjectVersion.version === versionString;
    });
    return found;
  }


}


