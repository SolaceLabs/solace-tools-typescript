import {
  EEpSdkTask_TargetState,
  EpSdkApplicationDomainTask,
  IEpSdkApplicationDomainTask_ExecuteReturn,
} from "@solace-labs/ep-sdk";

const main = async (): Promise<void> => {
  const ApplicationDomainName = "foo";

  // ensure application domain exists
  const epSdkApplicationDomainTaskPresent = new EpSdkApplicationDomainTask({
    epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
    applicationDomainName: ApplicationDomainName,
    applicationDomainSettings: {
      description: "my app domain",
    },
  });
  const epSdkApplicationDomainTask_ExecuteReturn_Present: IEpSdkApplicationDomainTask_ExecuteReturn =
    await epSdkApplicationDomainTaskPresent.execute();
  console.log(
    `epSdkApplicationDomainTask_ExecuteReturn_Present.epSdkTask_TransactionLogData = ${JSON.stringify(
      epSdkApplicationDomainTask_ExecuteReturn_Present.epSdkTask_TransactionLogData,
      null,
      2
    )}.`
  );

  const applicationDomainId =
    epSdkApplicationDomainTask_ExecuteReturn_Present.epObject.id;
  console.log(
    `application domain exists, applicationDomainId = ${applicationDomainId}.`
  );

  // ensure application domain does not exist
  const epSdkApplicationDomainTaskAbsent = new EpSdkApplicationDomainTask({
    epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
    applicationDomainName: ApplicationDomainName,
  });
  const epSdkApplicationDomainTask_ExecuteReturn_Absent: IEpSdkApplicationDomainTask_ExecuteReturn =
    await epSdkApplicationDomainTaskAbsent.execute();
  console.log(
    `epSdkApplicationDomainTask_ExecuteReturn_Absent.epSdkTask_TransactionLogData = ${JSON.stringify(
      epSdkApplicationDomainTask_ExecuteReturn_Absent.epSdkTask_TransactionLogData,
      null,
      2
    )}.`
  );
};

main();
