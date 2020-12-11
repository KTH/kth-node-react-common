// @ts-check

const React = require('react')

const { render } = require('@testing-library/react')

const { ConsoleUtils } = require('../test-utils')

const LoadDataAsync = require('./LoadDataAsync')

describe('Helper component <LoadDataAsync/>', () => {
  let snapshotNum = 1
  const _snapshotHint = htmlSuffix =>
    htmlSuffix ? `[-> LoadDataAsync-${htmlSuffix}.html]` : `[-> snapshot ${snapshotNum++}]`

  const testChildren = <div className="test-container">Test</div>

  beforeAll(ConsoleUtils.mockAll)
  afterAll(ConsoleUtils.unmockAll)

  it(`- when used w/o props - returns null`, () => {
    ConsoleUtils.resetMockedCalls()

    // @ts-ignore
    const reactComponent = <LoadDataAsync />
    const { container } = render(reactComponent)
    expect(container.firstChild).toBeNull()

    ConsoleUtils.checkMockedPropTypesWarnings({ reactComponent, expectedWarnings: ['checkFunc', 'queryFuncAsync'] })
    ConsoleUtils.expectEmptyMockedCalls({ skipPropTypes: true })
  })

  it(`- when used with children only - returns children`, () => {
    ConsoleUtils.resetMockedCalls()

    const { container: childrenContainer } = render(testChildren)

    // @ts-ignore
    const reactComponent = <LoadDataAsync>{testChildren}</LoadDataAsync>
    const { container } = render(reactComponent)
    expect(container).toEqual(childrenContainer)

    ConsoleUtils.checkMockedPropTypesWarnings({ reactComponent, expectedWarnings: ['checkFunc', 'queryFuncAsync'] })
    ConsoleUtils.expectEmptyMockedCalls({ skipPropTypes: true })
  })

  it(`- when used with minimal properties - uses given callbacks as expected`, () => {
    const checkFuncTestResults = [true, false]
    checkFuncTestResults.forEach(result => {
      ConsoleUtils.resetMockedCalls()

      const checkFunc = jest.fn().mockReturnValue(result)
      const queryFuncAsync = jest.fn().mockResolvedValue(null)

      const reactComponent = <LoadDataAsync checkFunc={checkFunc} queryFuncAsync={queryFuncAsync} />
      render(reactComponent)

      expect(checkFunc).toHaveBeenCalledTimes(1)
      expect(queryFuncAsync).toHaveBeenCalledTimes(result === true ? 0 : 1)

      ConsoleUtils.checkMockedPropTypesWarnings({ reactComponent, expectedWarnings: false })
      ConsoleUtils.expectEmptyMockedCalls({ skipPropTypes: true })
    })
  })

  it(`${_snapshotHint()} - in mode "spinner" when checkFunc() returns false - initially shows loading spinner`, () => {
    ConsoleUtils.resetMockedCalls()

    const checkFunc = jest.fn().mockReturnValue(false)
    const queryFuncAsync = jest.fn().mockResolvedValue(null)

    const reactComponent = (
      <LoadDataAsync checkFunc={checkFunc} queryFuncAsync={queryFuncAsync} mode="spinner">
        {testChildren}
      </LoadDataAsync>
    )
    const { container } = render(reactComponent)
    const { firstChild: mainDiv } = container
    const { firstChild: contentDiv } = mainDiv

    // @ts-ignore
    expect(mainDiv.getAttribute('class')).toMatch(/LoadDataAsync mode-spinner/)
    // @ts-ignore
    expect(contentDiv.getAttribute('class')).toBe('Loading')

    expect(mainDiv).toMatchSnapshot()

    ConsoleUtils.checkMockedPropTypesWarnings({ reactComponent, expectedWarnings: false })
    ConsoleUtils.expectEmptyMockedCalls({ skipPropTypes: true })
  })

  it(`${_snapshotHint()} - in mode "spinner" when checkFunc() returns true - initially shows children`, () => {
    ConsoleUtils.resetMockedCalls()

    const checkFunc = jest.fn().mockReturnValue(true)
    const queryFuncAsync = jest.fn().mockResolvedValue(null)

    // const { container: childrenContainer } = render(testChildren)

    const reactComponent = (
      <LoadDataAsync checkFunc={checkFunc} queryFuncAsync={queryFuncAsync} mode="spinner">
        {testChildren}
      </LoadDataAsync>
    )
    const { container } = render(reactComponent)
    const { firstChild: mainDiv } = container
    // const { firstChild: contentDiv } = mainDiv

    // @ts-ignore
    expect(mainDiv.getAttribute('class')).toMatch(/LoadDataAsync mode-spinner/)
    // expect(contentDiv).toEqual(childrenContainer.firstChild)

    expect(mainDiv).toMatchSnapshot()

    ConsoleUtils.checkMockedPropTypesWarnings({ reactComponent, expectedWarnings: false })
    ConsoleUtils.expectEmptyMockedCalls({ skipPropTypes: true })
  })

  it(`${_snapshotHint()} - in mode "expand" when checkFunc() returns false - initially hides content`, () => {
    ConsoleUtils.resetMockedCalls()

    const { container: childrenContainer } = render(testChildren)

    const checkFunc = jest.fn().mockReturnValue(false)
    const queryFuncAsync = jest.fn().mockResolvedValue(null)

    const reactComponent = (
      <LoadDataAsync checkFunc={checkFunc} queryFuncAsync={queryFuncAsync} mode="expand">
        {testChildren}
      </LoadDataAsync>
    )
    const { container } = render(reactComponent)
    const { firstChild: mainDiv } = container
    const { firstChild: contentDiv } = mainDiv

    // @ts-ignore
    expect(mainDiv.getAttribute('class')).toMatch(/LoadDataAsync mode-expand CollapsableDiv open-false/)
    // @ts-ignore
    expect(contentDiv.getAttribute('style')).toMatch(/display: none;/)
    // @ts-ignore
    expect(contentDiv.innerHTML).toBe(childrenContainer.innerHTML)

    expect(mainDiv).toMatchSnapshot()

    ConsoleUtils.checkMockedPropTypesWarnings({ reactComponent, expectedWarnings: false })
    ConsoleUtils.expectEmptyMockedCalls({ skipPropTypes: true })
  })

  it(`${_snapshotHint()} - in mode "expand" when checkFunc() returns true - initially shows children`, () => {
    ConsoleUtils.resetMockedCalls()

    const { container: childrenContainer } = render(testChildren)

    const checkFunc = jest.fn().mockReturnValue(true)
    const queryFuncAsync = jest.fn().mockResolvedValue(null)

    const reactComponent = (
      <LoadDataAsync checkFunc={checkFunc} queryFuncAsync={queryFuncAsync} mode="expand">
        {testChildren}
      </LoadDataAsync>
    )
    const { container } = render(reactComponent)
    const { firstChild: mainDiv } = container
    const { firstChild: contentDiv } = mainDiv

    // @ts-ignore
    expect(mainDiv.getAttribute('class')).toMatch(/LoadDataAsync mode-expand CollapsableDiv open-true/)
    // @ts-ignore
    expect(contentDiv.getAttribute('style') || '').not.toMatch(/display: none;/)
    // @ts-ignore
    expect(contentDiv.innerHTML).toBe(childrenContainer.innerHTML)

    expect(mainDiv).toMatchSnapshot()

    ConsoleUtils.checkMockedPropTypesWarnings({ reactComponent, expectedWarnings: false })
    ConsoleUtils.expectEmptyMockedCalls({ skipPropTypes: true })
  })
})

// function _skipItIfHtmlSnapshotsAreDisabled(...args) {
//   if (String(process.env.SKIP_HTML_SNAPSHOT_TESTS) === 'true') {
//     // @ts-ignore
//     it.skip(...args)
//   } else {
//     // @ts-ignore
//     it(...args)
//   }
// }
