.. _usage-content-overview:

.. note::

  Ensure a valid Solace Cloud Token is defined:

  .. code-block:: bash

    export CLI_SOLACE_CLOUD_TOKEN={your token}


Api Importer
============

Help
----
.. code-block:: bash

  ep-async-api-importer -h


Importing a single Api
----------------------

.. code-block:: bash

  ep-async-api-importer -fp '{path to the api file}'

Importing Apis using a File Pattern
-----------------------------------

When using a file pattern, the importer will first create a list of api file names and then import one file after the other.

.. code-block:: bash

  ep-async-api-importer -fp '{glob pattern to api file(s)}'

.. note::

  Ensure you always encapsulate the `glob-pattern` in quotes, e.g. **'{my-root}/{dir}/\*\*/\*.spec.yml'**.


Example Patterns
++++++++++++++++

:-fp '{root}/{dir}/\*\*/\*.spec.yml': search for files in all sub-directories of `{root}/{dir}` that match pattern `\*.spec.yml`
:-fp '{root}/{dir}/\*\*/\*.yaml': search for files in all sub-directories of `{root}/{dir}` that match pattern `\*.yaml`


Importing Apis into one Application Domain
------------------------------------------

By default, the application domain is specified in the Api itself using the extension `$.x-ep-application-domain-name: {application-domain-name}`.
You can override the application domain name using the command line option: `-d {applicaton-domain-name}`.

.. code-block:: bash

  ep-async-api-importer -fp '{glob pattern to api file(s)}' -d {application-domain-name}


Importing Api Assets into a separate Application Domain
-------------------------------------------------------

By default, the application domain for re-usable assets (events, schemas, enums) is specified in the Api itself using the extension `$.x-ep-assets-application-domain-name: {assets-application-domain-name}`.
You can override the asset application domain name using the command line option: `-ad {assets-applicaton-domain-name}`.

.. code-block:: bash

  ep-async-api-importer -fp '{glob pattern to api file(s)}' -d {application-domain-name} -ad {assets-application-domain-name}


Log File
--------

Default log file: `./tmp/logs/ep-async-api-importer.log`.

You can specify the log file by setting this environment variable:

.. code-block:: bash

  export CLI_LOGGER_LOG_FILE="{path/filename.ext}"


Generated Output
----------------

Default output directory: `./tmp/output`.

You can specify the output directory by setting this environment variable:

.. code-block:: bash

  export CLI_IMPORT_ASSETS_OUTPUT_DIR="{path}"

After each Api import the following output is generated:

- {application-domain}

  - Api Spec Files:

    - {api-name}.yml
    - {api-name}.json

  - Schema Files:

    - schemas:

      - {schema-name}.json
      - ...


Importing Api as Event API
--------------------------

The default mode is to import the Api as an Event API.

You can switch it off by setting the following environment variable:

.. code-block:: bash

  export CLI_IMPORT_CREATE_API_EVENT_API=false


Importing Api as Application
----------------------------

By default, importing the Api as an Application is switched off.

You can switch it on by setting the following environment variable:

.. code-block:: bash

  export CLI_IMPORT_CREATE_API_APPLICATION=true
