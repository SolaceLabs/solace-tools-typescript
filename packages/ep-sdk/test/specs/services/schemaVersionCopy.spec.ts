import "mocha";
import { expect } from "chai";
import path from "path";
import { TestContext, TestUtils } from "@internal/tools/src";
import { TestLogger, TestConfig } from "../../lib";
import { ApiError, SchemaObject, SchemaVersion } from "@solace-labs/ep-openapi-node";
import {
  EpSdkError,
  EpSdkApplicationDomainsService,
  EEpSdkSchemaType,
  EpSdkStatesService,
  EpSdkApplicationDomainTask,
  IEpSdkApplicationDomainTask_ExecuteReturn,
  EEpSdkTask_TargetState,
  EEpSdk_VersionTaskStrategy,
  EpSdkSchemaTask,
  IEpSdkSchemaTask_ExecuteReturn,
  EpSdkSchemaVersionTask,
  IEpSdkSchemaVersionTask_ExecuteReturn,
  EpSdkSchemaVersionsService,
  EpSdkSchemasService,
} from "../../../src";

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId: string = TestUtils.getUUID();
let SourceApplicationDomainName: string;
let SourceApplicationDomainId: string | undefined;
let TargetApplicationDomainName: string;
let TargetApplicationDomainId: string | undefined;

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
type TSchemaVersionInfo = {
  versionString: string;
  schemaVersionId?: string;
};
type TSchemaInfo = {
  schemaName: string;
  isShared: boolean;
  schemaContent: string;
  versionInfoList: Array<TSchemaVersionInfo>;
  sourceSchemaId?: string;
  targetSchemaId?: string;
};
const SchemaInfoList: Array<TSchemaInfo> = [
  {
    schemaName: "_schema_name_0_",
    isShared: true,
    versionInfoList: [{ versionString: "1.0.0" }, { versionString: "1.1.0" }],
    schemaContent: SchemaContent,
  },
  {
    schemaName: "_schema_name_1_",
    isShared: false,
    versionInfoList: [{ versionString: "1.0.0" }, { versionString: "1.1.0" }],
    schemaContent: SchemaContent,
  },
  {
    schemaName: "_schema_name_2_",
    isShared: true,
    versionInfoList: [{ versionString: "1.0.0" }, { versionString: "1.1.0" }],
    schemaContent: SchemaContent,
  },
];

const createCompareObject = (schemaObject: SchemaObject, schemaVersion: SchemaVersion): Partial<SchemaVersion & SchemaObject> => {
  return {
    shared: schemaObject.shared,
    version: schemaVersion.version,
    description: schemaVersion.description,
    displayName: schemaVersion.displayName,
    stateId: schemaVersion.stateId,
    content: schemaVersion.content,
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

  it(`${scriptName}: should create source schemas`, async () => {
    try {
      for (const schemaInfo of SchemaInfoList) {
        const epSdkSchemaTask = new EpSdkSchemaTask({
          epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
          applicationDomainId: SourceApplicationDomainId,
          schemaName: schemaInfo.schemaName,
          schemaObjectSettings: {
            shared: schemaInfo.isShared,
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
          versionInfo.schemaVersionId = epSdkSchemaVersionTask_ExecuteReturn.epObject.id;
        }
      }
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should copy schema versions from source domain to target domain`, async () => {
    try {
      for (const schemaInfo of SchemaInfoList) {
        // get the source schema
        const sourceSchema = await EpSdkSchemasService.getById({ schemaId: schemaInfo.sourceSchemaId });
        // get latest source version
        const latestSourceSchemaVersion: SchemaVersion = await EpSdkSchemaVersionsService.getLatestVersionForSchemaId({
          applicationDomainId: SourceApplicationDomainId,
          schemaId: schemaInfo.sourceSchemaId,
        });
        // copy
        const copiedSchemaVersion: SchemaVersion = await EpSdkSchemaVersionsService.copyLastestVersionById_IfNotExists({
          schemaVersionId: latestSourceSchemaVersion.id,
          toApplicationDomainId: TargetApplicationDomainId,
        });
        schemaInfo.targetSchemaId = copiedSchemaVersion.schemaId;
        // get the target schema
        const targetSchema = await EpSdkSchemasService.getById({ schemaId: schemaInfo.targetSchemaId });
        // get latest target version
        const latestTargetSchemaVersion: SchemaVersion = await EpSdkSchemaVersionsService.getLatestVersionForSchemaId({
          applicationDomainId: TargetApplicationDomainId,
          schemaId: copiedSchemaVersion.schemaId,
        });
        let message = TestLogger.createLogMessage("source & target", {
          sourceSchema,
          latestSourceSchemaVersion,
          targetSchema,
          latestTargetSchemaVersion,
        });
        const sourceCompare = createCompareObject(sourceSchema, latestSourceSchemaVersion );
        const targetCompare = createCompareObject(targetSchema, latestTargetSchemaVersion );
        expect(sourceCompare, message).to.be.deep.equal(targetCompare);
        message = TestLogger.createLogMessage("copied & latest", {
          copiedSchemaVersion: copiedSchemaVersion,
          latestTargetSchemaVersion: latestTargetSchemaVersion,
        });
        expect(copiedSchemaVersion, message).to.be.deep.equal(latestTargetSchemaVersion);
        // // DEBUG
        // expect(false, message).to.be.true;
      }
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should create new target schema versions`, async () => {
    try {
      for (const schemaInfo of SchemaInfoList) {
        for (const versionInfo of schemaInfo.versionInfoList) {
          const epSdkSchemaVersionTask = new EpSdkSchemaVersionTask({
            epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
            applicationDomainId: TargetApplicationDomainId,
            schemaId: schemaInfo.targetSchemaId,
            versionString: versionInfo.versionString,
            versionStrategy: EEpSdk_VersionTaskStrategy.BUMP_MINOR,
            schemaVersionSettings: {
              stateId: EpSdkStatesService.releasedId,
              displayName: "new target version",
              description: "new target description",
              content: schemaInfo.schemaContent,
            },
          });
          const epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn = await epSdkSchemaVersionTask.execute();
          versionInfo.schemaVersionId = epSdkSchemaVersionTask_ExecuteReturn.epObject.id;
        }
      }
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should NOT copy schema version from source domain to target domain because a version exists`, async () => {
    try {
      for (const schemaInfo of SchemaInfoList) {
        // get latest source version
        const latestSourceSchemaVersion: SchemaVersion = await EpSdkSchemaVersionsService.getLatestVersionForSchemaId({
          applicationDomainId: SourceApplicationDomainId,
          schemaId: schemaInfo.sourceSchemaId,
        });
        // get latest target version
        const latestTargetSchemaVersion: SchemaVersion = await EpSdkSchemaVersionsService.getLatestVersionForSchemaId({
          applicationDomainId: TargetApplicationDomainId,
          schemaId: schemaInfo.targetSchemaId,
        });
        // copy
        const copiedSchemaVersion: SchemaVersion = await EpSdkSchemaVersionsService.copyLastestVersionById_IfNotExists({
          schemaVersionId: latestSourceSchemaVersion.id,
          toApplicationDomainId: TargetApplicationDomainId,
        });
        const message = TestLogger.createLogMessage("latest target & copied target", {
          latestTargetSchemaVersion: latestTargetSchemaVersion,
          copiedSchemaVersion: copiedSchemaVersion,
        });
        // get the target schema
        const targetSchema = await EpSdkSchemasService.getById({ schemaId: latestTargetSchemaVersion.schemaId });
        const latestTargetCompare = createCompareObject(targetSchema, latestTargetSchemaVersion);
        const copiedSchema = await EpSdkSchemasService.getById({ schemaId: copiedSchemaVersion.schemaId });
        const copiedCompare = createCompareObject(copiedSchema, copiedSchemaVersion);
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

  // ************************************************************************
  // avro schemas
  // ************************************************************************

  const AvroSchemaName = "AvroSchemaName";
  let AvroSourceSchemaId: string;
  let AvroSourceSchemaVersionId: string;
  let AvroTargetSchemaVersionId: string;

  it(`${scriptName}: should create source avro schema`, async () => {
    try {
      const epSdkSchemaTask = new EpSdkSchemaTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: SourceApplicationDomainId,
        schemaName: AvroSchemaName,
        schemaObjectSettings: {
          shared: true,
          schemaType: EEpSdkSchemaType.AVRO,
        },
      });
      const epSdkSchemaTask_ExecuteReturn: IEpSdkSchemaTask_ExecuteReturn = await epSdkSchemaTask.execute();
      AvroSourceSchemaId = epSdkSchemaTask_ExecuteReturn.epObject.id;

      const epSdkSchemaVersionTask = new EpSdkSchemaVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: SourceApplicationDomainId,
        schemaId: AvroSourceSchemaId,
        versionString: "1.0.0",
        schemaVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: "displayName",
          description: "description",
          content: SchemaContent,
        },
      });
      const epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn = await epSdkSchemaVersionTask.execute();
      AvroSourceSchemaVersionId = epSdkSchemaVersionTask_ExecuteReturn.epObject.id;
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });

  it(`${scriptName}: should copy avro schema version from source domain to target domain`, async () => {
    try {
      // get latest source version
      const latestSourceSchemaVersion: SchemaVersion = await EpSdkSchemaVersionsService.getLatestVersionForSchemaId({
        applicationDomainId: SourceApplicationDomainId,
        schemaId: AvroSourceSchemaId,
      });
      // copy
      const copiedSchemaVersion: SchemaVersion = await EpSdkSchemaVersionsService.copyLastestVersionById_IfNotExists({
        schemaVersionId: latestSourceSchemaVersion.id,
        toApplicationDomainId: TargetApplicationDomainId,
      });
      AvroTargetSchemaVersionId = copiedSchemaVersion.schemaId;
      // get latest target version
      const latestTargetSchemaVersion: SchemaVersion = await EpSdkSchemaVersionsService.getLatestVersionForSchemaId({
        applicationDomainId: TargetApplicationDomainId,
        schemaId: copiedSchemaVersion.schemaId,
      });
      let message = TestLogger.createLogMessage("source & target", {
        latestSourceSchemaVersion: latestSourceSchemaVersion,
        latestTargetSchemaVersion: latestTargetSchemaVersion,
      });
      const sourceSchema = await EpSdkSchemasService.getById({ schemaId: latestSourceSchemaVersion.schemaId });
      const sourceCompare = createCompareObject(sourceSchema, latestSourceSchemaVersion);
      const targetSchema = await EpSdkSchemasService.getById({ schemaId: latestTargetSchemaVersion.schemaId });
      const targetCompare = createCompareObject(targetSchema, latestTargetSchemaVersion);
      expect(sourceCompare, message).to.be.deep.equal(targetCompare);
      message = TestLogger.createLogMessage("copied & latest", {
        copiedSchemaVersion: copiedSchemaVersion,
        latestTargetSchemaVersion: latestTargetSchemaVersion,
      });
      expect(copiedSchemaVersion, message).to.be.deep.equal(latestTargetSchemaVersion);
    } catch (e) {
      if (e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be.true;
    }
  });
});
