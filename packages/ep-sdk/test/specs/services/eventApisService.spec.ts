import "mocha";
import { expect } from "chai";
import path from "path";
import { TestContext, TestUtils } from "@internal/tools/src";
import { TestLogger, TestConfig } from "../../lib";
import {
  ApiError,
  ApplicationDomainResponse,
  ApplicationDomainsService,
  EventApIsService,
  EventApiResponse,
  EventApi,
} from "@solace-labs/ep-openapi-node";
import {
  EpSdkError,
  EpSdkServiceError,
  EpSdkApplicationDomainsService,
  EpSdkEventApisService,
} from "../../../src";

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId: string = TestUtils.getUUID();
let ApplicationDomainName: string;
let ApplicationDomainId: string | undefined;

let EventApiName: string;
let EventApiId: string | undefined;

const initializeGlobals = () => {
  ApplicationDomainName = `${TestConfig.getAppId()}/services/${TestSpecName}`;
  EventApiName = `${TestConfig.getAppId()}-services-${TestSpecName}`;
};

describe(`${scriptName}`, () => {
  before(async () => {
    initializeGlobals();
    TestContext.newItId();
    const applicationDomainResponse: ApplicationDomainResponse =
      await ApplicationDomainsService.createApplicationDomain({
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
    // delete application domain
    await EpSdkApplicationDomainsService.deleteById({
      applicationDomainId: ApplicationDomainId,
    });
  });

  it(`${scriptName}: should create eventApi`, async () => {
    try {
      const eventApiResponse: EventApiResponse =
        await EventApIsService.createEventApi({
          requestBody: {
            applicationDomainId: ApplicationDomainId,
            name: EventApiName,
            brokerType: EventApi.brokerType.SOLACE,
          },
        });
      EventApiId = eventApiResponse.data.id;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should get eventApi by name`, async () => {
    try {
      const eventApi: EventApi | undefined =
        await EpSdkEventApisService.getByName({
          applicationDomainId: ApplicationDomainId,
          eventApiName: EventApiName,
        });
      expect(
        eventApi,
        TestLogger.createApiTestFailMessage("eventApi === undefined")
      ).to.not.be.undefined;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should get eventApi by id`, async () => {
    try {
      const eventApi: EventApi | undefined =
        await EpSdkEventApisService.getById({
          applicationDomainId: ApplicationDomainId,
          eventApiId: EventApiId,
        });

      expect(eventApi.id, TestLogger.createApiTestFailMessage("failed")).to.eq(
        EventApiId
      );
      expect(
        eventApi.applicationDomainId,
        TestLogger.createApiTestFailMessage("failed")
      ).to.eq(ApplicationDomainId);
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should delete eventApi by id`, async () => {
    try {
      const eventApi: EventApi | undefined =
        await EpSdkEventApisService.deleteById({
          applicationDomainId: ApplicationDomainId,
          eventApiId: EventApiId,
        });
      expect(eventApi.id, TestLogger.createApiTestFailMessage("failed")).to.eq(
        EventApiId
      );
      expect(
        eventApi.applicationDomainId,
        TestLogger.createApiTestFailMessage("failed")
      ).to.eq(ApplicationDomainId);
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should create eventApi`, async () => {
    try {
      const eventApiResponse: EventApiResponse =
        await EventApIsService.createEventApi({
          requestBody: {
            applicationDomainId: ApplicationDomainId,
            name: EventApiName,
            brokerType: EventApi.brokerType.SOLACE,
          },
        });
      EventApiId = eventApiResponse.data.id;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should delete eventApi by name`, async () => {
    try {
      const eventApi: EventApi | undefined =
        await EpSdkEventApisService.deleteByName({
          applicationDomainId: ApplicationDomainId,
          eventApiName: EventApiName,
        });
      expect(
        eventApi.name,
        TestLogger.createApiTestFailMessage("failed")
      ).to.eq(EventApiName);
      expect(eventApi.id, TestLogger.createApiTestFailMessage("failed")).to.eq(
        EventApiId
      );
      expect(
        eventApi.applicationDomainId,
        TestLogger.createApiTestFailMessage("failed")
      ).to.eq(ApplicationDomainId);
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should catch delete eventApi by name that doesn't exist`, async () => {
    const NonExistentName = "non-existent";
    try {
      const eventApi: EventApi | undefined =
        await EpSdkEventApisService.deleteByName({
          applicationDomainId: ApplicationDomainId,
          eventApiName: NonExistentName,
        });
      expect(false, TestLogger.createApiTestFailMessage("must never get here"))
        .to.be.true;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(
        e instanceof EpSdkServiceError,
        TestLogger.createNotEpSdkErrorMessage(e)
      ).to.be.true;
      const epSdkServiceError: EpSdkServiceError = e;
      expect(
        epSdkServiceError.toString(),
        TestLogger.createApiTestFailMessage(
          `error does not contain ${NonExistentName}`
        )
      ).to.contain(NonExistentName);
    }
  });

  it(`${scriptName}: should catch delete eventApi by id that doesn't exist`, async () => {
    const NonExistentId = "non-existent";
    try {
      const eventApi: EventApi | undefined =
        await EpSdkEventApisService.deleteById({
          applicationDomainId: ApplicationDomainId,
          eventApiId: NonExistentId,
        });
      expect(false, TestLogger.createApiTestFailMessage("must never get here"))
        .to.be.true;
    } catch (e) {
      expect(
        e instanceof ApiError,
        TestLogger.createApiTestFailMessage("not ApiError")
      ).to.be.true;
      const apiError: ApiError = e;
      expect(
        apiError.status,
        TestLogger.createApiTestFailMessage("wrong status")
      ).to.eq(404);
    }
  });
});
