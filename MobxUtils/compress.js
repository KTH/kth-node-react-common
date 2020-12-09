// @ts-check

const { toJS } = require('mobx')

const { isObject, isNoObject, ensureObject } = require('../utils')

const { createStore } = require('./store')

const SINGLE_STORE_KEY = '__compressedSingleStore__'
const MULTI_STORE_KEY = '__compressedMultiStore__'

/**
 * During server-side rendering put the result of this function
 * into <script>-tags so that it gets executed when the page is loaded.
 *
 * @param {object} storeData single store data or multi store data
 *
 * @returns {string}
 */
function compressStoreDataIntoJavascriptCode(storeData) {
  if (isNoObject(storeData)) {
    return ''
  }

  const isMultiStore = storeData.multiStore === true

  const globalKey = isMultiStore ? MULTI_STORE_KEY : SINGLE_STORE_KEY

  let data
  if (isMultiStore) {
    const storeIdList = Object.keys(storeData)
      .filter(key => key !== 'multiStore')
      .filter(id => isObject(storeData[id]))
    if (storeIdList.length === 0) {
      return ''
    }

    data = {}
    storeIdList.forEach(id => {
      data[id] = { ...storeData[id] }
      if (data[id]._defaultStore) {
        delete data[id]._defaultStore
      }
    })
  } else {
    data = { ...storeData }
    if (data._defaultStore) {
      delete data._defaultStore
    }
  }

  const compressedData = encodeURIComponent(JSON.stringify(toJS(data)))

  const output = `window.${globalKey} = "${compressedData}";`
  return output
}

/**
 * During client startup use this function to initialize the store(s).
 *
 * In case some data was prepared on server-side and
 * a compressed store state is given in the HTML file,
 * this data will be integrated into the newly created store.
 *
 * @throws
 * @return {object} e.g. with shape { multiStore: true, default: <store data>, ...}
 */
function uncompressStoreDataFromDocument() {
  const defaultStore = createStore('default', null)

  const multiStoreData = {
    multiStore: true,
    default: defaultStore,
  }

  const isClientSide = typeof window !== 'undefined'
  if (!isClientSide) {
    // eslint-disable-next-line no-console
    console.error('uncompressStoreDataFromDocument(): Expected to be run on client side')
    return defaultStore
  }

  const { [SINGLE_STORE_KEY]: singleStoreInput, [MULTI_STORE_KEY]: multiStoreInput } = ensureObject(window)
  const hasCompressedSingleStore = typeof singleStoreInput === 'string' && singleStoreInput !== ''
  const hasCompressedMultiStore = typeof multiStoreInput === 'string' && multiStoreInput !== ''

  if (!hasCompressedSingleStore && !hasCompressedMultiStore) {
    return defaultStore
  }

  let uncompressedData = null
  try {
    const compressedData = hasCompressedMultiStore ? multiStoreInput : singleStoreInput
    uncompressedData = JSON.parse(decodeURIComponent(compressedData))
    // eslint-disable-next-line no-empty
  } catch (error) {}

  const isValidData = isObject(uncompressedData)
  if (!isValidData) {
    // eslint-disable-next-line no-console
    console.error('uncompressStoreDataFromDocument(): Invalid store data')
    return defaultStore
  }

  if (hasCompressedMultiStore) {
    const multiStoreIdList = Object.keys(uncompressedData).filter(id => isObject(uncompressedData[id]))

    multiStoreIdList.forEach(id => {
      const input = uncompressedData[id]
      if (id !== 'default') {
        multiStoreData[id] = createStore(id, defaultStore)
      }
      const inputKeys = Object.keys(input)
      inputKeys.forEach(key => {
        multiStoreData[id][key] = input[key]
      })
    })

    return multiStoreData
  }

  const dataKeys = Object.keys(uncompressedData)
  dataKeys.forEach(key => {
    defaultStore[key] = uncompressedData[key]
  })

  return defaultStore
}

module.exports = {
  compressStoreDataIntoJavascriptCode,
  uncompressStoreDataFromDocument,
}
