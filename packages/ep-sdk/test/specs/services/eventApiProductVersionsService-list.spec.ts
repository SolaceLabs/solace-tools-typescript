import "mocha";
import { expect } from "chai";
import path from "path";
import { TestContext, TestUtils } from "@internal/tools/src";
import { TestLogger, TestConfig } from "../../lib";
import {
  ApiError,
  ApplicationDomainResponse,
  ApplicationDomainsService,
  EventApiProductsService,
  EventApiProductResponse,
  EventApiProductsResponse,
  EventApiProduct,
  EventApiProductVersion,
  SolaceClassOfServicePolicy,
  Plan,
  MessagingService,
  CustomAttributeDefinition,
} from "@solace-labs/ep-openapi-node";
import {
  EpSdkError,
  EpSdkApplicationDomainsService,
  EpSdkEventApiProductsService,
  EpSdkEventApiProductVersionsService,
  EpSdkEventApiProductAndVersionList,
  EpSdkEventApiProductAndVersionListResponse,
  EpSdkEventApiProductAndVersionResponse,
  TEpSdkCustomAttribute,
  EpSdkEventApiProduct,
  EpSdkEventApiProductVersion,
  EpSdkServiceError,
  EpSdkStatesService,
  EpSdkMessagingService,
} from "../../../src";

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const TestSpecName = "eapV-list.spec";
const TestSpecId: string = TestUtils.getUUID();
const NumApplicationDomains = 2;
const getApplicationDomainNameList = (): Array<string> => {
  const list: Array<string> = [];
  for (let i = 0; i < NumApplicationDomains; i++) {
    list.push(`${TestConfig.getAppId()}/${scriptName}/${TestSpecId}/${i}`);
  }
  return list;
};
let ApplicationDomainIdList: Array<string> = [];

let MessagingServiceList: Array<MessagingService> = [];
const MessagingServiceId = "14p394d5c0i";
let TheMessagingService: MessagingService | undefined = undefined;

let EventApiProductName: string;
const EventApiProductShared = true;
let EventApiProductId: string | undefined;
const EventApiProductVersionString_1 = "1.0.0";
const EventApiProductVersionString_2 = "1.1.0";

let ApplicationDomainName: string;
let ApplicationDomainId: string | undefined;
const CustomAttributeList: Array<TEpSdkCustomAttribute> = [
  {
    name: `${TestSpecName}.PUB_DEST`,
    value: "PublishDestination",
    valueType: CustomAttributeDefinition.valueType.STRING,
    scope: CustomAttributeDefinition.scope.ORGANIZATION  
  },
  {
    name: `${TestSpecName}.DOMAIN_OWNING_ID`,
    value: "XEpDevPDomainOwningId",
    valueType: CustomAttributeDefinition.valueType.STRING,
    scope: CustomAttributeDefinition.scope.ORGANIZATION  
  },
  {
    name: `${TestSpecName}.DOMAIN_SHARING_LIST`,
    value: "XEpDevPDomainSharingListAttributeValue",
    valueType: CustomAttributeDefinition.valueType.STRING,
    scope: CustomAttributeDefinition.scope.ORGANIZATION  
  },
];
const AdditionalCustomAttributeList: Array<TEpSdkCustomAttribute> = [
  {
    name: "eventApiProduct_1",
    value: "eventApiProduct_1 value",
    valueType: CustomAttributeDefinition.valueType.STRING,
    scope: CustomAttributeDefinition.scope.ORGANIZATION  
  },
  {
    name: "eventApiProduct_2",
    value: "eventApiProduct_2 value",
    valueType: CustomAttributeDefinition.valueType.STRING,
    scope: CustomAttributeDefinition.scope.ORGANIZATION  
  },
];

const EventApiProductVersionPlan_1: Plan = {
  name: "plan-1",
  solaceClassOfServicePolicy: {
    accessType: SolaceClassOfServicePolicy.accessType.EXCLUSIVE,
    maximumTimeToLive: 1,
    maxMsgSpoolUsage: 1,
    messageDeliveryMode: SolaceClassOfServicePolicy.messageDeliveryMode.GUARANTEED,
    queueType: SolaceClassOfServicePolicy.queueType.COMBINED,
    type: "solaceClassOfServicePolicy",
  },
};

const initializeGlobals = () => {
  ApplicationDomainName = `${TestConfig.getAppId()}/services/${TestSpecName}`;
  EventApiProductName = `${TestConfig.getAppId()}-eap-${TestSpecName}`;
};

describe(`${scriptName}`, () => {
  before(async () => {
    initializeGlobals();
    // create all application domains
    TestContext.newItId();
    const applicationDomainNameList = getApplicationDomainNameList();
    for (const applicationDomainName of applicationDomainNameList) {
      const applicationDomainResponse: ApplicationDomainResponse = await ApplicationDomainsService.createApplicationDomain({
        requestBody: {
          name: applicationDomainName,
        },
      });
      ApplicationDomainIdList.push(applicationDomainResponse.data.id);
    }
    const applicationDomainResponse: ApplicationDomainResponse = await ApplicationDomainsService.createApplicationDomain({
      requestBody: {
        name: ApplicationDomainName,
      },
    });
    ApplicationDomainId = applicationDomainResponse.data.id;
  });

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async () => {
    TestContext.newItId();
    // delete all application domains
    for (const applicationDomainId of ApplicationDomainIdList) {
      await EpSdkApplicationDomainsService.deleteById({ applicationDomainId });
    }
    await EpSdkApplicationDomainsService.deleteById({ applicationDomainId: ApplicationDomainId });
    // remove all attribute definitions
    const customAttributeList = CustomAttributeList.concat(AdditionalCustomAttributeList);
    const xvoid: void = await EpSdkEventApiProductsService.removeAssociatedEntityTypeFromCustomAttributeDefinitions({
      customAttributeNames: customAttributeList.map((x) => { return x.name; }),
    }
  );
  });

  it(`${scriptName}: should get all messaging services`, async () => {
    try {
      MessagingServiceList = await EpSdkMessagingService.listAll({});
      expect(MessagingServiceList.length, `MessagingServiceList = ${JSON.stringify(MessagingServiceList, null, 2 )}`).to.be.greaterThan(0);
      TheMessagingService = MessagingServiceList.find((x) => { return x.id === MessagingServiceId; });
      expect(TheMessagingService).not.to.be.undefined;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should create eventApiProduct & two versions in every application domain`, async () => {
    try {
      for (const applicationDomainId of ApplicationDomainIdList) {
        // create the product
        const eventApiProductResponse: EventApiProductResponse = await EventApiProductsService.createEventApiProduct({
          requestBody: {
            applicationDomainId: applicationDomainId,
            name: EventApiProductName,
            shared: EventApiProductShared,
            brokerType: EventApiProduct.brokerType.SOLACE,
          },
        });
        const eventApiProductId = eventApiProductResponse.data.id;
        // create version 1 in Draft
        const x = await EventApiProductsService.createEventApiProductVersion({
          requestBody: {
            eventApiProductId: eventApiProductId,
            displayName: "version x",
            version: EventApiProductVersionString_1,
            plans: [EventApiProductVersionPlan_1],
          },
        });
        // API spec only allows capital letters, but implementation requires lowercase letters
        const _supportedProtocols: any = {
          supportedProtocols: ["amqp", "mqtt"],
        };
        const _x =
          await EventApiProductsService.associateGatewayMessagingServiceToEapVersion(
            {
              eventApiProductVersionId: x.data.id,
              requestBody: {
                messagingServiceId: TheMessagingService.id,
                ..._supportedProtocols,
              },
            }
          );
        // DEBUG
        // const _finalX = await EventApiProductsService.getEventApiProductVersion({
        //   versionId: x.data.id,
        //   include: 'what'
        // })
        // expect(false, `_finalX=${JSON.stringify(_finalX, null, 2)}`).to.be.true;
        // create version 2 in Draft
        const y = await EventApiProductsService.createEventApiProductVersion({
          requestBody: {
            eventApiProductId: eventApiProductId,
            displayName: "version y",
            version: EventApiProductVersionString_2,
          },
        });
        // const _y = await EventApiProductsService.associateGatewayMessagingServiceToEapVersion({
        //   eventApiProductVersionId: y.data.id,
        //   requestBody: {
        //     messagingServiceId: TheMessagingService.id,
        //     ..._supportedProtocols
        //   }
        // });
      }
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should get complete list of event api products`, async () => {
    try {
      const eventApiProductsResponse: EventApiProductsResponse = await EpSdkEventApiProductsService.listAll({
        applicationDomainIds: ApplicationDomainIdList,
        shared: EventApiProductShared,
      });
      expect(eventApiProductsResponse.data.length, TestLogger.createApiTestFailMessage("eventApi === undefined")).to.equal(NumApplicationDomains);
      expect(eventApiProductsResponse.meta.pagination.count, TestLogger.createApiTestFailMessage("eventApi === undefined")).to.equal(NumApplicationDomains);
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should get complete list of latest event api product versions`, async () => {
    try {
      const epSdkEventApiProductAndVersionList: EpSdkEventApiProductAndVersionList = await EpSdkEventApiProductVersionsService.listAllLatestVersions({
        applicationDomainIds: ApplicationDomainIdList,
        shared: true,
      });

      const message = `epSdkEventApiProductAndVersionList=\n${JSON.stringify(epSdkEventApiProductAndVersionList, null, 2)}`;
      expect(epSdkEventApiProductAndVersionList.length, message).to.equal(NumApplicationDomains);
      for (const epSdkEventApiProductAndVersion of epSdkEventApiProductAndVersionList) {
        expect(epSdkEventApiProductAndVersion.eventApiProductVersion.version, TestLogger.createApiTestFailMessage("wrong version")).to.equal(EventApiProductVersionString_2);
      }
      // // DEBUG
      // expect(false, message).to.be.true;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should test paging & sort of latest event api product versions by eventApiProduct field`, async () => {
    const PageSize = 1;
    let nextPage: number | undefined | null = 1;
    try {
      while (nextPage !== undefined && nextPage !== null) {
        const epSdkEventApiProductAndVersionListResponse: EpSdkEventApiProductAndVersionListResponse =
          await EpSdkEventApiProductVersionsService.listLatestVersions({
            applicationDomainIds: ApplicationDomainIdList,
            shared: true,
            pageNumber: nextPage,
            pageSize: PageSize,
            sortInfo: {
              eventApiProduct: {
                sortDirection: "asc",
                sortFieldName: TestUtils.nameOf<EpSdkEventApiProduct>("name"),
              },
            },
          });
        const epSdkEventApiProductAndVersionList: EpSdkEventApiProductAndVersionList = epSdkEventApiProductAndVersionListResponse.data;

        const message = `epSdkEventApiProductAndVersionListResponse=\n${JSON.stringify(epSdkEventApiProductAndVersionListResponse, null, 2)}`;
        expect(epSdkEventApiProductAndVersionList.length, message).to.equal(
          PageSize
        );
        expect(
          epSdkEventApiProductAndVersionListResponse.meta.pagination.count,
          message
        ).to.equal(NumApplicationDomains);
        if (nextPage < NumApplicationDomains) {
          expect(
            epSdkEventApiProductAndVersionListResponse.meta.pagination.nextPage,
            message
          ).to.equal(nextPage + 1);
        } else {
          expect(
            epSdkEventApiProductAndVersionListResponse.meta.pagination.nextPage,
            message
          ).to.be.undefined;
        }
        for (const epSdkEventApiProductAndVersion of epSdkEventApiProductAndVersionList) {
          expect(
            epSdkEventApiProductAndVersion.eventApiProductVersion.version,
            TestLogger.createApiTestFailMessage("wrong version")
          ).to.equal(EventApiProductVersionString_2);
        }
        // // DEBUG
        // expect(false, message).to.be.true;
        nextPage =
          epSdkEventApiProductAndVersionListResponse.meta.pagination.nextPage;
      }
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should catch error for invalid sort field when paging & sort of latest event api product versions by eventApiProduct field`, async () => {
    const PageSize = 1;
    let nextPage: number | undefined | null = 1;
    const sortFieldName = "unknown-field";
    try {
      const epSdkEventApiProductAndVersionListResponse: EpSdkEventApiProductAndVersionListResponse =
        await EpSdkEventApiProductVersionsService.listLatestVersions({
          applicationDomainIds: ApplicationDomainIdList,
          shared: true,
          pageNumber: nextPage,
          pageSize: PageSize,
          sortInfo: {
            eventApiProduct: {
              sortDirection: "asc",
              sortFieldName: sortFieldName,
            },
          },
        });
      expect(false, "should never get here").to.be.true;
    } catch (e) {
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(
        e instanceof EpSdkServiceError,
        TestLogger.createNotEpSdkErrorMessage(e)
      ).to.be.true;
      const epSdkServiceError: EpSdkServiceError = e;
      expect(
        JSON.stringify(epSdkServiceError),
        JSON.stringify(epSdkServiceError, null, 2)
      ).to.contain(sortFieldName);
    }
  });

  it(`${scriptName}: should test paging & sort of latest event api product versions by eventApiProductVersion field`, async () => {
    const PageSize = 1;
    let nextPage: number | undefined | null = 1;
    try {
      while (nextPage !== undefined && nextPage !== null) {
        const epSdkEventApiProductAndVersionListResponse: EpSdkEventApiProductAndVersionListResponse =
          await EpSdkEventApiProductVersionsService.listLatestVersions({
            applicationDomainIds: ApplicationDomainIdList,
            shared: true,
            pageNumber: nextPage,
            pageSize: PageSize,
            sortInfo: {
              eventApiProductVersion: {
                sortDirection: "asc",
                sortFieldName:
                  TestUtils.nameOf<EpSdkEventApiProductVersion>("displayName"),
              },
            },
          });
        const epSdkEventApiProductAndVersionList: EpSdkEventApiProductAndVersionList =
          epSdkEventApiProductAndVersionListResponse.data;

        const message = `epSdkEventApiProductAndVersionListResponse=\n${JSON.stringify(
          epSdkEventApiProductAndVersionListResponse,
          null,
          2
        )}`;
        expect(epSdkEventApiProductAndVersionList.length, message).to.equal(
          PageSize
        );
        expect(
          epSdkEventApiProductAndVersionListResponse.meta.pagination.count,
          message
        ).to.equal(NumApplicationDomains);
        if (nextPage < NumApplicationDomains) {
          expect(
            epSdkEventApiProductAndVersionListResponse.meta.pagination.nextPage,
            message
          ).to.equal(nextPage + 1);
        } else {
          expect(
            epSdkEventApiProductAndVersionListResponse.meta.pagination.nextPage,
            message
          ).to.be.undefined;
        }
        for (const epSdkEventApiProductAndVersion of epSdkEventApiProductAndVersionList) {
          expect(
            epSdkEventApiProductAndVersion.eventApiProductVersion.version,
            TestLogger.createApiTestFailMessage("wrong version")
          ).to.equal(EventApiProductVersionString_2);
        }
        // // DEBUG
        // expect(false, message).to.be.true;
        nextPage =
          epSdkEventApiProductAndVersionListResponse.meta.pagination.nextPage;
      }
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should get complete list of latest event api product versions for any application domain`, async () => {
    try {
      const epSdkEventApiProductAndVersionListResponse: EpSdkEventApiProductAndVersionListResponse =
        await EpSdkEventApiProductVersionsService.listLatestVersions({
          applicationDomainIds: ApplicationDomainIdList,
          shared: true,
          pageNumber: 1,
          pageSize: 100,
        });
      const epSdkEventApiProductAndVersionList: EpSdkEventApiProductAndVersionList =
        epSdkEventApiProductAndVersionListResponse.data;
      expect(
        epSdkEventApiProductAndVersionList.length,
        TestLogger.createApiTestFailMessage("no versions found")
      ).to.be.greaterThan(0);
      // DEBUG
      // const message = TestLogger.createLogMessage('epSdkEventApiProductAndVersionList', epSdkEventApiProductAndVersionList);
      // TestLogger.logMessageWithId(message);
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should not find latest version of for all event api products - non-existing stateIds`, async () => {
    try {
      const eventApiProductsResponse: EventApiProductsResponse =
        await EpSdkEventApiProductsService.listAll({
          applicationDomainIds: ApplicationDomainIdList,
          shared: EventApiProductShared,
        });
      let message = `eventApiProductsResponse=\n${JSON.stringify(
        eventApiProductsResponse,
        null,
        2
      )}`;
      expect(eventApiProductsResponse.data, message).to.not.be.undefined;
      expect(eventApiProductsResponse.data.length, message).to.equal(
        NumApplicationDomains
      );
      for (const eventApiProduct of eventApiProductsResponse.data) {
        // should not find any because of state id

        const eventApiProductVersionList: Array<EventApiProductVersion> =
          await EpSdkEventApiProductVersionsService.getVersionsForEventApiProductId(
            {
              eventApiProductId: eventApiProduct.id,
              stateIds: [
                EpSdkStatesService.deprecatedId,
                EpSdkStatesService.retiredId,
              ],
            }
          );
        expect(
          eventApiProductVersionList.length,
          `eventApiProductVersionList=\n${JSON.stringify(
            eventApiProductVersionList,
            null,
            2
          )}`
        ).to.equal(0);

        const empty_EpSdkEventApiProductAndVersionResponse: EpSdkEventApiProductAndVersionResponse =
          await EpSdkEventApiProductVersionsService.getObjectAndVersionForEventApiProductId(
            {
              eventApiProductId: eventApiProduct.id,
              stateIds: [
                EpSdkStatesService.deprecatedId,
                EpSdkStatesService.retiredId,
              ],
            }
          );
        expect(
          empty_EpSdkEventApiProductAndVersionResponse,
          `empty_EpSdkEventApiProductAndVersionResponse=\n${JSON.stringify(
            empty_EpSdkEventApiProductAndVersionResponse,
            null,
            2
          )}`
        ).to.be.undefined;
      }
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should get the latest version of for all event api products`, async () => {
    try {
      const eventApiProductsResponse: EventApiProductsResponse =
        await EpSdkEventApiProductsService.listAll({
          applicationDomainIds: ApplicationDomainIdList,
          shared: EventApiProductShared,
        });
      let message = `eventApiProductsResponse=\n${JSON.stringify(
        eventApiProductsResponse,
        null,
        2
      )}`;
      expect(eventApiProductsResponse.data, message).to.not.be.undefined;
      expect(eventApiProductsResponse.data.length, message).to.equal(
        NumApplicationDomains
      );
      for (const eventApiProduct of eventApiProductsResponse.data) {
        // get the latest version for each event api product
        const latest_EpSdkEventApiProductAndVersionResponse: EpSdkEventApiProductAndVersionResponse =
          await EpSdkEventApiProductVersionsService.getObjectAndVersionForEventApiProductId(
            {
              eventApiProductId: eventApiProduct.id,
              stateIds: [
                EpSdkStatesService.draftId,
                EpSdkStatesService.deprecatedId,
                EpSdkStatesService.retiredId,
              ],
            }
          );
        message = `latest_EpSdkEventApiProductAndVersionResponse=\n${JSON.stringify(
          latest_EpSdkEventApiProductAndVersionResponse,
          null,
          2
        )}`;
        expect(
          latest_EpSdkEventApiProductAndVersionResponse.eventApiProduct.id,
          message
        ).to.equal(eventApiProduct.id);
        expect(
          latest_EpSdkEventApiProductAndVersionResponse.eventApiProductVersion
            .stateId,
          message
        ).to.equal(EpSdkStatesService.draftId);
        expect(
          latest_EpSdkEventApiProductAndVersionResponse.eventApiProductVersion
            .version,
          message
        ).to.equal(EventApiProductVersionString_2);
        expect(
          JSON.stringify(
            latest_EpSdkEventApiProductAndVersionResponse.meta.versionStringList
          ),
          message
        ).to.include(EventApiProductVersionString_1);
        expect(
          JSON.stringify(
            latest_EpSdkEventApiProductAndVersionResponse.meta.versionStringList
          ),
          message
        ).to.include(EventApiProductVersionString_2);
        // latest does not have messaging services
        expect(
          latest_EpSdkEventApiProductAndVersionResponse.messagingServices,
          "latest_EpSdkEventApiProductAndVersionResponse.messagingServices"
        ).to.be.undefined;

        // get the version 1 for each event api product
        const version1_EpSdkEventApiProductAndVersionResponse: EpSdkEventApiProductAndVersionResponse =
          await EpSdkEventApiProductVersionsService.getObjectAndVersionForEventApiProductId(
            {
              eventApiProductId: eventApiProduct.id,
              stateIds: undefined,
              versionString: EventApiProductVersionString_1,
            }
          );
        message = `version1_EpSdkEventApiProductAndVersionResponse=\n${JSON.stringify(
          version1_EpSdkEventApiProductAndVersionResponse,
          null,
          2
        )}`;
        expect(
          version1_EpSdkEventApiProductAndVersionResponse.eventApiProduct.id,
          message
        ).to.equal(eventApiProduct.id);
        expect(
          version1_EpSdkEventApiProductAndVersionResponse.eventApiProductVersion
            .version,
          message
        ).to.equal(EventApiProductVersionString_1);
        expect(
          JSON.stringify(
            version1_EpSdkEventApiProductAndVersionResponse.meta
              .versionStringList
          ),
          message
        ).to.include(EventApiProductVersionString_1);
        expect(
          JSON.stringify(
            version1_EpSdkEventApiProductAndVersionResponse.meta
              .versionStringList
          ),
          message
        ).to.include(EventApiProductVersionString_2);
        // version 1 has 1 messaging service
        expect(
          version1_EpSdkEventApiProductAndVersionResponse.messagingServices,
          "version1_EpSdkEventApiProductAndVersionResponse.messagingServices"
        ).not.to.be.undefined;
        expect(
          version1_EpSdkEventApiProductAndVersionResponse.messagingServices
            .length,
          "version1_EpSdkEventApiProductAndVersionResponse.messagingServices.length"
        ).to.equal(1);
      }
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should get filtered list of versions of for all event api products`, async () => {
    try {
      const eventApiProductsResponse: EventApiProductsResponse =
        await EpSdkEventApiProductsService.listAll({
          applicationDomainIds: ApplicationDomainIdList,
          shared: EventApiProductShared,
        });
      let message = `eventApiProductsResponse=\n${JSON.stringify(
        eventApiProductsResponse,
        null,
        2
      )}`;
      expect(eventApiProductsResponse.data, message).to.not.be.undefined;
      expect(eventApiProductsResponse.data.length, message).to.equal(
        NumApplicationDomains
      );
      for (const eventApiProduct of eventApiProductsResponse.data) {
        // no filters
        const eventApiProductVersionList_NoFilters: Array<EventApiProductVersion> =
          await EpSdkEventApiProductVersionsService.getVersionsForEventApiProductId(
            {
              eventApiProductId: eventApiProduct.id,
              stateIds: undefined,
              withAtLeastOnePlan: false,
              withAtLeastOneAMessagingService: false,
            }
          );
        expect(
          eventApiProductVersionList_NoFilters.length,
          `length mismatch, eventApiProductVersionList_NoFilters=${JSON.stringify(
            eventApiProductVersionList_NoFilters,
            null,
            2
          )}`
        ).to.equal(2);
        // both filters
        const eventApiProductVersionList_BothFilters: Array<EventApiProductVersion> =
          await EpSdkEventApiProductVersionsService.getVersionsForEventApiProductId(
            {
              eventApiProductId: eventApiProduct.id,
              stateIds: undefined,
              withAtLeastOnePlan: true,
              withAtLeastOneAMessagingService: true,
            }
          );
        expect(
          eventApiProductVersionList_BothFilters.length,
          `length mismatch, eventApiProductVersionList_BothFilters=${JSON.stringify(
            eventApiProductVersionList_BothFilters,
            null,
            2
          )}`
        ).to.equal(1);
      }
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should filter by at least one plan`, async () => {
    try {
      const eventApiProductsResponse: EventApiProductsResponse =
        await EpSdkEventApiProductsService.listAll({
          applicationDomainIds: ApplicationDomainIdList,
          shared: EventApiProductShared,
        });
      let message = `eventApiProductsResponse=\n${JSON.stringify(
        eventApiProductsResponse,
        null,
        2
      )}`;
      expect(eventApiProductsResponse.data, message).to.not.be.undefined;
      expect(eventApiProductsResponse.data.length, message).to.equal(
        NumApplicationDomains
      );
      for (const eventApiProduct of eventApiProductsResponse.data) {
        // filter by plan
        const eventApiProductVersionList_PlanFilter: Array<EventApiProductVersion> =
          await EpSdkEventApiProductVersionsService.getVersionsForEventApiProductId(
            {
              eventApiProductId: eventApiProduct.id,
              stateIds: undefined,
              withAtLeastOnePlan: true,
              withAtLeastOneAMessagingService: false,
            }
          );
        expect(
          eventApiProductVersionList_PlanFilter.length,
          `length mismatch, eventApiProductVersionList_PlanFilter=${JSON.stringify(
            eventApiProductVersionList_PlanFilter,
            null,
            2
          )}`
        ).to.equal(1);
        // filter by messaging service
        const eventApiProductVersionList_MessagingServiceFilter: Array<EventApiProductVersion> =
          await EpSdkEventApiProductVersionsService.getVersionsForEventApiProductId(
            {
              eventApiProductId: eventApiProduct.id,
              stateIds: undefined,
              withAtLeastOnePlan: false,
              withAtLeastOneAMessagingService: true,
            }
          );
        expect(
          eventApiProductVersionList_MessagingServiceFilter.length,
          `length mismatch, eventApiProductVersionList_MessagingServiceFilter=${JSON.stringify(
            eventApiProductVersionList_MessagingServiceFilter,
            null,
            2
          )}`
        ).to.equal(1);
      }
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should create event api product for attributes`, async () => {
    try {
      const eventApiProductResponse: EventApiProductResponse =
        await EventApiProductsService.createEventApiProduct({
          requestBody: {
            applicationDomainId: ApplicationDomainId,
            name: EventApiProductName,
            brokerType: EventApiProduct.brokerType.SOLACE,
            shared: EventApiProductShared,
          },
        });
      EventApiProductId = eventApiProductResponse.data.id;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should set custom attributes on event api product`, async () => {
    try {
      const eventApiProduct: EventApiProduct = await EpSdkEventApiProductsService.setCustomAttributes({
        eventApiProductId: EventApiProductId,
        epSdkCustomAttributes: CustomAttributeList,
      });
      expect(eventApiProduct.customAttributes).to.not.be.undefined;
      if (eventApiProduct.customAttributes === undefined) throw new Error("eventApiProduct.customAttributes === undefined");
      for (const customAttribute of CustomAttributeList) {
        const found = eventApiProduct.customAttributes.find((x) => { return x.customAttributeDefinitionName === customAttribute.name;});
        expect(found).to.not.be.undefined;
        expect(found.value).to.equal(customAttribute.value);
      }
      // // DEBUG
      // expect(false, `application.customAttributes=${JSON.stringify(application.customAttributes, null, 2)}`).to.be.true;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should set custom attributes on event api product: idempotency`, async () => {
    try {
      const eventApiProduct: EventApiProduct = await EpSdkEventApiProductsService.setCustomAttributes({
        eventApiProductId: EventApiProductId,
        epSdkCustomAttributes: CustomAttributeList,
      });
      expect(eventApiProduct.customAttributes).to.not.be.undefined;
      if (eventApiProduct.customAttributes === undefined) throw new Error("eventApiProduct.customAttributes === undefined");
      for (const customAttribute of CustomAttributeList) {
        const found = eventApiProduct.customAttributes.find((x) => { return x.customAttributeDefinitionName === customAttribute.name;});
        expect(found).to.not.be.undefined;
        expect(found.value).to.equal(customAttribute.value);
      }
      // // DEBUG
      // expect(false, `application.customAttributes=${JSON.stringify(application.customAttributes, null, 2)}`).to.be.true;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should set additional custom attributes on eventApiProduct leaving original attributes as-is`, async () => {
    try {
      const eventApiProduct: EventApiProduct = await EpSdkEventApiProductsService.setCustomAttributes({
        eventApiProductId: EventApiProductId,
        epSdkCustomAttributes: AdditionalCustomAttributeList,
      });
      expect(eventApiProduct.customAttributes).to.not.be.undefined;
      if (eventApiProduct.customAttributes === undefined) throw new Error("eventApiProduct.customAttributes === undefined");
      expect(eventApiProduct.customAttributes.length, `wrong number of attributes`).to.equal(AdditionalCustomAttributeList.length + CustomAttributeList.length);
      for (const customAttribute of CustomAttributeList) {
        const found = eventApiProduct.customAttributes.find((x) => { return x.customAttributeDefinitionName === customAttribute.name; });
        expect(found).to.not.be.undefined;
        expect(found.value).to.equal(customAttribute.value);
      }
      for (const customAttribute of AdditionalCustomAttributeList) {
        const found = eventApiProduct.customAttributes.find((x) => { return x.customAttributeDefinitionName === customAttribute.name; });
        expect(found).to.not.be.undefined;
        expect(found.value).to.equal(customAttribute.value);
      }
      // // DEBUG
      // expect(false, `application.customAttributes=${JSON.stringify(application.customAttributes, null, 2)}`).to.be.true;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)) .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should unset additional custom attributes on eventApiPrduct leaving only original attributes`, async () => {
    try {
      const eventApiProduct: EventApiProduct = await EpSdkEventApiProductsService.unsetCustomAttributes({
        eventApiProductId: EventApiProductId,
        epSdkCustomAttributes: AdditionalCustomAttributeList,
      });
      expect(eventApiProduct.customAttributes).to.not.be.undefined;
      if (eventApiProduct.customAttributes === undefined) throw new Error("eventApiProduct.customAttributes === undefined");
      expect(eventApiProduct.customAttributes.length, `wrong number of attributes`).to.equal(CustomAttributeList.length);
      for (const customAttribute of CustomAttributeList) {
        const found = eventApiProduct.customAttributes.find((x) => { return x.customAttributeDefinitionName === customAttribute.name; });
        expect(found).to.not.be.undefined;
        expect(found.value).to.equal(customAttribute.value);
      }
      for (const customAttribute of AdditionalCustomAttributeList) {
        const found = eventApiProduct.customAttributes.find((x) => { return x.customAttributeDefinitionName === customAttribute.name; });
        expect(found).to.be.undefined;
      }
      // // DEBUG
      // expect(false, `application.customAttributes=${JSON.stringify(application.customAttributes, null, 2)}`).to.be.true;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });
});
