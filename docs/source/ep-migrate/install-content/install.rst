.. _ep-migrate-install-content-install:

Prerequisites
=============

The importer has been tested with `node 16.x` or `node 18.16.x` on Mac and Linux systems.

Heap Size
=========

If you are experiencing out of memory errors, increase the heap size for node:

.. code-block:: bash
  
  # example: 4GB
  export NODE_OPTIONS=--max_old_space_size=4096


Install Globally
================

.. code-block:: bash

  npm install @solace-labs/ep-migrate -g
