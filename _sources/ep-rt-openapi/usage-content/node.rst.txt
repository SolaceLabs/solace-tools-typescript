.. _ep-rt-openapi-usage-content-node:

Solace Event Portal Runtime OpenAPI Client for NodeJS
=====================================================

Requirements
++++++++++++

* node 16.x

Install
+++++++

.. code-block:: bash

  npm install @solace-labs/ep-rt-openapi-node

Configure OpenAPI Object
++++++++++++++++++++++++

.. code-block:: typescript

  import { OpenAPI } from "@solace-labs/ep-rt-openapi-node";

  // to use a different base url than specified in the spec:
  OpenAPI.BASE = "{base-url}";
  OpenAPI.WITH_CREDENTIALS = true;
  OpenAPI.CREDENTIALS = "include";
  OpenAPI.TOKEN = "{token}";


Example: Get a list of Environments
+++++++++++++++++++++++++++++++++++

.. code-block:: typescript

  import {
    EnvironmentsResponse,
    EnvironmentsService
  } from "@solace-labs/ep-rt-openapi-node";

  const environmentsResponse: EnvironmentsResponse = await EnvironmentsService.getEnvironments({});


Advanced Usage
++++++++++++++

.. include:: ../../openapi-partials/fetch-with-proxy.rstinc

.. include:: ../../openapi-partials/openapi-resolver.rstinc
