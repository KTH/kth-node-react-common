// @ts-check

const React = require('react')
const { useLocalObservable } = require('mobx-react')

const { isNoObject } = require('../utils')

const { isTestEnvironment } = require('./testEnv')

const Global = {
  managerInstances: {},
  isTestEnvironment: false,
}

class MobxStoreManager {
  constructor(storeId, initCallback) {
    if (typeof initCallback !== 'function') {
      throw new Error('<MobxStoreProvider/> failed internally - MobxStoreManager() got invalid arguments')
    }

    this._id = storeId
    this._initCallback = initCallback

    this._initialized = false
    this._reactContext = null
    this._ReactContextProvider = null
    this._mobxStore = null
  }

  getId() {
    return this._id
  }

  getInitCallback() {
    return this._initCallback
  }

  setInitCallback(initCallback) {
    if (this._initCallback === initCallback) {
      return this
    }

    this._initCallback = initCallback

    if (this._initialized) {
      this._mobxStore = useLocalObservable(this._initCallback)
    }

    return this
  }

  initWithInitialData(force = false) {
    if (force !== true && this._initialized) {
      return this
    }

    if (this._initialized === false) {
      this._reactContext = React.createContext(null)
      this._ReactContextProvider = this._reactContext.Provider
    }

    this._mobxStore = useLocalObservable(this._initCallback)

    this._initialized = true
    return this
  }

  initWithNewData(input) {
    if (isNoObject(input)) {
      throw new Error('<MobxStoreProvider/> failed internally - initWithNewData() got invalid input')
    }

    if (this._initialized === false) {
      this._reactContext = React.createContext(null)
      this._ReactContextProvider = this._reactContext.Provider
    }

    this._mobxStore = useLocalObservable(() => input)

    this._initialized = true
    return this
  }

  getProviderComponentAndValue() {
    this._ensureIsActive()

    const result = {
      Provider: this._ReactContextProvider,
      value: this._mobxStore,
    }
    return result
  }

  getContextHook() {
    this._ensureIsActive()

    return React.useContext(this._reactContext)
  }

  checkIfIsActive() {
    return this._initialized
  }

  _ensureIsActive() {
    if (isTestEnvironment()) {
      this.initWithInitialData()
      return this
    }

    if (this._initialized) {
      return this
    }

    throw new Error('<MobxStoreProvider/> failed internally - expected store to be initialized, already')
  }
}

/**
 * @param {string} storeId
 *      Can be used to identify the needed store
 *      in case more than one store is managed
 * @param {function} initCallback
 *      Function that returns the initial state of the store
 *
 * @returns {object}
 *      Returns a manager instance which especially contains
 *      the method "getProviderComponentAndValue()"
 */
function createStoreManager(storeId, initCallback) {
  const manager = Global.managerInstances[storeId]
  if (manager == null) {
    Global.managerInstances[storeId] = new MobxStoreManager(storeId, initCallback)
    return Global.managerInstances[storeId]
  }

  manager.setInitCallback(initCallback)
  return manager
}

/**
 * @param {string} [storeId]
 *      Can be used to identify the needed store
 *      in case more than one store is managed
 *
 * @returns {object|null}
 *      Manager instance if createStoreManager() was used before; or
 *      Null
 */
function getStoreManager(storeId) {
  return Global.managerInstances[storeId] || null
}

module.exports = { createStoreManager, getStoreManager }
