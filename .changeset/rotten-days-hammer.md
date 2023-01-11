---
"@solace-labs/ep-sdk": minor
---

new features & misc mods

**New Features:**

* **EpSdkEpEventsService**
  - `listAll()`
    - support for additional filtering (optional):
      - brokerType?: EpSdkBrokerTypes;
      - attributesQuery?: objectAttributesQuery;

* **EpSdkEventApiVersionsService**
  - `getVersionById()`
    - returns `EpEventApiVersion` _(include the parent object)_ or `undefined` if not found

* **EpSdkEpEventTask**
  - added `brokerType` to settings, default=`solace`
    - _note: not used for comparison as not returned by EP API and cannot be changed after creation of event_

* **EpSdkEpEventVersionTask**
  - added `topicDelimiter?: string[1]` to config
    - default=`'/'`

**Breaking Changes:**

* **EpSdkEpEventVersionsService**
  - `getObjectAndVersionForEventId()`
  - `getVersionsForEventId()`
  - `getLatestVersionForEventId()`
  - `listLatestVersions()`
    - changed paramter `stateId` to `stateIds: Array<string>`
