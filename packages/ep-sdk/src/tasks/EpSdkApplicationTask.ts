import {
  Application,
  ApplicationResponse,
  ApplicationsService,
} from "@solace-labs/ep-openapi-node";
import {
  EpSdkApiContentError,
  EpSdkInternalTaskError,
  EpSdkLogger,
  EEpSdkLoggerCodes,
} from "../utils";
import { EpSdkApplicationsService } from "../services";
import { EEpSdkObjectTypes } from "../types";
import {
  EpSdkTask,
  IEpSdkTask_Config,
  IEpSdkTask_CreateFuncReturn,
  IEpSdkTask_DeleteFuncReturn,
  IEpSdkTask_EpObjectKeys,
  IEpSdkTask_ExecuteReturn,
  IEpSdkTask_GetFuncReturn,
  IEpSdkTask_IsUpdateRequiredFuncReturn,
  IEpSdkTask_Keys,
  IEpSdkTask_UpdateFuncReturn,
} from "./EpSdkTask";

/** @category Tasks */
export type TEpSdkApplicationTask_Settings = Partial<
  Pick<Application, "applicationType" | "brokerType">
>;
type TEpSdkApplicationTask_CompareObject = TEpSdkApplicationTask_Settings;

/** @category Tasks */
export interface IEpSdkApplicationTask_Config extends IEpSdkTask_Config {
  applicationName: string;
  applicationDomainId: string;
  applicationObjectSettings?: TEpSdkApplicationTask_Settings;
}
/** @category Tasks */
export interface IEpSdkApplicationTask_Keys extends IEpSdkTask_Keys {
  applicationName: string;
  applicationDomainId: string;
}
/** @category Tasks */
export interface IEpSdkApplicationTask_GetFuncReturn
  extends Omit<IEpSdkTask_GetFuncReturn, "epObject"> {
  epObject: Application | undefined;
}
/** @category Tasks */
export interface IEpSdkApplicationTask_CreateFuncReturn
  extends Omit<IEpSdkTask_CreateFuncReturn, "epObject"> {
  epObject: Application;
}
/** @category Tasks */
export interface IEpSdkApplicationTask_UpdateFuncReturn
  extends Omit<IEpSdkTask_UpdateFuncReturn, "epObject"> {
  epObject: Application;
}
/** @category Tasks */
export interface IEpSdkApplicationTask_DeleteFuncReturn
  extends Omit<IEpSdkTask_DeleteFuncReturn, "epObject"> {
  epObject: Application;
}
/** @category Tasks */
export interface IEpSdkApplicationTask_ExecuteReturn
  extends Omit<IEpSdkTask_ExecuteReturn, "epObject"> {
  epObject: Application;
}

/** @category Tasks */
export class EpSdkApplicationTask extends EpSdkTask {
  private readonly Empty_IEpSdkApplicationTask_GetFuncReturn: IEpSdkApplicationTask_GetFuncReturn =
    {
      epObjectKeys: this.getDefaultEpObjectKeys(),
      epObject: undefined,
      epObjectExists: false,
    };
  private readonly Default_TEpSdkApplicationTask_Settings: Required<TEpSdkApplicationTask_Settings> =
    {
      applicationType: "standard",
      brokerType: Application.brokerType.SOLACE,
    };
  private getTaskConfig(): IEpSdkApplicationTask_Config {
    return this.epSdkTask_Config as IEpSdkApplicationTask_Config;
  }
  private createObjectSettings(): Required<TEpSdkApplicationTask_Settings> {
    return {
      ...this.Default_TEpSdkApplicationTask_Settings,
      ...this.getTaskConfig().applicationObjectSettings,
    };
  }

  constructor(taskConfig: IEpSdkApplicationTask_Config) {
    super(taskConfig);
  }

  protected getDefaultEpObjectKeys(): IEpSdkTask_EpObjectKeys {
    return {
      epObjectId: "undefined",
      epObjectType: EEpSdkObjectTypes.APPLICATION,
    };
  }

  protected getEpObjectKeys(
    epObject: Application | undefined
  ): IEpSdkTask_EpObjectKeys {
    const funcName = "getEpObjectKeys";
    const logName = `${EpSdkApplicationTask.name}.${funcName}()`;

    if (epObject === undefined) return this.getDefaultEpObjectKeys();
    /* istanbul ignore next */
    if (epObject.id === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "epObject.id === undefined",
        {
          epObject: epObject,
        }
      );
    return {
      ...this.getDefaultEpObjectKeys(),
      epObjectId: epObject.id,
    };
  }

  protected getTaskKeys(): IEpSdkApplicationTask_Keys {
    return {
      applicationName: this.getTaskConfig().applicationName,
      applicationDomainId: this.getTaskConfig().applicationDomainId,
    };
  }

  protected async getFunc(
    epSdkApplicationTask_Keys: IEpSdkApplicationTask_Keys
  ): Promise<IEpSdkApplicationTask_GetFuncReturn> {
    const funcName = "getFunc";
    const logName = `${EpSdkApplicationTask.name}.${funcName}()`;

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_START_GET,
        module: this.constructor.name,
        details: {
          epSdkApplicationTask_Keys: epSdkApplicationTask_Keys,
        },
      })
    );

    const applicationObject: Application | undefined =
      await EpSdkApplicationsService.getByName({
        xContextId: this.xContextId,
        applicationName: epSdkApplicationTask_Keys.applicationName,
        applicationDomainId: epSdkApplicationTask_Keys.applicationDomainId,
      });

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_API_GET,
        module: this.constructor.name,
        details: {
          epSdkApplicationTask_Keys: epSdkApplicationTask_Keys,
          applicationObject: applicationObject
            ? applicationObject
            : "undefined",
        },
      })
    );

    if (applicationObject === undefined)
      return this.Empty_IEpSdkApplicationTask_GetFuncReturn;

    const epSdkApplicationTask_GetFuncReturn: IEpSdkApplicationTask_GetFuncReturn =
      {
        epObjectKeys: this.getEpObjectKeys(applicationObject),
        epObject: applicationObject,
        epObjectExists: true,
      };
    return epSdkApplicationTask_GetFuncReturn;
  }

  protected async isUpdateRequiredFunc(
    epSdkApplicationTask_GetFuncReturn: IEpSdkApplicationTask_GetFuncReturn
  ): Promise<IEpSdkTask_IsUpdateRequiredFuncReturn> {
    const funcName = "isUpdateRequiredFunc";
    const logName = `${EpSdkApplicationTask.name}.${funcName}()`;

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_START_IS_UPDATE_REQUIRED,
        module: this.constructor.name,
        details: {
          epSdkApplicationTask_GetFuncReturn:
            epSdkApplicationTask_GetFuncReturn,
        },
      })
    );

    if (epSdkApplicationTask_GetFuncReturn.epObject === undefined)
      throw new EpSdkInternalTaskError(
        logName,
        this.constructor.name,
        "epSdkApplicationTask_GetFuncReturn.epObject === undefined"
      );

    const existingObject: Application =
      epSdkApplicationTask_GetFuncReturn.epObject;
    const existingCompareObject: TEpSdkApplicationTask_CompareObject = {
      applicationType: existingObject.applicationType,
      brokerType: existingObject.brokerType,
    };
    const requestedCompareObject: TEpSdkApplicationTask_CompareObject =
      this.createObjectSettings();

    const epSdkTask_IsUpdateRequiredFuncReturn: IEpSdkTask_IsUpdateRequiredFuncReturn =
      this.create_IEpSdkTask_IsUpdateRequiredFuncReturn({
        existingObject: existingCompareObject,
        requestedObject: requestedCompareObject,
      });
    // // DEBUG:
    // if(epSdkTask_IsUpdateRequiredFuncReturn.isUpdateRequired) {
    //   EpSdkLogger.debug(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_DONE_IS_UPDATE_REQUIRED, module: this.constructor.name, details: {
    //     epSdkTask_Config: this.epSdkTask_Config,
    //     epSdkTask_IsUpdateRequiredFuncReturn: epSdkTask_IsUpdateRequiredFuncReturn
    //   }}));
    //   throw new Error(`${logName}: check updates required`);
    // }
    return epSdkTask_IsUpdateRequiredFuncReturn;
  }

  protected async createFunc(): Promise<IEpSdkApplicationTask_CreateFuncReturn> {
    const funcName = "createFunc";
    const logName = `${EpSdkApplicationTask.name}.${funcName}()`;

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_START_CREATE,
        module: this.constructor.name,
      })
    );

    const create: Application = {
      ...this.createObjectSettings(),
      applicationDomainId: this.getTaskConfig().applicationDomainId,
      name: this.getTaskConfig().applicationName,
    };

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_CREATE,
        module: this.constructor.name,
        details: {
          epSdkApplicationTask_Config: this.getTaskConfig(),
          create: create,
        },
      })
    );

    if (this.isCheckmode()) {
      return {
        epSdkTask_Action: this.getCreateFuncAction(),
        epObject: create,
        epObjectKeys: this.getEpObjectKeys({
          ...create,
          id: "undefined",
        }),
      };
    }

    const applicationResponse: ApplicationResponse =
      await ApplicationsService.createApplication({
        xContextId: this.xContextId,
        requestBody: create,
      });

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_CREATE,
        module: this.constructor.name,
        details: {
          epSdkApplicationTask_Config: this.getTaskConfig(),
          create: create,
          applicationResponse: applicationResponse,
        },
      })
    );

    /* istanbul ignore next */
    if (applicationResponse.data === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "applicationResponse.data === undefined",
        {
          epSdkApplicationDomainTask_Config: this.getTaskConfig(),
          create: create,
          applicationResponse: applicationResponse,
        }
      );
    return {
      epSdkTask_Action: this.getCreateFuncAction(),
      epObject: applicationResponse.data,
      epObjectKeys: this.getEpObjectKeys(applicationResponse.data),
    };
  }

  protected async updateFunc(
    epSdkApplicationTask_GetFuncReturn: IEpSdkApplicationTask_GetFuncReturn
  ): Promise<IEpSdkApplicationTask_UpdateFuncReturn> {
    const funcName = "updateFunc";
    const logName = `${EpSdkApplicationTask.name}.${funcName}()`;

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_START_UPDATE,
        module: this.constructor.name,
      })
    );

    if (epSdkApplicationTask_GetFuncReturn.epObject === undefined)
      throw new EpSdkInternalTaskError(
        logName,
        this.constructor.name,
        "epSdkApplicationTask_GetFuncReturn.epObject === undefined"
      );
    /* istanbul ignore next */
    if (epSdkApplicationTask_GetFuncReturn.epObject.id === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "epSdkApplicationTask_GetFuncReturn.epObject.id === undefined",
        {
          epObject: epSdkApplicationTask_GetFuncReturn.epObject,
        }
      );

    const update: Application = {
      ...this.createObjectSettings(),
      applicationDomainId: this.getTaskConfig().applicationDomainId,
      name: this.getTaskConfig().applicationName,
    };

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_UPDATE,
        module: this.constructor.name,
        details: {
          epSdkApplicationTask_Config: this.getTaskConfig(),
          update: update,
        },
      })
    );

    if (this.isCheckmode()) {
      const wouldBe_EpObject: Application = {
        ...epSdkApplicationTask_GetFuncReturn.epObject,
        ...update,
      };
      return {
        epSdkTask_Action: this.getUpdateFuncAction(),
        epObject: wouldBe_EpObject,
        epObjectKeys: this.getEpObjectKeys(wouldBe_EpObject),
      };
    }

    const applicationResponse: ApplicationResponse =
      await ApplicationsService.updateApplication({
        xContextId: this.xContextId,
        id: epSdkApplicationTask_GetFuncReturn.epObject.id,
        requestBody: update,
      });

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_UPDATE,
        module: this.constructor.name,
        details: {
          epSdkApplicationDomainTask_Config: this.getTaskConfig(),
          update: update,
          applicationResponse: applicationResponse,
        },
      })
    );

    /* istanbul ignore next */
    if (applicationResponse.data === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "applicationResponse.data === undefined",
        {
          applicationResponse: applicationResponse,
        }
      );
    const epSdkApplicationTask_UpdateFuncReturn: IEpSdkApplicationTask_UpdateFuncReturn =
      {
        epSdkTask_Action: this.getUpdateFuncAction(),
        epObject: applicationResponse.data,
        epObjectKeys: this.getEpObjectKeys(applicationResponse.data),
      };
    return epSdkApplicationTask_UpdateFuncReturn;
  }

  protected async deleteFunc(
    epSdkApplicationTask_GetFuncReturn: IEpSdkApplicationTask_GetFuncReturn
  ): Promise<IEpSdkApplicationTask_DeleteFuncReturn> {
    const funcName = "deleteFunc";
    const logName = `${EpSdkApplicationTask.name}.${funcName}()`;

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.TASK_EXECUTE_START_DELETE,
        module: this.constructor.name,
      })
    );

    if (epSdkApplicationTask_GetFuncReturn.epObject === undefined)
      throw new EpSdkInternalTaskError(
        logName,
        this.constructor.name,
        "epSdkApplicationTask_GetFuncReturn.epObject === undefined"
      );
    /* istanbul ignore next */
    if (epSdkApplicationTask_GetFuncReturn.epObject.id === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "epSdkApplicationTask_GetFuncReturn.epObject.id === undefined",
        {
          epObject: epSdkApplicationTask_GetFuncReturn.epObject,
        }
      );

    if (this.isCheckmode()) {
      return {
        epSdkTask_Action: this.getDeleteFuncAction(),
        epObject: epSdkApplicationTask_GetFuncReturn.epObject,
        epObjectKeys: this.getEpObjectKeys(
          epSdkApplicationTask_GetFuncReturn.epObject
        ),
      };
    }

    const applicationObject: Application =
      await EpSdkApplicationsService.deleteById({
        xContextId: this.xContextId,
        applicationDomainId: this.getTaskConfig().applicationDomainId,
        applicationId: epSdkApplicationTask_GetFuncReturn.epObject.id,
      });

    const epSdkApplicationTask_DeleteFuncReturn: IEpSdkApplicationTask_DeleteFuncReturn =
      {
        epSdkTask_Action: this.getDeleteFuncAction(),
        epObject: applicationObject,
        epObjectKeys: this.getEpObjectKeys(applicationObject),
      };
    return epSdkApplicationTask_DeleteFuncReturn;
  }

  public async execute(xContextId?: string): Promise<IEpSdkApplicationTask_ExecuteReturn> {
    const epSdkTask_ExecuteReturn: IEpSdkApplicationTask_ExecuteReturn =
      await super.execute(xContextId);
    return epSdkTask_ExecuteReturn;
  }
}
