// @ts-check

const Animation = require('./Animation')
const {
  isObject,
  isNoObject,
  isArrayOfObjects,
  ensureObject,
  expectObject,
  findInObject,
  setInObject,
} = require('./objects')
const prepareAsyncSafeState = require('./prepareAsyncSafeState')
const { getServerApiUri, queryServerApiAsync } = require('./storeUtils')

module.exports = {
  isObject,
  isNoObject,
  isArrayOfObjects,
  ensureObject,
  expectObject,
  findInObject,
  setInObject,
  Animation,
  prepareAsyncSafeState,
  getServerApiUri,
  queryServerApiAsync,
}
