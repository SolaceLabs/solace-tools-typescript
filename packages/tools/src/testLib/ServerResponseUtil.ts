
import { Response, Headers } from "node-fetch";


type THeaders = Array<{ key: string, value: string}>;;

export class ServerResponseUtil {
    public status: number;
    public statusText: string;
    public url: string;
    public body: string;
    public responseHeaders: Headers;
    public headers: THeaders;

    constructor(fetchResponse: Response, body: string) {
        this.status = fetchResponse.status;
        this.statusText = fetchResponse.statusText;
        this.url = fetchResponse.url;
        this.body = body;
        this.responseHeaders = fetchResponse.headers;
    }
    public static create = async(fetchResponse: Response) => {
        // const isContentTypeJson: boolean = (fetchResponse.headers.has('content-type') && fetchResponse.headers.get('content-type').toLowerCase().includes('json') ? true : false);
        let isContentTypeJson: boolean = false;
        if (fetchResponse.headers.has('content-type')) {
          const contentType: string | null = fetchResponse.headers.get('content-type');
          if(contentType !== null) isContentTypeJson = contentType.toLowerCase().includes('json');
        }
        const bodyText: string | null = await fetchResponse.text();
        let bodyJson: string;
        if (isContentTypeJson && bodyText !== null) {
            try {
                bodyJson = JSON.parse(bodyText);
            } catch (err) {
                throw new Error(`error parsing response text as json: ${err}, text=${bodyText}`);
            }
        } else {
            bodyJson = JSON.parse(JSON.stringify({ raw: bodyText }));
        }
        return new ServerResponseUtil(fetchResponse, bodyJson);
    }
    toJson = (): string => {
      this.responseHeaders.forEach( (key: string, value: string) => {
        this.headers.push({key: key, value: value});
      });
      return JSON.stringify(this, null, 2);
    }
}

