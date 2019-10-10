# Graphios

Easy-to-use Axios-based HTTP client for GraphQL API's. This library is more suitable for back-end interactions with GraphQL servers (not frontends/UI's). The Auto-pagination feature allows fetching of large amounts of data from paginated GraphQL API's without the need to write custom code.

*Features:*

- Simple API focused on GraphQL use case.
- Auto-pagination (Relay pattern only, such as Github API)
- Event listener for paginated requests
- Configurable retries (and retryDelay)

## Installing

Using npm:

```bash
$ npm install graphios
```

Using yarn:

```bash
$ yarn add graphios
```

## Configuration object (input)

```typescript
interface Config {
  url: string // graphQL endpoint
  query: string // graphQl query
  headers?: object // Optional headers object
  timeout?: number // Optional custom timeout in ms (default to no timeout)
  retries?: number // Optional retries (default to 3)
  retryDelay?: number // Optional retryDelay in ms (default to 500)
  pagination?: boolean // Optional Auto-pagination (default to false)
  requestId?: string // Optional request identifier, useful for monitoring page iterations
  pageDelay?: number // Optional delay between pagination iterations in ms (default to 200)
}
```

## Response object (output)

```typescript
interface GraphiosResponse {
  data: object // Response data
  status?: number // not present on auto-paginated requests
  statusText?: string // not present on auto-paginated requests
  headers?: object // not present on auto-paginated requests
  pagesProcessed?: number // Only available for auto-paginated requests
}
```

## Examples

### Performing a simple query:

```js
import {graphios} from 'graphios';

const query = `{
  users {
    firstName
    email
  }
}`

// using promises
graphios({
    query,
    url: 'https://mygraphql.xyz/graphql'
  })
  .then(function (response) {
    // handle success
    console.log(response.data);
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })

// Using async/await
(async () => {
  try {
    const response = await graphios({
    query,
    url: 'https://mygraphql.xyz/graphql',
  })
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
})()
```

### Performing a paginated query

For auto-pagination support, a `$cursor` variable should be included in the query. The API server must follow the relay pagination pattern using nodes and edges. The paginated query is not required to be on the first level, but only one pagination query is allowed per request.

*Example using an usable query for the Github API*

```js
// import graphiosEvents for pagination events
import {graphios, graphiosEvents} from 'graphios';

// A query variable $cursor is required.
const query = `
  query Repository($cursor:String){
    organization(login:"microsoft"){
      membersWithRole(first:100, after:$cursor){
        edges {
          node {
            name
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  }
`

const headers = {
    'authorization': `Bearer 1234567SuperHardKey8910`
  }

// using promises
graphios({
    query,
    url: 'https://api.github.com/graphql',
    headers,
    retries: 3,
    retryDelay: 500,
    pagination: true,
    requestId: 'myRepoReq123'
    pageDelay: 100
  })
  .then(function (response) {
    // handle success
    console.log(response.data);
  })
  .catch(function (error) {
    // If any page fails, it will end here
    console.log(error);
  })

// Using async/await
(async () => {
  try {
    const response = await graphios({
    query,
    url: 'https://api.github.com/graphql',
    headers,
    retries: 3,
    retryDelay: 500
    pagination: true,
    requestId: 'myRepoReq123',
    pageDelay: 100
  })
    console.log(response.data);

  } catch (error) {
    // If any page fails, it will end here
    console.error(error);
  }
})()

// Optional pagination event handler
graphiosEvents.on('pagination', pageData => {
  console.log(
  pageData.page // Page number,
  pageData.response, // Response object, same as an individual request
  pageData.requestId // Request identifier set on the config: 'myRepoReq123'
})

```

### Axios custom configuration (optional input)

An optional second object can be passed if any specific configuration from Axios is needed. This will override any configuration made on the graphios config (first parameter).

```typescript
interface AxiosRequestConfig {
  url?: string
  method?: Method
  baseURL?: string
  transformRequest?: AxiosTransformer | AxiosTransformer[]
  transformResponse?: AxiosTransformer | AxiosTransformer[]
  headers?: any
  params?: any
  paramsSerializer?: (params: any) => string
  data?: any
  timeout?: number
  withCredentials?: boolean
  adapter?: AxiosAdapter
  auth?: AxiosBasicCredentials
  responseType?: ResponseType
  xsrfCookieName?: string
  xsrfHeaderName?: string
  onUploadProgress?: (progressEvent: any) => void
  onDownloadProgress?: (progressEvent: any) => void
  maxContentLength?: number
  validateStatus?: (status: number) => boolean
  maxRedirects?: number
  socketPath?: string | null
  httpAgent?: any
  httpsAgent?: any
  proxy?: AxiosProxyConfig | false
  cancelToken?: CancelToken
}
```

*Example:*

```js
graphios(
  {
    query: `{ Users { name } }`,
    url: 'https://mygraphql.xyz/graphql'
  },
  {
    maxRedirects: 10
  }
)
  .then(function(response) {
    // handle success
    console.log(response.data)
  })
  .catch(function(error) {
    // If any page fails, it will end here
    console.log(error)
  })
```

## Credits

Relies on the excellent work provided by [axios](https://github.com/axios/axios) and [axios-retry](https://github.com/softonic/axios-retry).

## License

[MIT](LICENSE)
