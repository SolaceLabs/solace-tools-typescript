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
  
Events
------

* EP V1 Events without a topic will not be migrated and an issue will be logged.

  