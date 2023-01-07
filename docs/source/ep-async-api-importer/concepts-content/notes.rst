.. _importer-content-notes:

Known Limitations
=================

Async API Spec Files
--------------------

No support for multiple messages on a channel.


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
