.. _apis-content-extensions:

Async Api Extensions
====================

The importer uses the following extensions:

.. list-table:: Aysnc Api Extensions
   :widths: 30 100
   :header-rows: 1

   * - Async Api Extension
     - Description
   * - $.info.x-ep-application-domain
     - The Event Portal application domain for Event APIs and Applications.
   * - $.info.x-ep-assets-application-domain-name
     - The Event Portal application domain for re-usable Assets: Events, Schemas, Enums.

       Defaults to `$.info.x-ep-application-domain` if omitted.

   * - $.info.x-ep-broker-type
     - The broker type the api 'runs on'. Options: ['solace', 'kafka']. Default: 'solace'.

   * - $.info.x-ep-channel-delimiter
     - The channel delimiter used in the spec to determine topic elements. Options: ['/', '.', '_', '-']. Default: '/'.

   * - $.channels.{topic}.x-ep-event-name
     - The name to use for Event Portal Events and Event Versions.

       If not specified, falls back to:

       - Event Name = $.channel.{topic}
       - Event Version Name = EMPTY


In addition, it uses the following Event Portal extensions:

.. list-table:: Event Portal Info Extensions
   :widths: 30 100
   :header-rows: 1

   * - Async Api Extension
     - Description
   * - $.info.x-ep-displayname
     - The version display name for Event APIs and Applications.

       Defaults to empty string if omitted.

   * - $.info.x-ep-shared
     - The shared flag for the Event API. It has no effect on Application if present.

       Defaults to environment variable `CLI_IMPORT_DEFAULT_SHARED_FLAG` if omitted.
       


.. list-table:: Event Portal Message Extensions
   :widths: 30 100
   :header-rows: 1

   * - Async Api Extension
     - Description
   * - x-ep-event-name
     - The Event name for the message.

       Defaults to `$.channels.{topic}.x-ep-event-name` if omitted.
   * - x-ep-event-version-displayname
     - The Event version name for the message.

       Defaults to empty string if omitted.
   * - x-ep-application-domain-name
     - The application domain name for the Event.

       Defaults to `$.info.x-ep-assets-application-domain-name` if omitted.

   * - x-ep-shared
     - The shared flag for the Event.

       Defaults to environment variable `CLI_IMPORT_DEFAULT_SHARED_FLAG` if omitted.

       
.. list-table:: Event Portal Schema Extensions
   :widths: 30 100
   :header-rows: 1

   * - Async Api Extension
     - Description
   * - x-ep-schema-name
     - The name for the Schema.

       Defaults to `x-ep-event-name` if omitted.
   * - x-ep-schema-version-displayname
     - The version name for the Schema version.

       Defaults to empty string if omitted.
   * - x-ep-application-domain-name
     - The application domain name for the Schema.

       Defaults to `$.info.x-ep-assets-application-domain-name` if omitted.

   * - x-ep-shared
     - The shared flag for the Schema.

       Defaults to environment variable `CLI_IMPORT_DEFAULT_SHARED_FLAG` if omitted.


.. list-table:: Event Portal Channel Parameter Extensions
   :widths: 30 100
   :header-rows: 1

   * - Async Api Extension
     - Description
   * - x-ep-enum-name
     - The Enum name for the parameter.

       Defaults to the string in the channel parameter if omitted.
   * - x-ep-enum-version-displayname
     - The Enum version name for the parameter.

       Defaults to empty string if omitted.
   * - x-ep-application-domain-name
     - The application domain name for the Enum.

       Defaults to `$.info.x-ep-assets-application-domain-name` if omitted.

   * - x-ep-shared
     - The shared flag for the Enum.

       Defaults to environment variable `CLI_IMPORT_DEFAULT_SHARED_FLAG` if omitted.

