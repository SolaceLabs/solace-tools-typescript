
import {
  TestLoggerBase,
  TestContext
} from '@internal/tools/src';
import { EpAsyncApiError } from '../../src';

export class TestLogger extends TestLoggerBase {

  public static createNotEpAsyncApiErrorMessage = (e: Error): string => {
    return `[${TestContext.getItId()}]: error is not an instance of EpAsyncApiError, name=${e.name}, message=${e.message}`;
  }
  public static createEpAsyncApiTestFailMessage = (message: string, epAsyncApiError: EpAsyncApiError): string => {
    return `[${TestContext.getItId()}]: message=${message}, epAsyncApiError=${epAsyncApiError}`;
  }

}

