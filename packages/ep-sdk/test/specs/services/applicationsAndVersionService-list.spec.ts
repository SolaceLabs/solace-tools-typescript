import "mocha";
import { expect } from "chai";
import path from "path";
import {
  ApiError,
  ApplicationDomainResponse,
  ApplicationDomainsService,
  ApplicationsService,
  Application,
  ApplicationResponse,
  ApplicationsResponse,
} from "@solace-labs/ep-openapi-node";
import { TestContext, TestUtils } from "@internal/tools/src";
import { TestLogger, TestConfig, TestHelpers } from "../../lib";
import {
  EpSdkError,
  EpSdkApplicationDomainsService,
  EpSdkApplicationsService,
  EpSdkApplicationVersionsService,
  EpSdkApplicationAndVersionListResponse,
  EpSdkApplicationAndVersionList,
  EpSdkApplicationAndVersionResponse,
} from "../../../src";

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = "appsAndVersionService-list";
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

let ApplicationName: string;
const ApplicationVersionString_1 = "1.0.0";
const ApplicationVersionString_2 = "1.1.0";

const initializeGlobals = () => {
  ApplicationName = `${TestConfig.getAppId()}-${TestSpecName}`;
};

describe(`${scriptName}`, () => {
  before(async () => {
    TestContext.newItId();
    initializeGlobals();
    // create all application domains
    const applicationDomainNameList = getApplicationDomainNameList();
    for (const applicationDomainName of applicationDomainNameList) {
      const xvoid: void = await TestHelpers.applicationDomainAbsent({
        applicationDomainName: applicationDomainName,
      });
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
  });

  it(`${scriptName}: should create application & two versions in every application domain`, async () => {
    try {
      for (const applicationDomainId of ApplicationDomainIdList) {
        // create the application
        const applicationResponse: ApplicationResponse =
          await ApplicationsService.createApplication({
            requestBody: {
              applicationDomainId: applicationDomainId,
              name: ApplicationName,
              applicationType: "standard",
              brokerType: Application.brokerType.SOLACE,
            },
          });
        const applicationId = applicationResponse.data.id;
        // create version 1
        const version1 = await ApplicationsService.createApplicationVersion({
          requestBody: {
            applicationId: applicationId,
            version: ApplicationVersionString_1,
          },
        });
        // create version 2
        const version2 = await ApplicationsService.createApplicationVersion({
          requestBody: {
            applicationId: applicationId,
            version: ApplicationVersionString_2,
          },
        });
      }
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed", e)).to.be
          .true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should get complete list of applications for application domains`, async () => {
    try {
      const applicationsResponse: ApplicationsResponse =
        await EpSdkApplicationsService.listAll({
          applicationDomainIds: ApplicationDomainIdList,
        });
      expect(
        applicationsResponse.data.length,
        TestLogger.createApiTestFailMessage("applicationsResponse.data.length")
      ).to.equal(NumApplicationDomains);
      expect(
        applicationsResponse.meta.pagination.count,
        TestLogger.createApiTestFailMessage(
          "applicationsResponse.meta.pagination.count"
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

  it(`${scriptName}: should get complete list of applications for all application domains`, async () => {
    try {
      const applicationsResponse: ApplicationsResponse =
        await EpSdkApplicationsService.listAll({});
      expect(
        applicationsResponse.data.length,
        TestLogger.createApiTestFailMessage("applicationsResponse.data.length")
      ).to.be.greaterThanOrEqual(NumApplicationDomains);
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should get complete list of latest application versions`, async () => {
    try {
      const epSdkApplicationAndVersionListResponse: EpSdkApplicationAndVersionListResponse =
        await EpSdkApplicationVersionsService.listLatestVersions({
          applicationDomainIds: ApplicationDomainIdList,
          pageNumber: 1,
          pageSize: 100,
        });
      const epSdkApplicationAndVersionList: EpSdkApplicationAndVersionList =
        epSdkApplicationAndVersionListResponse.data;

      const message = `epSdkApplicationAndVersionList=\n${JSON.stringify(
        epSdkApplicationAndVersionList,
        null,
        2
      )}`;
      expect(epSdkApplicationAndVersionList.length, message).to.equal(
        NumApplicationDomains
      );
      expect(
        epSdkApplicationAndVersionListResponse.meta.pagination.count,
        message
      ).to.equal(NumApplicationDomains);
      for (const epSdkApplicationAndVersion of epSdkApplicationAndVersionList) {
        expect(
          epSdkApplicationAndVersion.applicationVersion.version,
          TestLogger.createApiTestFailMessage("wrong version")
        ).to.equal(ApplicationVersionString_2);
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

  it(`${scriptName}: should test paging of latest application versions`, async () => {
    const PageSize = 1;
    let nextPage: number | undefined | null = 1;
    try {
      while (nextPage !== undefined && nextPage !== null) {
        const epSdkApplicationAndVersionListResponse: EpSdkApplicationAndVersionListResponse =
          await EpSdkApplicationVersionsService.listLatestVersions({
            applicationDomainIds: ApplicationDomainIdList,
            pageNumber: nextPage,
            pageSize: PageSize,
          });
        const epSdkApplicationAndVersionList: EpSdkApplicationAndVersionList =
          epSdkApplicationAndVersionListResponse.data;

        const message = `epSdkApplicationAndVersionListResponse=\n${JSON.stringify(
          epSdkApplicationAndVersionListResponse,
          null,
          2
        )}`;
        expect(epSdkApplicationAndVersionList.length, message).to.equal(
          PageSize
        );
        expect(
          epSdkApplicationAndVersionListResponse.meta.pagination.count,
          message
        ).to.equal(NumApplicationDomains);
        if (nextPage < NumApplicationDomains) {
          expect(
            epSdkApplicationAndVersionListResponse.meta.pagination.nextPage,
            message
          ).to.equal(nextPage + 1);
        } else {
          expect(
            epSdkApplicationAndVersionListResponse.meta.pagination.nextPage,
            message
          ).to.be.undefined;
        }
        for (const epSdkApplicationAndVersion of epSdkApplicationAndVersionList) {
          expect(
            epSdkApplicationAndVersion.applicationVersion.version,
            TestLogger.createApiTestFailMessage("wrong version")
          ).to.equal(ApplicationVersionString_2);
        }
        nextPage =
          epSdkApplicationAndVersionListResponse.meta.pagination.nextPage;
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

  it(`${scriptName}: should get complete list of latest application versions for any application domain`, async () => {
    try {
      const epSdkApplicationAndVersionListResponse: EpSdkApplicationAndVersionListResponse =
        await EpSdkApplicationVersionsService.listLatestVersions({
          applicationDomainIds: ApplicationDomainIdList,
          pageNumber: 1,
          pageSize: 100,
        });
      const epSdkApplicationAndVersionList: EpSdkApplicationAndVersionList =
        epSdkApplicationAndVersionListResponse.data;

      expect(
        epSdkApplicationAndVersionList.length,
        TestLogger.createApiTestFailMessage("no versions found")
      ).to.be.greaterThan(0);
      // DEBUG
      // const message = TestLogger.createLogMessage('epSdkApplicationAndVersionList', epSdkApplicationAndVersionList);
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

  it(`${scriptName}: should get the latest version of for all applications`, async () => {
    try {
      const applicationsResponse: ApplicationsResponse =
        await EpSdkApplicationsService.listAll({
          applicationDomainIds: ApplicationDomainIdList,
        });
      let message = `applicationsResponse=\n${JSON.stringify(
        applicationsResponse,
        null,
        2
      )}`;
      expect(applicationsResponse.data, message).to.not.be.undefined;
      expect(applicationsResponse.data.length, message).to.equal(
        NumApplicationDomains
      );
      for (const application of applicationsResponse.data) {
        // get the latest object & version for each application
        const latest_EpSdkApplicationAndVersionResponse: EpSdkApplicationAndVersionResponse =
          await EpSdkApplicationVersionsService.getObjectAndVersionForApplicationId(
            {
              applicationId: application.id,
              stateId: undefined,
            }
          );
        message = `latest_EpSdkApplicationAndVersionResponse=\n${JSON.stringify(
          latest_EpSdkApplicationAndVersionResponse,
          null,
          2
        )}`;
        expect(
          latest_EpSdkApplicationAndVersionResponse.application.id,
          message
        ).to.equal(application.id);
        expect(
          latest_EpSdkApplicationAndVersionResponse.applicationVersion.version,
          message
        ).to.equal(ApplicationVersionString_2);
        expect(
          JSON.stringify(
            latest_EpSdkApplicationAndVersionResponse.meta.versionStringList
          ),
          message
        ).to.include(ApplicationVersionString_1);
        expect(
          JSON.stringify(
            latest_EpSdkApplicationAndVersionResponse.meta.versionStringList
          ),
          message
        ).to.include(ApplicationVersionString_2);
        // get the version 1 for each event object
        const version1_EpSdkApplicationAndVersionResponse: EpSdkApplicationAndVersionResponse =
          await EpSdkApplicationVersionsService.getObjectAndVersionForApplicationId(
            {
              applicationId: application.id,
              stateId: undefined,
              versionString: ApplicationVersionString_1,
            }
          );
        message = `version1_EpSdkApplicationAndVersionResponse=\n${JSON.stringify(
          version1_EpSdkApplicationAndVersionResponse,
          null,
          2
        )}`;
        expect(
          version1_EpSdkApplicationAndVersionResponse.application.id,
          message
        ).to.equal(application.id);
        expect(
          version1_EpSdkApplicationAndVersionResponse.applicationVersion
            .version,
          message
        ).to.equal(ApplicationVersionString_1);
        expect(
          JSON.stringify(
            version1_EpSdkApplicationAndVersionResponse.meta.versionStringList
          ),
          message
        ).to.include(ApplicationVersionString_1);
        expect(
          JSON.stringify(
            version1_EpSdkApplicationAndVersionResponse.meta.versionStringList
          ),
          message
        ).to.include(ApplicationVersionString_2);
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
});
