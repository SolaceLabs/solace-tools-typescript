import {
  Message,
  Schema
} from '@asyncapi/parser';
// import _ from "lodash";
import {
  EpAsyncApiStateId2StateNameMap_get,
  EpAsyncApiStateIds,
  EpAsyncApiStateName2StateIdMap_get,
  EpAsyncApiStateNames,
  EpGeneralExtensions,
  EpMessageExtensions,
  EpSchemaExtensions
} from '../constants';
import {
  EpAsyncApiUtils,
  EpAsyncApiMessageError,
  EpAsyncApiBestPracticesError
} from '../utils';
import {
  EpAsyncApiChannelDocument
} from './EpAsyncApiChannelDocument';
import {
  EpAsyncApiDocument,
  E_EpAsyncApiContentTypes
} from './EpAsyncApiDocument';

export enum E_EpAsyncApiSchemaFormatType {
  APPLICATION_JSON = "application/json",
  APPLICATION_AVRO = "application/avro"
}

export class EpAsyncApiMessageDocument {
  public epAsyncApiDocument: EpAsyncApiDocument;
  private epAsyncApiChannelDocument: EpAsyncApiChannelDocument;
  public asyncApiMessage: Message;
  private asyncApiMessageKey: string;
  private contentType: E_EpAsyncApiContentTypes;
  private schemaFormatType: E_EpAsyncApiSchemaFormatType;
  public static readonly ContentTypeIssue = 'contentType === undefined, neither message has a contentType nor api has a defaultContentType';
  public static readonly MissingMessagePayloadSchemaIssue = "Missing message payload schema.";


  private determineContentType(): E_EpAsyncApiContentTypes {
    const funcName = 'determineContentType';
    const logName = `${EpAsyncApiMessageDocument.name}.${funcName}()`;

    // note: 
    // contentType: application/vnd.apache.avro+json
    // contentType: application/json
    // contentType: application/vnd.aai.asyncapi;version=2.0.0

    let contentTypeString: string | undefined = this.asyncApiMessage.contentType();
    if (!contentTypeString) contentTypeString = this.epAsyncApiDocument.getDefaultContentType();
    if (contentTypeString === undefined) throw new EpAsyncApiMessageError(logName, this.constructor.name, {
      issue: EpAsyncApiMessageDocument.ContentTypeIssue,
      apiTitle: this.epAsyncApiDocument.getTitle(),
      apiChannel: this.epAsyncApiChannelDocument?.getAsyncApiChannelKey(),
      apiMessage: this.getMessageName(),
      apiMessageContent: this.asyncApiMessage,
    });
    // hardcode to application/json
    // nonsense, cater for EP not setting content type correctly
    if (contentTypeString.includes('avro')) return E_EpAsyncApiContentTypes.APPLICATION_JSON;
    return E_EpAsyncApiContentTypes.APPLICATION_JSON;
  }

  private determineSchemaFormatType(): E_EpAsyncApiSchemaFormatType {
    // const funcName = 'determineSchemaFormatType';
    // const logName = `${EpAsyncApiMessageDocument.name}.${funcName}()`;

    const schemaFormatString: string | undefined = this.asyncApiMessage.originalSchemaFormat();

    // schemaFormatString = application/vnd.aai.asyncapi;version=2.4.0
    // schemaFormatString = application/vnd.aai.asyncapi;version=2.4.0
    // schemaFormatString = application/vnd.apache.avro;version=1.9.0
    // schemaFormatString = application/vnd.apache.avro+json;version=1.9.0
    // schemaFormatString = application/schema+yaml;version=draft-07
    // schemaFormatString = application/schema+json;version=draft-07
    // schemaFormatString = application/vnd.apache.avro+yaml;version=1.9.0

    if (schemaFormatString.includes('avro')) return E_EpAsyncApiSchemaFormatType.APPLICATION_AVRO;
    return E_EpAsyncApiSchemaFormatType.APPLICATION_JSON;
  }

  private extractMessageKey(asyncApiMessage: Message): string {
    const funcName = 'extractMessageKey';
    const logName = `${EpAsyncApiMessageDocument.name}.${funcName}()`;
    // try ep extension first
    if (asyncApiMessage.hasExtension(EpMessageExtensions.xEpEventName)) {
      const eventName = asyncApiMessage.extension(EpMessageExtensions.xEpEventName);
      if (eventName && eventName.length > 0) return eventName;
    }
    // 2.4.0
    if (asyncApiMessage.name()) return asyncApiMessage.name();
    // 2.0.0
    if (asyncApiMessage.hasExt('x-parser-message-name')) return asyncApiMessage.ext('x-parser-message-name');
    throw new EpAsyncApiMessageError(logName, this.constructor.name, {
      issue: 'unable to find message key',
      apiTitle: this.epAsyncApiDocument.getTitle(),
      apiChannel: this.epAsyncApiChannelDocument?.getAsyncApiChannelKey(),
      apiMessage: this.getMessageName(),
      apiMessageContent: this.asyncApiMessage,
    });
  }

  constructor(epAsyncApiDocument: EpAsyncApiDocument, epAsyncApiChannelDocument: EpAsyncApiChannelDocument, asyncApiMessage: Message) {
    this.epAsyncApiDocument = epAsyncApiDocument;
    this.epAsyncApiChannelDocument = epAsyncApiChannelDocument;
    this.asyncApiMessage = asyncApiMessage;
    this.asyncApiMessageKey = this.extractMessageKey(asyncApiMessage);
    this.contentType = this.determineContentType();
    this.schemaFormatType = this.determineSchemaFormatType();
  }

  public validate(): void {
    // no validation
  }

  public validate_BestPractices(): void {
    const funcName = "validate_BestPractices";
    const logName = `${EpAsyncApiMessageDocument.name}.${funcName}()`;
    if (this.asyncApiMessage.originalPayload() === undefined || this.asyncApiMessage.originalPayload() === null) {
      throw new EpAsyncApiBestPracticesError(logName, this.constructor.name, undefined, {
        asyncApiSpecTitle: this.epAsyncApiDocument.getTitle(),
        issues: EpAsyncApiMessageDocument.MissingMessagePayloadSchemaIssue,
        value: {
          channel: this.epAsyncApiChannelDocument.getAsyncApiChannelKey(),
          message: this.asyncApiMessageKey
        }
      });
    }
  }

  private getMessage_X_EpSharedFlag(): boolean | undefined {
    const value = this.asyncApiMessage.extension(EpMessageExtensions.xEpSharedFlag);
    try { return JSON.parse(value); } catch(e) { return undefined; }
  }

  public getMessageEpIsShared(defaultValue: boolean): boolean {
    const flag = this.getMessage_X_EpSharedFlag();
    if(flag !== undefined) return flag;
    return defaultValue;
  }

  private get_X_EpStateId(): EpAsyncApiStateIds | undefined {
    const value = this.asyncApiMessage.extension(EpMessageExtensions.xEpStateId);
    if(value === undefined) return undefined;
    EpAsyncApiStateId2StateNameMap_get(value);
    return value;
  }

  private get_X_EpStateName(): EpAsyncApiStateNames | undefined {
    const value = this.asyncApiMessage.extension(EpMessageExtensions.xEpStateName);
    if(value === undefined) return undefined;
    const lowerCaseValue = (value as string).toLowerCase() as EpAsyncApiStateNames;
    EpAsyncApiStateName2StateIdMap_get(lowerCaseValue);
    return lowerCaseValue;
  }

  public getEpStateId(defaultValue: EpAsyncApiStateIds): EpAsyncApiStateIds {
    const stateName = this.get_X_EpStateName();
    if(stateName !== undefined) return EpAsyncApiStateName2StateIdMap_get(stateName);
    const stateId = this.get_X_EpStateId();
    if(stateId !== undefined) return stateId;  
    return defaultValue;
  }

  public getEpCustomAttributeValue(name: string): string | undefined {
    return this.asyncApiMessage.extension(`${EpGeneralExtensions.xEpCustomAttributeNamePrefix}${name}`);
  }

  public getContentType(): E_EpAsyncApiContentTypes { return this.contentType; }

  public getMessageName(): string { return this.asyncApiMessageKey; }

  public getMessageDisplayName(): string {
    if (this.asyncApiMessage.hasExtension(EpMessageExtensions.xEpEventVersionDisplayName)) {
      const displayName = this.asyncApiMessage.extension(EpMessageExtensions.xEpEventVersionDisplayName);
      if (displayName && displayName.length > 0) return displayName;
    }
    return '';
  }

  public getMessageEpApplicationDomainName(): string {
    if (this.asyncApiMessage.hasExtension(EpGeneralExtensions.xEpApplicationDomainName)) {
      const name = this.asyncApiMessage.extension(EpGeneralExtensions.xEpApplicationDomainName);
      if (name && name.length > 0) return name;
    }
    return this.epAsyncApiDocument.getUnprefixedAssetsApplicationDomainName();
  }

  // public getMessageEpApplicationDomainId(): string | undefined {
  //   if(this.asyncApiMessage.hasExtension(EpGeneralExtensions.xEpApplicationDomainId)) {
  //     const id = this.asyncApiMessage.extension(EpGeneralExtensions.xEpApplicationDomainId);
  //     if(id && id.length > 0) return id;
  //   }
  // }

  public getMessageDescription(): string {
    const description: string | null = this.asyncApiMessage.description();
    const summary: string | null = this.asyncApiMessage.summary();
    if (description && description.length > 0) return description;
    if (summary && summary.length > 0) return summary;
    return '';
  }

  public getMessageNameAsFilePath(): string {
    return this.asyncApiMessage.name();
  }

  private getPayloadSchema_X_EpSchemaId(): string | undefined {
    const schema: Schema = this.asyncApiMessage.payload();
    /* istanbul ignore next */
    if(!schema) return undefined;
    return schema.extension(EpSchemaExtensions.xEpSchemaId);
  }

  public getPayloadSchemaId(): string | undefined {
    return this.getPayloadSchema_X_EpSchemaId();
  }

  private getPayloadSchema_X_EpSchemaVersionId(): string | undefined {
    const schema: Schema = this.asyncApiMessage.payload();
    /* istanbul ignore next */
    if(!schema) return undefined;
    return schema.extension(EpSchemaExtensions.xEpSchemaVersionId);
  }

  public getPayloadSchemaVersionId(): string | undefined {
    return this.getPayloadSchema_X_EpSchemaVersionId();
  }

  private getPayloadSchema_X_EpSharedFlag(): boolean | undefined {
    const schema: Schema = this.asyncApiMessage.payload();
    /* istanbul ignore next */
    if(!schema) return undefined;
    const value = schema.extension(EpSchemaExtensions.xEpSharedFlag);
    try { return JSON.parse(value); } catch(e) { return undefined; }
  }

  public getPayloadSchemaEpIsShared(defaultValue: boolean): boolean {
    const flag = this.getPayloadSchema_X_EpSharedFlag();
    if(flag !== undefined) return flag;
    return defaultValue;
  }

  private getPayloadSchema_X_EpStateId(): EpAsyncApiStateIds | undefined {
    const schema: Schema = this.asyncApiMessage.payload();
    /* istanbul ignore next */
    if(!schema) return undefined;
    const value = schema.extension(EpSchemaExtensions.xEpStateId);
    if(value === undefined) return undefined;
    EpAsyncApiStateId2StateNameMap_get(value);
    return value;
  }

  private getPayloadSchema_X_EpStateName(): EpAsyncApiStateNames | undefined {
    const schema: Schema = this.asyncApiMessage.payload();
    /* istanbul ignore next */
    if(!schema) return undefined;
    const value = schema.extension(EpSchemaExtensions.xEpStateName);
    if(value === undefined) return undefined;
    const lowerCaseValue = (value as string).toLowerCase() as EpAsyncApiStateNames;
    EpAsyncApiStateName2StateIdMap_get(lowerCaseValue);
    return lowerCaseValue;
  }

  public getPayloadSchemaEpStateId(defaultValue: EpAsyncApiStateIds): EpAsyncApiStateIds {
    const stateName = this.getPayloadSchema_X_EpStateName();
    if(stateName !== undefined) return EpAsyncApiStateName2StateIdMap_get(stateName);
    const stateId = this.getPayloadSchema_X_EpStateId();
    if(stateId !== undefined) return stateId;  
    return defaultValue;
  }

  public getPayloadSchemaEpCustomAttributeValue(name: string): string | undefined {
    const schema: Schema = this.asyncApiMessage.payload();
    /* istanbul ignore next */
    if(!schema) return undefined;
    return schema.extension(`${EpGeneralExtensions.xEpCustomAttributeNamePrefix}${name}`);
  }

  public getSchemaFormatType(): E_EpAsyncApiSchemaFormatType { return this.schemaFormatType; }

  public getPayloadSchemaName(): string {
    const schema: Schema = this.asyncApiMessage.payload();
    if (!schema) return this.getMessageName();
    try {
      const title = schema.title();
      if (title && title !== '') return title;
      throw new Error('no title found');
    } catch (e) {
      if (schema.hasExtension(EpSchemaExtensions.xEpSchemaName)) {
        return schema.extension(EpSchemaExtensions.xEpSchemaName);
      }
      return this.getMessageName();
    }
  }

  public getPayloadSchemaDisplayName(): string {
    const schema: Schema = this.asyncApiMessage.payload();
    if (!schema) return '';
    if (schema.hasExtension(EpSchemaExtensions.xEpSchemaVersionDisplayName)) {
      return schema.extension(EpSchemaExtensions.xEpSchemaVersionDisplayName);
    }
    return '';
  }

  public getPayloadSchemaEpApplicationDomainName(): string {
    const schema: Schema = this.asyncApiMessage.payload();
    if (!schema) return this.epAsyncApiDocument.getUnprefixedAssetsApplicationDomainName();
    if (schema.hasExtension(EpGeneralExtensions.xEpApplicationDomainName)) {
      const name = schema.extension(EpGeneralExtensions.xEpApplicationDomainName);
      if (name && name.length > 0) return name;
    }
    return this.epAsyncApiDocument.getUnprefixedAssetsApplicationDomainName();
  }

  // public getPayloadSchemaEpApplicationDomainId(): string | undefined {
  //   const schema: Schema = this.asyncApiMessage.payload();
  //   if(!schema) return this.getMessageEpApplicationDomainId();
  //   if(schema.hasExtension(EpGeneralExtensions.xEpApplicationDomainId)) {
  //     const id = schema.extension(EpGeneralExtensions.xEpApplicationDomainId);
  //     if(id && id.length > 0) return id;
  //   }
  // }

  public getPayloadSchemaDescription(): string {
    const schema: Schema = this.asyncApiMessage.payload();
    try {
      const descr = schema.description();
      if (descr && descr.length > 0) return descr;
    } catch (e) {
      // no op
    }
    return '';
  }

  public getSchemaFileName(): string {
    if (this.getContentType() === E_EpAsyncApiContentTypes.APPLICATION_JSON) return `${this.getPayloadSchemaName()}.${"json"}`;
    return `${this.getMessageNameAsFilePath()}.${"xxx"}`
  }

  public getPayloadSchema(): any {
    const funcName = 'getPayloadSchema';
    const logName = `${EpAsyncApiMessageDocument.name}.${funcName}()`;
    if (this.asyncApiMessage.originalPayload() === undefined || this.asyncApiMessage.originalPayload() === null) {
      return {};
    }
    switch (this.schemaFormatType) {
      case E_EpAsyncApiSchemaFormatType.APPLICATION_JSON:
        return this.asyncApiMessage.payload().json();
      case E_EpAsyncApiSchemaFormatType.APPLICATION_AVRO:
        return this.asyncApiMessage.originalPayload();
      default:
        EpAsyncApiUtils.assertNever(logName, this.schemaFormatType);
    }
    // should never get here
    return undefined;
  }

  public getSchemaAsSanitizedJson(): any {
    const anySchema: any = this.getPayloadSchema();
    const sanitized = JSON.parse(JSON.stringify(anySchema, (k, v) => {
      if (k.startsWith("x-parser")) return undefined;
      if (k.startsWith("x-ep")) return undefined;
      return v;
    }));
    return sanitized;
  }

  public getOriginalPayloadSchema(): any { return this.asyncApiMessage.originalPayload(); }

  public getPayloadSchemaAsString(): string {
    const schema: Schema = this.getPayloadSchema();
    return JSON.stringify(schema.json());
  }

}
