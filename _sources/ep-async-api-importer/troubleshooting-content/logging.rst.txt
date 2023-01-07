.. _troubleshooting-content-logging:

Logging
=======

Log Output
----------

Default log file: `./tmp/logs/ep-async-api-importer.log`.

You can specify the log file by setting this environment variable:

.. code-block:: bash

  export CLI_LOGGER_LOG_FILE="{path/filename.ext}"


You can also print the log output to stdout:

.. code-block:: bash

  export CLI_LOGGER_LOG_TO_STDOUT=true


Pretty Print Log Entries
------------------------

.. code-block:: bash

  export CLI_LOGGER_PRETTY_PRINT=true


Log Levels
----------

.. code-block:: bash

  export CLI_LOGGER_LOG_LEVEL={log level}

Choose one of the following values for the log level: **trace | debug | info | warn | error | fatal**

In addition, you can log the EP SDK calls:

.. code-block:: bash

  export CLI_LOGGER_EP_SDK_LOG_LEVEL=trace

Example .env File
-----------------

Example .env file with full logging enabled:

.. code-block:: bash

  CLI_LOGGER_LOG_LEVEL=trace
  CLI_LOGGER_LOG_FILE=./tmp/logs/ep-async-api-importer-x.log
  CLI_LOGGER_EP_SDK_LOG_LEVEL=trace
  CLI_LOGGER_PRETTY_PRINT=true
  # CLI_LOGGER_LOG_TO_STDOUT=true
