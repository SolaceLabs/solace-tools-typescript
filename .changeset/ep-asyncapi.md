---
"@solace-labs/ep-asyncapi": minor
---

added ep extensions

- when parsing the document ep extensions are taken into consideration
  - priority:
    - existing extensions
    - ep extensions

The following ep extensions are supported:

```typescript
/** extensions used by EP when exporting spec */
export enum EpParameterExtensions {
  xEpEnumName = "x-ep-enum-name",
  xEpEnumVersionDisplayName = "x-ep-enum-version-displayname",
}
/** extensions used by EP when exporting spec */
export enum EpMessageExtensions {
  xEpEventName = "x-ep-event-name",
  xEpEventVersionDisplayName = "x-ep-event-version-displayname",
}
/** extensions used by EP when exporting spec */
export enum EpSchemaExtensions {
  xEpSchemaName = "x-ep-schema-name",
  xEpSchemaVersionDisplayName = "x-ep-schema-version-displayname",
}
/** extensions used by EP when exporting spec */
export enum EpApiInfoExtensions {
  xEpApiInfoVersionDisplayName = "x-ep-displayname",
}
```
