.. _ep-migrate-usage-content-migrate:

Preparing the Migration
=======================

Tokens
------

You can migrate from / to different EP accounts. This is controlled through

  - the EP V1 api base url and the the EP V1 token
  - the EP V2 api base url and the the EP V2 token
  
Assuming both use the default base url (`https://api.solace.cloud`), create two tokens:

- {EP V1 Token} (read access to all objects)
- {EP V2 Token} (read & write access to all objects)

Export both as environment variables:

  .. code-block:: bash

    export EP_V1_SOLACE_CLOUD_TOKEN={EP V1 Token}
    export EP_V2_SOLACE_CLOUD_TOKEN={EP V2 Token}

Configuration File
------------------

Donwload the sample configuration file :download:`here <../../../../packages/ep-migrate/src/files/ep-migrate-sample-config.yaml>`
and rename it to `ep-migrate-config.yaml`.

Adjust the contents to your needs.


Run Test Migration
==================

It is recommended to run a test first, using an `applicationDomainPrefix`, for example:

  .. code-block:: yaml

    migrate:
      epV2:
        # applicationDomainPrefix:
        # - optional
        # - if specified, prepends applicationDomainPrefix to all created applicationDomains 
        applicationDomainPrefix: 'epV1/'

Run the test migration:

.. code-block:: bash

  ep-migrate

Inspect the console output for details and any issues.

The details of the run are logged into the configured log file, for example `./logs/ep-migrate.log`.


If the migration was successful and you want to remove the create objects/versions from EP V2 again, run:

.. code-block:: bash

  ep-migrate -rs absent


Run Migration
=============

Remove the `applicationDomainPrefix` from the config:

  .. code-block:: yaml

    migrate:
      epV2:
        # applicationDomainPrefix:
        # - optional
        # - if specified, prepends applicationDomainPrefix to all created applicationDomains 
        # applicationDomainPrefix: 'epV1/'

Run the migration:

.. code-block:: bash

  ep-migrate


