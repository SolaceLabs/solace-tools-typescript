---
"@solace-labs/ep-async-api-importer": minor
---

Added support for additional ep extensions

- see CHANGELOG.md for ep-asyncapi.

Added new CLI environment variable:

```bash
export CLI_IMPORT_CREATE_API_EVENT_API=true/false
```

if set to true, the importer will create the Event API.
if set to false, the import will not create the Event API.

Use in conjunction with:

```bash
export CLI_IMPORT_CREATE_API_APPLICATION=true/false
```
