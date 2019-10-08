import axios from 'axios'
import axiosRetry from 'axios-retry'
import { Config, GraphiosResponse, Pageinfo } from '../types'
import deepmerge from 'deepmerge'
import { removeKeys, findNested } from './utils'
import events from 'events'

export const graphiosEvents = new events.EventEmitter();

export const graphios = async (config: Config): Promise<GraphiosResponse> => {
  axios.defaults.timeout = config.timeout || 0
  axiosRetry(axios, {
    retries: config.retries || 3,
    retryDelay: retryCount => {
      return retryCount * config.retryDelay || 500
    }
  })

  // if no pagination, perform simple request
  if (!config.pagination) {
    const data = {
      query: config.query
    }
    return axios.post(config.url, data, { headers: config.headers || {} })
  }

  // if pagination, iterate over requests until all data is retrieved
  return new Promise((resolve: Function, reject: Function): void => {
    const allObjects = []
    let page = 0
    const done = (err?: object): void => {
      if (err) reject(err)
      const allData = deepmerge.all(allObjects)
      removeKeys(allData, ['pageInfo'])
      resolve({
        data: allData, 
        pagesProcessed: page
      })
    }

    const startRequests = (cursor?: string): void => {
      const data = {
        query: config.query,
        variables: { cursor: cursor || null }
      }

      axios
        .post(config.url, data, { headers: config.headers })
        .then(response => {
          page = page + 1
          graphiosEvents.emit("pagination", { page, response, requestId: config.requestId });

          if(response.data.errors){
            done(response.data)
          }

          allObjects.push(response.data.data)
          const hasPageInfo: Pageinfo = findNested(
            response.data.data,
              'pageInfo'
            )

            if (hasPageInfo) {
              if(hasPageInfo.hasNextPage){
                setTimeout(() => {
                  startRequests(hasPageInfo.endCursor)
                }, config.pageDelay || 200)
              } else {
                done()
              }
        }})
        .catch(err => {
          done(err)
        })
    }
    startRequests()
  })
}
