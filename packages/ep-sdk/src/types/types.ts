/** @category General Types */
export enum EpSdkBrokerTypes {
  Solace = "solace",
  Kafka = "kafka"
}

/** @category General Types */
export enum EEpSdkCustomAttributeEntityTypes {
  APPLICATION_DOMAIN = "applicationDomain",
  ENUM = "enum",
  ENUM_VERSION = "enumVersion",
  APPLICATION = "application",
  APPLICATION_VERSION = "applicationVersion",
  SCHEMA_OBJECT = "schema",
  SCHEMA_VERSION = "schemaVersion",
  EVENT = "event",
  EVENT_VERSION = "eventVersion",
  EVENT_API = "eventApi",
  EVENT_API_VERSION = "eventApiVersion",
  EVENT_API_PRODUCT = "eventApiProduct",
  EVENT_API_PRODUCT_VERSION = "eventApiProductVersion",
  // consumer?, 
}

/** @category General Types */
export enum EEpSdkObjectTypes {
  CUSTOM_ATTRIBUTE_DEFINITION = "customAttributeDefinition",
  APPLICATION_DOMAIN = "applicationDomain",
  ENUM = "enum",
  ENUM_VERSION = "enumVersion",
  APPLICATION = "application",
  APPLICATION_VERSION = "applicationVersion",
  SCHEMA_OBJECT = "schema",
  SCHEMA_VERSION = "schemaVersion",
  EVENT = "event",
  EVENT_VERSION = "eventVersion",
  EVENT_API = "eventApi",
  EVENT_API_VERSION = "eventApiVersion",
  EVENT_API_PRODUCT = "eventApiProduct",
  EVENT_API_PRODUCT_VERSION = "eventApiProductVersion",
}

/** @category General Types */
export type EpSdkPagination = {
  count: number;
  pageNumber: number;
  nextPage?: number;
}

/** @category General Types */
export type TEpSdkSortDirection = "asc" | "desc";

/** @category General Types */
export interface EpSdkSortInfo {
  sortFieldName: string;
  sortDirection: TEpSdkSortDirection;
}

/** @category General Types */
export type TEpSdkCustomAttribute = {
  name: string;
  value: string;
}

/** @category General Types */
export type TEpSdkCustomAttributeList = Array<TEpSdkCustomAttribute>;
