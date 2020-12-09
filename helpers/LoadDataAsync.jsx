/* eslint no-use-before-define: ["error", "nofunc"] */

// @ts-check

const React = require('react')
const PropTypes = require('prop-types')

const { prepareAsyncSafeState } = require('../utils')

const Loading = require('./Loading')
const CollapsableDiv = require('./CollapsableDiv')

module.exports = LoadDataAsync

const propTypes = {
  className: PropTypes.string,
  headline: PropTypes.string,
  headlineTag: PropTypes.string,
  checkFunc: PropTypes.func.isRequired,
  queryFuncAsync: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(['spinner', 'expand']),
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  showErrorMode: PropTypes.oneOf(['full', 'console', 'hide']),
  errorMessage: PropTypes.string,
}

const defaultProps = {
  className: '',
  headline: '',
  headlineTag: 'h1',
  mode: 'spinner',
  children: null,
  showErrorMode: 'full',
  errorMessage: 'Ett fel uppstod - det gick inte att hämta data till sidan från servern.',
}

/**
 * `<LoadDataAsync />`
 *
 * @param {object} props
 * @param {string} [props.className]
 * @param {string} [props.headline]
 * @param {string} [props.headlineTag]
 * @param {() => boolean} props.checkFunc
 * @param {() => Promise} props.queryFuncAsync
 * @param {string} [props.mode]
 * @param {JSX.Element|JSX.Element[]} [props.children]
 * @param {string} [props.showErrorMode]
 * @param {string} [props.errorMessage]
 *
 * @returns {JSX.Element}
 */
function LoadDataAsync(props) {
  const { checkFunc, queryFuncAsync, children } = props
  const { useAsyncSafeState } = prepareAsyncSafeState()

  if (typeof checkFunc !== 'function' || typeof queryFuncAsync !== 'function') {
    return <>{children}</>
  }

  const [currState, setCurrState] = useAsyncSafeState({
    isLoading: false,
    lastError: null,
  })

  const { isLoading, lastError } = currState

  if (lastError != null) {
    return _showError({ props, currState, setCurrState })
  }

  if (isLoading || checkFunc()) {
    return _finalizeOutput({ props, currState })
  }

  queryFuncAsync()
    .then(() => setCurrState({ ...currState, isLoading: false }))
    .catch(error => setCurrState({ ...currState, isLoading: false, lastError: error }))

  setCurrState({ ...currState, isLoading: true })
  return _finalizeOutput({ props, currState: { ...currState, isLoading: true } })
}

LoadDataAsync.propTypes = propTypes
LoadDataAsync.defaultProps = defaultProps

/**
 * @param {object} inputBag
 * @param {object} inputBag.props
 * @param {object} inputBag.currState
 * @param {JSX.Element} [inputBag.element=null]
 *
 * @returns {JSX.Element}
 */
function _finalizeOutput({ props, currState, element = null }) {
  const { className, children, headline, headlineTag, mode } = props
  const { isLoading } = currState

  const _className = `${className} LoadDataAsync mode-${mode}`.trim()

  let headlineElement = null
  if (typeof headline === 'string' && headline !== '') {
    headlineElement = React.createElement(
      typeof headlineTag === 'string' && headlineTag !== '' ? headlineTag : 'h1',
      null,
      headline
    )
  }

  switch (mode) {
    default:
    case 'spinner': {
      let _content
      if (element == null) {
        _content = isLoading ? <Loading /> : children
      } else {
        _content = element
      }
      return (
        <div className={_className}>
          {headlineElement}
          {_content}
        </div>
      )
    }

    case 'expand': {
      const _content = element == null ? children : element
      return (
        <CollapsableDiv open={isLoading === false} className={_className}>
          {_content}
        </CollapsableDiv>
      )
    }
  }
}

/**
 * @param {object} inputBag
 * @param {object} inputBag.props
 * @param {object} inputBag.currState
 * @param {(object) => *} inputBag.setCurrState
 *
 * @returns {JSX.Element}
 */
function _showError({ props, currState, setCurrState }) {
  const { showErrorMode, errorMessage } = props
  const { lastError } = currState

  if (showErrorMode !== 'hide') {
    // eslint-disable-next-line no-console
    console.error(`<LoadDataAsync/> - ${errorMessage} -`, lastError)
  }

  if (showErrorMode === 'full') {
    return _finalizeOutput({
      props,
      currState,
      element: (
        <div className="LoadDataAsync-Error mode-show">
          <div className="alert alert-danger" role="alert">
            <div>{errorMessage}</div>
            <button
              type="button"
              className="btn btn-warning"
              onClick={() => setCurrState({ ...currState, isLoading: false, lastError: null })}
            >
              Pröva på nytt
            </button>
          </div>
        </div>
      ),
    })
  }

  return _finalizeOutput({ props, currState, element: <div className="LoadDataAsync-Error mode-hide" /> })
}
