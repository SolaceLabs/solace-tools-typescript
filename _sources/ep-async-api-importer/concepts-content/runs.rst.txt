.. _importer-content-runs:

Importer Modes
==============


Test Mode
---------

.. code-block:: bash

  export CLI_MODE="test_mode"

Testing consists of two passes:

Test Pass 1:
++++++++++++

Import all Apis into their respective application domains prefixed with `{appName}/test/{runId}`, where:

- {appName}: the importer name, defined by the env var: `CLI_APP_NAME`
- {runId}: auto generated run id from timestamp in format: `YYYY-MM-DD-HH-MM-SS-mmm`


**Validating existing Apis and it's Assets in target domain:**

If the cli option `CLI_TEST_SETUP_DOMAINS_FOR_APIS` is set to true, the test domain(s) are setup with a copy of the Apis and Assets before the test run begins.

This allows for version and asset consistency checks against previously imported Apis and Assets.

See below for an example console output, indicating that a schema has changed from the previous import without bumping the Api version:

.. code-block::

  Run Check for eventApiVersion:
    Name:     Test fail new event same version
    Action:   WOULD_FAIL_CREATE_NEW_VERSION_ON_EXACT_VERSION_REQUIREMENT
    Exsiting Version: 1.0.0 (state: 2)
    Target Version:   1.0.0
    Updates Required: See epSdkTask_IsUpdateRequiredFuncReturn in details.

  Run Error for eventApiVersion:
    Error:    Inconsistent Event Api Versions
    API Name: Test fail new event same version
    Action:   WOULD_FAIL_CREATE_NEW_VERSION_ON_EXACT_VERSION_REQUIREMENT
    Existing Version: 1.0.0
    Existing State:   2
    Target Version:   1.0.0
    Target State:     2
    New Version:      1.0.0
    New State:        2

    eventApiVersion:
      Test fail new event same version@1.0.0, state=2 (WOULD_FAIL_CREATE_NEW_VERSION_ON_EXACT_VERSION_REQUIREMENT)



      [
        {
          "type": "EventApiVersioningError",
          "action": "WOULD_FAIL_CREATE_NEW_VERSION_ON_EXACT_VERSION_REQUIREMENT",
          "epObjectType": "eventApiVersion",
          "displayName": "Test fail new event same version",
          "existingVersion": "1.0.0",
          "existingVersionState": "2",
          "targetVersion": "1.0.0",
          "targetVersionState": "2",
          "newVersion": "1.0.0",
          "newVersionState": "2",
          "requestedUpdates": {
            "eventVersions": {
              "producedEventVersionIds.0": {
                "displayName": "event",
                "version": "1.0.1",
                "requestedUpdates": {
                  "schemaVersion": {
                    "displayName": "message",
                    "version": "1.0.1",
                    "requestedUpdates": {
                      "content": {
                        "from": "{\"type\":\"object\",\"properties\":{\"hello\":{\"type\":\"string\",\"minLength\":4,\"maxLength\":255}}}",
                        "to": "{\"type\":\"object\",\"properties\":{\"hello\":{\"type\":\"string\",\"minLength\":4,\"maxLength\":255},\"world\":{\"type\":\"string\",\"minLength\":4,\"maxLength\":255}}}"
                      }
                    }
                  }
                }
              }
            }
          },
          "applicationDomainName": "ep-async-api-importer-test/test/2022-10-25-09-52-26-902/ep-asyncapi-importer/test/single-tests/new-event-same-version.spec",
          "runMode": "test_pass_1",
          "timestamp": 1666691574394
        }
      ]


Test Pass 2:
++++++++++++

Import all Apis again in `checkmode`.

Checkmode tests if anything would change but doesn't actually change anything.

This second pass detects asset definition inconsistencies within Api files and across Api files.


Release Mode
------------

.. code-block:: bash

  export CLI_MODE="release_mode"


Performs a run in Test Mode first, then imports each Api into their respective application domains.
