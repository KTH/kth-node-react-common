// @ts-check

const React = require('react')
const PropTypes = require('prop-types')

const { Badges, ClickableDiv } = require('../Helpers')
const { isObject } = require('../utils')

const { getCurrentInputData, setCurrentInputData } = require('./internals')

const propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  label: PropTypes.string,
  badges: PropTypes.string,
  onInfoClick: PropTypes.func,
  helpText: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  dataBag: PropTypes.object,
  dataPath: PropTypes.string,
  currValue: PropTypes.string,
  setCurrValue: PropTypes.func,
  validate: PropTypes.func,
}

const defaultProps = {
  id: '',
  className: '',
  label: '',
  badges: '',
  onInfoClick: null,
  helpText: '',
  dataBag: null,
  dataPath: '',
  currValue: '',
  setCurrValue: null,
  validate: null,
}

function Label(props) {
  const { id, label, badges, onInfoClick } = props

  if (badges && !label) {
    // eslint-disable-next-line no-console
    console.warn("<Input/> can't show badges without label")
  }
  if (onInfoClick && !label) {
    // eslint-disable-next-line no-console
    console.warn("<Input/> can't show info-icon without label")
  }
  if (label && !id) {
    // eslint-disable-next-line no-console
    console.warn("<Input/> can't show label without ID")
  }

  if (!id || !label) {
    return null
  }

  return (
    <label className="form-control-label" htmlFor={id}>
      {label}
      <Badges content={badges} />
      {typeof onInfoClick === 'function' ? (
        <ClickableDiv className="glyphicon glyphicon-info-sign" onClick={onInfoClick} />
      ) : null}
    </label>
  )
}

Label.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  badges: PropTypes.string,
  onInfoClick: PropTypes.func,
}
Label.defaultProps = {
  id: '',
  label: '',
  badges: '',
  onInfoClick: null,
}

/**
 * `<Input />`
 *
 * @param {object} props
 * @param {string} [props.id]
 * @param {string} [props.className]
 * @param {string} [props.label]
 * @param {string} [props.badges]
 * @param {() => void} [props.onInfoClick]
 * @param {string} [props.helpText]
 * @param {object} [props.dataBag]
 * @param {string} [props.dataPath]
 * @param {string} [props.currValue]
 * @param {(newValue: string) => void} [props.setCurrValue]
 * @param {(currValue: string) => string|null} [props.validate]
 */
function Input(props) {
  const { id, className, label, badges, onInfoClick, helpText } = props
  const { dataBag, dataPath, currValue, setCurrValue, validate } = props

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

  const errorText = typeof validate === 'function' ? validate(value) : null

  return (
    <div className={`Input ${className}`.trim()}>
      <Label id={id} label={label} badges={badges} onInfoClick={onInfoClick} />
      {helpText ? <div className="help-block">{helpText}</div> : null}
      <input type="text" className="form-control" id={id} value={value} onChange={onChange} />
      {errorText ? <div className="validation-error">{errorText}</div> : null}
    </div>
  )
}

Input.propTypes = propTypes
Input.defaultProps = defaultProps

module.exports = Input
