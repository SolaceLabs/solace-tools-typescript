.. _ep-apim-openapi-usage-content-node:

Solace Event Portal APIM OpenAPI Client for NodeJS
==================================================

.. warning::
   Experimental. Please use with care.

Requirements
++++++++++++

* node 16.x

Install
+++++++

.. code-block:: bash

  npm install @solace-labs/ep-apim-openapi-node

Configure OpenAPI Object
++++++++++++++++++++++++

.. code-block:: typescript

  import { OpenAPI } from "@solace-labs/ep-apim-openapi-node";

  // to use a different base url than specified in the spec:
  OpenAPI.BASE = "{base-url}";
  OpenAPI.WITH_CREDENTIALS = true;
  OpenAPI.CREDENTIALS = "include";
  OpenAPI.TOKEN = "{token}";


Example: Retrieve Event API Products
++++++++++++++++++++++++++++++++++++

.. code-block:: typescript

    import {
      EventApiProduct,
      EventApiProductsResponse,
      EventApiProductsService,
    } from "@solace-labs/ep-apim-openapi-node";

    const eventApiProductList: Array<EventApiProduct> = [];
    let nextPage: number | null = 1;
    while(nextPage !== null) {
      const eventApiProductsResponse: EventApiProductsResponse = await EventApiProductsService.listEventApiProducts({
        pageNumber: nextPage,
      });
      eventApiProductList.push(...eventApiProductsResponse.data);
      nextPage = meta.pagination.nextPage;
    }


Advanced Usage
++++++++++++++

.. include:: ../../openapi-partials/fetch-with-proxy.rstinc

.. include:: ../../openapi-partials/openapi-resolver.rstinc
