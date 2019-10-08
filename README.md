# Graphios

Easy-to-use HTTP client for GraphQL API's (based on *axios*)

Features:

- Simple API focused on graphQL use case.
- Auto-pagination (Relay pattern only. Works with Github API)
- Configurable retries

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
import {graphios} = from 'graphios';

const query = `{
  users {
    firstName
    email
  }
}`

// using promises
graphios({
    query,
    url: 'https://mygraphql.xyz/graphql',
    retries: 3,
    retryDelay: 500
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
    retries: 3,
    retryDelay: 500
  }
    console.log(response.data);

  } catch (error) {
    console.error(error);
  }
})()
```

### Performing a paginated query

For pagination support, a `$cursor` variable should be included in the query. The API server must follow the relay pagination pattern using nodes and edges. Paginated query is not required to be on the first level, but only one pagination query is allowed per request.

```js
import {graphios, graphiosEvents} = from 'graphios'; // import graphiosEvents for pagination events

// A query variable $cursor is required.
const query = `
  query Users($cursor: String) {
    users(first: 500, after: $cursor) {
      edges {
        node {
          firstName
          email
        }
      }
      pageInfo {
        endCursor
        hasNextPage
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
    url: 'https://mygraphql.xyz/graphql',
    headers,
    retries: 3,
    retryDelay: 500,
    pagination: true,
    requestId: 'myUsersRequest'
    pageDelay: 300
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
    url: 'https://mygraphql.xyz/graphql',
    headers,
    retries: 3,
    retryDelay: 500
    pagination: true,
    requestId: 'myUsersRequest',
    pageDelay: 300
  })
    console.log(response.data);

  } catch (error) {
    // If any page fails, it will end here
    console.error(error);
  }
})()

// Optional event handler
graphiosEvents.on('pagination', pageData => {
  console.log(
  pageData.page // Page number,
  pageData.response, // Response object, same as an individual request
  pageData.requestId // Request identifier set on the request config
})

```

## Credits

Relies on the excellent work provided by [axios](https://github.com/axios/axios) and [axios-retry](https://github.com/softonic/axios-retry).

## License

[MIT](LICENSE)
