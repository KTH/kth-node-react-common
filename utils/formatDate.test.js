/* eslint no-use-before-define: ["error", "nofunc"] */

// @ts-check

const formatDate = require('./formatDate')

describe('Utility formatDate()', () => {
  const testString = '2020-04-03 08:06:07 GMT+5'
  const testDate = new Date(testString)

  it('is a function', () => {
    expect(formatDate).toBeFunction()
  })

  it('- when given invalid input - still returns strings', () => {
    const invalidInputList = [undefined, null, 79, { name: 'test' }, ['Test1', 'Test2']]

    // @ts-ignore
    const results = invalidInputList.map(item => formatDate(item))

    expect(results.every(output => typeof output === 'string')).toBe(true)
    expect(results).toEqual(['undefined', 'null', '79', '[object Object]', 'Test1,Test2'])
  })

  it('- when used with a Date object - returns formatted string', () => {
    const result = formatDate(testDate)
    expect(result).toMatchInlineSnapshot(`"2020-04-03 05:06:07 CEST"`)
  })

  it('- when used with a date string - returns formatted string', () => {
    const result = formatDate(testString)
    expect(result).toMatchInlineSnapshot(`"2020-04-03 05:06:07 CEST"`)
  })

  it('- when given same moment but with different timezones - produces exakt same output', () => {
    const testStrings = [
      '2020-04-03 08:06:07 GMT+5',
      '2020-04-02 22:06:07 GMT-5',
      '2020-04-03 03:06:07 GMT',
      '2020-04-03 05:06:07 GMT+2',
    ]

    const firstResult = formatDate(testStrings[0])
    expect(firstResult).toMatchInlineSnapshot(`"2020-04-03 05:06:07 CEST"`)

    expect(testStrings.every(date => formatDate(date) === firstResult)).toBe(true)
  })

  it('- when option "format" is used - can produce English date output', () => {
    const result = formatDate(testDate, { format: 'en' })
    expect(result).toMatchInlineSnapshot(`"Fri Apr 03 2020 05:06:07 CEST"`)
  })

  it('- when option "format" is used - can produce Swedish date output', () => {
    const result = formatDate(testDate, { format: 'sv' })
    expect(result).toMatchInlineSnapshot(`"fre 03 apr. 2020 05:06:07 CEST"`)
  })

  it('handles daylight saving correctly', () => {
    const winterTime = formatDate('2020-03-29 00:00:00 GMT')
    expect(winterTime).toEndWith(' CET')

    const summerTime = formatDate('2020-03-29 05:00:00 GMT')
    expect(summerTime).toEndWith(' CEST')
  })
})
