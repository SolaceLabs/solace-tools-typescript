import { ServerResponseUtil } from "./ServerResponseUtil";

import { TestContext } from './TestContext';
import {
  ApiError, 
  ApiResult,
  ApiRequestOptions
} from './OpenApiTypes';


export class TestLoggerBase {
    private static do_log: boolean = true;
    public static setLogging = (do_log: boolean) => { TestLoggerBase.do_log = do_log; }
    public static logResponse = (msg: string, response: ServerResponseUtil) => {
        if(TestLoggerBase.do_log) console.log(`[response] - ${msg}:\n${response.toJson()}`);
    }
    // public static cloneWithHidenSecrets = (config: any) => _.transform(config, (r:any, v:any, k:string) => {
    //     if(_.isObject(v)) {
    //         r[k] = TestLogger.cloneWithHidenSecrets(v)
    //     } else if(typeof k === 'string') {
    //         let _k = k.toLowerCase();
    //         if( _k.includes('token')        ||
    //             _k.includes('pwd')          ||
    //             _k.includes('service_id')   ||
    //             _k.includes('portal_url')   ||
    //             _k.includes('admin_user')   ||
    //             _k.includes('password')     ) {
    //                 r[k] = '***';
    //         } else {
    //             r[k] = v;
    //         }
    //     } else {
    //         r[k] = v;
    //     }            
    // })
    public static logTestEnv = (component: string, testEnv: any) => {
        if(!TestLoggerBase.do_log) return;
        // let te = TestLogger.cloneWithHidenSecrets(testEnv);
        let te = testEnv;
        console.log(`[${component}] - testEnv=${JSON.stringify(te, null, 2)}`);
    }
    public static logMessage = (component: string, msg: string) => {
        if(TestLoggerBase.do_log) console.log(`[${component}] - ${msg}`);
    }
    public static logMessageWithId = (message: string) => {
      if(TestLoggerBase.do_log) console.log(TestLoggerBase.createLogMessage(message));
    }
    public static getLoggingApiRequestOptions = (options: ApiRequestOptions): string => {
        // let logOptions:any = TestLogger.cloneWithHidenSecrets(options);
        let logOptions:any = options;
        // if(logOptions.path.includes('token')) {
        //     logOptions.body = "***";
        // }
        return JSON.stringify(logOptions, null, 2);
    }
    public static getLoggingApiResult = (result: ApiResult): string => {
        // let logResult:any = TestLogger.cloneWithHidenSecrets(result);
        let logResult:any = result;
        // if(logResult && logResult.url && logResult.url.includes('token')) {
        //     logResult.body = "***";
        // }
        return JSON.stringify(logResult, null, 2);
    }
    public static logApiRequestOptions = (id: string, options: ApiRequestOptions) => {
        if(!TestLoggerBase.do_log) return;
        console.log(`[${id}]: ApiRequestOptions=\n${TestLoggerBase.getLoggingApiRequestOptions(options)}\n`);
    }
    public static logApiResult = (id: string, result: ApiResult) => {
        if(!TestLoggerBase.do_log) return;
        console.log(`[${id}]: ApiResult=\n${TestLoggerBase.getLoggingApiResult(result)}\n`);
    }
    public static logApiError = (id: string, apiError: ApiError) => {
        if(!TestLoggerBase.do_log) return;
        console.log(`[${id}]: ApiError=\n${JSON.stringify(apiError, null, 2)}\n`);
    }
    public static createLogMessage = (message: string, obj?: any) : string => {
      let msg = `[${TestContext.getItId()}]: ${message}`;
      if(obj !== undefined) msg += `, obj=\n${JSON.stringify(obj, null, 2)}`;
      return msg;
    }
    public static createTestFailMessageForError = (message: string, err: Error): string => {
      return `[${TestContext.getItId()}]: ${message}\nerror=${err}`;
    }
    public static createTestFailMessage = (message: string): string => {
      return `[${TestContext.getItId()}]: ${message}`;
    }
    public static createApiTestFailMessage = (message: string, apiError?: ApiError): string => {
      const _apiError: ApiError = apiError ? apiError : TestContext.getApiError();
      return `[${TestContext.getItId()}]: ${message}\napiRequestOptions=${TestLoggerBase.getLoggingApiRequestOptions(TestContext.getApiRequestOptions())}\napiResult=${TestLoggerBase.getLoggingApiResult(TestContext.getApiResult())}\napiError=${JSON.stringify(_apiError, null, 2)}\n`;
    }
    public static createNotApiErrorMessage = (message: string): string => {
      return `[${TestContext.getItId()}]: error is not an instance of ApiError, error=${message}`;
    }
}

