---
"@solace-labs/ep-sdk": minor
---

multi-domain support

**Fixes**

- `EpSdkEnumVersionTask`

  - Enum Version Descritpion:
    - EP does not export enum version description, task ignores description to support idempotency

- `EpSdkSchemaVersionTask`
  - Schema Version Descritpion:
    - EP does not export a separate EP version description (uses the description from the schema), task ignores description to support idempotency

**Enhancements**

- `EpSdkCustomAttributeDefinitionTask`

  - optional restriction to application domain id

- `EpSdkSchemaVersionsServiceClass.copyLastestVersionById_IfNotExists()`
- `EpSdkEnumVersionsServiceClass.copyLastestVersionById_IfNotExists()`
- `EpSdkEpEventVersionsServiceClass.deepCopyLastestVersionById_IfNotExists()`
- `EpSdkEventApiVersionsServiceClass.deepCopyLastestVersionById_IfNotExists()`

  - attribute `x-ep-sdk-source-application-domain-id` now restricted to target application domain id only
