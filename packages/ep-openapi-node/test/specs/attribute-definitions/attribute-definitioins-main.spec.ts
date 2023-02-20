import 'mocha';
import { expect } from 'chai';
import path from 'path';
import {
  TestContext,
  TestUtils
} from '@internal/tools/src';
import {
  TestLogger 
} from '../../lib';
import { 
  ApiError, 
  CustomAttributeDefinitionsService,
  CustomAttributeDefinitionResponse,
  CustomAttributeDefinition
} from '../../../generated-src';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const CustomAttribtuteDefinitionName = `attr-${TestUtils.getUUID()}`;
let CustomAttribtuteDefinitionId: string;

describe(`${scriptName}`, () => {
    
    beforeEach(() => {
      TestContext.newItId();
    });

    after(async() => {
      try {
        const xvoid: void = await CustomAttributeDefinitionsService.deleteCustomAttributeDefinition({
          xContextId: 'xContextId',
          id: CustomAttribtuteDefinitionId
        });
      } catch(e) {
        expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
        expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should create attribute definition`, async () => {
      try {
        const customAttributeDefinitionResponse: CustomAttributeDefinitionResponse = await CustomAttributeDefinitionsService.createCustomAttributeDefinition({
          xContextId: 'xContextId',
          requestBody: {
            name: CustomAttribtuteDefinitionName,
            valueType: CustomAttributeDefinition.valueType.STRING,
            associatedEntityTypes: ['event', 'eventVersion'],
            scope: CustomAttributeDefinition.scope.ORGANIZATION
          }
        });
        const data: CustomAttributeDefinition | undefined = customAttributeDefinitionResponse.data;
        expect(data, TestLogger.createApiTestFailMessage('failed')).to.not.be.undefined;
        expect(data.id, TestLogger.createApiTestFailMessage('failed')).to.not.be.undefined;
        CustomAttribtuteDefinitionId = data.id;
      } catch(e) {
        expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
        expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
      }
    });

});

