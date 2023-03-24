import { Application, ApplicationDomain } from "@solace-labs/ep-openapi-node";
import { 
  EEpSdkTask_TargetState, 
  EpSdkApplicationDomainTask, 
  EpSdkApplicationTask, 
  EpSdkApplicationVersionTask, 
  EpSdkEnumTask, 
  EpSdkEnumVersionTask, 
  EpSdkEpEventTask, 
  EpSdkEpEventVersionTask, 
  EpSdkSchemaTask, 
  EpSdkSchemaVersionTask, 
  EpSdkSemVerUtils, 
  EpSdkStatesService, 
  IEpSdkApplicationDomainTask_ExecuteReturn, 
  IEpSdkApplicationTask_ExecuteReturn, 
  IEpSdkApplicationVersionTask_ExecuteReturn, 
  IEpSdkEnumTask_ExecuteReturn,
  IEpSdkEnumVersionTask_ExecuteReturn,
  IEpSdkEpEventTask_ExecuteReturn,
  IEpSdkEpEventVersionTask_EnumInfo,
  IEpSdkEpEventVersionTask_ExecuteReturn,
  IEpSdkSchemaTask_ExecuteReturn,
  IEpSdkSchemaVersionTask_ExecuteReturn
} from "../../src";


export type TVersionInfo = {
  versionString: string;
  versionId?: string;
};
export type TEnumInfo = {
  applicationDomainName: string;
  applicationDomainId?: string;
  enumName: string;
  enumValues: Array<string>;
  versionInfoList: Array<TVersionInfo>;
  sourceEnumId?: string;
  targetEnumId?: string;
};

export type TSchemaInfo = {
  applicationDomainName: string;
  applicationDomainId?: string;
  schemaName: string;
  schemaContent: string;
  versionInfoList: Array<TVersionInfo>;
  sourceSchemaId?: string;
  targetSchemaId?: string;
};

export type TEventInfo = {
  applicationDomainName: string;
  applicationDomainId?: string;
  eventName: string;
  versionInfoList: Array<TVersionInfo>;
  sourceEventId?: string;
  targetEventId?: string;
};

export type TApplicationInfo = {
  applicationDomainName: string;
  applicationDomainId?: string;
  applicationName: string;
  versionInfoList: Array<TVersionInfo>;
  sourceApplicationId?: string;
  targetApplicationId?: string;
};


export class TestService {

  public static async absentApplicationDomain({ applicationDomainName }:{
    applicationDomainName: string;
  }): Promise<void> {
    const absentTask = new EpSdkApplicationDomainTask({ epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT, applicationDomainName });
    await absentTask.execute();
  }

  public static async presentApplicationDomain({ applicationDomainName }:{
    applicationDomainName: string;
  }): Promise<ApplicationDomain> {
    const presentTask = new EpSdkApplicationDomainTask({ epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT, applicationDomainName});
    const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await presentTask.execute();
    return epSdkApplicationDomainTask_ExecuteReturn.epObject;
  }

  public static async absentPresentApplicationDomain({ applicationDomainName }:{
    applicationDomainName: string;
  }): Promise<ApplicationDomain> {
    await TestService.absentApplicationDomain({ applicationDomainName });
    const presentTask = new EpSdkApplicationDomainTask({ epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT, applicationDomainName});
    const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await presentTask.execute();
    return epSdkApplicationDomainTask_ExecuteReturn.epObject;
  }

  public static async absentApplicationDomains({ applicationDomainNames }:{
    applicationDomainNames: Array<string>;
  }): Promise<void> {
    const funcName = "absentApplicationDomains";
    const logName = `${TestService.name}.${funcName}`;
    let repeat = 0;
    while (repeat >=0 && repeat < 10) {
      for(const applicationDomainName of applicationDomainNames) { 
        try { 
          await TestService.absentApplicationDomain({ applicationDomainName }); 
          repeat = -1;
        } catch(e) {
          console.log(`repeat=${repeat}, error delete applicationDomainName=${applicationDomainName}, e=${JSON.stringify(e, null, 2)}`);
          repeat++;
        };
       }
    }
    if(repeat > 10) throw new Error(`${logName}: failed to delete all application domains`);
  }

  public static async absentPresentApplicationDomains({ applicationDomainNames }:{
    applicationDomainNames: Array<string>;
  }): Promise<void> {
    await TestService.absentApplicationDomains({ applicationDomainNames });
    for(const applicationDomainName of applicationDomainNames) {
      await TestService.presentApplicationDomain({ applicationDomainName });
    }
  }


  public static async createEnums({ enumInfoList }:{
    enumInfoList: Array<TEnumInfo>;
  }): Promise<Array<TEnumInfo>> {
    const copyEnumInfoList: Array<TEnumInfo> = JSON.parse(JSON.stringify(enumInfoList));
    for (const enumInfo of copyEnumInfoList) {
      const applicationDomain = await TestService.presentApplicationDomain({ applicationDomainName: enumInfo.applicationDomainName });
      const epSdkEnumTask = new EpSdkEnumTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: applicationDomain.id,
        enumName: enumInfo.enumName,
        enumObjectSettings: {
          shared: true,
        },
      });
      const epSdkEnumTask_ExecuteReturn: IEpSdkEnumTask_ExecuteReturn = await epSdkEnumTask.execute();
      enumInfo.applicationDomainId = applicationDomain.id;
      enumInfo.sourceEnumId = epSdkEnumTask_ExecuteReturn.epObject.id;
      
      for (const versionInfo of enumInfo.versionInfoList) {
        const epSdkEnumVersionTask = new EpSdkEnumVersionTask({
          epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
          applicationDomainId: enumInfo.applicationDomainId,
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
    return copyEnumInfoList;
  }

  public static async createSchemas({ schemaInfoList }:{
    schemaInfoList: Array<TSchemaInfo>;
  }): Promise<Array<TSchemaInfo>> {
    const copyList: Array<TSchemaInfo> = JSON.parse(JSON.stringify(schemaInfoList));
    for (const schemaInfo of copyList) {
      const applicationDomain = await TestService.presentApplicationDomain({ applicationDomainName: schemaInfo.applicationDomainName });
      const task = new EpSdkSchemaTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: applicationDomain.id,
        schemaName: schemaInfo.schemaName,
        schemaObjectSettings: {
          shared: true,
        },
      });
      const epSdkSchemaTask_ExecuteReturn: IEpSdkSchemaTask_ExecuteReturn = await task.execute();
      schemaInfo.applicationDomainId = applicationDomain.id;
      schemaInfo.sourceSchemaId = epSdkSchemaTask_ExecuteReturn.epObject.id;
      
      for (const versionInfo of schemaInfo.versionInfoList) {
        const epSdkSchemaVersionTask = new EpSdkSchemaVersionTask({
          epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
          applicationDomainId: schemaInfo.applicationDomainId,
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
    return copyList;
  }

  public static async createEvents({ eventInfoList, enumInfoList, schemaInfoList }:{
    eventInfoList: Array<TEventInfo>;
    schemaInfoList: Array<TSchemaInfo>;
    enumInfoList: Array<TEnumInfo>;
  }): Promise<Array<TEventInfo>> {
    const copyList: Array<TEventInfo> = JSON.parse(JSON.stringify(eventInfoList));
    let idx = 0;
    for (const eventInfo of copyList) {
      const applicationDomain = await TestService.presentApplicationDomain({ applicationDomainName: eventInfo.applicationDomainName });
      const epSdkEpEventTask = new EpSdkEpEventTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: applicationDomain.id,
        eventName: eventInfo.eventName,
        eventObjectSettings: {
          shared: true,
        },
      });
      const epSdkEpEventTask_ExecuteReturn: IEpSdkEpEventTask_ExecuteReturn = await epSdkEpEventTask.execute();
      eventInfo.applicationDomainId = applicationDomain.id;
      eventInfo.sourceEventId = epSdkEpEventTask_ExecuteReturn.epObject.id;
      let versionInfoIdx = 0;
      for (const versionInfo of eventInfo.versionInfoList) {
        const enumInfoMap: Map<string, IEpSdkEpEventVersionTask_EnumInfo> = new Map<string, IEpSdkEpEventVersionTask_EnumInfo>();
        enumInfoMap.set(enumInfoList[idx].enumName, {
          applicationDomainId: enumInfoList[idx].applicationDomainId,
          enumId: enumInfoList[idx].sourceEnumId,
          enumName: enumInfoList[idx].enumName,
          enumVersionId: enumInfoList[idx].versionInfoList[versionInfoIdx].versionId
        });
        const epSdkEpEventVersionTask = new EpSdkEpEventVersionTask({
          epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
          applicationDomainId: eventInfo.applicationDomainId,
          eventId: eventInfo.sourceEventId,
          versionString: versionInfo.versionString,
          topicString: `one/two/{${enumInfoList[idx].enumName}}`,
          eventVersionSettings: {
            stateId: EpSdkStatesService.releasedId,
            displayName: versionInfo.versionString,
            description: "description",
            schemaVersionId: schemaInfoList[idx].versionInfoList[versionInfoIdx].versionId,
          },
          enumInfoMap: enumInfoMap
        });
        const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn = await epSdkEpEventVersionTask.execute();
        versionInfo.versionId = epSdkEpEventVersionTask_ExecuteReturn.epObject.id;
        versionInfoIdx++;
      }
      idx++;
    }
    return copyList;
  }

  public static async createApplications({ applicationInfoList, eventInfoList }:{
    applicationInfoList: Array<TApplicationInfo>;
    eventInfoList: Array<TEventInfo>;
  }): Promise<Array<TApplicationInfo>> {
    const copyList: Array<TApplicationInfo> = JSON.parse(JSON.stringify(applicationInfoList));

    const producedEventVersionIds: Array<string> = [];
    const consumedEventVersionIds: Array<string> = [];
    for (let i=0; i < eventInfoList.length; i++) {
      const latestVersionInfo: TVersionInfo = TestService.getLatestVersionInfoFromList({ versionInfoList: eventInfoList[i].versionInfoList });
      if(i % 2 === 0) producedEventVersionIds.push(latestVersionInfo.versionId);
      else consumedEventVersionIds.push(latestVersionInfo.versionId);
    }
    for(const applicationInfo of copyList) {
      const applicationDomain = await TestService.presentApplicationDomain({ applicationDomainName: applicationInfo.applicationDomainName });
      const epSdkApplicationTask = new EpSdkApplicationTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: applicationDomain.id,
        applicationName: applicationInfo.applicationName,
        applicationObjectSettings: {
          applicationType: 'standard',
          brokerType: Application.brokerType.SOLACE,
        }
      });
      const epSdkApplicationTask_ExecuteReturn: IEpSdkApplicationTask_ExecuteReturn = await epSdkApplicationTask.execute();
      applicationInfo.applicationDomainId = applicationDomain.id;
      applicationInfo.sourceApplicationId = epSdkApplicationTask_ExecuteReturn.epObject.id;
      let versionInfoIdx = 0;
      for (const versionInfo of applicationInfo.versionInfoList) {
        const epSdkApplicationVersionTask = new EpSdkApplicationVersionTask({
          epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
          applicationDomainId: applicationInfo.applicationDomainId,
          applicationId: applicationInfo.sourceApplicationId,
          applicationVersionSettings: {
            stateId: EpSdkStatesService.releasedId,
            displayName: `displayName for ${versionInfo.versionString}`,
            description: `description for ${versionInfo.versionString}`,
            declaredConsumedEventVersionIds: consumedEventVersionIds,
            declaredProducedEventVersionIds: producedEventVersionIds,
          }
        });
        const epSdkApplicationVersionTask_ExecuteReturn: IEpSdkApplicationVersionTask_ExecuteReturn = await epSdkApplicationVersionTask.execute();
        versionInfo.versionId = epSdkApplicationVersionTask_ExecuteReturn.epObject.id;
        versionInfoIdx++;
      }
    }
    return copyList;
  }

  public static getLatestVersionInfoFromList({ versionInfoList }:{
    versionInfoList: Array<TVersionInfo>;
  }): TVersionInfo {
    const funcName = "getLatestVersionInfoFromList";
    const logName = `${TestService.name}.${funcName}()`;
    let latestVersionString: string = "0.0.0";
    let latestVersionInfo: TVersionInfo = {
      versionString: "",
      versionId: "",
    };
    for (const versionInfo of versionInfoList) {
      if(versionInfo.versionString === undefined) throw new Error(`${logName}: versionInfo.versionString === undefined`);
      if(versionInfo.versionId === undefined) throw new Error(`${logName}: versionInfo.versionId === undefined`);
      const newVersionString: string = versionInfo.versionString;
      if(EpSdkSemVerUtils.is_NewVersion_GreaterThan_OldVersion({newVersionString: newVersionString, oldVersionString: latestVersionString })) {
        latestVersionString = newVersionString;
        latestVersionInfo = {
          ...versionInfo,
        };
      }
    }
    return latestVersionInfo;    
  }

}
