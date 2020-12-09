/* eslint no-use-before-define: ["error", "nofunc"] */

// @ts-check

jest.mock('./store')

const { isNoObject } = require('../utils')

const { compressStoreDataIntoJavascriptCode, uncompressStoreDataFromDocument } = require('./compress')

const { createStore } = require('./store')
// @ts-ignore
createStore.mockImplementation(createStoreMockup)

describe('MobX utility "compress"', () => {
  runTestsAboutCompressStoreData()
  runTestsAboutUncompressStoreData()
})

function runTestsAboutCompressStoreData() {
  describe('has compressStoreDataIntoJavascriptCode() which', () => {
    it('is a function', () => {
      expect(compressStoreDataIntoJavascriptCode).toBeFunction()
    })

    it('- when used w/o argument - returns an empty string', () => {
      // @ts-ignore
      expect(compressStoreDataIntoJavascriptCode()).toBe('')
    })

    it('- when used with invalid argument - returns an empty string', () => {
      expect(compressStoreDataIntoJavascriptCode(true)).toBe('')
      expect(compressStoreDataIntoJavascriptCode(79)).toBe('')
      expect(compressStoreDataIntoJavascriptCode('Stockholm')).toBe('')
      expect(compressStoreDataIntoJavascriptCode(null)).toBe('')
    })

    it('- when used with single store data - works as expected', () => {
      const singleStoreData = createStoreMockup()

      const result = compressStoreDataIntoJavascriptCode(singleStoreData)
      expect(result).toBe(getCompressedTestStores('single-default', true))
    })

    it('- when used with multi store data (1 store) - works as expected', () => {
      const multiStoreData = {
        multiStore: true,
        default: createStoreMockup(),
      }

      const result = compressStoreDataIntoJavascriptCode(multiStoreData)
      expect(result).toBe(getCompressedTestStores('multi-default', true))
    })

    it('- when used with multi store data (2 stores) - works as expected', () => {
      const multiStoreData = {
        multiStore: true,
        default: createStoreMockup(),
        program: createStoreMockup('program'),
      }

      const result = compressStoreDataIntoJavascriptCode(multiStoreData)
      expect(result).toBe(getCompressedTestStores('multi-default-program', true))
    })
  })
}

function runTestsAboutUncompressStoreData() {
  describe('has uncompressStoreDataFromDocument() which', () => {
    it('is a function', () => {
      expect(uncompressStoreDataFromDocument).toBeFunction()
    })

    // it('- when used w/o argument - FAILS with an error', () => {
    //   expect(uncompressStoreDataFromDocument).toThrow('invalid arguments')
    // })

    // it('- when used with invalid arguments - FAILS with an error', () => {
    //   // @ts-ignore
    //   expect(() => uncompressStoreDataFromDocument(true)).toThrow('invalid arguments')
    //   // @ts-ignore
    //   expect(() => uncompressStoreDataFromDocument(79)).toThrow('invalid arguments')
    //   // @ts-ignore
    //   expect(() => uncompressStoreDataFromDocument('Stockholm')).toThrow('invalid arguments')
    //   expect(() => uncompressStoreDataFromDocument(null)).toThrow('invalid arguments')
    //   // @ts-ignore
    //   expect(() => uncompressStoreDataFromDocument({ name: 'test' })).toThrow('invalid arguments')
    // })

    it('- when used w/o global data - returns initial store data', () => {
      _adaptWindowGlobal({ singleTarget: null, multiTarget: null })

      // @ts-ignore
      createStore.mockClear()
      const result = uncompressStoreDataFromDocument()

      // @ts-ignore
      expect(createStore.mock.calls).toEqual([['default', null]])

      expect(result).toMatchInlineSnapshot(`
        Object {
          "_testValue": "test",
          "getTestValue": [Function],
          "setTestValue": [Function],
        }
      `)
    })

    it('- when used with global data (changed single store) - returns changed store data', () => {
      _adaptWindowGlobal({ singleTarget: 'changed-single-default' })

      // @ts-ignore
      createStore.mockClear()
      const result = uncompressStoreDataFromDocument()

      // @ts-ignore
      expect(createStore.mock.calls).toEqual([['default', null]])
      expect(result._testValue).toBe('changed')
    })

    it('- when used with global data (changed multi store, 1 store) - returns multi store data', () => {
      _adaptWindowGlobal({ multiTarget: 'changed-multi-default' })

      // @ts-ignore
      createStore.mockClear()
      const result = uncompressStoreDataFromDocument()

      // @ts-ignore
      expect(createStore.mock.calls).toEqual([['default', null]])

      expect(result).toContainAllKeys(['multiStore', 'default'])
      expect(result.multiStore).toBe(true)
      expect(result.default._testValue).toBe('changed')
    })

    it('- when used with global data (changed multi store, 2 stores) - returns multi store data', () => {
      _adaptWindowGlobal({ multiTarget: 'changed-multi-default-program' })

      // @ts-ignore
      createStore.mockClear()
      const result = uncompressStoreDataFromDocument()

      // @ts-ignore
      expect(createStore.mock.calls).toEqual([
        ['default', null],
        ['program', result.default],
      ])

      expect(result).toContainAllKeys(['multiStore', 'default', 'program'])
      expect(result.multiStore).toBe(true)
      expect(result.default._testValue).toBe('changed')
      expect(result.program._defaultStore).toBe(result.default)
      expect(result.program._currItemCode).toBe('ARKIT')
    })
  })
}

/**
 * @param {string} [id]
 * @param {object} [defaultStore]
 */
function createStoreMockup(id, defaultStore) {
  switch (id) {
    default:
      return {
        _testValue: 'test',
        getTestValue() {
          return this._testValue
        },
        setTestValue(value) {
          this._testValue = value
        },
      }
    case 'program':
      return {
        _defaultStore: defaultStore,
        _currItemCode: 'CBIOT',
        getCurrItem() {
          return this._currItemCode
        },
        setCurrItem(code) {
          this._currItemCode = code
        },
      }
  }
}

/**
 * @param {string} target
 * @param {boolean} includeAssignment
 */
function getCompressedTestStores(target, includeAssignment) {
  let key
  let value

  switch (target) {
    default:
    case 'single-default':
      key = '__compressedSingleStore__'
      value = '%7B%22_testValue%22%3A%22test%22%7D'
      break
    case 'multi-default':
      key = '__compressedMultiStore__'
      value = '%7B%22default%22%3A%7B%22_testValue%22%3A%22test%22%7D%7D'
      break
    case 'multi-default-program':
      key = '__compressedMultiStore__'
      value =
        '%7B%22default%22%3A%7B%22_testValue%22%3A%22test%22%7D%2C%22program%22%3A%7B%22_currItemCode%22%3A%22CBIOT%22%7D%7D'
      break
    case 'changed-single-default':
      key = '__compressedSingleStore__'
      value = '%7B%22_testValue%22%3A%22changed%22%7D'
      break
    case 'changed-multi-default':
      key = '__compressedMultiStore__'
      value = '%7B%22default%22%3A%7B%22_testValue%22%3A%22changed%22%7D%7D'
      break
    case 'changed-multi-default-program':
      key = '__compressedMultiStore__'
      value =
        '%7B%22default%22%3A%7B%22_testValue%22%3A%22changed%22%7D%2C%22program%22%3A%7B%22_currItemCode%22%3A%22ARKIT%22%7D%7D'
      break
  }

  return includeAssignment ? `window.${key} = "${value}";` : value
}

/**
 * @param {object} inputBag
 * @param {string} [inputBag.singleTarget]
 * @param {string} [inputBag.multiTarget]
 */
function _adaptWindowGlobal({ singleTarget, multiTarget }) {
  if (typeof window === 'undefined' || isNoObject(window)) {
    throw new Error('_adaptWindowGlobal() failed - missing window global')
  }

  window.__compressedSingleStore__ = singleTarget ? getCompressedTestStores(singleTarget, false) : null
  window.__compressedMultiStore__ = multiTarget ? getCompressedTestStores(multiTarget, false) : null
}
