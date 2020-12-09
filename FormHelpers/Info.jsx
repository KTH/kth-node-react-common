// @ts-check

const React = require('react')
const PropTypes = require('prop-types')

const { Badges, Markdown } = require('../Helpers')
const { ensureObject, isObject } = require('../utils')

const { getCurrentInputData } = require('./internals')

const propTypes = {
  label: PropTypes.string,
  badges: PropTypes.string,
  className: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  dataBag: PropTypes.object,
  dataPath: PropTypes.string,
  currValue: PropTypes.string,
  mode: PropTypes.oneOf(['text', 'markdown', 'image']),
  transform: PropTypes.func,
}

const defaultProps = {
  label: '',
  badges: '',
  className: '',
  dataBag: null,
  dataPath: '',
  currValue: '',
  mode: 'text',
  transform: null,
}

/**
 * `<Info />`
 *
 * @param {object} props
 * @param {string} [props.label]
 * @param {string} [props.badges]
 * @param {string} [props.className]
 * @param {object} [props.dataBag]
 * @param {string} [props.dataPath]
 * @param {string} [props.currValue]
 * @param {string} [props.mode="text"]
 * @param {(string) => string} [props.transform]
 */
function Info(props) {
  const { label, className, dataBag, dataPath, currValue, badges, mode, transform } = props

  if (badges && !label) {
    // eslint-disable-next-line no-console
    console.warn("<Select/> can't show badges without label")
  }

  const canAccessData = isObject(dataBag) && typeof dataPath === 'string' && dataPath !== ''

  let value = canAccessData ? getCurrentInputData({ dataBag, dataPath }) : currValue
  if (typeof transform === 'function') {
    value = transform(value)
  }

  let _mode = mode

  let infoElement
  switch (mode) {
    default:
    case 'text':
      _mode = 'text'
      infoElement = <div className="form-control">{value}</div>
      break
    case 'markdown':
      infoElement = <Markdown className="form-control" markup={value} />
      break
    case 'image': {
      const { name, contentType, base64content } = ensureObject(value)
      infoElement = base64content ? (
        <div className="form-control">
          <img src={`data:${contentType};base64, ${base64content}`} alt={name} />
        </div>
      ) : null
    }
  }

  const labelElement = label ? (
    <div className="form-control-label">
      {label}
      <Badges content={badges} />
    </div>
  ) : null

  return (
    <div className={`Info mode-${_mode} ${className}`.trim()}>
      {labelElement}
      {infoElement}
    </div>
  )
}

Info.propTypes = propTypes
Info.defaultProps = defaultProps

module.exports = Info
