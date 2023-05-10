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
  Enum,
  EnumsResponse,
  EnumsService
} from '../../generated-src';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

describe(`${scriptName}`, () => {
    
    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: should list all enums`, async () => {
      try {
        const completeEnums: Array<Enum> = [];
        let nextPage: number | null = 1;
        while (nextPage !== null) {
          const enumsResponse: EnumsResponse = await EnumsService.list8({
            xContextId: 'xContextId',
            pageNumber: nextPage,
            pageSize: 10
          });
          if(enumsResponse.data) {
            completeEnums.push(...enumsResponse.data);
          }
          if(enumsResponse.meta) {
            const apiMeta = enumsResponse.meta as ApiMeta;
            nextPage = apiMeta.pagination.nextPage;
          } else {
            nextPage = null;
          }
        }
        // // DEBUG
        // expect(false, TestLogger.createLogMessage('completeEnums', completeEnums)).to.be.true;
      } catch(e) {
        expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
        expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
      }
    });

});

