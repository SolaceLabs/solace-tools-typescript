.. _apis-content-references:

Working with References
=======================

The AsyncAPI parser supports the use of file and http references.

This allows you to decompose your assets into reusable components.

Using File References
---------------------

For example, we may have the following directory structure::

  root
    +- my.spec.yml
    |
    +- messages (contains our reusable messages)
    |        - message-a.yml
    |        - message-b.yml
    |
    +- schemas (contains our reusable schemas)
             - items.yml
             - common-header.yml


In the `root` directory, we define `my.spec.yml`:

.. code-block:: yaml

  asyncapi: '2.4.0'
  info:
    title: My Spec Title
    version: '1.0.0'
  defaultContentType: application/json
  channels:
    my-topic/message-a:
      x-ep-event-name: Message-A
      publish:
        message:
          $ref: '#/components/messages/Message-A'

  components:
    messages:
      Message-A:
        $ref: ./messages/message-a.yml


In the directory `messages`, we defined our `message-a.yml`:

.. code-block:: yaml

  name: Message-A
  contentType: application/json
  payload:
    type: object
    properties:
      payload:
        type: array
        items:
          $ref: "../schemas/items.yml"
      header:
        $ref: "../schemas/common-header.yml"

In the directory `schemas`, we defined our `common-header.yml` & `items.yml`:


.. code-block:: yaml

  description: Common Header
  type: object
  properties:
    sentAt:
      type: string
      format: date-time
      description: Date and time when the message was sent.
    transactionId:
      type: string
      description: The transaction id.
  required:
    - sentAt
    - transactionId

.. code-block:: yaml

  description: Items
  type: object
  properties:
    sku:
      description: SKU.
      type: string
      minLength: 4
      maxLength: 255
      pattern: ^[A-Za-z0-9_-]*$
  required:
    - sku

Using Http References
---------------------

If your specs and/or your reusable components are reachable via http, you can also use http references.

Example of an http ref using a github repo:


.. code-block:: yaml

  asyncapi: '2.4.0'
  info:
    title: My Spec Title
    version: '1.0.0'
  defaultContentType: application/json
  channels:
    my-topic/message-a:
      x-ep-event-name: Message-A
      publish:
        message:
          $ref: '#/components/messages/Message-A'

  components:
    messages:
      Message-A:
        $ref: "https://raw.githubusercontent.com/myorg/myrepo/mybranch/asyncapi-specs/messages/message-a.yml"

.. note::

  When you use http refs you cannot use file refs in the files referenced by http refs.
  I.e. in this example, both schemas, `common-header.yml` and `items.yml` must also be referenced using
  http in `message-a.yml`.
