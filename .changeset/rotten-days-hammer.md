---
"@solace-labs/ep-sdk": minor
---

migrate to ep-openapi 2.0.10 & new features

**New Features:**

* **EpSdkEpEventsService**
  - `listAll()`
    - support for additional filtering (optional):
      - brokerType?: EpSdkBrokerTypes;
      - attributesQuery?: objectAttributesQuery;
