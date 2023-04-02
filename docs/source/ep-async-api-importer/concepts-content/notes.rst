.. _importer-content-notes:

Known Limitations
=================

Multiple Messages per Channel
-----------------------------

The importer currently does **not** support multiple messages for a channel operation.

Asset Names
-----------

All asset names (events, schemas, enums) must be unique within a single Api File, even if they are assigned to different application domains.


Orphaned Assets
---------------

Assets are keyed on their name (see :ref:`importer-content-overview-asset-mapping`).

If you change assets names (channels, messages, schemas), the old assets remain in Event Portal and if no Event Api is using them they become orphaned.

There is currently no mechanism to detect and remove such orphaned assets with the importer.


Removing Channel Parameters Enums
---------------------------------

The importer cannot detect removed enums for a channel parameter.

It can only detect changes to enum values.

Removing enums completely may lead to orphaned Enums and Enum Versions in Event Portal.


Changing Shared Flag of Exsting Objects
---------------------------------------

Event Portal does not allow changing the `shared` flag of objects which are referenced by versions in a different application domain.

The importer currently does not detect setting `shared=false` during the test phase for such situations.
Instead, it will fail during the release phase, reasulting in an aborted import and therefor inconsistencies in Event Portal.

Workaround: do not change the `shared` flag for objects that already exist. Leave the extension `x-ep-shared` as downloaded from Event Portal.