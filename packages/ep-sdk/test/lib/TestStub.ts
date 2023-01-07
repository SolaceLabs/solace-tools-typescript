import * as sinon from "sinon";
import { TestContext, ApiRequestOptions } from "@internal/tools/src";
import {
  CancelablePromise,
  OpenAPIConfig,
  ApiResult,
} from "@solace-labs/ep-openapi-node";
import * as __requestLib from "@solace-labs/ep-openapi-node/dist/core/request";
import { customRequest } from "./customOpenApiRequest";
import TestConfig from "./TestConfig";
import { TestLogger } from "./TestLogger";

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Stubbing global request from openapi
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// export const request = <T>(config: OpenAPIConfig, options: ApiRequestOptions): CancelablePromise<T> => {
const stub = sinon.stub(__requestLib, "request");
stub.callsFake(
  (
    config: OpenAPIConfig,
    options: ApiRequestOptions
  ): CancelablePromise<ApiResult> => {
    TestContext.setApiRequestOptions(options);
    if (TestConfig.getConfig().enableApiLogging)
      TestLogger.logApiRequestOptions(TestContext.getItId(), options);

    TestContext.setApiResult(undefined);
    TestContext.setApiError(undefined);

    // const cancelablePromise = stub.wrappedMethod(config, options) as CancelablePromise<ApiResult>;
    // call my own request

    const cancelablePromise = customRequest(
      config,
      options
    ) as CancelablePromise<ApiResult>;

    cancelablePromise.then(
      (value: ApiResult) => {
        TestContext.setApiResult(value);
        if (TestConfig.getConfig().enableApiLogging)
          TestLogger.logApiResult(
            TestContext.getItId(),
            TestContext.getApiResult()
          );
      },
      (reason) => {
        TestContext.setApiError(reason);
        if (!TestConfig.getConfig().enableApiLogging) {
          TestLogger.logApiRequestOptions(TestContext.getItId(), options);
          TestLogger.logApiResult(
            TestContext.getItId(),
            TestContext.getApiResult()
          );
        }
        TestLogger.logApiError(
          TestContext.getItId(),
          TestContext.getApiError()
        );
      }
    );

    return cancelablePromise;
  }
);
