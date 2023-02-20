import "mocha";
import { expect } from "chai";
import path from "path";
import { TestContext, TestUtils } from "@internal/tools/src";
import { TestLogger } from "../../lib";
import { ApiError } from "@solace-labs/ep-openapi-node";
import {
  EpSdkError,
  EpSdkStatesService,
  EEpSdkStateDTONames,
} from "../../../src";

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId: string = TestUtils.getUUID();

const initializeGlobals = () => {};

describe(`${scriptName}`, () => {
  before(() => {
    initializeGlobals();
  });

  beforeEach(() => {
    TestContext.newItId();
  });

  it(`${scriptName}: should validate stateDTOs`, async () => {
    try {
      const xvoid: void = await EpSdkStatesService.validateStates({});
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should get Ids by Name`, async () => {
    try {
      let getId: string = EpSdkStatesService.getEpStateIdByName({
        epSdkStateDTOName: EEpSdkStateDTONames.DRAFT,
      });
      expect(
        getId,
        TestLogger.createTestFailMessage(
          `getId=${getId} !== ${EpSdkStatesService.draftId}`
        )
      ).to.eq(EpSdkStatesService.draftId);
      getId = EpSdkStatesService.getEpStateIdByName({
        epSdkStateDTOName: EEpSdkStateDTONames.RELEASED,
      });
      expect(
        getId,
        TestLogger.createTestFailMessage(
          `getId=${getId} !== ${EpSdkStatesService.releasedId}`
        )
      ).to.eq(EpSdkStatesService.releasedId);
      getId = EpSdkStatesService.getEpStateIdByName({
        epSdkStateDTOName: EEpSdkStateDTONames.RETIRED,
      });
      expect(
        getId,
        TestLogger.createTestFailMessage(
          `getId=${getId} !== ${EpSdkStatesService.retiredId}`
        )
      ).to.eq(EpSdkStatesService.retiredId);
      getId = EpSdkStatesService.getEpStateIdByName({
        epSdkStateDTOName: EEpSdkStateDTONames.DEPRECATED,
      });
      expect(
        getId,
        TestLogger.createTestFailMessage(
          `getId=${getId} !== ${EpSdkStatesService.deprecatedId}`
        )
      ).to.eq(EpSdkStatesService.deprecatedId);
    } catch (e) {
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: should get state DTO names by Id`, async () => {
    try {
      let getName = EpSdkStatesService.getStateDTONameByEpStateId({
        stateId: EpSdkStatesService.draftId,
      });
      expect(
        getName,
        TestLogger.createTestFailMessage(
          `getName=${getName} !== ${EEpSdkStateDTONames.DRAFT}`
        )
      ).to.eq(EEpSdkStateDTONames.DRAFT);
      getName = EpSdkStatesService.getStateDTONameByEpStateId({
        stateId: EpSdkStatesService.releasedId,
      });
      expect(
        getName,
        TestLogger.createTestFailMessage(
          `getName=${getName} !== ${EEpSdkStateDTONames.RELEASED}`
        )
      ).to.eq(EEpSdkStateDTONames.RELEASED);
      getName = EpSdkStatesService.getStateDTONameByEpStateId({
        stateId: EpSdkStatesService.deprecatedId,
      });
      expect(
        getName,
        TestLogger.createTestFailMessage(
          `getName=${getName} !== ${EEpSdkStateDTONames.DEPRECATED}`
        )
      ).to.eq(EEpSdkStateDTONames.DEPRECATED);
      getName = EpSdkStatesService.getStateDTONameByEpStateId({
        stateId: EpSdkStatesService.retiredId,
      });
      expect(
        getName,
        TestLogger.createTestFailMessage(
          `getName=${getName} !== ${EEpSdkStateDTONames.RETIRED}`
        )
      ).to.eq(EEpSdkStateDTONames.RETIRED);
    } catch (e) {
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });
});
