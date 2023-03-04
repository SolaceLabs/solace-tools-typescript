# @solace-labs/ep-async-api-importer

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
