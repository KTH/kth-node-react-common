/* eslint no-use-before-define: ["error", "nofunc"] */

// @ts-check

const React = require('react')
const PropTypes = require('prop-types')

const { ensureObject } = require('../utils')

module.exports = ClickableDiv

const propTypes = {
  onClick: PropTypes.func,
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  disabled: PropTypes.bool,
}

const defaultProps = {
  onClick: null,
  className: '',
  ariaLabel: '',
  disabled: false,
}

/**
 * &lt;ClickableDiv/&gt;
 * makes the sub-content focusable with the keyboard.
 * A given click-action will be invoked if the user clicks the element
 * or presses spacebar or enter while the element is focused.
 * The element will also be unfocused during a click-event.
 *
 * @param {object} props
 * @param {Function} [props.onClick] action-handler
 * @param {string} [props.className] additional CSS-classes of container
 * @param {string} [props.ariaLabel]
 * @param {boolean} [props.disabled]
 * @param {object} props.children
 *
 * @returns {JSX.Element}
 */
function ClickableDiv(props) {
  const { onClick, className, ariaLabel, disabled, children } = props

  if (typeof onClick !== 'function' || disabled) {
    return <div className={`ClickableDiv disabled-true ${className}`.trim()}>{children}</div>
  }

  return (
    <div
      role="button"
      onClick={_turnIntoClickActionLosingFocus(onClick)}
      tabIndex={0}
      onKeyDown={_turnIntoKeyDownAction(onClick)}
      className={`ClickableDiv disabled-false ${className}`.trim()}
      aria-label={ariaLabel || null}
    >
      {children}
    </div>
  )
}

ClickableDiv.propTypes = propTypes
ClickableDiv.defaultProps = defaultProps

function _turnIntoClickActionLosingFocus(callback) {
  if (typeof callback !== 'function') {
    return null
  }

  return function handleClick(event) {
    const { type, currentTarget } = ensureObject(event)
    if (type === 'click') {
      if (currentTarget instanceof HTMLElement) {
        currentTarget.blur()
      }
      event.preventDefault()
      callback()
    }
  }
}

function _turnIntoKeyDownAction(callback) {
  if (typeof callback !== 'function') {
    return null
  }

  return function handleKeyDown(event) {
    const { type, key } = ensureObject(event)
    if (type === 'keydown' && [' ', 'Spacebar', 'Enter'].includes(key)) {
      event.preventDefault()
      callback()
    }
  }
}
