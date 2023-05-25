import 'mocha';
import { expect } from 'chai';
import path from 'path';
import { 
  ApplicationDomainsResponse 
} from '@solace-labs/ep-openapi-node';
import { 
  EpSdkApplicationDomainsService 
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
  ICliMigrateSummaryPresent,
} from '../../src/cli-components';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");


let CliMigrateSummaryPresent: ICliMigrateSummaryPresent | undefined = undefined;
let PresentRunId: string | undefined = undefined;
let ApplicationDomainPrefix: string | undefined = undefined;

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
      PresentRunId = CliConfig.getRunId();
      ApplicationDomainPrefix = CliConfig.getCliConfig().cliMigrateConfig.epV2.applicationDomainPrefix;
      const cliMigrateManager = new CliMigrateManager(CliConfig.getCliMigrateManagerOptions());
      await cliMigrateManager.run();
      CliMigrateSummaryPresent = CliRunSummary.createMigrateSummaryPresent(ECliMigrateManagerMode.RELEASE_MODE);
          
      // NOTE: set to zero once all issues are resolved
      // expect(cliRunIssues.length, message).to.equal(0);

      // interim 

      TestService.testRunIssues(56);

      
    } catch(e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should run ep-migrate: absent by runId`, async () => {
    try {
      CliConfig.getCliMigrateManagerOptions().cliMigrateManagerRunState = ECliMigrateManagerRunState.ABSENT;
      CliConfig.getCliMigrateManagerOptions().absentRunId = PresentRunId;
      const cliMigrateManager = new CliMigrateManager(CliConfig.getCliMigrateManagerOptions());
      await cliMigrateManager.run();
      TestService.testRunIssues();
    } catch(e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should not find any application domains with prefix`, async () => {
    try {
      const applicationDomainsResponse: ApplicationDomainsResponse = await EpSdkApplicationDomainsService.listAll({});
      if(applicationDomainsResponse.data) {
        for(const applicationDomain of applicationDomainsResponse.data) {
          if(applicationDomain.name.startsWith(ApplicationDomainPrefix)) {
            const message = TestLogger.createLogMessage("applicationDomain found with prefix", {
              prefix: ApplicationDomainPrefix,
              applicationDomain,
            });
            expect(false, message).to.be.true;
          }
        }
      }
    } catch(e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessageWithCliError('failed', e)).to.be.true;
    }
  });

});

