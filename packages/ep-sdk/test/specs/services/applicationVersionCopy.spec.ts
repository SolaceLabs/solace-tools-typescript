import "mocha";
import { expect } from "chai";
import path from "path";
import { 
  TestContext, 
  TestUtils 
} from "@internal/tools/src";
import { 
  TestLogger, 
  TestConfig, 
  TEnumInfo, 
  TSchemaInfo, 
  TEventInfo, 
  TApplicationInfo,
  TestService
} from "../../lib";
import {
  ApiError,
  Application,
  ApplicationsResponse,
  ApplicationsService,
  ApplicationVersion,
  EnumsService,
  EventsResponse,
  EventsService,
  SchemasResponse,
  SchemasService,
  TopicAddressEnumsResponse,
} from "@solace-labs/ep-openapi-node";
import {
  EpSdkError,
  EpSdkApplicationsService,
  EpSdkApplicationVersionsService,
  EpSdkCustomAttributeNameSourceApplicationDomainId,
} from "../../../src";

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId: string = TestUtils.getUUID();
let TargetApplicationDomainName: string;
let TargetApplicationDomainId: string | undefined;


const setCreateEnumInfoList = (): Array<TEnumInfo> => {
  for(const enumInfo of CreateEnumInfoList) {
    enumInfo.applicationDomainName = `${TestConfig.getAppId()}/${enumInfo.applicationDomainName}`;
  }
  return CreateEnumInfoList;
}
const CreateEnumInfoList: Array<TEnumInfo> = [
  {
    enumName: "_enum_name_0_",
    versionInfoList: [{ versionString: "1.0.0" }, { versionString: "1.1.0" }],
    enumValues: ["_enum_name_0_one", "_enum_name_0_two", "_enum_name_0_three"],
    applicationDomainName: `${TestSpecName}/source_enum_0`
  },
  {
    enumName: "_enum_name_1_",
    versionInfoList: [{ versionString: "1.0.0" }, { versionString: "1.1.0" }],
    enumValues: ["_enum_name_1_one", "_enum_name_1_two", "_enum_name_1_three"],
    applicationDomainName: `${TestSpecName}/source_enum_1`
  },
  {
    enumName: "_enum_name_2_",
    versionInfoList: [{ versionString: "1.0.0" }, { versionString: "1.1.0" }],
    enumValues: ["_enum_name_2_one", "_enum_name_2_two", "_enum_name_2_three"],
    applicationDomainName: `${TestSpecName}/source_enum_2`
  },
];
let SourceEnumInfoList: Array<TEnumInfo> = [];

const SchemaContent = `
{
  "type": "object",
  "properties": {
    "hello": {
      "type": "string"
    }
  }
}
`;
const setCreateSchemaInfoList = (): Array<TSchemaInfo> => {
  for(const schemaInfo of CreateSchemaInfoList) {
    schemaInfo.applicationDomainName = `${TestConfig.getAppId()}/${schemaInfo.applicationDomainName}`;
  }
  return CreateSchemaInfoList;
}
const CreateSchemaInfoList: Array<TSchemaInfo> = [
  {
    schemaName: "_schema_name_0_",
    versionInfoList: [{ versionString: "1.0.0" }, { versionString: "1.1.0" }],
    schemaContent: SchemaContent,
    applicationDomainName: `${TestSpecName}/source_schema_0`
  },
  {
    schemaName: "_schema_name_1_",
    versionInfoList: [{ versionString: "1.0.0" }, { versionString: "1.1.0" }],
    schemaContent: SchemaContent,
    applicationDomainName: `${TestSpecName}/source_schema_1`
  },
  {
    schemaName: "_schema_name_2_",
    versionInfoList: [{ versionString: "1.0.0" }, { versionString: "1.1.0" }],
    schemaContent: SchemaContent,
    applicationDomainName: `${TestSpecName}/source_schema_2`
  },
];
let SourceSchemaInfoList: Array<TSchemaInfo> = [];

const setCreateEventInfoList = (): Array<TEventInfo> => {
  for(const eventInfo of CreateEventInfoList) {
    eventInfo.applicationDomainName = `${TestConfig.getAppId()}/${eventInfo.applicationDomainName}`;
  }
  return CreateEventInfoList;
}
const CreateEventInfoList: Array<TEventInfo> = [
  {
    eventName: "_event_name_0_",
    versionInfoList: [{ versionString: "1.0.0" }, { versionString: "1.1.0" }],
    applicationDomainName: `${TestSpecName}/source_event_0`
  },
  {
    eventName: "_event_name_1_",
    versionInfoList: [{ versionString: "1.0.0" }, { versionString: "1.1.0" }],
    applicationDomainName: `${TestSpecName}/source_event_1`
  },
  {
    eventName: "_event_name_2_",
    versionInfoList: [{ versionString: "1.0.0" }, { versionString: "1.1.0" }],
    applicationDomainName: `${TestSpecName}/source_event_2`
  },
];
let SourceEventInfoList: Array<TEventInfo> = [];

const setCreateApplicationInfoList = (): Array<TApplicationInfo> => {
  for(const applicationInfo of CreateApplicationInfoList) {
    applicationInfo.applicationDomainName = `${TestConfig.getAppId()}/${applicationInfo.applicationDomainName}`;
  }
  return CreateApplicationInfoList;
}
const CreateApplicationInfoList: Array<TApplicationInfo> = [
  {
    applicationName: "_application_0_",
    versionInfoList: [{ versionString: "1.0.0" }, { versionString: "1.1.0" }],
    applicationDomainName: `${TestSpecName}/source_application_0`
  }
];
let SourceApplicationInfoList: Array<TApplicationInfo> = [];

const deepCopyApplications = async() => {
  for(const applicationInfo of SourceApplicationInfoList) {
    // get latest source version
    const latestSourceApplicationVersion: ApplicationVersion = await EpSdkApplicationVersionsService.getLatestVersionForApplicationId({
      applicationDomainId: applicationInfo.applicationDomainId,
      applicationId: applicationInfo.sourceApplicationId
    });
    const copied: ApplicationVersion | undefined = await EpSdkApplicationVersionsService.deepCopyLastestVersionById_IfNotExists({
      applicationName: applicationInfo.applicationName,
      fromApplicationDomainId: applicationInfo.applicationDomainId,
      toApplicationDomainId: TargetApplicationDomainId,
    });
    if(copied !== undefined) {
      applicationInfo.targetApplicationId = copied.applicationId;
      // get latest target version
      const latestTargetApplicationVersion: ApplicationVersion = await EpSdkApplicationVersionsService.getLatestVersionForApplicationId({
        applicationDomainId: TargetApplicationDomainId,
        applicationId: copied.applicationId,
      });
      const sourceCompare: Partial<ApplicationVersion> = createCompareObject(latestSourceApplicationVersion);
      const targetCompare: Partial<ApplicationVersion> = createCompareObject(latestTargetApplicationVersion);
      let message = TestLogger.createLogMessage("source & target", {
        sourceCompare: sourceCompare,
        targetCompare: targetCompare,
      });
      expect(sourceCompare, message).to.be.deep.equal(targetCompare);
      message = TestLogger.createLogMessage("copied & latest", {
        copiedApplicationVersion: copied,
        latestTargetApplicationVersion,
      });
      expect(copied, message).to.be.deep.equal(latestTargetApplicationVersion);
      // // DEBUG
      // expect(false, message).to.be.true;
      // verify attribute
      const targetApplication: Application = await EpSdkApplicationsService.getById({
        applicationId: latestTargetApplicationVersion.applicationId
      });
      const sourceApplicationDomainAttribute = targetApplication.customAttributes.find( (x) => { return x.customAttributeDefinitionName === EpSdkCustomAttributeNameSourceApplicationDomainId; });
      expect(sourceApplicationDomainAttribute,'EpSdkCustomAttributeNameSourceApplicationDomainId is undefined').to.not.be.undefined;
      expect(sourceApplicationDomainAttribute.value, 'sourceApplicationDomainAttribute.value is wrong').to.equal(applicationInfo.applicationDomainId);
    }
  }
}

const createCompareObject = (applicationVersion: ApplicationVersion): Partial<ApplicationVersion> => {
  return {
    version: applicationVersion.version,
    description: applicationVersion.description,
    displayName: applicationVersion.displayName,
    stateId: applicationVersion.stateId,
  };
};

const verifyNumberOfObjects = async () => {
  // test number of applications in target domain
  const applicationsResponse: ApplicationsResponse = await ApplicationsService.getApplications({
    applicationDomainId: TargetApplicationDomainId,
  });
  expect(applicationsResponse.data.length, "number of applications in target domain failed").to.equal(SourceApplicationInfoList.length);
  // test number of application versions for each applications
  for (const application of applicationsResponse.data) {
    expect(application.numberOfVersions, "number of application versions in target domain failed").to.equal(1);
  }
  // test number of events in target domain
  const eventsResponse: EventsResponse = await EventsService.getEvents({
    applicationDomainId: TargetApplicationDomainId,
  });
  expect(eventsResponse.data.length, "number of events in target domain failed").to.equal(SourceEventInfoList.length);
  // test number of event versions for each event
  for (const event of eventsResponse.data) {
    expect(event.numberOfVersions, "number of event versions in target domain failed").to.equal(1);
  }
  // test number of schemas in target domain
  const schemasResponse: SchemasResponse = await SchemasService.getSchemas({
    applicationDomainId: TargetApplicationDomainId,
  });
  expect(schemasResponse.data.length, "number of schemas in target domain failed").to.equal(SourceSchemaInfoList.length);
  for (const schema of schemasResponse.data) {
    expect(schema.numberOfVersions, "number of schema versions in target domain failed").to.equal(1);
  }
  // test number of enums in target domain
  const topicAddressEnumsResponse: TopicAddressEnumsResponse = await EnumsService.getEnums({
    applicationDomainId: TargetApplicationDomainId,
  });
  expect(topicAddressEnumsResponse.data.length, "number of enums in target domain failed").to.equal(SourceEnumInfoList.length);
  for (const topicAddress of topicAddressEnumsResponse.data) {
    expect(topicAddress.numberOfVersions, "number of enum versions in target domain failed").to.equal(1);
  }
};

const initializeGlobals = () => {
  TargetApplicationDomainName = `${TestConfig.getAppId()}/${TestSpecName}/target`;
  setCreateEnumInfoList();
  setCreateSchemaInfoList();
  setCreateEventInfoList();
  setCreateApplicationInfoList();
};

describe(`${scriptName}`, () => {
  before(async () => {
    initializeGlobals();
    TestContext.newItId();
    console.log(`\t>>> ${scriptName}: preparing domains ...`);

    const targetApplicationDomain = await TestService.absentPresentApplicationDomain({ applicationDomainName: TargetApplicationDomainName });
    TargetApplicationDomainId = targetApplicationDomain.id;

    await TestService.absentApplicationDomains({
      applicationDomainNames: CreateApplicationInfoList.map( (x) => { return x.applicationDomainName; }).concat(
        CreateEventInfoList.map( (x) => { return x.applicationDomainName; })
      ).concat(
        CreateSchemaInfoList.map( (x) => { return x.applicationDomainName; })
      ).concat(
        CreateEnumInfoList.map( (x) => { return x.applicationDomainName; })
      )
    });
  });

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async () => {
    TestContext.newItId();
    console.log(`\t>>> ${scriptName}: deleting domains ...`);
    await TestService.absentApplicationDomain({ applicationDomainName: TargetApplicationDomainName });  
    await TestService.absentApplicationDomains({
      applicationDomainNames: CreateApplicationInfoList.map( (x) => { return x.applicationDomainName; }).concat(
        CreateEventInfoList.map( (x) => { return x.applicationDomainName; })
      ).concat(
        CreateSchemaInfoList.map( (x) => { return x.applicationDomainName; })
      ).concat(
        CreateEnumInfoList.map( (x) => { return x.applicationDomainName; })
      )
    });
  });

  it(`${scriptName}: should create source enums`, async () => {
    try {
      SourceEnumInfoList = await TestService.createEnums({ enumInfoList: CreateEnumInfoList });
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should create source schemas`, async () => {
    try {
      SourceSchemaInfoList = await TestService.createSchemas({ schemaInfoList: CreateSchemaInfoList });
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should create source events`, async () => {
    try {
      SourceEventInfoList = await TestService.createEvents({ 
        eventInfoList: CreateEventInfoList,
        schemaInfoList: SourceSchemaInfoList,
        enumInfoList: SourceEnumInfoList
      });
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should create source applications`, async () => {
    try {
      SourceApplicationInfoList = await TestService.createApplications({ 
        applicationInfoList: CreateApplicationInfoList,  
        eventInfoList: SourceEventInfoList      
      });
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should deep copy application versions from source domains to target domains`, async () => {
    try {
      await deepCopyApplications();
      await verifyNumberOfObjects();
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: deep copy applications again, idempotency: should not create any new objects`, async () => {
    try {
      await deepCopyApplications();
      await verifyNumberOfObjects();
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  // it(`${scriptName}: should delete old versions and create new target event api versions`, async () => {
  //   try {
  //     let idx = 0;
  //     for (const eventApiInfo of EventApiInfoList) {
  //       for (const versionInfo of eventApiInfo.versionInfoList) {
  //         // delete the version
  //         const latestTargetEventApiVersion: EventApiVersion =
  //           await EpSdkEventApiVersionsService.getLatestVersionForEventApiId({
  //             applicationDomainId: TargetApplicationDomainId,
  //             eventApiId: eventApiInfo.targetEventApiId,
  //           });
  //         await EventApIsService.deleteEventApiVersion({
  //           versionId: latestTargetEventApiVersion.id,
  //         });
  //         const epSdkEventApiVersionTask = new EpSdkEventApiVersionTask({
  //           epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
  //           applicationDomainId: TargetApplicationDomainId,
  //           eventApiId: eventApiInfo.targetEventApiId,
  //           versionString: versionInfo.versionString,
  //           versionStrategy: EEpSdk_VersionTaskStrategy.BUMP_MINOR,
  //           eventApiVersionSettings: {
  //             stateId: EpSdkStatesService.releasedId,
  //             displayName: `new target version`,
  //             description: `new target description`,
  //             producedEventVersionIds: [],
  //             consumedEventVersionIds: [],
  //           },
  //         });
  //         const epSdkEventApiVersionTask_ExecuteReturn: IEpSdkEventApiVersionTask_ExecuteReturn =
  //           await epSdkEventApiVersionTask.execute();
  //         versionInfo.versionId =
  //           epSdkEventApiVersionTask_ExecuteReturn.epObject.id;
  //       }
  //       idx++;
  //     }
  //   } catch (e) {
  //     if (e instanceof ApiError)
  //       expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
  //     expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
  //       .to.be.true;
  //     expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
  //       .true;
  //   }
  // });

  // it(`${scriptName}: should NOT copy event api version from source domain to target domain because a version exists`, async () => {
  //   try {
  //     for (const eventApiInfo of EventApiInfoList) {
  //       // get latest target version
  //       const latestTargetEventApiVersion: EventApiVersion =
  //         await EpSdkEventApiVersionsService.getLatestVersionForEventApiId({
  //           applicationDomainId: TargetApplicationDomainId,
  //           eventApiId: eventApiInfo.targetEventApiId,
  //         });
  //       // copy
  //       const copiedEventApiVersion: EventApiVersion | undefined =
  //         await EpSdkEventApiVersionsService.deepCopyLastestVersionById_IfNotExists(
  //           {
  //             fromApplicationDomainId: SourceApplicationDomainId,
  //             toApplicationDomainId: TargetApplicationDomainId,
  //             fromAssetsApplicationDomainId: SourceAssetsApplicationDomainId,
  //             toAssetsApplicationDomainId: TargetAssetsApplicationDomainId,
  //             eventApiName: eventApiInfo.eventApiName,
  //           }
  //         );
  //       expect(copiedEventApiVersion, "copiedEventApiVersion is undefined").to
  //         .be.undefined;
  //       // const message = TestLogger.createLogMessage('latest target & copied target', {
  //       //   latestTargetEventApiVersion: latestTargetEventApiVersion,
  //       //   copiedEventApiVersion: copiedEventApiVersion
  //       // });
  //       // expect(latestTargetEventApiVersion, message).to.be.deep.equal(copiedEventApiVersion);

  //       // const latestTargetCompare: Partial<EventApiVersion> = createCompareObject(latestTargetEventApiVersion);
  //       // const copiedCompare: Partial<EventApiVersion> = createCompareObject(copiedEventApiVersion);
  //       // expect(latestTargetCompare, message).to.be.deep.equal(copiedCompare);
  //       // // // DEBUG
  //       // expect(false, message).to.be.true;
  //     }
  //   } catch (e) {
  //     if (e instanceof ApiError)
  //       expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
  //     expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
  //       .to.be.true;
  //     expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
  //       .true;
  //   }
  // });
});
