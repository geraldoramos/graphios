# Graphios

Easy-to-use HTTP client for GraphQL API's (based on *axios*)

Features:

- Simple API focused on graphQL use case.
- Auto-pagination (Relay pattern only. Works with Github API)
- Configurable retries

## Installing

Using npm:

```bash
$ npm install axios
```

Using yarn:

```bash
$ yarn add axios
```

## Configuration object

```typescript
interface Config {
  url: string
  query: string
  headers?: object
  retries?: number
  retryDelay?: number
  pagination?: boolean
  pageDelay?: number
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
    console.log(response);
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
    console.log(response);

  } catch (error) {
    console.error(error);
  }
})()
```

### Performing a paginated query

For pagination support, a `$cursor` variable should be included in the query. The API server must follow the relay pagination pattern using nodes and edges. Paginated query is not required to be on the first level, but only one pagination query is allowed per request.

```js
import {graphios} = from 'graphios';

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
    pageDelay: 300
  })
  .then(function (response) {
    // handle success
    console.log(response);
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
    headers,
    retries: 3,
    retryDelay: 500
    pagination: true,
    pageDelay: 300
  })
    console.log(response);

  } catch (error) {
    console.error(error);
  }
})()
```

## Credits

Based on: [axios](https://github.com/axios/axios) and [axios-retry](https://github.com/softonic/axios-retry).

## License

[MIT](LICENSE)
