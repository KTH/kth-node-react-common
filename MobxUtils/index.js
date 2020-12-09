// @ts-check

const MobxStoreProvider = require('./MobxStoreProvider')
const useStore = require('./useStore')

const { announceStore, createStore, createMultiStore, getStoreState } = require('./store')
const { compressStoreDataIntoJavascriptCode, uncompressStoreDataFromDocument } = require('./compress')
const { activateTestEnvironment } = require('./testEnv')

module.exports = {
  announceStore,
  createStore,
  createMultiStore,
  getStoreState,

  compressStoreDataIntoJavascriptCode,
  uncompressStoreDataFromDocument,

  MobxStoreProvider,
  useStore,

  activateTestEnvironment,
}
