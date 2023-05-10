import { 
  Enum, 
  EnumsResponse, 
  EnumsService 
} from "@solace-labs/ep-v1-openapi-node";
export type EpV1Enum = Required<Enum>;
export type EpV1EnumsResponse = EnumsResponse;
export class EpV1EnumsService extends EnumsService {}

export interface EpV1ApiMeta {
  pagination: {
    pageNumber: number;
    count: number;
    pageSize: number;
    nextPage: number | null;
    totalPages: number;
  }
}