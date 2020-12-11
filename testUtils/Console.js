// @ts-check

const PropTypes = require('prop-types')

const Global = { console: {} }

// const ALL_CONSOLE_METHODS = ['log', 'error', 'warn', 'debug', 'dir', 'info']
const ALL_CONSOLE_METHODS = ['log', 'error', 'warn', 'dir', 'info']

/**
 * The callback will be run without any output.
 *
 * @param {Function} callback
 *
 * @returns {*} Result of callback
 * @throws if callback throws
 */
function runQuietly(callback) {
  const backup = {}

  ALL_CONSOLE_METHODS.forEach(key => {
    // eslint-disable-next-line no-console
    backup[key] = console[key]
    // eslint-disable-next-line no-console
    console[key] = () => {}
  })

  let error
  let result

  try {
    result = callback()
  } catch (_error) {
    error = _error
  }

  ALL_CONSOLE_METHODS.forEach(key => {
    // eslint-disable-next-line no-console
    console[key] = backup[key]
  })

  if (error == null) {
    return result
  }
  throw error
}

/**
 * You might want to use this function
 * in case you still want to output something
 * - especially during debugging your tests -
 * even if you temporarily mocked all console-methods.
 *
 * @param  {...any} input
 */
function forcedLog(...input) {
  const { mocked, backup } = Global.console

  if (mocked || backup.log != null) {
    backup.log.apply(null, input)
  } else {
    // eslint-disable-next-line no-console
    console.log.apply(null, input)
  }
}

/**
 * The given console-methods will be mocked
 * so that they temporarily don't produce any output.
 *
 * Any call to the console-methods will be memorized
 * and can be queried with getMockedCalls().
 *
 * @param {string[]} [methodList=['log','error']]
 */
function mock(methodList = ['log', 'error']) {
  if (Global.console.backup == null) {
    Global.console.backup = {}
  }
  if (Global.console.calls == null) {
    Global.console.calls = {}
  }

  methodList.forEach(key => {
    if (Global.console.backup[key] == null) {
      // eslint-disable-next-line no-console
      Global.console.backup[key] = console[key]
      Global.console.calls[key] = []
      // eslint-disable-next-line no-console
      console[key] = (...args) => {
        Global.console.calls[key].push(args)
      }
    }
  })

  Global.console.mocked = true
}

/**
 * All console-methods will be mocked
 * so that they temporarily don't produce any output.
 *
 * Any call to the console-methods will be memorized
 * and can be queried with getMockedCalls().
 */
function mockAll() {
  mock(ALL_CONSOLE_METHODS)
}

/**
 * Any previously deactivated console-method
 * will be restored to its normal behaviour.
 *
 * This function revokes any change from mock()
 * and also removes all memories to mocked calls.
 */
function unmockAll() {
  const { mocked, backup } = Global.console
  if (!mocked) {
    return
  }

  Object.keys(backup).forEach(key => {
    // eslint-disable-next-line no-console
    console[key] = backup[key]
  })

  Global.console = { mocked: false }
}

/**
 * Might be used after mock() to forget
 * all calls of console-methods which happened meanwhile.
 */
function resetMockedCalls() {
  const { mocked, calls } = Global.console

  if (!mocked) {
    return
  }

  Object.keys(calls).forEach(key => {
    Global.console.calls[key] = []
  })
}

/**
 * Might be used after mock() (and maybe resetMockedCalls())
 * to query all calls of the given console-methods
 * which happened meanwhile.
 *
 * @param {string[]} [methodList=['log','error']]
 * @returns {object}
 *    e.g. { log: [['Hello world'], ['Hello universe']],
 *           error: [] }
 */
function getMockedCalls(methodList = ['log', 'error']) {
  const { mocked, calls } = Global.console
  if (mocked) {
    return calls
  }

  const dummyResult = {}
  methodList.forEach(key => {
    dummyResult[key] = []
  })
  return dummyResult
}

/**
 * @param {object} options
 * @param {boolean} [options.skipPropTypes]
 * @throws
 *    in case some (mocked) console-functions were used
 *    since the last resetMockedCalls()
 */
function expectEmptyMockedCalls(options) {
  const { mocked, calls } = Global.console
  if (!mocked) {
    return
  }

  const _checkIfCallIsPropTypesWarning = args =>
    args.some(arg => /Warning: Failed prop type/.test(arg)) ||
    (args[0].startsWith('Warning: Failed %s type') && args[1] === 'prop')

  const gotOptions = options != null && typeof options === 'object'
  const skipPropTypes = gotOptions && options.skipPropTypes === true

  const allEmpty = {}
  const mockedCalls = {}
  Object.keys(calls).forEach(key => {
    allEmpty[key] = []
    mockedCalls[key] =
      key === 'error' && skipPropTypes
        ? calls[key].filter(args => _checkIfCallIsPropTypesWarning(args) === false)
        : [...calls[key]]
  })

  expect(mockedCalls).toEqual(allEmpty)
}

/**
 * @param {object} inputBag
 * @param {object} inputBag.reactComponent
 *      e.g. `<Info>Hello world</Info>`
 * @param {boolean|number|string[]} inputBag.expectedWarnings
 *      true - expect warnings; or
 *      false - expect no warnings; or
 *      0, 1, 2, 3, ... - expect given number of warnings; or
 *      ["...", "..."] - expect warnings for the given props
 *
 * @throws
 *    in case the given React-component produces PropTypes-warnings
 *    which don't exactly fit expectedWarnings
 */
function checkMockedPropTypesWarnings({ reactComponent, expectedWarnings }) {
  const { mocked, calls } = Global.console
  if (!mocked) {
    throw new Error('mockup must be enabled, first')
  }

  const { log, error } = calls
  if (!log || !error) {
    return
  }

  const lengthBefore = { log: log.length, error: error.length }

  PropTypes.resetWarningCache()
  // eslint-disable-next-line react/forbid-foreign-prop-types
  const { propTypes, name } = reactComponent.type
  PropTypes.checkPropTypes(propTypes, reactComponent.props, 'prop', name)

  const newCalls = { log: log.splice(lengthBefore.log), error: error.splice(lengthBefore.error) }

  expect(newCalls.log).toHaveLength(0)

  if (expectedWarnings === false) {
    expect(newCalls.error).toHaveLength(0)
  } else if (expectedWarnings === true) {
    expect(newCalls.error).not.toHaveLength(0)
  } else if (typeof expectedWarnings === 'number') {
    expect(newCalls.error).toHaveLength(expectedWarnings)
  } else if (Array.isArray(expectedWarnings) && expectedWarnings.every(item => typeof item === 'string')) {
    const _errorMessageContainsWarning = ({ errorArgs, warning }) => errorArgs.some(arg => arg.includes(warning))
    const errorMessagesNotMatchingWarnings = newCalls.error.filter(errorArgs =>
      expectedWarnings.every(warning => !_errorMessageContainsWarning({ errorArgs, warning }))
    )
    const warningsNotMatchingErrorMessages = expectedWarnings.filter(warning =>
      newCalls.error.every(errorArgs => !_errorMessageContainsWarning({ errorArgs, warning }))
    )
    expect([errorMessagesNotMatchingWarnings, warningsNotMatchingErrorMessages]).toEqual([[], []])
    expect(newCalls.error).toHaveLength(expectedWarnings.length)
  } else {
    throw new Error('invalid input')
  }

  const _checkIfCallIsPropTypesWarning = args =>
    args.some(arg => /Warning: Failed prop type/.test(arg)) ||
    (args[0].startsWith('Warning: Failed %s type') && args[1] === 'prop')
  error.forEach(args => {
    if (!_checkIfCallIsPropTypesWarning(args)) {
      forcedLog({ args })
    }
    expect([_checkIfCallIsPropTypesWarning(args), args]).toEqual([true, args])
  })
}

module.exports = {
  runQuietly,
  forcedLog,
  mockAll,
  mock,
  unmockAll,
  resetMockedCalls,
  getMockedCalls,
  expectEmptyMockedCalls,
  checkMockedPropTypesWarnings,
}
