import { 
  Channel, 
  ChannelParameter, 
} from '@asyncapi/parser';
import { $Event, $EventVersion } from '@rjgu/ep-openapi-node';
import { Validator, ValidatorResult } from 'jsonschema';
import { EpAsyncApiInternalError, EpAsyncApiValidationError } from '../utils';
import { EpAsynApiChannelPublishOperation, EpAsyncApiChannelSubscribeOperation } from './EpAsyncApiChannelOperation';
import { 
  EpAsyncApiChannelParameterDocument, 
} from './EpAsyncApiChannelParameterDocument';
import { 
  EpAsyncApiDocument, T_EpAsyncApiChannelParameterDocumentMap 
} from './EpAsyncApiDocument';

enum E_EpAsyncApiExtensions {
  X_EP_EVENT_NAME = "x-ep-event-name",
}

export class EpAsyncApiChannelDocument {
  private epAsyncApiDocument: EpAsyncApiDocument;
  private asyncApiChannelKey: string;
  private asyncApiChannel: Channel;
  private epEventName?: string;
  private epEventVersionName?: string;

  constructor(epAsyncApiDocument: EpAsyncApiDocument, asyncApiChannelKey: string, asyncApiChannel: Channel) {
    this.epAsyncApiDocument = epAsyncApiDocument;
    this.asyncApiChannelKey = asyncApiChannelKey;
    this.asyncApiChannel = asyncApiChannel;
  }
  
  private get_X_EpEventName(): string | undefined {
    if(this.asyncApiChannel.hasExtension(E_EpAsyncApiExtensions.X_EP_EVENT_NAME)) return this.asyncApiChannel.extension(E_EpAsyncApiExtensions.X_EP_EVENT_NAME);
    return undefined;
  }
  private createEpEventName() {
    if(this.epEventName !== undefined) return;
    const xEpEventName: string | undefined = this.get_X_EpEventName();
    if(xEpEventName !== undefined) this.epEventName = xEpEventName;
    else this.epEventName = this.asyncApiChannelKey;
    // Note: message name must NOT contain slashes '/', otherwise exported async api channel will reference a message which will NOT be found.
    //eslint-disable-next-line
    this.epEventName = this.epEventName.replaceAll(/[^0-9a-zA-Z\._]+/g, '-');
  }
  private createEpEventVersionName() {
    if(this.epEventVersionName !== undefined) return;
    try {
      this._validate_EpEventVersionName(this.getEpEventName());
      this.epEventVersionName = this.getEpEventName();
    } catch (e: any) {
      if(e instanceof EpAsyncApiValidationError) {
        // set to empty string
        this.epEventVersionName = '';
      }
    }
  }

  private validate_EpName = () => {
    const funcName = 'validate_EpName';
    const logName = `${EpAsyncApiChannelDocument.name}.${funcName}()`;
    // WORKAROUND_UNTIL_EP_API_FIXED
    const schema = {
      ...$Event.properties.name,
      maxLength: 60,
    }

    this.createEpEventName();
    if(this.epEventName === undefined) throw new EpAsyncApiInternalError(logName, this.constructor.name, 'this.epEventName === undefined');
    const v: Validator = new Validator();
    const validateResult: ValidatorResult = v.validate(this.epEventName, schema);

    if(!validateResult.valid) throw new EpAsyncApiValidationError(logName, this.constructor.name, undefined, {
      asyncApiSpecTitle: this.epAsyncApiDocument.getTitle(),
      issues: validateResult.errors,
      value: {
        epEventName: this.epEventName,
        length: this.epEventName.length
      }
    });
  }

  private _validate_EpEventVersionName = (epEventVersionName: string): string => {
    const funcName = '_validate_EpEventVersionName';
    const logName = `${EpAsyncApiChannelDocument.name}.${funcName}()`;
    const schema = $EventVersion.properties.displayName;
    const v: Validator = new Validator();
    const validateResult: ValidatorResult = v.validate(epEventVersionName, schema);
    if(!validateResult.valid) throw new EpAsyncApiValidationError(logName, this.constructor.name, undefined, {
      asyncApiSpecTitle: this.epAsyncApiDocument.getTitle(),
      issues: validateResult.errors,
      value: {
        epEventVersionName: epEventVersionName,
        length: epEventVersionName.length
      }
    });
    return epEventVersionName;
  }

  private validate_EpEventVersionName = () => {
    const funcName = 'validate_EpEventVersionName';
    const logName = `${EpAsyncApiChannelDocument.name}.${funcName}()`;
    const schema = $EventVersion.properties.displayName;

    this.createEpEventVersionName();
    if(this.epEventVersionName === undefined) throw new EpAsyncApiInternalError(logName, this.constructor.name, 'this.epEventVersionName === undefined');
    const v: Validator = new Validator();
    const validateResult: ValidatorResult = v.validate(this.epEventVersionName, schema);

    if(!validateResult.valid) throw new EpAsyncApiValidationError(logName, this.constructor.name, undefined, {
      asyncApiSpecTitle: this.epAsyncApiDocument.getTitle(),
      issues: validateResult.errors,
      value: {
        epEventVersionName: this.epEventVersionName
      }
    });
  }

  public validate(): void {
    // this doc
    this.validate_EpName();
    this.validate_EpEventVersionName();
    // channel parameters
    const epAsyncApiChannelParameterDocumentMap: T_EpAsyncApiChannelParameterDocumentMap | undefined = this.getEpAsyncApiChannelParameterDocumentMap();
    if(epAsyncApiChannelParameterDocumentMap !== undefined) {
      for(const [parameterName, epAsyncApiChannelParameterDocument] of epAsyncApiChannelParameterDocumentMap) {
        parameterName;
        epAsyncApiChannelParameterDocument.validate();
      }  
    }
    // channel operations
    const epAsynApiChannelPublishOperation: EpAsynApiChannelPublishOperation | undefined = this.getEpAsyncApiChannelPublishOperation();
    if(epAsynApiChannelPublishOperation !== undefined) {
      epAsynApiChannelPublishOperation.validate();
    }
    const epAsynApiChannelSubscribeOperation: EpAsyncApiChannelSubscribeOperation | undefined = this.getEpAsyncApiChannelSubscribeOperation();
    if(epAsynApiChannelSubscribeOperation !== undefined) {
      epAsynApiChannelSubscribeOperation.validate();
    }
  }

  public validate_BestPractices(): void {
    // add best practices validations for channel here

    // channel parameters
    const epAsyncApiChannelParameterDocumentMap: T_EpAsyncApiChannelParameterDocumentMap | undefined = this.getEpAsyncApiChannelParameterDocumentMap();
    if(epAsyncApiChannelParameterDocumentMap !== undefined) {
      for(const [parameterName, epAsyncApiChannelParameterDocument] of epAsyncApiChannelParameterDocumentMap) {
        parameterName;
        epAsyncApiChannelParameterDocument.validate_BestPractices();
      }  
    }
    // channel operations
    const epAsynApiChannelPublishOperation: EpAsynApiChannelPublishOperation | undefined = this.getEpAsyncApiChannelPublishOperation();
    if(epAsynApiChannelPublishOperation !== undefined) {
      epAsynApiChannelPublishOperation.validate_BestPractices();
    }
    const epAsynApiChannelSubscribeOperation: EpAsyncApiChannelSubscribeOperation | undefined = this.getEpAsyncApiChannelSubscribeOperation();
    if(epAsynApiChannelSubscribeOperation !== undefined) {
      epAsynApiChannelSubscribeOperation.validate_BestPractices();
    }
  }

  public getAsyncApiChannel(): Channel { return this.asyncApiChannel; }

  public getAsyncApiChannelKey(): string { return this.asyncApiChannelKey; }

  /**
   * Return the event name for EP from:
   * 1) channel extension: x-ep-event-name
   * 2) channel topic
   */
  public getEpEventName(): string { 
    const funcName = 'getEpEventName';
    const logName = `${EpAsyncApiDocument.name}.${funcName}()`;
    if(this.epEventName === undefined) {
      this.createEpEventName();
      this.validate_EpName();
    }
    if(this.epEventName === undefined) throw new EpAsyncApiInternalError(logName, this.constructor.name, 'this.epEventName === undefined');
    return this.epEventName; 
  }

  public getEpEventVersionName(): string { 
    const funcName = 'getEpEventVersionName';
    const logName = `${EpAsyncApiDocument.name}.${funcName}()`;
    if(this.epEventVersionName === undefined) {
      this.createEpEventVersionName();
      this.validate_EpEventVersionName();
    }
    if(this.epEventVersionName === undefined) throw new EpAsyncApiInternalError(logName, this.constructor.name, 'this.epEventVersionName === undefined');
    return this.epEventVersionName; 
  }

  public getApplicationDomainName(): string {
    return this.epAsyncApiDocument.getAssetsApplicationDomainName();
  }

  public getEpAsyncApiChannelParameterDocumentMap(): T_EpAsyncApiChannelParameterDocumentMap | undefined {
    if(!this.asyncApiChannel.hasParameters()) return undefined;
    
    const paramRecords: Record<string, ChannelParameter> = this.asyncApiChannel.parameters();
    const epAsyncApiChannelParameterDocumentMap: T_EpAsyncApiChannelParameterDocumentMap = new Map<string, EpAsyncApiChannelParameterDocument>();
    for(const [name, parameter] of Object.entries(paramRecords)) {
      const epAsyncApiChannelParameterDocument = new EpAsyncApiChannelParameterDocument(name, parameter);
      epAsyncApiChannelParameterDocumentMap.set(name, epAsyncApiChannelParameterDocument);
    }
    return epAsyncApiChannelParameterDocumentMap;
  }

  public getEpAsyncApiChannelPublishOperation(): EpAsynApiChannelPublishOperation | undefined {
    if(this.asyncApiChannel.hasPublish()) {
      return new EpAsynApiChannelPublishOperation(this.epAsyncApiDocument, this, this.asyncApiChannel.publish());
    }
    return undefined;
  }

  public getEpAsyncApiChannelSubscribeOperation(): EpAsyncApiChannelSubscribeOperation | undefined {
    if(this.asyncApiChannel.hasSubscribe()) {
      return new EpAsyncApiChannelSubscribeOperation(this.epAsyncApiDocument, this, this.asyncApiChannel.subscribe());
    }
    return undefined;
  }
}
