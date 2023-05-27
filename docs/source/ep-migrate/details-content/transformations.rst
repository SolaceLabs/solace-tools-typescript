.. _ep-migrate-details-content-transformations:

Transformations & Mappings
==========================

Topic Elements
--------------

EP V2 only allows alphanumeric characters and underscore as part of a topic element.

The CLI will transform every EpV1 topic element using the following expression:

.. code-block:: javascript

  topicElement.replaceAll(/[^A-Za-z_0-9{}]/g, '_');


Schemas
-------

EP V1 Schemas with the following content types cannot be migrated directly:

- Text
- Binary

Both of these are mapped to:

- EP V2 Schema Type: Protobuf
- EP V2 Content Type: Protobuf

