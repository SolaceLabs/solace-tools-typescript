.. _examples-content-example-1:

Example 1: Importing 2 Apis
===========================

Apis
++++

* 2 apis to import & release

  - specs/acme-retail/till.spec.yml
  - specs/acme-retail/analytics.spec.yml

* both apis have channels & messages in common, albeit in different operations


Goal
++++

* import both apis into Event Portal
* ensure both apis have EXACTLY the same definition for a Channel & Message - i.e. use EXACTLY the same Event.

Test Run
++++++++

.. code-block:: bash

  export CLI_SOLACE_CLOUD_TOKEN={your token}
  export CLI_MODE="test_mode"

  ep-async-api-importer -fp 'specs/acme-retail/**/*.spec.yml'

Release Run
+++++++++++

* Import both apis into a test application domain

.. code-block:: bash

  export CLI_SOLACE_CLOUD_TOKEN={your token}

  ep-async-api-importer -fp 'specs/acme-retail/**/*.spec.yml'
