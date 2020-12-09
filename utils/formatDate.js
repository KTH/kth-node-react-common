// @ts-check

const ENGLISH_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const ENGLISH_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const SWEDISH_WEEKDAYS = ['sön', 'mån', 'tis', 'ons', 'tors', 'fre', 'lör']
const SWEDISH_MONTHS = ['jan.', 'feb.', 'mar.', 'apr.', 'maj', 'juni', 'juli', 'aug.', 'sep.', 'okt.', 'nov.', 'dec.']

/**
 * @param {number} hourOffset e.g. 2 or -4
 * @returns {string} e.g. "CEST" or "GMT-4"
 */
function _getTimezoneText(hourOffset) {
  if (typeof hourOffset === 'number') {
    const _offset = Math.round(hourOffset)
    // eslint-disable-next-line no-nested-ternary
    return _offset < 0 ? `GMT${_offset}` : _offset > 2 ? `GMT+${_offset}` : ['GMT', 'CET', 'CEST'][_offset]
  }

  return ''
}

/**
 * @param {string} format
 * @returns {object[]} list of items with shape { queryMethodName, transformFunc }
 */
function _getOwnLocaleWithSameResultOnServerAndClient(format) {
  const _makeTwoDigits = number => (number < 10 ? `0${number}` : `${number}`)

  switch (format) {
    default:
    case 'short':
      return [
        { queryMethodName: 'getUTCFullYear', transformFunc: n => `${n}-` },
        { queryMethodName: 'getUTCMonth', transformFunc: n => _makeTwoDigits(n + 1) + '-' },
        { queryMethodName: 'getUTCDate', transformFunc: n => _makeTwoDigits(n) + ' ' },
        { queryMethodName: 'getUTCHours', transformFunc: n => _makeTwoDigits(n) + ':' },
        { queryMethodName: 'getUTCMinutes', transformFunc: n => _makeTwoDigits(n) + ':' },
        { queryMethodName: 'getUTCSeconds', transformFunc: n => _makeTwoDigits(n) + ' ' },
        { queryMethodName: 'getFakedTimezoneOffset', transformFunc: n => _getTimezoneText(-n / 60) },
      ]

    case 'en':
      return [
        { queryMethodName: 'getUTCDay', transformFunc: n => `${ENGLISH_WEEKDAYS[n]} ` },
        { queryMethodName: 'getUTCMonth', transformFunc: n => `${ENGLISH_MONTHS[n]} ` },
        { queryMethodName: 'getUTCDate', transformFunc: n => _makeTwoDigits(n) + ' ' },
        { queryMethodName: 'getUTCFullYear', transformFunc: n => `${n} ` },
        { queryMethodName: 'getUTCHours', transformFunc: n => _makeTwoDigits(n) + ':' },
        { queryMethodName: 'getUTCMinutes', transformFunc: n => _makeTwoDigits(n) + ':' },
        { queryMethodName: 'getUTCSeconds', transformFunc: n => _makeTwoDigits(n) + ' ' },
        { queryMethodName: 'getFakedTimezoneOffset', transformFunc: n => _getTimezoneText(-n / 60) },
      ]

    case 'sv':
      return [
        { queryMethodName: 'getUTCDay', transformFunc: n => `${SWEDISH_WEEKDAYS[n]} ` },
        { queryMethodName: 'getUTCDate', transformFunc: n => _makeTwoDigits(n) + ' ' },
        { queryMethodName: 'getUTCMonth', transformFunc: n => `${SWEDISH_MONTHS[n]} ` },
        { queryMethodName: 'getUTCFullYear', transformFunc: n => `${n} ` },
        { queryMethodName: 'getUTCHours', transformFunc: n => _makeTwoDigits(n) + ':' },
        { queryMethodName: 'getUTCMinutes', transformFunc: n => _makeTwoDigits(n) + ':' },
        { queryMethodName: 'getUTCSeconds', transformFunc: n => _makeTwoDigits(n) + ' ' },
        { queryMethodName: 'getFakedTimezoneOffset', transformFunc: n => _getTimezoneText(-n / 60) },
      ]
  }
}

/**
 * `formatDate()`
 * takes a date-object / date-string and turns it into a well-formatted string.
 *
 * There are native functions in Javascript to achieve the same result,
 * but if you have problems with missing locales, wrong timezone settings or
 * different results on server and on client, you might want to use this function instead.
 *
 * @param {Date|string} date
 *      e.g. new Date() or
 *           "2011-09-10T14:48:00" or
 *           "Sat, Sep 10, 2011, 18:48:00 GMT+6"
 * @param {object} [optionsBag]
 * @param {string} [optionsBag.format="short"]
 *      e.g. "sv"
 * @param {number} [optionsBag.targetTimezoneOffset=60]
 *      Difference in minutes from wanted timezone compared to GMT,
 *      e.g. -300 for "America/New_York"
 * @param {boolean} [optionsBag.useDaylightSaving=true]
 *
 * @returns {string}
 *      e.g. "lör 10 sep. 14:48:00 CEST"
 */
function formatDate(date, optionsBag) {
  const gotOptions = optionsBag != null && typeof optionsBag === 'object'
  const format = gotOptions && optionsBag.format != null ? optionsBag.format : 'short'
  const targetTimezoneOffset =
    gotOptions && optionsBag.targetTimezoneOffset != null ? optionsBag.targetTimezoneOffset : 60
  const useDaylightSaving = gotOptions && optionsBag.useDaylightSaving != null ? optionsBag.useDaylightSaving : true

  if (date instanceof Date || (typeof date === 'string' && date !== '')) {
    const _date = date instanceof Date ? date : new Date(date)

    const inputHasDaylightSaving = /CEST|GMT\+2/.test(
      _date.toLocaleString('en-GB', { hour: '2-digit', timeZoneName: 'short', timeZone: 'Europe/Stockholm' })
    )
    const _targetTimezoneOffset =
      useDaylightSaving && inputHasDaylightSaving ? targetTimezoneOffset + 60 : targetTimezoneOffset

    const y = _date.getUTCFullYear()
    const m = _date.getUTCMonth()
    const d = _date.getUTCDate()
    const h = _date.getUTCHours()
    const min = _date.getUTCMinutes()
    const s = _date.getUTCSeconds()

    const dateWithFakedTimezoneOffset = new Date(Date.UTC(y, m, d, h, min + _targetTimezoneOffset, s))
    // @ts-ignore
    dateWithFakedTimezoneOffset.getFakedTimezoneOffset = () => -_targetTimezoneOffset

    const ownLocale = _getOwnLocaleWithSameResultOnServerAndClient(format)
    const result = ownLocale
      .map(item => {
        const { queryMethodName, transformFunc } = item
        return transformFunc(dateWithFakedTimezoneOffset[queryMethodName]())
      })
      .join('')

    return result
  }

  return String(date)
}

module.exports = formatDate
