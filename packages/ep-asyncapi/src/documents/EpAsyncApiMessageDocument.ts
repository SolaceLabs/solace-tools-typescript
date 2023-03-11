import { 
  Message, 
  Schema 
} from '@asyncapi/parser';
import { EpAsyncApiSchemaExtensions } from '../constants';
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
  private epAsyncApiDocument: EpAsyncApiDocument;
  private epAsyncApiChannelDocument: EpAsyncApiChannelDocument | undefined;
  private asyncApiMessageKey: string;
  private asyncApiMessage: Message;
  private contentType: E_EpAsyncApiContentTypes;
  private schemaFormatType: E_EpAsyncApiSchemaFormatType;
  public static readonly ContentTypeIssue = 'contentType === undefined, neither message has a contentType nor api has a defaultContentType';
  public static readonly MissingMessagePayloadSchemaIssue ="Missing message payload schema.";

  
  private determineContentType(): E_EpAsyncApiContentTypes {
    const funcName = 'determineContentType';
    const logName = `${EpAsyncApiMessageDocument.name}.${funcName}()`;
    
    // note: 
    // contentType: application/vnd.apache.avro+json
    // contentType: application/json
    // contentType: application/vnd.aai.asyncapi;version=2.0.0

    let contentTypeString: string | undefined = this.asyncApiMessage.contentType();
    if(!contentTypeString) contentTypeString = this.epAsyncApiDocument.getDefaultContentType();
    if(contentTypeString === undefined) throw new EpAsyncApiMessageError(logName, this.constructor.name, {
      issue: EpAsyncApiMessageDocument.ContentTypeIssue,
      apiTitle: this.epAsyncApiDocument.getTitle(),
      apiChannel: this.epAsyncApiChannelDocument?.getAsyncApiChannelKey(),
      apiMessage: this.getMessageName(),
      apiMessageContent: this.asyncApiMessage,
    });
    // hardcode to application/json
    // nonsense, cater for EP not setting content type correctly
    if(contentTypeString.includes('avro')) return E_EpAsyncApiContentTypes.APPLICATION_JSON;
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

    if(schemaFormatString.includes('avro')) return E_EpAsyncApiSchemaFormatType.APPLICATION_AVRO;
    return E_EpAsyncApiSchemaFormatType.APPLICATION_JSON;
  }

  private extractMessageKey(asyncApiMessage: Message): string {
    const funcName = 'extractMessageKey';
    const logName = `${EpAsyncApiMessageDocument.name}.${funcName}()`;
    // 2.4.0
    if(asyncApiMessage.name()) return asyncApiMessage.name();
    // 2.0.0
    if(asyncApiMessage.hasExt('x-parser-message-name')) return asyncApiMessage.ext('x-parser-message-name');
    throw new EpAsyncApiMessageError(logName, this.constructor.name, {
      issue: 'unable to find message key',
      apiTitle: this.epAsyncApiDocument.getTitle(),
      apiChannel: this.epAsyncApiChannelDocument?.getAsyncApiChannelKey(),
      apiMessage: this.getMessageName(),
      apiMessageContent: this.asyncApiMessage,
    });
  }

  constructor(epAsyncApiDocument: EpAsyncApiDocument, epAsyncApiChannelDocument: EpAsyncApiChannelDocument | undefined, asyncApiMessageKey: string | undefined, asyncApiMessage: Message) {
    this.epAsyncApiDocument = epAsyncApiDocument;
    this.epAsyncApiChannelDocument = epAsyncApiChannelDocument;
    this.asyncApiMessageKey = asyncApiMessageKey ? asyncApiMessageKey : this.extractMessageKey(asyncApiMessage);
    this.asyncApiMessage = asyncApiMessage;
    this.contentType = this.determineContentType();
    this.schemaFormatType = this.determineSchemaFormatType();
  }

  public validate(): void {
    // no validation
  }

  public validate_BestPractices(): void {
    const funcName = "validate_BestPractices";
    const logName = `${EpAsyncApiMessageDocument.name}.${funcName}()`;
    if(this.asyncApiMessage.originalPayload() === undefined || this.asyncApiMessage.originalPayload() === null) {
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

  public getMessageName(): string {
    // const funcName = 'getMessageName';
    // const logName = `${EpAsyncApiMessageDocument.name}.${funcName}()`;
    // Note: message name must NOT contain slashes '/', otherwise exported async api channel will reference a message which will NOT be found.
    //eslint-disable-next-line
    let name: string = this.asyncApiMessageKey.replaceAll(/[^0-9a-zA-Z\._]+/g, '-');
    if(this.asyncApiMessage.name() !== undefined) name = this.asyncApiMessage.name();
    return name;
  }

  public getContentType(): E_EpAsyncApiContentTypes { return this.contentType; }

  public getSchemaFormatType(): E_EpAsyncApiSchemaFormatType { return this.schemaFormatType; }

  public getOriginalPayloadSchema(): any {
    return this.asyncApiMessage.originalPayload();
  }

  public getPayloadSchemaAsString(): string {
    const schema: Schema = this.getPayloadSchema();
    return JSON.stringify(schema.json());
  }

  public getDescription(): string | undefined {
    const description: string | null = this.asyncApiMessage.description();
    const summary: string | null = this.asyncApiMessage.summary();
    if(description) return description;
    if(summary) return summary;
  }

  public getMessageNameAsFilePath(): string {
    return this.asyncApiMessage.name();
  }

  public getPayloadSchemaName(): string {
    const schema: Schema = this.asyncApiMessage.payload();
    let name: string | undefined = schema.title();
    if(name !== undefined) return name;
    if(schema.hasExtension(EpAsyncApiSchemaExtensions.xEpSchemaName)) {
      return schema.extension(EpAsyncApiSchemaExtensions.xEpSchemaName);
    }
    return this.getMessageName();
  }

  public getPayloadSchemaDisplayName(): string | undefined {
    const schema: Schema = this.asyncApiMessage.payload();
    if(schema.hasExtension(EpAsyncApiSchemaExtensions.xEpSchemaVersionDisplayName)) {
      return schema.extension(EpAsyncApiSchemaExtensions.xEpSchemaVersionDisplayName);
    }
  }

  public getSchemaFileName(): string {
    if(this.getContentType() === E_EpAsyncApiContentTypes.APPLICATION_JSON) return `${this.getPayloadSchemaName()}.${"json"}`;
    return `${this.getMessageNameAsFilePath()}.${"xxx"}`
  }

  public getPayloadSchema(): any {
    const funcName = 'getPayloadSchema';
    const logName = `${EpAsyncApiMessageDocument.name}.${funcName}()`;
    if(this.asyncApiMessage.originalPayload() === undefined || this.asyncApiMessage.originalPayload() === null) {
      return {};
    }
    switch(this.schemaFormatType) {
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
    const sanitized = JSON.parse(JSON.stringify(anySchema, (k,v) => {
      if(k.startsWith("x-parser")) return undefined;
      return v;
    }));
    return sanitized;
  }

}
