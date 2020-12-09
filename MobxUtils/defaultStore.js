// @ts-check

const {
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
} = require('./defaultStore-actions')

function createDefaultStore() {
  const store = {
    /**
     * @property {string|null} language which is selected for UI, e.g. "sv"
     */
    language: null,
    /**
     * @method
     * @param {string} lang e.g. "sv"
     */
    setLanguage,

    /**
     * @property {object} browserConfig which is given in server
     */
    browserConfig: {},
    /**
     * @method
     * @param {object} config
     */
    setBrowserConfig,
    /**
     * @method
     * @param {string} path e.g. "/static/img/fullscreen.svg"
     * @returns {string} e.g. "/utbildning/jamfor/static/img/fullscreen.svg"
     */
    addProxy,

    /**
     * @property {object} serverPaths which are given in server
     */
    serverPaths: {},
    /**
     * @method
     * @param {object} paths
     */
    setServerPaths,
    /**
     * @method
     * @param {string[]} pathList e.g. ["api", "getProgramSummaryByCode"]
     * @returns {boolean}
     *    True iff this.serverPaths contains a valid object { method, uri }
     *    under the given object-path,
     *      e.g. this.serverPaths.api.getProgramSummaryByCode
     */
    checkServerPath,

    /**
     * @property {object[]} basicBreadcrumbs
     *    list of objects with shape { label, url }
     */
    basicBreadcrumbs: [{ label: 'KTH', url: 'https://www.kth.se' }],
    /**
     * @method
     * @param {object[]} breadcrumbs
     */
    setBasicBreadcrumbs,
    /**
     * @method
     * @param {object} inputBag
     * @param {string} [inputBag.host]
     *    URL of homepage, e.g. "https://www.kth.se"
     * @param {string} [inputBag.hostNameKey]
     *    caption of homepage-link, e.g. "KTH"
     * @param {string} [inputBag.basePath]
     *    URL of section, e.g. "https://www.kth.se/utbildning"
     * @param {string} [inputBag.baseNameKey]
     *    caption of section-link, e.g. "Utbildning"
     */
    createBasicBreadcrumbs,

    /**
     * @property {object} _deviceState
     */
    _deviceState: { mode: 'server', viewportWidth: null, refreshListener: null },
    /**
     * @method
     * @returns {string}
     */
    getDeviceMode,
    /**
     * @method
     * @param {string} mode
     */
    setDeviceMode,
    /**
     * @method
     * @returns {boolean}
     */
    checkIfDeviceIsMobile,
    /**
     * @method
     * @returns {boolean}
     */
    checkIfDeviceIsDesktop,

    /**
     * @property {object} _fullscreenState
     */
    _fullscreenState: { state: 'off', fader: null },
    /**
     * @method
     * @returns {boolean}
     */
    checkIfFullscreenIsActive,
    /**
     * @method
     * @param {boolean} isOn
     */
    setFullscreenState,
    /**
     * @method
     */
    toggleFullscreenState,

    /**
     * @private
     * @property {object} _systemMessageCache
     */
    _systemMessageCache: { ready: false, text: null },
    /**
     * @method
     * @returns {string}
     */
    getSystemMessage,
    /**
     * @method
     * @returns {boolean}
     */
    checkIfSystemMessageIsReady,
    /**
     * @method
     * @returns {Promise}
     */
    querySystemMessageAsync,
    /**
     * @method
     * @param {string} text
     * @param {object} [optionsBag]
     * @returns {Promise}
     */
    setSystemMessageAsync,
  }

  return store
}

module.exports = createDefaultStore
