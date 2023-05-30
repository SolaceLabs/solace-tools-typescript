---
"@solace-labs/ep-migrate": minor
---

re-work of issue logging

- codes:

  - MIGRATE_SUMMARY_LOG
  - MIGRATE_SUMMARY_STATS
  - MIGRATE_ISSUE
    - logs each issue separately
    - avoids string size limit when logging entire array

- removed runMode from log entries
