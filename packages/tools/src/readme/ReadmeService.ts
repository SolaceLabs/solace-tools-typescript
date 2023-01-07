import fs from 'fs';
import s from 'shelljs';
import { createInterface } from "readline";


class ReadmeService {

  private async processReadmeFile({ readmeFile, readmeBackupFile, searchOpenApiVersion, replaceOpenApiVersion, readmeVersionDescription }:{
    readmeFile: string;
    readmeBackupFile: string;
    searchOpenApiVersion: string;
    replaceOpenApiVersion: string;
    readmeVersionDescription: string;
  }): Promise<void> {
    const funcName = 'processReadmeFile';
    const logName = `${ReadmeService.name}.${funcName}()`;

    try {
      let found: boolean = false;
      // backup
      s.cp(readmeFile, readmeBackupFile);

      let newReadmeString: string = '';

      const lineReader = createInterface({
        input: fs.createReadStream(readmeFile),
        crlfDelay: Infinity,
      });

      for await (const line of lineReader) {
        if(line.includes(searchOpenApiVersion)) {
          found = true;
          newReadmeString += replaceOpenApiVersion;
        }
        else newReadmeString += line;
        newReadmeString += "\n";
      }
      if(!found) throw new Error(`${logName}: could not find readmeVersionDescription=${readmeVersionDescription} in readmeFile=${readmeFile}`);
      fs.writeFileSync(readmeFile, newReadmeString);    
    } catch(e) {
      console.error(`${logName}: error=${e}`);
      throw e;
    }
  }
  /**
   * Sets Open API version in 
   * - README.md
   * - README.typedoc.md
   */
  public async setOpenApiVersion({ readmeDir, openApiVersion, readmeVersionDescription }:{
    readmeDir: string;
    openApiVersion: string;
    readmeVersionDescription: string;
  }): Promise<void> {
    const funcName = 'setOpenApiVersion';
    const logName = `${ReadmeService.name}.${funcName}()`;

    console.log(`${logName}: starting ...`);

    const readmeFile = `${readmeDir}/README.md`;
    const readmeBackupFile = `${readmeDir}/.backup.README.md`;
    const readmeTypedocFile = `${readmeDir}/typedoc.README.md`;
    const readmeTypedocBackupFile = `${readmeDir}/.backup.typedoc.README.md`;
    const searchOpenApiVersion = readmeVersionDescription;
    const replaceOpenApiVersion = `**${readmeVersionDescription}: ${openApiVersion}**`;

    console.log(`${logName}: input=${JSON.stringify({
      readmeFile: readmeFile,
      readmeTypedocFile: readmeTypedocFile,
      openApiVersion: openApiVersion,
    }, null, 2)}`);

    let xvoid: void = await this.processReadmeFile({
      readmeFile: readmeFile,
      readmeBackupFile: readmeBackupFile,
      readmeVersionDescription: readmeVersionDescription,
      searchOpenApiVersion: searchOpenApiVersion,
      replaceOpenApiVersion: replaceOpenApiVersion
    });

    xvoid = await this.processReadmeFile({
      readmeFile: readmeTypedocFile,
      readmeBackupFile: readmeTypedocBackupFile,
      readmeVersionDescription: readmeVersionDescription,
      searchOpenApiVersion: searchOpenApiVersion,
      replaceOpenApiVersion: replaceOpenApiVersion
    });

    console.log(`${logName}: success.`);
  }

}

export default new ReadmeService();