export interface GraphiosResponse {
  readonly data: object;
  readonly status?: number;
  readonly statusText?: string;
  readonly headers?: object;
  readonly config?: Config;
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