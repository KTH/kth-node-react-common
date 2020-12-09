/* eslint no-use-before-define: ["error", "nofunc"] */

// @ts-check

const { findInObject } = require('../utils')

module.exports = { getCurrentInputData, setCurrentInputData }

/**
 * @param {object} inputBag
 * @param {object} inputBag.dataBag
 * @param {string} inputBag.dataPath
 * @returns {*}
 */
function getCurrentInputData({ dataBag, dataPath }) {
  const { _initialData, _allDataChanges } = dataBag
  const initialValue = findInObject({ object: _initialData, path: dataPath })
  const changeRecord = _allDataChanges[dataPath]

  const result = changeRecord == null ? initialValue : changeRecord.newValue

  if (typeof result === 'object') {
    return Array.isArray(result) ? [...result] : { ...result }
  }

  return result
}

/**
 * @param {object} inputBag
 * @param {object} inputBag.dataBag
 * @param {string} inputBag.dataPath
 * @param {*} inputBag.newValue
 */
function setCurrentInputData({ dataBag, dataPath, newValue }) {
  const { _initialData, _allDataChanges, _setAllDataChanges } = dataBag

  const changeRecord = _allDataChanges[dataPath]

  const valueWasChangedBefore = changeRecord != null
  if (valueWasChangedBefore) {
    if (_hasSameValue(newValue, changeRecord.newValue) === false) {
      const update = { ..._allDataChanges }
      if (_hasSameValue(newValue, changeRecord.initialValue)) {
        delete update[dataPath]
      } else {
        update[dataPath] = { initialValue: changeRecord.initialValue, newValue }
      }
      _setAllDataChanges(update)
    }
    return
  }

  const initialValue = findInObject({ object: _initialData, path: dataPath })
  if (_hasSameValue(initialValue, newValue) === false) {
    const update = { ..._allDataChanges }
    update[dataPath] = { initialValue, newValue }
    _setAllDataChanges(update)
  }
}

/**
 * @param {*} inputA
 * @param {*} inputB
 * @returns {boolean}
 */
function _hasSameValue(inputA, inputB) {
  if (inputA == null && inputB == null) {
    return true
  }
  if (inputA == null || inputB == null) {
    return false
  }
  if (typeof inputA !== typeof inputB) {
    return false
  }
  if (typeof inputA !== 'object') {
    return inputA === inputB
  }

  const exactlyOneOfBothIsAnArray = Array.isArray(inputA) ? Array.isArray(inputB) === false : Array.isArray(inputB)
  if (exactlyOneOfBothIsAnArray) {
    return false
  }

  const keysA = Object.keys(inputA)
  const keysB = Object.keys(inputB)
  if (keysA.length !== keysB.length) {
    return false
  }
  return keysA.every(key => _hasSameValue(inputA[key], inputB[key]))
}
