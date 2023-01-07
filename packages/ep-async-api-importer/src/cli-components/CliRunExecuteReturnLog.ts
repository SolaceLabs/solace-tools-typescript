import { 
  EnumsService, 
  EventsService, 
  EventVersion, 
  EventVersionResponse, 
  TopicAddressEnumVersion, 
  TopicAddressEnumVersionResponse 
} from "@rjgu/ep-openapi-node";
import { 
  EEpSdkObjectTypes, 
  IEpSdkEnumVersionTask_ExecuteReturn, 
  IEpSdkEpEventVersionTask_ExecuteReturn, 
  IEpSdkEventApiVersionTask_ExecuteReturn, 
  IEpSdkSchemaVersionTask_ExecuteReturn, 
  IEpSdkTask_ExecuteReturn, 
  IEpSdkVersionTask_EpObjectKeys, 
  TEpSdkDeepDiffFromTo 
} from "@rjgu/ep-sdk";
import { CliEPApiContentError } from "./CliError";

export interface ICliRunExecuteReturnLogEntry {
  epSdkTask_ExecuteReturn: IEpSdkTask_ExecuteReturn;
}

class CliRunExecuteReturnLog {
  private cliRunExecuteReturnLog: Array<ICliRunExecuteReturnLogEntry> = [];

  public reset = () => {
    this.cliRunExecuteReturnLog = [];
  }

  public add = (epSdkTask_ExecuteReturn: IEpSdkTask_ExecuteReturn) => {
    this.cliRunExecuteReturnLog.push({ 
      epSdkTask_ExecuteReturn: epSdkTask_ExecuteReturn
    });
  }

  public get = (): Array<ICliRunExecuteReturnLogEntry> => {
    return this.cliRunExecuteReturnLog;
  };

  private async getEventVersionRequestedUpdates(epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn): Promise<any> {
    const funcName = 'getEventVersionRequestedUpdates';
    const logName = `${CliRunExecuteReturnLog.name}.${funcName}()`;

    const difference: Record<string, TEpSdkDeepDiffFromTo> | undefined = epSdkEpEventVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_IsUpdateRequiredFuncReturn?.difference;
    let deepDifference: any = {};

    if(difference) {
      for(const key in difference) {
        if(key.includes("schemaVersionId")) {
          const fromTo: TEpSdkDeepDiffFromTo = difference[key];
          // find the from schema version id in log
          const cliRunExecuteReturnLogEntry: ICliRunExecuteReturnLogEntry | undefined = this.cliRunExecuteReturnLog.find( (x: ICliRunExecuteReturnLogEntry) => {
            if(x.epSdkTask_ExecuteReturn.epObjectKeys.epObjectType === EEpSdkObjectTypes.SCHEMA_VERSION) {
              const epVersionObjectKeys: IEpSdkVersionTask_EpObjectKeys = x.epSdkTask_ExecuteReturn.epSdkTask_TransactionLogData.epObjectKeys as IEpSdkVersionTask_EpObjectKeys;
              return epVersionObjectKeys.epVersionObjectId === fromTo.to;
            }
            return false;
          });
          if(cliRunExecuteReturnLogEntry === undefined) {
            deepDifference = {
              ...deepDifference,
              schemaVersion: {
                requestedUpdates: 'unknown',
                schemaVersionId: fromTo.from
              }
            };
          } else {
            const epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn = cliRunExecuteReturnLogEntry.epSdkTask_ExecuteReturn;
            const schemaVersion: any = {
              displayName: epSdkSchemaVersionTask_ExecuteReturn.epObject.displayName,
              version: epSdkSchemaVersionTask_ExecuteReturn.epObject.version,
              requestedUpdates: epSdkSchemaVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_IsUpdateRequiredFuncReturn?.difference
            };

            deepDifference = {
              ...deepDifference,
              schemaVersion: schemaVersion
            };
          }
        } else if(key.includes("enumVersionId")) {
          // "deliveryDescriptor.address.addressLevels.3.enumVersionId": {
          //   "from": "wr40ofd43gd",
          //   "to": "tge39wjlg07"
          // }
          const fromTo: TEpSdkDeepDiffFromTo = difference[key];
          // find the from enum version id in log
          const cliRunExecuteReturnLogEntry: ICliRunExecuteReturnLogEntry | undefined = this.cliRunExecuteReturnLog.find( (x: ICliRunExecuteReturnLogEntry) => {
            if(x.epSdkTask_ExecuteReturn.epObjectKeys.epObjectType === EEpSdkObjectTypes.ENUM_VERSION) {
              const epVersionObjectKeys: IEpSdkVersionTask_EpObjectKeys = x.epSdkTask_ExecuteReturn.epSdkTask_TransactionLogData.epObjectKeys as IEpSdkVersionTask_EpObjectKeys;
              return epVersionObjectKeys.epVersionObjectId === fromTo.to;
            }
            return false;
          });
          if(cliRunExecuteReturnLogEntry === undefined) {
            // enum was removed
            // get if from the platform
            const topicAddressEnumVersionResponse: TopicAddressEnumVersionResponse = await EnumsService.getEnumVersion({
              versionId: fromTo.from
            });
            /* istanbul ignore next */
            if(topicAddressEnumVersionResponse.data === undefined) throw new CliEPApiContentError(logName, 'topicAddressEnumVersionResponse.data === undefined', {
              topicAddressEnumVersionResponse: topicAddressEnumVersionResponse
            });
            const topicAddressEnumVersion: TopicAddressEnumVersion = topicAddressEnumVersionResponse.data;
            deepDifference[key] = {
              removed: {
                displayName: topicAddressEnumVersion.displayName,
                version: topicAddressEnumVersion.version
              }
            };  
          } else {
            const epSdkEnumVersionTask_ExecuteReturn: IEpSdkEnumVersionTask_ExecuteReturn = cliRunExecuteReturnLogEntry.epSdkTask_ExecuteReturn;
            const enumVersion: any = {
              displayName: epSdkEnumVersionTask_ExecuteReturn.epObject.displayName,
              version: epSdkEnumVersionTask_ExecuteReturn.epObject.version,
              requestedUpdates: epSdkEnumVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_IsUpdateRequiredFuncReturn?.difference
            };
            deepDifference[key] = enumVersion;  
          }
        } else {
          // other: add the key
          deepDifference[key] = difference[key];
        }
      }
    }
    return deepDifference;
  }

  private async getEventVersionRemovedRequestedUpdates(eventVersionId: string): Promise<any> {
    const funcName = 'getEventVersionRemovedRequestedUpdates';
    const logName = `${CliRunExecuteReturnLog.name}.${funcName}()`;

    const cliRunExecuteReturnLogEntry: ICliRunExecuteReturnLogEntry | undefined = this.cliRunExecuteReturnLog.find( (x: ICliRunExecuteReturnLogEntry) => {
      if(x.epSdkTask_ExecuteReturn.epObjectKeys.epObjectType === EEpSdkObjectTypes.EVENT_VERSION) {
        const epVersionObjectKeys: IEpSdkVersionTask_EpObjectKeys = x.epSdkTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_GetFuncReturn?.epObjectKeys as IEpSdkVersionTask_EpObjectKeys;
        return epVersionObjectKeys.epVersionObjectId === eventVersionId;
      }
      return false;
    });
    if(cliRunExecuteReturnLogEntry === undefined) {
      // get if from the platform
      const eventVersionResponse: EventVersionResponse = await EventsService.getEventVersion({
        id: eventVersionId
      });
      /* istanbul ignore next */
      if(eventVersionResponse.data === undefined) throw new CliEPApiContentError(logName, 'eventVersionResponse.data === undefined', {
        eventVersionResponse: eventVersionResponse
      });
      const eventVersion: EventVersion = eventVersionResponse.data;
      return {
        removed: {
          displayName: eventVersion.displayName,
          version: eventVersion.version,
        }
      };
    }
    const epSdkEnumVersionTask_ExecuteReturn: IEpSdkEnumVersionTask_ExecuteReturn = cliRunExecuteReturnLogEntry.epSdkTask_ExecuteReturn;
    return {
      removed: {
        displayName: epSdkEnumVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_GetFuncReturn?.epObject.displayName,
        version: epSdkEnumVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_GetFuncReturn?.epObject.version,
      }
    };
  }

  public async getDeepRequestedUpdates(epSdkEventApiVersionTask_ExecuteReturn: IEpSdkEventApiVersionTask_ExecuteReturn): Promise<any> {
    // const funcName = 'getDeepRequestedUpdates';
    // const logName = `${CliRunExecuteReturnLog.name}.${funcName}()`;

    const difference: Record<string, TEpSdkDeepDiffFromTo> | undefined = epSdkEventApiVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_IsUpdateRequiredFuncReturn?.difference;
    let deepDifference: any = {};
    const eventVersions: any = {};
    if(difference) {
      // DEBUG
      // console.log(`>>>>>>>>>>>>>>>>>>>> ${logName} - difference=${JSON.stringify(difference, null, 2)}`);
      for(const key in difference) {
        // DEBUG
        // console.log(`>>>>>>>>>>>>>>>>>>>> ${logName} - key=${key}`)
        if(key.includes("EventVersionIds")) {
          const fromTo: TEpSdkDeepDiffFromTo = difference[key];
          // find the from event version id in log
          const cliRunExecuteReturnLogEntry: ICliRunExecuteReturnLogEntry | undefined = this.cliRunExecuteReturnLog.find( (x: ICliRunExecuteReturnLogEntry) => {
            if(x.epSdkTask_ExecuteReturn.epObjectKeys.epObjectType === EEpSdkObjectTypes.EVENT_VERSION) {
              const epVersionObjectKeys: IEpSdkVersionTask_EpObjectKeys = x.epSdkTask_ExecuteReturn.epSdkTask_TransactionLogData.epObjectKeys as IEpSdkVersionTask_EpObjectKeys;
              return epVersionObjectKeys.epVersionObjectId === fromTo.to;
            }
            return false;
          });
          // there may not be a 'to' when event removed
          if(cliRunExecuteReturnLogEntry === undefined) {
            // const eventVersions: any = {};
            eventVersions[key] = {
              requestedUpdates: await this.getEventVersionRemovedRequestedUpdates(fromTo.from)
            };
            deepDifference = {
              ...deepDifference,
              eventVersions: eventVersions
            };  
          } else {
            const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn = cliRunExecuteReturnLogEntry.epSdkTask_ExecuteReturn;
            // const eventVersions: any = {};
            eventVersions[key] = {
              displayName: epSdkEpEventVersionTask_ExecuteReturn.epObject.displayName,
              version: epSdkEpEventVersionTask_ExecuteReturn.epObject.version,
              requestedUpdates: await this.getEventVersionRequestedUpdates(epSdkEpEventVersionTask_ExecuteReturn)
            };
            deepDifference = {
              ...deepDifference,
              eventVersions: eventVersions
            };  
          }
        } else {
          // other: add the key
          deepDifference[key] = difference[key];
        }
      }
    }
    return {
      ...deepDifference,
      eventVersions: eventVersions
    };  
  }
}

export default new CliRunExecuteReturnLog();