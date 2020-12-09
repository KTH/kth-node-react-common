// @ts-check

const { runInAction } = require('mobx')

const { isNoObject, ensureObject, getServerApiUri, queryServerApiAsync } = require('../utils')

/**
 * @param  {...*} inputList
 *    One or more variables which shall be tested
 * @returns {boolean}
 *    True iff all given variables are strings, each with some content
 */
function _isNonEmptyString(...inputList) {
  return inputList.every(input => typeof input === 'string' && input !== '')
}

function setLanguage(lang) {
  this.language = lang
}

function setBrowserConfig(config) {
  if (config != null && typeof config === 'object') {
    Object.keys(config).forEach(key => {
      try {
        this.browserConfig[key] = JSON.parse(JSON.stringify(config[key]))
        // eslint-disable-next-line no-empty
      } catch (error) {}
    })
  }
}

function addProxy(path) {
  const { uri } = ensureObject(this.browserConfig, { path: 'proxyPrefixPath' })
  return uri ? `${uri}${path}` : path
}

function setBasicBreadcrumbs(breadcrumbs) {
  if (!Array.isArray(breadcrumbs) || breadcrumbs.some(isNoObject)) {
    throw new Error('setBasicBreadcrumbs() failed - invalid argument, expected object[]')
  }
  const isValidObject = ({ label, url }) => _isNonEmptyString(label, url)
  if (breadcrumbs.every(isValidObject) === false) {
    throw new Error('setBasicBreadcrumbs() failed - invalid argument, expected array of { label, url }')
  }

  this.basicBreadcrumbs = [...breadcrumbs]
}

function createBasicBreadcrumbs({ hostLabel, hostUrl, baseLabel, baseUrl }) {
  const breadcrumbs = []

  if (_isNonEmptyString(hostLabel, hostUrl)) {
    breadcrumbs.push({ label: hostLabel, url: hostUrl })
  } else {
    // eslint-disable-next-line no-console
    console.warn('createBasicBreadcrumbs() did not get hostLabel and hostUrl, defaulting to www.kth.se and KTH')
    breadcrumbs.push({ label: 'KTH', url: 'https://www.kth.se' })
  }

  if (_isNonEmptyString(baseLabel, baseUrl)) {
    breadcrumbs.push({ label: baseLabel, url: baseUrl })
  }

  this.setBasicBreadcrumbs(breadcrumbs)
}

function setServerPaths(paths) {
  if (paths != null && typeof paths === 'object') {
    Object.keys(paths).forEach(key => {
      try {
        this.serverPaths[key] = JSON.parse(JSON.stringify(paths[key]))
        // eslint-disable-next-line no-empty
      } catch (error) {}
    })
  }
}

function checkServerPath(pathList) {
  if (!Array.isArray(pathList) || pathList.some(path => typeof path !== 'string' || path === '')) {
    return false
  }

  let currObj = this.serverPaths
  for (let index = 0; index < pathList.length; index++) {
    currObj = currObj[pathList[index]]
    if (currObj == null || typeof currObj !== 'object') {
      return false
    }
  }

  const { method, uri } = currObj
  return typeof method === 'string' && method !== '' && typeof uri === 'string' && uri !== ''
}

function getDeviceMode() {
  return this._deviceState.mode
}

function setDeviceMode(mode) {
  this._deviceState.mode = mode
}

function checkIfDeviceIsMobile() {
  const { mode } = this._deviceState
  return mode === 'mobile'
}

function checkIfDeviceIsDesktop() {
  const { mode } = this._deviceState
  return mode === 'desktop' || mode === 'server'
}

function checkIfFullscreenIsActive() {
  const { state } = this._fullscreenState
  return state === 'on'
}

function setFullscreenState(isOn) {
  this._fullscreenState.state = isOn ? 'on' : 'off '
}

function toggleFullscreenState() {
  const { state } = this._fullscreenState
  this._fullscreenState.state = state === 'on' ? 'off' : 'on'
}

function getSystemMessage() {
  return this._systemMessageCache.text || ''
}

function checkIfSystemMessageIsReady() {
  return this._systemMessageCache.ready
}

async function querySystemMessageAsync(optionsBag) {
  try {
    const uri = getServerApiUri({ defaultStore: this, routeId: 'getSystemMessage' })
    const data = await queryServerApiAsync({ method: 'get', uri, ...optionsBag })

    const { text } = ensureObject(data)

    runInAction(() => {
      this._systemMessageCache.ready = true
      this._systemMessageCache.text = text
    })
  } catch ({ message }) {
    throw new Error(`querySystemMessageAsync() failed - ${message}`)
  }
}

async function setSystemMessageAsync(text, optionsBag) {
  try {
    if (text != null && typeof text !== 'string') {
      throw new Error('Invalid argument "text"')
    }

    const method = text == null || text === '' ? 'delete' : 'post'
    const routeId = `${method}SystemMessage`

    const uri = getServerApiUri({ defaultStore: this, routeId })
    await queryServerApiAsync({ method, uri, body: method === 'post' ? { text } : null, ...optionsBag })

    runInAction(() => {
      this._systemMessageCache.ready = true
      this._systemMessageCache.text = text
    })
  } catch ({ message }) {
    throw new Error(`setSystemMessageAsync() failed - ${message}`)
  }
}

module.exports = {
  setLanguage,
  setBrowserConfig,
  addProxy,
  setBasicBreadcrumbs,
  createBasicBreadcrumbs,
  setServerPaths,
  checkServerPath,
  getDeviceMode,
  setDeviceMode,
  checkIfDeviceIsMobile,
  checkIfDeviceIsDesktop,
  checkIfFullscreenIsActive,
  setFullscreenState,
  toggleFullscreenState,
  getSystemMessage,
  checkIfSystemMessageIsReady,
  querySystemMessageAsync,
  setSystemMessageAsync,
}
