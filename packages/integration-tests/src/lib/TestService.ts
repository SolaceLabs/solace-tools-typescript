import { expect } from "chai";
import {
  ApiError,
} from "@solace-labs/ep-openapi-node";
import {
  EEpSdkTask_TargetState,
  EpSdkApplicationDomainTask,
  EpSdkEpEventTask,
  EpSdkSchemaTask,
  IEpSdkEpEventTask_ExecuteReturn,
  IEpSdkSchemaTask_ExecuteReturn,
  EpSdkEventApiTask,
  IEpSdkEventApiTask_ExecuteReturn
} from "@solace-labs/ep-sdk";
import { TestLogger } from "./TestLogger";

export class TestService {

  public static applicationDomainAbsent = async({ applicationDomainName }: {
    applicationDomainName: string;
  }): Promise<undefined> => {
    const funcName = "applicationDomainAbsent";
    const logName = `${TestService.name}.${funcName}()`;
    try {
      const epSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
        applicationDomainName: applicationDomainName,
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
      });
      const epSdkApplicationDomainTask_ExecuteReturn = await epSdkApplicationDomainTask.execute('xContextId');
      return undefined;
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(`${logName}: ${e.message}`)).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage(logName, e)).to.be.true;
    }
  };

  public static applicationDomainPresent = async({ applicationDomainName }: {
    applicationDomainName: string;
  }): Promise<string> => {
    const funcName = "applicationDomainPresent";
    const logName = `${TestService.name}.${funcName}()`;
    try {
      const epSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
        applicationDomainName: applicationDomainName,
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      });
      const epSdkApplicationDomainTask_ExecuteReturn = await epSdkApplicationDomainTask.execute('xContextId');
      if(epSdkApplicationDomainTask_ExecuteReturn.epObject.id === undefined) throw new Error('epSdkApplicationDomainTask_ExecuteReturn.epObject.id === undefined');
      return epSdkApplicationDomainTask_ExecuteReturn.epObject.id;
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(`${logName}: ${e.message}`)).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage(logName, e)).to.be.true;
    }
  };

  public static schemaAbsent = async({ applicationDomainId, schemaName }:{
    applicationDomainId: string;
    schemaName: string;
  }): Promise<undefined> => {
    const funcName = "schemaAbsent";
    const logName = `${TestService.name}.${funcName}()`;
    try {
      const epSdkSchemaTask = new EpSdkSchemaTask({ epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT, applicationDomainId, schemaName });
      const epSdkSchemaTask_ExecuteReturn: IEpSdkSchemaTask_ExecuteReturn = await epSdkSchemaTask.execute('xContextId');
      return undefined;
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(`${logName}: ${e.message}`)).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage(logName, e)).to.be.true;
    }
  }

  public static eventAbsent = async({ applicationDomainId, eventName }:{
    applicationDomainId: string;
    eventName: string;
  }): Promise<undefined> => {
    const funcName = "eventAbsent";
    const logName = `${TestService.name}.${funcName}()`;
    try {
      const epSdkEpEventTask = new EpSdkEpEventTask({ epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT, applicationDomainId, eventName });
      const epSdkEpEventTask_ExecuteReturn: IEpSdkEpEventTask_ExecuteReturn = await epSdkEpEventTask.execute('xContextId');
      return undefined;
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(`${logName}: ${e.message}`)).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage(logName, e)).to.be.true;
    }
  }

  public static eventApiAbsent = async({ applicationDomainId, eventApiName }:{
    applicationDomainId: string;
    eventApiName: string;
  }): Promise<undefined> => {
    const funcName = "eventApiAbsent";
    const logName = `${TestService.name}.${funcName}()`;
    try {
      const epSdkEventApiTask = new EpSdkEventApiTask({ epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT, applicationDomainId, eventApiName });
      const epSdkEventApiTask_ExecuteReturn: IEpSdkEventApiTask_ExecuteReturn = await epSdkEventApiTask.execute('xContextId');
      return undefined;
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(`${logName}: ${e.message}`)).to.be.true;
      expect(false, TestLogger.createApiTestFailMessage(logName, e)).to.be.true;
    }
  }

}
