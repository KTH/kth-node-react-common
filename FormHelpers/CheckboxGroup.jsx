/* eslint no-use-before-define: ["error", "nofunc"] */

// @ts-check

const React = require('react')
const PropTypes = require('prop-types')

const { Badges } = require('../helpers')
const { isNoObject, isObject } = require('../utils')

const Checkbox = require('./Checkbox')
const { getCurrentInputData, setCurrentInputData } = require('./internals')

module.exports = CheckboxGroup

const propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  badges: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  keyLabelHash: PropTypes.object.isRequired,
  className: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  dataBag: PropTypes.object,
  dataPath: PropTypes.string,
  currValue: PropTypes.arrayOf(PropTypes.string),
  setCurrValue: PropTypes.func,
}

const defaultProps = {
  label: '',
  badges: '',
  className: '',
  dataBag: null,
  dataPath: '',
  currValue: [],
  setCurrValue: null,
}

/**
 * `<CheckboxGroup />`
 *
 * @param {object} props
 * @param {string} props.id
 * @param {string} [props.label]
 * @param {string} [props.badges]
 * @param {object} props.keyLabelHash
 * @param {string} [props.className]
 * @param {object} [props.dataBag]
 * @param {string} [props.dataPath]
 * @param {string[]} [props.currValue]
 * @param {(newValue: string[]) => void} [props.setCurrValue]
 */
function CheckboxGroup(props) {
  const { id, label, badges, keyLabelHash, className, dataBag, dataPath, currValue, setCurrValue } = props

  if (
    isNoObject(keyLabelHash) ||
    Object.keys(keyLabelHash).length === 0 ||
    Object.values(keyLabelHash).some(_label => typeof _label !== 'string')
  ) {
    // eslint-disable-next-line no-console
    console.error('<CheckboxGroup/> failed - missing or invalid property "keyLabelHash"')
    return null
  }

  if (badges && !label) {
    // eslint-disable-next-line no-console
    console.warn("<CheckboxGroup/> can't show badges without label")
  }

  const canAccessData = isObject(dataBag) && typeof dataPath === 'string' && dataPath !== ''
  const gotDirectData = typeof setCurrValue === 'function'

  let values
  let setValue
  if (canAccessData) {
    values = getCurrentInputData({ dataBag, dataPath })
    setValue = newValue => setCurrentInputData({ dataBag, dataPath, newValue })
  } else if (gotDirectData) {
    values = currValue
    values = setCurrValue
  }

  if (Array.isArray(values) === false || values.some(_key => typeof _key !== 'string')) {
    // eslint-disable-next-line no-console
    console.error('<CheckboxGroup/> failed - missing or invalid values')
    return null
  }

  const labelElement = label ? (
    <legend>
      {label}
      <Badges content={badges} />
    </legend>
  ) : null

  return (
    <fieldset className={`CheckboxGroup ${className}`.trim()}>
      {labelElement}
      {Object.keys(keyLabelHash).map((key, index) => {
        const _setCurrValue = checked => {
          if (checked && !values.includes(key)) {
            setValue([...values, key])
          }
          if (!checked && values.includes(key)) {
            setValue(values.filter(_key => _key !== key))
          }
        }
        return (
          <Checkbox
            key={key}
            id={`${id}-${index}`}
            label={keyLabelHash[key]}
            currValue={values.includes(key)}
            setCurrValue={_setCurrValue}
          />
        )
      })}
    </fieldset>
  )
}

CheckboxGroup.propTypes = propTypes
CheckboxGroup.defaultProps = defaultProps
