
import { 
  Message,
  Channel,
  SubscribeOperation,
  PublishOperation
} from '@asyncapi/parser';

export class EpAsyncApiError extends Error {
  private internalStack: Array<string>;
  private internalLogName: string;
  private internalModuleNName: string;
  private internalMessage: string;
  private readonly baseName: string = EpAsyncApiError.name;

  private createArrayFromStack = (stack: any): Array<string> => {
    return stack.split('\n');
  }

  constructor(internalLogName: string, internalModuleName: string, internalMessage: string) {
    super(internalMessage?internalMessage:`${internalLogName}:${internalModuleName}`);
    this.internalMessage = internalMessage;
    this.name = this.constructor.name;
    this.internalLogName = internalLogName;
    this.internalModuleNName = internalModuleName;
    this.internalStack = this.createArrayFromStack(this.stack);
  }

  public toString = (): string => {
    return JSON.stringify(this.toObject(), null, 2);
  }

  public toObject = (): any => {
    try {
      return JSON.parse(JSON.stringify(this));
    } catch (e: any) {
      return {
        internalLogName: this.internalLogName,
        internalMessage: this.internalMessage ? this.internalMessage : `JSON.parse error: ${e.name}: ${e.message}`,
        internalStack: this.internalStack
      }
    }
  }
}

export class EpAsyncApiInternalError extends EpAsyncApiError {
  public static DefaultDescription = 'EP Async Api Internal Error';
  public error: any;
  constructor(internalLogName: string, internalModuleName: string, error: any) {
    super(internalLogName, internalModuleName, EpAsyncApiInternalError.DefaultDescription);
    this.error = error;
  } 
}

export class EpAsyncApiParserError extends EpAsyncApiError {
  protected static DefaultDescription = 'Async Api Parser Error';
  private specFilePath: string;
  private parserError: any;
  constructor(internalLogName: string, internalModuleName: string, specFilePath: string, parserError: any) {
    super(internalLogName, internalModuleName, EpAsyncApiParserError.DefaultDescription);
    this.specFilePath = specFilePath;
    this.parserError = parserError;
  }
}

export type T_EpAsyncApiSpecErrorDetails = {
  asyncApiSpecTitle: string;
  details: any;
}
export class EpAsyncApiSpecError extends EpAsyncApiError {
  private details: T_EpAsyncApiSpecErrorDetails;
  constructor(internalLogName: string, internalModuleName: string, internalMessage: string, details: T_EpAsyncApiSpecErrorDetails) {
    super(internalLogName, internalModuleName, internalMessage);
    this.details = details;
  }
}

export type T_EpAsyncApiChannelOperationDetails = {
  issue: string;
  asyncApiSpecTitle: string;
  asyncApiChannel: Channel;
  asyncApiChannelOperation: SubscribeOperation | PublishOperation;
}
export class EpAsyncApiChannelOperationError extends EpAsyncApiError {
  protected static DefaultDescription = 'EP Async Api Channel Operation Error';
  private details: T_EpAsyncApiChannelOperationDetails;
  constructor(internalLogName: string, internalModuleName: string, details: T_EpAsyncApiChannelOperationDetails) {
    super(internalLogName, internalModuleName, EpAsyncApiChannelOperationError.DefaultDescription);
    this.details = details;
  }
}

export type T_EpAsyncApiMessageErrorDetails = {
  issue: string;
  apiTitle: string;
  apiChannel: string | undefined;
  apiMessage: string;
  apiMessageContent: Message;
}
export class EpAsyncApiMessageError extends EpAsyncApiError {
  protected static DefaultDescription = 'EP Async Api Message Error';
  public details: T_EpAsyncApiMessageErrorDetails;
  constructor(internalLogName: string, internalModuleName: string, details: T_EpAsyncApiMessageErrorDetails) {
    super(internalLogName, internalModuleName, EpAsyncApiMessageError.DefaultDescription);
    this.details = details;
  }
}

export type T_EpAsyncApiValidationErrorDetails = {
  asyncApiSpecTitle: string;
  issues: any;
  value: any;
}
export class EpAsyncApiValidationError extends EpAsyncApiError {
  protected static DefaultDescription = 'EP Async Api Validation Error';
  public details: T_EpAsyncApiValidationErrorDetails;
  constructor(internalLogName: string, internalModuleName: string, internalMessage: string = EpAsyncApiValidationError.DefaultDescription, details: T_EpAsyncApiValidationErrorDetails) {
    super(internalLogName, internalModuleName, internalMessage);
    this.details = details;
  }
}
export class EpAsyncApiBestPracticesError extends EpAsyncApiError {
  protected static DefaultDescription = 'EP Async Api Best Practices Error';
  private details: T_EpAsyncApiValidationErrorDetails;
  constructor(internalLogName: string, internalModuleName: string, internalMessage: string = EpAsyncApiBestPracticesError.DefaultDescription, details: T_EpAsyncApiValidationErrorDetails) {
    super(internalLogName, internalModuleName, internalMessage);
    this.details = details;
  }
}

export type T_EpAsyncApiXtensionErrorDetails = {
  asyncApiSpecTitle: string;
  xtensionKey: string;
}
export class EpAsyncApiXtensionError extends EpAsyncApiError {
  protected static DefaultDescription = 'Async API Spec Xtension Error';
  private details: T_EpAsyncApiXtensionErrorDetails;
  constructor(internalLogName: string, internalModuleName: string, message: string = EpAsyncApiXtensionError.DefaultDescription, details: T_EpAsyncApiXtensionErrorDetails) {
    super(internalLogName, internalModuleName, message);
    this.details = details;
  }
}


