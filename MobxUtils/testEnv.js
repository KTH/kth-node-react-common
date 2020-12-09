/* eslint no-use-before-define: ["error", "nofunc"] */

// @ts-check

const Global = {
  isTestEnvironment: false,
}

module.exports = { activateTestEnvironment, isTestEnvironment }

/**
 *
 */
function activateTestEnvironment() {
  Global.isTestEnvironment = true
}

/**
 * @returns {boolean}
 */
function isTestEnvironment() {
  return Global.isTestEnvironment
}
