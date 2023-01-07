import fs from 'fs';
import path from 'path';
import glob from 'glob';
import { v4 as uuidv4 } from 'uuid';
import { CliUsageError } from './CliError';

export class CliUtils {

  public static getUUID = (): string => {
    return uuidv4();
  }

  public static createFileList = (filePattern: string): Array<string> => {
    const funcName = 'createFileList';
    const logName = `${CliUtils.name}.${funcName}()`;
    const fileList: Array<string> = glob.sync(filePattern);
    if(fileList.length === 0) throw new CliUsageError(logName, 'No files found for pattern', {
      filePattern: filePattern,
    });
    for(const filePath of fileList) {
      const x: string | undefined = CliUtils.validateFilePathWithReadPermission(filePath);
      if(x === undefined) throw new CliUsageError(logName, 'File does not have read permissions', {
        file: filePath,
      });
    }
    return fileList;
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

  public static convertStringToFilePath(str: string): string {
    //eslint-disable-next-line
    return str.replaceAll(/[^0-9a-zA-Z\/\.]+/g, '-');
  }

  // public static readFileContentsAsJson = (filePath: string): any => {
  //   const b: Buffer = fs.readFileSync(filePath);
  //   try {
  //     return JSON.parse(b.toString());
  //   } catch(e) {
  //     throw e;
  //   }
  // }

  public static saveContents2File = ({ content, filePath}: {
    content: any;
    filePath: string;
  }) => {
    fs.writeFileSync(filePath, content, { encoding: "utf8"});
  }

  /* istanbul ignore next */
  public static assertNever = (extLogName: string, x: never): never => {
    const funcName = 'assertNever';
    const logName = `${CliUtils.name}.${funcName}()`;
    throw new Error(`${logName}:${extLogName}: unexpected object: ${JSON.stringify(x)}`);
  }

}