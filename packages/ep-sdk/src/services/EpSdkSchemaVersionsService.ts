import {
  CustomAttribute,
  CustomAttributeDefinition,
  Pagination,
  SchemaObject,
  SchemasService,
  SchemaVersion,
  SchemaVersionResponse,
  SchemaVersionsResponse,
  StateChangeRequestResponse,
} from "@solace-labs/ep-openapi-node";
import { 
  EpSdkApiContentError, 
  EpSdkServiceError 
} from "../utils";
import { 
  EpApiMaxPageSize, 
  EpSdkCustomAttributeNameSourceApplicationDomainId 
} from "../constants";
import {
  EEpSdkTask_Action,
  EEpSdkTask_TargetState,
  EpSdkSchemaVersionTask,
  IEpSdkSchemaVersionTask_ExecuteReturn,
  EEpSdk_VersionTaskStrategy,
  EpSdkSchemaTask,
  IEpSdkSchemaTask_ExecuteReturn,
} from "../tasks";
import { 
  EpSdkVersionServiceClass 
} from "./EpSdkVersionService";
import { 
  EEpSdkCustomAttributeEntityTypes, 
  TEpSdkCustomAttribute 
} from "../types";
import EpSdkSchemasService from "./EpSdkSchemasService";
import EpSdkCustomAttributesService from "./EpSdkCustomAttributesService";

/** @category Services */
export class EpSdkSchemaVersionsServiceClass extends EpSdkVersionServiceClass {

  private async updateSchemaVersion({ xContextId, update }:{
    xContextId?: string;
    update: SchemaVersion;
  }): Promise<SchemaVersion> {
    const funcName = 'updateEnumVersion';
    const logName = `${EpSdkSchemaVersionsServiceClass.name}.${funcName}()`;
    /* istanbul ignore next */
    if(update.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'update.id === undefined', { update });
    const schemaVersionResponse: SchemaVersionResponse = await SchemasService.updateSchemaVersion({ 
      xContextId, 
      id: update.id,
      requestBody: update
    })
    /* istanbul ignore next */
    if(schemaVersionResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'schemaVersionResponse.data === undefined', { schemaVersionResponse });
    return schemaVersionResponse.data;
  }

  /**
   * Sets the custom attributes in the list on the Schema Version object.
   * Creates attribute definitions / adds entity type 'schemaVersion' if it doesn't exist.
   */
  public async setCustomAttributes({ xContextId, schemaVersionId, epSdkCustomAttributes}:{
    xContextId?: string;
    schemaVersionId: string;
    epSdkCustomAttributes: Array<TEpSdkCustomAttribute>;
  }): Promise<SchemaVersion> {
    const funcName = 'setCustomAttributes';
    const logName = `${EpSdkSchemaVersionsServiceClass.name}.${funcName}()`;
    const schemaVersionResponse: SchemaVersionResponse = await SchemasService.getSchemaVersion({ 
      xContextId,
      versionId: schemaVersionId
    });
    /* istanbul ignore next */
    if(schemaVersionResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'schemaVersionResponse.data === undefined', { schemaVersionResponse });    
    const customAttributes: Array<CustomAttribute> = await EpSdkCustomAttributesService.createCustomAttributesWithNew({
      xContextId,
      existingCustomAttributes: schemaVersionResponse.data?.customAttributes,
      epSdkCustomAttributes,
      epSdkCustomAttributeEntityType: EEpSdkCustomAttributeEntityTypes.SCHEMA_VERSION,
    });
    return await this.updateSchemaVersion({
      xContextId,
      update: {
        ...schemaVersionResponse.data,
        customAttributes,
      }
    });
  }

  public getVersionByVersion = async ({
    xContextId, schemaId,
    schemaVersionString,
  }: {
    xContextId?: string;
    schemaId: string;
    schemaVersionString: string;
  }): Promise<SchemaVersion | undefined> => {
    const funcName = "getVersionByVersion";
    const logName = `${EpSdkSchemaVersionsServiceClass.name}.${funcName}()`;

    const schemaVersionList: Array<SchemaVersion> = await this.getVersionsForSchemaId({ xContextId, schemaId: schemaId });
    return schemaVersionList.find((schemaVersion: SchemaVersion) => {
      /* istanbul ignore next */
      if (schemaVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "schemaVersion.version === undefined", {
        schemaVersion: schemaVersion,
      });
      return schemaVersion.version === schemaVersionString;
    });
  };

  public getVersionsForSchemaId = async ({
    xContextId,
    schemaId,
    pageSize = EpApiMaxPageSize,
  }: {
    xContextId?: string;
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
          xContextId,
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

  public getVersionsForSchemaName = async ({ xContextId, schemaName, applicationDomainId }: {
    xContextId?: string;
    applicationDomainId: string;
    schemaName: string;
  }): Promise<Array<SchemaVersion>> => {
    const funcName = "getVersionsForSchemaName";
    const logName = `${EpSdkSchemaVersionsServiceClass.name}.${funcName}()`;

    const schemaObject: SchemaObject | undefined = await EpSdkSchemasService.getByName({
      xContextId,
      applicationDomainId: applicationDomainId,
      schemaName: schemaName,
    });
    if (schemaObject === undefined) return [];
    /* istanbul ignore next */
    if (schemaObject.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "schemaObject.id === undefined", {
      schemaObject: schemaObject,
    });
    const schemaVersionList: Array<SchemaVersion> = await this.getVersionsForSchemaId({ xContextId, schemaId: schemaObject.id });
    return schemaVersionList;
  };

  public getLatestVersionString = async ({
    xContextId, schemaId,
  }: {
    xContextId?: string;
    schemaId: string;
  }): Promise<string | undefined> => {
    const funcName = "getLatestVersionString";
    const logName = `${EpSdkSchemaVersionsServiceClass.name}.${funcName}()`;

    const schemaVersionList: Array<SchemaVersion> =
      await this.getVersionsForSchemaId({ xContextId, schemaId: schemaId });
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
    xContextId, schemaId,
    applicationDomainId,
  }: {
    xContextId?: string;
    applicationDomainId: string;
    schemaId: string;
  }): Promise<SchemaVersion | undefined> => {
    applicationDomainId;
    const schemaVersionList: Array<SchemaVersion> =
      await this.getVersionsForSchemaId({
        xContextId,
        schemaId: schemaId,
      });
    const latestSchemaVersion: SchemaVersion | undefined =
      this.getLatestEpObjectVersionFromList({
        epObjectVersionList: schemaVersionList,
      });
    return latestSchemaVersion;
  };

  public getLatestVersionForSchemaName = async ({
    xContextId, applicationDomainId,
    schemaName,
  }: {
    xContextId?: string;
    applicationDomainId: string;
    schemaName: string;
  }): Promise<SchemaVersion | undefined> => {
    const schemaVersionList: Array<SchemaVersion> =
      await this.getVersionsForSchemaName({
        xContextId,
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
    xContextId,
    applicationDomainId,
    schemaId,
    schemaVersion,
    targetLifecycleStateId,
  }: {
    xContextId?: string;
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
        xContextId,
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
          xContextId,
          id: createdSchemaVersion.id,
          requestBody: {
            stateId: targetLifecycleStateId,
          },
        });
      stateChangeRequestResponse;
      const updatedSchemaVersion: SchemaVersion | undefined =
        await this.getVersionByVersion({
          xContextId,
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

  public copyLastestVersionById_IfNotExists = async ({xContextId, schemaVersionId, toApplicationDomainId }: {
    xContextId?: string;
    schemaVersionId: string;
    toApplicationDomainId: string;
  }): Promise<SchemaVersion> => {
    const funcName = "copyLastestVersionById_IfNotExists";
    const logName = `${EpSdkSchemaVersionsServiceClass.name}.${funcName}()`;
    // get the source schema version
    const fromSchemaVersionResponse: SchemaVersionResponse = await SchemasService.getSchemaVersion({
      xContextId,
      versionId: schemaVersionId,
    });
    if (fromSchemaVersionResponse.data === undefined) throw new EpSdkServiceError(logName, this.constructor.name, "fromSchemaVersionResponse.data === undefined", {
      fromSchemaVersionResponse: fromSchemaVersionResponse,
    });
    const fromSchemaVersion: SchemaVersion = fromSchemaVersionResponse.data;
    /* istanbul ignore next */
    if (fromSchemaVersion.stateId === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "fromSchemaVersion.stateId === undefined", { fromSchemaVersion: fromSchemaVersion,});
    /* istanbul ignore next */
    if (fromSchemaVersion.content === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "fromSchemaVersion.content === undefined", { fromSchemaVersion: fromSchemaVersion,});
    // get the source schema object
    const fromSchemaObject: SchemaObject = await EpSdkSchemasService.getById({ xContextId, schemaId: fromSchemaVersion.schemaId });
    /* istanbul ignore next */
    if (fromSchemaObject.shared === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "fromSchemaObject.shared === undefined", { fromSchemaVersion: fromSchemaVersion,});
    // ensure target version object exists
    const epSdkSchemaTask = new EpSdkSchemaTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: toApplicationDomainId,
      schemaName: fromSchemaObject.name,
      schemaObjectSettings: {
        shared: fromSchemaObject.shared,
        schemaType: fromSchemaObject.schemaType,
      },
    });
    const epSdkSchemaTask_ExecuteReturn: IEpSdkSchemaTask_ExecuteReturn = await epSdkSchemaTask.execute(xContextId);
    if (epSdkSchemaTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action === EEpSdkTask_Action.NO_ACTION) {
      // return the latest version
      const targetSchemaVersion: SchemaVersion | undefined = await this.getLatestVersionForSchemaId({
        xContextId,
        applicationDomainId: toApplicationDomainId,
        schemaId: epSdkSchemaTask_ExecuteReturn.epObjectKeys.epObjectId,
      });
      if (targetSchemaVersion !== undefined) return targetSchemaVersion;
    }
    // add the source application domain id to custom attribute
    await EpSdkSchemasService.setCustomAttributes({
      xContextId,
      schemaId: epSdkSchemaTask_ExecuteReturn.epObjectKeys.epObjectId,
      epSdkCustomAttributes: [ 
        { 
          name: EpSdkCustomAttributeNameSourceApplicationDomainId, 
          value: fromSchemaObject.applicationDomainId,
          scope: CustomAttributeDefinition.scope.APPLICATION_DOMAIN,
          applicationDomainId: toApplicationDomainId,
          valueType: CustomAttributeDefinition.valueType.STRING
        }
      ]
    });    
    // create target schema version
    const epSdkSchemaVersionTask = new EpSdkSchemaVersionTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: toApplicationDomainId,
      schemaId: epSdkSchemaTask_ExecuteReturn.epObjectKeys.epObjectId,
      versionString: fromSchemaVersion.version,
      versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
      schemaVersionSettings: {
        stateId: fromSchemaVersion.stateId,
        displayName: fromSchemaVersion.displayName ? fromSchemaVersion.displayName : '',
        description: fromSchemaVersion.description ? fromSchemaVersion.description : "",
        content: fromSchemaVersion.content,
      },
    });
    const epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn = await epSdkSchemaVersionTask.execute(xContextId);
    return epSdkSchemaVersionTask_ExecuteReturn.epObject;
  };
}

/** @category Services */
export default new EpSdkSchemaVersionsServiceClass();
