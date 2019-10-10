import {AxiosRequestConfig} from 'axios'

export interface GraphiosResponse {
  readonly data: object;
  readonly status?: number;
  readonly statusText?: string;
  readonly headers?: object;
  readonly pagesProcessed?: number;
  readonly config?: AxiosRequestConfig;
}

export interface Config {
  readonly url: string;
  readonly query: string;
  readonly headers?: object;
  readonly timeout?: number;
  readonly retries?: number;
  readonly retryDelay?: number;
  readonly pagination?: boolean;
  readonly requestId?: string;
  readonly pageDelay? : number;
}

export interface Pageinfo {
  readonly hasNextPage: boolean;
  readonly endCursor: string;
}