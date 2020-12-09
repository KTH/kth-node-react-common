// @ts-check

const { useLocalObservable } = require('mobx-react')

const { createStore } = require('./store')
const { getStoreManager } = require('./manager')
const { isTestEnvironment } = require('./testEnv')

function bindAllOwnMethodsInObject(input) {
  const funcNames = Object.keys(input).filter(key => typeof input[key] === 'function')
  funcNames.forEach(key => {
    // eslint-disable-next-line no-param-reassign
    input[key] = input[key].bind(input)
  })
}

/**
 * Hook which can be used by any React component
 * which is wrapped by the related MobxStoreProvider.
 *
 * @param {string} [storeId]
 *
 * @returns {object}
 *      Current state of application store
 */
function useStore(storeId = 'default') {
  const manager = getStoreManager(storeId)
  if (manager != null && manager.checkIfIsActive()) {
    return manager.getContextHook()
  }

  if (isTestEnvironment()) {
    const dummyDefaultStore = createStore('default')
    bindAllOwnMethodsInObject(dummyDefaultStore)
    if (storeId === 'default') {
      return useLocalObservable(() => dummyDefaultStore)
    }

    const dummyStore = createStore(storeId, dummyDefaultStore)
    bindAllOwnMethodsInObject(dummyStore)
    return useLocalObservable(() => dummyStore)
  }

  throw new Error(`useStore() failed - Unknown storeId "${storeId}" given`)
}

module.exports = useStore
