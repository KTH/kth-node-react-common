// @ts-check

const React = require('react')
// eslint-disable-next-line no-unused-vars
const PropTypes = require('prop-types')

const { observer } = require('mobx-react')
const { getStoreState, useStore } = require('../MobxUtils')

const LoadDataAsync = require('./LoadDataAsync')

const propTypes = {}

const defaultProps = {}

/**
 * `<SystemMessage />`
 * uses the default store to show any global system message
 * which was activated for the application.
 */
function SystemMessage() {
  if (getStoreState('default') !== 'active') {
    return null
  }

  const { getSystemMessage, checkIfSystemMessageIsReady, querySystemMessageAsync } = useStore('default')

  let output = null
  if (checkIfSystemMessageIsReady()) {
    const message = getSystemMessage()
    if (message) {
      output = (
        <div className="alert alert-info" role="alert">
          {message}
        </div>
      )
    }
  }

  return (
    <LoadDataAsync
      checkFunc={checkIfSystemMessageIsReady}
      queryFuncAsync={querySystemMessageAsync}
      className="SystemMessage"
      mode="expand"
      showErrorMode="console"
      errorMessage="Loading system message failed"
    >
      {output}
    </LoadDataAsync>
  )
}

const ComponentExport = observer(SystemMessage)

SystemMessage.propTypes = propTypes
SystemMessage.defaultProps = defaultProps
ComponentExport.propTypes = propTypes
ComponentExport.defaultProps = defaultProps

module.exports = ComponentExport
