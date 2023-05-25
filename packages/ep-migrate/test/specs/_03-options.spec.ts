import 'mocha';
import { expect } from 'chai';
import path from 'path';
import {
  ApplicationDomainsResponse,
  EventMesh,
  EventMeshesResponse,
} from '@solace-labs/ep-openapi-node';
import {
  EventMeshesService,
} from '@solace-labs/ep-rt-openapi-node';
import {
  EpSdkApplicationAndVersion,
  EpSdkApplicationAndVersionListResponse,
  EpSdkApplicationDomainsService,
  EpSdkApplicationVersionsService,
  EpSdkEnvironmentsService,
  EpSdkMessagingService,
} from '@solace-labs/ep-sdk';
import { 
  TestContext,
} from "@internal/tools/src";
import { 
  TestLogger,
  TestService
} from '../lib';
import { 
  CliConfig,
  CliError,
  CliMigrateManager,
  CliRunSummary,
  ECliMigrateManagerMode,
  ECliMigrateManagerRunState,
  ICliMigrateSummaryPresent
} from '../../src/cli-components';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const applicationDomainNames: string[] = ['Acme Rideshare', 'Nils Rideshare'];

const environmentName: string = 'TEST_EP_MIGRATE/epV1';
const eventMeshName: string = 'TEST_EP_MIGRATE/epV1';
const eventBrokerName: string = 'TEST_EP_MIGRATE/epV1';

const getApplications = async(prefix: string): Promise<EpSdkApplicationAndVersion[]> => {
  const applicationDomainsResponse: ApplicationDomainsResponse = await EpSdkApplicationDomainsService.listAll({});
  const applicationDomainIds: Array<string> = [];
  if(applicationDomainsResponse.data) {
    for(const applicationDomain of applicationDomainsResponse.data) {
      if(applicationDomain.name.startsWith(prefix)) applicationDomainIds.push(applicationDomain.id);
    }
  }
  const epSdkApplicationAndVersionListResponse: EpSdkApplicationAndVersionListResponse = await EpSdkApplicationVersionsService.listLatestVersions({ applicationDomainIds });

  return epSdkApplicationAndVersionListResponse.data;
}

const getEventMesh = async({ eventMeshName, environmentId }:{
  eventMeshName: string;
  environmentId: string;
}): Promise<EventMesh | undefined> => {
  let eventMesh: EventMesh | undefined = undefined;
  let nextPage: number | undefined = 1;
  while(eventMesh === undefined && nextPage !== undefined) {
    const eventMeshesResponse: EventMeshesResponse = await EventMeshesService.getEventMeshes({ pageNumber: nextPage, environmentId });
    if(eventMeshesResponse.data && eventMeshesResponse.data.length > 0) {
      eventMesh = eventMeshesResponse.data.find( x => x.name === eventMeshName);
    }
    nextPage = eventMeshesResponse.meta?.pagination?.nextPage;
  }
  return eventMesh;
}

const getMessagingServiceId = async({ environmentName, eventMeshName, eventBrokerName }:{
  environmentName: string;
  eventMeshName: string;
  eventBrokerName: string;
}): Promise<string | undefined> => {
  const environment = await EpSdkEnvironmentsService.getByName({ environmentName });
  const eventMesh = await getEventMesh({ eventMeshName, environmentId: environment.id! });
  const messagingServices = await EpSdkMessagingService.listAll({});
  const messagingService = messagingServices.find( x => x.name === eventBrokerName && x.eventMeshId === eventMesh?.id );
  return messagingService?.id;
}

describe(`${scriptName}`, () => {

  let messagingServiceId: string | undefined = undefined;
  let applicationDomainPrefix: string | undefined = undefined;

  before(async() => {
    TestContext.newItId();
    messagingServiceId = await getMessagingServiceId({ environmentName, eventMeshName, eventBrokerName });
    applicationDomainPrefix = CliConfig.getCliConfig().cliMigrateConfig.epV2.applicationDomainPrefix;
    await TestService.absent_EpV2_PrefixedApplicationDomains(applicationDomainPrefix);
  });

  beforeEach(() => {
    TestContext.newItId();
    CliConfig.getCliMigrateManagerOptions().applicationDomains.epV1 = { applicationDomainNames: { include: applicationDomainNames }};
    CliConfig.getCliMigrateManagerOptions().applications.epV2.environment = undefined;
  });

  after(async() => {
    TestContext.newItId();
    await TestService.absent_EpV2_PrefixedApplicationDomains(applicationDomainPrefix);
  });

  it(`${scriptName}: should run ep-migrate: present: application domain whitelist`, async () => {
    try {
      CliConfig.getCliMigrateManagerOptions().cliMigrateManagerRunState = ECliMigrateManagerRunState.PRESENT;
      CliConfig.getCliMigrateManagerOptions().applicationDomains.epV1.applicationDomainNames.include = [applicationDomainNames[0]];
      const cliMigrateManager = new CliMigrateManager(CliConfig.getCliMigrateManagerOptions());
      await cliMigrateManager.run();
      const cliMigrateSummaryPresent: ICliMigrateSummaryPresent = CliRunSummary.createMigrateSummaryPresent(ECliMigrateManagerMode.RELEASE_MODE);
      expect(cliMigrateSummaryPresent.processedEpV1ApplicationDomains, TestLogger.createLogMessage('processedEpV1ApplicationDomains', cliMigrateSummaryPresent)).to.equal(1);
    } catch(e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should run ep-migrate: present: application domain blacklist`, async () => {
    try {
      CliConfig.getCliMigrateManagerOptions().cliMigrateManagerRunState = ECliMigrateManagerRunState.PRESENT;
      CliConfig.getCliMigrateManagerOptions().applicationDomains.epV1.applicationDomainNames.exclude = [applicationDomainNames[0]];
      const cliMigrateManager = new CliMigrateManager(CliConfig.getCliMigrateManagerOptions());
      await cliMigrateManager.run();
      const cliMigrateSummaryPresent: ICliMigrateSummaryPresent = CliRunSummary.createMigrateSummaryPresent(ECliMigrateManagerMode.RELEASE_MODE);
      expect(cliMigrateSummaryPresent.processedEpV1ApplicationDomains, TestLogger.createLogMessage('processedEpV1ApplicationDomains', cliMigrateSummaryPresent)).to.equal(applicationDomainNames.length - 1);
    } catch(e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should run ep-migrate: present: application evironment`, async () => {
    try {
      CliConfig.getCliMigrateManagerOptions().cliMigrateManagerRunState = ECliMigrateManagerRunState.PRESENT;
      CliConfig.getCliMigrateManagerOptions().applications.epV2.environment = { environmentName, eventMeshName, eventBrokerName };
      const cliMigrateManager = new CliMigrateManager(CliConfig.getCliMigrateManagerOptions());
      await cliMigrateManager.run();
      const applications = await getApplications(applicationDomainPrefix);
      for(const application of applications) {
        expect(application.applicationVersion.messagingServiceIds, TestLogger.createLogMessage('applicationVersion.messagingServiceIds', application)).to.contain(messagingServiceId);
      }
    } catch(e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError('failed', e)).to.be.true;
    }
  });

});

