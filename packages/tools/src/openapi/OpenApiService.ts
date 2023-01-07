import s from 'shelljs';
import fs from 'fs';

class OpenApiService {

  public getOpenApiVersion({ inputApiSpecFile }:{
    inputApiSpecFile: string;
  }): string {
    const funcName = 'getOpenApiVersion';
    const logName = `${OpenApiService.name}.${funcName}()`;

    console.log(`${logName}: starting ...`);
    console.log(`${logName}: spec: ${inputApiSpecFile}`);

    try {
      const apiSpec: any = require(inputApiSpecFile);
      const apiSpecVersion: string = apiSpec.info.version;
      console.log(`${logName}: apiSpecVersion = ${apiSpecVersion}`);
      console.log(`${logName}: success.`);
      return apiSpecVersion;
    } catch(e) {
      console.log(`${logName}: error=${e}`);
      throw e;
    }
  }

}

export default new OpenApiService();