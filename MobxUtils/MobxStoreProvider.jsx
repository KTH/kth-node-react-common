// @ts-check

const React = require('react')

const { isObject, isNoObject } = require('../utils')

const { getStoreManager } = require('./manager')

/**
 * React-component which prepares one or more MobX-stores
 * so that their data can be used with the useStore(<id>) hook
 * by any other component wrapped be this Provider.
 *
 * @param {object} props
 * @param {object|null} props.storeData
 *    Data of default store; or
 *    Multi store data
 *      e.g. { multiStore: true, default: <store data>, program: <store data> }; or
 *    Null if no store shall be served
 * @param {string} [props.singleStoreId]
 *    If you are using a single store other than the default store
 *    you have to give the store-ID here, e.g.
 *      "program"
 * @param {object} props.children
 *    React components which shall get access to given store(s) via the useStore(<id>) hook
 *
 * @returns {object}
 */
function MobxStoreProvider(props) {
  const { storeData, singleStoreId, children } = props

  if (storeData == null) {
    return children
  }
  if (isNoObject(storeData)) {
    throw new Error('<MobxStoreProvider/> failed - invalid prop "storeData"')
  }

  const fakedMultiStore =
    typeof singleStoreId === 'string' && singleStoreId !== ''
      ? { multiStore: true, [singleStoreId]: storeData }
      : { multiStore: true, default: storeData }
  const multiStoreData = storeData.multiStore === true ? storeData : fakedMultiStore

  const storeIdList = Object.keys(multiStoreData)
    .filter(key => key !== 'multiStore')
    .filter(id => isObject(multiStoreData[id]))

  if (storeIdList.length === 0) {
    throw new Error('<MobxStoreProvider/> failed - missing store data')
  }

  let result = children

  storeIdList.forEach(id => {
    const manager = getStoreManager(id)
    manager.initWithNewData(multiStoreData[id])
    const { Provider: ReactContextProvider, value: mobxStore } = manager.getProviderComponentAndValue()
    result = <ReactContextProvider value={mobxStore}>{result}</ReactContextProvider>
  })

  return result
}

module.exports = MobxStoreProvider
