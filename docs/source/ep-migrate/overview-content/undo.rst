.. _ep-migrate-overview-content-undo:


Undo a migration
================

The CLI supports two modes for deleting all migrated objects from EP V2.

By `applicationDomainPrefix`
----------------------------

If an `applicationDomainPrefix` was configured for the migration, the CLI will delete all Application Domains whose Name starts with the prefix.


By `runId`
---------

The CLI also allows you to undo the migration for a specific `runId`.

In this case all objects & versions created by the `runId` are deleted again, 
leaving any previously existing objects/versions as they were.

This is achieved by reading the value of every object's and their versions custom attribute `ep-migrate-run-id`. 

**Versions:**

If a version's custom attribute `ep-migrate-run-id` equals to the CLI option `absentRunId`, it will be deleted.

**Objects:**

If an object's custom attribute `ep-migrate-run-id` equals to the CLI option `absentRunId` AND there are no versions defined, it will be deleted. 
