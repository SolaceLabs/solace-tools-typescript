import { 
  // SemVer, 
  // coerce as SemVerCoerce, 
  valid as SemVerValid 
} from "semver";

export class EpAsyncApiUtilsClass {

  public isSemVerFormat({ versionString }:{
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

  public assertNever = (extLogName: string, x: never): never => {
    const funcName = 'assertNever';
    const logName = `${EpAsyncApiUtilsClass.name}.${funcName}()`;
    throw new Error(`${logName}:${extLogName}: unexpected object: ${JSON.stringify(x)}`);
  }

}
export default new EpAsyncApiUtilsClass();
