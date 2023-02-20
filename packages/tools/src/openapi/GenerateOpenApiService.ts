import { HttpClient } from 'openapi-typescript-codegen';
import s from 'shelljs';
import fs from 'fs';

const OpenAPI = require('openapi-typescript-codegen');

class GenerateOpenApiService {

  private postProcessClientNode_index_ts({
    outputOpenApiClientSrcDir
  }:{
    outputOpenApiClientSrcDir: string;
  }): void {
    const funcName = 'postProcessClientNode_index_ts';
    const logName = `${GenerateOpenApiService.name}.${funcName}()`;
    console.log(`${logName}: starting ...`);
  
    let code: number;
    const SourceFile = `${outputOpenApiClientSrcDir}/index.ts`;
    const BackupFile = `${outputOpenApiClientSrcDir}/index.ts.backup`;
    console.log(`${logName}: create backup file: ${BackupFile}`);
    code = s.cp(SourceFile, BackupFile).code;
    if(code !== 0) throw new Error(`${logName}: code=${code}`);
    // load File file to string
    const SourceFileBuffer: Buffer = fs.readFileSync(SourceFile);
    const SourceFileString: string = SourceFileBuffer.toString('utf-8');
  
    let newSourceFileString: string = SourceFileString;
    {
      // exports from core/OpenAPI
      const search = "export type { OpenAPIConfig } from './core/OpenAPI';";
      const replace = "export type { OpenAPIConfig, Resolver, Headers } from './core/OpenAPI';";
      console.log(`${logName}: index.ts: replace ${search} with ${replace}`);
      newSourceFileString = newSourceFileString.replace(search, replace);
    }  
    {
      // exports from core/CancelablePromise
      const search = "export { CancelablePromise, CancelError } from './core/CancelablePromise';";
      const replace = "export { CancelablePromise, CancelError, OnCancel } from './core/CancelablePromise';";
      console.log(`${logName}: index.ts: replace ${search} with ${replace}`);
      newSourceFileString = newSourceFileString.replace(search, replace);
    }  
    {
      // add exports
      const search_last_export = "export type { OpenAPIConfig, Resolver, Headers } from './core/OpenAPI';";
      const replace_last_export = `
  ${search_last_export}
  export type { ApiResult } from './core/ApiResult';    
  export type { ApiRequestOptions } from './core/ApiRequestOptions';
  export { request } from './core/request';
      `;
      console.log(`${logName}: index.ts: replace ${search_last_export} with ${replace_last_export}`);
      newSourceFileString = newSourceFileString.replace(search_last_export, replace_last_export);
    }
    // write file
    fs.writeFileSync(SourceFile, newSourceFileString);
    console.log(`${logName}: success.`);
  }
  
  private postProcessClientNode_core_OpenAPI_ts({
    outputOpenApiClientSrcDir
  }:{
    outputOpenApiClientSrcDir: string;
  }): void {
    const funcName = 'postProcessClientNode_core_OpenAPI_ts';
    const logName = `${GenerateOpenApiService.name}.${funcName}()`;
    console.log(`${logName}: starting ...`);
  
    let code: number;
    const OpenApiTsFile = `${outputOpenApiClientSrcDir}/core/OpenAPI.ts`;
    const OpenApiTsBackupFile = `${outputOpenApiClientSrcDir}/core/OpenAPI.ts.backup`;
    console.log(`${logName}: create backup file: ${OpenApiTsBackupFile}`);
    code = s.cp(OpenApiTsFile, OpenApiTsBackupFile).code;
    if(code !== 0) throw new Error(`${logName}: code=${code}`);
    // load OpenAPI.ts file to string
    const OpenApiTsBuffer: Buffer = fs.readFileSync(OpenApiTsFile);
    const OpenApiTsString: string = OpenApiTsBuffer.toString('utf-8');
  
    let newOpenApiTsString: string = OpenApiTsString;
    {
      // export Resolver
      const search_type_Resolver = "type Resolver<T> = (options: ApiRequestOptions) => Promise<T>;";
      const replace_type_Resolver = "export type Resolver<T> = (options: ApiRequestOptions) => Promise<T>;";
      console.log(`${logName}: OpenAPI.ts: replace ${search_type_Resolver} with ${replace_type_Resolver}`);
      newOpenApiTsString = newOpenApiTsString.replace(search_type_Resolver, replace_type_Resolver);
    }  
    {
      // export Headers
      const search_type_Headers = "type Headers = Record<string, string>;";
      const replace_type_Headers = "export type Headers = Record<string, string>;";
      console.log(`${logName}: OpenAPI.ts: replace ${search_type_Headers} with ${replace_type_Headers}`);
      newOpenApiTsString = newOpenApiTsString.replace(search_type_Headers, replace_type_Headers);
    }
    {
      // add resolver to base 
      const search_OpenAPI_BASE = "BASE: string";
      const replace_OpenAPI_BASE = "BASE: string | Resolver<string>";
      console.log(`${logName}: OpenAPI.BASE: replace ${search_OpenAPI_BASE} with ${replace_OpenAPI_BASE}`);
      newOpenApiTsString = newOpenApiTsString.replace(search_OpenAPI_BASE, replace_OpenAPI_BASE);
    }
    // write file
    fs.writeFileSync(OpenApiTsFile, newOpenApiTsString);
    console.log(`${logName}: success.`);
  }
  
  private postProcessClientNode_core_request_ts({
    outputOpenApiClientSrcDir
  }:{
    outputOpenApiClientSrcDir: string;
  }): void {
    const funcName = 'postProcessClientNode_core_request_ts';
    const logName = `${GenerateOpenApiService.name}.${funcName}()`;

    console.log(`${logName}: starting ...`);
  
    let code: number;
    const requestTsFile = `${outputOpenApiClientSrcDir}/core/request.ts`;
    const requestTsBackupFile = `${outputOpenApiClientSrcDir}/core/request.ts.backup`;
    console.log(`${logName}: create backup file: ${requestTsBackupFile}`);
    code = s.cp(requestTsFile, requestTsBackupFile).code;
    if(code !== 0) throw new Error(`${logName}: code=${code}`);
    // load requests.ts file to string
    const requestTsBuffer: Buffer = fs.readFileSync(requestTsFile);
    const requestTsString: string = requestTsBuffer.toString('utf-8');
    // *************************
    // fetch-with-proxy
    // *************************
    const searchFetchWithProxy = "import fetch, { BodyInit, Headers, RequestInit, Response } from 'node-fetch';"
    const replaceFetchWithProxy = `
  import { BodyInit, Headers, RequestInit, Response } from 'node-fetch';
  import fetch from 'fetch-with-proxy';
  `;
    console.log(`${logName}: fetch-with-proxy: replace ${searchFetchWithProxy} with ${replaceFetchWithProxy}`);
    const newRequestTsString: string = requestTsString.replace(searchFetchWithProxy, replaceFetchWithProxy);
    fs.writeFileSync(requestTsFile, newRequestTsString);  
    // *************************
    // *************************
    // OpenApi.BASE
    // *************************
    // const getUrl = (config: OpenAPIConfig, options: ApiRequestOptions): string => {
    // const getUrl = async (config: OpenAPIConfig, options: ApiRequestOptions): Promise<string> => {
    const search_getUrl = "const getUrl = (config: OpenAPIConfig, options: ApiRequestOptions): string => {";
    const replace_getUrl = "const getUrl = async (config: OpenAPIConfig, options: ApiRequestOptions): Promise<string> => {";
    console.log(`${logName}: getUrl: replace ${search_getUrl} with ${replace_getUrl}`);
    const newRequestTsString2: string = newRequestTsString.replace(search_getUrl, replace_getUrl);
    fs.writeFileSync(requestTsFile, newRequestTsString2);  
    // const url = `${config.BASE}${path}`;
    // const url = `${await resolve(options, config.BASE)}${path}`;
    const search_url = "const url = `${config.BASE}${path}`";
    const replace_url = "const url = `${await resolve(options, config.BASE)}${path}`";
    console.log(`${logName}: getUrl().url: replace ${search_url} with ${replace_url}`);
    const newRequestTsString3: string = newRequestTsString2.replace(search_url, replace_url);
    fs.writeFileSync(requestTsFile, newRequestTsString3);  
    // const url = getUrl(config, options);
    // const url = await getUrl(config, options);
    const search_request_url = "const url = getUrl(config, options)";
    const replace_request_url = "const url = await getUrl(config, options)";
    console.log(`${logName}: request().url: replace ${search_request_url} with ${replace_request_url}`);
    const newRequestTsString4: string = newRequestTsString3.replace(search_request_url, replace_request_url);
    fs.writeFileSync(requestTsFile, newRequestTsString4);  
    console.log(`${logName}: success.`);
  }
  
  public postProcessOpenApiClientNode({
    outputOpenApiClientSrcDir
  }:{
    outputOpenApiClientSrcDir: string;
  }): void {
    const funcName = 'postProcessOpenApiClientNode';
    const logName = `${GenerateOpenApiService.name}.${funcName}()`;

    console.log(`${logName}: starting ...`);

    try {
      this.postProcessClientNode_core_request_ts({
        outputOpenApiClientSrcDir: outputOpenApiClientSrcDir
      });
      this.postProcessClientNode_core_OpenAPI_ts({
        outputOpenApiClientSrcDir: outputOpenApiClientSrcDir
      });
      this.postProcessClientNode_index_ts({
        outputOpenApiClientSrcDir: outputOpenApiClientSrcDir
      });
    } catch(e) {
      console.log(`${logName}: error=${e}`);
      throw e;
    }
    console.log(`${logName}: success.`);
  }

  public async generateOpenApiClientNode({ inputApiSpecFile, outputOpenApiClientSrcDir }:{
    inputApiSpecFile: string;
    outputOpenApiClientSrcDir: string;
  }): Promise<void> {
    const funcName = 'generateOpenApiClientNode';
    const logName = `${GenerateOpenApiService.name}.${funcName}()`;

    console.log(`${logName}: starting ...`);
    console.log(`${logName}: spec: ${inputApiSpecFile}`);

    try {
      await OpenAPI.generate({
        input: inputApiSpecFile,
        output: outputOpenApiClientSrcDir,
        httpClient: HttpClient.NODE,
        exportSchemas: true,
        useOptions: true,
        // request: './custom/request.ts'      
      });
    } catch(e) {
      console.log(`${logName}: error=${e}`);
      throw e;
    }
    console.log(`${logName}: src dir: ${outputOpenApiClientSrcDir}`);
    console.log(`${logName}: success.`);
  }

  public generateOpenApiSpec({ inputApiSpecFile, outputApiSpecFile }:{
    inputApiSpecFile: string;
    outputApiSpecFile: string;
  }): void {
    const funcName = 'generateOpenApiSpec';
    const logName = `${GenerateOpenApiService.name}.${funcName}()`;
    
    const xContextIdParameterKey = "x-context-id";
    const xContextIdParametersTemplateText = `
    {
        "name": "x-context-id",
        "description": "Optional context id the request is running.",
        "in": "header",
        "required": true,
        "schema": {
          "type": "string",
          "pattern": "^[a-zA-Z0-9_-]*$",
          "minLength": 4,
          "maxLength": 64
        }
      }
    `;
    const xContextIdPathParameterTemplateText = `
    {
      "$ref": "#/components/parameters/x-context-id"
    }
    `;

    console.log(`${logName}: starting ...`);
    console.log(`${logName}: spec: ${inputApiSpecFile}`);
  
    try {
      // read the input spec
      const apiSpecJson: any = require(inputApiSpecFile);
      const xContextIdParametersTemplateJson = JSON.parse(xContextIdParametersTemplateText);
      const xContextIdPathParameterTemplateJson = JSON.parse(xContextIdPathParameterTemplateText);
      // add context id parameter to components
      if(apiSpecJson.components === undefined) apiSpecJson.components = {};
      const components = apiSpecJson.components;
      if(apiSpecJson.components.parameters === undefined) apiSpecJson.components.parameters = {};
      const componentsParameters = components.parameters;
      componentsParameters[xContextIdParameterKey] = xContextIdParametersTemplateJson;
      // paths
      const paths: Record<string, any> = apiSpecJson.paths;
      for(const path in paths) {
        // console.log(`${logName}: path = ${JSON.stringify(path, null, 2)}`);
        const pathObject = paths[path];
        // console.log(`${logName}: pathObject = ${JSON.stringify(pathObject, null, 2)}`);
        let pathParameters: Array<any> | undefined = pathObject.parameters;
        if(pathParameters === undefined) {
          pathParameters = [xContextIdPathParameterTemplateJson];
        } else {
          pathParameters.push(xContextIdPathParameterTemplateJson);
        }
        pathObject.parameters = pathParameters;
      }  
      const newSpecJsonString = JSON.stringify(apiSpecJson, null, 2);
      // write the generated spec
      fs.writeFileSync(outputApiSpecFile, newSpecJsonString);  
    } catch(e) {
      console.log(`${logName}: error=${e}`);
      throw e;
    }
    console.log(`${logName}: generated spec file: ${outputApiSpecFile}`);
    console.log(`${logName}: success.`);
  }
  
  
}

export default new GenerateOpenApiService();