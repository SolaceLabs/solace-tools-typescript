---
"@solace-labs/ep-asyncapi": minor
---

added extensions to info

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
