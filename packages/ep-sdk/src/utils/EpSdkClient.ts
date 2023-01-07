import {
  OpenAPI,
  OpenAPIConfig
} from '@rjgu/ep-openapi-node';

/**
 * Convenience class to initialize the OpenAPI config for @solace-labs/ep-openapi-node.
 * @category Utils
 */
export class EpSdkClient {

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
  public static initialize = ({ globalOpenAPI, token, baseUrl=EpSdkClient.DEFAULT_EP_API_BASE_URL }:{
    /** The global OpenAPI const object from  @solace-labs/ep-openapi-node. */
    globalOpenAPI: OpenAPIConfig;
    /** The Solace Cloud token. */
    token: string;
    /** Base url for the ep api. @defaultValue  {@link EpSdkClient.DEFAULT_EP_API_BASE_URL} */
    baseUrl?: string;
  }): OpenAPIConfig => {
    const base: URL = new URL(baseUrl);
    base;
    globalOpenAPI.BASE = baseUrl;
    globalOpenAPI.WITH_CREDENTIALS = true;
    globalOpenAPI.CREDENTIALS = "include";
    globalOpenAPI.TOKEN = token;

    // this allows to use ep-sdk as npm link during development as well
    // two instances of ep-openapi-node in this case
    OpenAPI.BASE = baseUrl;
    OpenAPI.WITH_CREDENTIALS = true;
    OpenAPI.CREDENTIALS = "include";
    OpenAPI.TOKEN = token;

    // // DEBUG:
    // console.log(`>>>>>>>>\n\n${logName}:\n\n>>>>> globalOpenAPI=${JSON.stringify(globalOpenAPI, null, 2)}\n\n<<<<<<<<<<<`);

    return globalOpenAPI;
  }

}
