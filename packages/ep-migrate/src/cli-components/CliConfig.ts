// import v8 from "node:v8";
const v8 = require('node:v8');
import { 
  OptionValues 
} from 'commander';
import jwt_decode from "jwt-decode";
import { 
  EpSdkEnvironmentsService, 
  EpSdkMessagingService 
} from '@solace-labs/ep-sdk';
import { 
  Environment, 
  EventMesh, 
  EventMeshesResponse, 
  MessagingService 
} from '@solace-labs/ep-openapi-node';
import { 
  EventMeshesService 
} from '@solace-labs/ep-rt-openapi-node';
import { 
  ValidationError, 
  Validator, 
  ValidatorResult 
} from 'jsonschema';
import CliConfigSchema from './CliConfigSchema.json';
import { 
  DefaultAppName, 
  DefaultConfigFile 
} from "../constants";
import {
  CliConfigFileMissingEnvVarError,
  CliConfigFileParseError,
  CliConfigInvalidConfigError,
  CliConfigInvalidConfigFileError,
  CliConfigNotInitializedError,
  CliConfigTokenError,
  CliUsageError,
} from "./CliError";
import {
  CliLogger,
  ECliLogger_LogLevel,
  ECliLogger_EpSdkLogLevel,
  ECliStatusCodes,
  ICliLoggerOptions,
  TCliLogger_EpSdkLogLevel,
} from "./CliLogger";
import { 
  CliUtils 
} from "./CliUtils";
import { 
  ECliMigrateManagerMode, 
  ECliMigrateManagerRunState, 
  ICliMigrateManagerOptions, 
  ICliMigrateManagerOptionsEpV1
} from './CliMigrateManager';
import { 
  ICliApplicationDomainsMigrateConfig,
  ICliApplicationsMigrateConfig,
  ICliConfigEp2Versions,
  ICliEnumsMigrateConfig,
  ICliEventsMigrateConfig,
  ICliSchemasMigrateConfig
} from '../migrators';

const DEFAULT_CLI_LOGGER_LOG_LEVEL = ECliLogger_LogLevel.INFO;
// const DEFAULT_CLI_LOGGER_LOG_FILE = `./tmp/logs/${DefaultAppName}.log`;
// const create_DEFAULT_CLI_LOGGER_LOG_FILE = (appName: string) => { return `./tmp/logs/${appName}.log`; };
const DEFAULT_CLI_LOGGER_LOG_TO_STDOUT = false;
const DEFAULT_CLI_LOGGER_EP_SDK_LOG_LEVEL = ECliLogger_EpSdkLogLevel.SILENT;
const DEFAULT_CLI_LOGGER_PRETTY_PRINT = false;
const DEFAULT_CLI_LOGGER_LOG_SUMMARY_TO_CONSOLE = true;

interface ICliConfigFileEpConfig {
  apiUrl: string;
  token: string;
}
interface ICliConfigFileMigrateConfig {
  epV1?: ICliMigrateManagerOptionsEpV1;
  epV2: {
    applicationDomainPrefix?: string;
    versions: ICliConfigEp2Versions;
  };
  enums: ICliEnumsMigrateConfig;
  applicationDomains: ICliApplicationDomainsMigrateConfig;
  schemas: ICliSchemasMigrateConfig;
  events: ICliEventsMigrateConfig;
  applications: ICliApplicationsMigrateConfig;
}
export interface ICliConfigFile {
  logger: {
    logLevel: string;
    logFile: string;
    prettyPrint: boolean;
    log2Stdout: boolean;
    epSdkLogLevel: TCliLogger_EpSdkLogLevel;
    logSummary2Console: boolean;
  },
  epV1: ICliConfigFileEpConfig;
  epV2: ICliConfigFileEpConfig;
  migrate: ICliConfigFileMigrateConfig;
}

export interface ICliLoggerConfig extends ICliLoggerOptions {}

export interface ICliOrganizationInfo {
  name: string;
  id: string;
}
export interface ICliEpConfig {
  baseUrl: string;
  token: string;
  organizationInfo: ICliOrganizationInfo;
}

export interface ICliMigrateConfig extends ICliMigrateManagerOptions {}

export interface ICliConfig {
  appName: string;
  runId: string;
  cliLoggerConfig: ICliLoggerConfig;
  epV1Config: ICliEpConfig;
  epV2Config: ICliEpConfig;
  cliMigrateConfig: ICliMigrateConfig;
}

class CliConfig {
  private cliVersion: string;
  private commandLineOptionValues: OptionValues;
  private configFile: string;
  private config: ICliConfig;

  private assertIsInitialized = () => {
    if (!this.config)
      throw new CliConfigNotInitializedError(CliConfig.name);
  };

  private generatedRunId = () => {
    const pad = (n: number, pad?: number): string => { return String(n).padStart(pad ? pad : 2, "0"); };
    const d = new Date();
    return `${d.getUTCFullYear()}_${pad(d.getUTCMonth() + 1)}_${pad(d.getUTCDate())}_${pad(d.getUTCHours())}_${pad(d.getUTCMinutes())}_${pad(d.getUTCSeconds())}_${pad(d.getUTCMilliseconds(), 3)}`;
  };

  private expandEnvVar(configFile: string, key: string, value: string): string {
    const funcName = "expandEnvVar";
    const logName = `${CliConfig.name}.${funcName}()`;
    // console.log('\n\n\n');
    // console.log(`${logName}: key = ${JSON.stringify(key)}`);
    // console.log(`${logName}: value = ${JSON.stringify(value, null, 2)}`);
    if(typeof value !== 'string') return value;
    const parts: (string | undefined)[] = value.split(/(\$?\$\{[^{}]*\})/);
    // console.log(`${logName}: parts = ${JSON.stringify(parts, null, 2)}`);
    let theValue: string = value;
    for(let i=1; i < parts.length; i +=2 ) {
      const part = parts[i];
      if(part) {
        // console.log(`${logName}: part = ${JSON.stringify(part, null, 2)}`);
        const envVarName = part.slice(2, -1).trim();
        // console.log(`${logName}: envVarName = ${JSON.stringify(envVarName, null, 2)}`);
        const envVarValue = process.env[envVarName];
        // console.log(`${logName}: envVarValue = ${JSON.stringify(envVarValue, null, 2)}`);
        if(envVarValue === undefined) throw new CliConfigFileMissingEnvVarError(logName, configFile, key, envVarName);
        theValue = envVarValue;
      }
    }
    return theValue;
  }
  
  private expandEnvVars(configFile: string, obj: any): any {
    return JSON.parse(JSON.stringify(obj, (k, v) => {
      return this.expandEnvVar(configFile, k, v);
    }));
  }

  private getOrganizationInfo(token: string): ICliOrganizationInfo {
    const funcName = "getOrganizationInfo";
    const logName = `${CliConfig.name}.${funcName}()`;
    try {
      const decoded: any = jwt_decode(token);    
      /* istanbul ignore next */
      if(decoded.org === undefined) throw new CliConfigTokenError(logName, "unable to read 'org' from token");
      /* istanbul ignore next */
      if(decoded.sub === undefined) throw new CliConfigTokenError(logName, "unable to read 'sub' from token");
      return {
        name: decoded.org,
        id: decoded.sub
      }    
    } catch(e) {
      console.log(`token='${token}'`);
      if(!(e instanceof CliConfigTokenError)) throw new CliConfigTokenError(logName, "unable to decode token");
      throw e;
    }
  }

  private setConfig({ configFile, runState = ECliMigrateManagerRunState.PRESENT, absentRunId }:{
    configFile: string;
    runState: ECliMigrateManagerRunState;
    absentRunId?: string;
  }): void {
    const funcName = "setConfig";
    const logName = `${CliConfig.name}.${funcName}()`;
    const rawConfigFileContents = CliUtils.readYamlFile(configFile);
    const configFileContents: ICliConfigFile = this.expandEnvVars(configFile, rawConfigFileContents);
    const v: Validator = new Validator();
    const validatorResult: ValidatorResult = v.validate(configFileContents, CliConfigSchema );
    if(!validatorResult.valid) throw new CliConfigFileParseError(logName, configFile, validatorResult.errors.map( (validationError: ValidationError) => { 
      return {
        path: validationError.path,
        property: validationError.property,
        message: validationError.message
      };
    }));
    // populate the config
    const appName = DefaultAppName;
    const runId = this.generatedRunId();
    this.config = {
      appName,
      runId,
      cliLoggerConfig: {
        appName,
        level: configFileContents.logger.logLevel as ECliLogger_LogLevel,
        prettyPrint: configFileContents.logger.prettyPrint,
        log2Stdout: configFileContents.logger.log2Stdout,
        logSummary2Console: configFileContents.logger.logSummary2Console,
        logFile: CliUtils.ensureDirOfFilePathExists(configFileContents.logger.logFile),
        cliLogger_EpSdkLogLevel: configFileContents.logger.epSdkLogLevel
      },
      epV1Config: {
        baseUrl: configFileContents.epV1.apiUrl,
        token: configFileContents.epV1.token,
        organizationInfo: this.getOrganizationInfo(configFileContents.epV1.token)
      },
      epV2Config: {
        baseUrl: configFileContents.epV2.apiUrl,
        token: configFileContents.epV2.token,
        organizationInfo: this.getOrganizationInfo(configFileContents.epV2.token)
      },
      cliMigrateConfig: {
        appName, 
        runId,
        absentRunId,
        cliMigrateManagerMode: ECliMigrateManagerMode.RELEASE_MODE,
        cliMigrateManagerRunState: runState,
        epV1: configFileContents.migrate.epV1,
        epV2: {
          applicationDomainPrefix: configFileContents.migrate.epV2 ? configFileContents.migrate.epV2.applicationDomainPrefix : undefined
        },
        enums: {
          ...configFileContents.migrate.enums,
          epV2: {
            ...configFileContents.migrate.enums.epV2,
            versions: {
              ...configFileContents.migrate.epV2.versions,
            }
          }
        },
        applicationDomains: {
          epV1: configFileContents.migrate.epV1,
          epV2: {}
        },
        schemas: {
          ...configFileContents.migrate.schemas,
          epV2: {
            ...configFileContents.migrate.schemas.epV2,
            versions: {
              ...configFileContents.migrate.epV2.versions,
            }
          }
        },
        events: {
          ...configFileContents.migrate.events,
          epV2: {
            ...configFileContents.migrate.events.epV2,
            versions: {
              ...configFileContents.migrate.epV2.versions,
            }
          }
        },
        applications: {
          ...configFileContents.migrate.applications,
          epV2: {
            ...configFileContents.migrate.applications.epV2,
            versions: {
              ...configFileContents.migrate.epV2.versions,
            }
          }
        },
      }
    };
    // merge optional versions config
    if(configFileContents.migrate.enums && configFileContents.migrate.enums.epV2 && configFileContents.migrate.enums.epV2.versions) {
      this.config.cliMigrateConfig.enums.epV2.versions = {
        ...configFileContents.migrate.epV2.versions,
        ...configFileContents.migrate.enums.epV2.versions,
      };
    }
    if(configFileContents.migrate.schemas && configFileContents.migrate.schemas.epV2 && configFileContents.migrate.schemas.epV2.versions) {
      this.config.cliMigrateConfig.schemas.epV2.versions = {
        ...configFileContents.migrate.epV2.versions,
        ...configFileContents.migrate.schemas.epV2.versions,
      };
    }
    if(configFileContents.migrate.events && configFileContents.migrate.events.epV2 && configFileContents.migrate.events.epV2.versions) {
      this.config.cliMigrateConfig.events.epV2.versions = {
        ...configFileContents.migrate.epV2.versions,
        ...configFileContents.migrate.events.epV2.versions,
      };
    }
    if(configFileContents.migrate.applications && configFileContents.migrate.applications.epV2 && configFileContents.migrate.applications.epV2.versions) {
      this.config.cliMigrateConfig.applications.epV2.versions = {
        ...configFileContents.migrate.epV2.versions,
        ...configFileContents.migrate.applications.epV2.versions,
      };
    }

  }

  public validateAbsent = async() => {
    const funcName = "validateAbsent";
    const logName = `${CliConfig.name}.${funcName}()`;

    if(this.config.cliMigrateConfig.absentRunId !== undefined) return;
    if(this.config.cliMigrateConfig.epV2.applicationDomainPrefix === undefined) {
      throw new CliUsageError(
        logName, 
        `Run state '${this.config.cliMigrateConfig.cliMigrateManagerRunState}' requires one of defined: '--absentRunId={runId}' or '${CliUtils.nameOf<ICliConfigFile>("migrate.epV2.applicationDomainPrefix")}'`,
        undefined
        );
    }
  }

  public validatePresent = async() => {
    const funcName = "validatePresent";
    const logName = `${CliConfig.name}.${funcName}()`;
    if(this.config.cliMigrateConfig.applications.epV2.environment) {
      const { environmentName, eventMeshName, eventBrokerName } = this.config.cliMigrateConfig.applications.epV2.environment;
      const environment: Environment | undefined = await EpSdkEnvironmentsService.getByName({ environmentName });
      if(environment === undefined) {
        throw new CliConfigInvalidConfigError(logName, {
          message: 'Ep V2 environment for applications not found',
          environmentName
        });
      }
      let eventMesh: EventMesh | undefined = undefined;
      let nextPage: number | null = 1;
      while(eventMesh === undefined && nextPage !== null) {
        const eventMeshesResponse: EventMeshesResponse = await EventMeshesService.getEventMeshes({ pageNumber: nextPage, environmentId: environment.id });
        if(eventMeshesResponse.data && eventMeshesResponse.data.length > 0) {
          eventMesh = eventMeshesResponse.data.find( x => x.name === eventMeshName && x.environmentId === environment.id );
        }
        nextPage = eventMeshesResponse.meta?.pagination?.nextPage ?? null;
      }
      if(eventMesh === undefined) {
        throw new CliConfigInvalidConfigError(logName, {
          message: 'Ep V2 event mesh for applications not found',
          eventMeshName
        });
      }
      const messagingServices: MessagingService[] = await EpSdkMessagingService.listAll({});
      const eventMeshId = eventMesh.id;
      const messagingService = messagingServices.find( x => x.name === eventBrokerName && x.eventMeshId === eventMeshId);
      if(messagingService === undefined) {
        throw new CliConfigInvalidConfigError(logName, {
          message: 'Ep V2 event broker for applications not found',
          eventBrokerName
        });
      }
    }
  }

  public initialize = ({ cliVersion, commandLineOptionValues, configFile, runState, absentRunId }: {
    cliVersion: string;
    commandLineOptionValues: OptionValues;
    configFile?: string;
    runState: ECliMigrateManagerRunState;
    absentRunId?: string;
  }): void => {
    const funcName = "initialize";
    const logName = `${CliConfig.name}.${funcName}()`;
    this.cliVersion = cliVersion;
    this.commandLineOptionValues = commandLineOptionValues;
    this.configFile = configFile ? configFile : DefaultConfigFile;
    const testedConfigFile = CliUtils.validateFilePathWithReadPermission(this.configFile);
    if(testedConfigFile === undefined) throw new CliConfigInvalidConfigFileError(logName, this.configFile, 'cannot read config file');
    this.setConfig({
      configFile: testedConfigFile,
      runState,
      absentRunId,
    });
  };

  private maskSecrets = (k: string, v: any) => {
    if(k.includes('token')) return 'xxx';
    return v;
  }

  public logConfig = (): void => {
    const funcName = "logConfig";
    const logName = `${CliConfig.name}.${funcName}()`;
    this.assertIsInitialized();
    console.log('\n');
    console.log(`Version: ${this.cliVersion}`);
    console.log(`RunId: ${this.config.runId}`);
    console.log(`Log file: ${this.config.cliLoggerConfig.logFile}\n`);
    CliLogger.info(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.INITIALIZED, message: "config", details: {
      cliVersion: this.cliVersion,
      commandLineOptionValues: this.commandLineOptionValues ? this.commandLineOptionValues : 'undefined',
      nodeInfo: {
        version: process.version,
        arch: process.arch,
        platform: process.platform,
        argv: process.argv,
        v8: {
          heapStatistics: v8.getHeapStatistics()
        }
      },
      config: JSON.parse(JSON.stringify(this.config, this.maskSecrets))
    }}));
  };

  public getAppName = (): string => {
    if(this.config) return this.config.appName;
    return DefaultAppName;
  };
  public getRunId = (): string => {
    this.assertIsInitialized();
    return this.config.runId;
  };
  public getCliConfig = (): ICliConfig => {
    this.assertIsInitialized();
    return this.config;
  };
  public getMaskedCliConfig = (): any => {
    this.assertIsInitialized();
    return JSON.parse(JSON.stringify(this.config, this.maskSecrets));
  };
  public getDefaultLoggerOptions = (): ICliLoggerOptions => {
    // don't use a log file at startup - could be empty if different logfile provided in config which leads to confusion.
    // const logFile = this.initializeDirOfFilePath(DEFAULT_CLI_LOGGER_LOG_FILE);
    return {
      appName: DefaultAppName,
      level: DEFAULT_CLI_LOGGER_LOG_LEVEL,
      // logFile: logFile,
      log2Stdout: DEFAULT_CLI_LOGGER_LOG_TO_STDOUT,
      prettyPrint: DEFAULT_CLI_LOGGER_PRETTY_PRINT,
      logSummary2Console: DEFAULT_CLI_LOGGER_LOG_SUMMARY_TO_CONSOLE,
      cliLogger_EpSdkLogLevel: DEFAULT_CLI_LOGGER_EP_SDK_LOG_LEVEL,
    };
  };
  public getCliLoggerOptions = (): ICliLoggerOptions => {
    this.assertIsInitialized();
    return this.config.cliLoggerConfig;
  };

  public getEpV1SolaceCloudToken(): string {
    this.assertIsInitialized();
    return this.config.epV1Config.token;
  }
  public getEpV1ApiBaseUrl(): string {
    this.assertIsInitialized();
    return this.config.epV1Config.baseUrl;
  }
  public getEpV2SolaceCloudToken(): string {
    this.assertIsInitialized();
    return this.config.epV2Config.token;
  }
  public getEpV2ApiBaseUrl(): string {
    this.assertIsInitialized();
    return this.config.epV2Config.baseUrl;
  }
  public getCliMigrateManagerOptions(): ICliMigrateManagerOptions {
    this.assertIsInitialized();
    return this.config.cliMigrateConfig;
  }

}

export default new CliConfig();
