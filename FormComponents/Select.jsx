// @ts-check

const React = require('react')
const PropTypes = require('prop-types')

const { Badges } = require('../Helpers')
const { isObject } = require('../utils')

const { getCurrentInputData, setCurrentInputData } = require('./internals')

const propTypes = {
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  id: PropTypes.string,
  label: PropTypes.string,
  badges: PropTypes.string,
  emptyOption: PropTypes.string,
  hiddenKeys: PropTypes.arrayOf(PropTypes.string),
  className: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  dataBag: PropTypes.object,
  dataPath: PropTypes.string,
  currValue: PropTypes.string,
  setCurrValue: PropTypes.func,
}

const defaultProps = {
  id: '',
  label: '',
  badges: '',
  emptyOption: '',
  hiddenKeys: [],
  className: '',
  dataBag: null,
  dataPath: '',
  currValue: '',
  setCurrValue: null,
}

/**
 * `<Select />`
 *
 * @param {object} props
 * @param {string[]} props.options
 *    list of possible options given with
 *    - identical key and caption, e.g. "SE" / ":SE"; or
 *    - different key and caption, e.g. "SE:Sweden", "NO:Norway", "DE:Germany"
 * @param {string} [props.id]
 * @param {string} [props.label]
 * @param {string} [props.badges]
 * @param {string} [props.emptyOption]
 *      e.g. "Välj..."
 * @param {string[]} [props.hiddenKeys]
 *    keys of options to hide if not already selected
 *      e.g. [ "DE" ]
 * @param {string} [props.className]
 * @param {object} [props.dataBag]
 * @param {string} [props.dataPath]
 * @param {string} [props.currValue]
 * @param {(newValue: string) => void} [props.setCurrValue]
 */
function Select(props) {
  const {
    id,
    label,
    badges,
    emptyOption,
    options,
    hiddenKeys,
    className,
    dataBag,
    dataPath,
    currValue,
    setCurrValue,
  } = props

  if (Array.isArray(options) === false || options.length === 0 || options.some(item => typeof item !== 'string')) {
    // eslint-disable-next-line no-console
    console.error('<Select/> failed - missing or invalid property "options"')
    return null
  }

  if (badges && !label) {
    // eslint-disable-next-line no-console
    console.warn("<Select/> can't show badges without label")
  }
  if (label && !id) {
    // eslint-disable-next-line no-console
    console.error("<Select/> failed - can't show label without ID")
    return null
  }

  const canAccessData = isObject(dataBag) && typeof dataPath === 'string' && dataPath !== ''
  const gotDirectData = typeof setCurrValue === 'function'

  let value
  let setValue
  if (canAccessData) {
    value = getCurrentInputData({ dataBag, dataPath })
    setValue = event => setCurrentInputData({ dataBag, dataPath, newValue: event.target.value })
  } else if (gotDirectData) {
    value = currValue
    setValue = event => setCurrValue(event.target.value)
  }

  if (value != null && typeof value !== 'string') {
    // eslint-disable-next-line no-console
    console.error('<Select/> failed - missing or invalid value', { value })
    return null
  }

  const _turnOptionIntoKeyCaption = optionItem => {
    const separatorPos = optionItem.indexOf(':')
    const result = { key: optionItem, caption: optionItem }
    if (separatorPos > 0) {
      result.key = optionItem.slice(0, separatorPos)
      result.caption = optionItem.slice(separatorPos + 1)
    } else if (separatorPos === 0) {
      result.key = optionItem.slice(1)
      result.caption = optionItem.slice(1)
    }
    return result
  }

  const _isVisible = input => {
    return input.key === value || Array.isArray(hiddenKeys) === false || hiddenKeys.includes(input.key) === false
  }

  const _prepareOptionElement = input => {
    return (
      <option key={input.key} value={input.key}>
        {input.caption}
      </option>
    )
  }

  const labelElement =
    id && label ? (
      <label className="form-control-label" htmlFor={id}>
        {label}
        <Badges content={badges} />
      </label>
    ) : null

  return (
    <div className={`Select ${className}`.trim()}>
      {labelElement}
      <div className="form-select">
        <select id={id} className="form-control" value={value} onChange={setValue}>
          {typeof emptyOption === 'string' && emptyOption !== '' ? <option value="">{emptyOption}</option> : null}
          {options.map(_turnOptionIntoKeyCaption).filter(_isVisible).map(_prepareOptionElement)}
        </select>
      </div>
    </div>
  )
}

Select.propTypes = propTypes
Select.defaultProps = defaultProps

module.exports = Select
