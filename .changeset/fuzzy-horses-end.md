---
"@solace-labs/ep-asyncapi": minor
---

added brokerType and channelDelimiter


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
