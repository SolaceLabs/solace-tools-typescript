---
"@solace-labs/ep-async-api-importer": minor
---

multi-domain support

**Features**

- permissions?

**Changes**

- change default for CLI_TEST_SETUP_DOMAINS_FOR_APIS to true

**Known Issues**

- enum version description is not exported by EP as extension
  - using a version description would result in an attempt to create a new version
  - workaround: do not use a description
  - the importer will omit the description for an enum version
