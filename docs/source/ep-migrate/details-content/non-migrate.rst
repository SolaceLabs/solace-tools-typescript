.. _ep-migrate-details-content-non-migrate:

Known Limitations 
=================

.. seealso::

  :ref:`ep-migrate-details-content-transformations`.

Enums
------

* EP V1 Enums with duplicate labels will not be migrated and an issue will be logged.

Application Domains
-------------------

Topic Domains
+++++++++++++

* EP V1 Topic Domains that contain a variable which is not an Enum will not be migrated and an issue will be logged.
* EP V1 Topic Domains that contain a variable which references an Enum with a migration issue will not be migrated and an issue with the root cause will be logged.

The Application Domain will still be migrated.

Schemas
-------

**EP V1 XML Schemas:**

It may happen that EP V1 XML Schemas fail EP V2 XML validation. In this case, fix the EP V1 schema and run the migration again.

For example, EP V1 XML Schema start with the version:

.. code-block:: xml

    <?xml version="1.0" encoding="utf-16"?>
    <xs:schema xmlns="urn:exchangevoucherissued.bunnings.com.au" xmlns:ns1="http://schemas.microsoft.com/BizTalk/2003/system-properties" xmlns:b="http://schemas.microsoft.com/BizTalk/2003" xmlns:ns0="http://bunnings.com.au/integration/common/properties" elementFormDefault="qualified" targetNamespace="urn:exchangevoucherissued.bunnings.com.au" xmlns:xs="http://www.w3.org/2001/XMLSchema">
    ....

Fix:
  * remove first line: <?xml version="1.0" encoding="utf-16"?>
  * save



Events
------

* EP V1 Events without a topic will not be migrated and an issue will be logged.
* EP V1 Event with a duplicate topic address will not be migrated and an issue will be logged.

Applications
------------

* EP V1 Applications which reference an Event that has not been migrated will not be migrated and an issue with the root cause (the event issue) will be logged.

    