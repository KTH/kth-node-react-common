// @ts-check

/**
 * Class Animation
 * runs several callbacks (e.g. to style DOM-elements with CSS) with individually given delays.
 *
 * Abort-checks might be added which allows the animation to be cancelled.
 */
class Animation {
  constructor() {
    this._actionsWithTimestamp = {}
    this._cleanupsWithTimestamp = {}
    this._abortChecks = []

    this._activeWithLastTimestamp = null
  }

  /**
   * @param {number} delayMS milliseconds to wait before running the action - use 0 for immediate actions
   * @param {() => *} actionCallback which will be invoked if all abort-checks return false
   * @returns {Animation}
   */
  addAction(delayMS, actionCallback) {
    if (typeof delayMS !== 'number' || delayMS < 0 || typeof actionCallback !== 'function') {
      return this
    }

    const key = String(delayMS)
    if (this._actionsWithTimestamp[key] == null) {
      this._actionsWithTimestamp[key] = []
    }
    this._actionsWithTimestamp[key].push(actionCallback)

    return this
  }

  /**
   * @param {number} delayMS milliseconds to wait before running the cleanup
   * @param {() => *} cleanupCallback which will always be invoked
   * @returns {Animation}
   */
  addCleanup(delayMS, cleanupCallback) {
    if (typeof delayMS !== 'number' || delayMS < 0 || typeof cleanupCallback !== 'function') {
      return this
    }

    const key = String(delayMS)
    if (this._cleanupsWithTimestamp[key] == null) {
      this._cleanupsWithTimestamp[key] = []
    }
    this._cleanupsWithTimestamp[key].push(cleanupCallback)

    return this
  }

  /**
   * @param {() => Boolean} checkCallback which will return false as long as all actions shall proceed
   * @returns {Animation}
   */
  addAbortCheck(checkCallback) {
    if (typeof checkCallback !== 'function') {
      return this
    }

    this._abortChecks.push(checkCallback)
    return this
  }

  /**
   * All enqueued actions and cleanups will be run with the given delays.
   * If actions or cleanups share the same delay, they will be invoked synchronically.
   *
   * But as soon as one of the abort-checks returns true:
   * - All left-over actions will be skipped.
   * - All left-over cleanups will be invoked directly.
   */
  init() {
    if (this._activeWithLastTimestamp == null) {
      this._processNextTimestamp(0)
    }
    return null
  }

  /**
   * @TODO improve, e.g. it resolves after all left over cleanups are done
   */
  async abort() {
    this.addAbortCheck(() => true)
  }

  _processNextTimestamp(delayMS) {
    const key = String(delayMS)

    this._activeWithLastTimestamp = delayMS

    if (this._checkAbort()) {
      this._runAllLeftOverCleanupsAtOnce(delayMS)
      return
    }

    const actionsWithCurrentTimestamp = this._actionsWithTimestamp[key] || []
    const cleanupsWithCurrentTimestamp = this._cleanupsWithTimestamp[key] || []
    const nextTimestamp = this._getNextTimestamp()

    actionsWithCurrentTimestamp.forEach(action => action())
    cleanupsWithCurrentTimestamp.forEach(action => action())

    const doesAnimationHaveMoreSteps = nextTimestamp != null && nextTimestamp > delayMS
    if (doesAnimationHaveMoreSteps) {
      const _nextStep = () => this._processNextTimestamp(nextTimestamp)
      setTimeout(_nextStep.bind(this), nextTimestamp - delayMS)
    }
  }

  _checkAbort() {
    return this._abortChecks.some(action => Boolean(action()))
  }

  _getNextTimestamp() {
    let result = null
    const resultMustBeGreaterThan = this._activeWithLastTimestamp || 0

    const actionTimestamps = Object.keys(this._actionsWithTimestamp).map(key => parseInt(key, 10))
    actionTimestamps.forEach(delayMS => {
      if (delayMS > resultMustBeGreaterThan && (result == null || delayMS < result)) {
        result = delayMS
      }
    })

    const cleanupTimestamps = Object.keys(this._cleanupsWithTimestamp).map(key => parseInt(key, 10))
    cleanupTimestamps.forEach(delayMS => {
      if (delayMS > resultMustBeGreaterThan && (result == null || delayMS < result)) {
        result = delayMS
      }
    })

    return result
  }

  _runAllLeftOverCleanupsAtOnce(delayMS) {
    const allLeftOverCleanupTimestamps = Object.keys(this._cleanupsWithTimestamp)
      .map(key => parseInt(key, 10))
      .filter(item => item >= delayMS)
      .sort((a, b) => a - b)

    allLeftOverCleanupTimestamps.forEach(ms => {
      const key = String(ms)
      this._cleanupsWithTimestamp[key].forEach(action => action())
    })
  }
}

module.exports = Animation
