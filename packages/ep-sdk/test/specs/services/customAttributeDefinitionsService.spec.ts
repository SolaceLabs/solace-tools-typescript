import 'mocha';
import { expect } from 'chai';
import path from 'path';
import { 
  ApiError, 
  ApplicationDomainResponse, 
  ApplicationDomainsService, 
  CustomAttributeDefinition, 
  CustomAttributeDefinitionResponse, 
  CustomAttributeDefinitionsService, 
  EnumsService, 
  TopicAddressEnumResponse
} from '@rjgu/ep-openapi-node';
import {
  TestContext,
  TestUtils
} from '@internal/tools/src';
import { 
  TestLogger,
  TestConfig,
} from '../../lib';
import { 
  EpSdkError,
  EpSdkApplicationDomainsService,
  EpSdkCustomAttributeDefinitionsService,
  EEpSdkCustomAttributeEntityTypes
} from '../../../src';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId: string = TestUtils.getUUID();
const CustomAttributeDefinition_1_Name = 'CustomAttributeDefinition_1_Name';
const CustomAttributeDefinition_1_Value = 'CustomAttributeDefinition_1_Value';
const CustomAttributeDefinition_1_UpdateValue = "CustomAttributeDefinition_1_UpdateValue";
let CustomAttributeDefinition_1_Id: string | undefined;
const CustomAttributeDefinition_NameList = [
  "name-list-1",
  "name-list-2",
  "name-list-3",
  "name-list-4",
  "name-list-5",
  "name-list-6",
];
let CustomAttributeDefinition_IdList = [];

let ApplicationDomainName: string;
let ApplicationDomainId: string | undefined;
let EnumName: string;
let EnumId: string | undefined;

const deleteCustomAttributeDefinitions = async (): Promise<void> => {
  if(CustomAttributeDefinition_1_Id !== undefined) {
    try {
      await CustomAttributeDefinitionsService.deleteCustomAttributeDefinition({
        id: CustomAttributeDefinition_1_Id
      });    
    } catch(e) {}
  }
  for(const id of CustomAttributeDefinition_IdList) {
    try {
      await CustomAttributeDefinitionsService.deleteCustomAttributeDefinition({
        id: id
      });  
    } catch(e) {};
  }
}

const initializeGlobals = () => {
  ApplicationDomainName = `${TestConfig.getAppId()}/services/${TestSpecName}`;
  EnumName = `${TestConfig.getAppId()}-services-${TestSpecId}`;
}

describe(`${scriptName}`, () => {

    before(async() => {
      initializeGlobals();
      TestContext.newItId();
      // clean up before 
      CustomAttributeDefinition_IdList = [];
      CustomAttributeDefinition_1_Id = undefined;
      const customAttributeDefinition: CustomAttributeDefinition | undefined = await EpSdkCustomAttributeDefinitionsService.getByName({
        attributeName: CustomAttributeDefinition_1_Name
      });
      if(customAttributeDefinition !== undefined) CustomAttributeDefinition_1_Id = customAttributeDefinition.id;
      for(const customAttributeName of CustomAttributeDefinition_NameList) {
        const customAttributeDefinition: CustomAttributeDefinition | undefined = await EpSdkCustomAttributeDefinitionsService.getByName({
          attributeName: customAttributeName
        });
        if(customAttributeDefinition !== undefined) CustomAttributeDefinition_IdList.push(customAttributeDefinition.id);
      }
      try { 
        const xvoid: void = await deleteCustomAttributeDefinitions();
      } catch(e) {
        // noop
      }
      CustomAttributeDefinition_IdList = [];
      CustomAttributeDefinition_1_Id = undefined;
      // // DEBUG
      // expect(false).to.be.true;
    });

    beforeEach(() => {
      TestContext.newItId();
    });

    after(async() => {
      try { 
        const xvoid: void = await deleteCustomAttributeDefinitions();
      } catch(e) {}
      await EpSdkApplicationDomainsService.deleteById({ applicationDomainId: ApplicationDomainId });
    });

    it(`${scriptName}: should not find custom attribute definition by name`, async () => {
      try {
        const customAttributeDefinition: CustomAttributeDefinition | undefined = await EpSdkCustomAttributeDefinitionsService.getByName({
          attributeName: CustomAttributeDefinition_1_Name
        });
        expect(customAttributeDefinition, '').to.be.undefined;
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should create custom attribute definition`, async () => {
      try {
        const customAttributeDefinitionResponse: CustomAttributeDefinitionResponse = await CustomAttributeDefinitionsService.createCustomAttributeDefinition({
          requestBody: {
            name: CustomAttributeDefinition_1_Name,
            associatedEntityTypes: [EEpSdkCustomAttributeEntityTypes.ENUM],
            valueType: CustomAttributeDefinition.valueType.STRING
          }
        });
        CustomAttributeDefinition_1_Id = customAttributeDefinitionResponse.data.id;

        // // DEBUG
        // expect(false, `customAttributeDefinitionResponse.data=\n${JSON.stringify(customAttributeDefinitionResponse.data, null, 2)}`).to.be.true;

        expect(customAttributeDefinitionResponse.data).to.not.be.undefined;
        expect(customAttributeDefinitionResponse.data.associatedEntityTypes.length).to.equal(1);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get custom attribute definition by name`, async () => {
      try {
        const customAttributeDefinition: CustomAttributeDefinition | undefined = await EpSdkCustomAttributeDefinitionsService.getByName({
          attributeName: CustomAttributeDefinition_1_Name
        });
        expect(customAttributeDefinition, `attribute ${CustomAttributeDefinition_1_Name} not found, undefined`).to.not.be.undefined;
        expect(customAttributeDefinition.associatedEntityTypes, '').to.include(EEpSdkCustomAttributeEntityTypes.ENUM);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should add all entity types to custom attribute definition`, async () => {
      try {
        const customAttributeDefinitionResponse: CustomAttributeDefinitionResponse = await CustomAttributeDefinitionsService.updateCustomAttributeDefinition({
          id: CustomAttributeDefinition_1_Id,
          requestBody: {
            associatedEntityTypes: Object.values(EEpSdkCustomAttributeEntityTypes),
          }
        });
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get custom attribute definition by name with all entity types`, async () => {
      try {
        const customAttributeDefinition: CustomAttributeDefinition | undefined = await EpSdkCustomAttributeDefinitionsService.getByName({
          attributeName: CustomAttributeDefinition_1_Name
        });
        for(const value of Object.values(EEpSdkCustomAttributeEntityTypes) ) {
          expect(customAttributeDefinition.associatedEntityTypes, `entity not included: ${value}`).to.include(value);
        }
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should create custom attribute definition list`, async () => {
      try {
        for(const name of CustomAttributeDefinition_NameList) {
          const customAttributeDefinitionResponse: CustomAttributeDefinitionResponse = await CustomAttributeDefinitionsService.createCustomAttributeDefinition({
            requestBody: {
              name: name,
              associatedEntityTypes: Object.values(EEpSdkCustomAttributeEntityTypes),
              valueType: CustomAttributeDefinition.valueType.STRING
            }
          });
          CustomAttributeDefinition_IdList.push(customAttributeDefinitionResponse.data.id);
        }
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get custom attribute definition by name with pageSize=1`, async () => {
      try {
        const customAttributeDefinition: CustomAttributeDefinition | undefined = await EpSdkCustomAttributeDefinitionsService.getByName({
          attributeName: CustomAttributeDefinition_1_Name,
          pageSize: 1
        });
        expect(customAttributeDefinition, `attribute ${CustomAttributeDefinition_1_Name} not found, undefined`).to.not.be.undefined;
        for(const value of Object.values(EEpSdkCustomAttributeEntityTypes) ) {
          expect(customAttributeDefinition.associatedEntityTypes, `entity not included: ${value}`).to.include(value);
        }
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should create application domain`, async () => {
      try {
        const applicationDomainResponse: ApplicationDomainResponse = await ApplicationDomainsService.createApplicationDomain({
          requestBody: {
            name: ApplicationDomainName,
          }
        });
        ApplicationDomainId = applicationDomainResponse.data.id;
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should create enum with attribute`, async () => {
      try {
        const enumResponse: TopicAddressEnumResponse = await EnumsService.createEnum({
          requestBody: {
            applicationDomainId: ApplicationDomainId,
            name: EnumName,
            shared: false,
            customAttributes: [
              {
                customAttributeDefinitionId: CustomAttributeDefinition_1_Id,
                value: CustomAttributeDefinition_1_Value
              }
            ]
          }
        });
        EnumId = enumResponse.data.id;
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get enum with attribute / value`, async () => {
      try {
        const enumResponse: TopicAddressEnumResponse = await EnumsService.getEnum({
          id: EnumId
        });
        expect(JSON.stringify(enumResponse.data.customAttributes), `enum does not include attribute name = ${CustomAttributeDefinition_1_Name}`).to.include(CustomAttributeDefinition_1_Name);
        expect(JSON.stringify(enumResponse.data.customAttributes), `enum does not include attribute value = ${CustomAttributeDefinition_1_Value}`).to.include(CustomAttributeDefinition_1_Value);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should update attribute value for enum`, async () => {
      try {
        const enumResponse: TopicAddressEnumResponse = await EnumsService.updateEnum({
          id: EnumId,
          requestBody: {
            applicationDomainId: ApplicationDomainId,
            name: EnumName,
            customAttributes: [
              {
                customAttributeDefinitionId: CustomAttributeDefinition_1_Id,
                value: CustomAttributeDefinition_1_UpdateValue
              }
            ]
          }
        });
        expect(JSON.stringify(enumResponse.data.customAttributes), `enum does not include attribute value = ${CustomAttributeDefinition_1_UpdateValue}`).to.include(CustomAttributeDefinition_1_UpdateValue);

      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should remove attribute value for enum`, async () => {
      try {
        const enumResponse: TopicAddressEnumResponse = await EnumsService.updateEnum({
          id: EnumId,
          requestBody: {
            applicationDomainId: ApplicationDomainId,
            name: EnumName,
            customAttributes: []
          }
        });
        // // DEBUG
        // expect(false, `enumResponse.data.customAttributes = \n${JSON.stringify(enumResponse.data.customAttributes, null, 2)}`).to.be.true;
        expect(enumResponse.data.customAttributes.length, `enum still has attributes`).to.equal(0);

      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should remove eum from custom attribute definition associations`, async () => {
      try {
        // ensure it exists
        const before: CustomAttributeDefinition = await EpSdkCustomAttributeDefinitionsService.getByName({
          attributeName: CustomAttributeDefinition_1_Name
        });
        expect(JSON.stringify(before.associatedEntityTypes)).to.include(EEpSdkCustomAttributeEntityTypes.ENUM);
        // remove enum type without deleting
        const after: CustomAttributeDefinition | undefined = await EpSdkCustomAttributeDefinitionsService.removeAssociatedEntityTypeFromCustomAttributeDefinition({
          attributeName: CustomAttributeDefinition_1_Name,
          associatedEntityType: EEpSdkCustomAttributeEntityTypes.ENUM,
        });
        // // DEBUG
        // expect(false, `after = \n${JSON.stringify(after, null, 2)}`).to.be.true;

        expect(after).to.not.be.undefined;
        expect(JSON.stringify(before.associatedEntityTypes)).to.not.include(`"EEpSdkCustomAttributeEntityTypes.ENUM"`);

      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should remove all associations from custom attribute definition and delete it`, async () => {
      try {
        // ensure it exists
        const before: CustomAttributeDefinition = await EpSdkCustomAttributeDefinitionsService.getByName({
          attributeName: CustomAttributeDefinition_1_Name
        });
        expect(before.associatedEntityTypes).to.not.be.undefined;
        expect(before.associatedEntityTypes.length).to.be.greaterThan(0);
        if(before.associatedEntityTypes === undefined) throw new Error('before.associatedEntityTypes');
        // remove all types and deletes it
        for(const associatedEntityType of before.associatedEntityTypes) {
          const after: CustomAttributeDefinition | undefined = await EpSdkCustomAttributeDefinitionsService.removeAssociatedEntityTypeFromCustomAttributeDefinition({
            attributeName: CustomAttributeDefinition_1_Name,
            associatedEntityType: associatedEntityType as EEpSdkCustomAttributeEntityTypes,
          });

          // // DEBUG
          // expect(false, `removed=${associatedEntityType}, after = \n${JSON.stringify(after, null, 2)}`).to.be.true;
          if(associatedEntityType === before.associatedEntityTypes[before.associatedEntityTypes.length - 1]) {
            expect(after, `\nremoved associatedEntityType=${associatedEntityType}, \nbefore.associatedEntityTypes=\n${JSON.stringify(before.associatedEntityTypes, null, 2)}, \nafter=\n${JSON.stringify(after, null, 2)}`).to.be.undefined;
          } else {
            expect(after).to.not.be.undefined;
            expect(JSON.stringify(after.associatedEntityTypes)).to.not.include(`"${associatedEntityType}"`);    
          }
        }

        const after: CustomAttributeDefinition | undefined= await EpSdkCustomAttributeDefinitionsService.getByName({
          attributeName: CustomAttributeDefinition_1_Name
        });

        // // DEBUG
        // expect(false, `after = \n${JSON.stringify(after, null, 2)}`).to.be.true;

        expect(after, `after=\n${JSON.stringify(after, null, 2)}`).to.be.undefined;


      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

});

