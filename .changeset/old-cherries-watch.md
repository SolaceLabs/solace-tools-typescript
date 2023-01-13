---
"@solace-labs/ep-async-api-importer": minor
---

added brokerType & channelDelimiter options


**New Features:**

- **brokerType**
  - **environment variable: `CLI_IMPORT_BROKER_TYPE`**
    - overrides all in spec broker type settings
    - options: solace, kafka
    - default=solace
  - uses in spec / override brokerType for importing assets

- **channelDelimiter**
  - **environment variable: `CLI_IMPORT_CHANNEL_DELIMITER`**
    - overrides all in spec broker type settings
    - options: '/','.','-','_'
    - default='/'
    - uses in spec / override channelDelimiter for importing assets
