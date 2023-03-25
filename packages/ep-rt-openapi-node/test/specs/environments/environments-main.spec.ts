import 'mocha';
import { expect } from 'chai';
import path from 'path';
import {
  TestContext,
} from '@internal/tools/src';
import {
  TestLogger 
} from '../../lib';
import {
  ApiError, 
  Environment,
  EnvironmentResponse,
  EnvironmentsResponse,
  EnvironmentsService
} from '../../../generated-src';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

let EnvironmentId: string;

describe(`${scriptName}`, () => {
    
    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: should get a list of environments`, async () => {
      try {
        const environmentsResponse: EnvironmentsResponse = await EnvironmentsService.getEnvironments({});
        expect(environmentsResponse.data, TestLogger.createApiTestFailMessage('no environmets data')).to.not.be.undefined;
        expect(environmentsResponse.data.length, TestLogger.createApiTestFailMessage('environments.data.length')).to.be.greaterThan(0);
        expect(environmentsResponse.data[0].id, TestLogger.createApiTestFailMessage('environments.data[0].id')).to.not.be.undefined;
        EnvironmentId = environmentsResponse.data[0].id;
      } catch(e) {
        expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
        expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get single environment`, async () => {
      try {
        const environmentResponse: EnvironmentResponse = await EnvironmentsService.getEnvironment({ id: EnvironmentId });
        expect(environmentResponse.data, TestLogger.createApiTestFailMessage('environmentResponse.data')).to.not.be.undefined;
        const environment: Environment = environmentResponse.data;
        expect(environment.id, TestLogger.createApiTestFailMessage('environment.id')).to.equal(EnvironmentId);
        // // DEBUG
        // expect(false, `environment=${JSON.stringify(environment, null, 2)}`).to.be.true;
      } catch(e) {
        expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
        expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
      }
    });

});

