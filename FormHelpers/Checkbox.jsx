/* eslint no-use-before-define: ["error", "nofunc"] */

// @ts-check

const React = require('react')
const PropTypes = require('prop-types')

const { Badges } = require('../helpers')
const { isObject } = require('../utils')

const { getCurrentInputData, setCurrentInputData } = require('./internals')

module.exports = Checkbox

const propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  className: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  dataBag: PropTypes.object,
  dataPath: PropTypes.string,
  currValue: PropTypes.bool,
  setCurrValue: PropTypes.func,
  badges: PropTypes.string,
}

const defaultProps = {
  dataBag: null,
  dataPath: '',
  currValue: false,
  setCurrValue: null,
  className: '',
  badges: '',
}

/**
 * `<Checkbox />`
 *
 * @param {object} props
 * @param {string} props.id
 * @param {string} props.label
 * @param {string} [props.className]
 * @param {object} [props.dataBag]
 * @param {string} [props.dataPath]
 * @param {boolean} [props.currValue]
 * @param {(newValue: boolean) => void} [props.setCurrValue]
 * @param {string} [props.badges]
 */
function Checkbox(props) {
  const { id, label, className, dataBag, dataPath, currValue, setCurrValue, badges } = props

  const canAccessData = isObject(dataBag) && typeof dataPath === 'string' && dataPath !== ''
  const gotDirectData = typeof setCurrValue === 'function'

  let checked = false
  let onChange = null

  if (canAccessData) {
    checked = String(getCurrentInputData({ dataBag, dataPath })) === 'true'
    onChange = event => setCurrentInputData({ dataBag, dataPath, newValue: event.target.checked })
  } else if (gotDirectData) {
    checked = String(currValue) === 'true'
    onChange = event => setCurrValue(event.target.checked)
  }

  return (
    <div className={`Checkbox form-check ${className}`.trim()}>
      <input id={id} type="checkbox" className="form-check-input" checked={checked} onChange={onChange} />
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label htmlFor={id} className="form-check-label">
        {label}
        <Badges content={badges} />
      </label>
    </div>
  )
}

Checkbox.propTypes = propTypes
Checkbox.defaultProps = defaultProps
