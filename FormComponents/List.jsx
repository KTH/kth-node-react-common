// @ts-check

const React = require('react')

const { Fragment, useEffect, useState } = React

const PropTypes = require('prop-types')

const { observer } = require('mobx-react')
const { getStoreState, useStore } = require('../MobxUtils')

const { findInObject, isNoObject, isObject, setInObject } = require('../utils')

const { getCurrentInputData, setCurrentInputData } = require('./internals')
const { ClickableDiv } = require('../Helpers')

const propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  dataBag: PropTypes.object.isRequired,
  basePath: PropTypes.string.isRequired,
  controls: PropTypes.arrayOf(
    PropTypes.shape({
      subPath: PropTypes.string.isRequired,
      getElement: PropTypes.func.isRequired,
    })
  ).isRequired,
  itemKeyPath: PropTypes.string,
  rearrangeable: PropTypes.bool,
  extendable: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  createItem: PropTypes.func,
  removable: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  className: PropTypes.string,
}

const defaultProps = {
  itemKeyPath: '',
  rearrangeable: false,
  extendable: false,
  createItem: null,
  removable: false,
  className: '',
}

/**
 * @param {object} props
 * @throws
 */
function _ensureValidPropsOnce(props) {
  const [propsError, setPropsError] = useState(null)
  if (propsError != null) {
    if (propsError === false) {
      return
    }
    throw propsError
  }

  const { dataBag, basePath, controls, itemKeyPath, rearrangeable, extendable, createItem, removable } = props

  try {
    const canAccessData = isObject(dataBag) && typeof basePath === 'string'
    if (canAccessData === false) {
      throw new Error("can't access data")
    }

    if (Array.isArray(controls) === false) {
      throw new Error('no array "controls" given')
    }
    if (controls.some(controlItem => isNoObject(controlItem))) {
      throw new Error('non-objects in array "controls" given')
    }
    if (
      controls.some(
        controlItem =>
          typeof controlItem.subPath !== 'string' ||
          controlItem.subPath === '' ||
          typeof controlItem.getElement !== 'function'
      )
    ) {
      throw new Error('invalid object in array "controls" given')
    }
    if (itemKeyPath != null && (typeof itemKeyPath !== 'string' || itemKeyPath === '')) {
      throw new Error('invalid prop "itemKeyPath" given')
    }
    if (rearrangeable != null && typeof rearrangeable !== 'boolean') {
      throw new Error('invalid flag "rearrangeable" given')
    }
    if (extendable != null && typeof extendable !== 'boolean' && typeof extendable !== 'function') {
      throw new Error('invalid prop "extendable" given')
    }
    if (extendable != null && extendable !== false && typeof createItem !== 'function') {
      throw new Error('can\'t use "extendable" w/o valid "createItem()"')
    }
    if (removable != null && typeof removable !== 'boolean' && typeof removable !== 'function') {
      throw new Error('invalid props "removable" given')
    }
  } catch (error) {
    setPropsError(error)
    throw error
  }

  setPropsError(false)
}

/**
 * @param {object} inputBag
 * @param {object[]} inputBag.allItems
 * @param {number} inputBag.itemIndex
 * @param {object} inputBag.dataBag
 * @param {string} inputBag.basePath
 * @param {string} inputBag.subPath
 * @returns {(any) => void}
 */
function _prepareSetCurrValue({ allItems, itemIndex, dataBag, basePath, subPath }) {
  return newValue => {
    const updatedItems = [...allItems]
    setInObject({
      object: updatedItems,
      path: `${itemIndex}.${subPath}`,
      newValue,
      copySubObjectsOnPath: true,
    })
    setCurrentInputData({
      dataBag,
      dataPath: basePath,
      newValue: updatedItems,
    })
  }
}

/**
 * @param {object} inputBag
 * @param {object} inputBag.dataBag
 * @param {string} inputBag.basePath
 * @param {({ allItems }) => any} inputBag.createItem
 * @param {() => void} [inputBag.forceRefresh]
 */
function _appendItem({ dataBag, basePath, createItem, forceRefresh }) {
  const allItems = getCurrentInputData({ dataBag, dataPath: basePath })
  const newItem = createItem({ allItems })
  allItems.push(newItem)
  setCurrentInputData({ dataBag, dataPath: basePath, newValue: allItems })

  if (typeof forceRefresh === 'function') {
    forceRefresh()
  }
}

/**
 * @param {object} inputBag
 * @param {object} inputBag.dataBag
 * @param {string} inputBag.basePath
 * @param {number} inputBag.itemIndex
 * @param {number} inputBag.targetPos
 * @param {() => void} [inputBag.forceRefresh]
 */
function _moveItem({ dataBag, basePath, itemIndex, targetPos, forceRefresh }) {
  if (itemIndex !== targetPos) {
    const allItems = getCurrentInputData({ dataBag, dataPath: basePath })
    const item = allItems[itemIndex]
    allItems.splice(itemIndex, 1)
    allItems.splice(targetPos, 0, item)
    setCurrentInputData({ dataBag, dataPath: basePath, newValue: allItems })

    if (typeof forceRefresh === 'function') {
      forceRefresh()
    }
  }
}

/**
 * @param {object} inputBag
 * @param {object} inputBag.dataBag
 * @param {string} inputBag.basePath
 * @param {number} inputBag.itemIndex
 * @param {() => void} [inputBag.forceRefresh]
 */
function _removeItem({ dataBag, basePath, itemIndex, forceRefresh }) {
  if (typeof itemIndex === 'number' && itemIndex >= 0) {
    const allItems = getCurrentInputData({ dataBag, dataPath: basePath })
    allItems.splice(itemIndex, 1)
    setCurrentInputData({ dataBag, dataPath: basePath, newValue: allItems })

    if (typeof forceRefresh === 'function') {
      forceRefresh()
    }
  }
}

/**
 * @param {object} inputBag
 * @param {object} inputBag.item
 * @param {string} [inputBag.itemKeyPath]
 */
function _getItemKey({ item, itemKeyPath }) {
  if (typeof itemKeyPath === 'string' && itemKeyPath !== '') {
    const key = findInObject({ object: item, path: itemKeyPath })
    return typeof key === 'string' && key !== '' ? key : null
  }
  return null
}

/**
 * @param {object} inputBag
 * @param {boolean} [inputBag.rearrangeable]
 * @param {object[]} inputBag.allItems
 * @param {number} inputBag.itemIndex
 * @param {object} inputBag.rearrangeState
 * @param {(object) => void} inputBag.setRearrangeState
 * @param {string} inputBag.iconDirectory
 * @returns {JSX.Element|null}
 */
function _getRearrangeControl({
  rearrangeable,
  allItems,
  itemIndex,
  rearrangeState,
  setRearrangeState,
  iconDirectory,
}) {
  if (rearrangeable == null || rearrangeable === false) {
    return null
  }
  if (allItems.length < 2) {
    return <div className="List-item-norearrange" />
  }

  const { mode, itemIndex: rearrangeIndex } = rearrangeState

  if (mode === 'active' && itemIndex !== rearrangeIndex) {
    return <div className="List-item-rearrange-target" />
  }

  let _onMouseDown = null
  if (mode === 'inactive') {
    _onMouseDown = event => {
      event.preventDefault()
      setRearrangeState({
        mode: 'active',
        itemIndex,
        currTargetPos: itemIndex,
      })
    }
  }

  return (
    <div role="button" tabIndex={0} className="List-item-rearrange" onMouseDown={_onMouseDown}>
      <img src={`${iconDirectory}arrow-up-down-white.svg`} alt="Ändra position" />
    </div>
  )
}

/**
 * @param {object} inputBag
 * @param {boolean|((object) => boolean)} [inputBag.removable]
 * @param {object[]} inputBag.allItems
 * @param {number} inputBag.itemIndex
 * @param {object} inputBag.dataBag
 * @param {string} inputBag.basePath
 * @param {() => void} [inputBag.forceRefresh]
 * @param {string} inputBag.iconDirectory
 * @returns {JSX.Element|null}
 */
function _getRemoveControl({ removable, allItems, itemIndex, dataBag, basePath, forceRefresh, iconDirectory }) {
  if (removable == null || removable === false) {
    return null
  }

  const isItemRemovable =
    typeof removable === 'function'
      ? removable({ allItems, item: allItems[itemIndex], index: itemIndex })
      : removable === true
  if (isItemRemovable) {
    const remove = () => _removeItem({ dataBag, basePath, itemIndex, forceRefresh })
    return (
      <ClickableDiv className="List-item-remove" onClick={remove}>
        <img src={`${iconDirectory}trash-can-white.svg`} alt="Ta bort" />
      </ClickableDiv>
    )
  }

  return typeof removable === 'function' ? <div className="List-item-noremove" /> : null
}

/**
 * @param {object} inputBag
 * @param {object[]} inputBag.elementList
 * @param {number} inputBag.pos
 * @param {object} inputBag.rearrangeState
 * @returns {JSX.Element|null}
 */
function _getListItemAtPosition({ elementList, pos, rearrangeState }) {
  const { mode, itemIndex, currTargetPos } = rearrangeState
  if (mode === 'inactive' || currTargetPos == null || itemIndex === currTargetPos) {
    return elementList[pos]
  }

  if (itemIndex < currTargetPos) {
    // e.g. itemIndex === 3 && currTargetPos === 6
    if (pos < itemIndex || pos > currTargetPos) {
      return elementList[pos]
    }
    if (pos >= itemIndex && pos < currTargetPos) {
      return elementList[pos + 1]
    }
    if (pos === currTargetPos) {
      return elementList[itemIndex]
    }
  }

  if (itemIndex > currTargetPos) {
    // e.g. itemIndex === 6 && currTargetPos === 3
    if (pos < currTargetPos || pos > itemIndex) {
      return elementList[pos]
    }
    if (pos === currTargetPos) {
      return elementList[itemIndex]
    }
    if (pos > currTargetPos && pos <= itemIndex) {
      return elementList[pos - 1]
    }
  }
  return null
}

/**
 * `<List />`
 *
 * @param {object} props
 * @param {object} props.dataBag
 * @param {string} props.basePath
 * @param {object[]} props.controls list of items with shape {
 *      subPath: string,
 *      getElement: ({ controlId, allValues, currValue, setCurrValue, index }) => JSX.Element,
 *    }
 * @param {string} [props.itemKeyPath] e.g. "_id"
 * @param {boolean} [props.rearrangeable]
 * @param {boolean|(({ allItems }) => boolean)} [props.extendable]
 * @param {({ allItems }) => object} [props.createItem]
 * @param {boolean|(({ allItems, item, index }) => boolean)} [props.removable]
 * @param {string} [props.className]
 */
function List(props) {
  const {
    dataBag,
    basePath,
    controls,
    itemKeyPath,
    rearrangeable,
    extendable,
    createItem,
    removable,
    className,
  } = props

  try {
    _ensureValidPropsOnce(props)
  } catch ({ message }) {
    // eslint-disable-next-line no-console
    console.error(`<List basePath="${basePath}"/> failed - ${message}`)
    return null
  }

  const { addProxy } = getStoreState('default') === 'active' ? useStore('default') : { addProxy: null }

  const [rearrangeState, setRearrangeState] = useState({
    mode: 'inactive',
    itemIndex: null,
    currTargetPos: null,
  })

  const [n, setN] = useState(0)
  const forceRefresh = () => setN(n + 1)

  useEffect(() => {
    const _onMouseUp = event => {
      event.preventDefault()
      const { mode, itemIndex, currTargetPos } = rearrangeState
      if (mode === 'active') {
        if (itemIndex !== currTargetPos) {
          _moveItem({ dataBag, basePath, itemIndex, targetPos: currTargetPos })
        }
        setRearrangeState({
          mode: 'inactive',
          itemIndex: null,
          currTargetPos: null,
        })
      }
    }
    window.addEventListener('mouseup', _onMouseUp)
    const _cleanup = () => window.removeEventListener('mouseup', _onMouseUp)
    return _cleanup
  })

  const allItems = getCurrentInputData({ dataBag, dataPath: basePath })
  if (Array.isArray(allItems) === false || allItems.some(isNoObject)) {
    // eslint-disable-next-line no-console
    console.error(`<List basePath="${basePath}" /> failed - missing or invalid items`)
    return null
  }

  const allSubPathsAndValues = {}
  controls.forEach(controlSetup => {
    const { subPath } = controlSetup
    allSubPathsAndValues[subPath] = allItems.map(object => findInObject({ object, path: subPath }))
  })

  const iconDirectory =
    typeof addProxy === 'function'
      ? addProxy('/static/kth-style/img/kth-style/icons/')
      : '/static/kth-style/img/kth-style/icons/'

  const _prepareItemRow = (item, itemIndex) => {
    const listItemId = _getItemKey({ item, itemKeyPath }) || itemIndex
    const itemControlElements = controls.map((controlSetup, controlIndex) => {
      const { subPath, getElement } = controlSetup
      const controlId = `${listItemId}-${controlIndex}`
      const controlElement = getElement({
        allValues: allSubPathsAndValues[subPath],
        currValue: allSubPathsAndValues[subPath][itemIndex],
        setCurrValue: _prepareSetCurrValue({
          allItems,
          itemIndex,
          dataBag,
          basePath,
          subPath,
        }),
        index: itemIndex,
        controlId,
      })
      return <Fragment key={controlId}>{controlElement}</Fragment>
    })
    return (
      <div key={listItemId} className="List-item">
        {_getRearrangeControl({
          rearrangeable,
          allItems,
          itemIndex,
          rearrangeState,
          setRearrangeState,
          iconDirectory,
        })}
        <div className="List-item-controls form-row">{itemControlElements}</div>
        {_getRemoveControl({
          removable,
          allItems,
          itemIndex,
          dataBag,
          basePath,
          forceRefresh,
          iconDirectory,
        })}
      </div>
    )
  }

  const _setCurrTargetPos = newPos => {
    if (rearrangeState.mode === 'active' && rearrangeState.currTargetPos !== newPos) {
      setRearrangeState({ ...rearrangeState, currTargetPos: newPos })
    }
  }

  const reorderedElements = []
  for (let pos = 0; pos < allItems.length; pos++) {
    reorderedElements.push(
      <div key={pos} className="List-mouse-follower" onMouseEnter={() => _setCurrTargetPos(pos)}>
        {_getListItemAtPosition({
          elementList: allItems.map(_prepareItemRow),
          rearrangeState,
          pos,
        })}
      </div>
    )
  }

  const isListExtendable = typeof extendable === 'function' ? extendable({ allItems }) : extendable === true
  const extendRow = isListExtendable ? (
    <div className="List-extend">
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => _appendItem({ dataBag, basePath, createItem, forceRefresh })}
      >
        <span className="List-extend-icon">+</span>
        Lägg till
      </button>
    </div>
  ) : null

  return (
    <div className={`List ${className}`.trim()} onMouseLeave={() => _setCurrTargetPos(null)}>
      {reorderedElements}
      {extendRow}
    </div>
  )
}

const ComponentExport = observer(List)

List.propTypes = propTypes
List.defaultProps = defaultProps
ComponentExport.propTypes = propTypes
ComponentExport.defaultProps = defaultProps

module.exports = ComponentExport
