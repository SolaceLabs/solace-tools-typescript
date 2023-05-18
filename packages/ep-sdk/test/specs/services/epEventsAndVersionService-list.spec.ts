import "mocha";
import { expect } from "chai";
import path from "path";
import {
  ApiError,
  ApplicationDomainResponse,
  ApplicationDomainsService,
  EventsService,
  EventResponse,
  EventsResponse,
  CustomAttributeDefinition,
} from "@solace-labs/ep-openapi-node";
import { 
  TestContext, 
  TestUtils 
} from "@internal/tools/src";
import { 
  TestLogger, 
  TestConfig 
} from "../../lib";
import {
  EpSdkError,
  EpSdkEpEventsService,
  EpSdkApplicationDomainsService,
  EpSdkEpEventVersionsService,
  EpSdkEpEventAndVersionList,
  EpSdkEpEventAndVersionListResponse,
  EpSdkEpEventAndVersionResponse,
  EpSdkBrokerTypes,
  TEpSdkCustomAttribute,
  IEpSdkAttributesQuery,
  EEpSdkComparisonOps,
} from "../../../src";

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId: string = TestUtils.getUUID();
const NumApplicationDomains = 2;
const getApplicationDomainNameList = (): Array<string> => {
  const list: Array<string> = [];
  for (let i = 0; i < NumApplicationDomains; i++) {
    list.push(`${TestConfig.getAppId()}/${TestSpecName}/domain-${i}`);
  }
  return list;
};
let ApplicationDomainIdList: Array<string> = [];

let EventName: string;
const EventShared = true;
const EventVersionString_1 = "1.0.0";
const EventVersionString_2 = "1.1.0";

const EventAttribute: TEpSdkCustomAttribute = {
  name: `${TestSpecName}-attribute`,
  value: 'value',
  valueType: CustomAttributeDefinition.valueType.STRING,
  scope: CustomAttributeDefinition.scope.ORGANIZATION
};
const EventAttributesQuery: IEpSdkAttributesQuery = {
  AND: {
    queryList: [
      {
        attributeName: EventAttribute.name,
        comparisonOp: EEpSdkComparisonOps.IS_EQUAL,
        value: EventAttribute.value
      },
    ],
  }
};


const initializeGlobals = () => {
  EventName = `${TestConfig.getAppId()}-event-${TestSpecId}`;
};

describe(`${scriptName}`, () => {
  before(async () => {
    initializeGlobals();
    // create all application domains
    const applicationDomainNameList = getApplicationDomainNameList();
    for (const applicationDomainName of applicationDomainNameList) {
      const applicationDomainResponse: ApplicationDomainResponse =
        await ApplicationDomainsService.createApplicationDomain({
          requestBody: {
            name: applicationDomainName,
          },
        });
      ApplicationDomainIdList.push(applicationDomainResponse.data.id);
    }
  });

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async () => {
    TestContext.newItId();
    // delete all application domains
    for (const applicationDomainId of ApplicationDomainIdList) {
      await EpSdkApplicationDomainsService.deleteById({
        applicationDomainId: applicationDomainId,
      });
    }
    // delete attribute definition
    const xvoid: void = await EpSdkEpEventsService.removeAssociatedEntityTypeFromCustomAttributeDefinitions({
      customAttributeNames: [EventAttribute.name]
    });
  });

  it(`${scriptName}: should create event & two versions in every application domain`, async () => {
    try {
      for (const applicationDomainId of ApplicationDomainIdList) {
        // create the event
        const eventResponse: EventResponse = await EpSdkEpEventsService.createEvent({
          requestBody: {
            applicationDomainId: applicationDomainId,
            name: EventName,
            shared: EventShared,
            brokerType: EpSdkBrokerTypes.Solace,
          },
        });
        const eventId = eventResponse.data.id;
        // add the custom attribute
        const x = await EpSdkEpEventsService.setCustomAttributes({
          eventId: eventId,
          epSdkCustomAttributes: [EventAttribute]
        });
        // create version 1
        const version1 = await EventsService.createEventVersionForEvent({
          eventId: eventId,
          requestBody: {
            eventId: eventId,
            version: EventVersionString_1,
          },
        });
        // create version 2
        const version2 = await EventsService.createEventVersionForEvent({
          eventId: eventId,
          requestBody: {
            eventId: eventId,
            version: EventVersionString_2,
          },
        });
      }
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should get complete list of events`, async () => {
    try {
      const eventsResponse: EventsResponse = await EpSdkEpEventsService.listAll(
        {
          applicationDomainIds: ApplicationDomainIdList,
          shared: EventShared,
          brokerType: EpSdkBrokerTypes.Solace,
          attributesQuery: EventAttributesQuery
        }
      );
      expect(
        eventsResponse.data.length,
        TestLogger.createApiTestFailMessage("eventsResponse.data.length")
      ).to.equal(NumApplicationDomains);
      expect(
        eventsResponse.meta.pagination.count,
        TestLogger.createApiTestFailMessage(
          "eventsResponse.meta.pagination.count"
        )
      ).to.equal(NumApplicationDomains);
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should get complete list of latest event versions`, async () => {
    try {
      const epSdkEpEventAndVersionListResponse: EpSdkEpEventAndVersionListResponse =
        await EpSdkEpEventVersionsService.listLatestVersions({
          applicationDomainIds: ApplicationDomainIdList,
          shared: true,
          pageNumber: 1,
          pageSize: 100,
        });
      const epSdkEpEventAndVersionList: EpSdkEpEventAndVersionList =
        epSdkEpEventAndVersionListResponse.data;

      const message = `epSdkEpEventAndVersionList=\n${JSON.stringify(
        epSdkEpEventAndVersionList,
        null,
        2
      )}`;
      expect(epSdkEpEventAndVersionList.length, message).to.equal(
        NumApplicationDomains
      );
      expect(
        epSdkEpEventAndVersionListResponse.meta.pagination.count,
        message
      ).to.equal(NumApplicationDomains);
      for (const epSdkEpEventAndVersion of epSdkEpEventAndVersionList) {
        expect(
          epSdkEpEventAndVersion.eventVersion.version,
          TestLogger.createApiTestFailMessage("wrong version")
        ).to.equal(EventVersionString_2);
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

  it(`${scriptName}: should test paging of latest event versions`, async () => {
    const PageSize = 1;
    let nextPage: number | undefined | null = 1;
    try {
      while (nextPage !== undefined && nextPage !== null) {
        const epSdkEpEventAndVersionListResponse: EpSdkEpEventAndVersionListResponse =
          await EpSdkEpEventVersionsService.listLatestVersions({
            applicationDomainIds: ApplicationDomainIdList,
            shared: true,
            pageNumber: nextPage,
            pageSize: PageSize,
          });
        const epSdkEpEventAndVersionList: EpSdkEpEventAndVersionList =
          epSdkEpEventAndVersionListResponse.data;

        const message = `epSdkEpEventAndVersionListResponse=\n${JSON.stringify(
          epSdkEpEventAndVersionListResponse,
          null,
          2
        )}`;
        expect(epSdkEpEventAndVersionList.length, message).to.equal(PageSize);
        expect(
          epSdkEpEventAndVersionListResponse.meta.pagination.count,
          message
        ).to.equal(NumApplicationDomains);
        if (nextPage < NumApplicationDomains) {
          expect(
            epSdkEpEventAndVersionListResponse.meta.pagination.nextPage,
            message
          ).to.equal(nextPage + 1);
        } else {
          expect(
            epSdkEpEventAndVersionListResponse.meta.pagination.nextPage,
            message
          ).to.be.undefined;
        }
        for (const epSdkEpEventAndVersion of epSdkEpEventAndVersionList) {
          expect(
            epSdkEpEventAndVersion.eventVersion.version,
            TestLogger.createApiTestFailMessage("wrong version")
          ).to.equal(EventVersionString_2);
        }
        nextPage = epSdkEpEventAndVersionListResponse.meta.pagination.nextPage;
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

  it(`${scriptName}: should get complete list of latest event versions for any application domain`, async () => {
    try {
      const epSdkEpEventAndVersionListResponse: EpSdkEpEventAndVersionListResponse = await EpSdkEpEventVersionsService.listLatestVersions({
        applicationDomainIds: ApplicationDomainIdList,
        shared: true,
        pageNumber: 1,
        pageSize: 100,
      });
      const epSdkEpEventAndVersionList: EpSdkEpEventAndVersionList = epSdkEpEventAndVersionListResponse.data;
      expect(epSdkEpEventAndVersionList.length, TestLogger.createApiTestFailMessage("no versions found")).to.be.greaterThan(0);
      // DEBUG
      // const message = TestLogger.createLogMessage('epSdkEpEventAndVersionList', epSdkEpEventAndVersionList);
      // TestLogger.logMessageWithId(message);
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should get the latest version of for all events`, async () => {
    try {
      const eventsResponse: EventsResponse = await EpSdkEpEventsService.listAll({
        applicationDomainIds: ApplicationDomainIdList,
        shared: EventShared,
      });
      let message = `eventsResponse=\n${JSON.stringify(eventsResponse, null, 2 )}`;
      expect(eventsResponse.data, message).to.not.be.undefined;
      expect(eventsResponse.data.length, message).to.equal(NumApplicationDomains);
      for (const epEvent of eventsResponse.data) {
        // get the latest object & version for each event
        const latest_EpSdkEpEventAndVersionResponse: EpSdkEpEventAndVersionResponse = await EpSdkEpEventVersionsService.getObjectAndVersionForEventId({
          eventId: epEvent.id,
          stateIds: undefined,
        });
        message = `latest_EpSdkEpEventAndVersionResponse=\n${JSON.stringify(latest_EpSdkEpEventAndVersionResponse, null, 2)}`;
        expect(latest_EpSdkEpEventAndVersionResponse.event.id, message).to.equal(epEvent.id);
        expect(latest_EpSdkEpEventAndVersionResponse.eventVersion.version, message).to.equal(EventVersionString_2);
        expect(JSON.stringify(latest_EpSdkEpEventAndVersionResponse.meta.versionStringList), message).to.include(EventVersionString_1);
        expect(JSON.stringify(latest_EpSdkEpEventAndVersionResponse.meta.versionStringList), message).to.include(EventVersionString_2);
        // get the version 1 for each event object
        const version1_EpSdkEpEventAndVersionResponse: EpSdkEpEventAndVersionResponse = await EpSdkEpEventVersionsService.getObjectAndVersionForEventId({
          eventId: epEvent.id,
          stateIds: undefined,
          versionString: EventVersionString_1,
        });
        message = `version1_EpSdkEpEventAndVersionResponse=\n${JSON.stringify(version1_EpSdkEpEventAndVersionResponse, null, 2)}`;
        expect(version1_EpSdkEpEventAndVersionResponse.event.id, message).to.equal(epEvent.id);
        expect(version1_EpSdkEpEventAndVersionResponse.eventVersion.version, message).to.equal(EventVersionString_1);
        expect(JSON.stringify(version1_EpSdkEpEventAndVersionResponse.meta.versionStringList), message).to.include(EventVersionString_1);
        expect(JSON.stringify(version1_EpSdkEpEventAndVersionResponse.meta.versionStringList), message).to.include(EventVersionString_2);
      }
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });
});
