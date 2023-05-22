---
"@solace-labs/ep-migrate": minor
---

enhancements

- added issue capture, log, summary and continue with migration
- set the label for EpV2 Enum Values from EpV1 Enum display name if present
- added events migrator
- added applications migration with scaffolding
- added tags to custom attribute migration for schemas
- added tags to custom attribute migration for events
- added 'ep-migrate-run-id' custom attribute for
  - application domains, enums, schemas, events
    - if action === CREATE
  - enum versions, schema versions, event versions
    - if action === CREATE_FIRST_VERSION || CREATE_NEW_VERSION
