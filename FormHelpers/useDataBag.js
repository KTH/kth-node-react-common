// @ts-check

const { useState } = require('react')

const { isNoObject, setInObject } = require('../utils')

class DataBag {
  constructor(initialData) {
    this._initialData = initialData == null ? {} : initialData
    if (isNoObject(this._initialData)) {
      throw new Error('useDataBag() failed - invalid argument "initialData"')
    }

    const [a, setA] = useState({})
    this._allDataChanges = a
    this._setAllDataChanges = setA
  }

  setInitialData(input) {
    if (isNoObject(input)) {
      throw new Error('dataBag.setInitialData() failed - invalid input')
    }
    this._initialData = input
    return this
  }

  getCurrentData() {
    const result = { ...this._initialData }
    Object.keys(this._allDataChanges).forEach(path => {
      setInObject({
        object: result,
        path,
        newValue: this._allDataChanges[path].newValue,
        copySubObjectsOnPath: true,
      })
    })
    return result
  }

  hasSomeChanges() {
    return Object.keys(this._allDataChanges).length > 0
  }

  discardAllChanges() {
    this._setAllDataChanges({})
    return this
  }
}

/**
 * `useDataBag()`
 * is a hook which prepares a special object "dataBag".
 * This object can then be used together with the form-helpers
 *      (e.g. `<Input />`, `<Checkbox />`)
 * to track all user-input based on an initial data-object
 *      (e.g. { _id: "...", place: { city: "Stockholm", ... } })
 * and paths into that object
 *      (e.g. <Input ... dataBag={dataBag} dataPath="place.city" />).
 *
 * @param {object} [initialData]
 * @returns {DataBag} dataBag which contains internal data,
 *    - a public method `setInitialData(input: object)`,
 *    - a public method `getCurrentData()`,
 *    - a public method `hasSomeChanges()` and
 *    - a public method `discardAllChanges()`
 */
function useDataBag(initialData) {
  const result = new DataBag(initialData)
  return result
}

module.exports = useDataBag
