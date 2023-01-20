/* istanbul ignore file */
import { ApiError } from "@solace-labs/ep-openapi-node";
import { EpSdkLogger } from "./EpSdkLogger";
import { 
  IEpSdkTask_TransactionLogData,
  EEpSdk_VersionTaskStrategy
} from "../tasks";

enum ELoggerCodes {
  EP_SDK_INTERNAL_ERROR = "EP_SDK_INTERNAL_ERROR"
}

export function isEpPermissionsError(error: any): boolean {
  if(error instanceof ApiError) {
    const apiError: ApiError = error;
    return apiError.status === 401 || apiError.status === 403;
  } else return false;
}

/** @category Errors */
export class EpSdkError extends Error {
  private internalStack: Array<string>;
  private internalLogName: string;
  private internalModuleNName: string;
  private internalMessage: string;
  private readonly baseName: string = EpSdkError.name;

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
    const funcName = 'toObject';
    const logName = `${EpSdkError.name}.${funcName}()`;
    try {
      return JSON.parse(JSON.stringify(this));
    } catch (e: any) {
      EpSdkLogger.error(EpSdkLogger.createLogEntry(logName, { code: ELoggerCodes.EP_SDK_INTERNAL_ERROR, module: this.internalModuleNName, message: `JSON.parse error`, details: { name: e.name, message: e.message } }));    
      return {
        internalLogName: this.internalLogName,
        internalMessage: this.internalMessage ? this.internalMessage : `JSON.parse error: ${e.name}: ${e.message}`,
        internalStack: this.internalStack
      }
    }
  }
}

/** @category Errors */
export class EPSdkErrorFromError extends EpSdkError {
  protected static DefaultDescription = 'EPSdkError From Error';
  private originalError: {
    name: string,
    errors: any,
    status: number
  }
  constructor(internalLogName: string, internalModuleName: string, originalError: any) {
    super(internalLogName, internalModuleName, `${EPSdkErrorFromError.DefaultDescription}: ${originalError.message}`);
    this.originalError = {
      name: originalError.name,
      errors: originalError.errors || [{ message: originalError.message }],
      status: originalError.status
    }
  }
}

/**
 * Use when catching an ApiError to wrap into an EpSdkError.
 * @category Errors
 */
export class EpSdkErrorFromSEPApiError extends EpSdkError {
  protected static DefaultDescription = 'EP Api Error';
  private apiError: ApiError;
  constructor(internalLogName: string, internalModuleName: string, internalMessage: string = EpSdkErrorFromSEPApiError.DefaultDescription, apiError: ApiError) {
    super(internalLogName, internalModuleName, internalMessage);
    this.apiError = apiError;
  }
}

/**
 * Use when EP Api behaves unexpectedly or not according to spec.
 * @category Errors
 * @example
 * throw new EpSdkApiContentError(logName, "applicationDomainResponse.data === undefined", {
 *    applicationDomainId: applicationDomainId
 *  });
 *
 */
export class EpSdkApiContentError extends EpSdkError {
  protected static DefaultDescription = 'EP Api Content Error';
  private details: any;
  constructor(internalLogName: string, internalModuleName: string, message: string = EpSdkApiContentError.DefaultDescription, details: any) {
    super(internalLogName, internalModuleName, message);
    this.details = details;
  }
}

/** @category Errors */
export class EpSdkLoggerNotInitializedError extends EpSdkError {
  protected static DefaultDescription = 'EP SDK Logger not initialized';
  constructor(internalLogName: string, internalModuleName: string, message: string = EpSdkLoggerNotInitializedError.DefaultDescription) {
    super(internalLogName, internalModuleName, message);
  }
}

/** @category Errors */
export class EpSdkInternalTaskError extends EpSdkError {
  protected static DefaultDescription = 'EP SDK Internal Task Error';
  private epSdkCause: any;
  constructor(internalLogName: string, internalModuleName: string, cause: any) {
    super(internalLogName, internalModuleName, EpSdkInternalTaskError.DefaultDescription);
    this.epSdkCause = cause;
  }
}

/** @category Errors */
export class EpSdkEpApiError extends EpSdkError {
  protected static DefaultDescription = 'EP Api Error';
  public apiError: ApiError;
  constructor(internalLogName: string, internalModuleName: string, apiError: ApiError) {
    super(internalLogName, internalModuleName, EpSdkEpApiError.DefaultDescription);
    this.apiError = apiError;
  }
}

/**
 * Use when an error occurred using a service.
 * @category Errors
*/
export class EpSdkServiceError extends EpSdkError {
  protected static DefaultDescription = 'EP Sdk Service Error';
  private details: any;
  constructor(internalLogName: string, internalModuleName: string, message: string = EpSdkServiceError.DefaultDescription, details: any) {
    super(internalLogName, internalModuleName, message);
    this.details = details;
  }
}

/** @category Errors */
export class EpSdkFeatureNotSupportedError extends EpSdkError {
  protected static DefaultDescription = 'EP Sdk Feature not supported Error';
  private featureDescription: any;
  constructor(internalLogName: string, internalModuleName: string, message: string = EpSdkFeatureNotSupportedError.DefaultDescription, featureDescription: any, ) {
    super(internalLogName, internalModuleName, message);
    this.featureDescription = featureDescription;
  }
}

/** @category Errors */
export class EpSdkInvalidSemVerStringError extends EpSdkError {
  protected static DefaultDescription = 'EP Sdk Invalid SemVer string Error';
  private semVerString: string;
  constructor(internalLogName: string, internalModuleName: string, message: string = EpSdkInvalidSemVerStringError.DefaultDescription, semVerString: string ) {
    super(internalLogName, internalModuleName, message);
    this.semVerString = semVerString;
  }
}

/** @category Errors */
export class EpSdkValidationError extends EpSdkError {
  protected static DefaultDescription = 'EP Sdk Validation Error';
  private validationError: any;
  private value: any;
  constructor(internalLogName: string, internalModuleName: string, message: string = EpSdkValidationError.DefaultDescription, validationError: any, value: any ) {
    super(internalLogName, internalModuleName, message);
    this.validationError = validationError;
    this.value = value;
  }
}

/** @category Errors */
export class EpSdkTaskConfigValidationError extends EpSdkError {
  protected static DefaultDescription = 'EP Sdk Task Config Validation Error';
  private validationError: any;
  private value: any;
  constructor(internalLogName: string, internalModuleName: string, message: string = EpSdkTaskConfigValidationError.DefaultDescription, validationError: any, value: any ) {
    super(internalLogName, internalModuleName, message);
    this.validationError = validationError;
    this.value = value;
  }
}

/** @category Errors */
export type TEpSdkVersionTaskStrategyValidationError_Details = {
  versionString: string;
  versionStrategy: EEpSdk_VersionTaskStrategy;
  existingVersionString: string;
  transactionLogData: IEpSdkTask_TransactionLogData;
}

/** @category Errors */
export class EpSdkVersionTaskStrategyValidationError extends EpSdkError {
  protected static DefaultDescription = 'EP Sdk Version Task Version Strategy Validation Error';
  public details: TEpSdkVersionTaskStrategyValidationError_Details;
  constructor(internalLogName: string, internalModuleName: string, message: string = EpSdkVersionTaskStrategyValidationError.DefaultDescription, details: TEpSdkVersionTaskStrategyValidationError_Details ) {
    super(internalLogName, internalModuleName, message);
    this.details = details;
  }
}


