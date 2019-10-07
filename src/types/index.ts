export interface GraphiosResponse {
  readonly data: object;
  readonly status?: number;
  readonly statusText?: string;
  readonly headers?: object;
}

export interface Config {
  readonly url: string;
  readonly query: string;
  readonly headers?: object;
  readonly retries?: number;
  readonly retryDelay?: number;
  readonly pagination?: boolean;
  readonly pageDelay? : number;
}

export interface Pageinfo {
  readonly hasNextPage: boolean;
  readonly endCursor: string;
}