import {
  EpAsyncApiDocument,
  EpAsyncApiDocumentService,
} from "@solace-labs/ep-asyncapi";

const epAsyncApiDocument: EpAsyncApiDocument =
  await EpAsyncApiDocumentService.createFromFile({
    filePath: "path-to-api-spec-file",
  });
const appDomainName = epAsyncApiDocument.getApplicationDomainName();
console.log(`appDomainName = ${appDomainName}.`);
