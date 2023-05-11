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
  ICliMigrateSummary
} from '../../src/cli-components';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const initializeGlobals = () => {
  // set test specific cli options
  // CliConfig.getCliImporterManagerOptions().asyncApiFileList = FileList;
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

  it(`${scriptName}: should run ep-migrate`, async () => {
    try {
      const cliMigrateManager = new CliMigrateManager(CliConfig.getCliMigrateManagerOptions());
      await cliMigrateManager.run();
    } catch(e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should run ep-migrate: idempotency`, async () => {
    try {
      const cliMigrateManager = new CliMigrateManager(CliConfig.getCliMigrateManagerOptions());
      await cliMigrateManager.run();
      const cliMigrateSummary: ICliMigrateSummary = CliRunSummary.createMigrateSummary(ECliMigrateManagerMode.RELEASE_MODE);
      expect(cliMigrateSummary.createdEpV2ApplicationDomains, TestLogger.createLogMessage('createdEpV2ApplicationDomains', cliMigrateSummary)).to.equal(0);
      expect(cliMigrateSummary.updatedEpV2ApplicationDomains, TestLogger.createLogMessage('updatedEpV2ApplicationDomains', cliMigrateSummary)).to.equal(0);
      expect(cliMigrateSummary.createdNewEpV2EnumVersions, TestLogger.createLogMessage('createdNewEpV2EnumVersions', cliMigrateSummary)).to.equal(0);      
      expect(cliMigrateSummary.createdFirstEpV2EnumVersions, TestLogger.createLogMessage('createdFirstEpV2EnumVersions', cliMigrateSummary)).to.equal(0);      
      expect(cliMigrateSummary.createdNewEpV2SchemaVersions, TestLogger.createLogMessage('createdNewEpV2SchemaVersions', cliMigrateSummary)).to.equal(0);      
      expect(cliMigrateSummary.createdFirstEpV2SchemaVersions, TestLogger.createLogMessage('createdFirstEpV2SchemaVersions', cliMigrateSummary)).to.equal(0);      
    } catch(e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError('failed', e)).to.be.true;
    }
  });

});

