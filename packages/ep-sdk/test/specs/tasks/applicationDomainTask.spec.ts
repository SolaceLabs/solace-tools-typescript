import "mocha";
import { expect } from "chai";
import path from "path";
import { TestContext, TestUtils } from "@internal/tools/src";
import { TestLogger, TestConfig } from "../../lib";
import { ApiError } from "@solace-labs/ep-openapi-node";
import {
  EpSdkError,
  EpSdkApplicationDomainsService,
  EpSdkApplicationDomainTask,
  IEpSdkApplicationDomainTask_ExecuteReturn,
  EEpSdkTask_Action,
  EEpSdkTask_TargetState,
} from "../../../src";

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");
const TestSpecName = scriptName;
const TestSpecId = TestUtils.getUUID();

let ApplicationDomainName: string;
let ApplicationDomainId: string | undefined;

const initializeGlobals = () => {
  ApplicationDomainName = `${TestConfig.getAppId()}/tasks/${TestSpecName}`;
  // EpSdkLogger.getLoggerInstance().setLogLevel(EEpSdkLogLevel.Trace);
};

describe(`${scriptName}`, () => {
  before(() => {
    TestContext.newItId();
    initializeGlobals();
  });

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async () => {
    TestContext.newItId();
    try {
      await EpSdkApplicationDomainsService.deleteById({
        applicationDomainId: ApplicationDomainId,
      });
    } catch (e) {}
  });

  it(`${scriptName}: application domain present: checkmode create`, async () => {
    try {
      const epSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainName: ApplicationDomainName,
        applicationDomainSettings: {
          // description:
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: true,
      });

      const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn =
        await epSdkApplicationDomainTask.execute();

      const message = TestLogger.createLogMessage(
        "epSdkApplicationDomainTask_ExecuteReturn",
        epSdkApplicationDomainTask_ExecuteReturn
      );
      expect(
        epSdkApplicationDomainTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.WOULD_CREATE);

      // // DEBUG
      // expect(false, message).to.be.true;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: application domain present: create`, async () => {
    try {
      const epSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainName: ApplicationDomainName,
        applicationDomainSettings: {
          // description:
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
      });

      const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn =
        await epSdkApplicationDomainTask.execute();

      const message = TestLogger.createLogMessage(
        "epSdkApplicationDomainTask_ExecuteReturn",
        epSdkApplicationDomainTask_ExecuteReturn
      );
      expect(
        epSdkApplicationDomainTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.CREATE);

      ApplicationDomainId =
        epSdkApplicationDomainTask_ExecuteReturn.epObject.id;

      // // DEBUG
      // expect(false, message).to.be.true;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: application domain present: create: nothing to do`, async () => {
    try {
      const epSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainName: ApplicationDomainName,
        applicationDomainSettings: {
          // description:
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
      });

      const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn =
        await epSdkApplicationDomainTask.execute();

      const message = TestLogger.createLogMessage(
        "epSdkApplicationDomainTask_ExecuteReturn",
        epSdkApplicationDomainTask_ExecuteReturn
      );
      expect(
        epSdkApplicationDomainTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.NO_ACTION);
      expect(
        epSdkApplicationDomainTask_ExecuteReturn.epObject.id,
        message
      ).to.eq(ApplicationDomainId);

      // // DEBUG
      // expect(false, message).to.be.true;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: application domain present: checkmode update`, async () => {
    try {
      const epSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainName: ApplicationDomainName,
        applicationDomainSettings: {
          description: "updated description",
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
        checkmode: true,
      });

      const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn =
        await epSdkApplicationDomainTask.execute();

      const message = TestLogger.createLogMessage(
        "epSdkApplicationDomainTask_ExecuteReturn",
        epSdkApplicationDomainTask_ExecuteReturn
      );
      expect(
        epSdkApplicationDomainTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.WOULD_UPDATE);
      expect(
        epSdkApplicationDomainTask_ExecuteReturn.epObject.id,
        message
      ).to.eq(ApplicationDomainId);

      // // DEBUG
      // expect(false, message).to.be.true;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: application domain present: update`, async () => {
    try {
      const epSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainName: ApplicationDomainName,
        applicationDomainSettings: {
          description: "updated description",
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
      });

      const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn =
        await epSdkApplicationDomainTask.execute();

      const message = TestLogger.createLogMessage(
        "epSdkApplicationDomainTask_ExecuteReturn",
        epSdkApplicationDomainTask_ExecuteReturn
      );
      expect(
        epSdkApplicationDomainTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.UPDATE);
      expect(
        epSdkApplicationDomainTask_ExecuteReturn.epObject.id,
        message
      ).to.eq(ApplicationDomainId);
      // // DEBUG
      // expect(false, message).to.be.true;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: application domain present: no action`, async () => {
    try {
      const epSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainName: ApplicationDomainName,
        applicationDomainSettings: {
          description: "updated description",
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: "parentTransactionId",
          groupTransactionId: "groupTransactionId",
        },
      });

      const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn =
        await epSdkApplicationDomainTask.execute();

      const message = TestLogger.createLogMessage(
        "epSdkApplicationDomainTask_ExecuteReturn",
        epSdkApplicationDomainTask_ExecuteReturn
      );
      expect(
        epSdkApplicationDomainTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.NO_ACTION);
      expect(
        epSdkApplicationDomainTask_ExecuteReturn.epObject.id,
        message
      ).to.eq(ApplicationDomainId);
      // // DEBUG
      // expect(false, message).to.be.true;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: application domain absent: checkmode with existing`, async () => {
    try {
      const epSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        applicationDomainName: ApplicationDomainName,
        checkmode: true,
      });

      const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn =
        await epSdkApplicationDomainTask.execute();

      const message = TestLogger.createLogMessage(
        "epSdkApplicationDomainTask_ExecuteReturn",
        epSdkApplicationDomainTask_ExecuteReturn
      );
      expect(
        epSdkApplicationDomainTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.WOULD_DELETE);
      expect(
        epSdkApplicationDomainTask_ExecuteReturn.epObject.id,
        message
      ).to.eq(ApplicationDomainId);
      // // DEBUG
      // expect(false, message).to.be.true;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: application domain absent`, async () => {
    try {
      const epSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        applicationDomainName: ApplicationDomainName,
      });

      const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn =
        await epSdkApplicationDomainTask.execute();

      const message = TestLogger.createLogMessage(
        "epSdkApplicationDomainTask_ExecuteReturn",
        epSdkApplicationDomainTask_ExecuteReturn
      );
      expect(
        epSdkApplicationDomainTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.DELETE);
      expect(
        epSdkApplicationDomainTask_ExecuteReturn.epObject.id,
        message
      ).to.eq(ApplicationDomainId);
      // // DEBUG
      // expect(false, message).to.be.true;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });

  it(`${scriptName}: application domain absent: checkmode with non-existing`, async () => {
    try {
      const epSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        applicationDomainName: ApplicationDomainName,
        checkmode: true,
      });

      const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn =
        await epSdkApplicationDomainTask.execute();

      const message = TestLogger.createLogMessage(
        "epSdkApplicationDomainTask_ExecuteReturn",
        epSdkApplicationDomainTask_ExecuteReturn
      );
      expect(
        epSdkApplicationDomainTask_ExecuteReturn.epSdkTask_TransactionLogData
          .epSdkTask_Action,
        message
      ).to.eq(EEpSdkTask_Action.NO_ACTION);
      // // DEBUG
      // expect(false, message).to.be.true;
    } catch (e) {
      if (e instanceof ApiError)
        expect(false, TestLogger.createApiTestFailMessage("failed")).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e))
        .to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage("failed", e)).to.be
        .true;
    }
  });
});
