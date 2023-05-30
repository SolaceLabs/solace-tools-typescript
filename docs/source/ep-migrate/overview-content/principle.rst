.. _ep-migrate-overview-content-principle:

Migration Principle
===================

The general migration principle is as follows:

Enumerations
------------

- parse all EP V1 Enums and create EP V2 Enums and 1 Version

  - all EP V2 Enums are created within a single EP V2 Application Domain which is configurable
  - all EP V2 Enums are shared

Application Domains
-------------------

- for each EP V1 Application Domain:
  
  - create an EP V2 Application Domain
  
    - if an EP V2 `applicationDomainPrefix` is configured, the CLI prepends the prefix to each Application Domain Name
  
      .. note::

        Note: this is useful for test runs, as it allows for a quick `undo` of the migration run by deleting all EP V2 Application Domains starting with the prefix.

    - if a EP V1 Topic Domain is configured, it is migrated to EP V2

      .. note::
        
        EP V2 Topic Domains have restrictions such as if configured with a variable, it must be an Enum. See also :ref:`ep-migrate-details-content-non-migrate`.

  - parse all EP V1 Schemas and create EP V2 Schema Objects & 1 Version.
  - parse all EP V1 Events and create EP V2 Events and 1 Version.
  - parse all EP V1 Applications and create EP V2 Applications and 1 Version.

Existing Objects & Versioning
-----------------------------

The CLI also works if EP V2 already has the same Application Domain(s) and/or Objects & Versions defined.

In case an existing object/version is found, the following logic is applied:

- check if the EP V1 object is different to the existing EP V2 object

  - if yes, update the object

- check if the EP V1 object is different to the existing EP V2 version:

  - if yes, create a new EP V2 version
  
    - note: the new version number is defined by the `versionStrategy` configuration option

