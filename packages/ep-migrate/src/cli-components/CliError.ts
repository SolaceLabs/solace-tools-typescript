/* istanbul ignore file */

import { 
  ApiError 
} from "@solace-labs/ep-openapi-node";
import { 
  EpSdkError, 
} from "@solace-labs/ep-sdk";
import CliConfig from "./CliConfig";
import { 
  CliLogger, 
  ECliStatusCodes 
} from "./CliLogger";
import CliRunContext, { 
  ICliRunContext 
} from "./CliRunContext";
import { ICliRunIssue } from "./CliRunIssues";

export class CliErrorFactory {
  public static createCliError = ({logName, error}: {
    logName: string;
    error: Error;
  }): CliError => {
    let cliError: CliError;
    if (error instanceof CliError) {
      return error;
    } else if (error instanceof EpSdkError) {
      cliError = new CliErrorFromEpSdkError(logName, error);
    } else if (error instanceof ApiError) {
      cliError = new CliErrorFromEPApiError(logName, error);
    } else {
      cliError = new CliErrorFromError(logName, error);
    }
    return cliError;
  };
}

export class CliError extends Error {
  private internalStack: Array<string>;
  public internalLogName: string;
  public internalMessage: string;
  protected appName: string;
  protected cliRunContext: ICliRunContext;
  private readonly baseName: string = CliError.name;

  protected createArrayFromStack = (stack: any): Array<string> => {
    return stack.split("\n");
  };

  constructor(internalLogName: string, internalMessage: string) {
    super(internalMessage ? internalMessage : internalLogName);
    this.name = this.constructor.name;
    this.internalLogName = internalLogName;
    this.internalMessage = internalMessage;
    this.internalStack = this.createArrayFromStack(this.stack);
    this.appName = CliConfig.getAppName();
    this.cliRunContext = CliRunContext.get();
  }

  public toString = (): string => {
    return JSON.stringify(this.toObject(), null, 2);
  };

  public toObject = (): any => {
    const funcName = "toObject";
    const logName = `${CliError.name}.${funcName}()`;
    try {
      return JSON.parse(JSON.stringify(this));
    } catch (e: any) {
      CliLogger.error(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.INTERNAL_ERROR, message: `JSON.parse error`, details: { name: e.name, message: e.message }}));
      return {
        internalLogName: this.internalLogName,
        internalMessage: this.internalMessage ? this.internalMessage : `JSON.parse error: ${e.name}: ${e.message}`,
        internalStack: this.internalStack,
      };
    }
  };
}

export class CliErrorFromError extends CliError {
  private originalError: any;
  constructor(internalLogName: string, originalError: Error) {
    super(internalLogName, originalError.message);
    // this.originalError = `${originalError.name}: ${originalError.message}`;
    this.originalError = {
      name: originalError.name ? originalError.name : 'undefined',
      message: originalError.message ? originalError.message : 'undefined',
      stack: this.createArrayFromStack(originalError.stack)
    }
  }
}

export class CliErrorFromEpSdkError extends CliError {
  protected static DefaultDescription = "EP SDK Error";
  public epSdkError: EpSdkError;
  constructor(internalLogName: string, epSdkError: EpSdkError) {
    super(internalLogName, CliErrorFromEpSdkError.DefaultDescription);
    this.epSdkError = epSdkError;
  }
}

export class CliErrorFromEPApiError extends CliError {
  protected static DefaultDescription = "Event Portal Api Error";
  private apiError: ApiError;
  constructor(internalLogName: string, apiError: ApiError) {
    super(internalLogName, CliErrorFromEPApiError.DefaultDescription);
    this.apiError = apiError;
  }
}

export class CliConfigError extends CliError {
  constructor(internalLogName: string, description: string) {
    super(internalLogName, description);
  }
}

export class CliConfigTokenError extends CliError {
  private static Name = "CliConfigTokenError";
  private static DefaultDescription = "Unable to parse Token";
  public details: any;
  constructor(internalLogName: string, details: any) {
    super(internalLogName, CliConfigTokenError.DefaultDescription);
    this.name = CliConfigTokenError.Name;
    this.details = details;
  }
}

export class CliConfigInvalidConfigFileError extends CliConfigError {
  private static Name = "CliConfigInvalidConfigFileError";
  private static DefaultDescription = "Invalid CLI Config File";
  public filePath: string;
  public details: any;
  constructor(internalLogName: string, filePath: string, details: any) {
    super(internalLogName, CliConfigInvalidConfigFileError.DefaultDescription);
    this.filePath = filePath;
    this.details = details;
    this.name = CliConfigInvalidConfigFileError.Name;
  }
}

export class CliConfigInvalidConfigError extends CliConfigError {
  private static Name = "CliConfigInvalidConfigError";
  private static DefaultDescription = "Invalid CLI Config";
  public details: any;
  constructor(internalLogName: string, details: any) {
    super(internalLogName, CliConfigInvalidConfigError.DefaultDescription);
    this.details = details;
    this.name = CliConfigInvalidConfigError.Name;
  }
}

export class CliConfigFileParseError extends CliConfigError {
  private static Name = "CliConfigFileParseError";
  private static DefaultDescription = "CLI Config File Parse Error";
  public configFilePath: string;
  public details: any;
  constructor(internalLogName: string, configFilePath: string, details: any) {
    super(internalLogName, CliConfigFileParseError.DefaultDescription);
    this.configFilePath = configFilePath;
    this.details = details;
    this.name = CliConfigFileParseError.Name;
  }
}


export class CliConfigFileMissingEnvVarError extends CliConfigError {
  private static Name = "CliConfigFileMissingEnvVarError";
  private static DefaultDescription = "CLI Config File Missing Environment Variable Error";
  public configFile: string;
  public key: string;
  public envVarName: string;
  constructor(internalLogName: string, configFile: string, key: string, envVarName: string) {
    super(internalLogName, CliConfigFileMissingEnvVarError.DefaultDescription);
    this.configFile = configFile;
    this.key = key;
    this.envVarName = envVarName;
    this.name = CliConfigFileMissingEnvVarError.Name;
  }
}

export class CliConfigNotInitializedError extends CliConfigError {
  private static DefaultDescription = "CliConfig not Initialized Error";
  constructor(internalLogName: string) {
    super(internalLogName, CliConfigNotInitializedError.DefaultDescription);
  }
}

export class CliInternalCodeInconsistencyError extends CliError {
  protected static DefaultDescription = "Internal Code Inconsistency Error";
  private details: any;
  constructor(internalLogName: string, details: any) {
    super(
      internalLogName,
      CliInternalCodeInconsistencyError.DefaultDescription
    );
    this.details = details;
  }
}

export class CliEPApiContentError extends CliError {
  protected static DefaultDescription = "Event Portal Api Content Error";
  private details: any;
  constructor(internalLogName: string, message: string, details: any) {
    super(
      internalLogName,
      `${CliEPApiContentError.DefaultDescription}: ${message}`
    );
    this.details = details;
  }
}

export class CliUsageError extends CliError {
  private static Name = "CliUsageError";
  protected static DefaultDescription = "CLI Usage Error";
  public message: string;
  public details: any;
  constructor(internalLogName: string, message: string, details: any) {
    super(internalLogName, `${CliUsageError.DefaultDescription}: ${message}`);
    this.details = details;
    this.message = message;
    this.name = CliUsageError.Name;
  }
}

export class CliEPMigrateTagsError extends CliError {
  protected static DefaultDescription = "Migrate Tags Error";
  private cause: any;
  private details: any;
  constructor(internalLogName: string, cause: any, details: any) {
    super(internalLogName, CliEPMigrateTagsError.DefaultDescription);
    this.cause = cause;
    this.details = details;
  }
}

export class CliFeatureNotSupportedError extends CliError {
  private static Name = "CliFeatureNotSupportedError";
  protected static DefaultDescription = "CLI Feature Not Supported Error";
  private details: any;
  constructor(internalLogName: string, details: any) {
    super(internalLogName, CliFeatureNotSupportedError.DefaultDescription);
    this.name = CliFeatureNotSupportedError.Name;
    this.details = details;
  }
}

export class CliMigrateReferenceIssueError extends CliError {
  private static Name = "CliMigrateReferenceIssueError";
  protected static DefaultDescription = "CLI Migrate Reference Issue Error";
  private cliRunIssues: Array<ICliRunIssue>;
  constructor(internalLogName: string, cliRunIssues: Array<ICliRunIssue>) {
    super(internalLogName, CliMigrateReferenceIssueError.DefaultDescription);
    this.name = CliMigrateReferenceIssueError.Name;
    this.cliRunIssues = cliRunIssues;
  }
}

export class CliMigrateEventReferenceEnumIssueError extends CliError {
  private static Name = "CliMigrateEventReferenceEnumIssueError";
  protected static DefaultDescription = "CLI Migrate Event Reference Enum Issue Error";
  private details: any;
  constructor(internalLogName: string, details: any) {
    super(internalLogName, CliMigrateEventReferenceEnumIssueError.DefaultDescription);
    this.name = CliMigrateEventReferenceEnumIssueError.Name;
    this.details = details;
  }
}

export class CliMigrateEpV1IncompatibilityError extends CliError {
  private static Name = "CliMigrateEpV1IncompatibilityError";
  protected static DefaultDescription = "CLI Migrate EpV1 to EpV2 Incompatibility Error";
  private details: any;
  constructor(internalLogName: string, details: any) {
    super(internalLogName, CliMigrateEpV1IncompatibilityError.DefaultDescription);
    this.name = CliMigrateEpV1IncompatibilityError.Name;
    this.details = details;
  }
}

export class CliMigrateTopicDomainAddressLevelEnumVersionReferenceIssueError extends CliError {
  private static Name = "CliMigrateTopicDomainAddressLevelEnumVersionReferenceIssueError";
  protected static DefaultDescription = "CLI Migrate Topic Domain Address Level Enum Version Reference Error";
  private details: any;
  constructor(internalLogName: string, details: any) {
    super(internalLogName, CliMigrateTopicDomainAddressLevelEnumVersionReferenceIssueError.DefaultDescription);
    this.name = CliMigrateTopicDomainAddressLevelEnumVersionReferenceIssueError.Name;
    this.details = details;
  }
}
