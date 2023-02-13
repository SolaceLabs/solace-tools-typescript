# @solace-labs/ep-sdk

## 0.54.0

### Minor Changes

- 77a3f037: added Environment Service

## 0.53.0

### Minor Changes

- 20ea03f7: added scope to custom attribute definition task

### Patch Changes

- Updated dependencies [20ea03f7]
  - @solace-labs/ep-openapi-node@2.52.0

## 0.52.0

### Minor Changes

- 8d61447: added experimental token validation classes

  **New Features:**

  - **utils/token-validation**
    - contains experimental classes to validate a token's permissions

## 0.51.2

### Patch Changes

- d4065b0: upgrade dependencies
- Updated dependencies [d4065b0]
  - @solace-labs/ep-openapi-node@2.51.1

## 0.51.1

### Patch Changes

- de6afdf: update ep-openapi-node package version number
- Updated dependencies [f44d556]
  - @solace-labs/ep-openapi-node@2.51.0

## 0.51.0

### Minor Changes

- f0c655d: new features & misc mods

  **New Features:**

  - **EpSdkEpEventsService**

    - `listAll()`
      - support for additional filtering (optional):
        - brokerType?: EpSdkBrokerTypes;
        - attributesQuery?: objectAttributesQuery;

  - **EpSdkEventApiVersionsService**

    - `getVersionById()`
      - returns `EpEventApiVersion` _(include the parent object)_ or `undefined` if not found

  - **EpSdkEpEventTask**

    - added `brokerType` to settings, default=`solace`
      - _note: not used for comparison as not returned by EP API and cannot be changed after creation of event_

  - **EpSdkEpEventVersionTask**
    - added `topicDelimiter?: string[1]` to config
      - default=`'/'`

  **Breaking Changes:**

  - **EpSdkEpEventVersionsService**
    - `getObjectAndVersionForEventId()`
    - `getVersionsForEventId()`
    - `getLatestVersionForEventId()`
    - `listLatestVersions()`
      - changed paramter `stateId` to `stateIds: Array<string>`

## 0.50.1

### Patch Changes

- d79cb9e: migrate to solace labs
- Updated dependencies [d79cb9e]
  - @solace-labs/ep-openapi-node@2.50.1
