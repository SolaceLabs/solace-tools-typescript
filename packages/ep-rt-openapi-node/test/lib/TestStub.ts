
import * as sinon from 'sinon';
import {
  TestContext,
  ApiRequestOptions,
} from '@internal/tools/src';
import { 
  TestLogger
} from "./TestLogger";
import TestConfig from './TestConfig';
import {
  ApiResult,
  CancelablePromise,
  OpenAPIConfig
} from '../../generated-src';
import {
  customRequest,
} from './customOpenApiRequest';
import * as __requestLib from '../../generated-src/core/request';

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Stubbing global request from openapi
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  const stub = sinon.stub(__requestLib, 'request');
  // export const request = <T>(config: OpenAPIConfig, options: ApiRequestOptions): CancelablePromise<T> => {
  stub.callsFake(<T>(config: OpenAPIConfig, options: ApiRequestOptions): CancelablePromise<T> => {

    TestContext.setApiRequestOptions(options);
    if(TestConfig.getConfig().enableApiLogging) TestLogger.logApiRequestOptions(TestContext.getItId(), options);
  
    TestContext.setApiResult(undefined);
    TestContext.setApiError(undefined);

    // const cancelablePromise = stub.wrappedMethod(config, options) as CancelablePromise<ApiResult>;
    // call my own request
    
    const cancelablePromise: CancelablePromise<ApiResult> = customRequest<ApiResult>(config, options) as CancelablePromise<ApiResult>;


    cancelablePromise.then((value: ApiResult) => {
        TestContext.setApiResult(value);
        if(TestConfig.getConfig().enableApiLogging) TestLogger.logApiResult(TestContext.getItId(), TestContext.getApiResult());
    }, (reason) => {
        TestContext.setApiError(reason);
        if(!TestConfig.getConfig().enableApiLogging) {
          TestLogger.logApiRequestOptions(TestContext.getItId(), options);
          TestLogger.logApiResult(TestContext.getItId(), TestContext.getApiResult());
        }
        TestLogger.logApiError(TestContext.getItId(), TestContext.getApiError());
    });

    return cancelablePromise as unknown as CancelablePromise<T>;
  });
  