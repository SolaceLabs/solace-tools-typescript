import yaml from "js-yaml";
import { 
  AsyncAPIDocument, 
  Channel 
} from "@asyncapi/parser";
import { Validator, ValidatorResult } from "jsonschema";
import { $EventApi, $EventApiVersion } from "@solace-labs/ep-openapi-node";
import {
  EpAsyncApiUtils,
  EpAsyncApiInternalError,
  EpAsyncApiSpecError,
  EpAsyncApiValidationError,
  EpAsyncApiXtensionError,
} from "../utils";
import { 
  EpAsyncApiMessageDocument 
} from "./EpAsyncApiMessageDocument";
import { 
  EpAsyncApiChannelDocument, 
  EpAsyncApiChannelOperationType 
} from "./EpAsyncApiChannelDocument";
import { 
  EpAsyncApiChannelParameterDocument 
} from "./EpAsyncApiChannelParameterDocument";
import {
  EpAsynApiChannelPublishOperation,
  EpAsyncApiChannelSubscribeOperation,
} from "./EpAsyncApiChannelOperation";
import { 
  EpApiInfoExtensions, 
  EpAsyncApiStateId2StateNameMap_get, 
  EpAsyncApiStateIds, 
  EpAsyncApiStateName2StateIdMap_get, 
  EpAsyncApiStateNames, 
  EpGeneralExtensions
} from "../constants";

export enum E_EpAsyncApiExtensions {
  X_EP_APPLICATION_DOMAIN_NAME = "x-ep-application-domain-name",
  X_EP_ASSETS_APPLICATION_DOMAIN_NAME = "x-ep-assets-application-domain-name",
  X_EP_BROKER_TYPE = "x-ep-broker-type",
  X_EP_CHANNEL_DELIMITER = "x-ep-channel-delimiter",
}

export enum EBrokerTypes {
  KAFKA = "kafka",
  SOLACE = "solace",
}

export enum EChannelDelimiters {
  SLASH = "/",
  DOT = ".",
  UNDERSCORE = "_",
  MINUS = "-",
}

export type T_EpAsyncApi_LogInfo = {
  title: string;
  version: string;
  applicationDomainName: string;
};

export type T_EpAsyncApiChannelDocumentMap = Map<
  string,
  EpAsyncApiChannelDocument
>;
export type T_EpAsyncApiChannelParameterDocumentMap = Map<
  string,
  EpAsyncApiChannelParameterDocument
>;
export type T_EpAsyncApiMessageDocumentMap = Map<
  string,
  EpAsyncApiMessageDocument
>;
export type T_EpAsyncApiEventNames = {
  publishEventNames: Array<string>;
  subscribeEventNames: Array<string>;
};

export class EpAsyncApiDocument {
  public static readonly NotSemVerIssue ="Please use semantic versioning format for API version.";
  public static readonly InvalidBrokerTypeIssue ="Please use a supported brokerType.";
  public static readonly InvalidChannelDelimiterIssue ="Please use a supported channel delimiter.";
  private static readonly DefaultBrokerType = EBrokerTypes.SOLACE;
  private static readonly DefaultChannelDelimiter = EChannelDelimiters.SLASH;
  private originalApiSpecJson: any;
  private asyncApiDocument: AsyncAPIDocument;
  private overrideEpApplicationDomainName: string | undefined;
  private overrideEpAssetsApplicationDomainName: string | undefined;
  private asyncApiDocumentJson: any;
  private unprefixedApplicationDomainName: string;
  private applicationDomainName: string;
  private assetsApplicationDomainName: string;
  private unprefixedAssetsApplicationDomainName: string;
  private brokerType: EBrokerTypes;
  private overrideBrokerType: string | undefined;
  private channelDelimiter: EChannelDelimiters;
  private overrideChannelDelimiter: string | undefined;
  private epApiName: string;
  private epApiVersionName?: string;

  private getJSON(asyncApiDocument: AsyncAPIDocument): any {
    const funcName = "getJSON";
    const logName = `${EpAsyncApiDocument.name}.${funcName}()`;
    const anyDoc: any = asyncApiDocument;
    if (anyDoc["_json"] === undefined) throw new EpAsyncApiSpecError(logName, this.constructor.name, "_json not found in parsed async api spec", {
      asyncApiSpecTitle: this.getTitle(),
      details: undefined,
    });
    return anyDoc["_json"];
  }

  private get_X_EpApplicationDomainNameTopLevel(): string | undefined {
    // TODO: there should be a parser method to get this
    return this.asyncApiDocumentJson[E_EpAsyncApiExtensions.X_EP_APPLICATION_DOMAIN_NAME];
  }
  private get_X_EpApplicationDomainNameInfoLevel(): string | undefined {
    return this.asyncApiDocument.info().extension(E_EpAsyncApiExtensions.X_EP_APPLICATION_DOMAIN_NAME);
  }
  private get_X_EpAssetsApplicationDomainNameTopLevel(): string | undefined {
    return this.asyncApiDocumentJson[E_EpAsyncApiExtensions.X_EP_ASSETS_APPLICATION_DOMAIN_NAME];
  }
  private get_X_EpAssetsApplicationDomainNameInfoLevel(): string | undefined {
    return this.asyncApiDocument.info().extension(E_EpAsyncApiExtensions.X_EP_ASSETS_APPLICATION_DOMAIN_NAME);
  }
  private get_X_EpBrokerTypeTopLevel(): string | undefined {
    return this.asyncApiDocumentJson[E_EpAsyncApiExtensions.X_EP_BROKER_TYPE];
  }
  private get_X_EpBrokerTypeInfoLevel(): string | undefined {
    return this.asyncApiDocument.info().extension(E_EpAsyncApiExtensions.X_EP_BROKER_TYPE);
  }
  private get_X_EpChannelDelimiterTopLevel(): string | undefined {
    return this.asyncApiDocumentJson[E_EpAsyncApiExtensions.X_EP_CHANNEL_DELIMITER];
  }
  private get_X_EpChannelDelimiterInfoLevel(): string | undefined {
    return this.asyncApiDocument.info().extension(E_EpAsyncApiExtensions.X_EP_CHANNEL_DELIMITER);
  }
  private get_X_EpSharedFlag(): boolean | undefined {
    const value = this.asyncApiDocument.info().extension(EpApiInfoExtensions.xEpApiInfoSharedFlag);
    try { return JSON.parse(value); } catch(e) { return undefined; }
  }

  private get_X_EpStateIdInfoLevel(): EpAsyncApiStateIds | undefined {
    const value = this.asyncApiDocument.info().extension(EpApiInfoExtensions.xEpApiInfoStateId);
    if(value === undefined) return undefined;
    EpAsyncApiStateId2StateNameMap_get(value);
    return value;
  }

  private get_X_EpStateNameInfoLevel(): EpAsyncApiStateNames | undefined {
    const value = this.asyncApiDocument.info().extension(EpApiInfoExtensions.xEpApiInfoStateName);
    if(value === undefined) return undefined;
    const lowerCaseValue = (value as string).toLowerCase() as EpAsyncApiStateNames;
    EpAsyncApiStateName2StateIdMap_get(lowerCaseValue);
    return lowerCaseValue;
  }

  private createApplicationDomainName(prefix?: string): string {
    const funcName = "createApplicationDomainName";
    const logName = `${EpAsyncApiDocument.name}.${funcName}()`;

    let appDomainName: string | undefined =
      this.overrideEpApplicationDomainName;
    if (appDomainName === undefined) {
      // try info level first
      let specAppDomainName: string | undefined = this.get_X_EpApplicationDomainNameInfoLevel();
      // try top level if undefined
      if(specAppDomainName === undefined) specAppDomainName = this.get_X_EpApplicationDomainNameTopLevel();
      if (specAppDomainName === undefined) appDomainName = undefined;
      else appDomainName = specAppDomainName;
    }
    if (appDomainName === undefined) throw new EpAsyncApiXtensionError(logName, this.constructor.name, undefined,{
      asyncApiSpecTitle: this.getTitle(),
      xtensionKey: E_EpAsyncApiExtensions.X_EP_APPLICATION_DOMAIN_NAME,
      issue: "no application domain name defined"
    });
    // add the prefix
    if (prefix !== undefined) appDomainName = `${prefix}/${appDomainName}`;
    return appDomainName;
  }

  private createAssetsApplicationDomainName(prefix?: string): string {
    // const funcName = 'createAssetApplicationDomainName';
    // const logName = `${EpAsyncApiDocument.name}.${funcName}()`;
    const appDomainNameNoPrefix = this.createApplicationDomainName(undefined);
    let assetsAppDomainName: string | undefined = this.overrideEpAssetsApplicationDomainName;
    if (assetsAppDomainName === undefined) {
      let specAssetAppDomainName = this.get_X_EpAssetsApplicationDomainNameInfoLevel();
      if(specAssetAppDomainName === undefined) specAssetAppDomainName = this.get_X_EpAssetsApplicationDomainNameTopLevel();
      if (specAssetAppDomainName === undefined) assetsAppDomainName = undefined;
      else assetsAppDomainName = specAssetAppDomainName;
    }
    if (assetsAppDomainName === undefined) assetsAppDomainName = appDomainNameNoPrefix;
    // add the prefix
    if (prefix !== undefined) assetsAppDomainName = `${prefix}/${assetsAppDomainName}`;
    return assetsAppDomainName;
  }
  private createBrokerType(): EBrokerTypes {
    let brokerType: string | undefined = this.get_X_EpBrokerTypeInfoLevel();
    if(brokerType === undefined) brokerType = this.get_X_EpBrokerTypeTopLevel();
    if(this.overrideBrokerType !== undefined) brokerType = this.overrideBrokerType;
    if(brokerType === undefined) brokerType = EpAsyncApiDocument.DefaultBrokerType;
    return brokerType as EBrokerTypes;
  }
  private createChannelDelimiter(): EChannelDelimiters {
    let channelDelimiter: string | undefined = this.get_X_EpChannelDelimiterInfoLevel();
    if(channelDelimiter === undefined) channelDelimiter = this.get_X_EpChannelDelimiterTopLevel();
    if(this.overrideChannelDelimiter !== undefined) channelDelimiter = this.overrideChannelDelimiter;
    if(channelDelimiter === undefined) channelDelimiter = EpAsyncApiDocument.DefaultChannelDelimiter;
    return channelDelimiter as EChannelDelimiters;
  }
  private createEpApiName(): string {
    if(this.epApiName !== undefined) return this.epApiName;
    return this.getTitle();
  }
  private createEpApiVersionName(): string {
    if(!this.asyncApiDocument.info()) return '';
    if(this.asyncApiDocument.info().hasExtension(EpApiInfoExtensions.xEpApiInfoVersionDisplayName)) {
      const epApiDisplayName = this.asyncApiDocument.info().extension(EpApiInfoExtensions.xEpApiInfoVersionDisplayName);
      if(epApiDisplayName && epApiDisplayName.length > 0) return epApiDisplayName;
    }
    // set to empty for better logging
    return '';
  }
  private createOriginalApiSpecJson(originalApiSpec: any): any {
    const funcName = "createOriginalApiSpecJson";
    const logName = `${EpAsyncApiDocument.name}.${funcName}()`;

    // console.log(`${logName}: originalApiSpec=${originalApiSpec}`);
    try {
      // json string?
      const json = JSON.parse(originalApiSpec);
      // console.log(`${logName}, a json string, json=${JSON.stringify(json)}`);
      return json;
    } catch (e) {
      try {
        // yaml string?
        const json = yaml.load(originalApiSpec);
        try {
          // check if really an object now
          const jsonObject = JSON.parse(JSON.stringify(json));
          if (JSON.stringify(jsonObject).includes('["object Object"]'))
            throw new Error("next");
          // console.log(`${logName}, a yaml string, json=${JSON.stringify(jsonObject)}`);
          return jsonObject;
        } catch (e) {
          // json object?
          const json = JSON.parse(JSON.stringify(originalApiSpec));
          // console.log(`${logName}, a json object, json=${JSON.stringify(json)}`);
          return json;
        }
      } catch (e) {
        throw new EpAsyncApiInternalError(logName,this.constructor.name,"unable to determine original spec type");
      }
    }
  }

  constructor(
    originalApiSpec: any,
    asyncApiDocument: AsyncAPIDocument,
    overrideEpApplicationDomainName: string | undefined,
    overrideEpAssetApplicationDomainName: string | undefined,
    prefixEpApplicationDomainName: string | undefined,
    overrideBrokerType: string | undefined,
    overrideChannelDelimiter: string | undefined,
  ) {
    this.originalApiSpecJson = this.createOriginalApiSpecJson(originalApiSpec);
    this.asyncApiDocument = asyncApiDocument;
    this.asyncApiDocumentJson = this.getJSON(asyncApiDocument);
    this.overrideEpApplicationDomainName = overrideEpApplicationDomainName;
    this.overrideEpAssetsApplicationDomainName = overrideEpAssetApplicationDomainName;
    this.applicationDomainName = this.createApplicationDomainName(prefixEpApplicationDomainName);
    this.assetsApplicationDomainName = this.createAssetsApplicationDomainName(prefixEpApplicationDomainName);
    this.unprefixedApplicationDomainName = this.createApplicationDomainName();
    this.unprefixedAssetsApplicationDomainName = this.createAssetsApplicationDomainName();
    this.overrideBrokerType = overrideBrokerType;
    this.overrideChannelDelimiter = overrideChannelDelimiter;
    this.brokerType = this.createBrokerType();
    this.channelDelimiter = this.createChannelDelimiter();
    this.epApiName = this.createEpApiName();
    this.epApiVersionName = this.createEpApiVersionName();
  }

  private validateEpApiName = () => {
    const funcName = "validateEpApiName";
    const logName = `${EpAsyncApiDocument.name}.${funcName}()`;
    const epApiName = this.epApiName || this.createEpApiName();
    const schema = $EventApi.properties.name;
    const v: Validator = new Validator();
    const validateResult: ValidatorResult = v.validate(epApiName, schema);
    if (!validateResult.valid) throw new EpAsyncApiValidationError(logName,this.constructor.name,undefined,{
      asyncApiSpecTitle: this.getTitle(),
      issues: validateResult.errors,
      value: {
        epApiName: this.epApiName,
      }
    });
  };

  private validateEpApiVersionName = () => {
    const funcName = "validateEpApiVersionName";
    const logName = `${EpAsyncApiDocument.name}.${funcName}()`;
    const epApiVersionName = this.epApiVersionName || this.createEpApiVersionName();
    if(epApiVersionName === undefined) throw new EpAsyncApiInternalError(logName, this.constructor.name, 'epApiVersionName === undefined');
    const schema = $EventApiVersion.properties.displayName;
    const v: Validator = new Validator();
    const validateResult: ValidatorResult = v.validate(epApiVersionName, schema);
    if (!validateResult.valid) throw new EpAsyncApiValidationError(logName,this.constructor.name,undefined,{
      asyncApiSpecTitle: this.getTitle(),
      issues: validateResult.errors,
      value: {
        epApiVersionName: this.epApiVersionName,
      },
    });
  };

  private validate_VersionIsSemVerFormat(): void {
    const funcName = "validate_VersionIsSemVerFormat";
    const logName = `${EpAsyncApiDocument.name}.${funcName}()`;
    const versionStr: string = this.getVersion();
    if (!EpAsyncApiUtils.isSemVerFormat({ versionString: versionStr })) throw new EpAsyncApiValidationError(logName, this.constructor.name, undefined, {
      asyncApiSpecTitle: this.getTitle(),
      issues: EpAsyncApiDocument.NotSemVerIssue,
      value: {
        versionString: versionStr,
      }
    });
  }

  private validate_BrokerType(): void {
    const funcName = "validate_BrokerType";
    const logName = `${EpAsyncApiDocument.name}.${funcName}()`;
    const options: Array<string> = Object.values(EBrokerTypes);
    if(!options.includes(this.brokerType)) throw new EpAsyncApiValidationError(logName, this.constructor.name, undefined, {
      asyncApiSpecTitle: this.getTitle(),
      issues: EpAsyncApiDocument.InvalidBrokerTypeIssue,
      value: {
        brokerType: this.brokerType,
        options: options
      }
    });  
  }

  private validate_ChannelDelimiter(): void {
    const funcName = "validate_ChannelDelimiter";
    const logName = `${EpAsyncApiDocument.name}.${funcName}()`;
    const options: Array<string> = Object.values(EChannelDelimiters);
    if(!options.includes(this.channelDelimiter)) throw new EpAsyncApiValidationError(logName, this.constructor.name, undefined, {
      asyncApiSpecTitle: this.getTitle(),
      issues: EpAsyncApiDocument.InvalidChannelDelimiterIssue,
      value: {
        channelDelimiter: this.channelDelimiter,
        options: options
      }
    });  
  }

  public validate(): void {
    // this doc
    this.validate_VersionIsSemVerFormat();
    this.validateEpApiName();
    this.validateEpApiVersionName();
    this.validate_BrokerType();
    this.validate_ChannelDelimiter();
    // cascade validation to all elements
    const epAsyncApiChannelDocumentMap: T_EpAsyncApiChannelDocumentMap = this.getEpAsyncApiChannelDocumentMap();
    for (const [topic, epAsyncApiChannelDocument] of epAsyncApiChannelDocumentMap) {
      topic;
      epAsyncApiChannelDocument.validate();
    }
  }
  public validate_BestPractices(): void {
    // add best practices validations for spec here

    // cascade validation to all elements
    const epAsyncApiChannelDocumentMap: T_EpAsyncApiChannelDocumentMap = this.getEpAsyncApiChannelDocumentMap();
    for (const [topic, epAsyncApiChannelDocument, ] of epAsyncApiChannelDocumentMap) {
      topic;
      epAsyncApiChannelDocument.validate_BestPractices();
    }
  }

  public getAsyncApiSpecVersion(): string {
    return this.asyncApiDocument.version();
  }

  public getTitle(): string {
    return this.asyncApiDocument.info().title();
  }

  public getVersion(): string {
    return this.asyncApiDocument.info().version();
  }

  public getDescription(): string {
    const descr: string | null = this.asyncApiDocument.info().description();
    if (descr) return descr;
    return "";
  }

  public getApplicationDomainName(): string {
    return this.applicationDomainName;
  }

  public getUnprefixedApplicationDomainName(): string {
    return this.unprefixedApplicationDomainName;
  }

  public getAssetsApplicationDomainName(): string {
    return this.assetsApplicationDomainName;
  }

  public getUnprefixedAssetsApplicationDomainName(): string {
    return this.unprefixedAssetsApplicationDomainName;
  }

  public getBrokerType(): EBrokerTypes { return this.brokerType; }

  public getChannelDelimiter(): EChannelDelimiters { return this.channelDelimiter; }

  public getEpApiName(): string { return this.epApiName; }

  public getEpApiNameAsFilePath(): string {
    return this.getEpApiName().replaceAll(/[^0-9a-zA-Z]+/g, "-");
  }

  public getEpApiNameAsFileName(ext: string): string {
    return `${this.getEpApiNameAsFilePath()}.${ext}`;
  }

  public getEpApiVersionName(): string {
    if(this.epApiVersionName === undefined) return '';
    return this.epApiVersionName;
  }

  public getEpIsShared(defaultValue: boolean): boolean {
    const flag = this.get_X_EpSharedFlag();
    if(flag !== undefined) return flag;
    return defaultValue;
  }

  public getEpStateId(defaultValue: EpAsyncApiStateIds): EpAsyncApiStateIds {
    const stateName = this.get_X_EpStateNameInfoLevel();
    if(stateName !== undefined) return EpAsyncApiStateName2StateIdMap_get(stateName);
    const stateId = this.get_X_EpStateIdInfoLevel();
    if(stateId !== undefined) return stateId;  
    return defaultValue;
  }

  public getEpCustomAttributeValue(name: string): string | undefined {
    return this.asyncApiDocument.info().extension(`${EpGeneralExtensions.xEpCustomAttributeNamePrefix}${name}`);
  }

  public getAsJson(): any { return this.asyncApiDocumentJson; }

  public getAsYamlString(): string {
    const json = this.getAsJson();
    return yaml.dump(json);
  }

  public getOriginalSpecAsJson(): any { return this.originalApiSpecJson; }

  public getOriginalSpecAsYamlString(): string { return yaml.dump(this.originalApiSpecJson); }

  public getEpAsyncApiEventNames(): T_EpAsyncApiEventNames {
    const epAsyncApiEventNames: T_EpAsyncApiEventNames = {
      publishEventNames: [],
      subscribeEventNames: [],
    };
    const epAsyncApiChannelDocumentMap: T_EpAsyncApiChannelDocumentMap = this.getEpAsyncApiChannelDocumentMap();
    for (const [topic, epAsyncApiChannelDocument ] of epAsyncApiChannelDocumentMap) {
      topic;
      const epEventName: string = epAsyncApiChannelDocument.getEpEventName();
      const epAsynApiChannelPublishOperation: EpAsynApiChannelPublishOperation | undefined = epAsyncApiChannelDocument.getEpAsyncApiChannelPublishOperation();
      if (epAsynApiChannelPublishOperation !== undefined) {
        // const epAsyncApiMessageDocument: EpAsyncApiMessageDocument = epAsynApiChannelPublishOperation.getEpAsyncApiMessageDocument()
        epAsyncApiEventNames.publishEventNames.push(epEventName);
      }
      const epAsyncApiChannelSubscribeOperation: EpAsyncApiChannelSubscribeOperation | undefined = epAsyncApiChannelDocument.getEpAsyncApiChannelSubscribeOperation();
      if (epAsyncApiChannelSubscribeOperation !== undefined) {
        // const epAsyncApiMessageDocument: EpAsyncApiMessageDocument = epAsyncApiChannelSubscribeOperation.getEpAsyncApiMessageDocument()
        epAsyncApiEventNames.subscribeEventNames.push(epEventName);
      }
    }
    return epAsyncApiEventNames;
  }

  public getEpAsyncApiChannelDocumentMap(): T_EpAsyncApiChannelDocumentMap {
    const channels: Record<string, Channel> = this.asyncApiDocument.channels();
    const epAsyncApiChannelDocumentMap: T_EpAsyncApiChannelDocumentMap = new Map<string, EpAsyncApiChannelDocument>();
    for (const [key, channel] of Object.entries(channels)) {
      const epAsyncApiChannelDocument = new EpAsyncApiChannelDocument(this, key, channel);
      epAsyncApiChannelDocumentMap.set(key, epAsyncApiChannelDocument);
    }
    return epAsyncApiChannelDocumentMap;
  }

  public getEpAsyncApiMessageDocumentMap(): T_EpAsyncApiMessageDocumentMap {
    const epAsyncApiMessageDocumentMap: T_EpAsyncApiMessageDocumentMap = new Map<string, EpAsyncApiMessageDocument>();
    const topicChannelDocumentMap: Map<string, EpAsyncApiChannelDocument> = this.getEpAsyncApiChannelDocumentMap(); 
    for(const [topic, channelDocument] of topicChannelDocumentMap) {
      topic;
      const operationMessageDocumentMap: Map<EpAsyncApiChannelOperationType, EpAsyncApiMessageDocument[]> = channelDocument.getAllChannelMessageDocuments();
      for(const [operation, messageDocuments] of operationMessageDocumentMap) {
        operation;
        for(const messageDocument of messageDocuments) {
          epAsyncApiMessageDocumentMap.set(messageDocument.getMessageName(), messageDocument);
        }
        
      }
    }
    return epAsyncApiMessageDocumentMap;
  }

  public getLogInfo(): T_EpAsyncApi_LogInfo {
    return {
      title: this.getTitle(),
      version: this.getVersion(),
      applicationDomainName: this.getApplicationDomainName(),
    };
  }
}
