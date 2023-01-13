import yaml from "js-yaml";
import { AsyncAPIDocument, Message, Channel } from "@asyncapi/parser";
import { Validator, ValidatorResult } from "jsonschema";
import { $EventApi, $EventApiVersion } from "@solace-labs/ep-openapi-node";
import {
  EpAsyncApiUtils,
  EpAsyncApiInternalError,
  EpAsyncApiSpecError,
  EpAsyncApiValidationError,
  EpAsyncApiXtensionError,
} from "../utils";
import { EpAsyncApiMessageDocument } from "./EpAsyncApiMessageDocument";
import { EpAsyncApiChannelDocument } from "./EpAsyncApiChannelDocument";
import { EpAsyncApiChannelParameterDocument } from "./EpAsyncApiChannelParameterDocument";
import {
  EpAsynApiChannelPublishOperation,
  EpAsyncApiChannelSubscribeOperation,
} from "./EpAsyncApiChannelOperation";

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

export enum E_EpAsyncApiContentTypes {
  APPLICATION_JSON = "application/json",
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
  private epEventApiName?: string;
  private epEventApiVersionName?: string;

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

  private get_X_EpApplicationDomainName(): string | undefined {
    // TODO: there should be a parser method to get this
    return this.asyncApiDocumentJson[E_EpAsyncApiExtensions.X_EP_APPLICATION_DOMAIN_NAME];
  }
  private get_X_EpAssetsApplicationDomainName(): string | undefined {
    return this.asyncApiDocumentJson[E_EpAsyncApiExtensions.X_EP_ASSETS_APPLICATION_DOMAIN_NAME];
  }
  private get_X_EpBrokerType(): string | undefined {
    return this.asyncApiDocumentJson[E_EpAsyncApiExtensions.X_EP_BROKER_TYPE];
  }
  private get_X_EpChannelDelimiter(): string | undefined {
    return this.asyncApiDocumentJson[E_EpAsyncApiExtensions.X_EP_CHANNEL_DELIMITER];
  }

  private createApplicationDomainName(prefix?: string): string {
    const funcName = "createApplicationDomainName";
    const logName = `${EpAsyncApiDocument.name}.${funcName}()`;

    let appDomainName: string | undefined =
      this.overrideEpApplicationDomainName;
    if (appDomainName === undefined) {
      const specAppDomainName = this.get_X_EpApplicationDomainName();
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
    let assetsAppDomainName: string | undefined =
      this.overrideEpAssetsApplicationDomainName;
    if (assetsAppDomainName === undefined) {
      const specAssetAppDomainName = this.get_X_EpAssetsApplicationDomainName();
      if (specAssetAppDomainName === undefined) assetsAppDomainName = undefined;
      else assetsAppDomainName = specAssetAppDomainName;
    }
    if (assetsAppDomainName === undefined)
      assetsAppDomainName = appDomainNameNoPrefix;
    // add the prefix
    if (prefix !== undefined)
      assetsAppDomainName = `${prefix}/${assetsAppDomainName}`;
    return assetsAppDomainName;
  }
  private createBrokerType(): EBrokerTypes {
    let brokerType: string | undefined = this.get_X_EpBrokerType();
    if(this.overrideBrokerType !== undefined) brokerType = this.overrideBrokerType;
    if(brokerType === undefined) brokerType = EpAsyncApiDocument.DefaultBrokerType;
    return brokerType as EBrokerTypes;
  }
  private createChannelDelimiter(): EChannelDelimiters {
    let channelDelimiter: string | undefined = this.get_X_EpChannelDelimiter();
    if(this.overrideChannelDelimiter !== undefined) channelDelimiter = this.overrideChannelDelimiter;
    if(channelDelimiter === undefined) channelDelimiter = EpAsyncApiDocument.DefaultChannelDelimiter;
    return channelDelimiter as EChannelDelimiters;
  }
  private createEpEventApiName() {
    if (this.epEventApiName !== undefined) return;
    const xEpEventApiName: string = this.getTitle();
    this.epEventApiName = xEpEventApiName;
  }
  private createEpEventApiVersionName() {
    if (this.epEventApiVersionName !== undefined) return;
    const xEpEventApiVersionName: string = this.getTitle();
    this.epEventApiVersionName = xEpEventApiVersionName;
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
        throw new EpAsyncApiInternalError(
          logName,
          this.constructor.name,
          "unable to determine original spec type"
        );
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
  }

  private validate_EpEventApiName = () => {
    const funcName = "validate_EpEventApiName";
    const logName = `${EpAsyncApiDocument.name}.${funcName}()`;
    const schema = $EventApi.properties.name;

    this.createEpEventApiName();
    if (this.epEventApiName === undefined)
      throw new EpAsyncApiInternalError(
        logName,
        this.constructor.name,
        "this.epEventApiName === undefined"
      );
    const v: Validator = new Validator();
    const validateResult: ValidatorResult = v.validate(
      this.epEventApiName,
      schema
    );

    if (!validateResult.valid)
      throw new EpAsyncApiValidationError(
        logName,
        this.constructor.name,
        undefined,
        {
          asyncApiSpecTitle: this.getTitle(),
          issues: validateResult.errors,
          value: {
            epEventApiName: this.epEventApiName,
          },
        }
      );
  };

  private validate_EpEventApiVersionName = () => {
    const funcName = "validate_EpEventApiVersionName";
    const logName = `${EpAsyncApiDocument.name}.${funcName}()`;
    const schema = $EventApiVersion.properties.displayName;

    this.createEpEventApiVersionName();
    if (this.epEventApiVersionName === undefined)
      throw new EpAsyncApiInternalError(
        logName,
        this.constructor.name,
        "this.epEventApiVersionName === undefined"
      );
    const v: Validator = new Validator();
    const validateResult: ValidatorResult = v.validate(
      this.epEventApiVersionName,
      schema
    );

    if (!validateResult.valid)
      throw new EpAsyncApiValidationError(
        logName,
        this.constructor.name,
        undefined,
        {
          asyncApiSpecTitle: this.getTitle(),
          issues: validateResult.errors,
          value: {
            epEventApiVersionName: this.epEventApiVersionName,
          },
        }
      );
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
    this.validate_EpEventApiName();
    this.validate_EpEventApiVersionName();
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

  public getTitleAsFilePath(): string {
    return this.getTitle().replaceAll(/[^0-9a-zA-Z]+/g, "-");
  }

  public getTitleAsFileName(ext: string): string {
    return `${this.getTitleAsFilePath()}.${ext}`;
  }

  public getBrokerType(): EBrokerTypes { return this.brokerType; }

  public getChannelDelimiter(): EChannelDelimiters { return this.channelDelimiter; }

  public getEpEventApiName(): string {
    const funcName = "getEpEventApiName";
    const logName = `${EpAsyncApiDocument.name}.${funcName}()`;
    if (this.epEventApiName === undefined) {
      this.createEpEventApiName();
      this.validate_EpEventApiName();
    }
    if (this.epEventApiName === undefined)
      throw new EpAsyncApiInternalError(
        logName,
        this.constructor.name,
        "this.epEventApiName === undefined"
      );
    return this.epEventApiName;
  }

  public getEpEventApiVersionName(): string {
    const funcName = "getEpEventApiVersionName";
    const logName = `${EpAsyncApiDocument.name}.${funcName}()`;
    if (this.epEventApiVersionName === undefined) {
      this.createEpEventApiVersionName();
      this.validate_EpEventApiVersionName();
    }
    if (this.epEventApiVersionName === undefined)
      throw new EpAsyncApiInternalError(
        logName,
        this.constructor.name,
        "this.epEventApiVersionName === undefined"
      );
    return this.epEventApiVersionName;
  }

  public getAsJson(): any {
    return this.asyncApiDocumentJson;
  }

  public getAsYamlString(): string {
    const json = this.getAsJson();
    return yaml.dump(json);
  }

  public getOriginalSpecAsJson(): any {
    return this.originalApiSpecJson;
  }

  public getOriginalSpecAsYamlString(): string {
    return yaml.dump(this.originalApiSpecJson);
  }

  public getEpAsyncApiEventNames(): T_EpAsyncApiEventNames {
    const epAsyncApiEventNames: T_EpAsyncApiEventNames = {
      publishEventNames: [],
      subscribeEventNames: [],
    };
    const epAsyncApiChannelDocumentMap: T_EpAsyncApiChannelDocumentMap =
      this.getEpAsyncApiChannelDocumentMap();
    for (const [
      topic,
      epAsyncApiChannelDocument,
    ] of epAsyncApiChannelDocumentMap) {
      topic;
      const epEventName: string = epAsyncApiChannelDocument.getEpEventName();
      const epAsynApiChannelPublishOperation:
        | EpAsynApiChannelPublishOperation
        | undefined =
        epAsyncApiChannelDocument.getEpAsyncApiChannelPublishOperation();
      if (epAsynApiChannelPublishOperation !== undefined) {
        // const epAsyncApiMessageDocument: EpAsyncApiMessageDocument = epAsynApiChannelPublishOperation.getEpAsyncApiMessageDocument()
        epAsyncApiEventNames.publishEventNames.push(epEventName);
      }
      const epAsyncApiChannelSubscribeOperation:
        | EpAsyncApiChannelSubscribeOperation
        | undefined =
        epAsyncApiChannelDocument.getEpAsyncApiChannelSubscribeOperation();
      if (epAsyncApiChannelSubscribeOperation !== undefined) {
        // const epAsyncApiMessageDocument: EpAsyncApiMessageDocument = epAsyncApiChannelSubscribeOperation.getEpAsyncApiMessageDocument()
        epAsyncApiEventNames.subscribeEventNames.push(epEventName);
      }
    }
    return epAsyncApiEventNames;
  }

  public getEpAsyncApiChannelDocumentMap(): T_EpAsyncApiChannelDocumentMap {
    const channels: Record<string, Channel> = this.asyncApiDocument.channels();

    const epAsyncApiChannelDocumentMap: T_EpAsyncApiChannelDocumentMap =
      new Map<string, EpAsyncApiChannelDocument>();
    for (const [key, channel] of Object.entries(channels)) {
      const epAsyncApiChannelDocument = new EpAsyncApiChannelDocument(
        this,
        key,
        channel
      );
      epAsyncApiChannelDocumentMap.set(key, epAsyncApiChannelDocument);
    }
    return epAsyncApiChannelDocumentMap;
  }

  public getEpAsyncApiMessageDocumentMap(): T_EpAsyncApiMessageDocumentMap {
    // const funcName = 'getMessageDocuments';
    // const logName = `${CliAsyncApiDocument.name}.${funcName}()`;

    const allMessages: Map<string, Message> =
      this.asyncApiDocument.allMessages();

    const epAsyncApiMessageDocumentMap: T_EpAsyncApiMessageDocumentMap =
      new Map<string, EpAsyncApiMessageDocument>();

    for (const [key, message] of allMessages) {
      const epAsyncApiMessageDocument = new EpAsyncApiMessageDocument(
        this,
        undefined,
        key,
        message
      );
      epAsyncApiMessageDocumentMap.set(key, epAsyncApiMessageDocument);
    }
    return epAsyncApiMessageDocumentMap;
  }

  public getSupportedContentTypes(): Array<string> {
    return Object.values(E_EpAsyncApiContentTypes);
  }

  public getDefaultContentType(): string | undefined {
    const defaultContentType: string | null =
      this.asyncApiDocument.defaultContentType();
    if (defaultContentType === null) return undefined;
    return defaultContentType;
  }

  public getLogInfo(): T_EpAsyncApi_LogInfo {
    return {
      title: this.getTitle(),
      version: this.getVersion(),
      applicationDomainName: this.getApplicationDomainName(),
    };
  }
}
