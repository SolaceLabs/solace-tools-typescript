# @solace-labs/ep-sdk

## 0.57.0

### Minor Changes

- 3e7f1b30: added support for XML

  - new: `EEpSdkSchemaType.XSD`
  - new: `EEpSdkSchemaContentType.APPLICATION_XML`

  added source application domain id as attribute on copy

  - objects: enums, schemas, events, event apis
  - name: x-ep-sdk-source-application-domain-id
    value: the source application domain id

## 0.56.1

### Patch Changes

- 77845aa7: enhancements to EpSdkApplicationDomainService and tests

## 0.56.0

### Minor Changes

- 120f8bf4: add managing custom attributes for application domains

  - **EpSdkApplicationDomainsServiceClass**
    - `setCustomAttributes()`
    - `unsetCustomAttributes()`
    - `removeAssociatedEntityTypeFromCustomAttributeDefinitions()`
    - `listAll()`
      - new optional parameter: `attributesQuery?: IEpSdkAttributesQuery;`

## 0.55.0

### Minor Changes

- e6376711: added x-context-id header to api services and sdk methods/classes

### Patch Changes

- Updated dependencies [e6376711]
  - @solace-labs/ep-openapi-node@2.53.0

## 0.54.0

### Minor Changes

- 77a3f037: added Environment Service

## 0.53.0

### Minor Changes

- 20ea03f7: added scope to custom attribute definition task

### Patch Changes

- Updated dependencies [20ea03f7]
  - @solace-labs/ep-openapi-node@2.52.0

## 0.52.0

### Minor Changes

- 8d61447: added experimental token validation classes

  **New Features:**

  - **utils/token-validation**
    - contains experimental classes to validate a token's permissions

## 0.51.2

### Patch Changes

- d4065b0: upgrade dependencies
- Updated dependencies [d4065b0]
  - @solace-labs/ep-openapi-node@2.51.1

## 0.51.1

### Patch Changes

- de6afdf: update ep-openapi-node package version number
- Updated dependencies [f44d556]
  - @solace-labs/ep-openapi-node@2.51.0

## 0.51.0

### Minor Changes

- f0c655d: new features & misc mods

  **New Features:**

  - **EpSdkEpEventsService**

    - `listAll()`
      - support for additional filtering (optional):
        - brokerType?: EpSdkBrokerTypes;
        - attributesQuery?: objectAttributesQuery;

  - **EpSdkEventApiVersionsService**

    - `getVersionById()`
      - returns `EpEventApiVersion` _(include the parent object)_ or `undefined` if not found

  - **EpSdkEpEventTask**

    - added `brokerType` to settings, default=`solace`
      - _note: not used for comparison as not returned by EP API and cannot be changed after creation of event_

  - **EpSdkEpEventVersionTask**
    - added `topicDelimiter?: string[1]` to config
      - default=`'/'`

  **Breaking Changes:**

  - **EpSdkEpEventVersionsService**
    - `getObjectAndVersionForEventId()`
    - `getVersionsForEventId()`
    - `getLatestVersionForEventId()`
    - `listLatestVersions()`
      - changed paramter `stateId` to `stateIds: Array<string>`

## 0.50.1

### Patch Changes

- d79cb9e: migrate to solace labs
- Updated dependencies [d79cb9e]
  - @solace-labs/ep-openapi-node@2.50.1
