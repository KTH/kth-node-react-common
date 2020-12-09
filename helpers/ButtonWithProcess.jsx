/* eslint no-use-before-define: ["error", "nofunc"] */

// @ts-check

const React = require('react')
const PropTypes = require('prop-types')

const { ensureObject, prepareAsyncSafeState } = require('../utils')

module.exports = ButtonWithProcess

const propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  onClickAsync: PropTypes.func.isRequired,
  btnStyle: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger']),
  isBlockLevel: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
}

const defaultProps = {
  children: null,
  btnStyle: 'primary',
  isBlockLevel: false,
  disabled: false,
  className: '',
}

const STATE_NORMAL = 'normal'
const STATE_WAITING = 'waiting'
const STATE_DONE = 'done'
const STATE_FAILED = 'failed'

/**
 * `<ButtonWithProcess/>`
 * is useful when the click-event is handled asynchronically.
 *
 * After being clicked a small animation is shown on the button and any other click is ignored
 * until the invoked click-event resolves or rejects.
 *
 * @param {object} props
 * @param {string|JSX.Element|JSX.Element[]} props.children
 * @param {() => Promise} props.onClickAsync
 * @param {string} [props.btnStyle]
 * @param {boolean} [props.isBlockLevel]
 * @param {boolean} [props.disabled]
 * @param {string} [props.className]
 */
function ButtonWithProcess(props) {
  const { children, onClickAsync, btnStyle, isBlockLevel, disabled, className } = props

  const { useAsyncSafeState } = prepareAsyncSafeState()

  const [currState, setCurrState] = useAsyncSafeState(STATE_NORMAL)

  const _onClickWithProcess = () => {
    if (currState !== STATE_NORMAL) {
      return
    }
    const result = onClickAsync()
    if (result instanceof Promise) {
      setCurrState(STATE_WAITING)
      result
        .then(() => {
          setCurrState(STATE_DONE)
          setTimeout(() => setCurrState(STATE_NORMAL), 2000)
        })
        .catch(() => {
          setCurrState(STATE_FAILED)
          setTimeout(() => setCurrState(STATE_NORMAL), 15000)
        })
    }
  }

  const _getClassName = optionsBag => {
    const { forceBtnStyle } = ensureObject(optionsBag)
    const classList = [
      'ButtonWithProcess',
      'btn',
      `btn-${forceBtnStyle || btnStyle}`,
      isBlockLevel ? 'btn-block' : null,
      className,
    ]
    return classList.filter(item => item).join(' ')
  }

  switch (currState) {
    default:
    case STATE_NORMAL:
      return (
        <button type="button" className={_getClassName()} onClick={_onClickWithProcess} disabled={disabled}>
          {children}
        </button>
      )

    case STATE_WAITING:
      return (
        <button type="button" className={_getClassName()} disabled>
          <div className="spinner">
            <div className="bounce1" />
            <div className="bounce2" />
            <div className="bounce3" />
          </div>
        </button>
      )

    case STATE_DONE:
      return (
        <button
          type="button"
          className={_getClassName({ forceBtnStyle: btnStyle === 'success' ? 'secondary' : 'success' })}
          disabled
        >
          DONE
        </button>
      )

    case STATE_FAILED:
      return (
        <button
          type="button"
          className={_getClassName({ forceBtnStyle: btnStyle === 'danger' ? 'secondary' : 'danger' })}
          disabled
        >
          FAILED
        </button>
      )
  }
}

ButtonWithProcess.propTypes = propTypes
ButtonWithProcess.defaultProps = defaultProps
