.. _ep-migrate-overview-content-run-id:

The RunId
=========

The CLI leave a `breadcrumb` in each created object/version in EP V2 in the form of a custom attribute:

  - `ep-migrate-run-id={runId}`

A new `runId` is generated for every run, is based on the formatted timestamp:

  - `YYYY_MM_DD_HH_MM_SS_MMM`, e.g. `2023_05_25_10_26_40_290`

This allows you to search for the `runId` (or the partial `runId`) in the catalog to see all the objects / versions that were created as part of a run.

