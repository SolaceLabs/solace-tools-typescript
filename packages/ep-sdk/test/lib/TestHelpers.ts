import { expect } from "chai";
import {
  Address,
  AddressLevel,
  ApiError,
  ApplicationDomainsResponse,
  ApplicationDomainsService,
  DeliveryDescriptor,
  EventResponse,
  EventsService,
  EventVersion,
  SchemaResponse,
  SchemasService,
  SchemaVersion,
} from "@solace-labs/ep-openapi-node";
import {
  EEpSdkSchemaContentType,
  EEpSdkSchemaType,
  EpSdkApiContentError,
  EpSdkEpEventVersionsService,
  EpSdkSchemaVersionsService,
} from "../../src";
import { TestLogger } from "./TestLogger";

export class TestHelpers {
  public static applicationDomainAbsent = async ({
    applicationDomainName,
  }: {
    applicationDomainName: string;
  }): Promise<void> => {
    const funcName = "applicationDomainAbsent";
    const logName = `${TestHelpers.name}.${funcName}()`;
    try {
      const applicationDomainsResponse: ApplicationDomainsResponse =
        await ApplicationDomainsService.getApplicationDomains({
          name: applicationDomainName,
        });
      if (applicationDomainsResponse.data === undefined)
        throw new Error(`${logName}: applicationDomainsResponse.data`);
      if (applicationDomainsResponse.data.length > 1)
        throw new Error(
          `${logName}: applicationDomainsResponse.data.length > 1`
        );
      if (applicationDomainsResponse.data.length === 1) {
        const xvoid: void =
          await ApplicationDomainsService.deleteApplicationDomain({
            id: applicationDomainsResponse.data[0].id,
          });
      }
    } catch (e) {
      expect(
        e instanceof ApiError,
        TestLogger.createNotApiErrorMessage(e.message)
      ).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage("failed", e)).to.be
        .true;
    }
  };

  public static createEventVersion = async ({
    applicationDomainId,
    stateId,
  }: {
    applicationDomainId: string;
    stateId: string;
  }): Promise<EventVersion> => {
    const funcName = "createEventVersion";
    const logName = `${TestHelpers.name}.${funcName}()`;

    const schemaResponse: SchemaResponse = await SchemasService.createSchema({
      requestBody: {
        applicationDomainId: applicationDomainId,
        name: "SchemaName",
        schemaType: EEpSdkSchemaType.JSON_SCHEMA,
        contentType: EEpSdkSchemaContentType.APPLICATION_JSON,
        shared: true,
      },
    });
    if (schemaResponse.data === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "schemaResponse.data === undefined",
        {
          schemaResponse: schemaResponse,
        }
      );
    if (schemaResponse.data.id === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "schemaResponse.data.id === undefined",
        {
          schemaResponse: schemaResponse,
        }
      );
    const createSchemaVersion: SchemaVersion = {
      schemaId: schemaResponse.data.id,
      version: "0.1.0",
    };
    const createdSchemaVersion: SchemaVersion =
      await EpSdkSchemaVersionsService.createSchemaVersion({
        applicationDomainId: applicationDomainId,
        schemaId: schemaResponse.data.id,
        schemaVersion: createSchemaVersion,
        targetLifecycleStateId: stateId,
      });
    const eventResponse: EventResponse = await EventsService.createEvent({
      requestBody: {
        applicationDomainId: applicationDomainId,
        name: "EventName",
        shared: true,
      },
    });
    const eventVersionDeliveryDescriptor: DeliveryDescriptor = {
      brokerType: "solace",
      address: {
        addressType: Address.addressType.TOPIC,
        addressLevels: [
          {
            addressLevelType: AddressLevel.addressLevelType.LITERAL,
            name: applicationDomainId,
          },
          {
            addressLevelType: AddressLevel.addressLevelType.LITERAL,
            name: "hello",
          },
          {
            addressLevelType: AddressLevel.addressLevelType.LITERAL,
            name: "world",
          },
        ],
      },
    };
    if (eventResponse.data === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "eventResponse.data === undefined",
        {
          eventResponse: eventResponse,
        }
      );
    if (eventResponse.data.id === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "eventResponse.data.id === undefined",
        {
          eventResponse: eventResponse,
        }
      );
    const createEventVersion: EventVersion = {
      eventId: eventResponse.data.id,
      version: "0.1.0",
      schemaVersionId: createdSchemaVersion.id,
      deliveryDescriptor: eventVersionDeliveryDescriptor,
    };
    const createdEventVersion: EventVersion =
      await EpSdkEpEventVersionsService.createEventVersion({
        applicationDomainId: applicationDomainId,
        eventId: eventResponse.data.id,
        eventVersion: createEventVersion,
        targetLifecycleStateId: stateId,
      });
    return createdEventVersion;
  };
}
