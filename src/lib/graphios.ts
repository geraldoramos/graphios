import axios from 'axios'
import {AxiosRequestConfig} from 'axios'
import axiosRetry from 'axios-retry'
import { Config, GraphiosResponse, Pageinfo } from '../types'
import deepmerge from 'deepmerge'
import { findNested, removeKeys } from './utils'
import events from 'events'
import CryptoJS from "crypto-js"

export const graphiosEvents = new events.EventEmitter();

export const graphios = async (config: Config, axiosConfig?: AxiosRequestConfig): Promise<GraphiosResponse> => {

  axios.defaults.timeout = config.timeout || 0
  axios.defaults.headers.common = config.headers

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
    return axios.post(config.url, data, axiosConfig)
  }

  // Check query for pagination info
  if(!config.query.includes('$cursor')){
    throw new Error ('A $cursor variable is required in the query when auto-pagination is enabled')
  }
  if(!config.query.includes('pageInfo')){
    throw new Error ('Pagination info (pageInfo) is required in the query when auto-pagination is enabled')
  }

  // if parallel is true
  const requestFunction = (dataPage,page ): Promise<object> => {
    return new Promise((resolve, reject): void => {
        axios.post(config.url, dataPage, axiosConfig).then( response =>{
          graphiosEvents.emit("pagination", { page, response, requestId: config.requestId });
          resolve()
        }).catch(err=>{
          reject(err)
        })
    })
  }
  if(config.parallel){
    const data = {
      query: config.query,
      variables: { cursor: null }
    }
    console.log('oi')
    const firstRequest = await axios.post(config.url, data, axiosConfig)
    console.log(firstRequest)
    const pages = Math.ceil(firstRequest.data.data.courseProgress.totalCount / 10000)
  

    return new Promise((resolve: Function, reject: Function): void => {

    const requests = []
    for (let page = 1; page < pages; page++) {
      const rawStr = page.toString()
      const wordArray = CryptoJS.enc.Utf8.parse(rawStr);
      const dataPage = {
        query: config.query,
        variables: { cursor: CryptoJS.enc.Base64.stringify(wordArray) }
      }
      requests.push(requestFunction(dataPage, page))
    }

    Promise.all(requests).then((data) =>{
      console.log(data)
      resolve()
    }).catch(err=>{
      reject(err)
    })

  })
}





  // if query is valid, iterate over requests until all data is retrieved
  return new Promise((resolve: Function, reject: Function): void => {
    const allObjects = []
    let page = 0
    const done = (err?: object): void => {
      if (err) reject(err)

      let allData;
      if(!config.noMerge){
      allData = deepmerge.all(allObjects)
      removeKeys(allData, ['pageInfo'])
      }
      
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
        .post(config.url, data, axiosConfig)
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