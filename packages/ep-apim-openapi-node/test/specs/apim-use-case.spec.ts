import 'mocha';
import { expect } from 'chai';
import path from 'path';
import builder from "@rsql/builder";
import { emit } from "@rsql/emitter";
import {
  TestContext,
} from '@internal/tools/src';
import {
  EpAsyncApiDocument,
  EpAsyncApiDocumentService,
  EpAsyncApiError,
} from "@solace-labs/ep-asyncapi";
import { 
  TestLogger,
  TestConfig,
} from '../lib';
import {
  ApiError, 
  BrokerType, 
  EventApiProduct, 
  EventApiProductResponse, 
  EventApiProductsResponse, 
  EventApiProductsService,
  EventApiProductState,
  GatewayResponse,
  GatewaysService,
  MessagingService,
} from '../../generated-src';
import { TestHelpers } from '../lib/TestHelpers';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const PublishDestiationsAttributeName = 'PUBLISH_DESTINATIONS';
const PublishDestinationValue = 'TEST_APIM_API';
// const ApplicationDomainName = 'TEST_APIM_API';
// let ApplicationDomainId: string;
const EventApiProductName = "EventApiProduct_1";
let EventApiProductId: string | undefined = undefined;
let EventApiProductList: Array<EventApiProduct> = [];


function encodeRFC3986URIComponent(str: string): string {
  return encodeURIComponent(str)
    .replace(
      /[!'()*]/g,
      (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
    );
}

function encode4ApimURIComponent(str: string): string {
  return encodeURIComponent(str)
    .replace(
      /[*]/g,
      (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
    );
}


describe(`${scriptName}`, () => {
    
    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: should list all event api products and check attributes manually`, async () => {
      const PageSize = 100;
      try {
        const eventApiProductList: Array<EventApiProduct> = [];
        let nextPage: number | null = 1;
        while(nextPage !== null) {
          const eventApiProductsResponse: EventApiProductsResponse = await EventApiProductsService.listEventApiProducts({
            pageSize: PageSize,
            pageNumber: nextPage,
            // query: query  
          });
          expect(eventApiProductsResponse.data, TestLogger.createApiTestFailMessage('failed')).to.not.be.undefined;
          expect(eventApiProductsResponse.data.length, TestLogger.createApiTestFailMessage('failed')).to.be.lessThanOrEqual(PageSize);
          const meta = eventApiProductsResponse.meta;
          expect(meta, TestLogger.createApiTestFailMessage('failed')).to.not.be.undefined;
          // // DEBUG
          // expect(false,TestLogger.createLogMessage('meta', meta)).to.be.true;
          // expect(meta.pagination.nextPage,TestLogger.createApiTestFailMessage(TestLogger.createLogMessage('meta', meta))).to.be.greaterThan(0);
          nextPage = meta.pagination.nextPage;
          eventApiProductList.push(...eventApiProductsResponse.data);
          // // DEBUG
          // expect(false,TestLogger.createLogMessage('incremental list', eventApiProductList)).to.be.true;
        }
        // iterate through the list and check the attributes
        const filteredList: Array<EventApiProduct> = eventApiProductList.filter( (eventApiProduct: EventApiProduct) => {
          if(eventApiProduct.customAttributes === undefined) return false;
          const found = eventApiProduct.customAttributes.find( (x) => {
            return x.name === PublishDestiationsAttributeName;
          });
          if(found === undefined) return false;
          if(found.value !== PublishDestinationValue) return false;
          return true;
        });
        expect(filteredList.length, TestLogger.createLogMessage('filteredList.length', filteredList.length)).to.be.greaterThanOrEqual(1);
        const found = filteredList.find( (eventApiProduct: EventApiProduct) => {
          return eventApiProduct.name === EventApiProductName;
        });
        expect(found, TestLogger.createLogMessage(`filteredList.find(${EventApiProductName})`, filteredList)).to.not.be.undefined;
        // // DEBUG
        // expect(false, TestLogger.createLogMessage('filteredList', filteredList)).to.be.true;
        EventApiProductList = filteredList;
        EventApiProductId = found?.id;
      } catch(e) {
        expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
        expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
      }
    });

    // TODO: server returns internal server error, fix server
    it(`${scriptName}: should list event api products with correct publish_destinations attribute using the query language`, async () => {
      try {

        // // https://github.com/piotr-oles/rsql#readme
        // const ast = builder.and(
        //   builder.in(EpSdkUtils.nameOf<EpSdkApimEventApiProductQueryFields>('applicationDomainId'), [ApplicationDomainId]),
        //   builder.eq(EpSdkUtils.nameOf<EpSdkApimEventApiProductQueryFields>('brokerType'), EpSdkBrokerTypes.Solace),
        //   builder.and(
        //     builder.eq(EpSdkUtils.nameOf<EpSdkApimEventApiProductQueryFields>("customAttributes.name"), PublishDestinationsAttribute.name),
        //     builder.comparison(EpSdkUtils.nameOf<EpSdkApimEventApiProductQueryFields>("customAttributes.value"), '=contains=', PublishDestinationsAttribute.value),                        
        //     builder.eq(EpSdkUtils.nameOf<EpSdkApimEventApiProductQueryFields>("customAttributes.name"), FlatImportAttribute.name),
        //     builder.eq(EpSdkUtils.nameOf<EpSdkApimEventApiProductQueryFields>("customAttributes.value"), FlatImportAttribute.value),                        
        //     builder.or(
        //       builder.and(
        //         builder.eq(EpSdkUtils.nameOf<EpSdkApimEventApiProductQueryFields>("customAttributes.name"), XOwningDomainIdAttribute.name),
        //         builder.comparison(EpSdkUtils.nameOf<EpSdkApimEventApiProductQueryFields>("customAttributes.value"), '=contains=', XOwningDomainIdAttribute.value),                        
        //       ),
        //       builder.and(
        //         builder.eq(EpSdkUtils.nameOf<EpSdkApimEventApiProductQueryFields>("customAttributes.name"), XSharingDomainIdAttribute.name),
        //         builder.comparison(EpSdkUtils.nameOf<EpSdkApimEventApiProductQueryFields>("customAttributes.value"), '=contains=', XSharingDomainIdAttribute.value),                        
        //       ),
        //     )
        //   ),
        //   builder.in(EpSdkUtils.nameOf<EpSdkApimEventApiProductQueryFields>('version.state'), ["RELEASED", "DEPRECATED", "RETIRED", "DELETED"])
        // );

        // TODO: add your own operator => into an EpSdkApimQueryBuilder

        // const query = emit(ast);

        const attributeQueryAst = builder.comparison(`customAttributes.name[${PublishDestiationsAttributeName}].value`, '=elem=', `.*${PublishDestinationValue}.*`);
        const attributeQuery = emit(attributeQueryAst);
        const eventApiProductList: Array<EventApiProduct> = [];
        let nextPage: number | null = 1;
        while(nextPage !== null) {
          const eventApiProductsResponse: EventApiProductsResponse = await EventApiProductsService.listEventApiProducts({
            pageNumber: nextPage,
            query: attributeQuery
          });
          expect(eventApiProductsResponse.data, TestLogger.createApiTestFailMessage('failed')).to.not.be.undefined;
          // expect(eventApiProductsResponse.data.length, TestLogger.createApiTestFailMessage('failed')).to.be.lessThanOrEqual(PageSize);
          const meta = eventApiProductsResponse.meta;
          expect(meta, TestLogger.createApiTestFailMessage('failed')).to.not.be.undefined;
          nextPage = meta.pagination.nextPage;
          eventApiProductList.push(...eventApiProductsResponse.data);
          // // DEBUG
          // expect(false,TestLogger.createLogMessage('incremental list', eventApiProductList)).to.be.true;
        }
        // // DEBUG
        // expect(false, TestLogger.createLogMessage('full list', eventApiProductList)).to.be.true;
        expect(eventApiProductList.length, TestLogger.createLogMessage('eventApiProductList', eventApiProductList)).to.equal(1);
      } catch(e) {
        expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
        expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get the gateways for all messaging services`, async () => {
      expect(EventApiProductId, TestLogger.createLogMessage('EventApiProductId', EventApiProductId)).to.not.be.undefined;
      try {
        if(EventApiProductId === undefined) throw new Error('EventApiProductId === undefined');
        const eventApiProductResponse: EventApiProductResponse = await EventApiProductsService.getEventApiProduct({ 
          eventApiProductId: EventApiProductId,
        });
        const eventApiProduct: EventApiProduct = eventApiProductResponse.data;
        expect(eventApiProduct.solaceMessagingServices.length, TestLogger.createLogMessage('eventApiProduct.solaceMessagingServices.length', eventApiProduct.solaceMessagingServices.length)).to.be.greaterThanOrEqual(1);
        for(const solaceMessagingService of eventApiProduct.solaceMessagingServices) {
          // get the gateway
          const gatewayResponse: GatewayResponse = await GatewaysService.getGateway({ messagingServiceId: solaceMessagingService.messagingServiceId });
          const messagingService: MessagingService = gatewayResponse.data;
          expect(messagingService.brokerType, TestLogger.createLogMessage('messagingService.brokerType', messagingService.brokerType)).to.equal(BrokerType.SOLACE);
          // // DEBUG
          // expect(false,TestLogger.createLogMessage('messagingService', messagingService)).to.be.true;
        }
        // TODO: test for content
      } catch(e) {
        expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
        expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get all async api apis for the event api product`, async () => {
      expect(EventApiProductId, TestLogger.createLogMessage('EventApiProductId', EventApiProductId)).to.not.be.undefined;
      try {
        if(EventApiProductId === undefined) throw new Error('EventApiProductId === undefined');
        const eventApiProductResponse: EventApiProductResponse = await EventApiProductsService.getEventApiProduct({ 
          eventApiProductId: EventApiProductId,
        });
        const eventApiProduct: EventApiProduct = eventApiProductResponse.data;
        // plans
        expect(eventApiProduct.plans.length, TestLogger.createLogMessage('eventApiProduct.plans', eventApiProduct.plans)).to.be.greaterThanOrEqual(1);
        // eventApis
        expect(eventApiProduct.apis.length, TestLogger.createLogMessage('eventApiProduct.apis', eventApiProduct.apis)).to.be.greaterThanOrEqual(1);
        // get all async api specs for each plan/eventApi 
        for(const plan of eventApiProduct.plans) {
          for(const eventApiVersion of eventApiProduct.apis) {
            const asyncApiObject = await EventApiProductsService.getEventApiProductPlanApi({
              eventApiProductId: EventApiProductId,
              planId: plan.id,
              eventApiId: eventApiVersion.id,
              apiFormat: "application/json",
              asyncApiVersion: '2.5.0'
            });
            // DEBUG
            // expect(false,TestLogger.createLogMessage('asyncApiObject', asyncApiObject)).to.be.true;
            // parse it

            TODO
            const epAsyncApiDocument: EpAsyncApiDocument = await EpAsyncApiDocumentService.createFromAny({
              anySpec: asyncApiObject,
              // overrideEpApplicationDomainName: eventApiProduct.applicationDomainName
            });
          }
        }
      } catch(e) {
        expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
        expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
      }
    });

});

