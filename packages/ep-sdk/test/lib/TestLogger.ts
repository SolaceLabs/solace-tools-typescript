import { 
  TestContext, 
  TestLoggerBase 
} from "@internal/tools/src";
import { EpSdkError } from "../../src";


export class TestLogger extends TestLoggerBase {

  public static createNotEpSdkErrorMessage = (e: Error): string => {
    return `[${TestContext.getItId()}]: error is not an instance of EpSdkError, name=${e.name}, message=${e.message}`;
  }
  public static createEpSdkTestFailMessage = (message: string, epSdkError: EpSdkError): string => {
    return `[${TestContext.getItId()}]: message=${message}, epSdkError=${epSdkError}`;
  }

}

