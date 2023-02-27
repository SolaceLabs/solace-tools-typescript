---
"@solace-labs/ep-sdk": minor
---

add managing custom attributes for application domains

- **EpSdkApplicationDomainsServiceClass**
  - `setCustomAttributes()`
  - `unsetCustomAttributes()`
  - `removeAssociatedEntityTypeFromCustomAttributeDefinitions()`
  - `listAll()`
    - new optional parameter: `attributesQuery?: IEpSdkAttributesQuery;`
