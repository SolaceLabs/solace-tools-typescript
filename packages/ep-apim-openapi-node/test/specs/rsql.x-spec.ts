import 'mocha';
import { expect } from 'chai';
import { emit } from "@rsql/emitter";
import path from 'path';
import {
  TestContext,
} from '@internal/tools/src';
import { 
  TestLogger,
  TestConfig,
  EpSdkRsqlQueryBuilder,
} from '../lib';
import {
  ApiError, 
  EventApiProduct, 
  EventApiProductHistoryResponse, 
  EventApiProductResponse, 
  EventApiProductsResponse, 
  EventApiProductsService,
  EventApiProductState,
  EventApiProductSummary,
  MessagingServiceProtocol,
} from '../../generated-src';
import { TestHelpers } from '../lib/TestHelpers';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

// const ApplicationDomainName = `${TestConfig.getAppId()}/ep-openapi/${TestUtils.getUUID()}`;
// let ApplicationDomainId: string;
const PublishDestiationsAttributeName = 'PUBLISH_DESTINATIONS';
const PublishDestinationValue = 'TEST_APIM_API';

const EventApiProductList: Array<EventApiProduct> = [];

describe(`${scriptName}`, () => {
    
    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: should search for each event api product using rsql - 1`, async () => {
      try {
        const attributeQueryAst = EpSdkRsqlQueryBuilder.customAttributeContains(PublishDestiationsAttributeName, PublishDestinationValue);
        const name = 'solaceMessagingServices.supportedProtocols';
        const smfQueryAst = EpSdkRsqlQueryBuilder.eq(name, 'smf');
        const smfSecureQueryAst = EpSdkRsqlQueryBuilder.eq(name, 'smfs');
        const queryAst = EpSdkRsqlQueryBuilder.and(
          attributeQueryAst,
          EpSdkRsqlQueryBuilder.or(
            smfQueryAst,
            smfSecureQueryAst
          )
        );
        const query = emit(queryAst);
        const eventApiProductsResponse: EventApiProductsResponse = await EventApiProductsService.listEventApiProducts({
          xContextId: 'xContextId',
          where: query
        });
        // DEBUG
        // expect(false, TestLogger.createApiTestFailMessage('testing sql query')).to.be.true;
      } catch(e) {
        expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
        expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
      }
    });

});

