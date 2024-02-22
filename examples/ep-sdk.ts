import {
  EpSdkClient,
  EEpSdkTask_TargetState,
  EpSdkApplicationDomainTask,
  IEpSdkApplicationDomainTask_ExecuteReturn,
  EpSdkLogger,
  EpSdkConsoleLogger,
  EEpSdkLogLevel,
} from "@solace-labs/ep-sdk";

import { OpenAPI as EpOpenApi} from "@solace-labs/ep-openapi-node";
import { OpenAPI as EpRtOpenApi} from "@solace-labs/ep-rt-openapi-node";

// This Example creates and deletes an Application Domain using EP SDK

const main = async (): Promise<void> => {
  const ApplicationDomainName = "foo";

  // Initialize EP Logger
  const epSdkConsoleLogger: EpSdkConsoleLogger = new EpSdkConsoleLogger(
    "example-app-id",
    EEpSdkLogLevel.Silent
  );
  EpSdkLogger.initialize({ epSdkLoggerInstance: epSdkConsoleLogger });

  // Get Solace Cloud Token
  const cloudToken: string | undefined = process.env["SOLACE_CLOUD_TOKEN"];
  if (!cloudToken) throw new Error(`SOLACE_CLOUD_TOKEN env var missing`);    

  // Initialize EP CLient
  try {
    EpSdkClient.initialize({
      globalEpOpenAPI: EpOpenApi,
      globalEpRtOpenAPI: EpRtOpenApi,
      token: cloudToken
    });
  } catch (e) {
    throw new Error(`initializing ep client: ${e}`);
  }

  // Define Application Domain Task to create application domain
  const epSdkApplicationDomainTaskPresent = new EpSdkApplicationDomainTask({
    epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
    applicationDomainName: ApplicationDomainName,
    applicationDomainSettings: {
      description: "my app domain",
    },
  });

  console.log("--- Creating Application domain ---")
  // Execute Application Domain Task
  const epSdkApplicationDomainTask_ExecuteReturn_Present: IEpSdkApplicationDomainTask_ExecuteReturn = await epSdkApplicationDomainTaskPresent.execute('my-context-id');

  // Get Application Domain ID
  const applicationDomainId =
    epSdkApplicationDomainTask_ExecuteReturn_Present.epObject.id;
  console.log(`application domain name: ${ApplicationDomainName}\napplicationDomainId: ${applicationDomainId}`);

  console.log("\n--- Deleting Application domain ---")

  // Define Application Domain Task to delete application domain
  const epSdkApplicationDomainTaskAbsent = new EpSdkApplicationDomainTask({
    epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
    applicationDomainName: ApplicationDomainName,
  });
  
  // Execute Application Domain Task
  const epSdkApplicationDomainTask_ExecuteReturn_Absent: IEpSdkApplicationDomainTask_ExecuteReturn = await epSdkApplicationDomainTaskAbsent.execute('my-context-id');
  console.log(`application domain name deleted: ${ApplicationDomainName}\napplicationDomainId: ${epSdkApplicationDomainTask_ExecuteReturn_Absent.epObject.id}`);
  
  // Transactional Data for the executed task
  // console.log(`epSdkApplicationDomainTask_ExecuteReturn_Absent.epSdkTask_TransactionLogData = ${JSON.stringify(epSdkApplicationDomainTask_ExecuteReturn_Absent.epSdkTask_TransactionLogData, null, 2 )}.`);
};

main();
