import s from 'shelljs';
import path from 'path';
import { 
  GenerateOpenApiService,
  OpenApiService,
  PackageJsonService,
  ReadmeService,
} from '@internal/tools/src';

const scriptName: string = path.basename(__filename);
const scriptDir: string = path.dirname(__filename);
const rootDir: string = `${scriptDir}/../../../`;
// files & dirs
const packageDir = `${scriptDir}/..`;
const inputApiSpecFile = `${packageDir}/openapi-spec/openapi-spec.json`;
const generatedApiSpecFile = `${packageDir}/openapi-spec/generated.openapi-spec.json`;
const outputOpenApiClientSrcDir = 'generated-src';
// description
const packageJsonDescription = "Solace Event Portal Runtime OpenAPI Client for NodeJS (Typescript)";
// readme version description
const readmeVersionDescription = "Event Portal Runtime OpenAPI Version";

const prepare = () => {
  const funcName = 'prepare';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  if(s.rm('-rf', outputOpenApiClientSrcDir).code !== 0) process.exit(1);
  if(s.mkdir('-p', outputOpenApiClientSrcDir).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}

const main = async() => {
  const funcName = 'main';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  
  prepare();
  
  GenerateOpenApiService.generateOpenApiSpec({
    inputApiSpecFile: inputApiSpecFile,
    outputApiSpecFile: generatedApiSpecFile
  });

  const xvoid: void = await GenerateOpenApiService.generateOpenApiClientNode({
    inputApiSpecFile: generatedApiSpecFile,
    outputOpenApiClientSrcDir: outputOpenApiClientSrcDir
  });

  GenerateOpenApiService.postProcessOpenApiClientNode({
    outputOpenApiClientSrcDir: outputOpenApiClientSrcDir
  });

  const apiVersion: string = OpenApiService.getOpenApiVersion({
    inputApiSpecFile: generatedApiSpecFile
  });

  PackageJsonService.setVersion({
    packageJsonDescription: packageJsonDescription,
    version: apiVersion,
    packageJsonDir: packageDir
  });

  await ReadmeService.setOpenApiVersion({
    openApiVersion: apiVersion,
    readmeDir: packageDir,
    readmeVersionDescription: readmeVersionDescription
  });

  console.log(`${logName}: success.`);
}

main();
