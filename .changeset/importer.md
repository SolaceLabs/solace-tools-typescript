---
"@solace-labs/ep-async-api-importer": minor
---

enforcement of application domain permissions

- new environment varible: `CLI_ASSETS_APPLICATION_DOMAIN_ENFORCEMENT_POLICY`
  - strict: no first versions allowed
  - lax: no new versions allowed
  - note: currently still hidden from '-h' pending review
