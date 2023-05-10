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
  EventsResponse,
  EventsService,
  Event as EpEvent,
} from '../../generated-src';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

describe(`${scriptName}`, () => {
    
    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: should list all schemas`, async () => {
      try {
        const completeEpEvents: Array<EpEvent> = [];
        let nextPage: number | null = 1;
        while (nextPage !== null) {
          const eventsResponse: EventsResponse = await EventsService.list5({
            xContextId: 'xContextId',
            pageNumber: nextPage,
            pageSize: 10
          });
          if(eventsResponse.data) {
            completeEpEvents.push(...eventsResponse.data);
          }
          if(eventsResponse.meta) {
            const apiMeta = eventsResponse.meta as ApiMeta;
            nextPage = apiMeta.pagination.nextPage;
            // console.log(`enumsResponse.meta = ${JSON.stringify(enumsResponse.meta, null, 2)}`);
          } else {
            nextPage = null;
          }
        }
        // DEBUG
        // expect(false, TestLogger.createLogMessage('completeEpEvents', completeEpEvents)).to.be.true;
      } catch(e) {
        expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
        expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
      }
    });

});

