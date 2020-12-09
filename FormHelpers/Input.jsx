/* eslint no-use-before-define: ["error", "nofunc"] */

// @ts-check

const React = require('react')
const PropTypes = require('prop-types')

const { Badges } = require('../helpers')
const { isObject } = require('../utils')

const { getCurrentInputData, setCurrentInputData } = require('./internals')

module.exports = Input

const propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  badges: PropTypes.string,
  className: PropTypes.string,
  infoCallback: PropTypes.func,
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
  className: '',
  infoCallback: null,
  dataBag: null,
  dataPath: '',
  currValue: '',
  setCurrValue: null,
}

/**
 * `<Input />`
 *
 * @param {object} props
 * @param {string} [props.id]
 * @param {string} [props.label]
 * @param {string} [props.badges]
 * @param {string} [props.className]
 * @param {object} [props.dataBag]
 * @param {string} [props.dataPath]
 * @param {string} [props.currValue]
 * @param {(newValue: string) => void} [props.setCurrValue]
 */
function Input(props) {
  const { id, label, className, dataBag, dataPath, currValue, setCurrValue, badges } = props

  if (badges && !label) {
    // eslint-disable-next-line no-console
    console.warn("<Input/> can't show badges without label")
  }
  if (label && !id) {
    // eslint-disable-next-line no-console
    console.error("<Input/> failed - can't show label without ID")
    return null
  }

  const canAccessData = isObject(dataBag) && typeof dataPath === 'string' && dataPath !== ''
  const gotDirectData = typeof setCurrValue === 'function'

  let value = null
  let onChange = null

  if (canAccessData) {
    value = getCurrentInputData({ dataBag, dataPath })
    onChange = event => setCurrentInputData({ dataBag, dataPath, newValue: event.target.value })
  } else if (gotDirectData) {
    value = currValue
    onChange = event => setCurrValue(event.target.value)
  }

  const labelElement =
    id && label ? (
      <label className="form-control-label" htmlFor={id}>
        {label}
        <Badges content={badges} />
      </label>
    ) : null

  const infoIcon = typeof infoCallback === 'function' ? <InfoIcon onClick={infoCallback} /> : null

  return (
    <div className={`Input ${className}`.trim()}>
      {labelElement}
      {infoIcon}
      <input type="text" className="form-control" id={id} value={value} onChange={onChange} />
    </div>
  )
}

Input.propTypes = propTypes
Input.defaultProps = defaultProps
