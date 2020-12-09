/* eslint no-use-before-define: ["error", "nofunc"] */

// @ts-check

const clientAxios = require('axios').default

const { isObject, isNoObject, ensureObject } = require('./objects')

module.exports = { getServerApiUri, queryServerApiAsync }

const KNOWN_HTTP_METHODS = ['get', 'post', 'put', 'delete']

/**
 * @param {object} inputBag
 * @param {object} inputBag.defaultStore
 * @param {string} inputBag.routeId
 * @param {string} [inputBag.expectedMethod='auto']
 * @throws
 * @returns {string}
 */
function getServerApiUri({ defaultStore, routeId, expectedMethod = 'auto' }) {
  if (isNoObject(defaultStore) || typeof defaultStore.checkServerPath !== 'function') {
    throw new Error('Missing default store')
  }

  if (!defaultStore.checkServerPath(['api', routeId])) {
    throw new Error(`Missing server path information (unknown id "${routeId}")`)
  }

  const { method, uri } = defaultStore.serverPaths.api[routeId]

  let _expectedMethod = expectedMethod
  if (_expectedMethod === 'auto') {
    const methodMatch = /^[a-z]+/.exec(routeId)
    if (methodMatch != null) {
      // eslint-disable-next-line prefer-destructuring
      _expectedMethod = methodMatch[0]
    }
  }

  if (KNOWN_HTTP_METHODS.includes(_expectedMethod) && method !== _expectedMethod) {
    throw new Error(`Invalid server path information (got method "${method}" instead of "${_expectedMethod}"`)
  }

  return uri
}

/**
 * @param {object} inputBag
 * @param {string} inputBag.method
 * @param {string} inputBag.uri
 * @param {object} [inputBag.params]
 * @param {object} [inputBag.body]
 * @param {string} [inputBag.serverHost]
 * @param {object} [inputBag.serverAxios]
 * @throws
 * @returns {Promise} Resolves with server data
 */
async function queryServerApiAsync({ method, uri, params, body, serverHost, serverAxios }) {
  let queryUrl = (serverHost || '') + uri

  if (isObject(params)) {
    Object.keys(params).forEach(key => {
      const value = params[key]
      if (!queryUrl.includes(`:${key}`)) {
        throw new Error(`Invalid server path information (missing parameter "${key}")`)
      }
      queryUrl = queryUrl.replace(`:${key}`, value)
    })
  }

  const axios = serverAxios || clientAxios
  const response = await axios({ method, url: queryUrl, data: body, validateStatus: null })

  const { data, status } = ensureObject(response)
  if (status !== 200) {
    const { message } = ensureObject(data)
    if (message) {
      throw new Error(`Invalid response from server (status ${status}, message "${message}")`)
    }
    throw new Error(`Invalid response from server (status ${status}, data "${JSON.stringify(data)}")`)
  }

  return data
}
