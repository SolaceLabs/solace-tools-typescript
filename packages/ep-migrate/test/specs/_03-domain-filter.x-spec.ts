import 'mocha';
import { expect } from 'chai';
import path from 'path';
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

describe(`${scriptName}`, () => {

  const applicationDomainNames: string[] = ['Acme Rideshare', 'Nils Rideshare'];
  let applicationDomainPrefix: string | undefined = undefined;

  before(async() => {
    TestContext.newItId();
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

});
