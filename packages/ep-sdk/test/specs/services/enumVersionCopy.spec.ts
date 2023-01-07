import 'mocha';
import { expect } from 'chai';
import path from 'path';
import { 
  ApiError, 
  TopicAddressEnumVersion,
} from '@rjgu/ep-openapi-node';
import {
  TestContext,
} from '@internal/tools/src';
import { 
  TestLogger,
  TestConfig,
} from '../../lib';
import { 
  EpSdkError,
  EpSdkApplicationDomainsService,
  EpSdkStatesService,
  EpSdkApplicationDomainTask,
  IEpSdkApplicationDomainTask_ExecuteReturn,
  EEpSdkTask_TargetState,
  EpSdkEnumTask,
  IEpSdkEnumTask_ExecuteReturn,
  EpSdkEnumVersionTask,
  IEpSdkEnumVersionTask_ExecuteReturn,
  EpSdkEnumVersionsService,
  EEpSdk_VersionTaskStrategy,
} from '../../../src';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
let SourceApplicationDomainName: string;
let SourceApplicationDomainId: string | undefined;
let TargetApplicationDomainName: string;
let TargetApplicationDomainId: string | undefined;

type TEnumVersionInfo = {
  versionString: string;
  enumVersionId?: string;
}
type TEnumInfo = {
  enumName: string;
  enumValues: Array<string>;
  versionInfoList: Array<TEnumVersionInfo>;
  sourceEnumId?: string;
  targetEnumId?: string;
}
const EnumInfoList: Array<TEnumInfo> = [
  { enumName: '_enum_name_0_', versionInfoList: [{ versionString: '1.0.0' }, { versionString: '1.1.0' }], enumValues: ['_enum_name_0_one', '_enum_name_0_two', '_enum_name_0_three'] },
  { enumName: '_enum_name_1_', versionInfoList: [{ versionString: '1.0.0' }, { versionString: '1.1.0' }], enumValues: ['_enum_name_1_one', '_enum_name_1_two', '_enum_name_1_three'] },
  { enumName: '_enum_name_2_', versionInfoList: [{ versionString: '1.0.0' }, { versionString: '1.1.0' }], enumValues: ['_enum_name_2_one', '_enum_name_2_two', '_enum_name_2_three'] },
];

const createCompareObject = (enumVersion: TopicAddressEnumVersion): Partial<TopicAddressEnumVersion> => {
  return {
    version: enumVersion.version,
    description: enumVersion.description,
    displayName: enumVersion.displayName,
    stateId: enumVersion.stateId,
    values: enumVersion.values.map( (x) => { 
      return {
        value: x.value,
        label: x.label
      }
    })

  };
}

const initializeGlobals = () => {
  SourceApplicationDomainName = `${TestConfig.getAppId()}/services/${TestSpecName}/source`;
  TargetApplicationDomainName = `${TestConfig.getAppId()}/services/${TestSpecName}/target`;
}

describe(`${scriptName}`, () => {

  before(async() => {
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

  after(async() => {
    TestContext.newItId();
    // delete application domains
    await EpSdkApplicationDomainsService.deleteById({ applicationDomainId: SourceApplicationDomainId });
    await EpSdkApplicationDomainsService.deleteById({ applicationDomainId: TargetApplicationDomainId });
  });

  it(`${scriptName}: should create source enums`, async () => {
    try {
      for(const enumInfo of EnumInfoList) {
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
        // // DEBUG
        // expect(false, `enumInfo=${JSON.stringify(enumInfo, null, 2)}`).to.be.true;
        for(const versionInfo of enumInfo.versionInfoList) {
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
          versionInfo.enumVersionId = epSdkEnumVersionTask_ExecuteReturn.epObject.id;  
        }
      }
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should copy enum versions from source domain to target domain`, async () => {
    try {
      for(const enumInfo of EnumInfoList) {
        // get latest source version
        const latestSourceTopicAddressEnumVersion: TopicAddressEnumVersion = await EpSdkEnumVersionsService.getLatestVersionForEnumId({ 
          applicationDomainId: SourceApplicationDomainId,            
          enumId: enumInfo.sourceEnumId 
        });
        // copy
        const copiedTopicAddressEnumVersion: TopicAddressEnumVersion = await EpSdkEnumVersionsService.copyLastestVersionById_IfNotExists({
          enumVersionId: latestSourceTopicAddressEnumVersion.id,
          fromApplicationDomainId: SourceApplicationDomainId,
          toApplicationDomainId: TargetApplicationDomainId,
        });
        enumInfo.targetEnumId = copiedTopicAddressEnumVersion.enumId;
        // get latest target version
        const latestTargetTopicAddressEnumVersion: TopicAddressEnumVersion = await EpSdkEnumVersionsService.getLatestVersionForEnumId({ 
          applicationDomainId: TargetApplicationDomainId,            
          enumId: copiedTopicAddressEnumVersion.enumId, 
        });
        let message = TestLogger.createLogMessage('source & target', {
          latestSourceTopicAddressEnumVersion: latestSourceTopicAddressEnumVersion,
          latestTargetTopicAddressEnumVersion: latestTargetTopicAddressEnumVersion
        });  
        const sourceCompare: Partial<TopicAddressEnumVersion> = createCompareObject(latestSourceTopicAddressEnumVersion);
        const targetCompare: Partial<TopicAddressEnumVersion> = createCompareObject(latestTargetTopicAddressEnumVersion);
        expect(sourceCompare, message).to.be.deep.equal(targetCompare);
        message = TestLogger.createLogMessage('copied & latest', {
          copiedTopicAddressEnumVersion: copiedTopicAddressEnumVersion,
          latestTargetTopicAddressEnumVersion: latestTargetTopicAddressEnumVersion
        }); 
        expect(copiedTopicAddressEnumVersion, message).to.be.deep.equal(latestTargetTopicAddressEnumVersion);
        // // DEBUG
        // expect(false, message).to.be.true;
      }
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should create new target enum versions`, async () => {
    try {
      for(const enumInfo of EnumInfoList) {
        for(const versionInfo of enumInfo.versionInfoList) {
          const epSdkEnumVersionTask = new EpSdkEnumVersionTask({
            epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
            applicationDomainId: TargetApplicationDomainId,
            enumId: enumInfo.targetEnumId,
            versionString: versionInfo.versionString,
            versionStrategy: EEpSdk_VersionTaskStrategy.BUMP_MINOR,
            enumVersionSettings: {
              stateId: EpSdkStatesService.releasedId,
              displayName: 'new target version',
            },
            enumValues: enumInfo.enumValues,
          });  
          const epSdkEnumVersionTask_ExecuteReturn: IEpSdkEnumVersionTask_ExecuteReturn = await epSdkEnumVersionTask.execute();
          versionInfo.enumVersionId = epSdkEnumVersionTask_ExecuteReturn.epObject.id;  
        }
      }
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: should NOT copy enum version from source domain to target domain because a version exists`, async () => {
    try {
      for(const enumInfo of EnumInfoList) {
        // get latest source version
        const latestSourceTopicAddressEnumVersion: TopicAddressEnumVersion = await EpSdkEnumVersionsService.getLatestVersionForEnumId({ 
          applicationDomainId: SourceApplicationDomainId,            
          enumId: enumInfo.sourceEnumId 
        });
        // get latest target version
        const latestTargetTopicAddressEnumVersion: TopicAddressEnumVersion = await EpSdkEnumVersionsService.getLatestVersionForEnumId({ 
          applicationDomainId: TargetApplicationDomainId,            
          enumId: enumInfo.targetEnumId, 
        });
        // copy
        const copiedTopicAddressEnumVersion: TopicAddressEnumVersion = await EpSdkEnumVersionsService.copyLastestVersionById_IfNotExists({
          enumVersionId: latestSourceTopicAddressEnumVersion.id,
          fromApplicationDomainId: SourceApplicationDomainId,
          toApplicationDomainId: TargetApplicationDomainId,
        });
        const message = TestLogger.createLogMessage('latest target & copied target', {
          latestTargetTopicAddressEnumVersion: latestTargetTopicAddressEnumVersion,
          copiedTopicAddressEnumVersion: copiedTopicAddressEnumVersion
        });  
        const latestTargetCompare: Partial<TopicAddressEnumVersion> = createCompareObject(latestTargetTopicAddressEnumVersion);
        const copiedCompare: Partial<TopicAddressEnumVersion> = createCompareObject(copiedTopicAddressEnumVersion);
        expect(latestTargetCompare, message).to.be.deep.equal(copiedCompare);
        // // DEBUG
        // expect(false, message).to.be.true;
      }
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

});

