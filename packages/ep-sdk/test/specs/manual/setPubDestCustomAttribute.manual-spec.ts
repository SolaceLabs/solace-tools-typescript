import 'mocha';
import { expect } from 'chai';
import path from 'path';
import {
  TestContext,
  TestUtils
} from '@internal/tools/src';
import { 
  TestLogger,
} from '../../lib';
import { 
  ApiError, 
  EventApiProduct, 
  EventApiProductsResponse,
} from '@rjgu/ep-openapi-node';
import { 
  EpSdkError,
  EpSdkEventApiProductsService,
  TEpSdkCustomAttribute,
  IEpSdkAttributesQuery,
  EEpSdkComparisonOps,
} from '../../../src';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const TestSpecId: string = TestUtils.getUUID();

const PublishDestinationsAttribute: TEpSdkCustomAttribute = {
  name: "PUBLISH_DESTINATIONS",
  value: "ep-developer-portal"
};

const EmptyPublishDestinationAttributesQuery: IEpSdkAttributesQuery = {
  AND: {
    queryList: [
      {
        attributeName: PublishDestinationsAttribute.name,
        comparisonOp: EEpSdkComparisonOps.IS_EMPTY,
        value: '',
      },
    ]  
  }
};

describe(`${scriptName}`, () => {

    beforeEach(() => {
      TestContext.newItId();
    });

    before(async() => {
    });
  
    after(async() => {
    });

    it(`${scriptName}: should set PublishDestinationsAttribute on all Event Api Products without it`, async () => {
      try {
        // get all Event Api Products without PublishDestinationsAttribute
        const eventApiProductsResponse: EventApiProductsResponse = await EpSdkEventApiProductsService.listAll({
          shared: true,
          attributesQuery: EmptyPublishDestinationAttributesQuery
        });
        expect(eventApiProductsResponse.data).to.not.be.undefined;
        for(const eventApiProductResponse of eventApiProductsResponse.data) {
          const eventApiProduct: EventApiProduct = await EpSdkEventApiProductsService.setCustomAttributes({
            eventApiProductId: eventApiProductResponse.id,
            epSdkCustomAttributeList: [PublishDestinationsAttribute]
          });
        }

      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

});

