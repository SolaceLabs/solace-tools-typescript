import {
  OpenAPI as EPOpenAPI,
  OpenAPIConfig
} from '@solace-labs/ep-openapi-node';
import {
  OpenAPI as EPRtOpenAPI,
} from '@solace-labs/ep-rt-openapi-node';

/**
 * Convenience class to initialize the OpenAPI config for @solace-labs/ep-openapi-node.
 * @category Utils
 */
export class EpSdkClient {
  private static token: string;
  public static readonly DEFAULT_EP_API_BASE_URL = "https://api.solace.cloud";

  /**
   * Initialize the EP OpenAPI global constant.
   * 
   * 
   * @param params
   * @returns OpenAPIConfig
   * 
   * @example
   * import { OpenAPI } from "@solace-labs/ep-openapi-node";
   * 
   * EpSdkClient.initialize({
   *  globalOpenAPI: OpenAPI,
   *  token: 'my token'
   * });
   * 
   */
  public static initialize = ({ globalEpOpenAPI, globalEpRtOpenAPI, token, baseUrl=EpSdkClient.DEFAULT_EP_API_BASE_URL }:{
    /** The global OpenAPI const object from  @solace-labs/ep-openapi-node. */
    globalEpOpenAPI: OpenAPIConfig;
    /** The global OpenAPI const object from  @solace-labs/ep-rt-openapi-node. */
    globalEpRtOpenAPI: OpenAPIConfig;
    /** The Solace Cloud token. */
    token: string;
    /** Base url for the ep api. @defaultValue  {@link EpSdkClient.DEFAULT_EP_API_BASE_URL} */
    baseUrl?: string;
  }): {
    EpOpenAPIConfig: OpenAPIConfig;
    EpRtOpenAPIConfig: OpenAPIConfig;
    } => {
    const base: URL = new URL(baseUrl);
    base;
    globalEpOpenAPI.BASE = baseUrl;
    globalEpOpenAPI.WITH_CREDENTIALS = true;
    globalEpOpenAPI.CREDENTIALS = "include";
    globalEpOpenAPI.TOKEN = token;

    globalEpRtOpenAPI.BASE = baseUrl;
    globalEpRtOpenAPI.WITH_CREDENTIALS = true;
    globalEpRtOpenAPI.CREDENTIALS = "include";
    globalEpRtOpenAPI.TOKEN = token;
    // this allows to use ep-sdk as npm link during development as well
    // two instances of ep-openapi-node in this case
    EPOpenAPI.BASE = baseUrl;
    EPOpenAPI.WITH_CREDENTIALS = true;
    EPOpenAPI.CREDENTIALS = "include";
    EPOpenAPI.TOKEN = token;

    EPRtOpenAPI.BASE = baseUrl;
    EPRtOpenAPI.WITH_CREDENTIALS = true;
    EPRtOpenAPI.CREDENTIALS = "include";
    EPRtOpenAPI.TOKEN = token;
    // save the token
    EpSdkClient.token = token;
    // // DEBUG:
    // console.log(`>>>>>>>>\n\n${logName}:\n\n>>>>> globalOpenAPI=${JSON.stringify(globalOpenAPI, null, 2)}\n\n<<<<<<<<<<<`);

    return {
      EpOpenAPIConfig: globalEpOpenAPI,
      EpRtOpenAPIConfig: globalEpRtOpenAPI
    }
  }

  public static setToken = ({ globalEpOpenAPI, globalEpRtOpenAPI, token }:{
    globalEpOpenAPI: OpenAPIConfig;
    globalEpRtOpenAPI: OpenAPIConfig;
    token: string;
  }): void => {
    globalEpOpenAPI.TOKEN = token;
    EPOpenAPI.TOKEN = token;
    globalEpRtOpenAPI.TOKEN = token;
    EPRtOpenAPI.TOKEN = token;
  }

  public static resetToken = ({ globalEpOpenAPI, globalEpRtOpenAPI }:{
    globalEpOpenAPI: OpenAPIConfig;
    globalEpRtOpenAPI: OpenAPIConfig;
  }): void => {    
    globalEpOpenAPI.TOKEN = EpSdkClient.token;
    EPOpenAPI.TOKEN = EpSdkClient.token;
    globalEpRtOpenAPI.TOKEN = EpSdkClient.token;
    EPRtOpenAPI.TOKEN = EpSdkClient.token;
  }

}
