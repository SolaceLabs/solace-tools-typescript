import 'mocha';
import { expect } from 'chai';
import path from 'path';
import {
  TestContext,
} from '@internal/tools/src';
import {
  ApiMeta,
  TestLogger 
} from '../lib';
import {
  ApiError, 
  EventSchema,
  SchemasResponse,
  SchemasService
} from '../../generated-src';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

describe(`${scriptName}`, () => {
    
    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: should list all schemas`, async () => {
      try {
        const completeEventSchemas: Array<EventSchema> = [];
        let nextPage: number | null = 1;
        while (nextPage !== null) {
          const schemasResponse: SchemasResponse = await SchemasService.list2({
            xContextId: 'xContextId',
            pageNumber: nextPage,
            pageSize: 10
          });
          if(schemasResponse.data) {
            completeEventSchemas.push(...schemasResponse.data);
          }
          if(schemasResponse.meta) {
            const apiMeta = schemasResponse.meta as ApiMeta;
            nextPage = apiMeta.pagination.nextPage;
            // console.log(`enumsResponse.meta = ${JSON.stringify(enumsResponse.meta, null, 2)}`);
          } else {
            nextPage = null;
          }
        }
        // // DEBUG
        // expect(false, TestLogger.createLogMessage('completeEnums', completeEventSchemas)).to.be.true;
      } catch(e) {
        expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
        expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
      }
    });

});

