// @ts-check

const React = require('react')
const PropTypes = require('prop-types')

const { useState } = React

const { ensureObject, isNoObject } = require('../utils')

const propTypesTabs = {
  id: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  defaultActiveKey: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
}
const defaultPropsTabs = {
  defaultActiveKey: null,
  disabled: false,
  className: '',
  ariaLabel: null,
}

const propTypesTab = {
  id: PropTypes.string,
  title: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]),
}
const defaultPropsTab = {
  id: null,
  children: null,
}

function getErrorOnInvalidTab(item, prefix) {
  const { props } = ensureObject(item)
  if (isNoObject(props)) {
    return `${prefix} must be a <Tab/>`.trim()
  }

  const { id, title, children } = ensureObject(props)
  if (typeof title !== 'string' || title === '') {
    return `${prefix} must be a <Tab/> with a valid title`.trim()
  }
  if (id != null && (typeof id !== 'string' || id === '')) {
    return `${prefix} must be a <Tab/> with no ID / a valid ID`.trim()
  }
  if (
    children != null &&
    (typeof children !== 'object' || (Array.isArray(children) && children.some(child => typeof child !== 'object')))
  ) {
    return `${prefix} must be a <Tab/> with no child / valid children`.trim()
  }

  return null
}

function ensureTabsChildrenAreValid(children) {
  if (!Array.isArray(children) || children.length === 0) {
    throw new Error('<Tabs/> failed - no children given')
  }

  const errors = children
    .map((item, index) => getErrorOnInvalidTab(item, `child ${index + 1}`))
    .filter(message => message != null)

  if (errors.length > 0) {
    throw new Error('<Tabs/> failed - ' + errors.join(', '))
  }
}

/**
 * `<Tabs/>`
 *
 * @param {object} props
 * @param {string} props.id
 * @param {JSX.Element|JSX.Element[]} props.children
 * @param {string} [props.defaultActiveKey]
 * @param {boolean} [props.disabled]
 * @param {string} [props.className]
 * @param {string} [props.ariaLabel]
 */
function Tabs(props) {
  const { id, children, defaultActiveKey, disabled, className, ariaLabel } = props

  const _children = Array.isArray(children) ? children : [children]

  try {
    ensureTabsChildrenAreValid(_children)
  } catch ({ message }) {
    // eslint-disable-next-line no-console
    console.error(message)
    return null
  }

  const items = _children.map((tab, index) => {
    const { id: tabId, title, children: element } = ensureObject(tab, { path: 'props' })
    return { id: tabId || index, title, element }
  })

  const [currTabId, setCurrTabId] = useState(defaultActiveKey || items[0].id)
  const [currTabFocusId, setCurrTabFocusId] = useState(null)

  const onKeyDown = ({ key }) => {
    if (disabled) {
      return
    }
    if (key === 'ArrowLeft' || key === 'ArrowRight') {
      let newIndex = null
      for (let index = 0; index < items.length; index++) {
        if (currTabId === items[index].id) {
          if (key === 'ArrowLeft' && index > 0) {
            newIndex = index - 1
          }
          if (key === 'ArrowRight' && index + 1 < items.length) {
            newIndex = index + 1
          }
          break
        }
      }
      if (newIndex != null) {
        setCurrTabId(items[newIndex].id)
        setCurrTabFocusId(items[newIndex].id)
      }
    }
  }

  if (currTabFocusId != null) {
    const tabElement = document.getElementById(`${id}-${currTabFocusId}-tab`)
    if (tabElement != null) {
      tabElement.focus()
    }
    setCurrTabFocusId(null)
  }

  const prepareTabButton = item => (
    <li key={item.id} className="nav-item">
      <button
        id={`${id}-${item.id}-tab`}
        role="tab"
        aria-selected={currTabId === item.id}
        aria-controls={`${id}-${item.id}-panel`}
        tabIndex={currTabId === item.id ? 0 : -1}
        type="button"
        className={`${currTabId === item.id ? 'active' : ''} nav-link ${disabled ? 'disabled' : ''}`.trim()}
        onClick={() => setCurrTabId(item.id)}
        disabled={disabled}
      >
        {item.title}
      </button>
    </li>
  )

  const prepareTabPanel = item => (
    <div
      key={item.id}
      id={`${id}-${item.id}-panel`}
      role="tabpanel"
      aria-labelledby={`${id}-${item.id}-tab`}
      hidden={currTabId !== item.id}
      className={currTabId === item.id ? 'tab-pane fade show active' : 'tab-pane fade'}
    >
      {item.element}
    </div>
  )

  return (
    <div className={`Tabs ${className}`.trim()}>
      <div className="tab-bar-container row">
        <div className="col">
          <ul role="tablist" aria-label={ariaLabel} className="nav nav-tabs" onKeyDown={onKeyDown}>
            {items.map(prepareTabButton)}
          </ul>
        </div>
      </div>
      <div className="tab-content">{items.map(prepareTabPanel)}</div>
    </div>
  )
}

/**
 * `<Tab/>`
 * Abstract component which is used as direct child of `<Tabs/>`
 *
 * @param {object} props
 * @param {string} [props.id]
 * @param {string} props.title
 * @param {JSX.Element|JSX.Element[]} [props.children]
 * @returns {null}
 */
// eslint-disable-next-line no-unused-vars
function Tab(props) {
  throw new Error("Won't render abstract <Tab/>. It's only valid as a direct child of <Tabs/>.")
  // eslint-disable-next-line no-unreachable
  return null
}

Tabs.propTypes = propTypesTabs
Tabs.defaultProps = defaultPropsTabs

Tab.propTypes = propTypesTab
Tab.defaultProps = defaultPropsTab

Tabs.Tab = Tab

module.exports = Tabs
