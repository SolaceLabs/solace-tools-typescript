import { 
  OpenAPIConfig
} from "@solace-labs/ep-openapi-node";
import { DefaultEpApiBaseUrl } from "../constants";

export class CliEpV1Client {
  public static readonly DEFAULT_EP_API_BASE_URL = "https://api.solace.cloud";

  public static initialize = ({ globalEpOpenAPI, token, baseUrl=DefaultEpApiBaseUrl }:{
    globalEpOpenAPI: OpenAPIConfig;
    token: string;
    baseUrl?: string;
  }): {
    EpV1OpenAPIConfig: OpenAPIConfig;
  } => {
    // test correct url format
    const base = new URL(baseUrl);
    base;

    globalEpOpenAPI.BASE = baseUrl;
    globalEpOpenAPI.WITH_CREDENTIALS = true;
    globalEpOpenAPI.CREDENTIALS = "include";
    globalEpOpenAPI.TOKEN = token;

    return {
      EpV1OpenAPIConfig: globalEpOpenAPI,
    };
  }

}
