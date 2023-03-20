---
"@solace-labs/ep-async-api-importer": minor
---

multi-domain support for each asset

**New Features**

- importer uses the ep extension: `x-ep-application-domain-name` for each object
  - enums, events, schemas
  - if omitted, defaults back to `x-ep-assets-application-domain-name`

**Changes**

- change default for CLI_TEST_SETUP_DOMAINS_FOR_APIS to true

**Known Issues**

- enum version description is not exported by EP as extension

  - using a version description would result in an attempt to create a new version
  - workaround: do not use a description
  - the importer will omit the description for an enum version

- schema version description is not exported by EP as extension
  - using a version description would result in an attempt to create a new version
  - workaround: do not use a description
  - the importer will omit the description for an schema version
