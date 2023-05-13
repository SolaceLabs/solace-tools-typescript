import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// use with // @ts-ignore if getting Type instantiation is excessively deep and possibly infinite.  TS2589
type DotPrefix<T extends string> = T extends "" ? "" : `.${T}`;
type DotNestedKeys<T> = (T extends object ?
    { [K in Exclude<keyof T, symbol>]: `${K}${DotPrefix<DotNestedKeys<T[K]>>}` }[Exclude<keyof T, symbol>]
    : "") extends infer D ? Extract<D, string> : never;
type DeepPartial<T> = T extends object ? {
      [P in keyof T]?: DeepPartial<T[P]>;
} : T;

export class CliUtils {

  public static getUUID = (): string => { return uuidv4(); }

  // public getShortUUID = (): string => { return short.generate(); }

  public static nameOf<T>(name: DotNestedKeys<DeepPartial<T>>) {
    return name;
  }

  /**
   * Use for types of Record<string, T>.
   * @example
   * type T = {
   *  one: {
   *    two: {
   *      three: Record<string, T>;
   *    }
   *  }
   * }
   * const name = EpDevPUtils.nameOfStringRecord<Record<T>("one.two.three.x");
   */
  public static nameOfStringRecord<T>(name: DotNestedKeys<DeepPartial<T>>) {
    const xname: string = CliUtils.nameOf(name);
    const names = xname.split('.');
    names.pop();
    return names.join('.');
  }


  public static validateFilePathWithReadPermission = (filePath: string): string | undefined => {
    try {
      const absoluteFilePath = path.resolve(filePath);
      // console.log(`validateFilePathWithReadPermission: absoluteFilePath=${absoluteFilePath}`);
      fs.accessSync(absoluteFilePath, fs.constants.R_OK);
      return absoluteFilePath;
    } catch (e) {
      // console.log(`validateFilePathWithReadPermission: filePath=${filePath}`);
      // console.log(`e=${e}`);
      return undefined;
    }
  }

  public static validateUrlFormat = (url: string): string | undefined => {
    try {
      return new URL(url).toString();
    } catch(e) {
      return undefined;
    }
  }

  public static ensureDirExists = (baseDir: string, subDir?: string): string => {
    const absoluteDir = subDir ? path.resolve(baseDir, subDir) : path.resolve(baseDir);
    if(!fs.existsSync(absoluteDir)) fs.mkdirSync(absoluteDir, { recursive: true });
    fs.accessSync(absoluteDir, fs.constants.W_OK);
    return absoluteDir;
  }

  public static ensureDirOfFilePathExists = (filePath: string): string => {
    const normalizedPath = path.normalize(filePath);
    const dirName = path.dirname(normalizedPath);
    const fileName = path.basename(normalizedPath)
    const absoluteDir = CliUtils.ensureDirExists(dirName);
    return `${absoluteDir}/${fileName}`;
  }

  public static readYamlFile = (filePath: string): any => {
    const b: Buffer = fs.readFileSync(filePath);
    return yaml.load(b.toString());
  }

  public static getFileContent = (filePath: string): string => {
    const b: Buffer = fs.readFileSync(filePath);
    return b.toString();
  }

  /* istanbul ignore next */
  public static assertNever = (extLogName: string, x: never): never => {
    const funcName = 'assertNever';
    const logName = `${CliUtils.name}.${funcName}()`;
    throw new Error(`${logName}:${extLogName}: unexpected object: ${JSON.stringify(x)}`);
  }

}