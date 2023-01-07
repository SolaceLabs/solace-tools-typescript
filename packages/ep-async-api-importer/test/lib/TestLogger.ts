import { EpSdkError } from "@solace-labs/ep-sdk";
import { TestContext, TestLoggerBase } from "@internal/tools/src";
import { CliError } from "../../src/cli-components";

export class TestLogger extends TestLoggerBase {
  public static createTestFailMessageWithCliError = (
    message: string,
    e: CliError
  ): string => {
    return `[${TestContext.getItId()}]: ${message}\napiRequestOptions=${TestLogger.getLoggingApiRequestOptions(
      TestContext.getApiRequestOptions()
    )}\napiResult=${TestLogger.getLoggingApiResult(
      TestContext.getApiResult()
    )}\napiError=${JSON.stringify(
      TestContext.getApiError(),
      null,
      2
    )}\ncliError=${JSON.stringify(e, null, 2)}\n`;
  };

  public static createNotCliErrorMesssage = (message: string): string => {
    return `[${TestContext.getItId()}]: error is not an instance of CliError, error=${message}`;
  };
  public static createWrongCliErrorInstance = (
    expectedCliErrorInstance: string,
    receivedCliError: CliError
  ): string => {
    return `[${TestContext.getItId()}]: wrong CliError instance, expectedCliErrorInstance=${expectedCliErrorInstance},  receivedCliError=\n${receivedCliError.toString()}`;
  };
  public static createWrongEpSdkErrorMesssage = (
    epSdkError: EpSdkError
  ): string => {
    return `[${TestContext.getItId()}]: wrong epSdkError instance, epSdkError=\n${epSdkError.toString()}`;
  };
  public static createEpSdkTestFailMessage = (
    message: string,
    epSdkError: EpSdkError
  ): string => {
    return `[${TestContext.getItId()}]: message=${message}, epSdkError=${epSdkError}`;
  };
}
