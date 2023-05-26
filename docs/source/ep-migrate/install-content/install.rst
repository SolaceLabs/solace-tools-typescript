.. _ep-migrate-install-content-install:

Prerequisites
=============

The importer requires `node 16.x`.

Heap Size
=========

If you are experiencing out of memory errors, increase the heap size for node:

.. code-block:: bash
  
  # here: 4GB
  export NODE_OPTIONS=--max_old_space_size=4096


Install Globally
================

.. code-block:: bash

  npm install @solace-labs/ep-migrate -g
