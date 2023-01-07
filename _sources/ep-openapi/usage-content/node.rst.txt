.. _ep-openapi-usage-content-node:

Solace Event Portal OpenAPI Client for NodeJS
=============================================

Requirements
++++++++++++

* node 16.x

Install
+++++++

.. code-block:: bash

  npm install @solace-labs/ep-openapi-node

Configure OpenAPI Object
++++++++++++++++++++++++

.. code-block:: typescript

  import { OpenAPI } from "@solace-labs/ep-openapi-node";

  // to use a different base url than specified in the spec:
  OpenAPI.BASE = "{base-url}";
  OpenAPI.WITH_CREDENTIALS = true;
  OpenAPI.CREDENTIALS = "include";
  OpenAPI.TOKEN = "{token}";


Example: Create an Application Domain
+++++++++++++++++++++++++++++++++++++

.. code-block:: typescript

  import {
    ApplicationDomainResponse,
    ApplicationDomainsService,
  } from "@solace-labs/ep-openapi-node";

  const applicationDomainResponse: ApplicationDomainResponse =
    await ApplicationDomainsService.createApplicationDomain({
      requestBody: {
        name: "my-application-domain",
      },
    });


Advanced Usage
++++++++++++++

.. include:: ../../openapi-partials/fetch-with-proxy.rstinc

.. include:: ../../openapi-partials/openapi-resolver.rstinc
