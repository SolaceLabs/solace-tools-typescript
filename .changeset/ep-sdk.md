---
"@solace-labs/ep-sdk": patch
---

fixes

- EpSdkApplicationDomainTask

  - create():
    - if an error creating a configured topic domain occurrs the Application Domain is deleted again and the error re-thrown
