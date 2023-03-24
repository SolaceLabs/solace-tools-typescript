import 'mocha';
import { expect } from 'chai';
import path from 'path';
import { 
  TestContext,
} from "@internal/tools/src";
import { 
  TestLogger,
} from '../lib';
import { 
  CliConfig,
  CliConfigInvalidConfigCombinationError,
  CliError,
  CliImporterManager, 
  ECliAssetsApplicationDomainEnforcementPolicies
} from '../../src/cli-components';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

describe(`${scriptName}`, () => {
    
  beforeEach(() => {
    TestContext.newItId();
  });

  it(`${scriptName}: should report correct error for policy=true, set-up-test-domains=false`, async () => {
    try {
      CliConfig.getCliImporterManagerOptions().cliTestSetupDomainsForApis = false;
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliAssetsApplicationDomainEnforcementPolicy = ECliAssetsApplicationDomainEnforcementPolicies.STRICT;
      CliConfig.validateConfig();
      expect(false, 'should never get here').to.be.true;
    } catch(e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(e instanceof CliConfigInvalidConfigCombinationError).to.be.true;
    }
  });

  it(`${scriptName}: should report correct error for no create selected`, async () => {
    try {
      CliConfig.getCliImporterManagerOptions().createApiEventApi = false;
      CliConfig.getCliImporterManagerOptions().createApiApplication = false;
      CliConfig.getCliImporterManagerOptions().cliImporterOptions.cliAssetsApplicationDomainEnforcementPolicy = ECliAssetsApplicationDomainEnforcementPolicies.OFF;
      CliConfig.validateConfig();
      expect(false, 'should never get here').to.be.true;
    } catch(e) {
      expect(e instanceof CliError, TestLogger.createNotCliErrorMesssage(e.message)).to.be.true;
      expect(e instanceof CliConfigInvalidConfigCombinationError).to.be.true;
    }
  });

});

