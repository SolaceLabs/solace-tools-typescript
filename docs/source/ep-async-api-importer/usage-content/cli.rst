.. _usage-content-cli:


Importer Options
================

Prerequisites
-------------

You need a Solace Event Portal account and the ability to create a token.


Help
----

Execute this command to get a full list of options:

.. code-block:: bash

  ep-async-api-importer -h


In order to enable the strict application domain update policy, use these two options in combination:

.. code-block:: bash

    export CLI_ASSETS_APPLICATION_DOMAIN_ENFORCEMENT_POLICY=strict
    # set up domains must be on to enforce policy
    export CLI_TEST_SETUP_DOMAINS_FOR_APIS=true







