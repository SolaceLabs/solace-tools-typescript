
import { v4 as uuidv4 } from 'uuid';
import request from 'supertest';
import { 
  ApiError,
  ApiResult,
  ApiRequestOptions
} from './OpenApiTypes';

export type TTestEnv = {
  projectRootDir: string;
  // enableLogging: boolean,
  // testApiSpecsDir: string;
  // globalDomainNamePrefix: string;
  // createdAppDomainNameList: Array<string>;
}

export class TestContext {

    private static itId: string;
    private static apiRequestOptions: ApiRequestOptions;
    private static apiResult?: ApiResult;
    private static apiError?: ApiError;
    private static testEnv: TTestEnv;

    public static newItId() {
        TestContext.itId = uuidv4().replace(/-/g, '_');
    }
    public static getItId(): string {
        return TestContext.itId;
    }
    public static setFromSuperTestRequestResponse(res: request.Response) {
      const response: any = JSON.parse(JSON.stringify(res));
      TestContext.apiRequestOptions = {
        method: response.req.method,
        // path: response.req.url,
        headers: response.req.headers,
        url: response.req.url,
      };
      let body:any = res.text;
      let isBodyJSON = false;
      try {
        body = JSON.parse(res.text)
        isBodyJSON = true;
      } catch(e) {
        body = res.text
      }
      TestContext.apiResult = {
        status: response.status,
        ok: response.status === 200 ? true : false,
        url: response.req.url,
        statusText: '?',
        body: body
      };
      if (isBodyJSON && typeof body === 'object' && 'errorId' in body) {
        TestContext.apiError = {
          name: body.errorId,
          message: body.description,
          status: response.status,
          statusText: '?',
          url: response.req.url,
          body: body
        }  
      } else TestContext.apiError = undefined;
    }
    public static setApiRequestOptions(options: ApiRequestOptions) {
        TestContext.apiRequestOptions = options;
    }
    public static getApiRequestOptions(): ApiRequestOptions {
        return TestContext.apiRequestOptions;
    }
    public static setApiResult(result: ApiResult | undefined) {
        TestContext.apiResult = result;
    }
    public static getApiResult(): ApiResult {
        return TestContext.apiResult;
    }
    public static setApiError(error: ApiError | undefined) {
        TestContext.apiError = error;
    }
    public static getApiError(): ApiError {
        return TestContext.apiError;
    }
    public static setTestEnv = (testEnv: TTestEnv) => {
      TestContext.testEnv = testEnv;
    }
    public static getTestEnv = (): TTestEnv => {
      return TestContext.testEnv;
    } 
}
