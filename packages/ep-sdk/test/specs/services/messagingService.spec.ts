import "mocha";
import { expect } from "chai";
import path from "path";
import { TestContext, TestUtils } from "@internal/tools/src";
import { TestLogger, TestConfig } from "../../lib";
import {
  ApiError,
  Plan,
  SolaceClassOfServicePolicy,
  SolaceMessagingService,
} from "@solace-labs/ep-openapi-node";
import { EpSdkError, EpSdkMessagingService } from "../../../src";

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = "msgsvc-spec";
const TestSpecId: string = TestUtils.getUUID();
let ApplicationDomainName: string;
let ApplicationDomainId: string | undefined;

// type TEnumInfo = {
//   enumName: string;
//   enumValues: Array<string>;
//   enumId?: string;
//   enumVersionId?: string;
// }
// const EnumInfoList: Array<TEnumInfo> = [
//   { enumName: '_enum_name_0_', enumValues: ['_enum_name_0_one', '_enum_name_0_two', '_enum_name_0_three'] },
//   { enumName: '_enum_name_1_', enumValues: ['_enum_name_1_one', '_enum_name_1_two', '_enum_name_1_three'] },
//   { enumName: '_enum_name_2_', enumValues: ['_enum_name_2_one', '_enum_name_2_two', '_enum_name_2_three'] },
// ];

// const SchemaContent = `
// {
//   "type": "object",
//   "properties": {
//     "hello": {
//       "type": "string"
//     }
//   }
// }
// `;
// type TSchemaInfo = {
//   schemaName: string;
//   schemaContent: string;
//   schemaId?: string;
//   schemaVersionId?: string;
// }
// const SchemaInfoList: Array<TSchemaInfo> = [
//   { schemaName: '_schema_name_0_', schemaContent: SchemaContent },
//   { schemaName: '_schema_name_1_', schemaContent: SchemaContent },
//   { schemaName: '_schema_name_2_', schemaContent: SchemaContent },
// ];

// type TEventInfo = {
//   eventName: string;
//   eventId?: string;
//   eventVersionId?: string;
// }
// const EventInfoList: Array<TEventInfo> = [
//   { eventName: '_event_name_0_', },
//   { eventName: '_event_name_1_', },
//   { eventName: '_event_name_2_', },
// ];

// const EventApiName = `${TestSpecId}`;
// let EventApiId: string | undefined;
// let EventApiVersionId: string | undefined;

// fixed, taken from UI
// const SolaceCloudMessagingServiceId = "1i5g7tif6z8n";

// const EnvironmentName: string = "EP-TOOLS-TEST-ENV";
// let EnvironmentId: string | undefined;
// const EventMeshName = `${TestSpecId}`;
// let EventMeshId: string | undefined;
// const MessagingServiceName = `${TestSpecId}`;
// let MessagingServiceId: string | undefined;

// fixed, taken from UI
const MessagingServiceId = "wgex5k3ov3h";

// let TheMessagingService: MessagingService | undefined;
// let GatewayMessagingServiceId: string | undefined;

const EventApiProductName = `${TestSpecId}`;
let EventApiProductId: string | undefined;
let EventApiProductVersionId: string | undefined;

const EventApiProductVersionPlan_1: Plan = {
  name: "guaranteed-plan",
  solaceClassOfServicePolicy: {
    accessType: SolaceClassOfServicePolicy.accessType.EXCLUSIVE,
    maximumTimeToLive: 1,
    maxMsgSpoolUsage: 1,
    messageDeliveryMode:
      SolaceClassOfServicePolicy.messageDeliveryMode.GUARANTEED,
    queueType: SolaceClassOfServicePolicy.queueType.COMBINED,
    type: "solaceClassOfServicePolicy",
  },
};
let EventApiProductVersionPlanId_1: string | undefined;
const EventApiProductVersionPlan_2: Plan = {
  name: "direct-plan",
  solaceClassOfServicePolicy: {
    messageDeliveryMode: SolaceClassOfServicePolicy.messageDeliveryMode.DIRECT,
    type: "solaceClassOfServicePolicy",
  },
};
let EventApiProductVersionPlanId_2: string | undefined;

const initializeGlobals = () => {
  ApplicationDomainName = `${TestConfig.getAppId()}/services/${TestSpecName}`;
};

describe(`${scriptName}`, () => {
  before(async () => {
    initializeGlobals();
    // TestContext.newItId();
    // const applicationDomainResponse: ApplicationDomainResponse = await ApplicationDomainsService.createApplicationDomain({
    //   requestBody: {
    //     name: ApplicationDomainName,
    //   }
    // });
    // ApplicationDomainId = applicationDomainResponse.data.id;
  });

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async () => {
    // TestContext.newItId();
    // // delete event mesh
    // // await EventMeshesService.deleteEventMesh({ id: EventMeshId });
    // // delete application domain
    // await EpSdkApplicationDomainsService.deleteById({ applicationDomainId: ApplicationDomainId });
  });

  // it(`${scriptName}: should create enums & versions`, async () => {
  //   try {
  //     for(const enumInfo of EnumInfoList) {
  //       const epSdkEnumTask = new EpSdkEnumTask({
  //         epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
  //         applicationDomainId: ApplicationDomainId,
  //         enumName: enumInfo.enumName,
  //         enumObjectSettings: {
  //           shared: true,
  //         },
  //       });
  //       const epSdkEnumTask_ExecuteReturn: IEpSdkEnumTask_ExecuteReturn = await epSdkEnumTask.execute();
  //       enumInfo.enumId = epSdkEnumTask_ExecuteReturn.epObject.id;
  //       const epSdkEnumVersionTask = new EpSdkEnumVersionTask({
  //         epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
  //         applicationDomainId: ApplicationDomainId,
  //         enumId: enumInfo.enumId,
  //         versionString: '1.0.0',
  //         enumVersionSettings: {
  //           stateId: EpSdkStatesService.releasedId,
  //           displayName: enumInfo.enumName,
  //         },
  //         enumValues: enumInfo.enumValues,
  //       });
  //       const epSdkEnumVersionTask_ExecuteReturn: IEpSdkEnumVersionTask_ExecuteReturn = await epSdkEnumVersionTask.execute();
  //       enumInfo.enumVersionId = epSdkEnumVersionTask_ExecuteReturn.epObject.id;
  //     }
  //   } catch(e) {
  //     if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
  //     expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
  //     expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
  //   }
  // });

  // it(`${scriptName}: should create schemas & versions`, async () => {
  //   try {
  //     for(const schemaInfo of SchemaInfoList) {
  //       const epSdkSchemaTask = new EpSdkSchemaTask({
  //         epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
  //         applicationDomainId: ApplicationDomainId,
  //         schemaName: schemaInfo.schemaName,
  //         schemaObjectSettings: {
  //           shared: true,
  //         },
  //       });
  //       const epSdkSchemaTask_ExecuteReturn: IEpSdkSchemaTask_ExecuteReturn = await epSdkSchemaTask.execute();
  //       schemaInfo.schemaId = epSdkSchemaTask_ExecuteReturn.epObject.id;
  //       const epSdkSchemaVersionTask = new EpSdkSchemaVersionTask({
  //         epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
  //         applicationDomainId: ApplicationDomainId,
  //         schemaId: schemaInfo.schemaId,
  //         versionString: '1.0.0',
  //         schemaVersionSettings: {
  //           stateId: EpSdkStatesService.releasedId,
  //           displayName: schemaInfo.schemaName,
  //           description: 'description',
  //           content: schemaInfo.schemaContent,
  //         },
  //       });
  //       const epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn = await epSdkSchemaVersionTask.execute();
  //       schemaInfo.schemaVersionId = epSdkSchemaVersionTask_ExecuteReturn.epObject.id;
  //     }
  //   } catch(e) {
  //     if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
  //     expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
  //     expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
  //   }
  // });

  // it(`${scriptName}: should create events & versions`, async () => {
  //   try {
  //     let idx=0;
  //     for(const eventInfo of EventInfoList) {
  //       const epSdkEpEventTask = new EpSdkEpEventTask({
  //         epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
  //         applicationDomainId: ApplicationDomainId,
  //         eventName: eventInfo.eventName,
  //         eventObjectSettings: {
  //           shared: true,
  //         },
  //       });
  //       const epSdkEpEventTask_ExecuteReturn: IEpSdkEpEventTask_ExecuteReturn = await epSdkEpEventTask.execute();
  //       eventInfo.eventId = epSdkEpEventTask_ExecuteReturn.epObject.id;
  //       const epSdkEpEventVersionTask = new EpSdkEpEventVersionTask({
  //         epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
  //         applicationDomainId: ApplicationDomainId,
  //         eventId: eventInfo.eventId,
  //         versionString: '1.0.0',
  //         topicString: `one/two/{${EnumInfoList[idx].enumName}}`,
  //         eventVersionSettings: {
  //           stateId: EpSdkStatesService.releasedId,
  //           displayName: eventInfo.eventName,
  //           description: 'description',
  //           schemaVersionId: SchemaInfoList[idx].schemaVersionId
  //         },
  //       });
  //       const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn = await epSdkEpEventVersionTask.execute();
  //       eventInfo.eventVersionId = epSdkEpEventVersionTask_ExecuteReturn.epObject.id;
  //       idx++;
  //     }
  //   } catch(e) {
  //     if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
  //     expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
  //     expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
  //   }
  // });

  // it(`${scriptName}: should create event api & version`, async () => {
  //   try {
  //     const eventApiResponse: EventApiResponse = await EventApIsService.createEventApi({
  //       requestBody: {
  //         applicationDomainId: ApplicationDomainId,
  //         name: EventApiName,
  //         brokerType: EventApi.brokerType.SOLACE
  //       }
  //     });
  //     EventApiId = eventApiResponse.data.id;

  //     const create: EventApiVersion = {
  //       eventApiId: EventApiId,
  //       version: '1.0.0',
  //       displayName: EventApiName,
  //       consumedEventVersionIds: EventInfoList.map( (eventInfo: TEventInfo) => {
  //         return eventInfo.eventVersionId;
  //       }),
  //       producedEventVersionIds: EventInfoList.map( (eventInfo: TEventInfo) => {
  //         return eventInfo.eventVersionId;
  //       }),
  //     };
  //     const created: EventApiVersion = await EpSdkEventApiVersionsService.createEventApiVersion({
  //       applicationDomainId: ApplicationDomainId,
  //       eventApiId: EventApiId,
  //       eventApiVersion: create,
  //       targetLifecycleStateId: EpSdkStatesService.draftId,
  //     });
  //     EventApiVersionId = created.id;
  //   } catch(e) {
  //     if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
  //     expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
  //     expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
  //   }
  // });

  // it(`${scriptName}: should find the pre-configured environment`, async () => {
  //   try {
  //     // assuming there are less than 100 envs defined in EP
  //     const environmentsResponse: EnvironmentsResponse = await EnvironmentsService.getEnvironments({
  //       pageSize: 100,
  //     });
  //     const message = `TEST expects ${EnvironmentName} to be defined in EP`;
  //     expect(environmentsResponse.data, message).to.not.be.undefined;
  //     expect(environmentsResponse.data.length, message).to.be.greaterThan(0);
  //     if(!environmentsResponse.data || environmentsResponse.data.length ===0) throw new Error(message);
  //     const environment = environmentsResponse.data.find( (x) => {
  //       return x.name === EnvironmentName;
  //     });
  //     expect(environment, message).to.not.be.undefined;
  //     EnvironmentId = environment.id;
  //     // // DEBUG
  //     // expect(false, `environment=\n${JSON.stringify(environment, null, 2)}`).to.be.true;
  //   } catch(e) {
  //     if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
  //     expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
  //     expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
  //   }
  // });

  // it(`${scriptName}: should create the event mesh`, async () => {
  //   try {
  //     const eventMeshResponse: EventMeshResponse = await EventMeshesService.createEventMesh({
  //       requestBody: {
  //         brokerType: EventMesh.brokerType.SOLACE,
  //         environmentId: EnvironmentId,
  //         name: EventMeshName
  //       }
  //     });
  //     if(eventMeshResponse.data === undefined) throw new Error('eventMeshResponse.data === undefined');
  //     EventMeshId = eventMeshResponse.data.id;
  //     // // DEBUG
  //     // expect(false, `eventMeshResponse=\n${JSON.stringify(eventMeshResponse, null, 2)}`).to.be.true;
  //   } catch(e) {
  //     if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
  //     expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
  //     expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
  //   }
  // });

  // it(`${scriptName}: should create messaging service`, async () => {
  //   try {
  //     const messagingServiceResponse: MessagingServiceResponse = await MessagingServicesService.createMessagingService({
  //       requestBody: {
  //         eventMeshId: EventMeshId,
  //         name: MessagingServiceName,
  //         messagingServiceType: 'solace',
  //         solaceCloudMessagingServiceId: SolaceCloudMessagingServiceId,
  //         messagingServiceConnections: [
  //           {
  //             name: 'my smf connection',
  //             url: 'tcp://mr1i5g7tif6z9h.messaging.solace.cloud:55555',
  //             protocol: 'smf',
  //             protocolVersion: 'smf',
  //             bindings: {
  //               msgVpn: 'apim-test'
  //             },
  //             messagingServiceAuthentications: [
  //               {
  //                 name: 'smf',
  //                 authenticationType: 'basicAuthentication',
  //                 messagingServiceCredentials: [
  //                   {
  //                     name: 'basic auth credentials',
  //                     credentials: {
  //                       username: 'username',
  //                       password: 'password'
  //                     }
  //                   }
  //                 ]
  //               }
  //             ]
  //           }
  //         ]
  //       }
  //     });
  //     if(messagingServiceResponse.data === undefined) throw new Error('messagingServiceResponse.data === undefined');
  //     // DEBUG
  //     expect(false, `messagingServiceResponse=\n${JSON.stringify(messagingServiceResponse, null, 2)}`).to.be.true;
  //   } catch(e) {
  //     if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
  //     expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
  //     expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
  //   }
  // });

  let TotalMessagingServices: number | undefined = undefined;

  it(`${scriptName}: should get list of all messaging services`, async () => {
    const PageSize = 1;
    try {
      const messagingServiceList: Array<SolaceMessagingService> =
        await EpSdkMessagingService.listAll({
          pageSize: PageSize,
        });
      expect(messagingServiceList.length).to.be.greaterThan(1);
      TotalMessagingServices = messagingServiceList.length;
      // // DEBUG
      // expect(false, `messagingServiceList=\n${JSON.stringify(messagingServiceList, null, 2)}`).to.be.true;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should get list of all messaging services by idList=[]`, async () => {
    try {
      const messagingServiceList: Array<SolaceMessagingService> =
        await EpSdkMessagingService.listAll({
          idList: [],
        });
      expect(messagingServiceList.length).to.equal(TotalMessagingServices);
      // // DEBUG
      // expect(false, `messagingServiceList=\n${JSON.stringify(messagingServiceList, null, 2)}`).to.be.true;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should get list of all messaging services by idList`, async () => {
    const PageSize = 1;
    try {
      const messagingServiceList: Array<SolaceMessagingService> =
        await EpSdkMessagingService.listAll({
          pageSize: PageSize,
          idList: [MessagingServiceId],
        });
      expect(messagingServiceList.length).to.equal(1);
      // // DEBUG
      // expect(false, `messagingServiceList=\n${JSON.stringify(messagingServiceList, null, 2)}`).to.be.true;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should get messaging service`, async () => {
    try {
      const messagingService: SolaceMessagingService =
        await EpSdkMessagingService.getById({
          messagingServiceId: MessagingServiceId,
        });
      // // DEBUG
      // expect(false, `messagingService=\n${JSON.stringify(messagingService, null, 2)}`).to.be.true;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  // it(`${scriptName}: should create event api product & version`, async () => {
  //   try {
  //     // get the messaging services
  //     const messagingServicesResponse: MessagingServicesResponse = await MessagingServicesService.getMessagingServices({
  //     });
  //     // // DEBUG
  //     // expect(false, `${JSON.stringify(messagingServicesResponse.data, null, 2)}`).to.be.true;
  //     const message = 'TEST cannot run without at least 1 messaging service defined';
  //     expect(messagingServicesResponse.data, message).to.not.be.undefined;
  //     expect(messagingServicesResponse.data.length, message).to.be.greaterThan(0);
  //     if(!messagingServicesResponse.data || messagingServicesResponse.data.length ===0) throw new Error(message);
  //     TheMessagingService = messagingServicesResponse.data[0];

  //     // create the product
  //     const eventApiProductResponse: EventApiProductResponse = await EventApiProductsService.createEventApiProduct({
  //       requestBody: {
  //         applicationDomainId: ApplicationDomainId,
  //         name: EventApiProductName,
  //         brokerType: EventApiProduct.brokerType.SOLACE
  //       }
  //     });
  //     EventApiProductId = eventApiProductResponse.data.id;
  //     // create version
  //     const eventApiProductVersionResponse: EventApiProductVersionResponse = await EventApiProductsService.createEventApiProductVersion({
  //       requestBody: {
  //         eventApiProductId: EventApiProductId,
  //         version: '1.0.0',
  //         plans: [EventApiProductVersionPlan_1, EventApiProductVersionPlan_2],
  //       }
  //     });
  //     EventApiProductVersionId = eventApiProductVersionResponse.data.id;
  //     EventApiProductVersionPlanId_1 = eventApiProductVersionResponse.data.plans[0].id;
  //     EventApiProductVersionPlanId_2 = eventApiProductVersionResponse.data.plans[1].id;

  //     // add messaging service
  //     const gatewayMessagingServiceResponse: GatewayMessagingServiceResponse = await EventApiProductsService.associateGatewayMessagingServiceToEapVersion({
  //       eventApiProductVersionId: EventApiProductVersionId,
  //       requestBody: {
  //         messagingServiceId: TheMessagingService.id,
  //         supportedProtocols: ['AMQP', 'MQTT', 'REST']
  //       }
  //     });
  //     GatewayMessagingServiceId = gatewayMessagingServiceResponse.data.id;
  //   } catch(e) {
  //     if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
  //     expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
  //     expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
  //   }
  // });
});
