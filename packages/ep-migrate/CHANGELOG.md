# @solace-labs/ep-migrate

## 0.6.1

### Patch Changes

- Updated dependencies [68ff44ed7]
  - @solace-labs/ep-sdk@0.62.0

## 0.6.0

### Minor Changes

- d10bf3ece: re-work of issue logging

  - codes:

    - MIGRATE_SUMMARY_LOG
    - MIGRATE_SUMMARY_STATS
    - MIGRATE_ISSUE
      - logs each issue separately
      - avoids string size limit when logging entire array

  - removed runMode from log entries

## 0.5.1

### Patch Changes

- 1c39560ad: bug fixes and enhancements

  **bug fixes:**

  - config: fixed bug applying optional `versions` for enums, events, schemas, applications

  **enhancements:**

  - config: added node info

## 0.5.0

### Minor Changes

- 1f13ddee: issues for application domains

  - added error catch and create issue for application domains
  - Epv2 application domain topic domains must only include variables with associated enums
    - create issue with cause if enum not found

### Patch Changes

- Updated dependencies [1f13ddee]
  - @solace-labs/ep-sdk@0.61.1

## 0.4.0

### Minor Changes

- cba97754: bug fixes & enhancements

  **enums**

  - added error handling to create enum issue

  **events**

  - added enum issue as the cause for event issue

  **test**

  - reduced test time: selected domains only

## 0.3.0

### Minor Changes

- c8bbbbff: enhancements

  - added issue capture, log, summary and continue with migration
  - set the label for EpV2 Enum Values from EpV1 Enum display name if present
  - added events migrator
  - added applications migrator
  - added tags to custom attribute migration for schemas
  - added tags to custom attribute migration for events
  - added 'ep-migrate-run-id' custom attribute for
    - application domains, enums, schemas, events, applications
      - if action === CREATE
    - enum versions, schema versions, event versions, application versions
      - if action === CREATE_FIRST_VERSION || CREATE_NEW_VERSION
  - added absent using 'ep-migrate-run-id' custom attribute
  - create first draft of docs

### Patch Changes

- Updated dependencies [6df469c1]
  - @solace-labs/ep-sdk@0.61.0

## 0.2.0

### Minor Changes

- 96f830fe: added runState=present|absent

### Patch Changes

- 6e0ab825: topic domains for app domain
- Updated dependencies [6e0ab825]
  - @solace-labs/ep-sdk@0.60.0

## 0.1.1

### Patch Changes

- cb9ae402: new features & enhancements

  - test framework
  - logging & summary output
  - migrate application domains
  - migrate schemas
