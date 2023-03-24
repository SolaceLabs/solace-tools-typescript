---
"@solace-labs/ep-async-api-importer": minor
---

enforcement of application domain permissions

- new environment varible: `CLI_ASSETS_APPLICATION_DOMAIN_ENFORCEMENT_POLICY`

  - strict: no first versions allowed
  - lax: first versins allowed, but no new versions allowed after
  - off: no checks
  - note: must be used with **CLI_TEST_SETUP_DOMAINS_FOR_APIS=true**

- refactor of importer to allow export/import of applications only without the need to have an event api in the middle

- config validations
  - at least one output selected, either event api or application
