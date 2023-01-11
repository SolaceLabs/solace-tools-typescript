# @solace-labs/ep-sdk

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
