import "mocha";
import { expect } from "chai";
import path from "path";
import { TestContext, TestUtils } from "@internal/tools/src";
import { TestLogger, TestConfig } from "../../lib";
import {
  ApiError,
  ApplicationDomainResponse,
  ApplicationDomainsService,
  EventApiProductsService,
  EventApiProductResponse,
  EventApiProduct,
  CustomAttribute,
  EventApiProductsResponse,
} from "@solace-labs/ep-openapi-node";
import {
  EpSdkError,
  EpSdkEventApiProductsService,
  TEpSdkCustomAttribute,
  IEpSdkAttributesQuery,
  EEpSdkComparisonOps,
  EpSdkApplicationDomainsService,
} from "../../../src";

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = "eap-list.spec";
const TestSpecId: string = TestUtils.getUUID();
let ApplicationDomainName: string;
let ApplicationDomainId: string | undefined;

const NumEventApiProducts = 6; // divided by 3 = even number
const getEventApiProductNameList = (): Array<string> => {
  const list: Array<string> = [];
  for (let i = 0; i < NumEventApiProducts; i++) {
    list.push(i.toString());
  }
  return list;
};
let EventApiProductIdList: Array<string> = [];

const PublishDestinationsAttribute: TEpSdkCustomAttribute = {
  name: `${TestSpecName}.PUB_DEST`,
  value: "ep-developer-portal",
};
const AnotherAttribute: TEpSdkCustomAttribute = {
  name: `${TestSpecName}.another`,
  value: "another value",
};

const EmptyPublishDestinationAttributesQuery: IEpSdkAttributesQuery = {
  AND: {
    queryList: [
      {
        attributeName: PublishDestinationsAttribute.name,
        comparisonOp: EEpSdkComparisonOps.IS_EMPTY,
        value: "",
      },
    ],
  },
};

const initializeGlobals = () => {
  ApplicationDomainName = `${TestConfig.getAppId()}/services/${TestSpecName}`;
};

describe(`${scriptName}`, () => {
  before(async () => {
    initializeGlobals();
    TestContext.newItId();
    const applicationDomainResponse: ApplicationDomainResponse =
      await ApplicationDomainsService.createApplicationDomain({
        requestBody: {
          name: ApplicationDomainName,
        },
      });
    ApplicationDomainId = applicationDomainResponse.data.id;
  });

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async () => {
    // delete application domain
    TestContext.newItId();
    await EpSdkApplicationDomainsService.deleteById({
      applicationDomainId: ApplicationDomainId,
    });
    // remove all attribute definitions
    const allAttributes = [PublishDestinationsAttribute, AnotherAttribute];
    const xvoid: void =
      await EpSdkEventApiProductsService.removeAssociatedEntityTypeFromCustomAttributeDefinitions(
        {
          customAttributeNames: allAttributes.map((x) => {
            return x.name;
          }),
        }
      );
  });

  it(`${scriptName}: should create eventApiProducts, half of which have Pub Dest attribute`, async () => {
    try {
      // create the products
      const eventApiProductNameList = getEventApiProductNameList();
      let i = 0;
      for (const eventApiProductName of eventApiProductNameList) {
        const eventApiProductResponse: EventApiProductResponse = await EventApiProductsService.createEventApiProduct({
          requestBody: {
            applicationDomainId: ApplicationDomainId,
            name: eventApiProductName,
            shared: true,
            brokerType: EventApiProduct.brokerType.SOLACE,
          },
        });
        EventApiProductIdList.push(eventApiProductResponse.data.id);
        // set the attribute on all third event api products
        if (i % 3 === 0) {
          const eventApiProduct: EventApiProduct = await EpSdkEventApiProductsService.setCustomAttributes({
            eventApiProductId: eventApiProductResponse.data.id,
            epSdkCustomAttributeList: [
              PublishDestinationsAttribute,
              AnotherAttribute,
            ],
          });
          // test it is set
          expect(eventApiProduct.customAttributes).to.not.be.undefined;
          const found: CustomAttribute | undefined = eventApiProduct.customAttributes.find((customAttribute: CustomAttribute) => {
            return (customAttribute.customAttributeDefinitionName === PublishDestinationsAttribute.name);
          });
          expect(found, `eventApiProduct=${JSON.stringify(eventApiProduct, null, 2)}`).to.not.be.undefined;
        } else if (i % 3 === 1) {
          const eventApiProduct: EventApiProduct = await EpSdkEventApiProductsService.setCustomAttributes({
            eventApiProductId: eventApiProductResponse.data.id,
            epSdkCustomAttributeList: [AnotherAttribute],
          });
        } else {
          // no attributes
        }
        i++;
      }
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should find all event api products without Pub Dest attribute `, async () => {
    try {
      const eventApiProductsResponse: EventApiProductsResponse =
        await EpSdkEventApiProductsService.listAll({
          applicationDomainIds: [ApplicationDomainId],
          shared: true,
          attributesQuery: EmptyPublishDestinationAttributesQuery,
        });
      // // DEBUG
      // expect(false, `eventApiProductsResponse.data=${JSON.stringify(eventApiProductsResponse.data, null, 2)}`).to.be.true;
      expect(eventApiProductsResponse.data).to.not.be.undefined;
      expect(eventApiProductsResponse.data.length, `wrong length, eventApiProductsResponse.data=${JSON.stringify( eventApiProductsResponse.data, null, 2 )}`).to.equal((NumEventApiProducts / 3) * 2);
      for (const eventApiProduct of eventApiProductsResponse.data) {
        expect(eventApiProduct.customAttributes).to.not.be.undefined;
        const found: CustomAttribute | undefined = eventApiProduct.customAttributes.find( (customAttribute: CustomAttribute) => {
          return (
            customAttribute.customAttributeDefinitionName ===
            PublishDestinationsAttribute.name
          );
        });
        expect(found, `eventApiProduct=${JSON.stringify(eventApiProduct, null, 2)}`).to.be.undefined;
      }
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });
});
