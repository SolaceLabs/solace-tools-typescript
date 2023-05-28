.. _ep-migrate-details-content-transformations:

Transformations & Mappings
==========================

Tags
----

EP V1 tags will be migrated to a custom attribute at the object (not version) level:

- Custom Attribute:

  - Name: `tags`
  - Type: Simple
  - Scope: Application Domain
  - Value:
  
    - list of EP V1 tags, separated by ' - '
    - remove any commas

Topic Elements
--------------

EP V2 only allows alphanumeric characters and underscore as part of a topic element.

The CLI will transform every EpV1 topic element using the following expression:

.. code-block:: javascript

  topicElement.replaceAll(/[^A-Za-z_0-9{}]/g, '_');


Schemas
-------

EP V1 `schemaType` and a `contentType` are mapped as follows:

============================= =========================================================================
EP V1 Schema Type             EP V2 Schema Type
============================= =========================================================================
JSON                          JSON Schema
AVRO                          AVRO
XML                           XSD
TEXT                          PROTOBUF
BINARY                        PROTOBUF
============================= =========================================================================

============================= =========================================================================
EP V1 Content Type             EP V2 Content Type
============================= =========================================================================
JSON                          JSON
AVRO                          JSON
XML                           XML
TEXT                          PROTOBUF
BINARY                        PROTOBUF
============================= =========================================================================

