import "mocha";
import { expect } from "chai";
import path from "path";
import { TestContext, TestUtils } from "@internal/tools/src";
import { TestLogger, TestConfig } from "../../lib";
import {
  ApiError,
  EventVersion,
  SchemaVersion,
} from "@solace-labs/ep-openapi-node";
import {
  EpSdkError,
  EpSdkApplicationDomainsService,
  EpSdkStatesService,
  EpSdkApplicationDomainTask,
  IEpSdkApplicationDomainTask_ExecuteReturn,
  EEpSdkTask_TargetState,
  EEpSdk_VersionTaskStrategy,
  EpSdkSchemaTask,
  IEpSdkSchemaTask_ExecuteReturn,
  EpSdkSchemaVersionTask,
  IEpSdkSchemaVersionTask_ExecuteReturn,
  EpSdkEnumTask,
  IEpSdkEnumTask_ExecuteReturn,
  EpSdkEnumVersionTask,
  IEpSdkEnumVersionTask_ExecuteReturn,
  EpSdkEpEventTask,
  IEpSdkEpEventTask_ExecuteReturn,
  EpSdkEpEventVersionTask,
  IEpSdkEpEventVersionTask_ExecuteReturn,
  EpSdkSchemaVersionsService,
  EpSdkEpEventVersionsService,
} from "../../../src";

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId: string = TestUtils.getUUID();
let SourceApplicationDomainName: string;
let SourceApplicationDomainId: string | undefined;
let TargetApplicationDomainName: string;
let TargetApplicationDomainId: string | undefined;

type TVersionInfo = {
  versionString: string;
  versionId?: string;
};
type TEnumInfo = {
  enumName: string;
  enumValues: Array<string>;
  versionInfoList: Array<TVersionInfo>;
  sourceEnumId?: string;
  targetEnumId?: string;
};
const EnumInfoList: Array<TEnumInfo> = [
  {
    enumName: "_enum_name_0_",
    versionInfoList: [{ versionString: "1.0.0" }, { versionString: "1.1.0" }],
    enumValues: ["_enum_name_0_one", "_enum_name_0_two", "_enum_name_0_three"],
  },
  {
    enumName: "_enum_name_1_",
    versionInfoList: [{ versionString: "1.0.0" }, { versionString: "1.1.0" }],
    enumValues: ["_enum_name_1_one", "_enum_name_1_two", "_enum_name_1_three"],
  },
  {
    enumName: "_enum_name_2_",
    versionInfoList: [{ versionString: "1.0.0" }, { versionString: "1.1.0" }],
    enumValues: ["_enum_name_2_one", "_enum_name_2_two", "_enum_name_2_three"],
  },
];

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
type TSchemaInfo = {
  schemaName: string;
  schemaContent: string;
  versionInfoList: Array<TVersionInfo>;
  sourceSchemaId?: string;
  targetSchemaId?: string;
};
const SchemaInfoList: Array<TSchemaInfo> = [
  {
    schemaName: "_schema_name_0_",
    versionInfoList: [{ versionString: "1.0.0" }, { versionString: "1.1.0" }],
    schemaContent: SchemaContent,
  },
  {
    schemaName: "_schema_name_1_",
    versionInfoList: [{ versionString: "1.0.0" }, { versionString: "1.1.0" }],
    schemaContent: SchemaContent,
  },
  {
    schemaName: "_schema_name_2_",
    versionInfoList: [{ versionString: "1.0.0" }, { versionString: "1.1.0" }],
    schemaContent: SchemaContent,
  },
];

type TEventInfo = {
  eventName: string;
  versionInfoList: Array<TVersionInfo>;
  sourceEventId?: string;
  targetEventId?: string;
};
const EventInfoList: Array<TEventInfo> = [
  {
    eventName: "_event_name_0_",
    versionInfoList: [{ versionString: "1.0.0" }, { versionString: "1.1.0" }],
  },
  {
    eventName: "_event_name_1_",
    versionInfoList: [{ versionString: "1.0.0" }, { versionString: "1.1.0" }],
  },
  {
    eventName: "_event_name_2_",
    versionInfoList: [{ versionString: "1.0.0" }, { versionString: "1.1.0" }],
  },
];

// const getLatestVersionIdFromList = (versionInfoList: Array<any>): any | undefined => {
//   const funcName = 'getLatestVersionIdFromList';
//   const logName = `${scriptName}.${funcName}()`;

//   let latestVersionString: string = '0.0.0';
//   let versionId: string = '';
//   for (const versionInfo of versionInfoList) {
//     if(versionInfo.versionString === undefined) throw new Error(`${logName}: versionInfo.versionString === undefined`);
//     if(versionInfo.versionId === undefined) throw new Error(`${logName}: versionInfo.versionId === undefined`);
//     const newVersionString: string = versionInfo.versionString;
//     if (EpSdkSemVerUtils.is_NewVersion_GreaterThan_OldVersion({
//       newVersionString: newVersionString,
//       oldVersionString: latestVersionString,
//     })) {
//       latestVersionString = newVersionString;
//       versionId = versionInfo.versionId;
//     }
//   }
//   return versionId;
// }

const createCompareObject = (
  eventVersion: EventVersion
): Partial<EventVersion> => {
  return {
    version: eventVersion.version,
    description: eventVersion.description,
    displayName: eventVersion.displayName,
    stateId: eventVersion.stateId,
    deliveryDescriptor: {
      brokerType: eventVersion.deliveryDescriptor.brokerType,
      address: {
        addressType: eventVersion.deliveryDescriptor.address.addressType,
        addressLevels:
          eventVersion.deliveryDescriptor.address.addressLevels.map((x) => {
            return {
              addressLevelType: x.addressLevelType,
              name: x.name,
            };
          }),
      },
    },
  };
};

const initializeGlobals = () => {
  SourceApplicationDomainName = `${TestConfig.getAppId()}/services/${TestSpecName}/source`;
  TargetApplicationDomainName = `${TestConfig.getAppId()}/services/${TestSpecName}/target`;
};

describe(`${scriptName}`, () => {
  before(async () => {
    initializeGlobals();
    TestContext.newItId();
    const sourceEpSdkApplicationDomainTask_absent = new EpSdkApplicationDomainTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
      applicationDomainName: SourceApplicationDomainName,
    });
    await sourceEpSdkApplicationDomainTask_absent.execute();
    const sourceEpSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainName: SourceApplicationDomainName,
    });
    const sourceEpSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await sourceEpSdkApplicationDomainTask.execute();
    SourceApplicationDomainId = sourceEpSdkApplicationDomainTask_ExecuteReturn.epObject.id;
    const targetEpSdkApplicationDomainTask_absent = new EpSdkApplicationDomainTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
      applicationDomainName: TargetApplicationDomainName,
    });
    await targetEpSdkApplicationDomainTask_absent.execute();
    const targetEpSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainName: TargetApplicationDomainName,
    });
    const targetEpSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await targetEpSdkApplicationDomainTask.execute();
    TargetApplicationDomainId = targetEpSdkApplicationDomainTask_ExecuteReturn.epObject.id;
  });

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async () => {
    TestContext.newItId();
    // delete application domains
    await EpSdkApplicationDomainsService.deleteById({ applicationDomainId: SourceApplicationDomainId });
    await EpSdkApplicationDomainsService.deleteById({ applicationDomainId: TargetApplicationDomainId });
  });

  it(`${scriptName}: should create source enums`, async () => {
    try {
      for (const enumInfo of EnumInfoList) {
        const epSdkEnumTask = new EpSdkEnumTask({
          epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
          applicationDomainId: SourceApplicationDomainId,
          enumName: enumInfo.enumName,
          enumObjectSettings: {
            shared: true,
          },
        });
        const epSdkEnumTask_ExecuteReturn: IEpSdkEnumTask_ExecuteReturn = await epSdkEnumTask.execute();
        enumInfo.sourceEnumId = epSdkEnumTask_ExecuteReturn.epObject.id;
        for (const versionInfo of enumInfo.versionInfoList) {
          const epSdkEnumVersionTask = new EpSdkEnumVersionTask({
            epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
            applicationDomainId: SourceApplicationDomainId,
            enumId: enumInfo.sourceEnumId,
            versionString: versionInfo.versionString,
            enumVersionSettings: {
              stateId: EpSdkStatesService.releasedId,
              displayName: versionInfo.versionString,
            },
            enumValues: enumInfo.enumValues,
          });
          const epSdkEnumVersionTask_ExecuteReturn: IEpSdkEnumVersionTask_ExecuteReturn = await epSdkEnumVersionTask.execute();
          versionInfo.versionId = epSdkEnumVersionTask_ExecuteReturn.epObject.id;
        }
      }
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should create source schemas`, async () => {
    try {
      for (const schemaInfo of SchemaInfoList) {
        const epSdkSchemaTask = new EpSdkSchemaTask({
          epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
          applicationDomainId: SourceApplicationDomainId,
          schemaName: schemaInfo.schemaName,
          schemaObjectSettings: {
            shared: true,
          },
        });
        const epSdkSchemaTask_ExecuteReturn: IEpSdkSchemaTask_ExecuteReturn = await epSdkSchemaTask.execute();
        schemaInfo.sourceSchemaId = epSdkSchemaTask_ExecuteReturn.epObject.id;
        for (const versionInfo of schemaInfo.versionInfoList) {
          const epSdkSchemaVersionTask = new EpSdkSchemaVersionTask({
            epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
            applicationDomainId: SourceApplicationDomainId,
            schemaId: schemaInfo.sourceSchemaId,
            versionString: versionInfo.versionString,
            schemaVersionSettings: {
              stateId: EpSdkStatesService.releasedId,
              displayName: versionInfo.versionString,
              description: "description",
              content: schemaInfo.schemaContent,
            },
          });
          const epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn = await epSdkSchemaVersionTask.execute();
          versionInfo.versionId = epSdkSchemaVersionTask_ExecuteReturn.epObject.id;
        }
      }
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should create source events`, async () => {
    try {
      let idx = 0;
      for (const eventInfo of EventInfoList) {
        const epSdkEpEventTask = new EpSdkEpEventTask({
          epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
          applicationDomainId: SourceApplicationDomainId,
          eventName: eventInfo.eventName,
          eventObjectSettings: {
            shared: true,
          },
        });
        const epSdkEpEventTask_ExecuteReturn: IEpSdkEpEventTask_ExecuteReturn = await epSdkEpEventTask.execute();
        eventInfo.sourceEventId = epSdkEpEventTask_ExecuteReturn.epObject.id;
        let versionInfoIdx = 0;
        for (const versionInfo of eventInfo.versionInfoList) {
          // get latest schema version id
          // const latestSchemaVersionId: string = getLatestVersionIdFromList(SchemaInfoList[idx].versionInfoList);
          const epSdkEpEventVersionTask = new EpSdkEpEventVersionTask({
            epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
            applicationDomainId: SourceApplicationDomainId,
            eventId: eventInfo.sourceEventId,
            versionString: versionInfo.versionString,
            topicString: `one/two/{${EnumInfoList[idx].enumName}}/{unboundVariable}`,
            eventVersionSettings: {
              stateId: EpSdkStatesService.releasedId,
              displayName: versionInfo.versionString,
              description: "description",
              schemaVersionId:
                SchemaInfoList[idx].versionInfoList[versionInfoIdx].versionId,
            },
          });
          const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn = await epSdkEpEventVersionTask.execute();
          versionInfo.versionId = epSdkEpEventVersionTask_ExecuteReturn.epObject.id;
          versionInfoIdx++;
        }
        idx++;
      }
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should copy event versions from source domain to target domain`, async () => {
    try {
      let idx = 0;
      for (const eventInfo of EventInfoList) {
        // get latest source version
        const latestSourceEventVersion: EventVersion = await EpSdkEpEventVersionsService.getLatestVersionForEventId({
          applicationDomainId: SourceApplicationDomainId,
          eventId: eventInfo.sourceEventId,
        });
        // copy
        const copiedEventVersion: EventVersion = await EpSdkEpEventVersionsService.deepCopyLastestVersionById_IfNotExists({
          eventVersionId: latestSourceEventVersion.id,
          toApplicationDomainId: TargetApplicationDomainId,
        });
        eventInfo.targetEventId = copiedEventVersion.eventId;
        // get latest target version
        const latestTargetEventVersion: EventVersion = await EpSdkEpEventVersionsService.getLatestVersionForEventId({
          applicationDomainId: TargetApplicationDomainId,
          eventId: copiedEventVersion.eventId,
        });
        const sourceCompare: Partial<EventVersion> = createCompareObject(latestSourceEventVersion);
        const targetCompare: Partial<EventVersion> = createCompareObject(latestTargetEventVersion);
        let message = TestLogger.createLogMessage("source & target", {
          sourceCompare: sourceCompare,
          targetCompare: targetCompare,
        });
        expect(sourceCompare, message).to.be.deep.equal(targetCompare);
        message = TestLogger.createLogMessage("copied & latest", {
          copiedEventVersion: copiedEventVersion,
          latestTargetEventVersion: latestTargetEventVersion,
        });
        expect(copiedEventVersion, message).to.be.deep.equal(latestTargetEventVersion);
        // // DEBUG
        // expect(false, message).to.be.true;
      }
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should create new target event versions`, async () => {
    try {
      let idx = 0;
      for (const eventInfo of EventInfoList) {
        for (const versionInfo of eventInfo.versionInfoList) {
          // get the target schema versions
          const latestSchemaVersion: SchemaVersion = await EpSdkSchemaVersionsService.getLatestVersionForSchemaName({
            applicationDomainId: TargetApplicationDomainId,
            schemaName: SchemaInfoList[idx].schemaName,
          });
          const epSdkEventVersionTask = new EpSdkEpEventVersionTask({
            epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
            applicationDomainId: TargetApplicationDomainId,
            eventId: eventInfo.targetEventId,
            versionString: versionInfo.versionString,
            versionStrategy: EEpSdk_VersionTaskStrategy.BUMP_MINOR,
            topicString: `one/two/{${EnumInfoList[idx].enumName}}`,
            eventVersionSettings: {
              stateId: EpSdkStatesService.releasedId,
              displayName: "new target version",
              description: "new target description",
              schemaVersionId: latestSchemaVersion.id,
            },
          });
          const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn = await epSdkEventVersionTask.execute();
          versionInfo.versionId = epSdkEpEventVersionTask_ExecuteReturn.epObject.id;
        }
        idx++;
      }
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should NOT copy event version from source domain to target domain because a version exists`, async () => {
    try {
      for (const eventInfo of EventInfoList) {
        // get latest source version
        const latestSourceEventVersion: EventVersion =
          await EpSdkEpEventVersionsService.getLatestVersionForEventId({
            applicationDomainId: SourceApplicationDomainId,
            eventId: eventInfo.sourceEventId,
          });
        // get latest target version
        const latestTargetEventVersion: EventVersion =
          await EpSdkEpEventVersionsService.getLatestVersionForEventId({
            applicationDomainId: TargetApplicationDomainId,
            eventId: eventInfo.targetEventId,
          });
        // copy
        const copiedEventVersion: EventVersion = await EpSdkEpEventVersionsService.deepCopyLastestVersionById_IfNotExists({
          toApplicationDomainId: TargetApplicationDomainId,
          eventVersionId: latestSourceEventVersion.id,
        });
        const message = TestLogger.createLogMessage("latest target & copied target", {
          latestTargetEventVersion: latestTargetEventVersion,
          copiedEventVersion: copiedEventVersion,
        });
        const latestTargetCompare: Partial<EventVersion> = createCompareObject(latestTargetEventVersion);
        const copiedCompare: Partial<EventVersion> = createCompareObject(copiedEventVersion);
        expect(latestTargetCompare, message).to.be.deep.equal(copiedCompare);
        // // DEBUG
        // expect(false, message).to.be.true;
      }
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });
});
