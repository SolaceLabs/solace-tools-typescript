.. _apis-content-extensions:

Async Api Extensions
====================

The importer uses the following extensions:

.. list-table:: Aysnc Api Extensions
   :widths: 30 100
   :header-rows: 1

   * - Async Api Extension
     - Description
   * - $.x-ep-application-domain
     - The Event Portal application domain for Event APIs and Applications.
   * - $.x-ep-assets-application-domain-name
     - The Event Portal application domain for re-usable Assets: Events, Schemas, Enums.

       Defaults to `$.x-ep-application-domain` if omitted.

   * - $.channels.{topic}.x-ep-event-name
     - The name to use for Event Portal Events and Event Versions.

       If not specified, falls back to:

       - Event Name = $.channel.{topic}
       - Event Version Name = EMPTY
