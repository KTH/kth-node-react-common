// @ts-check

const Animation = require('./Animation')

describe('Utility class Animation', () => {
  it('can be instantiated', () => {
    const animation = new Animation()

    expect(animation).toBeInstanceOf(Animation)
  })

  it('has methods addAction() and addCleanup() to enqueue actions and cleanups', () => {
    const animation = new Animation()

    expect(animation.addAction).toBeFunction()
    expect(animation.addCleanup).toBeFunction()

    expect(animation.addAction(100, () => {})).toBe(animation)
    expect(animation.addCleanup(100, () => {})).toBe(animation)
  })

  it('has method addAbortCheck() to enable aborting enqueued actions', () => {
    const animation = new Animation()

    expect(animation.addAbortCheck).toBeFunction()

    expect(animation.addAbortCheck(() => false)).toBe(animation)
  })

  it('has method init() to invoke all enqueued actions and cleanups', () => {
    const animation = new Animation()

    expect(animation.init).toBeFunction()

    expect(animation.init()).toBe(null)
  })

  it('- when given delays are 0 - runs actions and cleanups immediately', () => {
    const animation = new Animation()

    const testRuns = {}
    const _prepareTestCallback = key => () => {
      testRuns[key] = 1
    }

    animation.addAction(0, _prepareTestCallback('step1'))
    animation.addCleanup(0, _prepareTestCallback('end'))
    animation.init()

    expect(testRuns).toEqual({ step1: 1, end: 1 })
  })

  it('- when given delays are greater than 0 - runs actions and cleanups after timeout', async () => {
    const animation = new Animation()

    const testRuns = {}
    const _prepareTestCallback = key => () => {
      testRuns[key] = 1
    }

    const snapshots = {}
    const _addSnapshot = key => {
      snapshots[key] = { ...testRuns }
    }

    animation.addAction(100, _prepareTestCallback('step1'))
    animation.addCleanup(200, _prepareTestCallback('end'))
    animation.init()

    await new Promise(resolve => {
      _addSnapshot('init')
      setTimeout(() => _addSnapshot('after10'), 10)
      setTimeout(() => _addSnapshot('after30'), 30)
      setTimeout(() => _addSnapshot('after125'), 125)
      setTimeout(() => {
        _addSnapshot('after300')
        resolve()
      }, 300)
    })

    expect(snapshots).toEqual({
      init: {},
      after10: {},
      after30: {},
      after125: { step1: 1 },
      after300: { step1: 1, end: 1 },
    })
  })

  it('- when used with abort-check - skips actions as soons as abort-check returns true', async () => {
    const animation = new Animation()

    const data = {
      testRuns: {},
      snapshots: {},
      abort: false,
    }
    const _prepareTestCallback = key => () => {
      data.testRuns[key] = 1
    }
    const _addSnapshot = key => {
      data.snapshots[key] = { ...data.testRuns }
    }

    animation.addAction(200, _prepareTestCallback('step1'))
    animation.addAction(400, _prepareTestCallback('step2'))
    animation.addAbortCheck(() => data.abort)
    animation.init()

    await new Promise(resolve => {
      _addSnapshot('init')
      setTimeout(() => _addSnapshot('after50'), 50)
      setTimeout(() => _addSnapshot('after100'), 100)
      setTimeout(() => _addSnapshot('after225'), 225)
      setTimeout(() => {
        data.abort = true
      }, 300)
      setTimeout(() => {
        _addSnapshot('after500')
        resolve()
      }, 500)
    })

    expect(data.snapshots).toEqual({
      init: {},
      after50: {},
      after100: {},
      after225: { step1: 1 },
      after500: { step1: 1 },
    })
  })

  it('- when used with abort-check - still runs all cleanups', async () => {
    const animation = new Animation()

    const data = {
      testRuns: {},
      snapshots: {},
      abort: false,
    }
    const _prepareTestCallback = key => () => {
      data.testRuns[key] = 1
    }
    const _addSnapshot = key => {
      data.snapshots[key] = { ...data.testRuns }
    }

    animation.addCleanup(200, _prepareTestCallback('end1'))
    animation.addCleanup(400, _prepareTestCallback('end2'))
    animation.addAbortCheck(() => data.abort)
    animation.init()

    await new Promise(resolve => {
      _addSnapshot('init')
      setTimeout(() => _addSnapshot('after50'), 50)
      setTimeout(() => _addSnapshot('after100'), 100)
      setTimeout(() => _addSnapshot('after225'), 225)
      setTimeout(() => {
        data.abort = true
      }, 300)
      setTimeout(() => {
        _addSnapshot('after500')
        resolve()
      }, 500)
    })

    expect(data.snapshots).toEqual({
      init: {},
      after50: {},
      after100: {},
      after225: { end1: 1 },
      after500: { end1: 1, end2: 1 },
    })
  })
})
