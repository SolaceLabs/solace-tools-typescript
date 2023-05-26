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
  ICliMigrateSummaryAbsent,
  ICliMigrateSummaryPresent
} from '../../src/cli-components';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");


let CliMigrateSummaryPresent: ICliMigrateSummaryPresent | undefined = undefined;

const initializeGlobals = () => {
  // set test specific cli options
}

describe(`${scriptName}`, () => {
    
  before(async() => {
    TestContext.newItId();
    initializeGlobals();
    await TestService.absent_EpV2_PrefixedApplicationDomains(CliConfig.getCliConfig().cliMigrateConfig.epV2.applicationDomainPrefix);
  });

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async() => {
    TestContext.newItId();
    await TestService.absent_EpV2_PrefixedApplicationDomains(CliConfig.getCliConfig().cliMigrateConfig.epV2.applicationDomainPrefix);
  });

  it(`${scriptName}: should run ep-migrate: present`, async () => {
    try {
      CliConfig.getCliMigrateManagerOptions().cliMigrateManagerRunState = ECliMigrateManagerRunState.PRESENT;
      const cliMigrateManager = new CliMigrateManager(CliConfig.getCliMigrateManagerOptions());
      await cliMigrateManager.run();
      CliMigrateSummaryPresent = CliRunSummary.createMigrateSummaryPresent(ECliMigrateManagerMode.RELEASE_MODE);

      // NOTE: set to zero once all issues are resolved
      // expect(cliRunIssues.length, message).to.equal(0);
      // interim 
      TestService.testRunIssues(7);

    } catch(e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should run ep-migrate: present: idempotency`, async () => {
    try {
      CliConfig.getCliMigrateManagerOptions().cliMigrateManagerRunState = ECliMigrateManagerRunState.PRESENT;
      const cliMigrateManager = new CliMigrateManager(CliConfig.getCliMigrateManagerOptions());
      await cliMigrateManager.run();
      const cliMigrateSummaryPresent: ICliMigrateSummaryPresent = CliRunSummary.createMigrateSummaryPresent(ECliMigrateManagerMode.RELEASE_MODE);
      expect(cliMigrateSummaryPresent.createdEpV2ApplicationDomains, TestLogger.createLogMessage('createdEpV2ApplicationDomains', cliMigrateSummaryPresent)).to.equal(0);
      expect(cliMigrateSummaryPresent.updatedEpV2ApplicationDomains, TestLogger.createLogMessage('updatedEpV2ApplicationDomains', cliMigrateSummaryPresent)).to.equal(0);
      expect(cliMigrateSummaryPresent.createdNewEpV2EnumVersions, TestLogger.createLogMessage('createdNewEpV2EnumVersions', cliMigrateSummaryPresent)).to.equal(0);      
      expect(cliMigrateSummaryPresent.createdFirstEpV2EnumVersions, TestLogger.createLogMessage('createdFirstEpV2EnumVersions', cliMigrateSummaryPresent)).to.equal(0);      
      expect(cliMigrateSummaryPresent.createdNewEpV2SchemaVersions, TestLogger.createLogMessage('createdNewEpV2SchemaVersions', cliMigrateSummaryPresent)).to.equal(0);      
      expect(cliMigrateSummaryPresent.createdFirstEpV2SchemaVersions, TestLogger.createLogMessage('createdFirstEpV2SchemaVersions', cliMigrateSummaryPresent)).to.equal(0);      
    } catch(e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should run ep-migrate: absent`, async () => {
    try {
      CliConfig.getCliMigrateManagerOptions().cliMigrateManagerRunState = ECliMigrateManagerRunState.ABSENT;
      const cliMigrateManager = new CliMigrateManager(CliConfig.getCliMigrateManagerOptions());
      await cliMigrateManager.run();
      const cliMigrateSummaryAbsent: ICliMigrateSummaryAbsent = CliRunSummary.createMigrateSummaryAbsent(ECliMigrateManagerMode.RELEASE_MODE);
      expect(cliMigrateSummaryAbsent.deletedEpV2ApplicationDomains, TestLogger.createLogMessage('deletedEpV2ApplicationDomains', {
        cliMigrateSummaryAbsent,
        CliMigrateSummaryPresent
      })).to.equal(CliMigrateSummaryPresent.createdEpV2ApplicationDomains + CliMigrateSummaryPresent.createdEpV2EnumApplicationDomains);
    } catch(e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should run ep-migrate: absent: idempotency`, async () => {
    try {
      CliConfig.getCliMigrateManagerOptions().cliMigrateManagerRunState = ECliMigrateManagerRunState.ABSENT;
      const cliMigrateManager = new CliMigrateManager(CliConfig.getCliMigrateManagerOptions());
      await cliMigrateManager.run();
      const cliMigrateSummaryAbsent: ICliMigrateSummaryAbsent = CliRunSummary.createMigrateSummaryAbsent(ECliMigrateManagerMode.RELEASE_MODE);
      expect(cliMigrateSummaryAbsent.deletedEpV2ApplicationDomains, TestLogger.createLogMessage('deletedEpV2ApplicationDomains', {
        cliMigrateSummaryAbsent,
        CliMigrateSummaryPresent
      })).to.equal(0);
    } catch(e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError('failed', e)).to.be.true;
    }
  });

});
