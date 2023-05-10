import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class CliUtils {

  public static getUUID = (): string => {
    return uuidv4();
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

  /* istanbul ignore next */
  public static assertNever = (extLogName: string, x: never): never => {
    const funcName = 'assertNever';
    const logName = `${CliUtils.name}.${funcName}()`;
    throw new Error(`${logName}:${extLogName}: unexpected object: ${JSON.stringify(x)}`);
  }

}