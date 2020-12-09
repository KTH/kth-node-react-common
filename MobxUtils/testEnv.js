// @ts-check

const Global = {
  isTestEnvironment: false,
}

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

module.exports = { activateTestEnvironment, isTestEnvironment }
