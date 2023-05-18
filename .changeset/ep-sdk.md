---
"@solace-labs/ep-sdk": minor
---

enhancements:

- added optional labels for enums to enumVersionTask
- EpSdkCustomAttributeDefinitionTask:
  - added applicationDomain scoped custom attribute defintions feature
    - Note: updating custom attribute definition when applicationDomain scoped does not work, throw error. see source code for more info.
- added scope custom attributes to each service class
