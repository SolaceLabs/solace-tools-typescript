.. _ep-migrate-overview-content-principle:

Migration Principle
===================

The general migration principle is as follows:

- parse all EP V1 Enums and create EP V2 Enums and 1 Version

  - all EP V2 Enums are created within a single EP V2 Application Domain which is configurable

- for each EP V1 application domain:

  - parse all EP V1 Schemas and create EP V2 Schema Objects & 1 Version.
  - parse all EP V1 Events and create EP V2 Events and 1 Version.
  - parse all EP V1 Applications and create EP V2 Applications and 1 Version.


The CLI also works if EP V2 already has the same Application Domain(s) and/or Objects & Versions defined.

In case an existing object/version is found, the following logic is applied:

- check if the EP V1 object is different to the existing EP V2 object

  - if yes, update the object

- check if the EP V1 object is different to the existing EP V2 version:

  - if yes, create a new EP V2 version 

