import { 
  Enum, 
  EnumsResponse, 
  EnumsService,
  ApplicationDomainsService,
  ApplicationDomainsResponse,
  ApplicationDomain,
  SchemasService,
  SchemasResponse,
  EventSchema,
  EnumValue,
  Event,
  EventsResponse,
  EventsService
} from "@solace-labs/ep-v1-openapi-node";
export type EpV1Enum = Required<Enum>;
export type EpV1EnumValue = EnumValue;
export type EpV1EnumsResponse = EnumsResponse;
export class EpV1EnumsService extends EnumsService {}


export class EpV1ApplicationDomainsService extends ApplicationDomainsService {}
export type EpV1ApplicationDomainsResponse = ApplicationDomainsResponse;
export type EpV1ApplicationDomain = Required<ApplicationDomain>;

export class EpV1SchemasService extends SchemasService {}
export type EpV1SchemasResponse = SchemasResponse;
export type EpV1EventSchema = Required<EventSchema>;

export class EpV1EventsService extends EventsService {}
export type EpV1EventsResponse = EventsResponse;
export type EpV1Event = Required<Event>;


export interface EpV1ApiMeta {
  pagination: {
    pageNumber: number;
    count: number;
    pageSize: number;
    nextPage: number | null;
    totalPages: number;
  }
}