# @solace-labs/ep-asyncapi

## 0.55.1

### Patch Changes

- 75f8b29b: minor patches

  - methods `getxxxxEpApplicationDomainName()` now always return a string, never undefined

## 0.55.0

### Minor Changes

- 3cf5bf75: ep extensions

  - added ep extension: `x-ep-application-domain-name` for every object
  - added object ep extensions:
    - enum: `x-ep-enum-version-displayname`
    - event: `x-ep-event-version-displayname`
    - schema: `x-ep-schema-version-displayname`
    - api: `x-ep-displayname`

## 0.54.0

### Minor Changes

- af8c368c: added ep extensions

  - when parsing the document ep extensions are taken into consideration
    - priority:
      - existing extensions
      - ep extensions

  The following ep extensions are supported:

  ```typescript
  /** extensions used by EP when exporting spec */
  export enum EpParameterExtensions {
    xEpEnumName = "x-ep-enum-name",
    xEpEnumVersionDisplayName = "x-ep-enum-version-displayname",
  }
  /** extensions used by EP when exporting spec */
  export enum EpMessageExtensions {
    xEpEventName = "x-ep-event-name",
    xEpEventVersionDisplayName = "x-ep-event-version-displayname",
  }
  /** extensions used by EP when exporting spec */
  export enum EpSchemaExtensions {
    xEpSchemaName = "x-ep-schema-name",
    xEpSchemaVersionDisplayName = "x-ep-schema-version-displayname",
  }
  /** extensions used by EP when exporting spec */
  export enum EpApiInfoExtensions {
    xEpApiInfoVersionDisplayName = "x-ep-displayname",
  }
  ```

## 0.53.2

### Patch Changes

- Updated dependencies [e6376711]
  - @solace-labs/ep-openapi-node@2.53.0

## 0.53.1

### Patch Changes

- 523e55f1: fixed linter issues
- Updated dependencies [20ea03f7]
  - @solace-labs/ep-openapi-node@2.52.0

## 0.53.0

### Minor Changes

- 4ee2da3: added extensions to info

  **NEW FEATURES**

  - Changed logic for extensions:
    - x-ep-application-domain-name
    - x-ep-assets-application-domain-name
    - x-ep-broker-type
    - x-ep-channel-delimiter
    - _New Logic_:
      - if defined globally, use that
      - if defined in info, use that
      - if defined at top level, use that

## 0.52.0

### Minor Changes

- 42b4280: added best practices validation to message document

  **New Features:**

  - **EpAsyncApiMessageDocument.validate_BestPractices()**
    - validates if message has a payload schema defined

## 0.51.0

### Minor Changes

- 23af202: added brokerType and channelDelimiter

  **New Features:**

  - **EpAsyncApiDocument**
    - **brokerType**
      - extension:
        - `$.x-ep-broker-type`
        - options: [`kafka`, `solace`]
        - default: `solace`
      - method: `getBrokerType()`
      - constructor: `overrideBrokerType`
    - **channelDelimiter**
      - describes the channel delimiter used to parse the topic into elements
      - extension:
        - `$.x-ep-channel-delimiter`
        - options: ['.', '_', '-', '/']
        - default: `/`
      - method: `getChannelDelimiter()`
      - constructor: `overrideChannelDelimiter`

### Patch Changes

- Updated dependencies [d4065b0]
  - @solace-labs/ep-openapi-node@2.51.1

## 0.50.2

### Patch Changes

- de6afdf: update ep-openapi-node package version number
- Updated dependencies [f44d556]
  - @solace-labs/ep-openapi-node@2.51.0

## 0.50.1

### Patch Changes

- d79cb9e: migrate to solace labs
- Updated dependencies [d79cb9e]
  - @solace-labs/ep-openapi-node@2.50.1
