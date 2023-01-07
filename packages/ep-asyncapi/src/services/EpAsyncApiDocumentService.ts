import fs from 'fs';
import path from 'path';

import { parse, registerSchemaParser, AsyncAPIDocument } from '@asyncapi/parser';
import avroSchemaParser from '@asyncapi/avro-schema-parser';

import { EpAsyncApiDocument } from '../documents';
import { EpAsyncApiParserError } from '../utils';


registerSchemaParser(avroSchemaParser);

export class EpAsyncApiDocumentServiceClass {

  private parse = async({ apiSpec, apiSpecFilePath }:{
    apiSpecFilePath: string;
    apiSpec: any;
  }): Promise<AsyncAPIDocument> => {
    const funcName = 'parse';
    const logName = `${EpAsyncApiDocumentServiceClass.name}.${funcName}()`;

    // get the normalized absolute path
    const normalizedApiSpecFilePath = path.normalize(apiSpecFilePath);
    const absoluteDir = path.dirname(path.resolve(normalizedApiSpecFilePath));
    const absoluteApiSpecFilePath = absoluteDir + '/' + path.basename(normalizedApiSpecFilePath);
    const parserPath = absoluteDir + '/';
    // apiSpec;
    // throw new Error(`${logName}: parserPath=${parserPath}, absoluteApiSpecFilePath=${absoluteApiSpecFilePath}`);

    try {
      const asyncApiDocument: AsyncAPIDocument = await parse(apiSpec, {
        path: parserPath
      });  
      return asyncApiDocument;
    } catch(e: any) {
      //   const errors = e.validationErrors ? `, Errors: ${JSON.stringify(e.validationErrors)}` : '';
      //   return `${e.title}${errors}`;
      throw new EpAsyncApiParserError(logName, this.constructor.name, absoluteApiSpecFilePath, e);
    }
  }

  public createFromFile = async({ filePath, overrideEpApplicationDomainName, overrideEpAssetApplicationDomainName, prefixEpApplicationDomainName }:{
    filePath: string;
    overrideEpApplicationDomainName?: string;
    overrideEpAssetApplicationDomainName?: string;
    prefixEpApplicationDomainName?: string;
  }): Promise<EpAsyncApiDocument> => {
    const apiSpecString: string = fs.readFileSync(filePath).toString();
    // take a copy of the spec
    const originalApiSpecJson = JSON.parse(JSON.stringify(apiSpecString));
    const asyncApiDocument: AsyncAPIDocument = await this.parse({ 
      apiSpec: apiSpecString,
      apiSpecFilePath: filePath
    });
    const epAsyncApiDocument: EpAsyncApiDocument = new EpAsyncApiDocument(
      originalApiSpecJson,
      asyncApiDocument, 
      overrideEpApplicationDomainName, 
      overrideEpAssetApplicationDomainName, 
      prefixEpApplicationDomainName
    );
    epAsyncApiDocument.validate();
    return epAsyncApiDocument;
  }

  public createFromAny = async({ anySpec, overrideEpApplicationDomainName, overrideEpAssetApplicationDomainName, prefixEpApplicationDomainName }:{
    anySpec: any;
    overrideEpApplicationDomainName?: string;
    overrideEpAssetApplicationDomainName?: string;
    prefixEpApplicationDomainName?: string;
  }): Promise<EpAsyncApiDocument> => {
    // take a copy of the spec
    const originalApiSpecJson = JSON.parse(JSON.stringify(anySpec));
    const asyncApiDocument: AsyncAPIDocument = await parse(anySpec);
    const epAsyncApiDocument: EpAsyncApiDocument = new EpAsyncApiDocument(
      originalApiSpecJson,
      asyncApiDocument, 
      overrideEpApplicationDomainName, 
      overrideEpAssetApplicationDomainName, 
      prefixEpApplicationDomainName
    );
    return epAsyncApiDocument;
  }

}

export default new EpAsyncApiDocumentServiceClass();
