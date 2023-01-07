import {
  Pagination,
  SchemaObject,
  SchemasService,
  SchemaVersion,
  SchemaVersionResponse,
  SchemaVersionsResponse,
  StateChangeRequestResponse,
} from "@solace-labs/ep-openapi-node";
import { EpSdkApiContentError, EpSdkServiceError } from "../utils";
import { EpApiMaxPageSize } from "../constants";
import {
  EEpSdkTask_Action,
  EEpSdkTask_TargetState,
  EpSdkSchemaVersionTask,
  IEpSdkSchemaVersionTask_ExecuteReturn,
  EEpSdk_VersionTaskStrategy,
  EpSdkSchemaTask,
  IEpSdkSchemaTask_ExecuteReturn,
} from "../tasks";
import EpSdkSchemasService from "./EpSdkSchemasService";
import { EpSdkVersionServiceClass } from "./EpSdkVersionService";

/** @category Services */
export class EpSdkSchemaVersionsServiceClass extends EpSdkVersionServiceClass {
  public getVersionByVersion = async ({
    schemaId,
    schemaVersionString,
  }: {
    schemaId: string;
    schemaVersionString: string;
  }): Promise<SchemaVersion | undefined> => {
    const funcName = "getVersionByVersion";
    const logName = `${EpSdkSchemaVersionsServiceClass.name}.${funcName}()`;

    const schemaVersionList: Array<SchemaVersion> =
      await this.getVersionsForSchemaId({ schemaId: schemaId });
    return schemaVersionList.find((schemaVersion: SchemaVersion) => {
      /* istanbul ignore next */
      if (schemaVersion.version === undefined)
        throw new EpSdkApiContentError(
          logName,
          this.constructor.name,
          "schemaVersion.version === undefined",
          {
            schemaVersion: schemaVersion,
          }
        );
      return schemaVersion.version === schemaVersionString;
    });
  };

  public getVersionsForSchemaId = async ({
    schemaId,
    pageSize = EpApiMaxPageSize,
  }: {
    schemaId: string;
    pageSize?: number /** for testing */;
  }): Promise<Array<SchemaVersion>> => {
    const funcName = "getVersionsForSchemaId";
    const logName = `${EpSdkSchemaVersionsServiceClass.name}.${funcName}()`;

    const schemaVersionList: Array<SchemaVersion> = [];
    let nextPage: number | undefined | null = 1;

    while (nextPage !== undefined && nextPage !== null) {
      const schemaVersionsResponse: SchemaVersionsResponse =
        await SchemasService.getSchemaVersions({
          schemaIds: [schemaId],
          pageNumber: nextPage,
          pageSize: pageSize,
        });
      if (
        schemaVersionsResponse.data === undefined ||
        schemaVersionsResponse.data.length === 0
      )
        nextPage = null;
      else {
        schemaVersionList.push(...schemaVersionsResponse.data);
      }
      /* istanbul ignore next */
      if (schemaVersionsResponse.meta === undefined)
        throw new EpSdkApiContentError(
          logName,
          this.constructor.name,
          "schemaVersionsResponse.meta === undefined",
          {
            schemaVersionsResponse: schemaVersionsResponse,
          }
        );
      /* istanbul ignore next */
      if (schemaVersionsResponse.meta.pagination === undefined)
        throw new EpSdkApiContentError(
          logName,
          this.constructor.name,
          "schemaVersionsResponse.meta.pagination === undefined",
          {
            schemaVersionsResponse: schemaVersionsResponse,
          }
        );
      const pagination: Pagination = schemaVersionsResponse.meta.pagination;
      nextPage = pagination.nextPage;
    }
    return schemaVersionList;
  };

  public getVersionsForSchemaName = async ({
    schemaName,
    applicationDomainId,
  }: {
    applicationDomainId: string;
    schemaName: string;
  }): Promise<Array<SchemaVersion>> => {
    const funcName = "getVersionsForSchemaName";
    const logName = `${EpSdkSchemaVersionsServiceClass.name}.${funcName}()`;

    const schemaObject: SchemaObject | undefined =
      await EpSdkSchemasService.getByName({
        applicationDomainId: applicationDomainId,
        schemaName: schemaName,
      });
    if (schemaObject === undefined) return [];
    /* istanbul ignore next */
    if (schemaObject.id === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "schemaObject.id === undefined",
        {
          schemaObject: schemaObject,
        }
      );
    const schemaVersionList: Array<SchemaVersion> =
      await this.getVersionsForSchemaId({ schemaId: schemaObject.id });
    return schemaVersionList;
  };

  public getLatestVersionString = async ({
    schemaId,
  }: {
    schemaId: string;
  }): Promise<string | undefined> => {
    const funcName = "getLatestVersionString";
    const logName = `${EpSdkSchemaVersionsServiceClass.name}.${funcName}()`;

    const schemaVersionList: Array<SchemaVersion> =
      await this.getVersionsForSchemaId({ schemaId: schemaId });
    // CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.SERVICE, details: {
    //   enumVersionList: enumVersionList
    // }}));
    const latestSchemaVersion: SchemaVersion | undefined =
      this.getLatestEpObjectVersionFromList({
        epObjectVersionList: schemaVersionList,
      });
    if (latestSchemaVersion === undefined) return undefined;
    /* istanbul ignore next */
    if (latestSchemaVersion.version === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "latestSchemaVersion.version === undefined",
        {
          latestSchemaVersion: latestSchemaVersion,
        }
      );
    return latestSchemaVersion.version;
  };

  public getLatestVersionForSchemaId = async ({
    schemaId,
    applicationDomainId,
  }: {
    applicationDomainId: string;
    schemaId: string;
  }): Promise<SchemaVersion | undefined> => {
    applicationDomainId;
    const schemaVersionList: Array<SchemaVersion> =
      await this.getVersionsForSchemaId({
        schemaId: schemaId,
      });
    const latestSchemaVersion: SchemaVersion | undefined =
      this.getLatestEpObjectVersionFromList({
        epObjectVersionList: schemaVersionList,
      });
    return latestSchemaVersion;
  };

  public getLatestVersionForSchemaName = async ({
    applicationDomainId,
    schemaName,
  }: {
    applicationDomainId: string;
    schemaName: string;
  }): Promise<SchemaVersion | undefined> => {
    const schemaVersionList: Array<SchemaVersion> =
      await this.getVersionsForSchemaName({
        schemaName: schemaName,
        applicationDomainId: applicationDomainId,
      });
    const latestSchemaVersion: SchemaVersion | undefined =
      this.getLatestEpObjectVersionFromList({
        epObjectVersionList: schemaVersionList,
      });
    return latestSchemaVersion;
  };

  public createSchemaVersion = async ({
    applicationDomainId,
    schemaId,
    schemaVersion,
    targetLifecycleStateId,
  }: {
    applicationDomainId: string;
    schemaId: string;
    schemaVersion: SchemaVersion;
    targetLifecycleStateId: string;
  }): Promise<SchemaVersion> => {
    const funcName = "createSchemaVersion";
    const logName = `${EpSdkSchemaVersionsServiceClass.name}.${funcName}()`;

    applicationDomainId;
    const schemaVersionResponse: SchemaVersionResponse =
      await SchemasService.createSchemaVersion({
        requestBody: {
          ...schemaVersion,
          schemaId: schemaId,
        },
      });
    /* istanbul ignore next */
    if (schemaVersionResponse.data === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "schemaVersionResponse.data === undefined",
        {
          schemaVersionResponse: schemaVersionResponse,
        }
      );
    const createdSchemaVersion: SchemaVersion = schemaVersionResponse.data;
    /* istanbul ignore next */
    if (createdSchemaVersion.id === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "schemaVersionResponse.data.id === undefined",
        {
          schemaVersionResponse: schemaVersionResponse,
        }
      );
    /* istanbul ignore next */
    if (createdSchemaVersion.stateId === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "schemaVersionResponse.data.stateId === undefined",
        {
          schemaVersionResponse: schemaVersionResponse,
        }
      );
    /* istanbul ignore next */
    if (createdSchemaVersion.version === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "schemaVersionResponse.data.version === undefined",
        {
          schemaVersionResponse: schemaVersionResponse,
        }
      );
    if (createdSchemaVersion.stateId !== targetLifecycleStateId) {
      const stateChangeRequestResponse: StateChangeRequestResponse =
        await SchemasService.updateSchemaVersionState({
          id: createdSchemaVersion.id,
          requestBody: {
            stateId: targetLifecycleStateId,
          },
        });
      stateChangeRequestResponse;
      const updatedSchemaVersion: SchemaVersion | undefined =
        await this.getVersionByVersion({
          schemaId: schemaId,
          schemaVersionString: createdSchemaVersion.version,
        });
      /* istanbul ignore next */
      if (updatedSchemaVersion === undefined)
        throw new EpSdkApiContentError(
          logName,
          this.constructor.name,
          "updatedSchemaVersion === undefined",
          {
            updatedSchemaVersion: updatedSchemaVersion,
          }
        );
      return updatedSchemaVersion;
    }
    return createdSchemaVersion;
  };

  public copyLastestVersionById_IfNotExists = async ({
    schemaVersionId,
    fromApplicationDomainId,
    toApplicationDomainId,
  }: {
    schemaVersionId: string;
    fromApplicationDomainId: string;
    toApplicationDomainId: string;
  }): Promise<SchemaVersion> => {
    const funcName = "copyLastestVersionById_IfNotExists";
    const logName = `${EpSdkSchemaVersionsServiceClass.name}.${funcName}()`;

    // get the source schema version
    const fromSchemaVersionResponse: SchemaVersionResponse =
      await SchemasService.getSchemaVersion({
        versionId: schemaVersionId,
      });
    if (fromSchemaVersionResponse.data === undefined)
      throw new EpSdkServiceError(
        logName,
        this.constructor.name,
        "fromSchemaVersionResponse.data === undefined",
        {
          fromSchemaVersionResponse: fromSchemaVersionResponse,
        }
      );
    const fromSchemaVersion: SchemaVersion = fromSchemaVersionResponse.data;
    if (fromSchemaVersion.stateId === undefined)
      throw new EpSdkServiceError(
        logName,
        this.constructor.name,
        "fromSchemaVersion.stateId === undefined",
        {
          fromSchemaVersion: fromSchemaVersion,
        }
      );
    if (fromSchemaVersion.content === undefined)
      throw new EpSdkServiceError(
        logName,
        this.constructor.name,
        "fromSchemaVersion.content === undefined",
        {
          fromSchemaVersion: fromSchemaVersion,
        }
      );
    // get the source schema object
    const fromSchemaObject: SchemaObject = await EpSdkSchemasService.getById({
      applicationDomainId: fromApplicationDomainId,
      schemaId: fromSchemaVersion.schemaId,
    });
    // ensure target version object exists
    const epSdkSchemaTask = new EpSdkSchemaTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: toApplicationDomainId,
      schemaName: fromSchemaObject.name,
      schemaObjectSettings: {
        shared: fromSchemaObject.shared ? fromSchemaObject.shared : true,
        contentType: fromSchemaObject.contentType,
        schemaType: fromSchemaObject.schemaType,
      },
    });
    const epSdkSchemaTask_ExecuteReturn: IEpSdkSchemaTask_ExecuteReturn =
      await epSdkSchemaTask.execute();
    if (
      epSdkSchemaTask_ExecuteReturn.epSdkTask_TransactionLogData
        .epSdkTask_Action === EEpSdkTask_Action.NO_ACTION
    ) {
      // return the latest version
      const targetSchemaVersion: SchemaVersion | undefined =
        await this.getLatestVersionForSchemaId({
          applicationDomainId: toApplicationDomainId,
          schemaId: epSdkSchemaTask_ExecuteReturn.epObjectKeys.epObjectId,
        });
      if (targetSchemaVersion !== undefined) return targetSchemaVersion;
    }
    // create target schema version
    const epSdkSchemaVersionTask = new EpSdkSchemaVersionTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: toApplicationDomainId,
      schemaId: epSdkSchemaTask_ExecuteReturn.epObjectKeys.epObjectId,
      versionString: fromSchemaVersion.version,
      versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
      schemaVersionSettings: {
        stateId: fromSchemaVersion.stateId,
        displayName: fromSchemaVersion.displayName
          ? fromSchemaVersion.displayName
          : fromSchemaObject.name,
        description: fromSchemaVersion.description
          ? fromSchemaVersion.description
          : "",
        content: fromSchemaVersion.content,
      },
    });
    const epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn =
      await epSdkSchemaVersionTask.execute();
    return epSdkSchemaVersionTask_ExecuteReturn.epObject;
  };
}

/** @category Services */
export default new EpSdkSchemaVersionsServiceClass();
