/* eslint no-use-before-define: ["error", "nofunc"] */

// @ts-check

const Animation = require('./Animation')
// const FadeInAndOut = require('./FadeInAndOut')
const formatDate = require('./formatDate')
// const getStringSortCallback = require('../../app/utils/getStringSortCallback')
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
  // FadeInAndOut,
  formatDate,
  // getStringSortCallback,
  prepareAsyncSafeState,
  getServerApiUri,
  queryServerApiAsync,
}
