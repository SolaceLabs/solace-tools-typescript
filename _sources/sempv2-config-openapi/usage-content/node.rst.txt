.. _sempv2-openapi-usage-content-node:

Solace SempV2 OpenAPI Client for NodeJS
=======================================

Requirements
++++++++++++

* node 16.x

Install
+++++++

.. code-block:: bash

  npm install @solace-labs/sempv2-openapi-node

Configure OpenAPI Object
++++++++++++++++++++++++

.. code-block:: typescript

  import { OpenAPI } from "@solace-labs/sempv2-config-openapi-node";

  const protocol = "https";
  const host = "{service-name}.messaging.solace.cloud";
  const post = 943;

  OpenAPI.BASE = `${protocol}://${host}:${port}/SEMP/v2/config`;
  OpenAPI.USERNAME = '{sempv2 username}';
  OpenAPI.PASSWORD = '{sempv2 password}';


Example: Create and Delete a client username
++++++++++++++++++++++++++++++++++++++++++++

.. code-block:: typescript

  import {
    ClientUsernameService,
    MsgVpnClientUsername,
    MsgVpnClientUsernameResponse,
  } from "@solace-labs/sempv2-config-openapi-node";

  const msgVpnClientUsername: MsgVpnClientUsername = {
    clientUsername: 'foo',
    password: 'bar'
  };
  // create
  const msgVpnClientUsernameResponse: MsgVpnClientUsernameResponse = await ClientUsernameService.createMsgVpnClientUsername({
    msgVpnName: '{msgVpnName}',
    body: msgVpnClientUsername,
  });
  console.log(`msgVpnClientUsernameResponse=${JSON.stringify(msgVpnClientUsernameResponse, null, 2)}`);
  // delete
  await ClientUsernameService.deleteMsgVpnClientUsername({
    msgVpnName: '{msgVpnName}',
    clientUsername: msgVpnClientUsername.clientUsername,
  });

Advanced Usage
++++++++++++++

.. include:: ../../openapi-partials/fetch-with-proxy.rstinc

.. include:: ../../openapi-partials/openapi-resolver.rstinc
