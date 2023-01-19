import 'mocha';
import { expect } from 'chai';
import path from 'path';
import {
  TestContext,
} from '@internal/tools/src';
import { 
  TestLogger,
  TestConfig,
} from '../lib';
import {
  ApiError, 
} from '../../generated-src';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

// const ApplicationDomainName = `${TestConfig.getAppId()}/ep-openapi/${TestUtils.getUUID()}`;
// let ApplicationDomainId: string;

describe(`${scriptName}`, () => {
    
    beforeEach(() => {
      TestContext.newItId();
    });

    // Example query
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
  
          // const query = emit(ast);

    xit(`${scriptName}: should list messaging services`, async () => {
      // const PageSize = 2;
      // try {
      //   let nextPage: number | null = 1;
      //   while(nextPage !== null) {
      //     const eventApiProductsResponse: EventApiProductsResponse = await EventApiProductsService.listEventApiProducts({
      //       pageSize: 100,
      //       pageNumber: nextPage,
      //       // query: query  
      //     });
      //     expect(eventApiProductsResponse.data, TestLogger.createApiTestFailMessage('failed')).to.not.be.undefined;
      //     const meta = eventApiProductsResponse.meta;
      //     expect(meta, TestLogger.createApiTestFailMessage('failed')).to.not.be.undefined;
      //     // expect(meta.pagination.count, TestLogger.createApiTestFailMessage('failed')).to.eq(EnumVersionQuantity);
          
      //     nextPage = meta.pagination.nextPage;
      //   }
      // } catch(e) {
      //   expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
      //   expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
      // }
    });

});

