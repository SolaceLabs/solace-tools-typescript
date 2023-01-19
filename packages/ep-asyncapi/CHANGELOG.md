# @solace-labs/ep-asyncapi

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
