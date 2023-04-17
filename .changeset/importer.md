---
"@solace-labs/ep-async-api-importer": minor
---

added state name + state Id handling on import

_Note: this version contains breaking changes_

**configuration**

- replaced: `CLI_IMPORT_ASSETS_TARGET_LIFECYLE_STATE`
- with: `CLI_IMPORT_DEFAULT_STATE_NAME`
  - options: ['draft', 'released', 'deprecated', 'retired'], default='released'

**async api ep extensions for stateId**

- `x-ep-state-name`: options: ['draft', 'released', 'deprecated', 'retired']
- `x-ep-state-id`: options: ['1', '2', '3', '4']
- state name is evaluated first, if not present, state id is evaluated
- if neither state name nor state id are present, defaults to env var: `CLI_IMPORT_DEFAULT_STATE_NAME`
