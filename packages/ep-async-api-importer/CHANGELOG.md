# @solace-labs/ep-async-api-importer

## 0.54.0

### Minor Changes

- 074640fa: multi-domain support for each asset

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

### Patch Changes

- Updated dependencies [3cf5bf75]
- Updated dependencies [074640fa]
  - @solace-labs/ep-asyncapi@0.55.0
  - @solace-labs/ep-sdk@0.58.0

## 0.53.0

### Minor Changes

- d5cb94fd: Added support for additional ep extensions

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

### Patch Changes

- Updated dependencies [af8c368c]
- Updated dependencies [3e7f1b30]
  - @solace-labs/ep-asyncapi@0.54.0
  - @solace-labs/ep-sdk@0.57.0

## 0.52.7

### Patch Changes

- Updated dependencies [77845aa7]
  - @solace-labs/ep-sdk@0.56.1

## 0.52.6

### Patch Changes

- Updated dependencies [120f8bf4]
  - @solace-labs/ep-sdk@0.56.0

## 0.52.5

### Patch Changes

- Updated dependencies [e6376711]
  - @solace-labs/ep-sdk@0.55.0
  - @solace-labs/ep-asyncapi@0.53.2

## 0.52.4

### Patch Changes

- Updated dependencies [77a3f037]
  - @solace-labs/ep-sdk@0.54.0

## 0.52.3

### Patch Changes

- Updated dependencies [20ea03f7]
- Updated dependencies [523e55f1]
  - @solace-labs/ep-sdk@0.53.0
  - @solace-labs/ep-asyncapi@0.53.1

## 0.52.2

### Patch Changes

- Updated dependencies [4ee2da3]
  - @solace-labs/ep-asyncapi@0.53.0

## 0.52.1

### Patch Changes

- Updated dependencies [8d61447]
  - @solace-labs/ep-sdk@0.52.0

## 0.52.0

### Minor Changes

- 42b4280: enhanced logging of call parameters

  **New Features:**

  - **logging**
    - log of version, command line options, environment, and resulting config at startup
    - level=info
  - **environment variable: `CLI_VALIDATE_API_BEST_PRACTICES`**
    - flag to run 'best practices' validation on APIs
    - options: true/false
    - default: true

  **Enhancements:**

  - **error handling**
    - added details (name, message, stack) of caught errors to log & output

### Patch Changes

- Updated dependencies [42b4280]
  - @solace-labs/ep-asyncapi@0.52.0

## 0.51.0

### Minor Changes

- d4065b0: added brokerType & channelDelimiter options

  **New Features:**

  - **brokerType**

    - **environment variable: `CLI_IMPORT_BROKER_TYPE`**
      - overrides all in spec broker type settings
      - options: solace, kafka
      - default=solace
    - uses in spec / override brokerType for importing assets

  - **channelDelimiter**
    - **environment variable: `CLI_IMPORT_CHANNEL_DELIMITER`**
      - overrides all in spec broker type settings
      - options: '/','.','-','\_'
      - default='/'
      - uses in spec / override channelDelimiter for importing assets

### Patch Changes

- Updated dependencies [23af202]
- Updated dependencies [d4065b0]
  - @solace-labs/ep-asyncapi@0.51.0
  - @solace-labs/ep-sdk@0.51.2

## 0.50.7

### Patch Changes

- 931c065: update ep-openapi-node package version number

  **Documentation:**

  - added examples for using file & http references in async api specs

- Updated dependencies [de6afdf]
  - @solace-labs/ep-asyncapi@0.50.2
  - @solace-labs/ep-sdk@0.51.1

## 0.50.6

### Patch Changes

- Updated dependencies [f0c655d]
  - @solace-labs/ep-sdk@0.51.0

## 0.50.5

### Patch Changes

- d79cb9e: migrate to solace labs
- Updated dependencies [d79cb9e]
  - @solace-labs/ep-asyncapi@0.50.1
  - @solace-labs/ep-sdk@0.50.1

## 0.50.4

### Patch Changes

- 75d5499: test publish
- Updated dependencies [75d5499]
  - @solace-labs/ep-asyncapi@1.0.9
  - @solace-labs/ep-sdk@1.0.8

## 0.50.2

### Patch Changes

- d7be165: fixed publish files
- Updated dependencies [d7be165]
  - @solace-labs/ep-asyncapi@1.0.7
  - @solace-labs/ep-sdk@1.0.6

## 0.50.1

### Patch Changes

- 8b9f729: migrated package into repo

  **New Features:**

  - environment variable: `CLI_LOGGER_LOG_SUMMARY_TO_CONSOLE`, default=true
    - setting to false disables logging of progress/summary to the console. useful when running in CI/CD pipeline.

- Updated dependencies [8b9f729]
  - @solace-labs/ep-asyncapi@1.0.6
  - @solace-labs/ep-sdk@1.0.5
