/* eslint no-use-before-define: ["error", "nofunc"] */

// @ts-check

const React = require('react')
const PropTypes = require('prop-types')

module.exports = Loading

const propTypes = {
  className: PropTypes.string,
}

const defaultProps = {
  className: '',
}

/**
 * Shows an icon that signalises a loading-state.
 *
 * @param {object} props
 * @param {string} [props.className]
 * @returns {JSX.Element}
 */
function Loading(props) {
  const { className } = props

  return (
    <div className={`${className} Loading`.trim()}>
      <div className="spin-dual-ring" />
    </div>
  )
}

Loading.propTypes = propTypes
Loading.defaultProps = defaultProps
