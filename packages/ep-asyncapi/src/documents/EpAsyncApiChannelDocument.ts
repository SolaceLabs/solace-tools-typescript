import { Channel, ChannelParameter, Message } from "@asyncapi/parser";
import { $Event, $EventVersion } from "@solace-labs/ep-openapi-node";
import { Validator, ValidatorResult } from "jsonschema";
import { EpAsyncApiChannelExtensions } from "../constants";
import { 
  EpAsyncApiInternalError, 
  EpAsyncApiValidationError 
} from "../utils";
import {
  EpAsynApiChannelPublishOperation,
  EpAsyncApiChannelSubscribeOperation,
} from "./EpAsyncApiChannelOperation";
import { 
  EpAsyncApiChannelParameterDocument 
} from "./EpAsyncApiChannelParameterDocument";
import {
  EBrokerTypes,
  EChannelDelimiters,
  EpAsyncApiDocument,
  T_EpAsyncApiChannelParameterDocumentMap,
} from "./EpAsyncApiDocument";
import { EpAsyncApiMessageDocument } from "./EpAsyncApiMessageDocument";

export enum EpAsyncApiChannelOperationType {
  PublishOperation = "PublishOperation",
  SubscribeOperation = "SubscribeOperation"
}

export class EpAsyncApiChannelDocument {
  private epAsyncApiDocument: EpAsyncApiDocument;
  private asyncApiChannelKey: string;
  private asyncApiChannel: Channel;
  /** 1 channel can only have 1 message document */
  private epAsyncApiMessageDocument?: EpAsyncApiMessageDocument;
  private epEventName?: string;
  private epEventVersionName?: string;
  private epEventDescription?: string;

  constructor(epAsyncApiDocument: EpAsyncApiDocument, asyncApiChannelKey: string, asyncApiChannel: Channel) {
    this.epAsyncApiDocument = epAsyncApiDocument;
    this.asyncApiChannelKey = asyncApiChannelKey;
    this.asyncApiChannel = asyncApiChannel;
    this.epAsyncApiMessageDocument = this.createMessageDocument();
    this.epEventName = this.createEpEventName();
    this.epEventVersionName = this.createEpEventVersionName();
    this.epEventDescription = this.createEpEventDescription();
  }

  private get_X_AsyncApi_EpEventName(): string | undefined {
    if(this.asyncApiChannel.hasExtension(EpAsyncApiChannelExtensions.xEpEventName)) {
      const eventName = this.asyncApiChannel.extension(EpAsyncApiChannelExtensions.xEpEventName);
      if(eventName && eventName.length > 0) return eventName;
    }
    return undefined;
  }

  public getAllChannelMessageDocuments(): Map<EpAsyncApiChannelOperationType, Array<EpAsyncApiMessageDocument>> {
    const operationMessageMap = new Map<EpAsyncApiChannelOperationType, Array<EpAsyncApiMessageDocument>>();
    if(this.asyncApiChannel.hasPublish()) {
      const publishOperation = this.asyncApiChannel.publish();
      if(publishOperation.hasMultipleMessages()) {
        const messages: Array<Message> = publishOperation.messages();
        const epAsyncApiMessageDocuments: Array<EpAsyncApiMessageDocument> = [];
        for(const message of messages) {
          const epAsyncApiMessageDocument = new EpAsyncApiMessageDocument(
            this.epAsyncApiDocument, 
            this, 
            message
          );
          epAsyncApiMessageDocuments.push(epAsyncApiMessageDocument);
        }
        operationMessageMap.set(EpAsyncApiChannelOperationType.PublishOperation, epAsyncApiMessageDocuments);
      } else {
        const message: Message = publishOperation.message();
        const epAsyncApiMessageDocument = new EpAsyncApiMessageDocument(
          this.epAsyncApiDocument, 
          this, 
          message
        );
        operationMessageMap.set(EpAsyncApiChannelOperationType.PublishOperation, [epAsyncApiMessageDocument]);
      }
    }
    if(this.asyncApiChannel.hasSubscribe()) {
      const subscribeOperation = this.asyncApiChannel.subscribe();
      if(subscribeOperation.hasMultipleMessages()) {
        const messages: Array<Message> = subscribeOperation.messages();
        const epAsyncApiMessageDocuments: Array<EpAsyncApiMessageDocument> = [];
        for(const message of messages) {
          const epAsyncApiMessageDocument = new EpAsyncApiMessageDocument(
            this.epAsyncApiDocument, 
            this, 
            message
          );
          epAsyncApiMessageDocuments.push(epAsyncApiMessageDocument);
        }
        operationMessageMap.set(EpAsyncApiChannelOperationType.SubscribeOperation, epAsyncApiMessageDocuments);
      } else {
        const message: Message = subscribeOperation.message();
        const epAsyncApiMessageDocument = new EpAsyncApiMessageDocument(
          this.epAsyncApiDocument, 
          this, 
          message
        );
        operationMessageMap.set(EpAsyncApiChannelOperationType.SubscribeOperation, [epAsyncApiMessageDocument]);
      }
    }
    return operationMessageMap;
  }
  /**
   * Get all messages for pub & sub operations.
   * If more than 1 found or they are different return undefined
   */
  private createMessageDocument(): EpAsyncApiMessageDocument | undefined {
    const operationMesssagesMap: Map<EpAsyncApiChannelOperationType, Array<EpAsyncApiMessageDocument>> = this.getAllChannelMessageDocuments();
    const pubMessages = operationMesssagesMap.get(EpAsyncApiChannelOperationType.PublishOperation);
    const subMessages = operationMesssagesMap.get(EpAsyncApiChannelOperationType.SubscribeOperation);
    // no message found
    if(!pubMessages && !subMessages) return undefined;
    // only 1 message allowed
    if(pubMessages && pubMessages.length > 1) return undefined;
    if(subMessages && subMessages.length > 1) return  undefined;
    // check both messages are the same
    const pubMessageName = pubMessages && pubMessages[0].getMessageName();
    const subMessageName = subMessages && subMessages[0].getMessageName();
    if(pubMessageName && subMessageName && pubMessageName !== subMessageName) return undefined;
    // return either one since they are the same
    if(pubMessageName) return pubMessages[0];
    if(subMessageName) return subMessages[0];
  }

  private createEpEventName(): string | undefined {
    if(this.epEventName !== undefined) return this.epEventName;
    // try channel extension first
    const eventName: string | undefined = this.get_X_AsyncApi_EpEventName();
    if(eventName !== undefined) return eventName;
    if(this.epAsyncApiMessageDocument) {
      // get the event name from the message document
      return this.epAsyncApiMessageDocument.getMessageName();
    }
    // none found
    return undefined;
    // else {
    //   // get the event name from the channel key as last resort
    //   // Note: message name must NOT contain slashes '/', otherwise exported async api channel will reference a message which will NOT be found.
    //   //eslint-disable-next-line
    //   return this.asyncApiChannelKey.replaceAll(/[^0-9a-zA-Z\._]+/g, "-");
    // }
  }
  private createEpEventVersionName(): string {
    if(this.epEventVersionName !== undefined) return this.epEventVersionName;
    if(this.epAsyncApiMessageDocument) {
      return this.epAsyncApiMessageDocument.getMessageDisplayName();
    }
    // set to empty string for better logging
    return '';
  }
  private createEpEventDescription(): string {
    if(this.epEventDescription !== undefined) return this.epEventDescription;
    if(this.epAsyncApiMessageDocument) return this.epAsyncApiMessageDocument.getMessageDescription();
    // set to empty string for better logging
    return '';
  }

  private validateEpEventName = () => {
    const funcName = "validateEpEventName";
    const logName = `${EpAsyncApiChannelDocument.name}.${funcName}()`;
    const epEventName = this.createEpEventName();
    if(epEventName === undefined) throw new EpAsyncApiValidationError(logName, this.constructor.name, undefined, {
      asyncApiSpecTitle: this.epAsyncApiDocument.getTitle(),
      value: {
        channel: this.asyncApiChannelKey
      },
      issues: 'unable to create EP Event Name for channel',
    });
    const schema = $Event.properties.name;
    const v: Validator = new Validator();
    const validateResult: ValidatorResult = v.validate(epEventName, schema);
    if (!validateResult.valid) throw new EpAsyncApiValidationError(logName, this.constructor.name, undefined, {
      asyncApiSpecTitle: this.epAsyncApiDocument.getTitle(),
      value: {
        channel: this.asyncApiChannelKey,
        epEventName: epEventName
      },
      issues: validateResult.errors,
    });
  };

  private validateEpEventVersionName = () => {
    const funcName = "validateEpEventVersionName";
    const logName = `${EpAsyncApiChannelDocument.name}.${funcName}()`;
    const epEventVersionName = this.createEpEventVersionName();
    const schema = $EventVersion.properties.displayName;
    const v: Validator = new Validator();
    const validateResult: ValidatorResult = v.validate(epEventVersionName, schema);
    if (!validateResult.valid) throw new EpAsyncApiValidationError(logName, this.constructor.name, undefined, {
      asyncApiSpecTitle: this.epAsyncApiDocument.getTitle(),
      value: {
        channel: this.asyncApiChannelKey,
        epEventVersionName: epEventVersionName
      },
      issues: validateResult.errors,
    });
  };

  public validateBrokerType(): void {
    const funcName = "validateBrokerType";
    const logName = `${EpAsyncApiChannelDocument.name}.${funcName}()`;
    if(this.getBrokerType() !== EBrokerTypes.KAFKA) return;
    const epAsyncApiChannelParameterDocumentMap: T_EpAsyncApiChannelParameterDocumentMap | undefined = this.getEpAsyncApiChannelParameterDocumentMap();
    if(epAsyncApiChannelParameterDocumentMap !== undefined && epAsyncApiChannelParameterDocumentMap.size > 0) {
      throw new EpAsyncApiValidationError(logName, this.constructor.name, undefined, {
        asyncApiSpecTitle: this.epAsyncApiDocument.getTitle(),
        issues: "channel parameters cannot be used for brokerType=kafka ",
        value: {
          channel: this.getAsyncApiChannelKey(),
        },
      });  
    }
  }

  private validateChannelMessage(): void {
    const funcName = "validateChannelMessage";
    const logName = `${EpAsyncApiChannelDocument.name}.${funcName}()`;
    const throwIssues = (issues: any) => {
      throw new EpAsyncApiValidationError(logName, this.constructor.name, undefined, {
        asyncApiSpecTitle: this.epAsyncApiDocument.getTitle(),
        issues: issues,
        value: {
          channel: this.getAsyncApiChannelKey(),
        },
      });      
    }
    const messageDocument = this.createMessageDocument();    
    if(messageDocument !== undefined) return;
    const operationMesssagesMap: Map<EpAsyncApiChannelOperationType, Array<EpAsyncApiMessageDocument>> = this.getAllChannelMessageDocuments();
    const pubMessages = operationMesssagesMap.get(EpAsyncApiChannelOperationType.PublishOperation);
    const subMessages = operationMesssagesMap.get(EpAsyncApiChannelOperationType.SubscribeOperation);
    // no message found
    if(!pubMessages && !subMessages) throwIssues('no message found');
    // only 1 message allowed
    if(pubMessages && pubMessages.length > 1) throwIssues('found multiple messages for publish operation (only 1 message allowed)');
    if(subMessages && subMessages.length > 1) throwIssues('found multiple messages for subscribe operation (only 1 message allowed)');
    // check both messages are the same
    const pubMessageName = pubMessages && pubMessages[0].getMessageName();
    const subMessageName = subMessages && subMessages[0].getMessageName();
    if(pubMessageName && subMessageName && pubMessageName !== subMessageName) throwIssues({
      message: 'found different messages for publish and subscribe operations (only 1 message allowed)',
      pubMessageName: pubMessageName,
      subMessageName: subMessageName
    });
  }

  public validate(): void {
    // this doc
    this.validateChannelMessage();
    this.validateEpEventName();
    this.validateEpEventVersionName();
    this.validateBrokerType();
    // channel parameters
    const epAsyncApiChannelParameterDocumentMap: T_EpAsyncApiChannelParameterDocumentMap | undefined = this.getEpAsyncApiChannelParameterDocumentMap();
    if (epAsyncApiChannelParameterDocumentMap !== undefined) {
      for (const [parameterName, epAsyncApiChannelParameterDocument ] of epAsyncApiChannelParameterDocumentMap) {
        parameterName;
        epAsyncApiChannelParameterDocument.validate();
      }
    }
    // channel operations
    const epAsynApiChannelPublishOperation: EpAsynApiChannelPublishOperation | undefined = this.getEpAsyncApiChannelPublishOperation();
    if (epAsynApiChannelPublishOperation !== undefined) {
      epAsynApiChannelPublishOperation.validate();
    }
    const epAsynApiChannelSubscribeOperation: EpAsyncApiChannelSubscribeOperation | undefined = this.getEpAsyncApiChannelSubscribeOperation();
    if (epAsynApiChannelSubscribeOperation !== undefined) {
      epAsynApiChannelSubscribeOperation.validate();
    }
  }

  public validate_BestPractices(): void {
    // add best practices validations for channel here

    // channel parameters
    const epAsyncApiChannelParameterDocumentMap: T_EpAsyncApiChannelParameterDocumentMap | undefined = this.getEpAsyncApiChannelParameterDocumentMap();
    if (epAsyncApiChannelParameterDocumentMap !== undefined) {
      for (const [_parameterName, epAsyncApiChannelParameterDocument] of epAsyncApiChannelParameterDocumentMap) {
        epAsyncApiChannelParameterDocument.validate_BestPractices();
        _parameterName;
      }
    }
    // channel operations
    const epAsynApiChannelPublishOperation: EpAsynApiChannelPublishOperation | undefined = this.getEpAsyncApiChannelPublishOperation();
    if(epAsynApiChannelPublishOperation !== undefined) epAsynApiChannelPublishOperation.validate_BestPractices();
    const epAsynApiChannelSubscribeOperation: EpAsyncApiChannelSubscribeOperation | undefined = this.getEpAsyncApiChannelSubscribeOperation();
    if(epAsynApiChannelSubscribeOperation !== undefined) epAsynApiChannelSubscribeOperation.validate_BestPractices();
  }

  public getAsyncApiChannel(): Channel { return this.asyncApiChannel; }

  public getAsyncApiChannelKey(): string { return this.asyncApiChannelKey; }

  public getEpEventName(): string {
    const funcName = "getEpEventName";
    const logName = `${EpAsyncApiDocument.name}.${funcName}()`;
    if(this.epEventName === undefined) throw new EpAsyncApiInternalError(logName, this.constructor.name, "this.epEventName === undefined");
    // if(this.epEventName === undefined) {
    //   this.epEventName = this.createEpEventName();
    //   this.validateEpEventName();
    // }
    // if(this.epEventName === undefined) throw new EpAsyncApiInternalError(logName, this.constructor.name, "this.epEventName === undefined");
    return this.epEventName;
  }

  public getEpEventVersionName(): string {
    const funcName = "getEpEventVersionName";
    const logName = `${EpAsyncApiDocument.name}.${funcName}()`;
    if(this.epEventVersionName === undefined) throw new EpAsyncApiInternalError(logName, this.constructor.name, "this.epEventVersionName === undefined");
    // if(this.epEventVersionName === undefined) {
    //   this.epEventVersionName = this.createEpEventVersionName();
    //   this.validateEpEventVersionName();
    // }
    return this.epEventVersionName;
  }

  public getEpEventDescription(): string {
    const funcName = "getEpEventDescription";
    const logName = `${EpAsyncApiDocument.name}.${funcName}()`;
    if(this.epEventDescription === undefined) throw new EpAsyncApiInternalError(logName, this.constructor.name, "this.epEventDescription === undefined");
    return this.epEventDescription;
  }

  // public getApplicationDomainName(): string {
  //   return this.epAsyncApiDocument.getAssetsApplicationDomainName();
  // }

  public getEpAsyncApiChannelParameterDocumentMap(): T_EpAsyncApiChannelParameterDocumentMap | undefined {
    if (!this.asyncApiChannel.hasParameters()) return undefined;
    const paramRecords: Record<string, ChannelParameter> = this.asyncApiChannel.parameters();
    const epAsyncApiChannelParameterDocumentMap: T_EpAsyncApiChannelParameterDocumentMap = new Map<string, EpAsyncApiChannelParameterDocument>();
    for (const [name, parameter] of Object.entries(paramRecords)) {
      const epAsyncApiChannelParameterDocument = new EpAsyncApiChannelParameterDocument(name, parameter);
      epAsyncApiChannelParameterDocumentMap.set(name, epAsyncApiChannelParameterDocument);
    }
    return epAsyncApiChannelParameterDocumentMap;
  }

  public getBrokerType(): EBrokerTypes { return this.epAsyncApiDocument.getBrokerType(); }

  public getChannelDelimiter(): EChannelDelimiters { return this.epAsyncApiDocument.getChannelDelimiter(); }
  
  public getEpAsyncApiChannelPublishOperation(): EpAsynApiChannelPublishOperation | undefined {
    if (this.asyncApiChannel.hasPublish()) { 
      return new EpAsynApiChannelPublishOperation(this.epAsyncApiDocument, this, this.asyncApiChannel.publish());
    }
    return undefined;
  }

  public getEpAsyncApiChannelSubscribeOperation(): EpAsyncApiChannelSubscribeOperation | undefined {
    if (this.asyncApiChannel.hasSubscribe()) {
      return new EpAsyncApiChannelSubscribeOperation(this.epAsyncApiDocument, this, this.asyncApiChannel.subscribe()
      );
    }
    return undefined;
  }
}
