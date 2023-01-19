
import * as sinon from 'sinon';
import {
  TestContext,
} from '@internal/tools/src';
import {
  CancelablePromise, 
  OpenAPIConfig,
  ApiResult,
  ApiRequestOptions
} from '../../generated-src';
import * as __requestLib from '../../generated-src/core/request';
import { customRequest } from "./customOpenApiRequest";
import { TestLogger } from './TestLogger';
import TestConfig from './TestConfig';


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
      
      const cancelablePromise: CancelablePromise<ApiResult> = customRequest(config, options) as CancelablePromise<ApiResult>;


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
  