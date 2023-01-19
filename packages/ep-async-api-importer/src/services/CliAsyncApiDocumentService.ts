import { EventVersion } from "@solace-labs/ep-openapi-node";
import {
  EEpSdkSchemaContentType,
  EEpSdkSchemaType,
  EpSdkEpEventVersionsService,
} from "@solace-labs/ep-sdk";
import {
  EpAsyncApiDocument,
  EpAsyncApiDocumentService,
  E_EpAsyncApiContentTypes,
  E_EpAsyncApiSchemaFormatType,
  T_EpAsyncApiEventNames,
} from "@solace-labs/ep-asyncapi";

import {
  CliEPApiContentError,
  CliErrorFactory,
  CliImporterError,
  CliInternalCodeInconsistencyError,
  CliLogger,
  ECliStatusCodes,
  CliUtils,
} from "../cli-components";

export interface ICliPubSubEventVersionIds {
  publishEventVersionIdList: Array<string>;
  subscribeEventVersionIdList: Array<string>;
}

class CliAsyncApiDocumentService {
  public parse_and_validate = async ({
    apiFile,
    applicationDomainName,
    assetApplicationDomainName,
    applicationDomainNamePrefix,
    overrideBrokerType,
    overrideChannelDelimiter
  }: {
    apiFile: string;
    applicationDomainName: string | undefined;
    assetApplicationDomainName: string | undefined;
    applicationDomainNamePrefix: string | undefined;
    overrideBrokerType: string | undefined;
    overrideChannelDelimiter: string | undefined;
  }): Promise<EpAsyncApiDocument> => {
    const funcName = "parse_and_validate";
    const logName = `${CliAsyncApiDocumentService.name}.${funcName}()`;

    CliLogger.debug(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_START_VALIDATING_API, details: {
      apiFile: apiFile,
    }}));

    try {
      // parse spec
      const epAsyncApiDocument: EpAsyncApiDocument =
        await EpAsyncApiDocumentService.createFromFile({
          filePath: apiFile,
          overrideEpApplicationDomainName: applicationDomainName,
          overrideEpAssetApplicationDomainName: assetApplicationDomainName,
          prefixEpApplicationDomainName: applicationDomainNamePrefix,
          overrideBrokerType: overrideBrokerType,
          overrideChannelDelimiter: overrideChannelDelimiter
        });
      // validate best practices
      epAsyncApiDocument.validate_BestPractices();

      CliLogger.debug(
        CliLogger.createLogEntry(logName, {
          code: ECliStatusCodes.IMPORTING_DONE_VALIDATING_API,
          details: {
            title: epAsyncApiDocument.getTitle(),
            version: epAsyncApiDocument.getVersion(),
            applicationDomainName:
              epAsyncApiDocument.getApplicationDomainName(),
            assetApplicationDomainName:
              epAsyncApiDocument.getAssetsApplicationDomainName(),
          },
        })
      );
      return epAsyncApiDocument;
    } catch (e: any) {
      const cliError = CliErrorFactory.createCliError({logName: logName, error: e });
      CliLogger.error(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.IMPORTING_ERROR_VALIDATING_API, details: {
        error: cliError,
      }}));
      throw cliError;
    }
  };

  public get_pub_sub_event_version_ids = async ({
    applicationDomainId,
    epAsyncApiDocument,
  }: {
    applicationDomainId: string;
    epAsyncApiDocument: EpAsyncApiDocument;
  }): Promise<ICliPubSubEventVersionIds> => {
    const funcName = "get_pub_sub_event_version_ids";
    const logName = `${CliAsyncApiDocumentService.name}.${funcName}()`;

    const epAsyncApiEventNames: T_EpAsyncApiEventNames =
      epAsyncApiDocument.getEpAsyncApiEventNames();
    const publishEventVersionIdList: Array<string> = [];
    for (const publishEventName of epAsyncApiEventNames.publishEventNames) {
      const eventVersion: EventVersion | undefined =
        await EpSdkEpEventVersionsService.getLatestVersionForEventName({
          eventName: publishEventName,
          applicationDomainId: applicationDomainId,
        });
      if (eventVersion === undefined)
        throw new CliImporterError(logName, "eventVersion === undefined", {
          eventName: publishEventName,
          applicationDomainId: applicationDomainId,
        });
      /* istanbul ignore next */
      if (eventVersion.id === undefined)
        throw new CliEPApiContentError(
          logName,
          "eventVersion.id === undefined",
          {
            eventVersion: eventVersion,
          }
        );
      publishEventVersionIdList.push(eventVersion.id);
    }
    const subscribeEventVersionIdList: Array<string> = [];
    for (const subscribeEventName of epAsyncApiEventNames.subscribeEventNames) {
      const eventVersion: EventVersion | undefined =
        await EpSdkEpEventVersionsService.getLatestVersionForEventName({
          eventName: subscribeEventName,
          applicationDomainId: applicationDomainId,
        });
      if (eventVersion === undefined)
        throw new CliImporterError(logName, "eventVersion === undefined", {
          eventName: subscribeEventName,
          applicationDomainId: applicationDomainId,
        });
      /* istanbul ignore next */
      if (eventVersion.id === undefined)
        throw new CliEPApiContentError(
          logName,
          "eventVersion.id === undefined",
          {
            eventVersion: eventVersion,
          }
        );
      subscribeEventVersionIdList.push(eventVersion.id);
    }
    return {
      publishEventVersionIdList: publishEventVersionIdList,
      subscribeEventVersionIdList: subscribeEventVersionIdList,
    };
  };

  public map_MessageDocumentContentType_To_EpSchemaContentType(
    messageContentType: E_EpAsyncApiContentTypes
  ): EEpSdkSchemaContentType {
    const funcName = "map_MessageDocumentContentType_To_EpSchemaContentType";
    const logName = `${CliAsyncApiDocumentService.name}.${funcName}()`;
    switch (messageContentType) {
      case E_EpAsyncApiContentTypes.APPLICATION_JSON:
        return EEpSdkSchemaContentType.APPLICATION_JSON;
      default:
        CliUtils.assertNever(logName, messageContentType);
    }
    throw new CliInternalCodeInconsistencyError(logName, {
      message: "map message content type",
      messageContentType: messageContentType,
    });
  }

  public map_MessageDocumentSchemaFormatType_To_EpSchemaFormatType(
    messageSchemaFormatType: E_EpAsyncApiSchemaFormatType
  ): EEpSdkSchemaType {
    const funcName =
      "map_MessageDocumentSchemaFormatType_To_EpSchemaFormatType";
    const logName = `${CliAsyncApiDocumentService.name}.${funcName}()`;
    switch (messageSchemaFormatType) {
      case E_EpAsyncApiSchemaFormatType.APPLICATION_JSON:
        return EEpSdkSchemaType.JSON_SCHEMA;
      case E_EpAsyncApiSchemaFormatType.APPLICATION_AVRO:
        return EEpSdkSchemaType.AVRO;
      default:
        CliUtils.assertNever(logName, messageSchemaFormatType);
    }
    throw new CliInternalCodeInconsistencyError(logName, {
      message: "map message schema type",
      messageSchemaFormatType: messageSchemaFormatType,
    });
  }
}

export default new CliAsyncApiDocumentService();
