/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ApiResult = {
  readonly url: string;
  readonly ok: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly body: any;
};

export class ApiError extends Error {
  public readonly url: string;
  public readonly status: number;
  public readonly statusText: string;
  public readonly body: any;

  constructor(response: ApiResult, message: string) {
      super(message);

      this.name = 'ApiError';
      this.url = response.url;
      this.status = response.status;
      this.statusText = response.statusText;
      this.body = response.body;
  }
}

export type ApiRequestOptions = {
  readonly method: 'GET' | 'PUT' | 'POST' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'PATCH';
  readonly url: string;
  readonly path?: Record<string, any>;
  readonly cookies?: Record<string, any>;
  readonly headers?: Record<string, any>;
  readonly query?: Record<string, any>;
  readonly formData?: Record<string, any>;
  readonly body?: any;
  readonly mediaType?: string;
  readonly responseHeader?: string;
  readonly errors?: Record<number, string>;
};

// export type Resolver<T> = (options: ApiRequestOptions) => Promise<T>;

// export type Headers = Record<string, string>;

// export type OpenAPIConfig = {
//     BASE: string | Resolver<string>;
//     VERSION: string;
//     WITH_CREDENTIALS: boolean;
//     CREDENTIALS: 'include' | 'omit' | 'same-origin';
//     TOKEN?: string | Resolver<string>;
//     USERNAME?: string | Resolver<string>;
//     PASSWORD?: string | Resolver<string>;
//     HEADERS?: Headers | Resolver<Headers>;
//     ENCODE_PATH?: (path: string) => string;
// };
