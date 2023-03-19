.. _examples-content-example-2:

Example 2: Exporting & Importing Api with Assets in various Application Domains
===============================================================================

Scenario
++++++++

Develop a new Application Service that:

- consumes 2 existing Events provided by other systems
- produces 1 new Event 

The 2 existing Events are modelled in separate application domains and shared:

- ExistingEvent_1 in ApplicationDomain_1
- ExistingEvent_2 in ApplicationDomain_2

The application domain for the new Application (NewApplication) & new Event (NewEvent) is:

- NewApplicationDomain

Model NewEvent in NewApplicationDomain.

Model NewApplication in NewApplicationDomain:

- subscribe to ExistingEvent_1
- subscribe to ExistingEvent_2
- publish NewEvent

Download NewApplication Async Api
+++++++++++++++++++++++++++++++++

File: NewApplication.yaml

The spec contains EP Extensions detailing which application domains the various objects are modelled in:

- enums: parameters
- schemas: schemas
- events: messages

Modify NewApplication Async Api
+++++++++++++++++++++++++++++++

Modify NewEvent:

- topic
- schema
- enum(s)

Import NewApplication Async Api
+++++++++++++++++++++++++++++++

.. code-block:: bash

  export CLI_SOLACE_CLOUD_TOKEN={your token}
  export CLI_IMPORT_CREATE_API_APPLICATION=true
  export CLI_IMPORT_CREATE_API_EVENT_API=false

  ep-async-api-importer -fp 'NewApplication.yaml'

