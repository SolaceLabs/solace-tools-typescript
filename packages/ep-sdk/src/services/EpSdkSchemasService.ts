import {
  SchemaObject,
  SchemaResponse,
  SchemasResponse,
  SchemasService,
} from "@solace-labs/ep-openapi-node";
import {
  EpSdkApiContentError,
  EpSdkServiceError,
  EpSdkLogger,
  EEpSdkLoggerCodes,
} from "../utils";
import { EpSdkServiceClass } from "./EpSdkService";

/** @category Services */
export enum EEpSdkSchemaType {
  JSON_SCHEMA = "jsonSchema",
  AVRO = "avro",
}
/** @category Services */
export enum EEpSdkSchemaContentType {
  APPLICATION_JSON = "json",
}

/** @category Services */
export class EpSdkSchemasServiceClass extends EpSdkServiceClass {
  public getByName = async ({ xContextId, schemaName, applicationDomainId }: {
    xContextId: string;
    schemaName: string;
    applicationDomainId: string;
  }): Promise<SchemaObject | undefined> => {
    const funcName = "getByName";
    const logName = `${EpSdkSchemasServiceClass.name}.${funcName}()`;

    const schemasResponse: SchemasResponse = await SchemasService.getSchemas({
      xContextId,
      applicationDomainId: applicationDomainId,
      name: schemaName,
    });

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.SERVICE_GET,
        module: this.constructor.name,
        details: {
          schemasResponse: schemasResponse,
        },
      })
    );

    if (schemasResponse.data === undefined || schemasResponse.data.length === 0)
      return undefined;
    /* istanbul ignore next */
    if (schemasResponse.data.length > 1)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "schemasResponse.data.length > 1",
        {
          schemasResponse: schemasResponse,
        }
      );
    const epSchemaObject: SchemaObject = schemasResponse.data[0];
    return epSchemaObject;
  };

  public getById = async ({
    xContextId,
    schemaId,
    applicationDomainId,
  }: {
    xContextId: string;
    schemaId: string;
    applicationDomainId: string;
  }): Promise<SchemaObject> => {
    const funcName = "getById";
    const logName = `${EpSdkSchemasServiceClass.name}.${funcName}()`;

    applicationDomainId;

    const schemaResponse: SchemaResponse = await SchemasService.getSchema({
      xContextId,
      id: schemaId,
    });
    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.SERVICE_GET,
        module: this.constructor.name,
        details: {
          schemaResponse: schemaResponse,
        },
      })
    );

    if (schemaResponse.data === undefined) {
      /* istanbul ignore next */
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "schemaResponse.data === undefined",
        {
          schemaId: schemaId,
        }
      );
    }
    const epSchemaObject: SchemaObject = schemaResponse.data;
    return epSchemaObject;
  };

  public deleteById = async ({
    xContextId,
    schemaId,
    applicationDomainId,
  }: {
    xContextId: string;
    schemaId: string;
    applicationDomainId: string;
  }): Promise<SchemaObject> => {
    const epSchemaObject: SchemaObject = await this.getById({
      xContextId,
      applicationDomainId: applicationDomainId,
      schemaId: schemaId,
    });
    const xvoid: void = await SchemasService.deleteSchema({
      xContextId,
      id: schemaId,
    });
    xvoid;
    return epSchemaObject;
  };

  public deleteByName = async ({
    xContextId, 
    applicationDomainId,
    schemaName,
  }: {
    xContextId: string;
    schemaName: string;
    applicationDomainId: string;
  }): Promise<SchemaObject> => {
    const funcName = "deleteByName";
    const logName = `${EpSdkSchemasServiceClass.name}.${funcName}()`;

    const epSchemaObject: SchemaObject | undefined = await this.getByName({
      xContextId,
      applicationDomainId: applicationDomainId,
      schemaName: schemaName,
    });
    if (epSchemaObject === undefined)
      throw new EpSdkServiceError(
        logName,
        this.constructor.name,
        "epSchemaObject === undefined",
        {
          applicationDomainId: applicationDomainId,
          schemaName: schemaName,
        }
      );
    /* istanbul ignore next */
    if (epSchemaObject.id === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "epSchemaObject.id === undefined",
        {
          epSchemaObject: epSchemaObject,
        }
      );
    const epSchemaObjectDeleted: SchemaObject = await this.deleteById({
      xContextId,
      applicationDomainId: applicationDomainId,
      schemaId: epSchemaObject.id,
    });
    return epSchemaObjectDeleted;
  };
}

/** @category Services */
export default new EpSdkSchemasServiceClass();
