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
  
Events
------

* EP V1 Events without a topic will not be migrated and an issue will be logged.
* EP V1 Event with a duplicate topic address will not be migrated and an issue will be logged.

Applications
------------

* EP V1 Applications which reference an Event that has not been migrated will not be migrated and an issue with the root cause (the event issue) will be logged.

    