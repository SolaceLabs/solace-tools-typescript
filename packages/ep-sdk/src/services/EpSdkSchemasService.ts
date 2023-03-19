import {
  CustomAttribute,
  CustomAttributeDefinition,
  SchemaObject,
  SchemaResponse,
  SchemasResponse,
  SchemasService,
} from "@solace-labs/ep-openapi-node";
import { EEpSdkCustomAttributeEntityTypes, TEpSdkCustomAttributeList } from "../types";
import {
  EpSdkApiContentError,
  EpSdkServiceError,
  EpSdkLogger,
  EEpSdkLoggerCodes,
} from "../utils";
import EpSdkCustomAttributesService from "./EpSdkCustomAttributesService";
import { EpSdkServiceClass } from "./EpSdkService";

/** @category Services */
export enum EEpSdkSchemaType {
  JSON_SCHEMA = "jsonSchema",
  AVRO = "avro",
  XSD = "xsd",
}
/** @category Services */
export enum EEpSdkSchemaContentType {
  APPLICATION_JSON = "json",
  APPLICATION_XML = "xml"
}

/** @category Services */
export class EpSdkSchemasServiceClass extends EpSdkServiceClass {

  private async updateSchema({ xContextId, update }:{
    xContextId?: string;
    update: SchemaObject;
  }): Promise<SchemaObject> {
    const funcName = 'updateSchema';
    const logName = `${EpSdkSchemasServiceClass.name}.${funcName}()`;
    /* istanbul ignore next */
    if(update.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'update.id === undefined', {
      update: update
    });
    const schemaResponse: SchemaResponse = await SchemasService.updateSchema({
      xContextId,
      id: update.id,
      requestBody: update
    });
    /* istanbul ignore next */
    if(schemaResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'schemaResponse.data === undefined', {
      schemaResponse: schemaResponse
    });
    return schemaResponse.data;
  }

  /**
   * Sets the custom attributes in the list on the event api product.
   * Creates attribute definitions / adds entity type 'eventApiProduct' if it doesn't exist.
   */
  public async setCustomAttributes({ xContextId, schemaId, epSdkCustomAttributeList, scope, applicationDomainId }:{
    xContextId?: string;
    schemaId: string;
    epSdkCustomAttributeList: TEpSdkCustomAttributeList;
    applicationDomainId?: string;
    scope?: CustomAttributeDefinition.scope;
  }): Promise<SchemaObject> {
    const schemaObject: SchemaObject = await this.getById({
      xContextId,
      schemaId: schemaId,
    });
    scope;
    const customAttributes: Array<CustomAttribute> = await EpSdkCustomAttributesService.createCustomAttributesWithNew({
      xContextId,
      existingCustomAttributes: schemaObject.customAttributes,
      epSdkCustomAttributeList: epSdkCustomAttributeList,
      epSdkCustomAttributeEntityType: EEpSdkCustomAttributeEntityTypes.SCHEMA_OBJECT,
      applicationDomainId: applicationDomainId,
      // note: adding scope if not organization currently causes EP to return an internal server error
      // scope: scope
    });
    return await this.updateSchema({
      xContextId,
      update: {
        ...schemaObject,
        customAttributes: customAttributes,  
      }
    });
  }

  public getByName = async ({ xContextId, schemaName, applicationDomainId }: {
    xContextId?: string;
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
    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.SERVICE_GET, module: this.constructor.name, details: {
      schemasResponse: schemasResponse,
    }}));
    if (schemasResponse.data === undefined || schemasResponse.data.length === 0) return undefined;
    /* istanbul ignore next */
    if (schemasResponse.data.length > 1) throw new EpSdkApiContentError(logName, this.constructor.name, "schemasResponse.data.length > 1", {
      schemasResponse: schemasResponse,
    });
    const epSchemaObject: SchemaObject = schemasResponse.data[0];
    return epSchemaObject;
  };

  public getById = async ({ xContextId, schemaId, applicationDomainId }: {
    xContextId?: string;
    schemaId: string;
    applicationDomainId?: string;
  }): Promise<SchemaObject> => {
    const funcName = "getById";
    const logName = `${EpSdkSchemasServiceClass.name}.${funcName}()`;
    applicationDomainId;
    const schemaResponse: SchemaResponse = await SchemasService.getSchema({
      xContextId,
      id: schemaId,
    });
    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.SERVICE_GET, module: this.constructor.name, details: {
      schemaResponse: schemaResponse,
    }}));
    if (schemaResponse.data === undefined) {
      /* istanbul ignore next */
      throw new EpSdkApiContentError(logName, this.constructor.name, "schemaResponse.data === undefined", {
        schemaId: schemaId,
      });
    }
    const epSchemaObject: SchemaObject = schemaResponse.data;
    return epSchemaObject;
  };

  public deleteById = async ({
    xContextId,
    schemaId,
    applicationDomainId,
  }: {
    xContextId?: string;
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
    xContextId?: string;
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
